# R881 — OMEGA7 portable Windows first-launch package

R881 builds a portable Windows **web-shell** ZIP from the **actual Vite production build**. It includes a bundled Windows `node.exe`, local static server, and one-click `Launch-OMEGA.cmd`.

**Launch:** download the Windows artifact ZIP from a successful `OMEGA7 Windows Portable R881` workflow; extract every file to a writable folder; double-click `Launch-OMEGA.cmd`. The app serves only on `127.0.0.1`; the launcher verifies `/__omega_local_health` before opening Microsoft Edge in application mode (or the default browser). **Launch requires no globally installed Node, Python, npm, admin rights or paid service.** GitHub Actions uses Node 22 and npm to build the ZIP.

**Real tests:** source-SHA-labelled exact ZIP; clean extraction; bundled `node.exe` launches; actual built HTML and hashed asset response; fail-closed HTTP 503 for unavailable backend APIs; startup diagnostics in `%LOCALAPPDATA%\OMEGA7\Portable\logs`. The ZIP is bounded to 160 MiB; oversize fails instead of delivering a silent oversized artifact.

**Unproved and unavailable:** native GPU renderer, model weights, native device control/Hybrid proof, cloud APIs from offline package, signed EXE/MSI, real target-machine physical install, state-preserving upgrade, uninstall/reinstall, exact R470 acceptance. A user launches a local web shell, **not** a full native OMEGA desktop or proof of 100 historical executors.

The background server PID is in `active-session.json`. Stop that PID when finished. The separate `OMEGA7 Windows Portable R881` workflow builds and smokes on `windows-latest` without cloud deployment authority. The main cloud security audit, governed merge, and production deployment gates remain unchanged; this candidate cannot claim to close them. No R2 migration, archive deletion or production mutation is performed.
