# OMEGA R127 Hybrid Zero-Drift Connector

## Purpose

R127 narrows the Sovereign PC connection into one proofable path instead of accumulating fallback behavior. The canonical control origin is `https://omegav6.jeffdeweyeljefe.workers.dev`. The ordinary runtime root is `J:\` when available, or an explicitly approved non-system root. `C:` is never selected as an OMEGA runtime fallback.

## Connection state machine

1. Canonical browser session requests a freshly rotated durable Hybrid pairing.
2. The generated Windows connector probes only canonical OMEGAv6.
3. The Hybrid Python agent downloads into a quarantine `.part` file.
4. The Worker supplies `x-omega-agent-sha256`; the connector computes SHA-256 over the exact downloaded bytes and requires equality.
5. The connector validates the Python identity and canonical default server.
6. The exact downloaded source passes `python -m py_compile` before promotion.
7. Only validated bytes are atomically promoted to the active approved-root agent path.
8. The agent performs authenticated register, heartbeat and governed polling.
9. Browser `PC ONLINE` is true only while a non-revoked device has a current authenticated heartbeat and server native-execution claim.
10. Authentication rejection is terminal for that credential. Canonical network reachability alone may retry, and retries are bounded.

## No-mutation rules

- No retired Foundasound control-host fallback.
- No Genesis, Vercel or other site as a PC-control fallback.
- No `C:` OMEGA runtime fallback.
- No execution of a partial download.
- No silent substitution of an older local agent when a new download fails verification.
- No browser credential treated as PC-online proof.
- No RCWA dependency installation by the connector; RCWA is optional and independently gated.
- No arbitrary shell or desktop automation fabricated when the signed adapter does not exist.

## Canonical endpoints

- `POST /api/hybrid/bootstrap` — rotates the fresh durable pairing.
- `GET /api/hybrid/connector-manifest` — publishes canonical connector policy and exact agent digest metadata.
- `GET /api/hybrid/agent-download` — returns the canonical Python agent plus digest/version/byte headers.
- `GET /api/hybrid/status` — exposes current device proof and heartbeat freshness semantics.
- `POST /api/hybrid/reconnect` — verifies current browser bridge or explicitly rotates it when repair is requested.
- `/api/hybrid/agent/register`, `/api/hybrid/agent/heartbeat`, `/api/hybrid/agent/poll` — authenticated host transport.

## Truth boundary

Pairing issuance, connector download, agent integrity validation, Python parse validation, agent registration, heartbeat freshness, optional solver readiness and native execution are separate states. None may be promoted into another state without its own evidence. The visible Hybrid surface must never claim `PC ONLINE` solely because a connector was generated or downloaded.
