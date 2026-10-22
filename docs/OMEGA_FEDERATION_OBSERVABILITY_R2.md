# OMEGA Federation Observability R2

The operator must be able to distinguish node health from scientific result quality.

## Node telemetry
Each node publishes version, supported schemas, capabilities, readiness, queue depth, active jobs and last-result time. Offline/degraded workers must not cause another node to fabricate status.

## Job telemetry
Track packet ID, state ID, atlas address, source SHA, worker, solver/version, queue time, solve time, retry count, convergence state, proof gate and result lineage.

## Performance telemetry
Track Tier-1 candidates/second, cache hit ratio, promotion fraction, Tier-2 queue latency, RCWA/FDTD throughput, GPU/CPU memory pressure and artifact sizes. UI render FPS is separate from solver throughput.

## Scientific telemetry
Track convergence residuals, spectral/phase error, polarization response, neighbor-coupling discrepancy, measurement residual, fabrication residual and scar updates. Never collapse these into a single cosmetic health color.

## Rollback
Every production node keeps its previous known-good deployment reference. A node can roll back independently when its new version violates protocol, performance or proof invariants. CanonState remains at OMEGAv6 during worker rollback.
