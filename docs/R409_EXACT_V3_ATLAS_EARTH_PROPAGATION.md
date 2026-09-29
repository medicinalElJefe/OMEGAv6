# R409 · Exact-v3 Atlas360 / Earth traversal propagation

R409 is replayed from the preserved traversal work onto exact R408 main. It does not merge stale ancestry.

## Purpose

Bind Exact Canon v3 address identity into the existing Atlas360 geometry and Earth/live-scene query context while preserving all source, observation, deployment and physical-claim boundaries.

## Exact relationships

- Exact-v3 20,736 address: reversible zero-based index, one-based RowID and Full-Sphere coordinate.
- Atlas360 leaf address: existing zero-based base-12 hierarchy.
- Congruence law: Atlas360 digits + 1 must equal `(D_domain,P_phase,R_reg,L_lens)`.
- Earth mapping: atlas address → WGS84 remains `DER` query context only.
- Returned source clocks: a bound returned source clock is carried as `OBS`; an unbound/missing clock remains `GAP`.
- Atlas360 geometry is `ENUMERATED` / `DER`, never an Earth observation or physical vector.

## Live propagation

`modelMappedWgs84R347` now carries:

- `exactAddress`
- `provenance:'DER'`
- `physicalEarthCoordinateClaimed:false`
- `observationClaimed:false`

`compileLiveSceneCorrelationR348` carries those fields into its query packet without modifying returned Earth data.

`compileExactTraversalEnvelopeR409` joins:

1. Exact Canon v3 address identity
2. Atlas360 address/bearing geometry
3. Earth query mapping
4. returned weather / space-weather / seismic / event source clocks
5. OBS/GAP provenance summary
6. explicit non-mutation and non-physical-claim boundaries

## Proof

`test:r409` exhaustively evaluates all 20,736 addresses and proves:

- exact-v3 index ↔ Atlas360 digit congruence;
- exact address verification remains true;
- WGS84 mapping remains derived and non-observational;
- missing source clocks remain GAP;
- bound returned source clocks can carry OBS provenance without promoting the atlas query itself;
- live-scene query packets retain the exact address and explicit non-observation/non-physical flags;
- no CanonState mutation or production-authority change;
- R408 resource-aware work-conserving proof scheduling remains present in the lineage.

## Preserved authorities

R409 does not change weather values, SAR values, forecast models, Earth providers, CanonState admission, proof-return authority, durable history, dispatch, deployment routing, PCWD proof authority, or the R408 workload-scar scheduler. 20,736 remains an address/state resolution, not a physical dimension.