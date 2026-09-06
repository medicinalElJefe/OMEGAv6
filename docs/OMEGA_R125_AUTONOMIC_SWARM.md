# OMEGA R125 — Autonomic Scope, Detachment, Checkpoint, and Rejoin

R125 connects the promoted R121 cell swarm, R123 organism hierarchy, R123 living mission runtime, and R124 governed self-build law into one scope-aware execution layer.

It does **not** turn 1,728 cells into 1,728 unrestricted model agents. The 1,728 cells remain independently addressable stateful cloud execution identities; Workers AI remains bounded to a maximum of 12 total model calls per mission.

## Runtime topology

`1 seed → 12 organs → 144 branches → 1,728 cells → 20,736 execution lanes`

These numbers are OMEGA address/execution-resolution levels, not literal physical dimensions.

## Autonomic routing

R125 accepts an operator objective plus bounded runtime metrics:

- continuity
- plasticity
- contradiction
- burden
- evidence
- uncertainty
- scar

The same living-runtime decision structure is used to classify the mission as `STAY`, `TURN`, or `ESCALATE`. Intent is mapped to a projection such as FIELD, MATTER, EARTH, OPTICAL, FORECAST, PROOF, BUILD, or CONVERGENCE, then domain preference influences cell ordering.

Autonomic routing is execution planning only. It does not establish truth, measurement, solver validity, native PC execution, or canonical admission.

## Scope and detachment

An operator may execute:

- `BODY`: the whole swarm address universe;
- `ORGAN`: one 144-cell capability domain;
- `BRANCH`: one 12-cell domain×phase branch;
- `CELL`: one exact domain×phase×regulation cell.

A non-BODY mission is a detached execution. It can run without forcing the entire organism to participate. This is the software equivalent of using one limb or organ independently while the rest of the body remains available.

## Rejoin

After a detached mission closes successfully, `/rejoin` converts its returned Merkle receipt into a bounded evidence packet with authority `SWARM_RECEIPT_RETURNED_NOT_ADMITTED`. That evidence is submitted to the existing R123 organism root as a new comparison/reconvergence mission.

Rejoin does not silently merge a detached result into CanonState. It rejoins the **evidence flow**, not canonical authority.

## Checkpoints and receipts

R125 adds:

- cell SHA-256 result receipts;
- branch Merkle roots inherited from R123;
- organism Merkle roots inherited from R123;
- autonomic mission Merkle root;
- deterministic checkpoint SHA-256;
- explicit execution quorum metrics.

Execution quorum means the fraction of selected cells/branches that returned successfully. Its authority label is `EXECUTION_QUORUM_NOT_TRUTH`; it is not scientific consensus and not evidence that the underlying claims are correct.

## Cost and capacity governor

R125 can address the complete 1,728-cell body but does not silently spend it.

- Explicit `FULL` selects all 1,728 cells.
- AUTO/STAY defaults to a small 24-cell route.
- AUTO/TURN expands to 144 cells.
- AUTO/ESCALATE expands to 288 cells by default.
- All 1,728 cells in AUTO require explicit `allowFullAuto=true`.
- Workers AI is clamped to 0–12 total model calls, including optional final reconvergence.
- Genesis and Optical machine budgets remain separately bounded.
- External AI/machine work is not automatically retried as if costless; deterministic work may receive bounded retries.

## Self-build integration

BUILD intent generates an R124-compatible build capsule proposal with tests and preservation requirements, but R125 does not directly mutate the repository or main branch. Capsule status is `PROPOSED_NOT_EXECUTED` and authority is `SELF_BUILD_CANDIDATE_NOT_ADMITTED`.

The existing R124 self-build engine remains responsible for propose → sandbox → test → compare → admit/reject → rollback-ready governance.

## API

- `GET /api/swarm/autonomic/manifest`
- `GET /api/swarm/autonomic/status`
- `POST /api/swarm/autonomic/plan`
- `POST /api/swarm/autonomic/missions`
- `GET /api/swarm/autonomic/missions/:id`
- `POST /api/swarm/autonomic/missions/:id/tick`
- `POST /api/swarm/autonomic/missions/:id/pause`
- `POST /api/swarm/autonomic/missions/:id/resume`
- `POST /api/swarm/autonomic/missions/:id/cancel`
- `GET /api/swarm/autonomic/missions/:id/checkpoint`
- `POST /api/swarm/autonomic/missions/:id/rejoin`

R123 organism and R121 direct-swarm APIs remain intact.

## UI layering

The Convergence destination now exposes the system from highest-level autonomy downward:

1. R125 Autonomic control — route, scope, detach, checkpoint, rejoin;
2. R123 Organism body — persistent seed/organ/branch/cell hierarchy;
3. R121 Direct swarm — direct independent-cell and compatibility control;
4. retained continuity/convergence field instrument.

Nothing in this hierarchy is permitted to bypass OMEGAv6 proof/admission.
