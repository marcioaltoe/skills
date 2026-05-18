# [Backend Area] API Contracts

| Field           | Value                                                     |
| --------------- | --------------------------------------------------------- |
| Audience        | Backend and client developers                             |
| Scope           | [Route group, service, bounded context, or API surface]   |
| Last reviewed   | YYYY-MM-DD                                                |
| Contract source | [Zod schemas, OpenAPI, route files, generated docs, etc.] |

## Summary

[Describe what this API surface enables and which clients or systems consume it.]

## API Standards

| Standard       | Current behavior                             | Evidence      |
| -------------- | -------------------------------------------- | ------------- |
| Route style    | [REST / POST action / RPC / GraphQL / other] | `path`        |
| Validation     | [Schema source]                              | `path`        |
| Auth           | [Auth requirement]                           | `path`        |
| Error envelope | [Observed error shape]                       | `path`        |
| Generated docs | [OpenAPI/Scalar/other]                       | `path or URL` |

## Endpoint Inventory

| Method | Path           | Purpose   | Auth          | Request schema | Success response    | Errors  | Evidence             |
| ------ | -------------- | --------- | ------------- | -------------- | ------------------- | ------- | -------------------- |
| POST   | `/path/action` | [Purpose] | [Requirement] | [Schema]       | [Status and schema] | [Codes] | `path/to/route.ts:1` |

## Endpoint Details

### [METHOD] [Path]

- **Purpose**: [Purpose]
- **Owner**: [Module or team]
- **Auth/Tenancy**: [Requirement]
- **Validation source**: `path`

#### Request

```json
{
  "field": "example"
}
```

#### Success Response

```json
{
  "data": {},
  "message": "Success"
}
```

#### Error Responses

| Status | Code   | Meaning   | Evidence |
| ------ | ------ | --------- | -------- |
| 400    | [CODE] | [Meaning] | `path`   |

#### Side Effects

| Side effect                                          | Evidence |
| ---------------------------------------------------- | -------- |
| [Database write, event, job, webhook, external call] | `path`   |

## Contract Gaps

| Gap   | Evidence | Impact   | Recommendation |
| ----- | -------- | -------- | -------------- |
| [Gap] | `path`   | [Impact] | [Action]       |

## Maintenance

Update this document when routes, request/response schemas, auth requirements, generated OpenAPI setup, error mapping, or client-facing behavior changes.
