# OMEGA Windows Portable Studio (R896)

## Open OMEGA, not just a diagnostic

The download built by the OMEGA Cloud Bridge CI workflow is named
**OMEGA-Windows-Portable-R896**. Download the GitHub Actions artifact,
extract it once to a folder, then **double-click `OPEN-OMEGA.cmd`** in
that folder. There is no second nested ZIP.

The application opens in the default browser from a local
`http://127.0.0.1:<temporary-port>/` server. Keep the launcher window
open while using OMEGA. Closing it stops the server.

**The operator needs no Git, Python, Node, package manager, account
pairing, administrator setup or installer.** This is a standalone *portable
browser-interface package*, not a native `.exe` or installed Windows
application.

## What is local vs connected

The ZIP carries the production-built OMEGA7 interface and its assets,
not a separately-running Cloudflare Worker, native GPU training executor,
or Hybrid Link agent. Client-side computation, UI routes and local browser
storage work within the capabilities of the bundled build. Cloud or backend
features still need their independently governed services. The local
server explicitly returns HTTP 503 for `/api/*`, `/admin/*`, and
`/internal/*` instead of pretending those services exist locally.

It binds only the Windows loopback interface on an automatically chosen
port. Requests are read-only GET/HEAD. Paths are constrained to the
packaged `dist` directory; unknown files return 404, and valid SPA
navigation routes return the entry page. It does not install, elevate,
modify registry settings, pair an account, or contact an external service
of its own accord.

The application may still contain features that make outbound calls when
the user explicitly uses them; this build does **not** certify the entire
application as disconnected or offline-sovereign.

## Optional authenticated local worker (R897)

The same portable package now also contains `OPEN-OMEGA-HUB.cmd` and the
unchanged, governed Python standard-library worker `omega_local_hub_r881.py`.
The normal `OPEN-OMEGA.cmd` UI still needs no Python, Node, Git or administrator
rights. The optional worker requires Python 3.12+ already installed and an
**existing approved non-system project directory** supplied by the operator.
The launcher never silently creates a new project root or installs a runtime.

To use local jobs, double-click `OPEN-OMEGA-HUB.cmd`, select the existing
approved root, and leave its window open. In the OMEGA7 Local / Edge Hub panel,
enter the token located at `.omega/hub-r881.token` inside that root. The
worker binds only `127.0.0.1:8765`. The token must remain private. The browser
panel uses ephemeral credentials in memory only. Each operation is restricted
to the approved root; R195 residual restore remains HELD. Jobs may be queued,
replayed and audited by receipt; arbitrary shell commands are not available.

R896's dynamic browser port is now accepted by the Hub only for exact HTTP
loopback origins; each actual API request still requires the private token and
correct Host header. The Windows packaging proof compares the included Python
worker's SHA-256 with its canonical checked-out source. This is *local bounded
automation*, not native GPU acceleration, authenticated Hybrid Link R141 host
return, unattended installation, model inference, or production acceptance.

## Evidence and release boundary

GitHub Actions builds and tests the ZIP from the exact PR commit.
The existing Cloud Bridge workflow runs a Windows loopback smoke that
opens the packaged interface and proves its route fallback, HEAD response,
missing-asset 404, and fail-closed 503 unavailable API. A source-labeled
`OMEGA-PACKAGE-EVIDENCE.json` accompanies the ZIP.

This is a **candidate UI build**, not a production release, native Windows
installer, GPU host workload, R141 paired return, or R470 lifecycle
attestation. Do not mark those authorities as passed based on ZIP
creation or local UI access.

For a separate real-machine diagnostic, the older
`install/OMEGA-Windows-Check.cmd` remains available; it is not required
to open the portable studio.
