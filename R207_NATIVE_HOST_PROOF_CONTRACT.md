# OMEGA R207 Native Host Proof Contract

R207 promotes proof integrity without replacing the production-proven Hybrid executor.

## Execution lineage

- Canonical downloadable wrapper: `public/omega-hybrid-agent.py` (`R207`).
- Immutable executor base: `public/omega-hybrid-agent-base-r205.py` (`R34.1` transport, `R132` capability, `R205` proof extension).
- Production-proven R205 base SHA-256: `49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046`.
- The wrapper validates the base identity and safety markers before loading it.
- The wrapper does not implement a second operation allow-list and does not widen root confinement or shell policy.

## Return proof

R207 adds the exact R141 return envelope to the base executor result:

1. Select the same semantic core consumed by `agentPacketCoreR141`.
2. Serialize deterministically using sorted keys and compact separators.
3. Bound the payload to the R141 maximum proof size.
4. Compute SHA-256 over the exact payload bytes.
5. Return `OMEGA_AGENT_RETURN_FINGERPRINT_R141`, the payload, digest, `proofClosureRevision=R141`, and the base-agent SHA-256.
6. R141 independently recomputes the digest and semantic digest. Both must match before `VERIFIED_EXECUTION_RETURN` is possible.

Legacy `resultFingerprint` remains lineage evidence only.

## Truth boundaries

- Current PC online state requires a current authenticated non-revoked heartbeat.
- A historical R141-verified host result does not prove the PC is online now.
- R205 `DESKTOP_HEALTH` and `FORENSIC_HASH_LEDGER` capabilities remain host evidence operations. Deployment does not imply an actual AT09/AT10 host PASS.
- Host execution evidence does not prove solver/scientific validity.
- R141 proof closure is evidence, not CanonState.
- R146 remains durable execution history.
- R147 remains executor/dispatch authority.
- R125 remains the sole CanonState admission authority.

## Preservation

R207 preserves R206 mission/world continuity, R204 scar/proof continuity, all seven live Durable Objects, R151 full-build execution, Earth/NOAA/ground evidence, renderer layers, Federation/RCWA, Workers AI, SAI, navigation, and the retired-state tombstones for R201/R203.
