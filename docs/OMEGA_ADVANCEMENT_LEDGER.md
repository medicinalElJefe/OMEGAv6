# OMEGA Advancement Ledger

The canonical, continuously updateable human-readable advancement ledger is GitHub issue **#435**:

https://github.com/medicinalElJefe/OMEGAv6/issues/435

The deployed Worker exposes a stable ledger index/policy at:

https://omegav6.jeffdeweyeljefe.workers.dev/omega-advancement-ledger.json

The deployed JSON is intentionally an index and policy contract, not a frozen copy of the latest release state. The GitHub issue is updated after production proof so recording a completed deployment does not itself require another deployment.

## Mandatory completion contract

Every completed OMEGA advancement must publish:

1. revision and purpose;
2. exact candidate SHA and canonical merge SHA;
3. pull request link;
4. CI and production workflow link;
5. deployed Worker version when applicable;
6. canonical runtime and relevant live proof links;
7. concise description of what changed;
8. explicit list of what was proven;
9. every remaining residual or failed post-deployment check;
10. the next governed build boundary.

`DEPLOYED` is not equivalent to `RELEASE_CLEAN`. A required red post-deployment proof remains visible until repaired and independently re-proven.

A concurrent or superseded candidate must be recorded and closed rather than silently merged over a newer canonical lineage.

The advancement ledger is an operational provenance surface only. It does not grant execution authority, prove current PC presence, establish scientific truth, mutate CanonState, replace durable R146 execution history, replace R147 dispatch authority, or replace R125 admission.

## Production baseline at R207.3 creation

R207.2 is production-proven at canonical merge `3935eacd40297af8b365b6c8a371164da4ed21c3`, PR #434, production workflow `34177695039`, Worker version `a5a7fda4-376f-4749-9ad2-383a213b88e4`.

Its required production gates all passed, including live R202/R205/R206/R206.1/R207.2 verification, exact immutable R205 base SHA-256 `49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046`, R141 wrapper SHA-256 `5f48b5ef6c51a0dd4c92bffe1d5ca0ecd639d0794f05f7fd5ca3082093ab6f86`, canonical R207 agent SHA-256 `0afd227389bcbebdb8c1aac6601c366064fcd87ba8ffe46df3427ef886a44b54`, Federation/RCWA, Earth/NOAA/ground, real Workers AI, R199 execution-control proof, and exact promoted-SHA desktop/mobile browser proof.

See issue #435 for the current append-only release record and subsequent revisions.
## R937 active build completeness ledger (candidate scope, not release proof)

The current active, enforceable source inventory and restoration debt registry lives at [`audit/omega-active-full-build-ledger-r937.json`](../audit/omega-active-full-build-ledger-r937.json). The companion `tests/r937-active-build-ledger-invariants.mjs` is part of `npm run test:r926`, inherited by the repository build checks. It fails closed on dropped software, controls, stages, bins, archive-distribution identities, workstreams, proof gates or outstanding obligations. The source ledger appears in OMEGA7's System Atlas / Control Matrix workspaces under **Open governing build ledger**.

This candidate ledger tracks twelve conserved workstreams and twelve release gates without upgrading status beyond evidence. Archived names and Drive metadata do not constitute verified ZIP bytes; live PC/GPU/provider/model proof remains independent. **The canonical advancement record is still issue #435, and only a governed merge plus exact deployed-SHA production and rollback proof can update its release-clean entries.** No predeployment PR commit is release-clean.
