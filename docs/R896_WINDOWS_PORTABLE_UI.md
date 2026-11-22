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
