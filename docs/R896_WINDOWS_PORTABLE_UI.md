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

## Integrated Windows local worker executable (R898)

The same portable package now includes a **portable Windows executable**
`OMEGA-Local-Hub/OMEGA-Local-Hub.exe`, plus its bundled runtime files,
compiled from the existing governed R881 Python Hub.
The R884 ten-ledger verifier is bundled in that executable for the Hub's
`VERIFY_LEDGER_SET` operation. The source scripts remain included for audit
and byte-identity checks. The normal UI and the compiled Hub require **no
Python, Node, Git, package manager, or administrator installation** on the
operator's Windows machine. The worker uses a portable directory build so
it does not self-extract an entire bundled Python runtime into the system
temporary directory on launch; keep its companion files intact.

For a single entry point to the local studio and bounded worker, double-click
`OPEN-OMEGA-INTEGRATED.cmd` and supply the existing approved non-system
project root when prompted. That launcher delegates to `Start-OMEGA-Integrated.ps1`, which verifies the
entire package, refuses system-drive roots and junctions, authenticates the
compiled Hub's live loopback endpoint with the private local token, and only
then opens the existing OMEGA7 UI. The supervisor keeps the worker within the
same session lifecycle and stops it when the supervised studio session ends.
Windows CI also performs a combined real-HTTP startup self-test. No
Python/Node install or administrator elevation is needed. Pairing to the
canonical cloud Hybrid Link still requires the application's explicit
authenticated connection flow.

Double-click `OPEN-OMEGA.cmd` to open the local OMEGA7 interface.
For bounded local jobs, double-click `OPEN-OMEGA-HUB.cmd`, supply an existing
approved non-system project folder, and keep its window open. In the UI's
Local / Edge Hub, enter the access token from that root's private
`.omega/hub-r881.token` file. The worker uses only
`127.0.0.1:8765`. Approved operations include bounded file hashing,
CSV statistics, manifest export, ten-ledger verification and recorded
copy operations; arbitrary shell commands remain unavailable.

The GitHub Windows CI package job actually starts the compiled EXE,
authenticates over HTTP, proves missing/incorrect-token refusal and an
ephemeral loopback origin, completes a bounded HASH_TREE task, and checks its
returned SHA-256 receipt. The EXE compilation and runner tests do **not**
prove Hybrid Link pairing on the operator's PC, a native GPU workload,
cloud authority, a signed installer lifecycle or full offline AI inference.
That separate authority remains governed by R125/R141/R146/R147/R237.

## R899 bounded local AI inference

The existing R881 durable Hub exposes an operator-submitted `LOCAL_INFER`
operation. It makes one bounded request to an **already installed and running**
Ollama model on `127.0.0.1:11434`. In the OMEGA7 Local / Edge Hub panel,
select `LOCAL_INFER`, authenticate the local Hub, use **Find installed local
models** to read the current Ollama `GET /api/tags` inventory through the
same token-protected loopback service, choose a model and prompt, then submit
the job. No arbitrary inference server URL, remote provider, shell
operation, model download, or training command is permitted. The request has
an 8,192-character prompt ceiling, 512 generated-token ceiling, fixed
45-second network timeout, and 64 KiB response cap. It never follows HTTP
redirects. The returned output is durable job data and inherits the existing
SQLite receipt, event gate, and crash recovery semantics.

`omega_local_inference_r899.py` is bundled as source for audit and inside
the compiled Windows worker. Tests use a local fake HTTP model server to prove
real request/response plumbing, strict model identity and completion checks,
invalid payload refusal, unavailable backend holds, and remote redirect
refusal. No unit test represents a downloaded/trained language model or GPU.
Without a local running Ollama server, `LOCAL_INFER` is held and produces no
fabricated result. Operator prompts and returned text are kept in the
approved root's local job database; do not submit sensitive information
unless that local persistence is intended.

### R899 compiled-Windows end-to-end model proof

Windows Cloud Bridge CI now starts the actual packaged `OMEGA-Local-Hub.exe`
and a deterministic **test-only** Ollama-shaped HTTP fixture bound to
`127.0.0.1:11434`. Using the Hub's authenticated loopback API, the test
discovers the installed fixture model, submits a `LOCAL_INFER` job, waits
for its completed SQLite receipt and SHA-256, and verifies that the response
text is the exact data returned over HTTP by the fixture. Both processes are
stopped in the test cleanup. This proves that the compiled executable includes
and executes the actual adapter and durable job path; it does **not** prove
model quality, target-machine inference performance or native GPU use.

## R900 managed per-user Windows installation

The tested portable ZIP also includes `INSTALL-OMEGA.cmd`,
`UNINSTALL-OMEGA.cmd`, `Install-OMEGA-Windows.ps1` and
`Uninstall-OMEGA-Windows.ps1`. The installer verifies the source ZIP
contents against the full SHA-256 manifest, copies them into a fresh staging
directory, verifies the staged bytes, and replaces only an existing installation
that carries a matching managed ownership marker. Existing managed versions
are renamed to a rollback directory before cutover. No administrator access
or Python/Node installation is needed. Default installation is under the
current user's `LOCALAPPDATA/OMEGA7` with an optional Start Menu entry.

The uninstaller asks for explicit confirmation, checks its management marker
and the installed file manifest, then deletes **only** the OMEGA7 application
folder and its management marker. Unknown files or changes block automatic
removal; the separate approved project/SQLite/model root is not removed.
Reparse points and junctions in install/uninstall paths are refused.

Windows CI exercises the fresh installation, verified managed upgrade,
unrecognized-target refusal, tampered-target uninstall refusal, and successful
uninstall while proving adjacent project files survive. It is a **CI runner**
installer lifecycle proof, not certification on the user's actual Windows 10
host, not Hybrid Link acceptance, and not production release authorization.

## R901 actual Windows local observation receipt

The package includes `CHECK-OMEGA-PC.cmd` and
`Check-OMEGA-Windows.ps1`. Running it **on the operator's Windows computer**
rechecks the entire SHA-256 package, starts and requests the actual
`127.0.0.1` OMEGA7 UI, checks whether the compiled Hub EXE is present,
and queries the local Windows video-adapter inventory via CIM. It also
probes the installed Ollama model listing only at fixed
`127.0.0.1:11434`, rejecting redirects. The resulting JSON observation
receipt is written outside the package to the current user's
`LOCALAPPDATA/OMEGA7-Evidence` directory; it does not alter any project
root or install. Evidence includes source commit, local HTTP result,
visible adapter descriptions and driver versions, and non-promoted
acceptance flags.

This is **not** authenticated R141/R237 native-host acceptance, a GPU
compute workload benchmark, proof that local AI inference completed, or a
digital signature. In particular, `nativeGpuWorkloadProven=false` and
`physicalPcAccepted=false` are fixed even when Windows exposes a video
adapter. Real target-PC execution must occur on that PC; a CI runner cannot
satisfy it. The Windows pipeline tests the diagnostic and its refusal
boundaries but cannot create actual customer-device evidence.

## R902 executable 20,736 × 20,736 nested state space

The authentic OMEGA Local / Edge Hub now provides `SPHERE_TENSOR_STEP`.
It executes a deterministic integer-conserving operator on a **sparse,
implicit matrix** with 20,736 addressable cells, each with 20,736 state lanes
(`12^4 × 12^4 = 429,981,696` possible components). Every cell's state
can differ. Each update retains one-half of a component's mass, shifts
one-quarter to its neighboring cell along one base-12 axis, and shifts
one-quarter into the neighboring local state lane. Axis shifts wrap within
their own base-12 digit, never carry into adjacent coordinates.

The operator does **real local work** from explicit operator-provided
integer seeds. Exact conservation is checked after every step. Its complete
nonzero final state is canonically hashed into `fullStateSha256`; only the
first 32 sorted components are displayed, preventing unbounded output.
Run limits: no more than 128 seeds, 8 steps, 100,000 nonzero components and
1 quadrillion integer-mass units. To ensure integer conservation, every
seed's mass must be divisible by `4^steps`. All failures refuse rather
than silently approximate. Successful computation is stored in the original
authenticated R881 SQLite job ledger with its own overall SHA-256 receipt.

The runtime does **not** allocate 429,981,696 dense elements, and does
not claim that each cell is a separately trained AI model, nor that GPU
hardware executed the job. Those remain separate engineering requirements.
The CI Windows executable actually submits an R902 job and verifies its
conservation and receipt; independent CPU unit tests cover boundary wrapping,
repeatability, and invalid requests. It is a functional foundation for
nested-state computation, not calibrated physical simulation.

## R904 export the complete computed 20,736D nested-state slice

Choose `SPHERE_TENSOR_EXPORT` in the Local / Edge Hub, supply the same
bounded cell, lane, mass, and step inputs as R902, and give a **new relative
.csv path inside the approved project directory**. The existing
authenticated R881 Hub computes the exact sparse state, writes all resulting
nonzero cell/lane/mass rows in sorted order, and returns an observed file
receipt with SHA-256, row count, the R902 complete-state digest and an
independent durable job receipt. The full CSV is not clipped to the UI's
32-component preview. A preexisting file, private `.omega` path, traversal,
invalid tensor or failed filesystem write is held; the Hub does not
overwrite previous exports. This is an inspectable sparse-state computation,
not a 429,981,696-row dense materialization or evidence of GPU calculation.

The packaged Windows EXE test now submits a real export job, checks the
full file SHA, component count and mass against the separately run R902
result, and verifies that a second export to the same destination is held.

## R897 full-package integrity guard

`OPEN-OMEGA.cmd` now runs `Verify-OMEGA-Package.ps1` before opening the
studio. The bundled `OMEGA-PACKAGE-EVIDENCE.json` includes a SHA-256 and
byte count for **every** packaged file except the evidence manifest itself.
The verification refuses missing, altered, unexpected or duplicate files,
unsafe relative paths, and junction/symbolic-link content. A Windows CI test
changes a built `index.html` byte stream, proves refusal, then restores it
and proves successful verification. The normal UI remains free of installed
Python or Node dependencies.

The manifest is **not digitally signed**; it detects modification relative
to the manifest but cannot authenticate a manifest that an attacker has also
replaced. Source provenance comes from GitHub's checked-out SHA and workflow
artifact evidence. It does not establish physical-PC or installer acceptance.

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
