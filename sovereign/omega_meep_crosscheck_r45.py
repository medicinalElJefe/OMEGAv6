#!/usr/bin/env python3
"""OMEGA R45 independent Meep full-wave cross-check.

This is deliberately independent of RCWA for the primary field solve.  It uses
MIT Meep finite-difference time-domain propagation in a 3D periodic unit cell,
extracts the complex zero-order transmitted field, builds a Cartesian transfer
matrix from independent x/y excitations, transforms it into the same declared
circular basis as R38, and compares selected states against both the PB target
and the R44 RCWA prediction.

A failed cross-check is valid evidence.  This module never rewrites failure into
success and never treats numerical agreement as fabrication validation.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
from pathlib import Path

import meep as mp
import numpy as np

from omega_materials import resolve_stack
from omega_pb_phase import U, circular_state, wrap_deg

SCHEMA = "OMEGA_MEEP_CROSSCHECK_v1"
VERSION = "R45.0"


def _sha(obj):
    raw = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _c(z):
    z = complex(z)
    return {
        "re": float(z.real),
        "im": float(z.imag),
        "abs": float(abs(z)),
        "phase_deg": float(math.degrees(math.atan2(z.imag, z.real))),
    }


def _z(d):
    return complex(float(d["re"]), float(d["im"]))


def _mean_dft(sim, dft, component):
    arr = np.asarray(sim.get_dft_array(dft, component, 0), dtype=complex)
    return complex(np.mean(arr))


def _run_field(job, wavelength_nm, theta_deg, input_pol, include_pillar=True, resolution=100):
    g = job["geometry"]
    pitch = float(g["pitch_nm"]) / 1000.0
    width = float(g["width_nm"]) / 1000.0
    length = float(g["length_nm"]) / 1000.0
    height = float(g["height_nm"]) / 1000.0
    wl = float(wavelength_nm) / 1000.0

    names = job.get("material_names") or {
        "incident": "air",
        "feature": "tio2_design",
        "background": "air",
        "substrate": "sio2_fused",
    }
    model, provenance = resolve_stack(names, wavelength_nm)
    n_feature = float(complex(model["n_feature"]).real)
    n_substrate = float(complex(model["n_substrate"]).real)

    # Symmetric z padding around the pillar, with PML only in z.  k_point=0
    # makes x/y periodic for this normal-incidence unit-cell calculation.
    dpml = 0.25
    buffer = 0.45
    cell_z = height + 2.0 * (buffer + dpml)
    cell = mp.Vector3(pitch, pitch, cell_z)
    interface_z = -0.5 * height
    src_z = 0.5 * height + 0.20
    mon_z = interface_z - 0.18

    substrate = mp.Block(
        center=mp.Vector3(0, 0, interface_z - 0.5 * cell_z),
        size=mp.Vector3(mp.inf, mp.inf, cell_z),
        material=mp.Medium(index=n_substrate),
    )
    geometry = [substrate]
    if include_pillar:
        th = math.radians(float(theta_deg))
        e1 = mp.Vector3(1, 0, 0).rotate(mp.Vector3(0, 0, 1), th)
        e2 = mp.Vector3(0, 1, 0).rotate(mp.Vector3(0, 0, 1), th)
        geometry.append(
            mp.Block(
                center=mp.Vector3(0, 0, 0),
                size=mp.Vector3(length, width, height),
                e1=e1,
                e2=e2,
                e3=mp.Vector3(0, 0, 1),
                material=mp.Medium(index=n_feature),
            )
        )

    comp = mp.Ex if input_pol == "x" else mp.Ey
    fcen = 1.0 / wl
    sources = [
        mp.Source(
            src=mp.GaussianSource(frequency=fcen, fwidth=0.25 * fcen),
            component=comp,
            center=mp.Vector3(0, 0, src_z),
            size=mp.Vector3(pitch, pitch, 0),
        )
    ]
    sim = mp.Simulation(
        cell_size=cell,
        geometry=geometry,
        sources=sources,
        boundary_layers=[mp.PML(dpml, direction=mp.Z)],
        k_point=mp.Vector3(0, 0, 0),
        resolution=int(resolution),
        force_complex_fields=True,
        eps_averaging=True,
    )
    dft = sim.add_dft_fields(
        [mp.Ex, mp.Ey],
        fcen,
        0,
        1,
        center=mp.Vector3(0, 0, mon_z),
        size=mp.Vector3(pitch, pitch, 0),
    )
    sim.run(until_after_sources=mp.stop_when_fields_decayed(20, comp, mp.Vector3(0, 0, mon_z), 1e-6))
    ex = _mean_dft(sim, dft, mp.Ex)
    ey = _mean_dft(sim, dft, mp.Ey)
    return {
        "input": input_pol,
        "theta_deg": float(theta_deg),
        "wavelength_nm": float(wavelength_nm),
        "resolution_px_per_um": int(resolution),
        "Ex": _c(ex),
        "Ey": _c(ey),
        "meep_version": str(getattr(mp, "__version__", "unknown")),
        "material_provenance": {k: {**v, "n": str(v["n"])} for k, v in provenance.items()},
    }


def _linear_matrix(job, wavelength_nm, theta_deg, refs, resolution):
    x = _run_field(job, wavelength_nm, theta_deg, "x", True, resolution)
    y = _run_field(job, wavelength_nm, theta_deg, "y", True, resolution)
    rx = _z(refs["x"]["Ex"])
    ry = _z(refs["y"]["Ey"])
    if abs(rx) < 1e-12 or abs(ry) < 1e-12:
        raise RuntimeError("Meep reference field too small for transfer normalization")
    J = np.array(
        [
            [_z(x["Ex"]) / rx, _z(y["Ex"]) / ry],
            [_z(x["Ey"]) / rx, _z(y["Ey"]) / ry],
        ],
        dtype=complex,
    )
    return J, {"x_input": x, "y_input": y}


def _circular(J):
    Jc = U.conj().T @ np.asarray(J, dtype=complex).reshape(2, 2) @ U
    denom_r = max(1e-30, float(np.sum(np.abs(Jc[:, 0]) ** 2)))
    denom_l = max(1e-30, float(np.sum(np.abs(Jc[:, 1]) ** 2)))
    return Jc, {
        "R_to_L": float(abs(Jc[1, 0]) ** 2 / denom_r),
        "L_to_R": float(abs(Jc[0, 1]) ** 2 / denom_l),
    }


def _matrix_packet(J):
    return {
        "t_xx": _c(J[0, 0]),
        "t_xy": _c(J[0, 1]),
        "t_yx": _c(J[1, 0]),
        "t_yy": _c(J[1, 1]),
    }


def _circ_packet(Jc):
    return {
        "t_RR": _c(Jc[0, 0]),
        "t_RL": _c(Jc[0, 1]),
        "t_LR": _c(Jc[1, 0]),
        "t_LL": _c(Jc[1, 1]),
    }


def run(job, wavelength_nm=532.0, angles=(0.0, 45.0, 90.0), resolution=100, phase_tol_deg=20.0):
    angles = [float(a) for a in angles]
    if 0.0 not in angles or 90.0 not in angles:
        raise ValueError("R45 selected cross-check requires 0 and 90 degrees for basis symmetry")

    refs = {
        "x": _run_field(job, wavelength_nm, 0.0, "x", False, resolution),
        "y": _run_field(job, wavelength_nm, 0.0, "y", False, resolution),
    }

    states = []
    for theta in angles:
        J, raw = _linear_matrix(job, wavelength_nm, theta, refs, resolution)
        Jc, conv = _circular(J)
        rcwa = circular_state(copy.deepcopy(job), wavelength_nm, theta)
        states.append(
            {
                "theta_deg": theta,
                "meep": {
                    "linear_matrix": _matrix_packet(J),
                    "circular_matrix": _circ_packet(Jc),
                    "conversion": conv,
                    "raw": raw,
                },
                "rcwa": {
                    "circular_matrix": rcwa["circular_basis"]["matrix"],
                    "conversion": rcwa["conversion"],
                },
            }
        )

    # Basis consistency: principal channels at 0/90 should swap under a 90° rotation.
    s0 = next(s for s in states if s["theta_deg"] == 0.0)
    s90 = next(s for s in states if s["theta_deg"] == 90.0)
    m0 = s0["meep"]["linear_matrix"]
    m90 = s90["meep"]["linear_matrix"]
    ax, ay = _z(m0["t_xx"]), _z(m0["t_yy"])
    bx, by = _z(m90["t_xx"]), _z(m90["t_yy"])
    scale = max(1e-12, abs(ax), abs(ay), abs(bx), abs(by))
    swap_error = float(max(abs(ax - by), abs(ay - bx)) / scale)
    cross_ratio = float(
        max(abs(_z(m0["t_xy"])), abs(_z(m0["t_yx"])), abs(_z(m90["t_xy"])), abs(_z(m90["t_yx"]))) / scale
    )
    basis_verified = bool(swap_error <= 0.20 and cross_ratio <= 0.30)

    # Relative PB phases are referenced to theta=0 separately for each solver.
    meep_p0_lr = s0["meep"]["circular_matrix"]["t_LR"]["phase_deg"]
    meep_p0_rl = s0["meep"]["circular_matrix"]["t_RL"]["phase_deg"]
    rcwa_p0_lr = s0["rcwa"]["circular_matrix"]["t_LR"]["phase_deg"]
    rcwa_p0_rl = s0["rcwa"]["circular_matrix"]["t_RL"]["phase_deg"]

    selected_errors = []
    for s in states:
        th = s["theta_deg"]
        mlr = wrap_deg(s["meep"]["circular_matrix"]["t_LR"]["phase_deg"] - meep_p0_lr)
        mrl = wrap_deg(s["meep"]["circular_matrix"]["t_RL"]["phase_deg"] - meep_p0_rl)
        rlr = wrap_deg(s["rcwa"]["circular_matrix"]["t_LR"]["phase_deg"] - rcwa_p0_lr)
        rrl = wrap_deg(s["rcwa"]["circular_matrix"]["t_RL"]["phase_deg"] - rcwa_p0_rl)
        exp_lr = wrap_deg(-2.0 * th)
        exp_rl = wrap_deg(+2.0 * th)
        metrics = {
            "meep_relative_phase_deg": {"LR": mlr, "RL": mrl},
            "rcwa_relative_phase_deg": {"LR": rlr, "RL": rrl},
            "pb_expected_deg": {"LR": exp_lr, "RL": exp_rl},
            "meep_pb_error_deg": {"LR": wrap_deg(mlr - exp_lr), "RL": wrap_deg(mrl - exp_rl)},
            "meep_minus_rcwa_deg": {"LR": wrap_deg(mlr - rlr), "RL": wrap_deg(mrl - rrl)},
        }
        s["comparison"] = metrics
        if th != 0.0:
            selected_errors.extend(abs(v) for v in metrics["meep_pb_error_deg"].values())
            selected_errors.extend(abs(v) for v in metrics["meep_minus_rcwa_deg"].values())

    min_conversion = min(
        min(s["meep"]["conversion"]["R_to_L"], s["meep"]["conversion"]["L_to_R"]) for s in states
    )
    phase_ok = bool(selected_errors and max(selected_errors) <= float(phase_tol_deg))
    crosscheck_passed = bool(basis_verified and min_conversion >= 0.05 and phase_ok)

    out = {
        "schema": SCHEMA,
        "version": VERSION,
        "solver": {
            "primary": "meep-fdtd",
            "independent_of_rcwa": True,
            "meep_version": refs["x"]["meep_version"],
            "resolution_px_per_um": int(resolution),
            "subpixel_averaging": True,
            "boundary_model": "Bloch-periodic x/y at k=0; PML z",
        },
        "wavelength_nm": float(wavelength_nm),
        "angles_deg": angles,
        "basis": {
            "verified": basis_verified,
            "rotation_swap_error": swap_error,
            "cross_coupling_ratio": cross_ratio,
            "swap_tolerance": 0.20,
            "cross_tolerance": 0.30,
        },
        "phase_tolerance_deg": float(phase_tol_deg),
        "minimum_meep_conversion_fraction": float(min_conversion),
        "crosscheck_passed": crosscheck_passed,
        "reference_fields": refs,
        "states": states,
        "truth_boundary": "Independent Meep finite-difference Maxwell evidence on selected states only. A pass is cross-solver numerical support, not fabrication validation; a fail remains a fail and requires diagnosis rather than threshold relaxation.",
    }
    out["proof_sha256"] = _sha(out)
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--wavelength", type=float, default=532.0)
    p.add_argument("--angles", default="0,45,90")
    p.add_argument("--resolution", type=int, default=100)
    p.add_argument("--phase-tol", type=float, default=20.0)
    a = p.parse_args()
    job = json.loads(Path(a.input).read_text("utf-8"))
    angles = [float(v) for v in a.angles.split(",") if v.strip()]
    out = run(job, a.wavelength, angles, a.resolution, a.phase_tol)
    Path(a.output).write_text(json.dumps(out, indent=2), "utf-8")
    print(json.dumps({
        "crosscheck_passed": out["crosscheck_passed"],
        "basis": out["basis"],
        "minimum_meep_conversion_fraction": out["minimum_meep_conversion_fraction"],
        "proof_sha256": out["proof_sha256"],
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
