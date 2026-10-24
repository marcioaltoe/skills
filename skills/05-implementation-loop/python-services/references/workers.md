# Worker execution and recovery

Choose the least operational machinery that satisfies the recovery requirement. A scheduled process with checkpoints can be sufficient; queues and workflow platforms are optional infrastructure decisions.

## Define the job contract

Before implementation, record the input schema/version, stable job identity, input and rule versions, owner, terminal states, cancellation behavior, and externally visible side effects. State whether repeated input means the same job or a new operation. Keep secrets and large file contents out of queue messages; pass controlled references instead.

Assume at-least-once delivery unless the actual transport proves otherwise. Deduplicate by stable business identity, not by a random identifier generated on each attempt.

## Commit effects and progress together

- Claim work atomically in the owning store, using its transaction or conditional-write support. A read of `pending` followed by an unconditional update is not a claim.
- If a lease may expire, carry an ownership token or generation through result publication and completion. Reject writes from stale owners after another worker takes over.
- Commit state changes and their checkpoint together where they share a database. A crash between them must not make an already-applied effect look unprocessed.
- When database persistence and enqueueing are separate systems, use a transactional outbox or a documented reconciliation mechanism. Test failure after the database commit and before publication.
- For an external effect, use the provider's idempotency key or reconcile its recorded outcome before retrying. A local `done` flag cannot prove a remote effect happened exactly once.
- Publish files atomically on the same filesystem where supported, and checkpoint only a complete, validated artifact. See `python-file-pipelines` for output comparison and replacement rules.

## Bound retries and resources

Retry classified transient failures with a maximum attempt count or deadline, bounded backoff and jitter. Respect provider retry instructions. Validation, authorization, corrupt input, and permanent business failures need a terminal result, not automatic repetition.

Limit outstanding jobs, request concurrency, open files, and memory. Keep persistence connections scoped to the worker/thread/process that owns them. Do not make concurrent processes share a mutable SQLite cache merely to speed up tests.

## Shut down without losing ownership

On shutdown, stop claiming new work and give active work the declared completion window. Close resources in `finally` or context managers. Preserve cancellation propagation after cleanup, and let the supervisor or queue redeliver work that never committed completion. Never mark an interrupted job successful to drain a queue.

On retry exhaustion, record a terminal failure with a useful error category and route it to the system's failed-job or dead-letter mechanism. Make replay an explicit operation that preserves job history and idempotency. A dead-letter log followed by a success return may acknowledge and lose the failed job.

## Test failure windows

Inject failure before claim, after claim, after a durable effect but before acknowledgement, and after lease takeover. Verify that duplicate delivery cannot repeat a committed effect, stale owners cannot publish, and cancellation leaves work recoverable. Assert these properties against the real owning persistence interface using temporary/local fixtures; mocks alone do not establish atomicity.
