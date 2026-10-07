# OMEGA R504 — Calculus Decision Continuity

R504 closes a live post-R503 defect observed on the first production CLOUD-01 cycle after calculus-native worker admission.

The R503 packet was correctly supplied on the initial R388-C-03 attempt, but the R314 correction prompt did not explicitly re-carry the calculus contract. The second correction therefore lost its worker context while repairing a stale exact-source replacement.

R504 makes calculus inheritance continuous across autonomous retries.

## Admission and decision law

A reasoning worker must now preserve the exact R503 context on both initial and correction attempts and must additionally state:

- at least two admissible alternatives;
- selectedAlternative, which must be one of those alternatives;
- decision as exactly STAY, TURN, or ESCALATE;
- a non-trivial decisionRationale;
- residual-bound evidence IDs;
- the exact eight-field R503 developmental delta;
- the actual residual ID as developmentalDelta.intendedResidual.

A source mutation is admissible only under TURN with positive planning delta:

ΔΩ = capability + coherence + autonomy + usability + recoverability − regression − duplication − authority fragmentation

Positive ΔΩ remains planning evidence only. It does not prove runtime, deployment, scientific truth, or Canon admission.

## Retry continuity

Correction attempts receive the same exact calculus packet and explicit schema as the initial attempt. A calculus-decision rejection is retryable within the existing bounded R314 attempt budget. The worker may correct its reasoning contract, but may not widen paths, authority, truth claims, or deployment access.

R125, R142, R164, R240, R474 and ci.yml retain their existing authorities. R504 creates no Canon owner, deployment writer, physical primitive, or physical dimension.
