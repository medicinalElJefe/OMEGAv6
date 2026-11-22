# R895 Native Windows / Hybrid Link Host Preflight

This is an executable **local target-machine observation**, not a Windows
installer, paired R141 return, successful GPU compute dispatch, or production
promotion. The canonical Hybrid Link agent remains the independently governed
R207 wrapper plus the immutable R205 base.

## Windows 10 execution

From a clean clone of the exact candidate source with Git and Python 3.10+
available, open PowerShell in the repository and run:

```powershell
.\install\run-r895-windows-preflight.ps1 -ExpectedCommit (git rev-parse HEAD) -Output .\omega-r895-windows-preflight-receipt.json
```

For strict independent verification, specify a known approved 40-character
commit instead of computing it locally. This command **does not** start the
Hybrid Link agent, pair the PC, alter the registry, install software, elevate
privileges, or contact Cloudflare.

The script checks the actual source commit, clean tracked agent files,
published immutable R205 base SHA-256, Python version, Windows platform,
and a local PowerShell CIM video-controller observation. Missing or mismatched
evidence returns code 2 with a JSON receipt whose `status` is `HOLD`;
a malformed source checkout or arguments returns code 3. A passing preflight
returns 0 with `READY_FOR_PAIRED_HOST_PROOF`, **not** native runtime proof.

The output includes `receipt_sha256` computed over sorted, compact JSON
excluding that field. This detects accidental and adversarial modification
of the receipt *after collection*, but is not an authenticated signature,
a hardware attestation, or proof that a reported GPU supports compute.

## Remaining authoritative host sequence

The local host must separately demonstrate R470 clean installer lifecycle:
package SHA, exact source SHA, clean install, first launch and health,
state-preserving upgrade, relaunch, uninstall, clean reinstall, and version
reconciliation. A real paired Hybrid Link R141 return is required for
`VERIFIED_EXECUTION_RETURN`; an actual measured GPU workload/readback is
required for GPU-compute proof. Preserve R125 Canon admission and R170/R237
release gates. Do not promote these statuses based on this preflight alone.

## Local testing

```powershell
py -3 tests\r895-windows-host-preflight-invariants.py
```

The integration regression is automatically executed by
`npm run test:r777` and the inherited OMEGA release checks. On non-Windows
CI hosts, fixture tests explicitly return `HOLD` rather than impersonating
the target machine.
