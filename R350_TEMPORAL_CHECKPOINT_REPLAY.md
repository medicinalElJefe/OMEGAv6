# R350 Temporal Checkpoint / Replay

R350 adds deterministic model-time traversal to the R349 20,736-address typed field without creating a competing durable history system.

## Operator

`typed field → integer tick → Woven evolution → complete field hash → checkpoint → lineage hash → seek/replay → proof`

### Time

R350 uses integer ticks as deterministic **model-time addresses**. R185 and R193 remain the authorities for adaptive temporal cadence and multi-axis refinement. Their plans may be supplied to R350 as scheduling metadata, but cadence does not change truth authority.

### Checkpoints

A checkpoint contains a cloned R349 typed field plus:
- complete typed-field hash;
- previous checkpoint lineage hash;
- current lineage hash;
- step-receipt hash;
- tick;
- explicit epistemic state.

R350 does not persist checkpoints as a new durable execution history. R146 retains that authority.

### Seek and replay

Seek selects the nearest checkpoint at or before the target tick and replays only the declared intervening step receipts. Every replayed tick must reproduce its recorded complete-field hash. Divergence fails closed.

### HISTORY / NOW / FORECAST

These labels are representation roles over the model timeline:
- HISTORY = prior model replay state;
- NOW = selected current model tick;
- FORECAST = future model projection.

None are automatically observations. Forecast never upgrades into observed evidence through rendering or replay.

## Preserved authority

- R185 — temporal performance/scheduling.
- R193 — independent multi-axis refinement.
- R141 — exact returned execution proof.
- R146 — durable execution history.
- R149/R159 — deterministic replay requirements in sovereign execution closure.
- R317 — persistent world-state/checkpoint lineage research contract.
- R125 — sole CanonState admission authority.
