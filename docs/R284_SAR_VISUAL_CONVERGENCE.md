# R284 · SAR Visual Convergence

R284 advances the R283/R283.1 SAR Truth instrument visually without weakening its evidence boundaries.

## Visual objective

The SAR surface now exposes acquisition identity, geometry, frame relativity, measurement-field binding, residual/scar channels, interferometric admission, Woven Continuity, and all 12 analytical lenses in one coherent instrument.

The visual hierarchy is built around the same mathematical contract as the measurement engine:

`partition → transform/exchange → invariant carry → scar/history carry → re-contextualize`

The interface is therefore not decorative. Each visual layer corresponds to a declared measurement state, transform, residual, or proof state.

## New R284 visual organs

- command/status bar: 53 modes, 30 capabilities, source, geometry, calibration, provenance
- acquisition and geometry frame inspector
- source-bound versus field-bound disclosure
- swath and burst-frame visual cues
- explicit line-of-sight and baseline HUD
- truth-state pipeline
- interferometry gate with coherence, wavelength, pair ΔT and phase→LOS relation
- residual/scar magnitude bars
- simultaneous 12-lens thumbnail dock
- Woven Continuity flow and interferometric residual equation
- responsive desktop/tablet/mobile layouts

## Evidence law

Rendering never upgrades evidence class.

`SOURCE BOUND` means a source observation has been admitted. It does not imply that every possible analytical field exists.

`FIELD BOUND` means the numerical array required by the current analytical lens is actually present and admitted for rendering.

When a field is absent, R284 preserves the existing R283 behavior: missing arrays remain missing and any fallback visual is explicitly labeled as a deterministic visual lens rather than source evidence.

## Interferometric visual calculus

The screen exposes the residual decomposition used by the SAR truth model:

`φobs = φdef + φtopo + φorbit + φatm + φnoise`

The display cannot promote the complete observed phase to deformation. The deformation lens remains gated by the same declared residual handling and coherence/proof conditions defined by the SAR core.

## Dimensional relativity

R284 uses dimensional relativity as measurement-frame relativity: wavelength, polarization, incidence, epoch, geometry and processing state can change what structure is observed at the same Earth coordinate. Atlas scales remain software/address-resolution levels rather than claims of literal physical dimensions.

## Authority boundary

R284 adds no CanonState writer, dispatcher, deployment authority, evidence authority, or alternate runtime. It is a read/visualization convergence layer over the accepted R125/R141/R146/R147/R283.1 authority chain.
