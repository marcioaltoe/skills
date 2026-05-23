# Autoresearch Changelog — hono-api-best-practices

Target: `skills/backend/hono-api-best-practices/SKILL.md` (+ references)
Eval suite: 5 binary evals × 5 test inputs = max score 25.
Config: 5 runs/experiment, 12-cycle budget cap.

---

## Experiment 0 — baseline

**Score:** 25/25 (100%)
**Change:** None — ran the skill as-is across all 5 test inputs.
**Reasoning:** Establish the starting point before any mutation.
**Result:** Every run passed all 5 evals. R1 (REST payouts), R2 (POST-only webhooks), R3 (REST transactions), R4 (REST async export) all produced fully compliant designs; R5 (audit) correctly flagged all four injected violations and assessed style correctly.
**Failing outputs:** None against the current eval suite.
**Observation:** The skill was already hardened via a prior autoresearch pass (see git history). A 100% baseline means the current 5 structural evals have no headroom — they cannot discriminate further mutations. Per the methodology, paused to confirm with the user. Either (a) the skill genuinely passes these checks and needs no optimization, or (b) the evals are too structural/lenient and should be sharpened to target subtler quality dimensions where the skill can actually fail.

**Decision:** User chose to sharpen the evals. Replaced the 5 structural presence-checks with 5 correctness/consistency bars (SE1–SE5, see eval-suite.md v2). Re-baselined by re-scoring the existing experiment-0 outputs against the new evals (skill text unchanged, so outputs are valid).

---

## Experiment 0 (v2) — re-baseline with sharpened evals

**Score:** 24/25 (96%)
**Change:** Eval suite swapped from v1 (structural) to v2 (correctness/consistency). No skill change.
**Reasoning:** v1 had no headroom; v2 targets subtler failure modes.
**Result:** R1, R3, R4, R5 = 5/5. R2 = 4/5 — fails **SE1**.
**Failing output:** R2 (POST-only webhooks) returned `204 No Content` for the delete action. The POST-only style doc states success is "ALWAYS this exact shape" `{ data, message }` ("Never add new top-level keys", "no variants, no top-level resource"), yet the shared Status Codes table lists `204` for delete. The skill contradicts itself for no-body operations in POST-only, so a faithful reader can legitimately produce a non-enveloped `204`. **Target for experiment 1: resolve the contradiction in style-post-only.md.**

---

## Experiment 1 — KEEP

**Score:** 25/25 (100%) — up from 24/25.
**Change:** Added a success rule to `style-post-only.md` §Response Shape: no-body operations (delete/revoke/disconnect/cancel) stay enveloped, returning `200` with `{ data: { id }, message }` (or `{ data: null, message }`), and explicitly stating the `204` row in SKILL.md §Status Codes is REST-only and would break the "every success is `{ data, message }`" guarantee.
**Reasoning:** The 24/25 gap was a genuine self-contradiction in the skill, not a model error — the reader had license to emit a bare `204`. Removing the ambiguity should make the POST-only output consistently enveloped.
**Result:** Re-ran R2. Delete now defines `DeleteWebhookResponseSchema = { data: { id }, message }`, declares `200` (not `204`), and the controller returns it through `respond()`. R2 SE1 flipped fail→pass; R2 = 5/5. R1/R3/R4/R5 unchanged (edit confined to `style-post-only.md`, which only POST-only runs read — no regression possible). Total 25/25.
**Failing outputs:** None. Sharpened suite (SE1–SE5) now maxed at 25/25.

---

## Run summary

- **Baseline (v1 structural evals):** 25/25 — no headroom; skill was already hardened.
- **Re-baseline (v2 sharpened evals):** 24/25 — exposed one real gap (POST-only no-body contradiction).
- **Experiment 1:** 25/25 — fixed the gap. KEPT.
- **Cycles run:** 1 mutation (of 12 budget). Stopped early: sharpened suite reached its ceiling after the single fixable gap was closed. Further mutations against a maxed suite can only tie (discard) or regress.
- **Files changed:** `references/style-post-only.md` (one added rule). SKILL.md and other references unchanged.
- **Keep rate:** 1/1.
