# Deterministic operational workspace bridge

This is a bounded integration of the existing OMEGA6 R237 command deck and OMEGA7 R884 local hub with the separately installed deterministic operational workspace. Both interfaces use the same panel and the same existing local executor. No new canonical route or alternate CanonState authority is introduced.

The user-owned operational distribution supplies omega_workspace_bridge.py, deterministic.py, the atlas, persistent queue and recovery objects. Run the bridge from that distribution on the local PC. The default invocation is read-only with respect to operational event commits; --enable-execution is an explicit local launcher choice. The bridge listens only at 127.0.0.1:8766, with a session token printed by the local process. Never put the token or private database in this repository, browser storage, or cloud requests. The browser may require local-network permission.

GET /v1/status audits the workspace pointer and queue, returning the local checkpoint, counts, channels and operator readiness. POST /v1/roundtrip requires the exact current workspace pointer and one to eight materialized integer address paths. The existing runner prepares and commits only a bounded certified forward/inverse batch and publishes its normal content-addressed workspace snapshot. No shell, arbitrary program, file-path, model-training or CanonState write endpoint is exposed. Use one workspace writer at a time. On interruption or stale pointer, refresh or recover through the existing local CLI; no automatic browser retry.

The panel accepts only OMEGA_EVENT_WORKSPACE_BRIDGE_V1 / LOCAL_OPERATIONAL_ONLY responses with physicalPcAccepted, gpuAccepted and canonPromoted all false. Local operational success is not native-device admission, federation, GPU execution, R125 promotion or R141 return. Existing R170/R237 gates and the 12-workstream integration ledger remain authoritative.

Source-only candidate on the existing integration branch. This does not claim deployment, full historical mode coverage, physical-PC execution, production browser parity or closure of all release gates.
