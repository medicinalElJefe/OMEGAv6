# R621 — original-byte-bound historical traversal (local only)

R618 can execute exact bounded address transitions, but its source-bound API receives already-parsed engineering rows. R621 closes the local invocation gap: one command starts from the **original private XLSX bytes**, runs R613 source-fingerprint verification, R612 parsing, R617S pinned ledger validation, and R618 source-bound traversal and receipt verification in that order.

```sh
node scripts/traverse_original_workbook_r621.mjs /secure/path/OMEGA_61917364224D_BUILD_CHART_v18.xlsx --address 429981695 --offset 1
node scripts/traverse_original_workbook_r621.mjs /secure/path/OMEGA_61917364224D_BUILD_CHART_v18.xlsx --address 0 --offset -1 --wrap
```

The CLI is deliberately **read-only**. It emits the source fingerprint, sheet name, coordinate digest, pinned band-ledger digest, bounded traversal receipt and outer digest. It does not emit the original rows, engineering notes, build interpretations or XLSX bytes. A non-original workbook, invalid coordinate, unauthorized wrap, malformed command or tampered ledger fails closed. The original XLSX is never added to this repository or GitHub Actions.

## Evidence gates and limits

- Canonical CI executes input/refusal/privacy tests **without** a private workbook; those passing tests do not prove original-byte positive execution.
- A separate local execution against the actual private workbook is required to establish R621's original-byte positive path. Record only non-private hashes and receipts.
- A GitHub merge does not establish production deployment. Exact promoted SHA, live Worker behavior, OMEGA 7 interaction and rollback remain separate release gates.
- R621 is **representational address execution**. It does not instantiate the full address space, execute historical Substrate/Observer/Renderer/Cinematic modules, prove physical dimensions, mutate Canon, or establish native-host authority.
- OMEGA 7 presentation integration and broader historical capability conservation are subsequent work, not claims of this increment.
