# OMEGA R505 — Result-Conditioned Calculus Transport

## Purpose

R505 makes a verified calculus decision a real control input to the autonomous source-build path.

R503 established the calculus-literacy membrane. R504 preserved STAY / TURN / ESCALATE and developmental-delta continuity across retry attempts. Production proof after R504 exposed a remaining transport defect: the Workers AI patch response could produce a valid bounded source replacement while omitting the large R503 attestation object, so the unchanged literacy gate correctly rejected the proposal and CLOUD-01 terminated OBSERVE_ONLY.

R505 removes that failure mode without weakening R503 or R504.

## Runtime sequence

```
residual
  -> R505 compact calculus decision
  -> validate authority reconstruction + truth vetoes + alternatives + delta
  -> STAY      => carry/observe, no source generation
  -> ESCALATE  => request additional evidence, no source generation
  -> TURN      => bounded R314 patch generation
  -> deterministic binding of the exact accepted R505 decision into R503 workerAttestation
  -> R503 calculus-literacy validation
  -> R504 decision/developmental-delta validation
  -> existing R314 source membrane
  -> independent workflow proof
  -> governed PR / merge / ci.yml production path
```

The result therefore changes what computation is allowed to happen next. Source generation is no longer invoked before the calculus decision exists.

## Truth and authority boundaries

R505 does **not** add Canon authority, deployment authority, scientific authority, or physical dimensions.

- R125 remains the sole CanonState admission authority.
- R142 remains execution-receipt authority.
- R164 remains residual/evidence authority.
- R240 remains exact source-promotion authority.
- `.github/workflows/ci.yml` remains the sole production writer.
- R505 planning delta is not runtime, production, scientific, device, or Canon proof.
- 12 / 144 / 1,728 / 20,736 and higher atlas values remain representational/address resolutions.
- STAY and ESCALATE cannot produce source mutation.
- TURN requires a positive R503 developmental delta and is still subject to the unchanged R314 product-source membrane plus independent proof.

## Why the binding is deterministic

The decision model must explicitly return the exact authority reconstruction, vetoes, alternatives, selected alternative, decision, rationale, evidence IDs, and developmental delta in a compact decision-only call.

Only after that object validates does the patch model receive permission to propose source.

The runtime then copies the already-validated decision fields into the R503 worker attestation. It does not invent a decision or infer a positive delta from patch existence.

This keeps model reasoning accountable while avoiding the observed failure where a single oversized patch response dropped the calculus object.

## Acceptance proof

`tests/r505-result-conditioned-calculus-transport-invariants.mjs` proves:

- exact R503 authority reconstruction is required;
- physical-dimension inflation is rejected;
- TURN with non-positive developmental delta is rejected;
- a valid TURN is bound into an R503-valid / R504-valid proposal;
- the patch-generation call no longer has to regenerate `workerAttestation`;
- STAY terminates after the decision call and never invokes source generation;
- canonical mutation remains false.

## Production acceptance

R505 is not complete merely because local tests pass. It is complete only when its exact merge SHA passes the existing GitHub acceptance workflows, the canonical `deploy-main` path promotes the exact Worker version, live production reports the exact promoted SHA, and the post-deployment CLOUD-01 cycle demonstrates one of the governed result-conditioned terminal states without falling back to the prior missing-attestation defect.
