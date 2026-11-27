# OMEGA Windows Check

## Run it

In the OMEGA repository folder, **double-click**:

`install/OMEGA-Windows-Check.cmd`

The window stays open and gives one of two results:

- **READY**: The basic Windows, Python, Git-source and GPU-controller observation checks passed. This is **not** proof of an installed OMEGA app, functioning GPU computation, or a paired PC agent.
- **NEEDS ATTENTION**: It displays the specific missing or mismatched requirement in plain language.

No SHA copying, command-line arguments, manual JSON inspection, admin privileges, cloud pairing, installation or registry changes are necessary.

The check creates `omega-windows-check.json` in the repository folder for exact provenance and machine-readable diagnostics. The JSON is SHA-256 integrity checked, but not signed hardware attestation.

If Git or Python 3.10+ is missing, the launcher explains the dependency. The repository must be an actual Git checkout, not a source ZIP, because the exact canonical Hybrid Link source blob is verified through Git. It checks the commit currently checked out; that establishes local source consistency, **not independent approval of that commit**.

## Alternative: PowerShell

From the repository folder:

```powershell
.\install\run-r895-windows-preflight.ps1
```

An advanced verifier can still bind the check to an independently approved revision using `-ExpectedCommit <40-character-sha>`, or choose a report location with `-Output <path>`. Neither option is needed for ordinary use.

## What it actually checks

The utility observes Windows, Python version, locally reported GPU controller metadata, clean Hybrid Link source files, exact checked-out Git revision, and the immutable canonical R205 **Git blob** digest. It distinguishes Windows line-ending conversion of the working file from Git-object bytes rather than misreporting checkout conversion as canonical source mutation.

An absent or mismatched requirement reports **NEEDS ATTENTION** and a nonzero held status. The resulting JSON has the detailed facts.

This read-only check never runs the native installer or a GPU compute workload. It never starts the Hybrid Link agent or pairs the machine. R470 installer lifecycle proof, R141 paired execution return, GPU workload/readback, and R125 Canon admission still require their actual authoritative evidence.

## Automated regression

`npm run test:r777` exercises the source and launcher invariants. The existing Cloud Bridge Windows runner also executes the PowerShell preflight on a real Windows CI machine. A CI runner is not the user's PC.
