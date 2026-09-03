#!/usr/bin/env python3
"""OMEGA R36 12-state validation loop.

Runs one anisotropic geometry family across the canonical 12 orientation states,
multiple wavelengths, and both linear input polarizations. It composes the R35
spectral RCWA engine; it does not invent phase/Jones data that the backend has
not yet exposed.
"""
from __future__ import annotations
import argparse, copy, json, time
from pathlib import Path
from omega_rcwa_spectral import run as run_spectral
from omega_rcwa_worker import _sha

SCHEMA="OMEGA_12STATE_EXPERIMENT_v1"
VERSION="R36.0"

def run(job):
    base=copy.deepcopy(job)
    if base.get("schema")!="OMEGA_FULLWAVE_QUEUE_v1" or str(base.get("solver","")).lower()!="rcwa":
        raise ValueError("requires OMEGA_FULLWAVE_QUEUE_v1 solver=rcwa")
    wavelengths=list((base.get("spectral") or {}).get("wavelengths_nm") or [470,532,650])
    if len(wavelengths)<1 or len(wavelengths)>16: raise ValueError("use 1..16 wavelengths")
    states=[]; t0=time.perf_counter()
    for k in range(12):
        theta=15.0*k
        target_phase=(30.0*k)%360.0
        pols={}
        for pol in ("s","p"):
            child=copy.deepcopy(base)
            child.setdefault("geometry",{})["theta_deg"]=theta
            child["polarization"]=pol
            child["spectral"]={"wavelengths_nm":wavelengths}
            child["job_id"]=f"{base.get('job_id','omega12')}_k{k:02d}_{pol}"
            child["lineage"]=list(base.get("lineage") or [])+[f"omega-12state:k={k}:theta={theta}:pol={pol}"]
            pols[pol]=run_spectral(child)
        states.append({"k":k,"theta_deg":theta,"target_pb_phase_deg":target_phase,"polarizations":pols})
    all_conv=all(v["converged_all"] for s in states for v in s["polarizations"].values())
    out={"schema":SCHEMA,"version":VERSION,"source_packet_id":str(base.get("source_packet_id")),"geometry_family":{k:v for k,v in (base.get("geometry") or {}).items() if k!="theta_deg"},"wavelengths_nm":wavelengths,"orientation_rule":"theta_k=15deg*k","target_phase_rule":"Phi_k=30deg*k (PB design target only; not measured here)","states":states,"fullwave_solve_count":12*2*len(wavelengths),"converged_all":all_conv,"phase_observable_available":False,"jones_matrix_available":False,"runtime_ms":(time.perf_counter()-t0)*1000,"completed_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"truth_boundary":"This experiment validates wavelength/polarization-resolved RCWA power response and convergence. PB phase and Jones-matrix agreement are NOT claimed until complex field/amplitude extraction is implemented and verified."}
    out["result_sha256"]=_sha(out)
    return out

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--input",required=True); ap.add_argument("--output",required=True); a=ap.parse_args()
    job=json.loads(Path(a.input).read_text("utf-8")); out=run(job); p=Path(a.output); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(out,indent=2),"utf-8")
    print(json.dumps({"ok":out["converged_all"],"states":len(out["states"]),"fullwave_solve_count":out["fullwave_solve_count"],"result_sha256":out["result_sha256"]}))
    return 0 if out["converged_all"] else 3
if __name__=="__main__": raise SystemExit(main())
