#!/usr/bin/env python3
"""OMEGA R35 dispersion-aware spectral RCWA orchestrator.

Runs the canonical R3 RCWA solve independently at each requested wavelength,
resolving material dispersion for that wavelength and preserving each numerical
result packet. This is a numerical sweep, not measured validation.
"""
from __future__ import annotations
import argparse, copy, hashlib, json, time
from pathlib import Path
from omega_materials import resolve_stack, VERSION as MATERIAL_LIBRARY_VERSION
from omega_rcwa_worker import solve, _sha

SCHEMA="OMEGA_SPECTRAL_RESULT_v1"
VERSION="R35.0"

def _wl_list(job):
    s=job.get("spectral") or {}
    if "wavelengths_nm" in s:
        vals=[float(x) for x in s["wavelengths_nm"]]
    else:
        start=float(s.get("start_nm",430)); stop=float(s.get("stop_nm",680)); step=float(s.get("step_nm",10))
        if step<=0 or stop<start: raise ValueError("invalid spectral range")
        vals=[]; x=start
        while x <= stop+1e-9:
            vals.append(round(x,9)); x+=step
    if not vals or len(vals)>128: raise ValueError("spectral sweep must contain 1..128 wavelengths")
    return vals

def run(job):
    if job.get("schema")!="OMEGA_FULLWAVE_QUEUE_v1" or str(job.get("solver","")).lower()!="rcwa":
        raise ValueError("requires OMEGA_FULLWAVE_QUEUE_v1 solver=rcwa")
    spec=job.get("material_names") or {"incident":"air","feature":"tio2_design","background":"air","substrate":"sio2_fused"}
    t0=time.perf_counter(); points=[]
    for wl in _wl_list(job):
        model, provenance=resolve_stack(spec,wl)
        child=copy.deepcopy(job)
        child["wavelength_nm"]=wl
        child["material_model"]={k:str(v) for k,v in model.items()}
        child.pop("spectral",None)
        child["lineage"]=list(job.get("lineage") or [])+[f"omega-materials:{MATERIAL_LIBRARY_VERSION}:{wl}nm"]
        result=solve(child)
        points.append({"wavelength_nm":wl,"materials":{k:{**v,"n":str(v["n"])} for k,v in provenance.items()},"result":result})
    converged=all(p["result"].get("converged") for p in points)
    out={"schema":SCHEMA,"version":VERSION,"source_packet_id":str(job.get("source_packet_id")),"job_id":str(job.get("job_id")),"solver":"rcwa","material_library_version":MATERIAL_LIBRARY_VERSION,"converged_all":converged,"points":points,"runtime_ms":(time.perf_counter()-t0)*1000,"completed_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"truth_boundary":"Dispersion-aware grcwa numerical sweep. No fabrication or measured-device validation is claimed."}
    out["result_sha256"]=_sha(out)
    return out

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--input",required=True); ap.add_argument("--output",required=True); a=ap.parse_args()
    job=json.loads(Path(a.input).read_text("utf-8")); out=run(job); p=Path(a.output); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(out,indent=2),"utf-8")
    print(json.dumps({"ok":out["converged_all"],"points":len(out["points"]),"result_sha256":out["result_sha256"]}))
    return 0 if out["converged_all"] else 3
if __name__=="__main__": raise SystemExit(main())
