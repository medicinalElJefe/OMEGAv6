#!/usr/bin/env python3
"""OMEGA R40 PB angular grid-convergence diagnostic.

Holds physical geometry fixed and varies the RCWA epsilon-grid resolution to
separate physical phase error from rotated-mask discretization error.
"""
from __future__ import annotations
import argparse,copy,json
from pathlib import Path
from omega_pb_phase import pb_scan
from omega_rcwa_worker import _sha

SCHEMA='OMEGA_PB_GRID_CONVERGENCE_v1'; VERSION='R40.0'

def run(job,wavelength_nm=532.0,grids=(32,64,96),harmonics=49):
    cases=[]
    for n in grids:
        j=copy.deepcopy(job)
        num=dict(j.get('numerics') or {})
        num.update({'nx':int(n),'ny':int(n),'harmonics_high':int(harmonics)})
        j['numerics']=num
        p=pb_scan(j,wavelength_nm)
        cases.append({'grid':int(n),'basis_verified':p['basis_verified'],'qualified_states':p['qualified_states'],'rms_phase_error_deg':p['rms_phase_error_deg'],'pb_phase_verified':p['pb_phase_verified'],'max_abs_error_deg':{ch:max(abs(s['pb_test'][ch]['error_deg']) for s in p['states'] if s['pb_test'][ch]['qualified']) for ch in ('LR','RL')}})
    out={'schema':SCHEMA,'version':VERSION,'wavelength_nm':float(wavelength_nm),'geometry':job.get('geometry'),'cases':cases,'truth_boundary':'Geometry is fixed. Changes across cases diagnose numerical spatial discretization; this is not fabrication validation.'}
    out['proof_sha256']=_sha(out); return out

def main():
    a=argparse.ArgumentParser(); a.add_argument('--input',required=True); a.add_argument('--output',required=True); a.add_argument('--grids',default='32,64,96'); x=a.parse_args()
    job=json.loads(Path(x.input).read_text('utf-8')); grids=[int(v) for v in x.grids.split(',') if v.strip()]
    out=run(job,532.0,grids); Path(x.output).write_text(json.dumps(out,indent=2),'utf-8'); print(json.dumps(out)); return 0
if __name__=='__main__': raise SystemExit(main())
