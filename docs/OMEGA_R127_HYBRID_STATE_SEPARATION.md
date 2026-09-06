# R127 state separation

`PAIRING_ISSUED` ≠ `CONNECTOR_DOWNLOADED` ≠ `AGENT_VALIDATED` ≠ `AGENT_REGISTERED` ≠ `HEARTBEAT_CURRENT` ≠ `RCWA_READY` ≠ `JOB_EXECUTED`.

The UI and API must preserve these distinctions. Only `HEARTBEAT_CURRENT` on a non-revoked authenticated device can support the ordinary `PC ONLINE` claim.
