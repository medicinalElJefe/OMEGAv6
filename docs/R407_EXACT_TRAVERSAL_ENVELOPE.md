# R407 · Exact traversal envelope

R407 is the first propagation layer built on the merged R406 Exact Canon v3 authority.

## Purpose

Unify exact-v3 address identity, Atlas360 deterministic geometry and Earth source-clock provenance in one read-only traversal envelope without replacing any existing data source, SAR gate, weather provider, CanonState, proof-return, dispatch or deployment authority.

## Exact relationships

- Exact-v3 20,736 address: reversible RowID and Full-Sphere coordinate.
- Atlas360 leaf address: existing 0-based base-12 hierarchy.
- Congruence law: Atlas360 digits + 1 must equal (D_domain,P_phase,R_reg,L_lens).
- Earth mapping: atlas address → WGS84 is DERIVED query context only.
- Returned source clocks: bound source return = OBS provenance; missing/unbound clock = GAP.
- Atlas360 geometry = ENUMERATED / DERIVED geometry, never an Earth observation.

## Live propagation

`modelMappedWgs84R347` now carries the exact-v3 address and explicit `DER` provenance.
`compileLiveSceneCorrelationR348` carries that exact address into its query packet, with `physicalEarthCoordinateClaimed=false` and `observationClaimed=false`.

`compileExactTraversalEnvelopeR407` joins:

1. Exact Canon v3 address
2. Atlas360 address/bearing geometry
3. Earth query mapping
4. returned weather/space-weather/seismic/event source clocks
5. OBS/GAP provenance summary
6. non-mutation and non-physical-claim boundaries

## Proof

`test:r407` exhaustively evaluates all 20,736 addresses and proves:

- exact-v3 index ↔ Atlas360 digit congruence;
- exact address verification remains true;
- WGS84 mapping remains DERIVED and non-observational;
- unbound source clocks remain GAP;
- bound returned source clocks become OBS without promoting the atlas query itself;
- no CanonState mutation or production-authority change.

R407 does not alter weather values, SAR values, forecast models, Earth providers or live deployment routing. It provides the common exact envelope those systems can safely consume next.