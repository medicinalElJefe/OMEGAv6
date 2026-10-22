#!/usr/bin/env python3
"""OMEGA R37 complex transmitted-field extraction for grcwa.

Purpose: verify the complex zero-order transmitted field basis before any Jones
or PB-phase claim is admitted. At normal incidence with phi=0, grcwa's p input
is treated as x-basis and s input as y-basis. This module checks that assumption
against 0/90-degree rotational symmetry before marking the basis verified.
"""
from __future__ import annotations
import copy, json, math
import numpy as np
import grcwa
from omega_materials import resolve_stack
from omega_rcwa_worker import _geometry, _build_eps_grid, _finite, _sha

VERSION="R37.0"
SCHEMA="OMEGA_COMPLEX_TRANSMISSION_v1"

def _c(z):
    z=complex(z); return {"re":float(z.real),"im":float(z.imag),"abs":float(abs(z)),"phase_deg":float(math.degrees(math.atan2(z.imag,z.real)))}

def _zero_order_index(obj):
    G=np.asarray(getattr(obj,"G",[]))
    if G.ndim==2 and G.shape[1]>=2:
        hits=np.where((G[:,0]==0)&(G[:,1]==0))[0]
        if len(hits): return int(hits[0])
    return 0

def _build(job, wavelength_nm, theta_deg, polarization):
    pitch,width,length,height,_=_geometry(job)
    names=job.get("material_names") or {"incident":"air","feature":"tio2_design","background":"air","substrate":"sio2_fused"}
    model,prov=resolve_stack(names,wavelength_nm)
    numerics=job.get("numerics") or {}
    nG=int(_finite("harmonics",numerics.get("harmonics_high",81),9,801)); nx=int(_finite("nx",numerics.get("nx",64),16,512)); ny=int(_finite("ny",numerics.get("ny",64),16,512))
    eps_i=model["n_incident"]**2; eps_f=model["n_feature"]**2; eps_b=model["n_background"]**2; eps_s=model["n_substrate"]**2
    obj=grcwa.obj(nG,[pitch,0.0],[0.0,pitch],1.0/float(wavelength_nm),0.0,0.0,verbose=0)
    buffer_nm=max(pitch,float(wavelength_nm))
    obj.Add_LayerUniform(buffer_nm,eps_i); obj.Add_LayerGrid(height,nx,ny); obj.Add_LayerUniform(buffer_nm,eps_s); obj.Init_Setup(Gmethod=0)
    if polarization=="x": obj.MakeExcitationPlanewave(1.0,0.0,0.0,0.0,order=0)
    elif polarization=="y": obj.MakeExcitationPlanewave(0.0,0.0,1.0,0.0,order=0)
    else: raise ValueError("polarization must be x or y")
    eps=_build_eps_grid(np,nx,ny,pitch,width,length,theta_deg,eps_f,eps_b); obj.GridLayer_geteps(eps.flatten())
    R,T=obj.RT_Solve(normalize=1)
    E,H=obj.Solve_FieldFourier(2,0.0)
    zi=_zero_order_index(obj)
    Ex=np.asarray(E[0]).reshape(-1)[zi]; Ey=np.asarray(E[1]).reshape(-1)[zi]
    return {"input":polarization,"theta_deg":theta_deg,"wavelength_nm":float(wavelength_nm),"zero_order_index":zi,"Ex":_c(Ex),"Ey":_c(Ey),"R":float(np.real(R)),"T":float(np.real(T)),"material_provenance":{k:{**v,"n":str(v["n"])} for k,v in prov.items()},"actual_harmonics":int(obj.nG)}

def transmission_matrix(job,wavelength_nm,theta_deg):
    x=_build(job,wavelength_nm,theta_deg,"x"); y=_build(job,wavelength_nm,theta_deg,"y")
    # Columns are x- and y-polarized inputs; rows are Ex and Ey outputs.
    return {"schema":SCHEMA,"version":VERSION,"wavelength_nm":float(wavelength_nm),"theta_deg":float(theta_deg),"basis":"cartesian_candidate","basis_verified":False,"columns":{"x_input":x,"y_input":y},"matrix":{"t_xx":x["Ex"],"t_yx":x["Ey"],"t_xy":y["Ex"],"t_yy":y["Ey"]},"truth_boundary":"Complex zero-order field extraction from grcwa. Matrix is not admitted as a Jones matrix until basis symmetry verification passes."}

def verify_basis(job,wavelength_nm=532.0,tolerance=0.12,cross_tolerance=0.20):
    a=transmission_matrix(job,wavelength_nm,0.0); b=transmission_matrix(job,wavelength_nm,90.0)
    def z(d): return complex(d["re"],d["im"])
    ax=z(a["matrix"]["t_xx"]); ay=z(a["matrix"]["t_yy"]); bx=z(b["matrix"]["t_xx"]); by=z(b["matrix"]["t_yy"])
    swap=max(abs(ax-by),abs(ay-bx))/max(1e-9,abs(ax),abs(ay),abs(bx),abs(by))
    cross=max(abs(z(a["matrix"]["t_xy"])),abs(z(a["matrix"]["t_yx"])),abs(z(b["matrix"]["t_xy"])),abs(z(b["matrix"]["t_yx"]))) / max(1e-9,abs(ax),abs(ay),abs(bx),abs(by))
    passed=bool(swap<=tolerance and cross<=cross_tolerance)
    a["basis_verified"]=passed; b["basis_verified"]=passed
    out={"schema":"OMEGA_COMPLEX_BASIS_PROOF_v1","version":VERSION,"passed":passed,"wavelength_nm":float(wavelength_nm),"rotation_swap_error":float(swap),"cross_coupling_ratio":float(cross),"swap_tolerance":float(tolerance),"cross_tolerance":float(cross_tolerance),"theta0":a,"theta90":b,"truth_boundary":"This verifies internal basis consistency by rotational symmetry only. It is a prerequisite for Jones/PB analysis, not fabrication validation."}
    out["proof_sha256"]=_sha(out); return out

if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser(); p.add_argument("--input",required=True); p.add_argument("--output",required=True); p.add_argument("--wavelength",type=float,default=532.0); a=p.parse_args()
    job=json.load(open(a.input)); out=verify_basis(job,a.wavelength); json.dump(out,open(a.output,"w"),indent=2); print(json.dumps({"passed":out["passed"],"rotation_swap_error":out["rotation_swap_error"],"cross_coupling_ratio":out["cross_coupling_ratio"],"proof_sha256":out["proof_sha256"]})); raise SystemExit(0 if out["passed"] else 3)
