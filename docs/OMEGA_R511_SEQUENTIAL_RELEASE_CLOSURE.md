# OMEGA R511 — Sequential Release Closure

R511 makes release order executable rather than advisory.

## Required sequence

1. Candidate proves on its exact PR head.
2. Exact-head merge produces the only admissible new main SHA.
3. Only the workflow that still owns current main may mutate production.
4. If a run is superseded before mutation, it retires successfully with zero production authority; supersession is not misreported as a product failure.
5. If supersession occurs during staged release, the release restores/retains the last verified production authority, exports a supersession receipt, and retires successfully.
6. The exact current SHA must pass staged proof, promotion, R200/R510 live browser proof, R202 source authority, R237/R238 Hybrid closure, and deployment receipt.
7. R223 post-deployment authority is dispatched and must complete successfully on the same SHA.
8. Only after steps 1–7 may governed self-build/CLOUD-01 continuation begin.

Real defects remain fail-closed. R511 changes only the classification of legitimate supersession and the ordering of post-deployment continuation; it does not weaken source, deployment, Canon, Hybrid, or proof authority.
