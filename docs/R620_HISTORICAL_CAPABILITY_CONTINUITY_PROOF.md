# R620 — Historical capability continuity proof gate

OMEGA's unit of progress is **recovered and executable capability**, not a workflow run, archive count, route count, or release number.

`auditCapabilityContinuityR620` compares historical and current capability graphs, separating:
- a missing capability (identity absent in the candidate);
- executor regression (old executor runnable, new executor not runnable), including unknown executor states;
- direct-executor downgrade to adapter-only operation;
- interface regression (previous route exposed, new presentation missing);
- source-binding or truth-class substitution requiring separate lineage/evidence review;
- proof-reference deficit for **every candidate capability**, including newly introduced identities (a complete previous-only subset is insufficient);
- caller-declared supersession/deprecation references (replacement, disposition and approver fields are recorded, **not** authenticated).

The input `proofs` mapping must come from *independent real production observations*. Its structure is a **receipt reference**, not a self-validating attestation: callers must authenticate, retrieve, and verify the cited observation separately. The audit intentionally returns `productionProven: false` for **every** caller-supplied proof map, even when the references match. `proofReferencesComplete` only reports syntactic binding completeness. The separate production release authority must independently authenticate and read back the exact promoted SHA, deployed runtime behavior, and rollback eligibility before asserting live proof. No caller-created receipt can promote this audit to production truth.

Import: `import {auditCapabilityContinuityR620} from './src/capabilityContinuityAuditR620.mjs'`.

Run unit regressions: `node --test tests/capability-continuity-r620.mjs tests/canonical-family-recovery-r620.mjs`. To inspect all 12 canonical R650 families and their unresolved source/proof gaps, run `node scripts/canonical-family-recovery-r620.mjs`. This reports repository ledger claims and does not fetch historical donors. The primary CI verify job now executes these tests; merely adding a test file is not an acceptance gate.

Evidence hierarchy: repository source != executable behavior != green CI != merged revision != deployed artifact != live runtime proof != complete historical capability conservation.

**Scope:** This release supplies the executable conservation audit; it does not itself reconstruct external atlas artifacts, wire OMEGA 7 interfaces, or verify live Cloudflare R2 storage. Those must enter as separately evidenced implementation candidates. Dimensional addresses 12, 144, 1,728 and 20,736 are representation and routing hierarchies without automatic physical-dimensional claims. Heightened Mode, recursive transmissible carry, multi-parent boundary exchange, contradiction/scars, and observer-relative topology remain substantive capability lineages to independently recover and test.

The new module does not change CanonState admission, release workflow, secrets, production bindings, or authoritative runtime state.

Changes to source binding or truth class are conservatively flagged for review rather than automatically accepted as equivalent. These are evidence-boundary changes, not necessarily proof of a functional regression. `structurePass` is a structural admission check only, not a production pass. Historical dispositions contain caller-declared evidence identifiers and approvers; their presence is not independent authentication.

Malformed historical or candidate nodes (missing implementation ID, source binding, evidence class, recognized executor state, or presentation/executor fields) fail structural admission. Synthetic receipt references cannot compensate for an incomplete node.

## Fail-closed conservation admission

A missing historical capability always sets `structurePass: false`, even if a caller provides a syntactically complete `SUPERSEDED`, `INTENTIONALLY_DEPRECATED`, `PLATFORM_SPECIFIC`, or `QUARANTINED` disposition. The audit records such claims in `declaredResolutions` but has **no trusted governance resolver** that could independently authenticate them. Do not treat this structural refusal as a verdict that every removal is illegitimate; a separately governed, independently verified disposition is required before conservation admission. A presentation surface marked `generatedFromCapability: true` must have a nonblank route; an empty/whitespace-only route is invalid, not evidence of interface conservation.

The source-bound tests specifically refuse caller-declared removal and empty visible-route admission. Passing those tests is candidate source/CI evidence only; it does not establish production runtime behavior.

The primary CI gate also runs `npx --yes tsx tests/r620-r474-corpus-integration.mts` against the **actual R474 year-corpus capability graph**, not just synthetic fixtures. It checks unchanged-graph structural continuity, then deliberately removes a real capability with a forged supersession, blanks a real presentation route, substitutes a real source binding, and downgrades a direct executor. Each tamper must be refused. This integration does not claim live runtime proof, exhaustive external-donor recovery, or full executor conservation.

## R650 source-claim hardening

A canonical family ledger is not a production verifier. Even if a ledger row asserts `productionProved: true` and lists no missing evidence, the source-only R620 family report keeps that family unresolved and marks the assertion `UNVERIFIED_ATTESTATION`. `sourceHintsPresent` records a hint; `sourcePresent` remains false without independent byte readback. The OMEGA 7 family summary counts every family as requiring independent production proof, never subtracting families based on ledger flags. Primary CI now runs both the forged-ledger negative regression and OMEGA 7 display-invariant regression; these checks do not themselves establish deployed behavior.
