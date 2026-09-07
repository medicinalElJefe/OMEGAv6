# OMEGA R153.1 — External AI Tool Push

R153.1 turns the optical computational surface into a bounded external instrument that an AI agent, human tool, automation, or test harness can invoke directly.

It does **not** modify an AI model's weights, hidden reasoning, system instructions, or canonical authority. The upgrade is external augmentation: an AI can push a bounded computation request into OMEGA, receive deterministic optical results plus a hashed receipt, incorporate those returned results into its next reasoning step, and push a refined request back into OMEGA.

## Closed interaction loop

`AI intent -> machine-readable tool contract -> bounded OMEGA call -> deterministic computation -> hashed receipt -> residuals / next-action guidance -> AI synthesis -> refined call`

This makes OMEGA useful as a computational coprocessor rather than merely a display.

## Public machine contract

The existing optical Worker remains `SCREEN_ONLY` and now exposes:

- `GET /api/tool/descriptor` — machine-readable capabilities and JSON call schema
- `GET /api/tool/probe` — readiness and dependency truth
- `POST /api/tool/invoke` — bounded deterministic invocation
- `GET /openapi.json` — OpenAPI 3.1 discovery document

Existing R152 routes remain intact.

## Operations

### `inspect_address`

Inspect one of the 20,736 atlas addresses at a requested wavelength.

### `rank_addresses`

Rank an explicit set or a contiguous window of up to 1,728 addresses. The returned top set gives an AI a deterministic external search signal instead of requiring the language model to estimate optical ranking internally.

### `screen_candidate`

Screen one geometry proposal with the inherited R152 reduced-order engine. If the candidate earns a Tier-2 handoff, the state remains `PREPARED_NOT_SOLVED` until a fresh authenticated Sovereign RCWA result is returned.

### `compare_candidates`

Screen and rank up to 24 proposed geometries in one external call. This is designed for an AI refinement loop: propose alternatives, compare externally, retain the highest-ranked reduced-order candidates, then decide whether to refine again or request authenticated full-wave compute.

## Receipt truth

Every successful call returns `OMEGA_EXTERNAL_TOOL_RECEIPT_v1` with:

- deterministic SHA-256 of the bounded request packet;
- tool and version identity;
- caller identity supplied by the caller;
- operation identity;
- return time;
- `SCREEN_ONLY` authority;
- `side_effects: none`;
- `canonical_mutation: false`;
- the inherited optical truth boundary.

The SHA is an integrity identifier, not a cryptographic signature from an independent authority.

## Decision-support return

Responses include explicit `decision_support` containing:

- evidence class;
- confidence class;
- residual validation deficits;
- a recommended next operation.

That allows the caller to distinguish useful computational guidance from proof that has not yet been earned.

## Authority separation

R153.1 preserves the existing chain:

`PROPOSE -> SCREEN -> PREPARE_TIER2 -> authenticated SOLVE -> returned receipt -> ADMIT`

The external AI adapter cannot:

- execute arbitrary code;
- mutate CanonState;
- claim RCWA/FDTD/FEM execution;
- claim fabrication or physical measurement;
- bypass the authenticated Sovereign host;
- silently upgrade screening evidence into empirical evidence.

## Testing

The R153.1 release gate proves:

1. existing R152 optical invariants;
2. external tool descriptor and OpenAPI contracts;
3. all four external operations;
4. 1,728-address bounded ranking;
5. receipt determinism structure and truth boundaries;
6. invalid schema/caller/operation rejection;
7. existing UI interaction wiring and responsive controls;
8. inherited R115, R151 and R153 sovereign gates;
9. full repository regression/build;
10. Wrangler dry run;
11. production health/UI/atlas/tool live probes after merge;
12. a live external feedback loop: rank 1,728 states -> inspect returned top state -> screen R44 -> compare three candidate geometries.

The live feedback-loop output is used as release evidence rather than treated as an architectural promise.
