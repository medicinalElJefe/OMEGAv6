# R152 production promotion test plan

1. R152 behavioral invariant test must pass the complete simulated returned-proof lifecycle, including one failed build, bounded source read, SHA-bound exact patch, rebuild/test, package, and explicit COMPLETE.
2. `node --check` must pass for the R152 mission engine and canonical `src/workerR116.js`.
3. R151, R147, R142, R141, R132, R127 and R125 invariant suites must remain green.
4. `npm run check` must pass the complete inherited repository regression and production build.
5. `wrangler deploy --dry-run` must compile the canonical Worker with the existing R116 entrypoint.
6. After merge, the main Cloudflare deployment must succeed and the canonical public runtime must expose the R152 mission header/manifest while preserving the authenticated PC heartbeat and existing R151 execution UI.
7. Only after the deployed R152 runtime is verified should a live `RUN FULL SOVEREIGN BUILD` mission be started from the connected PC surface.
