# R292 · Reusable Proof-Carry Fabric

R290 made Singmaster visible inside OMEGAv6. R292 makes the mathematical structure **change how OMEGA reasons**.

The core improvement is a domain-neutral proof-carry layer that converts exact checks, invariant-preserving transforms, source lineage, family exhaustiveness and unresolved proof obligations into a bounded contextual support signal. That signal is not a probability of truth and cannot itself prove a claim. It is used to prevent an incomplete proof program from being treated the same as a closed certificate set.

## New reusable kernel

`src/proof/proofCarryRuntimeR292.js` accepts any proof/research packet with:

- claim identity and current public status;
- promotion gates;
- exhaustive/non-exhaustive family partitions;
- invariant-preserving transforms and domain-map checks;
- source authority records;
- exact executable checks.

It returns:

- gate coverage;
- partition/exhaustiveness coverage;
- invariant-carry coverage;
- exact-check coverage;
- source coverage;
- weakest-link-aware support score;
- unresolved scar ledger;
- internal promotion eligibility;
- CARRY / TURN / ESCALATE proof-context decision;
- deterministic cache/routing fingerprint.

The score is explicitly a **certificate-completeness score**, not a truth probability.

## Singmaster becomes the first live proof domain

`compileSingmasterProofCarryR292()` converts the R290 Sharp Singmaster work into the generic kernel. Exact BigInt collision checks and Kummer carry checks contribute positive support. Open small-k family exhaustion, residual arithmetic-geometry closure, missing forensic lineage and unadmitted external proof artifacts survive as unresolved scars.

Running the Singmaster exact audit now binds this packet as the active browser-local proof context. It can also be bound or cleared manually from Evidence & Proof.

## Woven Continuity is now proof-context aware

`compileWovenContinuityR77()` reads the active proof packet and carries:

- claim status;
- support score;
- routing support;
- scar pressure;
- unresolved scar count;
- promotion eligibility;
- proof-carry decision.

When a proof context is bound, unresolved proof obligations reduce proof glow rather than being silently discarded. With no bound context, the R292 layer is exactly neutral and preserves prior behavior.

## ALL MODES is now proof-context aware

`fullModeTransitionAudit()` now fingerprints its cache with the active proof context, so switching proof projects cannot reuse stale proof-aware scores.

For a bound proof project:

- the Proof Ledger orchestration channel is weighted by certificate completeness;
- Unified Coherence and Mode 188 consume contextual proof support rather than the old raw proof scalar alone;
- a dedicated Proof Carry orchestration channel becomes visible;
- incomplete proof programs can lower weakest-link orchestration consensus;
- lattice support carries the same bounded proof context.

Unbound operation remains neutral, so R292 does not globally penalize unrelated work.

## Canonical transition authority remains protected

R292 is deliberately unable to rewrite `autoPing` or canonical state transitions. R23 transition receipts now record the active proof context for audit, but mark `affectsCanonicalRoute:false`. This preserves the existing source-state authority while making the contextual reasoning pressure inspectable.

## Why this is a real OMEGA improvement

The useful insight from the Singmaster work is not the existence of one more panel. It is the general computational rule:

> preserve exact invariants through every transform, carry unresolved obligations forward as scars, and do not promote a claim until the counterexample/family partition is exhaustive.

R292 applies that rule to OMEGA itself. Any future proof domain can use the same packet compiler, bind its certificate state, and make Woven/ALL MODES sensitive to what is actually closed versus merely suggested.

## Truth boundary

R292 does not turn OMEGA's symbolic modes into mathematical proof authority. External theorems still require their real sources; exact bounded checks remain bounded checks; open family coverage remains open. The new runtime improves reasoning discipline and routing coherence without converting internal scores into external truth.
