#!/usr/bin/env python3
"""OMEGA R38 circular-basis and Pancharatnam-Berry phase verification.

This module consumes the R37 complex Cartesian transmission matrix, transforms it
into a declared circular-polarization basis, and tests only the converted-helicity
phase against the geometric-phase law ±2θ. Low-conversion states are disqualified
from phase fitting instead of being treated as valid phase evidence.

No PB/Jones/fabrication success is claimed unless all upstream gates pass.
"""
from __future__ import annotations
import argparse, json, math
from pathlib import Path
import numpy as np
from omega_rcwa_complex import transmission_matrix, verify_basis
from omega_rcwa_worker import _sha

VERSION="R38.0"
SCHEMA="OMEGA_PB_PHASE_PROOF_v1"

# exp(-iwt) convention:
# R = (x - i y)/sqrt(2), L = (x + i y)/sqrt(2)
# U maps circular coefficients [R,L] to Cartesian [x,y].
U=np.array([[1.0,1.0],[-1j,1j]],dtype=complex)/math.sqrt(2.0)


def _z(d): return complex(float(d["re"]),float(d["im"]))
def _c(z):
    z=complex(z)
    return {"re":float(z.real),"im":float(z.imag),"abs":float(abs(z)),"phase_deg":float(math.degrees(math.atan2(z.imag,z.real)))}
def wrap_deg(x): return float((float(x)+180.0)%360.0-180.0)

def matrix_from_r37(packet):
    m=packet["matrix"]
    return np.array([[_z(m["t_xx"]),_z(m["t_xy"])],[_z(m["t_yx"]),_z(m["t_yy"])]],dtype=complex)

def linear_to_circular(J):
    J=np.asarray(J,dtype=complex).reshape(2,2)
    return U.conj().T @ J @ U

def circular_state(job,wavelength_nm,theta_deg):
    linear=transmission_matrix(job,wavelength_nm,theta_deg)
    Jlin=matrix_from_r37(linear)
    Jcirc=linear_to_circular(Jlin)
    # rows=output [R,L], columns=input [R,L]
    denom_R=max(1e-30,float(np.sum(np.abs(Jcirc[:,0])**2)))
    denom_L=max(1e-30,float(np.sum(np.abs(Jcirc[:,1])**2)))
    conversion_R_to_L=float(abs(Jcirc[1,0])**2/denom_R)
    conversion_L_to_R=float(abs(Jcirc[0,1])**2/denom_L)
    return {
        "theta_deg":float(theta_deg),"wavelength_nm":float(wavelength_nm),
        "linear":linear,
        "circular_basis":{"convention":"R=(x-i y)/sqrt(2); L=(x+i y)/sqrt(2); exp(-iwt)",
            "matrix":{"t_RR":_c(Jcirc[0,0]),"t_RL":_c(Jcirc[0,1]),"t_LR":_c(Jcirc[1,0]),"t_LL":_c(Jcirc[1,1])}},
        "conversion":{"R_to_L":conversion_R_to_L,"L_to_R":conversion_L_to_R}
    }

def _rms(vals): return math.sqrt(sum(v*v for v in vals)/len(vals)) if vals else None

def pb_scan(job,wavelength_nm=532.0,phase_tolerance_deg=12.0,conversion_floor=0.05,min_qualified_states=10):
    basis=verify_basis(job,wavelength_nm)
    states=[circular_state(job,wavelength_nm,15.0*k) for k in range(12)]
    p0_LR=states[0]["circular_basis"]["matrix"]["t_LR"]["phase_deg"]
    p0_RL=states[0]["circular_basis"]["matrix"]["t_RL"]["phase_deg"]
    err_LR=[]; err_RL=[]; q_LR=0; q_RL=0
    for s in states:
        th=s["theta_deg"]
        lr=s["circular_basis"]["matrix"]["t_LR"]
        rl=s["circular_basis"]["matrix"]["t_RL"]
        actual_LR=wrap_deg(lr["phase_deg"]-p0_LR)
        actual_RL=wrap_deg(rl["phase_deg"]-p0_RL)
        expected_LR=wrap_deg(-2.0*th)
        expected_RL=wrap_deg(+2.0*th)
        eLR=wrap_deg(actual_LR-expected_LR); eRL=wrap_deg(actual_RL-expected_RL)
        qual_LR=bool(s["conversion"]["R_to_L"]>=conversion_floor and lr["abs"]>1e-9)
        qual_RL=bool(s["conversion"]["L_to_R"]>=conversion_floor and rl["abs"]>1e-9)
        s["pb_test"]={
            "LR":{"qualified":qual_LR,"actual_relative_phase_deg":actual_LR,"expected_deg":expected_LR,"error_deg":eLR},
            "RL":{"qualified":qual_RL,"actual_relative_phase_deg":actual_RL,"expected_deg":expected_RL,"error_deg":eRL}}
        if qual_LR: err_LR.append(eLR); q_LR+=1
        if qual_RL: err_RL.append(eRL); q_RL+=1
    rms_LR=_rms(err_LR); rms_RL=_rms(err_RL)
    enough=bool(q_LR>=min_qualified_states and q_RL>=min_qualified_states)
    phase_ok=bool(enough and rms_LR is not None and rms_RL is not None and rms_LR<=phase_tolerance_deg and rms_RL<=phase_tolerance_deg)
    verified=bool(basis.get("passed") and phase_ok)
    out={
        "schema":SCHEMA,"version":VERSION,"wavelength_nm":float(wavelength_nm),
        "basis_proof":basis,"basis_verified":bool(basis.get("passed")),
        "helicity_convention":"R=(x-i y)/sqrt(2), L=(x+i y)/sqrt(2), exp(-iwt); expected LR=-2theta, RL=+2theta relative to theta=0",
        "conversion_floor":float(conversion_floor),"phase_tolerance_deg":float(phase_tolerance_deg),"min_qualified_states":int(min_qualified_states),
        "qualified_states":{"LR":q_LR,"RL":q_RL},"rms_phase_error_deg":{"LR":rms_LR,"RL":rms_RL},
        "pb_phase_verified":verified,"states":states,
        "truth_boundary":"PB phase is admitted only for converted-helicity components with sufficient conversion, verified Cartesian basis, and bounded ±2θ phase error. Numerical agreement is not fabrication validation."
    }
    out["proof_sha256"]=_sha(out)
    return out

def main():
    p=argparse.ArgumentParser(); p.add_argument("--input",required=True); p.add_argument("--output",required=True); p.add_argument("--wavelength",type=float,default=532.0); p.add_argument("--phase-tol",type=float,default=12.0); p.add_argument("--conversion-floor",type=float,default=0.05); a=p.parse_args()
    job=json.loads(Path(a.input).read_text("utf-8")); out=pb_scan(job,a.wavelength,a.phase_tol,a.conversion_floor); Path(a.output).write_text(json.dumps(out,indent=2),"utf-8")
    print(json.dumps({"basis_verified":out["basis_verified"],"pb_phase_verified":out["pb_phase_verified"],"qualified_states":out["qualified_states"],"rms_phase_error_deg":out["rms_phase_error_deg"],"proof_sha256":out["proof_sha256"]}))
    return 0
if __name__=="__main__": raise SystemExit(main())
