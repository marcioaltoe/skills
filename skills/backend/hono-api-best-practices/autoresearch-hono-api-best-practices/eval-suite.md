# Eval Suite — hono-api-best-practices (SHARPENED v2)

Max score = 5 evals × 5 runs (test inputs) = **25**.

v1 (structural presence checks) scored a perfect 25/25 baseline — no headroom. v2 replaces them with harder *correctness and consistency* bars: each eval demands the design be internally consistent with the skill's own rules, not merely that the right keywords appear.

Each run is scored on all 5 evals, binary pass/fail. For design inputs the eval grades the generated design/code. For the audit input (R5) the eval grades whether the report correctly assesses the corresponding concern (catching real violations, not inventing false ones).

---

## Test inputs (one run each) — unchanged from v1

- **R1 — REST greenfield.** `payouts` context: create, get-by-id, list with settlement-date filtering, cancel. Standard REST.
- **R2 — POST-only greenfield.** `webhooks` context: create, list, get, delete, rotate signing secret. POST-only action-based.
- **R3 — Contract shaping (money/dates).** `transactions` list endpoint: amount, currency, direction, settlement date, date-range filtering. REST.
- **R4 — Async + idempotency.** REST endpoint that kicks off a long-running export and polls status; idempotent creation.
- **R5 — Audit.** Deliberately non-compliant route (raw `app.post`, inlined schemas, only `200`, nested+inline error JSON).

---

## Evals (v2 — sharpened)

### SE1: Style-correct success response shapes, no internal contradiction
Question: Do all success responses obey the run's style with zero contradiction?
- REST pass: single resources returned **unwrapped**; creation returns **201** (not 200); collections use the structured paginated shape (`{ items, nextCursor/…, hasMore }`); `204` used only when there is genuinely no body.
- POST-only pass: **every** success is exactly `{ data, message }` with the resource/collection inside `data` — **including delete/no-body actions** (e.g. `{ data: { id }, message }` or `{ data: null, message }`); no bare `204`, no top-level resource, no extra top-level keys.
Fail: REST creation returns 200; a single REST resource is wrapped in `{ data, message }`; a POST-only success returns a bare `204`/top-level resource (breaks the "always envelope" rule); ad-hoc collection shape.
Audit (R5): Pass if the report correctly flags the success-shape/status defects (200-instead-of-201, unvalidated/ad-hoc body).

### SE2: Domain operations modeled correctly (no RPC leakage)
Question: Is every operation modeled per its style's resource/action rules?
- REST pass: state-changing/domain operations are resources or state transitions (`DELETE`, sub-resource, or a created resource) — **never** `POST /x/{id}/<verb>` RPC paths or `/list`,`/get` action paths.
- POST-only pass: each operation is a discrete `POST /<context>/<entity>/<action>` path; no `action`-flag overloading on one endpoint; no non-POST verb.
Fail: any RPC action path in REST; verb/flag-overloaded dispatch or a non-POST verb in POST-only.
Audit (R5): Pass if the report correctly assesses modeling without inventing a nonexistent RPC violation.

### SE3: Idempotency applied correctly AND explicitly
Question: Is idempotency handled correctly for every operation?
Pass: each unsafe op (create / state-change) carries the idempotency mechanism (REST `Idempotency-Key` header; POST-only `idempotencyKey` body field) **and** declares `409` for same-key-different-payload; each read **explicitly** marks idempotency N/A rather than silently omitting it.
Fail: an unsafe op lacks the key or the `409` reuse rule; a read omits any idempotency note.
Audit (R5): Pass if the report flags the missing idempotency on the create route.

### SE4: Authorization model correct (403 vs 404; scope never in input)
Question: Is the authorization model exactly right?
Pass: endpoints targeting a specific resource declare **both** `403` (exists-but-forbidden) and `404` (out-of-scope) where applicable; collection/filter endpoints map out-of-boundary filters to `403`; **no** scope identifier (`workspaceId`/`organizationId`/tenant id) is accepted in request input — it comes from the credential.
Fail: conflates or omits 403/404 where applicable; accepts a scope identifier in body/query.
Audit (R5): Pass if the report flags the missing `security`/authorization handling.

### SE5: Response runtime-validated against the contract
Question: Is every success body validated against its response schema at runtime?
Pass: every success path returns through the shared `respond()` helper (or equivalent that parses the payload against the declared response schema at runtime); no raw `context.json(...)` for success.
Fail: any success returned via raw `context.json` without runtime response validation.
Audit (R5): Pass if the report flags that raw `c.json(...)` success bypasses response-schema validation and prescribes `respond()`.

---

## Scoring procedure

For each experiment:
1. Run the affected test inputs (a mutation confined to one style's reference file only changes that style's runs; carry forward unaffected runs).
2. Read each output; mark each of the 5 evals pass(1)/fail(0).
3. Score = sum across 5 inputs × 5 evals (0–25). pass_rate = score / 25.
4. Keep mutation if score strictly improves over current best; else revert.
