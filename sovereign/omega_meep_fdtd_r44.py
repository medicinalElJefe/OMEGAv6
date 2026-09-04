#!/usr/bin/env python3
"""OMEGA R44 independent Meep FDTD cross-check for the optical primitive.

This is intentionally independent of grcwa. It time-steps Maxwell's equations
with Meep in a 3D periodic unit cell, samples the transmitted zero diffraction
order by spatially averaging complex DFT fields over a full unit-cell plane,
and tests the relative converted-helicity phase versus ±2θ.

Agreement is reported, never forced. No scalar or RCWA fallback exists.
"""
from __future__ import annotations
import argparse, copy, json, math, time
from pathlib import Path
import numpy as np

try:
    import meep as mp
except Exception as exc:  # explicit truth boundary: no fake fallback
    raise RuntimeError(f"FDTD_DEPENDENCY_MISSING: pymeep import failed: {exc}") from exc

from omega_materials import resolve_stack, VERSION as MATERIAL_LIBRARY_VERSION
from omega_rcwa_worker import _sha

SCHEMA = "OMEGA_FDTD_PB_CROSSCHECK_v1"
VERSION = "R44.0"
SQRT2 = math.sqrt(2.0)


def wrap_deg(x):
    return float((float(x) + 180.0) % 360.0 - 180.0)


def cpack(z):
    z = complex(z)
    return {"re": float(z.real), "im": float(z.imag), "abs": float(abs(z)),
            "phase_deg": float(math.degrees(math.atan2(z.imag, z.real)))}


def _mean_complex(arr):
    return complex(np.mean(np.asarray(arr, dtype=np.complex128)))


def simulate_state(spec, geometry, wavelength_nm, theta_deg, resolution=80, input_helicity="R",
                   dft_tol=1e-6, max_run_time=350.0):
    wl_um = float(wavelength_nm) / 1000.0
    freq = 1.0 / wl_um
    g = {k: float(geometry[k]) / 1000.0 for k in ("pitch_nm", "width_nm", "length_nm", "height_nm")}
    pitch, width, length, height = g["pitch_nm"], g["width_nm"], g["length_nm"], g["height_nm"]
    if math.hypot(width, length) >= pitch:
        raise ValueError("rotated feature does not fit inside periodic unit cell")

    indices, provenance = resolve_stack(spec.get("material_names") or {}, wavelength_nm)
    n_air = float(indices["n_background"].real)
    n_feature = float(indices["n_feature"].real)
    n_substrate = float(indices["n_substrate"].real)
    if any(abs(v.imag) > 1e-12 for v in indices.values()):
        raise ValueError("R44 initial Meep cross-check is lossless-only; complex index requires explicit dispersive/loss model")

    dpml = 0.30
    substrate_buffer = 0.50
    air_buffer = 0.80
    sz = 2.0 * dpml + substrate_buffer + height + air_buffer
    source_z = height + 0.18
    monitor_z = -0.18
    pml_start_top = 0.5 * sz - dpml
    if source_z >= pml_start_top:
        raise ValueError("source plane intrudes into top PML")

    th = math.radians(float(theta_deg))
    e1 = mp.Vector3(math.cos(th), math.sin(th), 0)
    e2 = mp.Vector3(-math.sin(th), math.cos(th), 0)
    substrate = mp.Medium(index=n_substrate)
    feature = mp.Medium(index=n_feature)
    background = mp.Medium(index=n_air)

    geometry_meep = [
        mp.Block(size=mp.Vector3(mp.inf, mp.inf, 0.5 * sz),
                 center=mp.Vector3(0, 0, -0.25 * sz), material=substrate),
        mp.Block(size=mp.Vector3(length, width, height),
                 center=mp.Vector3(0, 0, 0.5 * height),
                 e1=e1, e2=e2, e3=mp.Vector3(0, 0, 1), material=feature),
    ]

    helicity = str(input_helicity).upper()
    if helicity == "R":
        ax, ay = 1.0 / SQRT2, -1j / SQRT2
    elif helicity == "L":
        ax, ay = 1.0 / SQRT2, +1j / SQRT2
    else:
        raise ValueError("input_helicity must be R or L")
    pulse = mp.GaussianSource(frequency=freq, fwidth=0.20 * freq, cutoff=4.0)
    sources = [
        mp.Source(pulse, component=mp.Ex, center=mp.Vector3(0, 0, source_z),
                  size=mp.Vector3(pitch, pitch, 0), amplitude=ax),
        mp.Source(pulse, component=mp.Ey, center=mp.Vector3(0, 0, source_z),
                  size=mp.Vector3(pitch, pitch, 0), amplitude=ay),
    ]

    mp.verbosity(0)
    sim = mp.Simulation(cell_size=mp.Vector3(pitch, pitch, sz),
                        boundary_layers=[mp.PML(dpml, direction=mp.Z)],
                        geometry=geometry_meep, sources=sources,
                        default_material=background, resolution=int(resolution),
                        k_point=mp.Vector3(0, 0, 0), ensure_periodicity=True,
                        eps_averaging=True, dimensions=3)
    mon = sim.add_dft_fields([mp.Ex, mp.Ey], freq, 0, 1,
                             center=mp.Vector3(0, 0, monitor_z),
                             size=mp.Vector3(pitch, pitch, 0))
    t0 = time.perf_counter()
    sim.run(until_after_sources=mp.stop_when_dft_decayed(
        tol=float(dft_tol), minimum_run_time=10.0, maximum_run_time=float(max_run_time)))
    runtime = time.perf_counter() - t0
    ex = _mean_complex(sim.get_dft_array(mon, mp.Ex, 0))
    ey = _mean_complex(sim.get_dft_array(mon, mp.Ey, 0))
    # U†[Ex,Ey]: c_R=(Ex+iEy)/sqrt2, c_L=(Ex-iEy)/sqrt2.
    c_r = (ex + 1j * ey) / SQRT2
    c_l = (ex - 1j * ey) / SQRT2
    if helicity == "R":
        same, cross, channel = c_r, c_l, "R_to_L"
    else:
        same, cross, channel = c_l, c_r, "L_to_R"
    denom = max(1e-30, abs(same) ** 2 + abs(cross) ** 2)
    conversion = float(abs(cross) ** 2 / denom)
    sim.reset_meep()

    return {
        "theta_deg": float(theta_deg), "wavelength_nm": float(wavelength_nm),
        "resolution_px_per_um": int(resolution), "input_helicity": helicity,
        "converted_channel": channel, "Ex_zero_order": cpack(ex), "Ey_zero_order": cpack(ey),
        "same_helicity": cpack(same), "converted_helicity": cpack(cross),
        "converted_fraction": conversion, "runtime_s": float(runtime),
        "material_provenance": provenance,
        "zero_order_method": "complex spatial average of Ex/Ey DFT fields over one full periodic transmission plane",
    }


def phase_test(states, phase_tolerance_deg=15.0, conversion_floor=0.05):
    if not states:
        raise ValueError("no FDTD states")
    states = sorted(states, key=lambda s: s["theta_deg"])
    p0 = states[0]["converted_helicity"]["phase_deg"]
    trials = {}
    for sign in (-1.0, +1.0):
        errors = []
        qualified = 0
        rows = []
        for s in states:
            actual = wrap_deg(s["converted_helicity"]["phase_deg"] - p0)
            expected = wrap_deg(sign * 2.0 * s["theta_deg"])
            err = wrap_deg(actual - expected)
            q = bool(s["converted_fraction"] >= conversion_floor and s["converted_helicity"]["abs"] > 1e-10)
            if q:
                errors.append(err); qualified += 1
            rows.append({"theta_deg": s["theta_deg"], "qualified": q,
                         "actual_relative_phase_deg": actual, "expected_deg": expected, "error_deg": err})
        rms = math.sqrt(sum(e * e for e in errors) / len(errors)) if errors else None
        trials[str(int(sign))] = {"sign": sign, "qualified_states": qualified,
                                  "rms_phase_error_deg": rms, "rows": rows}
    eligible = [v for v in trials.values() if v["rms_phase_error_deg"] is not None]
    best = min(eligible, key=lambda v: v["rms_phase_error_deg"]) if eligible else None
    verified = bool(best and best["qualified_states"] == len(states) and
                    best["rms_phase_error_deg"] <= float(phase_tolerance_deg))
    return {"phase_tolerance_deg": float(phase_tolerance_deg), "conversion_floor": float(conversion_floor),
            "sign_trials": trials, "best_sign": best["sign"] if best else None,
            "best_rms_phase_error_deg": best["rms_phase_error_deg"] if best else None,
            "fdtd_pb_consistent": verified,
            "sign_note": "Propagation/basis conventions may reverse the PB sign; R44 tests both signs and reports the lower-error convention rather than relabeling helicity."}


def crosscheck(config):
    wavelength = float(config.get("wavelength_nm", 532.0))
    resolution = int(config.get("resolution_px_per_um", 80))
    angles = [float(x) for x in config.get("angles_deg", [0, 45, 90])]
    helicity = str(config.get("input_helicity", "R")).upper()
    results = {}
    for name, geom in (config.get("geometries") or {}).items():
        states = [simulate_state(config, geom, wavelength, th, resolution, helicity,
                                 config.get("dft_tol", 1e-6), config.get("max_run_time", 350.0)) for th in angles]
        results[name] = {"geometry": copy.deepcopy(geom), "states": states,
                         "phase_test": phase_test(states, config.get("phase_tolerance_deg", 15.0),
                                                  config.get("conversion_floor", 0.05))}
    out = {
        "schema": SCHEMA, "version": VERSION, "backend": "Meep FDTD",
        "backend_version": getattr(mp, "__version__", "unknown"),
        "material_library_version": MATERIAL_LIBRARY_VERSION,
        "wavelength_nm": wavelength, "angles_deg": angles, "resolution_px_per_um": resolution,
        "results": results,
        "truth_boundary": "R44 is an independent time-domain Meep FDTD cross-check of selected orientation states. It is not RCWA, does not mutate CanonState, does not establish fabrication performance, and does not claim convergence until a separate resolution study is passed."
    }
    out["proof_sha256"] = _sha(out)
    return out


def main():
    p = argparse.ArgumentParser(); p.add_argument("--input", required=True); p.add_argument("--output", required=True)
    a = p.parse_args(); cfg = json.loads(Path(a.input).read_text("utf-8")); out = crosscheck(cfg)
    Path(a.output).write_text(json.dumps(out, indent=2), "utf-8")
    print(json.dumps({"backend": out["backend"], "backend_version": out["backend_version"],
                      "verdicts": {k: v["phase_test"] for k, v in out["results"].items()},
                      "proof_sha256": out["proof_sha256"]}))
    return 0

if __name__ == "__main__": raise SystemExit(main())
