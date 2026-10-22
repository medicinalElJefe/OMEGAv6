# R507 · Finite Convergence Governor

R507 closes the autonomous retry topology for one fixed evidence epoch.

## Problem proved

Three independent mechanisms could otherwise create non-terminating work:

1. R314 counted only FAILED / NO_GAIN / REJECTED outcomes, while the live CLOUD-01 state records generated source attempts as PROPOSED. A generated repair could therefore fail to consume the retry budget.
2. R314 keyed its local retry limit by residual fingerprint + repair hypothesis. Fingerprint churn could replenish the same repair hypothesis indefinitely.
3. R388 explicitly fell back from the eligible set to the full self-editable set when all remaining items were held by decline scars. That re-selected the very items the scar ledger had told the scheduler not to repeat.

## R507 finite potential

For a fixed evidence epoch define

V = S + A + B

where:

- S = remaining bounded static-roadmap mutation slots;
- A = remaining R314 repair budget for the currently selected bounded hypothesis;
- B = unresolved self-editable R388 items that are not held by returned decline evidence.

One-open-candidate serialization ensures at most one mutation candidate can consume V at a time.

A governed mutation is admissible only if it consumes at least one finite unit:

- static source advancement consumes one S slot;
- an R314 PROPOSED candidate consumes one same-fingerprint attempt and one hypothesis attempt;
- an R388 source advancement removes an item from unresolved eligible work after independent proof;
- an R388 decline-scar carry removes declined items from the eligible set without falsely marking them complete.

R314 is bounded both locally and across fingerprint churn:

- maximum two attempts for one exact fingerprint + repair hypothesis;
- maximum four proposals for the same repair hypothesis across fingerprint changes.

R388 no longer has an all-held fallback. If unresolved self-editable work exists but every item is held, the state is:

HELD_UNTIL_NEW_EVIDENCE

and candidates = [].

If all remaining obligations are external or governance-only, the state is:

AWAIT_EXTERNAL_OR_GOVERNANCE_EVIDENCE.

If V = 0 and there is no open autonomous candidate, the fixed evidence epoch is quiescent. CLOUD-01 must OBSERVE rather than create another repair PR.

## Truth boundary

R507 is a software termination and scheduling invariant. It does not prove scientific correctness, does not create new physical dimensions or primitives, does not admit CanonState, and does not deploy production. R125 remains sole CanonState admission authority and ci.yml remains sole canonical production writer.

New independently returned evidence or a genuinely changed bounded repair hypothesis may create a new evidence epoch. Merely changing a fingerprint, replaying a decline, or rephrasing the same patch cannot.
