# R435 · Runtime-Derived Representation

R435 enforces one architectural rule:

Representation is a compiled consequence of the current runtime/evidence state; presentation intent may not create a stronger claim.

## Inputs

R435 composes existing authorities rather than replacing them:

- canonical packet / corpus state;
- R151 all-mode truth fusion;
- R152 universal evidence envelope;
- R349 20,736-address typed field;
- R356 Atlas360 address/bearing geometry and explicit triangle closure;
- returned /api/status, build-receipt and release-evidence packets;
- PCWD proof receipts as MODEL PROOF lineage, never independent empirical evidence;
- R94 surface provenance.

## Claim ceiling

Every compiled representation is one of EMPIRICAL_BOUND, RUNTIME_BOUND, SOURCE_BOUND, MODEL_BOUND, HELD_CONTRADICTION, or HELD_UNKNOWN.

EMPIRICAL_BOUND permits observed-evidence claims only from verified empirical packets. RUNTIME_BOUND permits returned runtime-state claims but not physical or empirical claims. SOURCE_BOUND permits source-bound facts. MODEL_BOUND permits only derived-model representation. Held states permit no positive claim.

A representation receipt carries the Atlas address/bearing, R349 field state, R151 fusion fingerprint, R152 evidence state, source-family count, uncertainty, contradiction/scar carry, proof lineage and explicit permissions.

## Fail-closed behavior

- failed Evidence & Proof refresh clears volatile R435 returned evidence;
- model proof cannot be promoted into empirical evidence;
- forecast may render as forecast but never as future observation;
- Atlas geometry may render deterministically but measurement-dependent triangle closure remains HOLD until three independent real anchors and explicit transforms are supplied;
- no unsupported completion is synthesized;
- R125 CanonState admission, R141 return proof, R146 history, R147 dispatch and governed production authority are unchanged.

## Performance

The 7.46M-row leaf tensor is not shipped into the browser. R435 continues R356 active-slice computation and bounded runtime use. The full topology remains addressable; only the active state/bearing and required proof/evidence context are compiled for presentation.