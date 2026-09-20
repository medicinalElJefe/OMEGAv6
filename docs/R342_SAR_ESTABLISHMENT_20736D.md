# R342 — 20,736D SAR Establishment Design

## Purpose

R342 turns the SAR workstation from a panel-oriented renderer into a proof-governed establishment graph. The 20,736D address space is literal:

`12 evidence states × 12 transforms × 12 proof states × 12 software surfaces = 20,736 states`.

Dewey/Woven calculus governs **evidence routing, continuity, scar/residual carry, contradiction retention, falsification, and promotion**. Sentinel-1 product definitions and returned measurement evidence govern SAR physics.

Hard boundary: **NO NEW PHYSICAL PRIMITIVE**.

## 20,736D axes

### Evidence axis
SOURCE_IDENTITY · NATIVE_DN · COMPLEX_IQ · PAIR_METADATA · COMMON_POLARIZATION · SAMPLED_GRID · BURST_GEOMETRY · PRECISE_ORBIT · CALIBRATION_LUT · NOISE_LUT · DEM_GEOMETRY · ETAD_AUXILIARY

### Transform axis
DECODE · VALIDITY_MASK · COMPLEX_PHASE · PAIR_CROSS_PRODUCT · NORMALIZED_CORRELATION · RADIOMETRIC_CALIBRATION · NOISE_REMOVAL · TOPS_COREGISTRATION · TOPOGRAPHIC_CORRECTION · PHASE_UNWRAP · RESIDUAL_CORRECTION · LOS_OR_3D_INVERSION

### Proof axis
SOURCE_BOUND · HASH_BOUND · GRID_PROVEN · SAME_POLARIZATION · CALIBRATION_PROVEN · COREG_RESIDUAL_PROVEN · UNWRAP_CLOSURE_PROVEN · DEM_PROVEN · ATMOSPHERE_PROVEN · SIGN_CONVENTION_PROVEN · UNCERTAINTY_PROPAGATED · PROMOTION_READY

### Surface axis
INGRESS · SOURCE_LENS · AMPLITUDE_LENS · PHASE_LENS · COHERENCE_LENS · INTERFEROGRAM_LENS · TIME_STACK_LENS · DEFORMATION_LENS · ELEVATION_LENS · SCAR_LENS · PROOF_LENS · LEDGER_EXPORT

## Canonical operator sequence

`PARTITION → PRUNE → TRANSLATE → PROVE → INVARIANT_CARRY → SCAR_CARRY → RECONTEXTUALIZE`

RSC continuity loop:

`Parent → Interaction → Scar → Continuity → Compression → Skin → Interpretation → Behavior → New Parent`

No failed proof is discarded. Failed branches become scar/proof-ledger state.

## Establishment ladder

| Layer | Promotion gate | State rule |
|---|---|---|
| Exact acquisition | source identity + exact provenance/hash | ESTABLISHED only from returned source identity |
| Native GRD | exact measurement bytes decoded + validity mask | native units retained |
| Native SLC I/Q | exact complex measurement decode | source phase stays separate |
| Compatible pair metadata | distinct repeat-pass SLC + mode/orbit/time/overlap | necessary, never sufficient for InSAR |
| Same polarization | exact matching VV/VH/HH/HV asset | cross-pol pairing vetoed |
| Sampled-grid identity | identical computational sampled grid | never promoted to TOPS coreg |
| Pair cross-product | master × conj(slave) reproduced | exact-grid candidate field |
| Normalized correlation | declared window + normalized complex estimator | candidate statistic until coreg proof |
| TOPS subpixel coreg | burst geometry + precise orbit + residual proof | azimuth residual ≤ 0.001 sample; range residual ≤ declared justified tolerance |
| Physical wrapped phase | coreg proof + wrapped pair phase | only now phase-valid interferometry |
| β⁰/σ⁰/γ⁰ | calibration annotation/LUT + source power + units | product authority controls calibration |
| Terrain-flattened γ⁰ | calibrated backscatter + DEM + local geometry + reproduced RTC | calibration γ⁰ is not silently renamed RTC γ⁰ |
| Unwrapped phase | physical wrapped phase + unwrap result + closure/topology proof | disconnected/low-quality regions stay missing |
| LOS displacement | corrected unwrapped phase + wavelength + sign convention | metric LOS projection only |
| Corrected LOS | LOS + orbit + topography + atmosphere with residual ledger | corrections stay individually auditable |
| Full 3-D deformation | ≥3 independent LOS geometries with rank-3 design matrix, or sufficient external constraints | one LOS never yields unconstrained 3-D |

## Authoritative formulas implemented

### Sentinel-1 radiometry

For a declared calibration LUT value `A` and source power `P`:

`value = P / A²`

When the product noise LUT is valid for the selected calibration path:

`value = (P - noise) / A²`

Negative noise-subtracted power is retained as invalid/missing; it is not clamped into synthetic evidence.

### Exact-grid pair field

`I_pair = master × conj(slave)`

`phi_candidate = arg(I_pair)`

This is a computational cross-phase until TOPS subpixel registration is proved.

### Normalized complex correlation

`gamma = |Σ(s1·conj(s2))| / sqrt(Σ|s1|² · Σ|s2|²)`

### Temporal amplitude change

`ΔlnA = ln(|slave| / |master|)`

Only positive finite amplitudes are admitted. No arbitrary `+1` floor is used.

### Corrected phase to LOS

`d_LOS = sign · λ · φ_corrected / (4π)`

The sign convention is a required proof input.

### 3-D recovery

For independent LOS unit vectors `u_i` and measured LOS displacements `d_i`, R342 solves the weighted least-squares normal system:

`(UᵀWU)x = UᵀWd`

and refuses promotion when the geometry is rank deficient.

## Sentinel-1 physical authority

R342 records the Sentinel-1 Product Specification and S1 Processing documentation as the physical reference authority for calibration/noise and TOPS processing. Dewey calculus is not used to invent calibration constants, orbit data, DEM values, atmospheric corrections, or missing observations.

## Software contract

- `src/sarPairDerivationR341.ts` — exact-grid pair candidate calculations; explicit grid/coreg separation.
- `src/sarEstablishmentR342.ts` — 20,736D state address system, establishment ladder, calibration kernel, residual phase→LOS kernel, rank-3 LOS inversion.
- `src/SARLiveTruthR285.tsx` — live established-count and next-held-gate projection.
- `tests/r341-sar-pair-derivation-invariants.mjs` — R341.1 estimator/coreg truth proof.
- `tests/r342-sar-establishment-20736d-invariants.mjs` — 12⁴ address round-trip and hard physical boundary proof.

## Promotion rule

A layer may become ESTABLISHED only when all of its hard dependencies and its proof gate are bound. A high Dewey coherence score, visualization quality, narrative fit, or downstream demand cannot rescue a failed hard gate.

R342 therefore establishes the **software capability to close every layer when its authoritative evidence arrives**, while keeping data-dependent physical layers HELD until those observations/annotations are actually bound.
