# R406 · Exact Canon v3 reconciliation

R406 binds the reconciled OMEGA exact-data package into the current PCWD lineage without creating a second CanonState, renderer, deployment path, or proof authority.

## What changes

- Adds src/system/omegaExactCanonV3.ts as a compact executable registry for the reconciled v3 canon.
- Adds the closed-form 20,736 Full-Sphere address model:
  - RowID=(D−1)·1728+(P−1)·144+(R−1)·12+L
  - deterministic inverse
  - canonical antipode A(D,P,R,L)=(D⊕6,13−P,13−R,L⊕6)
  - exhaustive antipode involution.
- Adds collision-free machine symbols for domain, decision score, differentiation and residual channels.
- Keeps legacy/canon/PCWD epsilon values explicitly versioned instead of silently merging them.
- Registers seven separate score families. No score is silently averaged, substituted, or promoted into another score's semantic role.
- Registers proof tiers from ENUMERATED through EXTERNALLY_VALIDATED and preserves unknown/GAP state.
- Encodes reconciliation locks for provenance, distribution-before-compression, orientation, negative-result retention, physical-claim boundaries, forecast separation and external validation.
- Extends PCWD A_t with canonicalV3 Full-Sphere metadata.

## Critical preservation law

The existing PCWD Z2_ATLAS_COMPLEMENT_WITH_ORIENTATION_INVERSION remains unchanged. It is a proven software quotient used by the current PCWD benchmark lineage.

The reconciled Full-Sphere antipode is not the same transform. R406 carries both separately:

1. L_t.partnerAddress — existing PCWD Z2 quotient partner.
2. A_t.canonicalV3.antipodeIndex0 — canonical Full-Sphere antipode.

R406 therefore gains the exact atlas transform without reinterpreting or invalidating R357–R405 proof history.

## Truth boundaries

R406 does not:
- treat 20,736 or any 12^n atlas level as literal physical spatial dimensions;
- convert model state into observation;
- claim a new physical primitive;
- promote software holonomy residual into physical holonomy;
- erase negative benchmark or failed-mapping evidence;
- replace R125 CanonState admission, proof-return authority, durable history, dispatch or governed deployment.

## Proof

tests/r406-exact-canon-v3-invariants.mts exhaustively checks all 20,736 addresses for:
- RowID forward/inverse identity;
- Full-Sphere antipode involution;
- antipode RowID involution;
- physical-dimension claim disabled.

It also checks:
- seven score families remain distinct;
- epsilon versions remain distinct;
- proof-tier contract includes benchmarked and externally validated states;
- PCWD packets carry the new exact address metadata while preserving the existing Z2 quotient.