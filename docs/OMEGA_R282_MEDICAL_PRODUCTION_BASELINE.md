# OMEGA R282 · Heavy Bio Medical Production Baseline

## Status

R282 promotes the Heavy Bio stack from instrument-accuracy research production into a **regulated-production engineering baseline**. It does not manufacture FDA clearance, authorization, clinical validity, or an intended use. Those remain evidence-bearing release inputs.

The runtime can operate in production-validation mode while clinical action remains blocked.

## Governing boundary

```text
RAW OBSERVATION > CALIBRATED MEASUREMENT > DERIVED BIO STATE > MODE HYPOTHESIS > FUSION
```

No downstream layer can overwrite an upstream observation.

All 179 source-mode channels and all 62 canon/calculus channels remain visible. Every mode has `measurementAuthority = 0`. Unvalidated modes can run as research hypotheses; a mode can acquire non-zero clinical weight only through intended-use-matched clinical validation evidence and an explicitly authorized release manifest.

## R282 control stack

1. **Intended use** — purpose, intended user, population, environment, inputs, outputs, decision role, limitations, and lock state.
2. **Measurand definition** — variable, canonical unit, explicitly permitted unit transforms, analytical measurement range, uncertainty ceiling, calibration traceability, reference method, criticality, and version.
3. **Instrument gate** — inherited R281 calibration, uncertainty, staleness, range, provenance, traceability, and device identity checks.
4. **Measurement authority** — only an instrument observation that passes both R281 and the intended-use-specific R282 definition enters the medical measurement frame.
5. **Validation isolation** — case, subject and acquisition identity cannot cross FIT / HOLDOUT / PROSPECTIVE partitions.
6. **Mode evidence** — 241 channels are retained, but clinical weight requires scope-matched validation and release authority.
7. **Risk controls** — required hazard family HB-001..HB-008 must remain present; omission cannot produce a false PASS.
8. **Controlled change** — FIT can propose, HOLDOUT validates, PROSPECTIVE monitors, domain regressions remain scars, and rollback criteria are mandatory.
9. **Audit integrity** — SHA-256 chained events preserve release and measurement history against silent alteration.
10. **Clinical release gate** — intended use, measurement, lifecycle, QMS record, risk approval, analytical/clinical validation, human factors, cybersecurity, interoperability, postmarket controls and actual regulatory authorization remain separately visible.

## Required hazards

| ID | Hazard family | Primary controls |
| --- | --- | --- |
| HB-001 | Unit / measurand mismatch | Explicit unit contract; no implicit conversion |
| HB-002 | Stale / uncalibrated measurement | Calibration, traceability and age gates |
| HB-003 | Model substitution for measurement | 241-channel `measurementAuthority=0` |
| HB-004 | Validation leakage | Case/subject/acquisition partition isolation |
| HB-005 | Hidden domain regression | 12-domain + 12-layer residual slices |
| HB-006 | Unauthorized self-modification | FIT→HOLDOUT→PROSPECTIVE + PCCP/change plan |
| HB-007 | Audit tampering | SHA-256 append-only chain |
| HB-008 | Cybersecurity compromise | Existing authenticated OMEGA authority + explicit release cybersecurity gate |

The default HB-008 residual risk intentionally remains open until a device/intended-use-specific cybersecurity evidence package is bound. This prevents the software from self-declaring a clinical release merely because generic OMEGA infrastructure tests are green.

## Production states

- `ENGINEERING_INCOMPLETE` — one or more engineering gates fail.
- `PRODUCTION_VALIDATION_READY` — engineering controls are ready for intended-use-specific validation.
- `CLINICAL_RELEASE_BLOCKED` — engineering/validation controls may be complete, but actual clinical authorization is absent or incomplete.
- `AUTHORIZED_CLINICAL_RELEASE_READY` — all required evidence is present, including real authorization evidence for the declared scope.

`AUTHORIZED_CLINICAL_RELEASE_READY` must never be used as a surrogate for legal/regulatory review. It is an internal release-state assertion backed by supplied evidence; the evidence itself remains authoritative.

## AI / model update law

```text
FIT proposes
  ↓
partition leakage check
  ↓
untouched HOLDOUT proves improvement against current model + baseline
  ↓
12-domain / 12-layer regression scan
  ↓
risk + impact + rollback assessment
  ↓
PCCP / controlled change scope match
  ↓
PROSPECTIVE monitoring
```

A model can never self-promote because it improved its own fit data.

## Regulatory / standards targets

R282 is engineered against the current control categories needed for a serious U.S. medical-device software program:

- FDA Quality Management System Regulation (QMSR), effective February 2, 2026; incorporates ISO 13485:2016.
- IEC 62304:2006+A1:2015 software life-cycle processes.
- ISO 14971:2019 medical-device risk management.
- FDA Content of Premarket Submissions for Device Software Functions (2023).
- FDA Cybersecurity in Medical Devices guidance (February 2026).
- FDA Marketing Submission Recommendations for a Predetermined Change Control Plan for AI-Enabled Device Software Functions (August 2025).
- FDA / IMDRF Good Machine Learning Practice principles.
- FDA Clinical Decision Support Software guidance (January 2026).
- Existing OMEGA targets for DICOM, FHIR, human factors and interoperability remain conformance targets until separately tested and documented.

## What R282 does not claim

R282 does not by itself establish:

- diagnosis or treatment efficacy;
- clinical utility;
- clinical validity for any disease, population, or use environment;
- FDA clearance, De Novo authorization, PMA approval, or exemption;
- ISO certification;
- IEC/ISO/FHIR/DICOM conformance without the corresponding objective evidence;
- that an archived Heavy Bio equation is a law of nature merely because it is exactly implemented.

## Promotion evidence required

R282 may be promoted to production only when the exact candidate passes:

- R280 mode-realization invariants;
- R281 metrology and empirical-convergence invariants;
- R282 medical-production invariants;
- complete application build and Worker dry-run;
- real desktop/mobile Heavy Bio browser proof;
- existing Hybrid/Woven/Cloud/release-controller proof lanes;
- main-only production deployment and live verification.

Clinical release remains a second, stricter gate inside the deployed product.
