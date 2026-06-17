---
name: aws-s3
description: Use when writing, modifying, or reviewing TypeScript code that uses Amazon S3 through @aws-sdk/client-s3. Covers S3Client reuse, commands, object streams, presigned URLs, metadata, error handling, testing seams, and common pitfalls. Do not use for generic bucket administration or Terraform-only S3 work.
metadata:
  version: 0.1.0
  tags: [aws, s3, storage, typescript]
---

# AWS S3

Use this skill for application code that integrates with Amazon S3 through the AWS SDK for JavaScript v3.

Official sources:

- AWS SDK for JavaScript v3 repository: https://github.com/aws/aws-sdk-js-v3
- S3 client package: https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-s3
- AWS SDK for JavaScript v3 developer guide: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/

## Core Rules

- Reuse one `S3Client` per runtime context instead of constructing clients per operation.
- Read region and credentials from the runtime environment or injected config; do not hardcode secrets.
- Keep S3 behind a small application port when business logic depends on object storage.
- Validate caller input before building `Bucket` and `Key`.
- Treat S3 object bodies as streams; consume, pipe, or discard them exactly once.
- Normalize AWS errors at the adapter boundary so application code does not depend on SDK exception details.
- Avoid public buckets by default. Prefer presigned URLs or private object access.

## Client Setup

```ts
import { S3Client } from "@aws-sdk/client-s3";

export function createS3Client(region: string) {
  return new S3Client({ region });
}
```

For dependency injection, pass the client into a repository or adapter:

```ts
export class S3ObjectStore {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
  ) {}
}
```

## Common Commands

```ts
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
```

Write objects:

```ts
await client.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  }),
);
```

Read objects:

```ts
const output = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
const bytes = await output.Body?.transformToByteArray();
```

Check existence:

```ts
await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
```

Delete objects:

```ts
await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
```

## Streams

S3 `GetObjectCommand` returns a runtime-specific stream. Decide one action:

- Buffer it for small objects.
- Pipe it to another destination for large objects.
- Discard or close it if the operation only needed metadata.

Do not read the same stream twice.

## Presigned URLs

Use presigned URLs for temporary client-side upload or download access. Keep expiration short, validate the object key server-side, and log the logical operation without logging the full URL.

## Error Handling

```ts
try {
  await client.send(command);
} catch (error) {
  if (error instanceof S3ServiceException) {
    throw new ObjectStoreError(error.name, {
      statusCode: error.$metadata.httpStatusCode,
      requestId: error.$metadata.requestId,
    });
  }
  throw error;
}
```

Preserve metadata useful for operations, but do not leak credentials, URLs with signatures, or raw payloads in user-facing errors.

## Testing Guidance

- Test application logic through a fake object-store port when S3 itself is not the behavior under test.
- Test the S3 adapter with a narrow mocked `S3Client.send` seam or an integration environment.
- Cover missing object, access denied, invalid key, and stream failure paths.
- Keep fixture objects small unless testing streaming behavior.

## Common Mistakes

- Creating a new `S3Client` inside every method.
- Passing user-provided keys directly to S3 without normalization.
- Treating object storage as transactional database storage.
- Logging presigned URLs or sensitive object metadata.
- Loading large objects fully into memory when a stream would work.
