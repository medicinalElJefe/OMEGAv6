# OMEGA R126 — Causal Interaction Relativity Engine

R126 Causal Interaction Relativity turns OMEGA's existing address hierarchy and continuity laws into an evidence-preserving causal analysis engine. It is deliberately stricter than a correlation mapper: a relationship cannot be promoted to `SUPPORTED_CAUSAL` from model output, temporal coincidence, visual similarity, or repeated correlation alone.

## Canonical hierarchy

`1 seed → 12 organs → 144 branches → 1,728 cells → 20,736 lanes`

The hierarchy is an OMEGA address and execution-resolution system. It is not a literal physical-dimensionality claim and it is not proof that 1,728 independent cloud deployments are live.

Each cell is addressed by `(domain, phase, regulation)` with exact zero-based mapping:

`cell = domain × 144 + phase × 12 + regulation`

Each cell contains 12 logical lens lanes:

`lane = cell × 12 + lens`

The resulting lane address range is exactly `0..20,735`.

## Evidence packet

A numeric observation is invalid for causal promotion unless it carries:

- stable evidence ID;
- evidence kind;
- concrete source and source family;
- observation time;
- spatial/reference frame;
- time frame;
- units for numeric quantities;
- explicit uncertainty when known;
- verification state;
- support/contradiction linkage to a named relation.

Unknown evidence remains unknown. The engine never fills a missing measurement with a generated value.

## Causal states

Edges are classified as:

- `UNKNOWN` — not yet evaluated;
- `INSUFFICIENT` — no valid supporting evidence;
- `CORRELATED` — evidence suggests association but does not satisfy the causal gate;
- `SUPPORTED_CAUSAL` — passes the bounded causal-evidence rule;
- `CONTRADICTED` — negative or contradictory evidence outweighs support.

The current `SUPPORTED_CAUSAL` gate requires all of the following simultaneously:

1. at least one verified intervention-class evidence item;
2. at least one verified replication-class item;
3. at least two independent source families;
4. computed causal confidence of at least `0.72`;
5. no contradiction pattern strong enough to reverse classification.

This is an engineering admission rule for OMEGA candidate packets, not a universal philosophical definition of causality.

## Confidence

The engine combines intervention evidence, replication, repeated measurement, source-family diversity, contradiction burden, and uncertainty. Model-only evidence is intentionally capped far below causal admission.

Confidence is carried with the edge and never converted into certainty.

## Scar/history carry

Every relation keeps a scar value. Contradiction and insufficient evidence increase residual burden; supported causal evidence gradually reduces it but does not erase history immediately.

Current recurrence:

`scar' = clamp(0.82 × scar + 0.18 × residual)`

This implements the existing continuity principle:

`partition → interaction → invariant evidence carry → scar/residual carry → re-contextualize → independent proof → external admission`

## Logical swarm dispatch

The causal compiler can request between 1 and 1,728 logical cells. Dispatch scope is derived from the bounded request:

- 1 cell: `CELL`
- 2–12: `BRANCH`
- 13–144: `ORGAN`
- 145–1,727: `BODY_PARTIAL`
- 1,728: `BODY_FULL`

This is planning/addressing. It never claims a provider call, Durable Object execution, sovereign PC action, solver run, or external cloud deployment unless a separate execution receipt proves it.

## Truth boundary

The causal engine emits `CANDIDATE_ONLY` packets. It cannot mutate CanonState directly. R125 accuracy/proof admission remains the authority boundary.

The engine therefore separates four things that must never be collapsed:

`observation ≠ correlation ≠ causal support ≠ canonical admission`

This is the central accuracy law for the R126 causal layer.
