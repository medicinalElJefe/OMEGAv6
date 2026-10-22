# OMEGA R123 — Organism Swarm Execution Fabric

R123 upgrades the promoted R121 direct swarm from a root-to-cell fan-out into a persistent hierarchical body while retaining the direct swarm as a compatibility and independent-cell control surface.

## Hierarchy

`1 seed/root → 12 organ identities → 144 branch identities → 1,728 cell identities → 20,736 execution lanes`

These are OMEGA address and execution-resolution levels. They are not literal physical dimensions.

- **Seed/root**: mission identity, deadline, budgets, queue, proof state, reconvergence.
- **12 organs**: persistent capability domains such as orchestration, software, research, mathematics, physics, data, forecast, tools, sovereign, proof, and coordination.
- **144 branches**: one persistent domain×phase execution boundary per address pair.
- **1,728 cells**: independent stateful Durable Object identities carrying status, lineage, scar, evidence identity, and result receipts.
- **20,736 lanes**: twelve internal address lanes per cell.

## Biological analogy, without false claims

The architecture deliberately resembles a nervous/organ hierarchy in software: a root can coordinate the body, each organ can retain local history and health, each branch can isolate a bounded job, and cells can execute independently. This is an orchestration topology, not biological consciousness and not evidence of AGI.

## Woven Continuity runtime law

`partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition`

R123 maps that law into concrete runtime operations:

1. seed partitions a mission by selected topology;
2. organs retain domain-local durable state;
3. branches execute bounded groups of cells;
4. cells return result hashes and local state/scar updates;
5. branch receipts compute Merkle roots over returned cell hashes;
6. root reconverges branch receipts into an organism Merkle root;
7. optional model synthesis is bounded and remains non-canonical.

## Failure isolation and recovery

A failed cell increments local scar and does not erase unrelated cells. A branch may close degraded while other branches continue. Organ state records branch/cell runs and failures. The root supports deadline enforcement, bounded branch concurrency, deterministic-only retries, pause, resume, cancel, manual tick, and replay.

External AI, Genesis, and Optical calls are not automatically retried by the branch loop because they may carry cost or side effects. Deterministic cell work may receive bounded retries.

## Capacity and cost governance

Workers AI is not invoked 1,728 times simply because 1,728 cells exist. Total model budget is clamped to 0–12 per mission. When final reconvergence uses a model call, that call consumes one unit of the same mission budget; cell-level model synthesis receives the remainder.

Genesis and Optical have separately bounded machine budgets. Their existing authority boundaries remain unchanged.

## Evidence carry

A mission may carry up to 16 bounded evidence/context packets. Unless a packet has an independently established authority, operator-supplied context is labeled `OPERATOR_SUPPLIED_NOT_INDEPENDENTLY_VERIFIED`. Cells preserve evidence identity and hashes in receipts rather than converting context into measurement or proof.

## Proof structure

- cell: SHA-256 result receipt;
- branch: Merkle root over cell receipt hashes;
- organ: persistent state ledger with last branch receipt;
- organism: Merkle root over branch receipt roots.

A Merkle root proves deterministic aggregation/identity of returned receipts; it does **not** prove that the underlying scientific or external-world claims are true.

Every organism mission closes as a result fabric state such as `RETURNED_NOT_ADMITTED`. Existing OMEGAv6 proof/admission remains the sole canonical-state authority.

## Operator control surface

The Convergence destination now layers three instruments without deleting prior capability:

1. R123 Organism mission console;
2. R121 direct swarm body for independent-cell/compatibility control;
3. retained continuity/convergence field instrument.

The R123 console provides topology, cell count, model budget, branch concurrency, deadline, evidence/context, pause/resume/cancel/replay, mission progress, organ/branch inspection, Merkle receipt state, and bounded final synthesis.

## API

- `GET /api/swarm/organism/manifest`
- `GET /api/swarm/organism/status`
- `POST /api/swarm/organism/missions`
- `GET /api/swarm/organism/missions/:id`
- `POST /api/swarm/organism/missions/:id/tick`
- `POST /api/swarm/organism/missions/:id/pause`
- `POST /api/swarm/organism/missions/:id/resume`
- `POST /api/swarm/organism/missions/:id/cancel`
- `POST /api/swarm/organism/missions/:id/replay`
- `GET /api/swarm/organism/organs/:domain`
- `GET /api/swarm/organism/branches/:domain/:phase`

R121 direct `/api/swarm/*` routes remain available.
