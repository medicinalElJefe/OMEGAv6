#!/usr/bin/env python3
"""OMEGA R39 complete 12-state PB evidence ledger.

Runs the R38 proof at declared wavelengths and emits a compact auditable ledger.
This records pass/fail; it never converts a failed optical candidate into success.
"""
from __future__ import annotations
import argparse,csv,json,time
from pathlib import Path
from omega_pb_phase import pb_scan
from omega_rcwa_worker import _sha

SCHEMA="OMEGA_PB_LEDGER_v1"; VERSION="R39.0"

def run(job,wavelengths=(470.0,532.0,650.0),phase_tol=12.0,conversion_floor=0.05):
    proofs=[]; rows=[]
    for wl in wavelengths:
        p=pb_scan(job,float(wl),phase_tol,conversion_floor)
        proofs.append(p)
        for s in p["states"]:
            for channel in ("LR","RL"):
                t=s["pb_test"][channel]
                rows.append({"wavelength_nm":float(wl),"theta_deg":s["theta_deg"],"channel":channel,"qualified":t["qualified"],"conversion":s["conversion"]["R_to_L" if channel=="LR" else "L_to_R"],"actual_relative_phase_deg":t["actual_relative_phase_deg"],"expected_deg":t["expected_deg"],"error_deg":t["error_deg"],"basis_verified":p["basis_verified"],"pb_phase_verified":p["pb_phase_verified"]})
    out={"schema":SCHEMA,"version":VERSION,"source_packet_id":str(job.get("source_packet_id","")),"wavelengths_nm":[float(x) for x in wavelengths],"all_wavelengths_verified":all(p["pb_phase_verified"] for p in proofs),"proofs":proofs,"rows":rows,"completed_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"truth_boundary":"A numerical PB ledger is design evidence only. Failed states remain failed; fabrication validation requires independent measurement."}
    out["ledger_sha256"]=_sha(out); return out

def main():
    a=argparse.ArgumentParser(); a.add_argument("--input",required=True); a.add_argument("--output",required=True); a.add_argument("--csv"); a.add_argument("--wavelengths",default="470,532,650"); x=a.parse_args()
    job=json.loads(Path(x.input).read_text("utf-8")); w=[float(v) for v in x.wavelengths.split(",") if v.strip()]; out=run(job,w)
    Path(x.output).write_text(json.dumps(out,indent=2),"utf-8")
    if x.csv:
        with open(x.csv,"w",newline="",encoding="utf-8") as f:
            z=csv.DictWriter(f,fieldnames=list(out["rows"][0])); z.writeheader(); z.writerows(out["rows"])
    print(json.dumps({"all_wavelengths_verified":out["all_wavelengths_verified"],"rows":len(out["rows"]),"ledger_sha256":out["ledger_sha256"]}))
    return 0
if __name__=="__main__": raise SystemExit(main())
