# R354 · Proof-Bound Scene Convergence

R354 is the first composition layer that binds the already-proven R349–R353 chain into one scene-level receipt without introducing a competing authority.

## What it binds

1. **R353 current runtime lineage** — exact source SHA, Worker version and package receipt must agree before the scene can be marked `CURRENT_RUNTIME_BOUND`.
2. **R350 deterministic replay** — the selected integer model tick is reconstructed from the nearest prior checkpoint and declared step receipts.
3. **R351 packet/frame identity** — the replayed 20,736-address field becomes the exact 20,736×9 packet mirror plus deterministic frame receipt.
4. **R352 derived render state** — the packet bytes bind to the CPU reference render-state input/output and shader hashes.
5. **Optional WebGPU return** — a GPU result strengthens the receipt only when R352 returns verified CPU↔GPU correspondence and the returned CPU output hash exactly matches the scene's bound render output.

The resulting `sceneDigest` is SHA-256 over the complete bounded receipt. A change in release provenance, model tick, field hash, packet mirror, render transform, or accepted GPU correspondence changes the digest.

## Authority boundaries

R354 is read-only composition and proof correlation. It does **not** create observed history, physical simulation truth, CanonState admission, durable execution history, Hybrid exact-return authority, dispatch authority, or production authority.

- R125 remains sole CanonState admission authority.
- R141 remains exact Hybrid-return proof authority.
- R146 remains durable execution-history authority.
- R147 remains dispatch authority.
- `ci.yml` remains production promotion authority.
- 20,736 remains a computational/address resolution, not a literal physical dimension.
- `NO_NEW_PHYSICAL_PRIMITIVE` remains enforced.

## Human meaning

The Convergence surface can now answer one concrete question for a displayed model scene: **which current runtime, which replayed field state, which packet representation, and which render transform produced this receipt?** If current runtime provenance cannot be returned first-hand, the model receipt remains visible but is explicitly held as `MODEL_ONLY_HOLD`.
