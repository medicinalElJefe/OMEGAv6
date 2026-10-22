# R622 — Desktop/mobile RH graph browser acceptance

`tests/r622-historical-rh-graph-browser-e2e.mjs` opens OMEGA's actual Visual Instrument route on **desktop (1440×900)** and **mobile (390×844)**. It opens the R621 Historical RH Graph, confirms the explicit partial-source disclosure, and exercises both original-source edges E00001 and E00002.

For each edge it sets the exact original source address, verifies the rendered historical type and weight, clicks the actual traversal button, checks the canonical workspace address changes to the original destination, and verifies persistence to `omega.v6.address` in localStorage. It also tests the no-embedded-edge disclosure, close/unmount behavior and uncaught browser errors.

```sh
OMEGA_E2E_URL=http://127.0.0.1:4173 node tests/r622-historical-rh-graph-browser-e2e.mjs
```

For **production exact-SHA admission**, also set `OMEGA_EXPECTED_SHA` to the exact 40-character promoted merge SHA; the test then requires the live `/omega-build-receipt.json` to attest both source and promotion fields. An unset SHA means local browser interaction only, not production deployment proof.

This test is added to the repository but must be run against an actual served OMEGA build; a passing static verify workflow alone is not equivalent to the Playwright result.
