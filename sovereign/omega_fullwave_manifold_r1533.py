#!/usr/bin/env python3
"""OMEGA R153.3 full-wave admissible robustness bridge.

R153.2 can discover strong reduced-order candidates outside the geometry domain
used by the validated R41/R42/R43 RCWA stack. R153.3 reconciles those layers:

1. inspect the returned scalar geometry against the R41 full-wave manifold;
2. generate several deterministic admissible projections rather than silently
   clipping one coordinate;
3. build a bounded neighborhood around those projections;
4. use the existing grcwa R41 screen and complete PB validation on the best
   candidates across 470/532/650 nm;
5. stress finalists under a configurable numerical +/-nm geometry envelope;
6. expose nominal/full-wave, tolerance-screen, PB-corner, clearance and Pareto
   evidence without claiming fabrication validation or physical measurement.

The numerical tolerance envelope is an engineering stress test, not a process
capability specification or physical law.
"""
from __future__ import annotations

import argparse
import copy
import itertools
import json
import math
import statistics
from pathlib import Path

from omega_spectral_optimizer_r41 import (
    _geometry_key,
    _valid_geometry,
    screen_candidate,
    validate_candidate,
)
from omega_rcwa_worker import _sha

SCHEMA = "OMEGA_FULLWAVE_MANIFOLD_R1533"
VERSION = "R153.3"
R41_CELL_RATIO = 0.95


def _round(v, n=6):
    return round(float(v), n)


def _geometry_from_input(payload):
    candidates = [
        payload.get("geometry"),
        (payload.get("result") or {}).get("cycle", {}).get("final", {}).get("geometry"),
        (payload.get("result") or {}).get("best", {}).get("geometry"),
        (payload.get("cycle") or {}).get("final", {}).get("geometry"),
        (payload.get("best") or {}).get("geometry"),
    ]
    for g in candidates:
        if isinstance(g, dict) and all(k in g for k in ("pitch_nm", "width_nm", "length_nm", "height_nm")):
            return {k: float(g[k]) for k in ("pitch_nm", "width_nm", "length_nm", "height_nm")}
    raise ValueError("Input must contain pitch_nm, width_nm, length_nm and height_nm geometry")


def manifold_metrics(g):
    p, w, l, h = (float(g[k]) for k in ("pitch_nm", "width_nm", "length_nm", "height_nm"))
    diagonal = math.hypot(w, l)
    limit = R41_CELL_RATIO * p
    slack = limit - diagonal
    return {
        "valid_r41": bool(_valid_geometry(g)),
        "pitch_nm": p,
        "width_nm": w,
        "length_nm": l,
        "height_nm": h,
        "diagonal_nm": diagonal,
        "r41_limit_nm": limit,
        "r41_slack_nm": slack,
        "diagonal_to_limit_ratio": diagonal / limit if limit > 0 else math.inf,
        "length_clearance_nm": p - l,
        "width_clearance_nm": p - w,
    }


def _max_length(p, w, ratio=R41_CELL_RATIO):
    sq = (float(ratio) * float(p)) ** 2 - float(w) ** 2
    return math.sqrt(sq) if sq > 0 else 0.0


def projection_family(seed, engineering_ratio=0.93):
    """Return shrink, expand and balanced projections inside the RCWA manifold.

    engineering_ratio is intentionally below the R41 0.95 hard admissibility
    ratio to leave numerical headroom. It is configurable engineering policy,
    not a physical constant.
    """
    p, w, l, h = (float(seed[k]) for k in ("pitch_nm", "width_nm", "length_nm", "height_nm"))
    ratio = max(0.80, min(R41_CELL_RATIO - 1e-3, float(engineering_ratio)))
    out = []

    shrink_l = min(l, _max_length(p, w, ratio))
    shrink_l = max(w + 2.0, shrink_l)
    out.append({"family": "shrink_length", "geometry": {"pitch_nm": p, "width_nm": w, "length_nm": shrink_l, "height_nm": h}})

    expand_p = max(p, math.hypot(w, l) / ratio)
    out.append({"family": "expand_pitch", "geometry": {"pitch_nm": expand_p, "width_nm": w, "length_nm": l, "height_nm": h}})

    balanced_p = (p + expand_p) / 2.0
    balanced_l = min(l, _max_length(balanced_p, w, ratio))
    balanced_l = max(w + 2.0, balanced_l)
    out.append({"family": "balanced", "geometry": {"pitch_nm": balanced_p, "width_nm": w, "length_nm": balanced_l, "height_nm": h}})

    unique = []
    seen = set()
    for item in out:
        g = {k: _round(v, 3) for k, v in item["geometry"].items()}
        key = _geometry_key(g)
        if key in seen or not _valid_geometry(g):
            continue
        seen.add(key)
        unique.append({**item, "geometry": g, "manifold": manifold_metrics(g)})
    return unique


def _near(v, deltas, floor=1.0):
    return sorted({_round(max(floor, float(v) + float(d)), 3) for d in deltas})


def build_candidate_lattice(projections, max_candidates=180):
    candidates = []
    seen = set()
    for anchor in projections:
        g = anchor["geometry"]
        pitches = _near(g["pitch_nm"], (-8, 0, 8))
        widths = _near(g["width_nm"], (-8, 0, 8))
        lengths = _near(g["length_nm"], (-10, 0, 10))
        heights = _near(g["height_nm"], (-20, 0, 20), floor=100)
        for p, w, l, h in itertools.product(pitches, widths, lengths, heights):
            x = {"pitch_nm": p, "width_nm": w, "length_nm": l, "height_nm": h}
            key = _geometry_key(x)
            if key in seen or not _valid_geometry(x):
                continue
            seen.add(key)
            candidates.append({"geometry": x, "source_family": anchor["family"], "manifold": manifold_metrics(x)})
            if len(candidates) >= int(max_candidates):
                return candidates
    return candidates


def _base_job(seed, payload, grid=64):
    base = copy.deepcopy(payload.get("fullwave_job") or payload.get("tier2_job") or {})
    base.update({
        "schema": "OMEGA_FULLWAVE_QUEUE_v1",
        "solver": "rcwa",
        "job_id": str(base.get("job_id") or "r1533_fullwave_manifold"),
        "source_packet_id": str(base.get("source_packet_id") or "r1533_adaptive_candidate"),
        "geometry": {**seed, "theta_deg": 0.0},
        "polarization": str(base.get("polarization") or "s"),
        "material_names": base.get("material_names") or {
            "incident": "air",
            "feature": "tio2_design",
            "background": "air",
            "substrate": "sio2_fused",
        },
        "numerics": {
            **(base.get("numerics") or {}),
            "nx": int(grid),
            "ny": int(grid),
            "harmonics_low": int((base.get("numerics") or {}).get("harmonics_low", 25)),
            "harmonics_high": int((base.get("numerics") or {}).get("harmonics_high", 49)),
            "convergence_tolerance": float((base.get("numerics") or {}).get("convergence_tolerance", 0.08)),
            "energy_tolerance": float((base.get("numerics") or {}).get("energy_tolerance", 0.08)),
        },
        "proof": {**(base.get("proof") or {}), "gate": "STAY", "mode188_score": float((base.get("proof") or {}).get("mode188_score", 1.0))},
    })
    return base


def _stress_geometries(g, tolerance_nm):
    t = abs(float(tolerance_nm))
    cases = [("nominal", dict(g))]
    for key in ("pitch_nm", "width_nm", "length_nm", "height_nm"):
        for sign, label in ((-1, "minus"), (1, "plus")):
            x = dict(g)
            x[key] = float(x[key]) + sign * t
            cases.append((f"{key}:{label}{t:g}", x))
    worst = dict(g)
    worst["pitch_nm"] = float(worst["pitch_nm"]) - t
    worst["width_nm"] = float(worst["width_nm"]) + t
    worst["length_nm"] = float(worst["length_nm"]) + t
    cases.append(("coupled_cell_worst", worst))
    out, seen = [], set()
    for name, x in cases:
        key = _geometry_key(x)
        if key in seen:
            continue
        seen.add(key)
        out.append({"name": name, "geometry": x, "manifold": manifold_metrics(x)})
    return out


def _dominates(a, b):
    af, bf = a["full"], b["full"]
    am, bm = a["manifold"], b["manifold"]
    better_or_equal = (
        af["objective"] >= bf["objective"]
        and af["max_rms_phase_error_deg"] <= bf["max_rms_phase_error_deg"]
        and am["r41_slack_nm"] >= bm["r41_slack_nm"]
    )
    strict = (
        af["objective"] > bf["objective"]
        or af["max_rms_phase_error_deg"] < bf["max_rms_phase_error_deg"]
        or am["r41_slack_nm"] > bm["r41_slack_nm"]
    )
    return better_or_equal and strict


def run(payload, wavelengths=(470.0, 532.0, 650.0), screen_grid=64, validation_grid=96,
        top_k=12, phase_margin_deg=6.0, tolerance_nm=5.0, engineering_ratio=0.93,
        max_candidates=180, stress_top_k=3):
    scalar_seed = _geometry_from_input(payload)
    seed_manifold = manifold_metrics(scalar_seed)
    projections = projection_family(scalar_seed, engineering_ratio)
    if not projections:
        raise RuntimeError("Could not generate an admissible projection from scalar seed")

    lattice = build_candidate_lattice(projections, max_candidates)
    # Use the first admissible projection as the actual base geometry so the
    # existing R41 worker never receives the invalid scalar seed as baseline.
    base = _base_job(projections[0]["geometry"], payload, screen_grid)

    screened, failures = [], []
    for item in lattice:
        try:
            s = screen_candidate(base, item["geometry"], wavelengths, screen_grid)
            screened.append({**s, "source_family": item["source_family"], "manifold": item["manifold"]})
        except Exception as exc:
            failures.append({"geometry": item["geometry"], "stage": "screen", "error": f"{type(exc).__name__}: {exc}"})
    screened.sort(key=lambda c: (c["screen_score"], c["manifold"]["r41_slack_nm"]), reverse=True)

    wanted, used = [], set()
    projection_keys = {_geometry_key(x["geometry"]) for x in projections}
    for c in screened:
        k = _geometry_key(c["geometry"])
        if k in projection_keys and k not in used:
            wanted.append(c); used.add(k)
    for c in screened[:max(1, int(top_k))]:
        k = _geometry_key(c["geometry"])
        if k not in used:
            wanted.append(c); used.add(k)

    validated = []
    for c in wanted:
        try:
            v = validate_candidate(base, c, wavelengths, validation_grid)
            validated.append({**v, "source_family": c["source_family"], "manifold": c["manifold"]})
        except Exception as exc:
            failures.append({"geometry": c["geometry"], "stage": "validation", "error": f"{type(exc).__name__}: {exc}"})

    admitted = [x for x in validated if x["full"]["admitted"] and x["full"]["objective"] is not None]
    admitted.sort(key=lambda c: (c["full"]["objective"], c["manifold"]["r41_slack_nm"]), reverse=True)
    frontier = [c for c in admitted if not any(_dominates(o, c) for o in admitted if o is not c)]
    frontier.sort(key=lambda c: (c["full"]["max_rms_phase_error_deg"], -c["full"]["objective"]))

    robust_candidates = []
    for candidate in admitted[:max(1, int(stress_top_k))]:
        stress = []
        for case in _stress_geometries(candidate["geometry"], tolerance_nm):
            if not case["manifold"]["valid_r41"]:
                stress.append({**case, "valid": False, "screen": None})
                continue
            try:
                sc = screen_candidate(base, case["geometry"], wavelengths, screen_grid)
                stress.append({**case, "valid": True, "screen": sc})
            except Exception as exc:
                stress.append({**case, "valid": False, "error": f"{type(exc).__name__}: {exc}", "screen": None})
        valid_screens = [x for x in stress if x.get("valid") and x.get("screen")]
        invalid_count = len(stress) - len(valid_screens)
        worst_screen = min(valid_screens, key=lambda x: x["screen"]["screen_score"]) if valid_screens else None

        # Validate nominal plus the two weakest real-RCWA stress screens through
        # the complete PB gate. This stays bounded while targeting the worst
        # perturbations rather than validating arbitrary corners.
        corner_inputs = []
        nominal = next((x for x in stress if x["name"] == "nominal" and x.get("screen")), None)
        if nominal:
            corner_inputs.append(nominal)
        for x in sorted(valid_screens, key=lambda z: z["screen"]["screen_score"]):
            if x["name"] != "nominal" and x not in corner_inputs:
                corner_inputs.append(x)
            if len(corner_inputs) >= 3:
                break
        pb_corners = []
        for x in corner_inputs:
            try:
                full = validate_candidate(base, x["screen"], wavelengths, validation_grid)
                pb_corners.append({"name": x["name"], "geometry": x["geometry"], "manifold": x["manifold"], "full": full["full"], "proofs": full["proofs"]})
            except Exception as exc:
                pb_corners.append({"name": x["name"], "geometry": x["geometry"], "error": f"{type(exc).__name__}: {exc}", "full": None})

        all_pb_admitted = bool(pb_corners) and all(x.get("full") and x["full"]["admitted"] for x in pb_corners)
        max_phase = max((x["full"]["max_rms_phase_error_deg"] for x in pb_corners if x.get("full")), default=math.inf)
        min_stress_score = min((x["screen"]["screen_score"] for x in valid_screens), default=-math.inf)
        robust = invalid_count == 0 and all_pb_admitted and max_phase <= float(phase_margin_deg)
        robust_candidates.append({
            "geometry": candidate["geometry"],
            "manifold": candidate["manifold"],
            "nominal_full": candidate["full"],
            "stress_cases": stress,
            "invalid_stress_cases": invalid_count,
            "worst_screen_case": worst_screen,
            "stress_min_screen_score": min_stress_score,
            "pb_corners": pb_corners,
            "max_corner_rms_phase_error_deg": max_phase,
            "phase_margin_deg": float(phase_margin_deg),
            "bounded_robust": robust,
        })

    robust_candidates.sort(key=lambda x: (x["bounded_robust"], x["stress_min_screen_score"], x["manifold"]["r41_slack_nm"]), reverse=True)
    winner = robust_candidates[0] if robust_candidates else None
    status = "ROBUST_FULLWAVE_CANDIDATE" if winner and winner["bounded_robust"] else "FULLWAVE_EVIDENCE_NEEDS_REFINEMENT"

    out = {
        "schema": SCHEMA,
        "version": VERSION,
        "status": status,
        "source_scalar_geometry": scalar_seed,
        "source_scalar_manifold": seed_manifold,
        "scalar_seed_fullwave_admissible": seed_manifold["valid_r41"],
        "projection_policy": {
            "r41_hard_cell_ratio": R41_CELL_RATIO,
            "engineering_projection_ratio": float(engineering_ratio),
            "meaning": "Projection ratio is engineering search headroom below the inherited R41 admissibility boundary; it is not a physical constant.",
        },
        "projections": projections,
        "wavelengths_nm": [float(x) for x in wavelengths],
        "screen_grid": int(screen_grid),
        "validation_grid": int(validation_grid),
        "screened_candidates": len(screened),
        "validated_candidates": len(validated),
        "admitted_candidates": len(admitted),
        "pareto_frontier": frontier,
        "tolerance_envelope_nm": float(tolerance_nm),
        "robust_candidates": robust_candidates,
        "winner": winner,
        "failures": failures,
        "next_action": "submit_winner_to_independent_sovereign_rcwa_crosscheck" if status == "ROBUST_FULLWAVE_CANDIDATE" else "refine_fullwave_admissible_manifold",
        "truth_boundary": "R153.3 uses real grcwa screening and the inherited complete PB validation gate across multiple wavelengths, plus a bounded numerical geometry stress envelope. This is numerical design evidence, not fabrication validation, measured material dispersion, physical measurement, or CanonState admission.",
    }
    out["proof_sha256"] = _sha(out)
    return out


def _vals(text):
    return [float(x) for x in str(text).split(",") if str(x).strip()]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--wavelengths", default="470,532,650")
    p.add_argument("--screen-grid", type=int, default=64)
    p.add_argument("--validation-grid", type=int, default=96)
    p.add_argument("--top-k", type=int, default=12)
    p.add_argument("--phase-margin", type=float, default=6.0)
    p.add_argument("--tolerance-nm", type=float, default=5.0)
    p.add_argument("--engineering-ratio", type=float, default=0.93)
    p.add_argument("--max-candidates", type=int, default=180)
    p.add_argument("--stress-top-k", type=int, default=3)
    a = p.parse_args()
    payload = json.loads(Path(a.input).read_text("utf-8"))
    out = run(payload, _vals(a.wavelengths), a.screen_grid, a.validation_grid, a.top_k,
              a.phase_margin, a.tolerance_nm, a.engineering_ratio, a.max_candidates, a.stress_top_k)
    Path(a.output).write_text(json.dumps(out, indent=2), "utf-8")
    compact = {
        "status": out["status"],
        "source_admissible": out["scalar_seed_fullwave_admissible"],
        "source_manifold": out["source_scalar_manifold"],
        "screened": out["screened_candidates"],
        "validated": out["validated_candidates"],
        "admitted": out["admitted_candidates"],
        "winner_geometry": out["winner"]["geometry"] if out["winner"] else None,
        "winner_nominal_full": out["winner"]["nominal_full"] if out["winner"] else None,
        "winner_stress_min_screen_score": out["winner"]["stress_min_screen_score"] if out["winner"] else None,
        "winner_max_corner_rms_phase_error_deg": out["winner"]["max_corner_rms_phase_error_deg"] if out["winner"] else None,
        "next_action": out["next_action"],
        "proof_sha256": out["proof_sha256"],
    }
    print(json.dumps(compact))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
