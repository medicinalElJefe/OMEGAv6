#!/usr/bin/env python3
"""OMEGA R41 two-stage spectral conversion optimizer.

Tier 1 screens a bounded geometry lattice using real grcwa complex fields at
one orientation and multiple wavelengths. Tier 2 promotes only the best
candidates (plus the baseline) into the complete 12-orientation, two-helicity,
three-wavelength R38/R39 PB validation at convergence-qualified resolution.

PB phase agreement is a hard admission gate. The optimizer may improve
conversion only among candidates that preserve that gate. Numerical results
remain design evidence, not fabrication validation.
"""
from __future__ import annotations
import argparse, copy, csv, itertools, json, math, statistics, time
from pathlib import Path

from omega_pb_phase import circular_state, pb_scan
from omega_rcwa_worker import _sha

SCHEMA = "OMEGA_SPECTRAL_OPTIMIZATION_v1"
VERSION = "R41.0"


def _vals(text):
    return [float(x) for x in str(text).split(",") if str(x).strip()]


def _geometry_key(g):
    return (float(g["pitch_nm"]), float(g["width_nm"]), float(g["length_nm"]), float(g["height_nm"]))


def _valid_geometry(g):
    p, w, l, h = _geometry_key(g)
    if min(p, w, l, h) <= 0 or w >= l:
        return False
    # Keep the full rotated rectangle comfortably inside one square unit cell.
    return math.hypot(w, l) <= 0.95 * p


def _candidate_job(base, g, grid):
    j = copy.deepcopy(base)
    j["geometry"] = {**(j.get("geometry") or {}), **g, "theta_deg": 0.0}
    n = dict(j.get("numerics") or {})
    n.update({"nx": int(grid), "ny": int(grid)})
    j["numerics"] = n
    return j


def _screen_score(conversions, red_conversion):
    # Conservative broadband score: protect the weakest wavelength first,
    # then mean conversion, then explicitly reward the red channel.
    return 0.55 * min(conversions) + 0.25 * statistics.fmean(conversions) + 0.20 * red_conversion


def screen_candidate(base, g, wavelengths, grid=64):
    j = _candidate_job(base, g, grid)
    by_wavelength = []
    all_conv = []
    for wl in wavelengths:
        s = circular_state(j, float(wl), 0.0)
        lr = float(s["conversion"]["R_to_L"])
        rl = float(s["conversion"]["L_to_R"])
        c = min(lr, rl)
        all_conv.append(c)
        by_wavelength.append({"wavelength_nm": float(wl), "R_to_L": lr, "L_to_R": rl, "conservative_conversion": c})
    red = by_wavelength[-1]["conservative_conversion"]
    return {
        "geometry": {k: float(g[k]) for k in ("pitch_nm", "width_nm", "length_nm", "height_nm")},
        "screen_grid": int(grid),
        "screen_score": float(_screen_score(all_conv, red)),
        "screen_min_conversion": float(min(all_conv)),
        "screen_mean_conversion": float(statistics.fmean(all_conv)),
        "screen_red_conversion": float(red),
        "wavelengths": by_wavelength,
    }


def _full_metrics(proofs, wavelengths):
    conversions = []
    red = []
    rms = []
    admitted = True
    for p in proofs:
        admitted = admitted and bool(p["pb_phase_verified"])
        rms.extend(float(v) for v in p["rms_phase_error_deg"].values() if v is not None)
        wl = float(p["wavelength_nm"])
        for s in p["states"]:
            vals = [float(s["conversion"]["R_to_L"]), float(s["conversion"]["L_to_R"])]
            conversions.extend(vals)
            if wl == float(wavelengths[-1]):
                red.extend(vals)
    out = {
        "admitted": bool(admitted),
        "min_conversion": float(min(conversions)),
        "mean_conversion": float(statistics.fmean(conversions)),
        "red_mean_conversion": float(statistics.fmean(red)),
        "max_rms_phase_error_deg": float(max(rms)),
    }
    out["objective"] = (0.50 * out["min_conversion"] + 0.30 * out["mean_conversion"] + 0.20 * out["red_mean_conversion"]) if out["admitted"] else None
    return out


def validate_candidate(base, candidate, wavelengths, grid=96, phase_tol=12.0, conversion_floor=0.05):
    g = candidate["geometry"]
    j = _candidate_job(base, g, grid)
    proofs = [pb_scan(j, float(wl), phase_tol, conversion_floor) for wl in wavelengths]
    return {
        **candidate,
        "validation_grid": int(grid),
        "proofs": proofs,
        "full": _full_metrics(proofs, wavelengths),
    }


def optimize(base, pitches, widths, lengths, heights, wavelengths=(470.0, 532.0, 650.0), screen_grid=64, validation_grid=96, top_k=4):
    baseline = {k: float(base["geometry"][k]) for k in ("pitch_nm", "width_nm", "length_nm", "height_nm")}
    lattice = []
    seen = set()
    for p, w, l, h in itertools.product(pitches, widths, lengths, heights):
        g = {"pitch_nm": p, "width_nm": w, "length_nm": l, "height_nm": h}
        key = _geometry_key(g)
        if key not in seen and _valid_geometry(g):
            seen.add(key); lattice.append(g)
    bkey = _geometry_key(baseline)
    if bkey not in seen and _valid_geometry(baseline):
        lattice.append(baseline); seen.add(bkey)

    screened = []
    failures = []
    for g in lattice:
        try:
            screened.append(screen_candidate(base, g, wavelengths, screen_grid))
        except Exception as exc:
            failures.append({"geometry": g, "stage": "screen", "error": f"{type(exc).__name__}: {exc}"})
    screened.sort(key=lambda x: x["screen_score"], reverse=True)

    baseline_screen = next((x for x in screened if _geometry_key(x["geometry"]) == bkey), None)
    finalists = []
    used = set()
    for c in ([baseline_screen] if baseline_screen else []) + screened[: max(1, int(top_k))]:
        if c is None: continue
        k = _geometry_key(c["geometry"])
        if k not in used:
            finalists.append(c); used.add(k)

    validated = []
    for c in finalists:
        try:
            validated.append(validate_candidate(base, c, wavelengths, validation_grid))
        except Exception as exc:
            failures.append({"geometry": c["geometry"], "stage": "validation", "error": f"{type(exc).__name__}: {exc}"})

    baseline_full = next((x for x in validated if _geometry_key(x["geometry"]) == bkey), None)
    admitted = [x for x in validated if x["full"]["admitted"] and x["full"]["objective"] is not None]
    admitted.sort(key=lambda x: x["full"]["objective"], reverse=True)
    winner = admitted[0] if admitted else None

    improvement = None
    if winner and baseline_full:
        improvement = {
            "objective_delta": float(winner["full"]["objective"] - baseline_full["full"]["objective"]),
            "min_conversion_delta": float(winner["full"]["min_conversion"] - baseline_full["full"]["min_conversion"]),
            "mean_conversion_delta": float(winner["full"]["mean_conversion"] - baseline_full["full"]["mean_conversion"]),
            "red_mean_conversion_delta": float(winner["full"]["red_mean_conversion"] - baseline_full["full"]["red_mean_conversion"]),
        }

    out = {
        "schema": SCHEMA, "version": VERSION,
        "wavelengths_nm": [float(x) for x in wavelengths],
        "screen_grid": int(screen_grid), "validation_grid": int(validation_grid),
        "screened_candidates": len(screened), "screen_failures": len([x for x in failures if x["stage"] == "screen"]),
        "validated_candidates": len(validated),
        "baseline_geometry": baseline,
        "baseline": baseline_full,
        "winner": winner,
        "improvement_vs_baseline": improvement,
        "screen_ranking": screened,
        "validated": validated,
        "failures": failures,
        "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "truth_boundary": "Tier-1 ranking uses real RCWA complex fields but only a single orientation. Promotion requires the full 12-state PB gate at convergence-qualified resolution. Optimization is numerical design evidence, not fabrication validation.",
    }
    out["proof_sha256"] = _sha(out)
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True); p.add_argument("--output", required=True); p.add_argument("--csv")
    p.add_argument("--pitches", default="320,330,340"); p.add_argument("--widths", default="80,90,100")
    p.add_argument("--lengths", default="240,260,280"); p.add_argument("--heights", default="500,550,600")
    p.add_argument("--wavelengths", default="470,532,650"); p.add_argument("--screen-grid", type=int, default=64)
    p.add_argument("--validation-grid", type=int, default=96); p.add_argument("--top-k", type=int, default=4)
    a = p.parse_args()
    base = json.loads(Path(a.input).read_text("utf-8"))
    out = optimize(base, _vals(a.pitches), _vals(a.widths), _vals(a.lengths), _vals(a.heights), _vals(a.wavelengths), a.screen_grid, a.validation_grid, a.top_k)
    Path(a.output).write_text(json.dumps(out, indent=2), "utf-8")
    if a.csv:
        rows = []
        for c in out["validated"]:
            f = c["full"]
            rows.append({**c["geometry"], "screen_score": c["screen_score"], "admitted": f["admitted"], "objective": f["objective"], "min_conversion": f["min_conversion"], "mean_conversion": f["mean_conversion"], "red_mean_conversion": f["red_mean_conversion"], "max_rms_phase_error_deg": f["max_rms_phase_error_deg"]})
        if rows:
            with open(a.csv, "w", newline="", encoding="utf-8") as fh:
                w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    print(json.dumps({"screened_candidates": out["screened_candidates"], "validated_candidates": out["validated_candidates"], "winner_geometry": out["winner"]["geometry"] if out["winner"] else None, "winner_full": out["winner"]["full"] if out["winner"] else None, "improvement_vs_baseline": out["improvement_vs_baseline"], "proof_sha256": out["proof_sha256"]}))
    return 0

if __name__ == "__main__": raise SystemExit(main())
