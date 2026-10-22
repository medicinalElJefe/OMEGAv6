# R353 — Release Lineage and Provenance Scars

R353 closes the software/data portion of **R314-B16** and the priority-1 AG-011 / AG-012 archive-genome residual without changing runtime mutation or Canon authority.

## Sources

R353 correlates:
- canonical Git merge lineage and exact production Cloud Bridge run IDs;
- current `/api/release-evidence`, `/api/runtime-attestation`, and `/omega-build-receipt.json`;
- AG-011 Sovereign build proof-history contracts;
- AG-012 B058 decision/correspondence history;
- historical Drive donor titles `FULL_SYSTEM_BUILD_LEDGER.md`, `SHA256SUMS_OMEGA.txt`, and `OMEGA Temporal Field — Master Architecture + Build Ledger`.

Drive file IDs, credentials, and private source locations are deliberately not published into the runtime.

## Authority law

A historical release can be **proved at the time of release** and still be **superseded now**. R353 never converts historical acceptance into present live proof.

The live slot requires all three first-hand bindings:
1. release-evidence source SHA equals R144 attestation source SHA;
2. Cloudflare Worker version matches across both responses;
3. package receipt SHA-256 agrees between the packaged receipt and runtime evidence.

If any binding is absent or contradictory, the live slot is HOLD. External post-deploy verification is not inferred from the public Worker.

## Decision parser and provenance scar

R353 includes a bounded Markdown decision parser and a sanitized AG-012/B058 decision excerpt grounded in the connected correspondence ledger. It retains four historical repair decisions: one renderer packet, one canonical Field authority, exact immutable NOAA frame binding, and the authenticated-execution boundary. Every parsed decision is `HISTORICAL_ONLY` and `currentAuthority=false`.

Each canonical release also retains an append-only semantic scar describing what authority/capability boundary changed. Scars and decision records are historical provenance; they cannot mutate canonical state or revive superseded behavior.

## Preserved authorities

R125 CanonState admission, R141 exact Hybrid return proof, R146 durable execution history, R147 dispatch, R210 live truth refresh, R240 source promotion, and `ci.yml` production deployment remain unchanged.
