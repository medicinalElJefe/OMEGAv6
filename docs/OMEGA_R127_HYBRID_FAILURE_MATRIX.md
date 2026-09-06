# R127 Hybrid failure matrix

| Stage | Failure | R127 behavior | State allowed |
|---|---|---|---|
| Canonical probe | DNS/network/firewall failure | Stop after bounded canonical-only retry | OFFLINE |
| Pairing | Missing/rotated credential | Stop and require one explicit fresh pairing | UNPAIRED |
| Agent download | HTTP/non-2xx/timeout | Delete quarantine artifact; do not execute | OFFLINE |
| Agent integrity | Missing digest or SHA mismatch | Reject download; do not promote bytes | OFFLINE |
| Agent identity | Wrong shebang/server/identity | Reject download; do not promote bytes | OFFLINE |
| Python parse | `py_compile` failure | Stop; do not execute source | OFFLINE |
| Register | 401/403 | Terminal credential stop; no blind retry | AUTH REJECTED |
| Register | transient reachability | Bounded canonical-only restart attempt | CONNECTING |
| Heartbeat | no accepted current heartbeat | Browser cannot show PC ONLINE | STALE/OFFLINE |
| Poll/job | operation outside allow list/root | Agent refuses operation | CONNECTED, JOB REJECTED |
| RCWA | NumPy/grcwa absent | General Hybrid remains available; solver stays unavailable | PC ONLINE, RCWA OFFLINE |
| Desktop adapter | signed adapter absent | No CLICK/KEY/TYPE/etc fabrication | PC ONLINE, DESKTOP ADAPTER ABSENT |

The recovery rule is intentionally asymmetric: transport loss may be retried in a bounded fashion, but authentication failure, integrity failure and root-policy failure require an explicit correction rather than mutation onto a different host, credential, binary or filesystem location.
