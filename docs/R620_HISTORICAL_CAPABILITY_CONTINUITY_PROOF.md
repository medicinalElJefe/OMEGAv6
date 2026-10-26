# R620 — Historical capability continuity proof gate

OMEGA's unit of progress is **recovered and executable capability**, not a workflow run, archive count, route count, or release number.

`auditCapabilityContinuityR620` compares historical and current capability graphs, separating:
- a missing capability (identity absent in the candidate);
- executor regression (old executor runnable, new executor not runnable);
- interface regression (previous route exposed, new presentation missing);
- proof deficit (no bound target runtime observation);
- explicitly governed supersession (replacement exists, disposition and approver carry evidence).

The input `proofs` mapping must come from *independent real production observations*. Its structure is a **receipt reference**, not a self-validating attestation: callers must authenticate, retrieve, and verify the cited observation separately. The audit intentionally returns `productionProven: false` for **every** caller-supplied proof map, even when the references match. `proofReferencesComplete` only reports syntactic binding completeness. The separate production release authority must independently authenticate and read back the exact promoted SHA, deployed runtime behavior, and rollback eligibility before asserting live proof. No caller-created receipt can promote this audit to production truth.

Import: `import {auditCapabilityContinuityR620} from './src/capabilityContinuityAuditR620.mjs'`.

Run unit regressions: `node --test tests/capability-continuity-r620.mjs`.

Evidence hierarchy: repository source != executable behavior != green CI != merged revision != deployed artifact != live runtime proof != complete historical capability conservation.

**Scope:** This release supplies the executable conservation audit; it does not itself reconstruct external atlas artifacts, wire OMEGA 7 interfaces, or verify live Cloudflare R2 storage. Those must enter as separately evidenced implementation candidates. Dimensional addresses 12, 144, 1,728 and 20,736 are representation and routing hierarchies without automatic physical-dimensional claims. Heightened Mode, recursive transmissible carry, multi-parent boundary exchange, contradiction/scars, and observer-relative topology remain substantive capability lineages to independently recover and test.

The new module does not change CanonState admission, release workflow, secrets, production bindings, or authoritative runtime state.
