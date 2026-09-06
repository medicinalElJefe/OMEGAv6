# R127 Hybrid production acceptance

R127 is eligible for production only when all of the following are true:

- R127 zero-drift invariants pass.
- Published connector contract invariants pass.
- R94/R101/R112/R121 inherited Hybrid/Earth/navigation contracts pass with R127 accepted only as an additive successor.
- The complete inherited `npm run check` succeeds.
- Cloudflare Wrangler production dry-run succeeds.
- The branch is converged with current `main` without deleting newer evidence/calibration/runtime authorities.
- The merged `main` deployment succeeds.
- The public canonical Worker returns the R127 connector manifest and an agent download whose `x-omega-agent-sha256` equals SHA-256 over the response body.
- `/api/hybrid/status` does not claim native execution without a current authenticated device heartbeat.
- A real Windows connector run proves register + accepted heartbeat before the UI reports PC ONLINE.

Repository/CI proof cannot by itself prove the user's physical PC is connected. That final state requires the live paired agent heartbeat from the machine.
