# R316 Cloudflare Builder Control Plane

R316 adds a second Cloudflare Worker named `omega-v6-builder` to assist the OMEGAv6 self-build process without becoming a competing source, Canon, merge, GitHub-workflow, or production authority.

R316 is intentionally separate from the already-established **R314 numerical-compute authority** and R315 Woven state-evolution lineage. The Builder uses R316 so revision identity remains unique and unambiguous.

## Role

The Builder is **advisory**. Its role is:

`OBSERVE -> CORRELATE -> LEDGER -> ADVISE`

It observes the exact current GitHub `main`, canonical `ci.yml` production proof, open autonomous self-build candidates, the public OMEGAv6 core-health boundary, and the direct Cloudflare service binding to `omegav6`. It then derives a deterministic `STAY`, `TURN`, or `ESCALATE` recommendation and persists an evidence receipt.

The Builder does not edit GitHub source, open or merge pull requests, admit Canon state, deploy the canonical OMEGAv6 Worker, or claim private-PC/native execution.

## Preserved authority

- **R125** remains sole CanonState admission authority.
- **R147** remains dispatch/executor-selection authority.
- **R146** remains durable execution-history authority.
- **R141** remains exact Hybrid return-proof authority.
- **R170/R240** remain governed source self-build and exact-source-promotion authority.
- **R314** remains the existing numerical-compute authority; R315 remains its Woven evolution successor.
- **`ci.yml`** remains the canonical OMEGAv6 production deployment writer and the only GitHub workflow allowed to deploy the Builder.
- Retired R201/R203 Durable Object tombstones remain retired.

The Builder is therefore not a shadow authority. It is an evidence-correlation membrane around the existing authority chain.

## Cloudflare topology

`omega-v6-builder` contains:

1. A public Worker API with `/api/health` and `/api/status`.
2. A direct `OMEGA_CANONICAL` service binding to `omegav6`.
3. A **SQLite-backed Durable Object** named `OmegaBuilderLedger` that retains bounded build receipts.
4. A **Cloudflare Workflow** named `omega-v6-builder-cycle` scheduled hourly at minute 7.
5. Public GitHub observation of `main`, `ci.yml` workflow runs, and open PRs. GitHub access is read-only.
6. An optional authenticated `/api/run` endpoint. If `OMEGA_BUILDER_TOKEN` is not configured, this endpoint remains fail-closed while the scheduled Workflow continues to operate.

The hourly schedule above is a Cloudflare Workflow schedule declared inside `wrangler.builder.jsonc`; it does not add another recurring GitHub Actions workflow authority.

## Decision law

The Builder evaluates the following in sequence:

1. GitHub exact-main source observation must succeed.
2. The canonical public `/api/core-health` boundary must be first-hand healthy.
3. The direct Cloudflare service binding to canonical OMEGAv6 must also be healthy.
4. The exact `main` SHA must have a successful canonical `ci.yml` push/workflow-dispatch proof.
5. At most one governed autonomous candidate may be open across the R170/CLOUD-01 branch families.

The resulting decision is:

- `ESCALATE` when source observation fails, canonical runtime is unhealthy, or the one-candidate fence is violated.
- `STAY` when exact-main production proof is missing or a governed candidate is already in flight.
- `TURN` only when exact-main production proof and both canonical health paths are green and no governed candidate is already open.

A `TURN` means only that R170 may propose one bounded candidate. It is not approval to merge, deploy, or admit Canon state.

## Woven continuity interpretation

R316 implements the build-control form of Woven Continuity:

`partition -> observe/exchange -> invariant carry -> scar/residual carry -> re-contextualize -> next governed decision`

The invariant carry is the preserved authority chain. The scar/residual carry is the receipt history retained in the Builder ledger. Representation/address scales remain software/atlas resolution levels and are not treated as literal physical dimensions.

## Deployment law

R316 does **not** add a new GitHub workflow authority. Builder proof and deployment are converged into the existing `.github/workflows/ci.yml` authority.

On pull requests, canonical CI runs the R316 invariant test, Worker syntax check, and `wrangler.builder.jsonc` dry-run. On an exact two-parent merge promoted to `main`, the existing `deploy-main` job deploys the canonical `omegav6` Worker, the isolated SAI doorway, and the auxiliary `omega-v6-builder` Worker under the same governed Cloudflare authorization boundary. It then verifies both the canonical runtime and Builder runtime first-hand and records both outcomes in the deployment receipt.

This preserves the R170 governed maximum of 24 active GitHub workflow authorities and avoids `workflow_run` fan-out while still allowing the Cloudflare-hosted Builder Workflow to run hourly after deployment.

Every deploy must verify:

`https://omega-v6-builder.jeffdeweyeljefe.workers.dev/api/health`

A GitHub source merge is not evidence that this URL is live. Live state requires direct HTTP verification.

## Cross-chat / auto-update continuity

Future OMEGAv6 build, repair, research, or auto-update passes should treat this file plus `AUTO_UPDATE_CONTRACT.md` as canonical continuity evidence. They should read Builder status when available and use its latest receipt as an additional correlation input, never as a replacement for first-hand GitHub, Cloudflare, Hybrid, device, scientific, or Canon proof.
