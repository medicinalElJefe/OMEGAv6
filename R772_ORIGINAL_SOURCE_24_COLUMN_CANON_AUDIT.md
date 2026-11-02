# R772 — Original corrected Full Overall Canon: complete 24-column reconstruction

## Independent original-byte retrieval and full source audit (2026-11-02 UTC)

The user-owned stored **full_overall_canon_12pow5_teal_water_atlas_CORRECTED.xlsx** was retrieved read-only from the connected original Google Drive archive. The complete original workbook was **29,448,070 bytes** and SHA-256 **e1ccb57cdfbc78955dd6e86be110cdb91cb15a0cc78a869b74dca7e4ffa55af3**, independently identical to the pre-existing R761 declared original workbook digest. ZIP/OOXML integrity passed. **Do not add these original private source bytes to the public repository.**

A streaming read-only parser audited the original `Full_Atlas_248832` sheet, which holds **248,832 data rows and 24 original fields**, and compared each numerical source value with the reconstructed R761 rational model after four-decimal **storage normalization** (an XLSX stored `0.5` is the same stored four-decimal field as R761's `0.5000`).

- Original normalized **nine-field** numeric/index/decision SHA-256: **c5560df0a6967013a46d6eb5c286298b01961329427469568407cc8a6c65eb35** — exact match with pre-existing R761 digest and **zero** row-field mismatches.
- Source decision classes: STAY **73,214**, TURN **111,786**, ESCALATE **63,832**.
- Original **fifteen-field** semantic-only SHA-256: **9d9e8acc0cb5670d610c168cddb845e1f7e70366f485f85503746180e762d18e**.
- Independent extracted-versus-reconstructed semantic audit: **3,732,480 individual text fields**, **zero mismatches**.
- Exact complete record: 24 original column names, 12 ordered labels for each of Domain, State, Relation, Motion, Perspective; a 12x12 Domain Skin vocabulary; 12 core principles, 12 relation skins, 12 motion skins, 12 perspective skins and 12 water names; original textual compositions; all original numeric source/model fields and decision/band.

## Compact semantic reconstruction (validated on every original source row)

Let `d,s,r,m,p` be zero-based indices in 0..11. Use original source vocabularies, not random replacement labels.

- `Principle_Core = Principle[(s+r+m+p) mod 12]`
- `Domain_Skin = DomainVocab[d][(s+r+p) mod 12]`
- `Water_Geometry_Teal = Water[(r+m+p) mod 12]`
- `Relation_Skin = RelationSkin[r]`; `Motion_Skin = MotionSkin[m]`; `Perspective_Skin = PerspectiveSkin[p]`
- `Mirror_Statement = Core + ' as ' + DomainSkin + ' / ' + RelationSkin + ' / ' + MotionSkin + ' / ' + PerspectiveSkin`
- `Deep_Mother_Field = 'Contain ' + lower(Core) + ' through ' + lower(Water) + ' memory'`
- `High_Father_Field = 'Aim ' + lower(MotionLabel) + ' via ' + lower(RelationLabel) + ' boundary'`
- `Coherence_Band` is the source label of exact three-way `R761` `STAY/TURN/ESCALATE`, not a separately calibrated physical conclusion.

The new `src/proof/canonFullSourceR772.js` executes the reconstructed 24 original columns for any Canon index 1..248832. `tests/r772-full-canon-source-invariants.mjs` recomputes **all** numerical and semantic digests and samples, including rejection of invalid addresses; it is chained to R110's full inherited release test suite. OMEGA7 Science's existing Canon explorer now displays source-matched full records without creating a second state store, with desktop/mobile Playwright assertions.

## Authority boundaries

- The exact original bytes **were found in the user's connected source archive and hashed**, not placed in GitHub. Fingerprint equality and data matching establish **source file identity and exact stored-data reconstruction**; they do **not** authenticate the person who originally programmed the workbook, its actual historical calculation algorithm, continuous unrounded source data, a 5-dimensional physical manifold, measured dynamical motion, or universal forecasting.
- The original 20,736 Atlas (four axes) is separately typed from this 248,832-state Canon (five axes). Neither range subsumes the other.
- No CanonState mutation, R125/R142 authority transfer, private SAI exposure, native host/device action, original file overwrite, R295 theorem promotion, paid service or R2 migration.
- This candidate is **source and UI development only** until all eight exact-head workflow families pass. The existing R771 merged production receipt/Worker/live parity was not independently available when R772 was staged; **do not promote R772 over an unclosed R771 production gate**. R772 itself requires its own governed merge, post-merge production Worker identity, exact SHA live desktop/mobile proof, authority closure and rollback eligibility.

## Independent audit artifacts

The local forensic work generated a read-only original-byte/numerical audit report, a complete semantic audit report, and a standalone source-verifier script. They were not published with original workbook bytes. The public source model carries only source-derived vocabulary, declarative formulas and fingerprints, with explicit truth limits.
