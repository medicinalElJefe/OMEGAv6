# R471 — Production observability closure

R471 does not add a feature or a new authority. It closes an operational visibility gap: after a canonical deployment, OMEGA must leave a durable receipt proving which exact Git SHA the public runtime served.

The verifier compares the promoted merge SHA against the public `/omega-build-receipt.json` and runtime attestation. A mismatch fails closed.

The generated artifact is observation-only. It cannot mutate CanonState, promote a Worker, authorize Hybrid execution, or substitute for the existing live browser and operational proofs.

Completion remains: source proof → merge → deploy → exact live SHA → live browser/feature proof.
