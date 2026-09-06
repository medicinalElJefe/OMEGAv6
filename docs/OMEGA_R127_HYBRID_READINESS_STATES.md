# R127 readiness states

- OFFLINE: no current authenticated heartbeat.
- PAIRED: fresh durable browser/agent credential exists; not PC online proof.
- AGENT VERIFIED: exact canonical agent bytes passed SHA-256 and parser preflight; not PC online proof.
- PC ONLINE: current authenticated device heartbeat accepted by canonical OMEGAv6.
- RCWA ONLINE: PC online plus independent current solver readiness.
