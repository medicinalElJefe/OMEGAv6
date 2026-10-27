# OMEGA capability acceptance ledger — R626/R627

This ledger separates source presence, candidate execution, exact-head CI, merged code, deployed code, live desktop/mobile operation, native-device proof, and full historical parity. It is **not** a completion certificate.

## Last independently verified production baseline

- Main merge SHA: `be4b067009b413ac9766c43b6070e8fd59b3b281` (PR #1158).
- Production workflow: https://github.com/medicinalElJefe/OMEGAv6/actions/runs/40455343295 — verify, deploy-main, post-deploy-authority-closure all succeeded.
- Cloudflare Worker version: `347202ff-7cf1-4526-adfd-1f353ba0bc56`; prior version `26afc39a-c1bf-4241-b179-c1ed870b988b` is rollback-eligible per release log.
- R223 exact-SHA authority closure: workflow `40456997306`; desktop/mobile R525, R623, R625, R705 and other named live steps passed.
- Native Hybrid devices: **zero authenticated public devices** in live authority logs. No native execution claim.

## Candidate capability evidence — PR #1160 (not yet production)

| R474 lineage / feature | Actual executor | Candidate UI / output | Test gate | Current acceptance |
| --- | --- | --- | --- | --- |
| TRAVERSAL / FORECAST_LAE source model | R533 `inspectSourceInstrumentR533` plus R627 bounded successor trace | OMEGA7 Atlas → read-only source execution; 1–12 real corpus transitions with decision, continuity, scar, contradiction and successor | R552 via `npm run test:r525`; R525 desktop/mobile browser | SOURCE IMPLEMENTED; exact-head CI and live promotion pending |
| R618 source-bound historical band traversal | R618 signed address traversal | Existing bounded traversal receipts | R618 adversarial mutation tests | R626 source repair; production pending |
| SPHERE / ATLAS visualization | R525 / R533 source model | OMEGA7 Atlas and Full Sphere | Existing R525 browser | Previously live-tested subset; full historical renderer parity unverified |
| HYBRID native executor | Device-gated R237/R238 | OMEGA7 Hybrid status and proof refusal | Existing live R237/R238 | DEVICE PROOF REQUIRED |
| WORKBOOK original private source | R621 exact original-byte command | Existing fail-closed CLI / source intake | R621 negative-path tests | Positive original-byte command execution unverified (issue #1152) |

## R627 source-model developmental derivatives (candidate only)

- The bounded R533 successor executor now computes first and second finite differences of **continuity**, **future plasticity**, and **scar** from adjacent actual corpus-model samples. The first frame has no first difference; the first two frames have no second difference. Missing samples are represented by `null`, never invented zeroes.
- The OMEGA 7 trace UI shows continuity and scar changes and labels the quantities as *per source-model successor*, not physical time derivatives. Typed receipts retain all six computed values for inspection.
- R552 regression compares every derived value against its adjacent source samples and checks nested receipt immutability. This is source arithmetic and browser-display implementation; exact-head CI, merge, and live proof remain required.
- The previous candidate `e07f531d759e601173bdb47e408e6b2f5a6f324f` failed six of eight workflows after the inherited R552 assertion demanded an obsolete direct R534 call. The current UI correctly delegates through R553, which invokes R534 and stores bounded local execution history. The assertion was repaired to verify that actual delegation and receipt propagation. **This repair has not yet passed final-head CI.**

### R627 admission rules

- **PRUNE:** reject invalid steps, invalid address, unsupported executor, missing source successor, and any claimed native/physical/empirical proof from a model trace.
- **TRANSLATE:** map actual source-model successor states into a human-readable, bounded OMEGA7 trajectory; preserve scar/contradiction and typed source identity.
- **PROVE:** R552 source regression + R525 desktop/mobile browser execution, all eight exact-head workflow families, governed merge, exact-SHA Worker deployment, R237/R238/R223 live authority, and rollback eligibility.
- Representation: 20,736 addresses are a 12^4 indexing instrument; no assertion of 20,736 physical dimensions or empirical time travel.
- R2 migration is canceled. Do not activate billing, upload to R2, or delete any original/backup.

## Outstanding acceptance

1. Eight required workflows must pass on **the final** PR #1160 head. Earlier green commits do not transfer.
2. Governed merge and exact deployed SHA/Worker version must be independently observed.
3. The R525 live desktop/mobile run must exercise the **new R627** trace, not merely previous R525 functions.
4. Positive R621 original-private-workbook execution, authenticated native-host execution, full historical application executors, original-source renderer fidelity, and complete R474 family conservation remain separate unfinished gates.

No source/test/PR artifact by itself upgrades these entries to production or complete restoration.
