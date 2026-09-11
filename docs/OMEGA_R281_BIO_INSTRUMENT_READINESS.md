# OMEGA R281 · Heavy Bio Instrument / Validation Readiness

## Status

R281 is an **instrument-accuracy engineering and visualization frame**. It is not labeled as a cleared, approved, validated, or clinically effective medical device.

The immediate intended use of R281 is to:

- ingest explicit measurement packets with units, timestamps, device identity, calibration metadata, uncertainty and provenance;
- preserve the raw observation separately from calibration correction, uncertainty propagation, canonical model state and mode-derived overlays;
- visualize measurements across the archived Heavy Bio 12-domain × 12-layer atlas while retaining organism → organ → tissue → cell → organelle → molecule → atom scale views;
- expose every one of the 62 canon/calculus authorities as an experimental/model overlay with **measurement authority = 0**;
- provide a software-validation scaffold for future instrument adapters, analytical validation and, only if intentionally pursued, regulated-device development.

## Non-negotiable measurement law

```
OBSERVED != DERIVED != MODEL
```

A raw observation is never replaced by a mode output. A calibrated observation is derived only from an explicit declared calibration transform. Model/canon state may be shown beside an observation but cannot rewrite the observed value, unit, timestamp, source, device or uncertainty.

For the initial declared independent-component measurement model:

```
y = gain * x + offset

u_c = sqrt(
  (gain * u_instrument)^2
  + u_calibration^2
  + u_repeatability^2
  + (resolution / sqrt(12))^2
  + (x * u_gain)^2
  + u_offset^2
)

U = k * u_c
```

The software stores `x`, corrected `y`, combined standard uncertainty `u_c`, expanded uncertainty `U`, and coverage factor `k` separately. This equation is a declared metrology implementation, not evidence that a particular external device is calibrated or clinically valid.

## Archived Heavy Bio axes restored as software contracts

### Biological domains

1. Nervous System
2. Cardiovascular
3. Respiratory
4. Digestive
5. Endocrine
6. Immune / Inflammatory
7. Musculoskeletal
8. Renal / Fluid
9. Sleep / Circadian
10. Cognitive / Attention
11. Emotional / Social
12. Environmental Load

### Heavy Bio context layers

1. Cell
2. Tissue
3. Organ
4. System
5. Body
6. Behavior
7. Attention
8. Emotion
9. Relationship
10. Work / Environment
11. City / Planet
12. Future Pattern

The 12 × 12 × 12 × 12 base address space remains 20,736 materialized states. The 12^10 = 61,917,364,224 expansion is retained as an indexed/model address space, not a count of physical dimensions and not a materialized clinical dataset.

### Physical scale traversal

`ORGANISM → ORGAN → TISSUE → CELL → ORGANELLE → MOLECULE → ATOM`

These scale views remain representational until an appropriate source adapter supplies measured data at the corresponding scale. R281 does not infer microscopy, molecular assays, histology, anatomy, or atomic measurements from atlas coordinates.

## All-mode policy

All 62 canon/calculus authorities remain available for research and model inspection, including unproven or gated modes. Their outputs are carried as visibly labeled overlays.

Rules:

1. Every mode has `measurementAuthority = 0`.
2. A mode can never fill a missing instrument observation.
3. A mode can never modify the original instrument value or unit.
4. Gated/unproven modes remain marked as such.
5. Agreement among modes is internal model coherence, not independent replication.
6. An experimental mode may generate a hypothesis, visualization, prioritization or test request, but not a hidden clinical fact.
7. R125 remains CanonState admission authority; CanonState is still separate from clinical validity.

## Current packet acceptance requirements

An instrument packet must carry, at minimum:

- sample id;
- Heavy Bio domain and layer;
- variable name;
- numeric raw value;
- unit;
- observation timestamp;
- source;
- device id;
- verified-source flag.

Instrument-ready status additionally expects current calibration dates, declared calibration traceability/standard and non-zero declared uncertainty. Expired calibration, invalid/non-finite values, missing units, unverified sources, or stale measurements fail the corresponding gate rather than being repaired with model values.

## Interoperability targets

R281 names the following adapter targets without claiming full conformance yet:

- typed OMEGA device packets;
- JSON;
- CSV;
- HL7 FHIR Observation adapter target;
- DICOM Structured Report adapter target;
- DICOM image-reference adapter target.

Conformance must be established per adapter with versioned profiles, parser tests, round-trip tests, malformed-input tests and source-system validation.

## Regulatory / quality engineering targets

If OMEGA is intentionally developed toward a regulated medical-device intended use, the engineering program must be controlled rather than merely relabeled. Current target framework includes:

- FDA Quality Management System Regulation (QMSR), effective February 2, 2026, incorporating ISO 13485:2016 by reference;
- IEC 62304 lifecycle processes for medical-device software as applicable;
- ISO 14971 risk-management process as applicable;
- IEC 62366-1 usability engineering as applicable;
- FDA-recognized DICOM NEMA PS 3.1–3.20 2025d for applicable medical imaging interoperability;
- FDA February 2026 cybersecurity guidance for devices with cybersecurity risk;
- FDA device-software premarket documentation expectations when the intended use makes the software a device;
- FDA January 2026 Clinical Decision Support guidance when evaluating CDS/device status.

These are **targets and planning references**, not a conformance declaration.

## Evidence still required before any medical-device / clinical-performance claim

At minimum, a future regulated-intended-use program would need a controlled evidence package appropriate to the actual device classification and intended use, including:

- precise intended use / indications / users / use environment;
- regulatory classification and submission strategy where applicable;
- design inputs, design outputs and requirements traceability;
- software architecture, hazard controls and safety classification appropriate to the product;
- ISO 14971-style risk file with hazards, hazardous situations, mitigations and residual-risk evaluation;
- controlled software lifecycle, change control, configuration management and release records;
- SOUP / third-party dependency inventory and cybersecurity threat model;
- SBOM and vulnerability-management process where applicable;
- unit, integration, system, regression, stress, malformed-input and fault-injection verification;
- metrology and calibration traceability for each supported instrument family;
- analytical validation against appropriate reference methods;
- clinical validation for every clinical-performance claim that requires it;
- interoperability validation for every claimed FHIR/DICOM/device interface;
- usability/human-factors evidence for the intended users and environments;
- privacy, access-control, audit, integrity and retention controls appropriate to the handled data;
- installation, update, rollback, recovery and field-maintenance validation;
- postmarket/field monitoring and corrective-action processes where applicable.

## R281 truth boundary

R281 can become extremely precise about **what it received, how it transformed it, how uncertain that value is, where it came from, which model lens examined it, and what the software actually verified**.

It cannot make an unvalidated biological model become clinically true by adding more modes. The route to higher medical reliability is therefore:

`instrument binding → metrology → uncertainty → provenance → validation → risk control → human factors → clinical evidence → regulated release, where applicable`

The Heavy Bio calculus remains useful throughout that path as an explicitly separated model/visual reasoning layer.
