# R826 — Original RH graph: positive private-browser import witness

## Evidence and privacy boundary

R823–R825 prove original-source refusal and desktop/mobile behavior using
synthetic and forged fixtures. They do not prove that the actual source
workbook was positively imported through the production browser.

R826 adds an explicitly opt-in local browser test. The original workbook
must remain on the trusted computer. **Never** commit it, upload it as a
GitHub Actions secret or artifact, or provide an externally accessible URL
to it. This test prints hashes and aggregate counts, not rows, donor names,
local paths or workbook bytes.

### Running against an exact deployed build

Install the existing repository dependencies and pinned Playwright Chromium
on the trusted computer where the original XLSX is located. PowerShell
example, replacing the private local path with the actual location:

    $env:OMEGA_RH_ORIGINAL_XLSX_PATH = 'C:\PRIVATE\original-v21-RH-graph.xlsx'
    $env:OMEGA_E2E_URL = 'https://omegav6.jeffdeweyeljefe.workers.dev'
    $env:OMEGA_EXPECTED_SHA = '2b37567e7ea91c152dffef24ce87763b46472b78'
    npm run test:r826:private

For a local Vite preview, use http://127.0.0.1:4173 with the exact built
commit SHA exposed in its omega-build-receipt.json. R826 refuses
arbitrary remote origins. The expected SHA must be read from the
actual promoted build receipt; never claim a branch is deployed merely
because it has a passing source CI.

Before Chromium starts, the test reads the original local XLSX and checks
the exact 2,150,619-byte length and whole-file SHA-256
1daa73b90ab07453141056e74db1a5488232ef871eef83033f1aa0f5d45631a5,
using constants from the actual R823 source module. It also checks that
the public build receipt binds both source and promoted-merge SHA to
OMEGA_EXPECTED_SHA, before and after the browser run.

### First-hand browser acceptance

For desktop 1440x900 and mobile 390x844 Chromium viewports, R826:

1. Opens the actual Create → Visual Instrument → Historical RH Graph
   route, requiring initial PREVIEW_ONLY disclosure.
2. Selects the original private XLSX in the browser file input, requiring
   VERIFIED_FULL_LOCAL with 320 conceptual identities, 25 distinct state
   addresses, and 416 typed edges through the existing R153 parser and
   R823 source audit.
3. Proves original E00001 antipode-state traversal at address 5990; filters
   prerequisites and proves E00011 at address 18602 with canonical
   traversal to address 18086.
4. Clears the local graph and requires PREVIEW_ONLY and no full-graph data.
5. Reimports the actual source, reloads, and requires PREVIEW_ONLY, proving
   no persisted original workbook across a reload.
6. Refuses non-GET/HEAD network activity or oversized URLs while importing.
   This is a directly observed no-write request assertion, not a proof
   against every imaginable network exfiltration channel.
7. Refuses page runtime errors. Prints counts and fingerprints only.

A passing original-positive test binds the **real browser-local import**
to the exact promoted SHA. It is not a claim of R125 Canon admission,
physical Windows AT09/AT10 host result, original SQLite or native recovery,
or complete R650 twelve-family historical parity.

### Standard CI, not a substitute for the private test

npm run test:r826 validates only syntax and source guard invariants without
any original workbook. It runs in ordinary npm run check. The genuine
file-bearing test npm run test:r826:private is deliberately excluded from
CI and cloud deployments. No donor bytes or private proof artifacts are
automatically uploaded.

A source change still needs all inherited exact-head CI workflows, a
guarded mainline merge, 100% promoted Worker, live source/browser proof,
R223 sequential SHA closure and rollback eligibility. The existence of
the private test script is **not** evidence it has been executed.
