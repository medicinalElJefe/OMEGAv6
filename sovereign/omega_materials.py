"""OMEGA optical material library R35.

Small, explicit dispersion models for solver inputs. Values are design models,
not metrology. Every lookup returns provenance so result packets remain auditable.
"""
from __future__ import annotations
import math

VERSION = "R35.0"

# Sellmeier: n^2 = 1 + sum(B_i*l^2/(l^2-C_i)), wavelength in um.
SELLMEIER = {
    "sio2_fused": {
        "B": (0.6961663, 0.4079426, 0.8974794),
        "C": (0.0684043**2, 0.1162414**2, 9.896161**2),
        "range_nm": (210.0, 3700.0),
        "source": "Malitson fused-silica Sellmeier coefficients",
    }
}

# Conservative visible-band design tables. Linear interpolation only; no
# extrapolation. Replace/augment with measured process-specific ellipsometry for
# fabrication qualification.
TABLES = {
    "air": {"points": [(400,1.0,0.0),(700,1.0,0.0)], "source":"ideal dry-air approximation"},
    "tio2_design": {"points": [(430,2.55,0.0),(470,2.50,0.0),(532,2.43,0.0),(590,2.38,0.0),(650,2.34,0.0),(680,2.32,0.0)], "source":"OMEGA conservative TiO2 visible design table; process-specific measurement required"},
    "sin_design": {"points": [(430,2.08,0.0),(470,2.06,0.0),(532,2.03,0.0),(590,2.01,0.0),(650,1.99,0.0),(680,1.98,0.0)], "source":"OMEGA conservative SiN visible design table; process-specific measurement required"},
}

def _interp(points, wl):
    if wl < points[0][0] or wl > points[-1][0]:
        raise ValueError(f"wavelength {wl} nm outside material table [{points[0][0]}, {points[-1][0]}] nm")
    for a,b in zip(points, points[1:]):
        if a[0] <= wl <= b[0]:
            t=(wl-a[0])/(b[0]-a[0]) if b[0]!=a[0] else 0.0
            return complex(a[1]+t*(b[1]-a[1]), a[2]+t*(b[2]-a[2]))
    return complex(points[-1][1], points[-1][2])

def resolve(name: str, wavelength_nm: float):
    key=str(name).lower().strip()
    wl=float(wavelength_nm)
    if key in SELLMEIER:
        d=SELLMEIER[key]; lo,hi=d["range_nm"]
        if not lo <= wl <= hi: raise ValueError(f"{key} model outside declared range")
        l=wl/1000.0; l2=l*l
        n2=1.0+sum(B*l2/(l2-C) for B,C in zip(d["B"],d["C"]))
        return {"name":key,"n":complex(math.sqrt(n2),0.0),"wavelength_nm":wl,"model":"sellmeier","source":d["source"],"library_version":VERSION}
    if key in TABLES:
        d=TABLES[key]
        return {"name":key,"n":_interp(d["points"],wl),"wavelength_nm":wl,"model":"linear_table","source":d["source"],"library_version":VERSION}
    raise ValueError(f"unknown material '{name}'")

def resolve_stack(spec, wavelength_nm):
    names={"n_incident":spec.get("incident","air"),"n_feature":spec.get("feature","tio2_design"),"n_background":spec.get("background","air"),"n_substrate":spec.get("substrate","sio2_fused")}
    resolved={k:resolve(v,wavelength_nm) for k,v in names.items()}
    return ({k:v["n"] for k,v in resolved.items()}, resolved)
