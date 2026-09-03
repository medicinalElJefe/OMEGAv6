#!/usr/bin/env python3
"""OMEGA Sovereign RCWA Worker R3.

Executes a real rigorous coupled-wave analysis through the external `grcwa`
Maxwell solver. This file deliberately has no scalar/fake fallback: if grcwa or
NumPy are unavailable, it returns a dependency failure and does not claim an
RCWA result.

Input: OMEGA_FULLWAVE_QUEUE_v1 JSON file
Output: OMEGA_RESULT_v1 JSON file
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import platform
import sys
import time
import traceback
from pathlib import Path

WORKER_VERSION = "R3.0"
RESULT_SCHEMA = "OMEGA_RESULT_v1"
QUEUE_SCHEMA = "OMEGA_FULLWAVE_QUEUE_v1"


def _sha(obj) -> str:
    raw = json.dumps(obj, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _finite(name, value, lo=None, hi=None):
    try:
        x = float(value)
    except Exception as exc:
        raise ValueError(f"{name} must be numeric") from exc
    if not math.isfinite(x):
        raise ValueError(f"{name} must be finite")
    if lo is not None and x < lo:
        raise ValueError(f"{name} must be >= {lo}")
    if hi is not None and x > hi:
        raise ValueError(f"{name} must be <= {hi}")
    return x


def _material(job):
    model = job.get("material_model") or {}
    required = ["n_incident", "n_feature", "n_background", "n_substrate"]
    missing = [k for k in required if k not in model]
    if missing:
        raise ValueError("material_model missing " + ", ".join(missing))
    return {k: complex(model[k]) for k in required}


def _geometry(job):
    g = job.get("geometry") or {}
    pitch = _finite("geometry.pitch_nm", g.get("pitch_nm"), 1e-6)
    width = _finite("geometry.width_nm", g.get("width_nm"), 1e-6, pitch)
    length = _finite("geometry.length_nm", g.get("length_nm"), 1e-6, pitch)
    height = _finite("geometry.height_nm", g.get("height_nm"), 1e-6)
    theta_deg = _finite("geometry.theta_deg", g.get("theta_deg", 0.0), -360.0, 360.0)
    return pitch, width, length, height, theta_deg


def _build_eps_grid(np, nx, ny, pitch, width, length, theta_deg, eps_feature, eps_background):
    x = (np.arange(nx) + 0.5) / nx * pitch - pitch / 2
    y = (np.arange(ny) + 0.5) / ny * pitch - pitch / 2
    xx, yy = np.meshgrid(x, y, indexing="ij")
    a = math.radians(theta_deg)
    xr = xx * math.cos(a) + yy * math.sin(a)
    yr = -xx * math.sin(a) + yy * math.cos(a)
    inside = (np.abs(xr) <= length / 2) & (np.abs(yr) <= width / 2)
    eps = np.full((nx, ny), eps_background, dtype=complex)
    eps[inside] = eps_feature
    return eps


def _solve_once(job, nG):
    try:
        import numpy as np
        import grcwa
    except Exception as exc:
        raise RuntimeError("RCWA_DEPENDENCY_MISSING: install with `py -3 -m pip install numpy grcwa`") from exc

    pitch, width, length, height, theta_deg = _geometry(job)
    wavelength = _finite("wavelength_nm", job.get("wavelength_nm"), 1e-6)
    model = _material(job)
    numerics = job.get("numerics") or {}
    nx = int(_finite("numerics.nx", numerics.get("nx", 96), 16, 512))
    ny = int(_finite("numerics.ny", numerics.get("ny", 96), 16, 512))
    incidence_theta = math.radians(_finite("numerics.incidence_theta_deg", numerics.get("incidence_theta_deg", 0.0), -89.0, 89.0))
    incidence_phi = math.radians(_finite("numerics.incidence_phi_deg", numerics.get("incidence_phi_deg", 0.0), -360.0, 360.0))
    polarization = str(job.get("polarization", "s")).lower()
    if polarization not in {"s", "p"}:
        raise ValueError("polarization must be 's' or 'p'")

    freq = 1.0 / wavelength
    eps_i = model["n_incident"] ** 2
    eps_f = model["n_feature"] ** 2
    eps_b = model["n_background"] ** 2
    eps_s = model["n_substrate"] ** 2
    L1 = [pitch, 0.0]
    L2 = [0.0, pitch]

    obj = grcwa.obj(int(nG), L1, L2, freq, incidence_theta, incidence_phi, verbose=0)
    buffer_nm = max(pitch, wavelength)
    obj.Add_LayerUniform(buffer_nm, eps_i)
    obj.Add_LayerGrid(height, nx, ny)
    obj.Add_LayerUniform(buffer_nm, eps_s)
    obj.Init_Setup(Gmethod=0)

    if polarization == "s":
        obj.MakeExcitationPlanewave(0.0, 0.0, 1.0, 0.0, order=0)
    else:
        obj.MakeExcitationPlanewave(1.0, 0.0, 0.0, 0.0, order=0)

    eps_grid = _build_eps_grid(np, nx, ny, pitch, width, length, theta_deg, eps_f, eps_b)
    obj.GridLayer_geteps(eps_grid.flatten())
    R, T = obj.RT_Solve(normalize=1)
    Ri, Ti = obj.RT_Solve(normalize=1, byorder=1)

    R = float(np.real(R))
    T = float(np.real(T))
    energy = R + T
    return {
        "requested_harmonics": int(nG),
        "actual_harmonics": int(obj.nG),
        "R": R,
        "T": T,
        "A_or_numeric_residual": float(1.0 - energy),
        "energy_balance_error": float(abs(energy - 1.0)),
        "R_by_order": [float(np.real(x)) for x in np.asarray(Ri).reshape(-1).tolist()],
        "T_by_order": [float(np.real(x)) for x in np.asarray(Ti).reshape(-1).tolist()],
        "grid": {"nx": nx, "ny": ny},
    }, getattr(grcwa, "__version__", "unknown")


def solve(job):
    if job.get("schema") != QUEUE_SCHEMA:
        raise ValueError(f"schema must be {QUEUE_SCHEMA}")
    if str(job.get("solver", "")).lower() != "rcwa":
        raise ValueError("this worker accepts solver='rcwa' only")
    proof = job.get("proof") or {}
    if proof.get("gate") != "STAY" or float(proof.get("mode188_score", 0)) < 1.05:
        raise ValueError("candidate is not proof-admissible for Tier 2")

    numerics = job.get("numerics") or {}
    low = int(_finite("numerics.harmonics_low", numerics.get("harmonics_low", 49), 9, 401))
    high = int(_finite("numerics.harmonics_high", numerics.get("harmonics_high", 81), low + 1, 801))
    conv_tol = _finite("numerics.convergence_tolerance", numerics.get("convergence_tolerance", 0.01), 1e-8, 0.25)
    energy_tol = _finite("numerics.energy_tolerance", numerics.get("energy_tolerance", 0.02), 1e-8, 0.5)

    t0 = time.perf_counter()
    coarse, solver_version = _solve_once(job, low)
    fine, solver_version2 = _solve_once(job, high)
    runtime_ms = (time.perf_counter() - t0) * 1000.0
    delta = max(abs(fine["R"] - coarse["R"]), abs(fine["T"] - coarse["T"]))
    converged = bool(delta <= conv_tol and fine["energy_balance_error"] <= energy_tol)

    result = {
        "schema": RESULT_SCHEMA,
        "packet_id": "result_" + _sha({"job": job.get("job_id"), "fine": fine, "time": time.time()})[:24],
        "source_packet_id": str(job.get("source_packet_id")),
        "worker": "omega-sovereign",
        "solver": "rcwa",
        "solver_version": f"grcwa:{solver_version2 or solver_version};omega-worker:{WORKER_VERSION}",
        "converged": converged,
        "convergence_metrics": {
            "harmonics_low": coarse["actual_harmonics"],
            "harmonics_high": fine["actual_harmonics"],
            "delta_RT": delta,
            "convergence_tolerance": conv_tol,
            "energy_balance_error": fine["energy_balance_error"],
            "energy_tolerance": energy_tol,
        },
        "observables": {
            "R": fine["R"],
            "T": fine["T"],
            "A_or_numeric_residual": fine["A_or_numeric_residual"],
            "R_by_order": fine["R_by_order"],
            "T_by_order": fine["T_by_order"],
        },
        "artifacts": {},
        "runtime_ms": runtime_ms,
        "lineage": list(job.get("lineage") or []) + [f"omega-sovereign:rcwa:{WORKER_VERSION}"],
        "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "numerical_identity": {
            "python": sys.version.split()[0],
            "platform": platform.platform(),
            "worker_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            "input_sha256": _sha(job),
        },
        "truth_boundary": "RCWA result from grcwa. Converged numerical output is not fabrication validation; independent measurement remains required.",
    }
    result["result_sha256"] = _sha(result)
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--output", required=True)
    args = ap.parse_args()
    out = Path(args.output)
    try:
        job = json.loads(Path(args.input).read_text("utf-8"))
        result = solve(job)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(result, indent=2), "utf-8")
        print(json.dumps({"ok": True, "output": str(out), "converged": result["converged"], "result_sha256": result["result_sha256"]}))
        return 0 if result["converged"] else 3
    except Exception as exc:
        failure = {
            "schema": RESULT_SCHEMA,
            "packet_id": "failure_" + hashlib.sha256(str(time.time()).encode()).hexdigest()[:20],
            "source_packet_id": None,
            "worker": "omega-sovereign",
            "solver": "rcwa",
            "solver_version": f"omega-worker:{WORKER_VERSION}",
            "converged": False,
            "convergence_metrics": {},
            "observables": {},
            "runtime_ms": 0,
            "lineage": [],
            "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "error": str(exc),
            "trace": traceback.format_exc(limit=5),
            "truth_boundary": "No RCWA success is claimed for this failed worker invocation.",
        }
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(failure, indent=2), "utf-8")
        print(json.dumps({"ok": False, "error": str(exc), "output": str(out)}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
