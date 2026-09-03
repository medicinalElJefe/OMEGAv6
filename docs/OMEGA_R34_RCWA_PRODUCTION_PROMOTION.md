# OMEGA R34 / Sovereign RCWA R3 — Production Promotion

This promotion commit exists to preserve OMEGA's governed release lineage after the CI-green R3 implementation landed on `main` through a squash commit.

Candidate implementation head already on main: `cc7fe22606c626978c6bc7ea6ca1fdd74121d2d3`.

Production promotion must occur through a real two-parent merge commit so the deployment workflow can bind:

- rollback parent,
- candidate parent,
- promoted merge SHA.

No solver behavior is changed by this receipt. It exists solely to create an auditable promotion edge without weakening the existing two-parent release-evidence gate.

The promoted R34 runtime contains authenticated full-wave RCWA queue transport and a real `grcwa`-backed Sovereign worker. A live Sovereign solve is not claimed until an authenticated host worker returns an `OMEGA_RESULT_v1` result packet. FDTD and FEM remain planned.
