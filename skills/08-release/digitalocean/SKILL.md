---
name: digitalocean
description: Provision and operate DigitalOcean infrastructure with Terraform and doctl — Droplets, VPCs, cloud firewalls, managed PostgreSQL/Valkey, Spaces, Container Registry, load balancers, reserved IPs, and DNS. Use when the user mentions DigitalOcean, doctl, droplets, DOCR, Spaces, DO managed databases, or Terraform state stored on Spaces.
metadata:
  category: devops
  tags: [digitalocean, doctl, terraform, droplet, spaces, docr, managed-database, infrastructure]
  version: 0.1.0
  author: Marcio Altoé
  source: https://github.com/marcioaltoe/skills
---

# DigitalOcean

Provision DigitalOcean with Terraform; inspect it with `doctl`. The API is small and predictable, which makes the gaps the expensive part: Spaces-backed state has no locking, `doctl` does not manage buckets, and a firewall written against an IP breaks the day the IP moves.

Pair this with `senior-devops` for apply discipline, and with `terraform-style-guide` for HCL conventions.

## When to use

- Writing or reviewing Terraform for DigitalOcean resources.
- Storing Terraform state in Spaces.
- Taking inventory of an account, or reconciling code against what the account actually holds.
- Operating Droplets, managed databases, DOCR, or Spaces day to day.

## Ground rules

- **Private network by default.** Put every Droplet and managed database in a VPC and connect over private hostnames; the public database URI is a fallback, not the design.
- **Reference resources by ID, not address.** Firewall rules take `source_droplet_ids`; database firewalls take `type = "droplet"`. A `/32` breaks the day a Droplet is rebuilt.
- **Attach everything to a DO Project** (`digitalocean_project_resources`), or it disappears from the account view your teammates use.
- **Region is a hard boundary.** VPCs, Droplets, databases, and Spaces buckets must share the region you standardized on; a cross-region private connection does not exist.

## Terraform provider and state

```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.40"
    }
  }

  backend "s3" {} # configured per stage with -backend-config=backend.hcl
}

provider "digitalocean" {
  token = var.do_token # or leave unset and export DIGITALOCEAN_TOKEN
}
```

State on Spaces uses the S3 backend with the AWS-specific checks turned off. Spaces access keys are read as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`:

```hcl
# backend.hcl — untracked, one per stage, unique key per stage
bucket = "example-tfstate"
key    = "prod/00-core/terraform.tfstate"
region = "us-east-1" # required by the backend, ignored by Spaces

endpoints = { s3 = "https://nyc3.digitaloceanspaces.com" }

skip_credentials_validation = true
skip_metadata_api_check     = true
skip_requesting_account_id  = true
skip_region_validation      = true
encrypt                     = true
```

`endpoints = { s3 = ... }` replaces the deprecated top-level `endpoint`. If the backend rejects requests over checksums, add `skip_s3_checksum = true`.

**Spaces gives you no state locking.** DynamoDB does not exist here, and `use_lockfile` depends on conditional-write support you must verify before trusting it. Until then, serialization is a human protocol: one apply at a time, per stage.

## Resource patterns

```hcl
# Firewall by Droplet ID — survives address changes
resource "digitalocean_firewall" "edge" {
  name        = "edge"
  droplet_ids = [digitalocean_droplet.edge.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "5432"
    source_droplet_ids = [digitalocean_droplet.apps.id]
  }
}

# Managed database reachable only from known resources
resource "digitalocean_database_firewall" "postgres" {
  cluster_id = digitalocean_database_cluster.postgres.id

  rule {
    type  = "droplet"
    value = digitalocean_droplet.apps.id
  }
}
```

- **Droplets**: pin `image` and `size` by slug, keep them in `vpc_uuid`, and treat `user_data` as first-boot only — editing it never touches a running Droplet. Resizes happen out of band (`doctl compute droplet-action resize <id> --size <slug> --resize-disk`), so `ignore_changes = [size]` matches reality.
- **Managed databases** (`digitalocean_database_cluster` with `engine = "pg"` / `"valkey"` / `"redis"`): add `digitalocean_database_db` and `digitalocean_database_user` per application, and read connection details from the cluster's `private_host` / `private_uri` attributes.
- **Reserved IPs** (`digitalocean_reserved_ip`) decouple DNS from a Droplet's lifecycle — required if you ever want to rebuild a host without editing DNS.
- **Load balancers** terminate TLS with `digitalocean_certificate`; forwarding rules reference the certificate by ID.
- **Spaces buckets** (`digitalocean_spaces_bucket`) support versioning, lifecycle rules, CORS, and `digitalocean_spaces_bucket_policy`. Buckets holding state or backups get versioning on.
- **DOCR**: one `digitalocean_container_registry` per account tier; `digitalocean_container_registry_docker_credentials` issues the CI pull/push secret with an expiry — rotate before it lapses.

## doctl: read-only inventory first

Before planning against an account you did not build, look at it:

```bash
doctl auth init --context prod          # then: doctl auth switch --context prod
doctl account get
doctl compute droplet list --format ID,Name,PublicIPv4,PrivateIPv4,Region,Status
doctl compute firewall list
doctl compute reserved-ip list
doctl databases list
doctl databases firewalls list <cluster-id>
doctl projects list && doctl projects resources list <project-id>
doctl compute domain records list <domain>
doctl registry get && doctl registry repository list-v2
```

Every command above is read-only and safe to run while planning. Mutating equivalents (`create`, `delete`, `droplet-action`) belong in Terraform unless the operation is deliberately out of band.

## Spaces: two tools, one boundary

`doctl` manages **access keys only** (`doctl spaces keys list|create|delete` on recent versions). Buckets and objects need an S3-compatible client pointed at the regional endpoint:

```bash
aws s3 ls s3://example-uploads --endpoint-url https://nyc3.digitaloceanspaces.com
aws s3 cp ./file s3://example-uploads/file --endpoint-url https://nyc3.digitaloceanspaces.com
```

CDN, CORS, lifecycle, and bucket policies belong in Terraform, not in ad-hoc CLI calls that nothing reconciles.

## Registry hygiene

DOCR bills for stored bytes, and untagged layers accumulate on every CI push. Run garbage collection on a schedule — `doctl registry garbage-collection start` — and deploy by digest so collection never removes the image a host still needs.

## Gotchas

- The provider token needs **write** scope for applies; a read-only token fails mid-apply, after some resources already changed.
- Deleting a VPC requires every member resource to be gone first; a forgotten Droplet blocks the destroy.
- Managed database maintenance windows apply themselves — schedule them, or DigitalOcean picks the hour for you.
- Firewalls are additive per Droplet: an orphan firewall from a deleted stage keeps allowing traffic until someone removes it.
- Snapshots are not backups of managed databases; the database's own backup retention is the recovery path.

## References

- Provider docs: <https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs>
- `doctl` reference: <https://docs.digitalocean.com/reference/doctl/>
