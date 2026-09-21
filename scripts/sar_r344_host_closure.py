#!/usr/bin/env python3
"""
OMEGA R344 full-resolution Sentinel-1 host closure driver.

This driver does not turn a successful process exit into physical proof. It can:
1. probe the installed SNAP/S1TBX operator chain;
2. execute the parameterized R344 TOPS graph;
3. hash exact SAFE/annotation/orbit/DEM/output artifacts;
4. read machine-produced coregistration + unwrap closure metrics;
5. emit OMEGA_SAR_HOST_CLOSURE_R344 JSON for the live workstation.

The R344 validator remains authoritative for promotion.
"""
from __future__ import annotations
import argparse, hashlib, json, os, pathlib, subprocess, sys, zipfile
from datetime import datetime, timezone
from typing import Any

SCHEMA="OMEGA_SAR_HOST_CLOSURE_R344"
REQUIRED_OPERATORS=[
    "TOPSAR-Split","Apply-Orbit-File","Back-Geocoding",
    "Enhanced-Spectral-Diversity","Interferogram","TOPSAR-Deburst",
    "TopoPhaseRemoval","GoldsteinPhaseFiltering"
]

def sha256_file(path:pathlib.Path)->str:
    h=hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()

def sha256_path(path:pathlib.Path)->str:
    path=path.resolve()
    if path.is_file(): return sha256_file(path)
    if not path.is_dir(): raise FileNotFoundError(path)
    h=hashlib.sha256()
    for p in sorted(x for x in path.rglob("*") if x.is_file()):
        rel=p.relative_to(path).as_posix().encode()
        h.update(len(rel).to_bytes(4,"big"));h.update(rel)
        h.update(bytes.fromhex(sha256_file(p)))
    return h.hexdigest()

def artifact(path:str|None, units:str|None=None, fmt:str|None=None)->dict[str,Any]|None:
    if not path: return None
    p=pathlib.Path(path).resolve()
    if not p.exists(): raise FileNotFoundError(p)
    size=p.stat().st_size if p.is_file() else sum(x.stat().st_size for x in p.rglob("*") if x.is_file())
    out={"path":str(p),"sha256":sha256_path(p),"bytes":size}
    if units: out["units"]=units
    if fmt: out["format"]=fmt
    return out

def annotation_hashes(safe:pathlib.Path)->list[str]:
    roots=[]
    if safe.is_dir():
        roots.extend(safe.glob("manifest.safe"))
        roots.extend(safe.glob("annotation/**/*.xml"))
        roots.extend(safe.glob("annotation/*.xml"))
    elif safe.suffix.lower()==".zip":
        hashes=set()
        with zipfile.ZipFile(safe,"r") as z:
            for name in sorted(z.namelist()):
                low=name.lower()
                if low.endswith("manifest.safe") or ("/annotation/" in low and low.endswith(".xml")):
                    h=hashlib.sha256()
                    with z.open(name,"r") as src:
                        for b in iter(lambda:src.read(1024*1024),b""): h.update(b)
                    hashes.add(h.hexdigest())
        return sorted(hashes)
    return sorted({sha256_file(p) for p in roots if p.is_file()})

def load_json(path:str|None)->dict[str,Any]:
    if not path: return {}
    with open(path,"r",encoding="utf-8") as f: return json.load(f)

def run(cmd:list[str], cwd:str|None=None)->None:
    print("+"," ".join(map(str,cmd)),flush=True)
    subprocess.run(cmd,cwd=cwd,check=True)

def probe_snap(gpt:str)->dict[str,bool]:
    out={}
    for op in REQUIRED_OPERATORS:
        try:
            subprocess.run([gpt,op,"-h"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
            out[op]=True
        except Exception:
            out[op]=False
    return out

def source_ref(path:pathlib.Path,pol:str,acquired:str,asset_key:str|None=None)->dict[str,Any]:
    return {
        "productId":path.name.replace(".SAFE","").replace(".zip",""),
        "assetKey":asset_key or pol.upper(),
        "sha256":sha256_path(path),
        "polarization":pol.upper(),
        "productLevel":"SLC",
        "acquiredAt":acquired
    }

def preview(path:str|None)->dict[str,Any]|None:
    if not path: return None
    x=load_json(path)
    required=("width","height","validMask","sourceArtifactSha256")
    if not all(k in x for k in required): raise ValueError("PREVIEW_JSON_MISSING_REQUIRED_FIELDS")
    n=int(x["width"])*int(x["height"])
    if len(x["validMask"])!=n: raise ValueError("PREVIEW_MASK_LENGTH_MISMATCH")
    for k,v in x.items():
        if k in required or k=="sourceArtifactSha256": continue
        if isinstance(v,list) and len(v)!=n: raise ValueError("PREVIEW_ARRAY_LENGTH_MISMATCH:"+k)
    return x

def main()->int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--master",required=True)
    ap.add_argument("--slave",required=True)
    ap.add_argument("--master-acquired",required=True)
    ap.add_argument("--slave-acquired",required=True)
    ap.add_argument("--polarization",required=True,choices=["VV","VH","HH","HV"])
    ap.add_argument("--subswath",default="IW2",choices=["IW1","IW2","IW3"])
    ap.add_argument("--first-burst",type=int,default=1)
    ap.add_argument("--last-burst",type=int,default=999)
    ap.add_argument("--dem-name",default="Copernicus 30m Global DEM")
    ap.add_argument("--dem-artifact")
    ap.add_argument("--master-orbit",required=True)
    ap.add_argument("--slave-orbit",required=True)
    ap.add_argument("--gpt",default="gpt")
    ap.add_argument("--graph",default=str(pathlib.Path(__file__).with_name("sar_r344_snap_tops_insar.xml")))
    ap.add_argument("--output",required=True,help="SNAP BEAM-DIMAP output path, usually *.dim")
    ap.add_argument("--execute",action="store_true")
    ap.add_argument("--probe-only",action="store_true")
    ap.add_argument("--coreg-proof",required=True,help="JSON from an independent post-registration residual proof")
    ap.add_argument("--beta0")
    ap.add_argument("--sigma0")
    ap.add_argument("--gamma0")
    ap.add_argument("--terrain-gamma0")
    ap.add_argument("--interferogram",required=True)
    ap.add_argument("--coherence",required=True)
    ap.add_argument("--corrected-interferogram",required=True)
    ap.add_argument("--geometric-phase-proof",required=True)
    ap.add_argument("--unwrap")
    ap.add_argument("--unwrap-mask")
    ap.add_argument("--unwrap-proof")
    ap.add_argument("--atmosphere")
    ap.add_argument("--etad")
    ap.add_argument("--other-correction")
    ap.add_argument("--los")
    ap.add_argument("--corrected-los")
    ap.add_argument("--wavelength-m",type=float,default=0.0555)
    ap.add_argument("--los-sign",type=int,choices=[-1,1])
    ap.add_argument("--sign-convention")
    ap.add_argument("--independent-los-json",help="JSON array of {losM,look:[e,n,u],source,artifactSha256}")
    ap.add_argument("--deformation-east")
    ap.add_argument("--deformation-north")
    ap.add_argument("--deformation-up")
    ap.add_argument("--deformation-proof")
    ap.add_argument("--preview-json")
    ap.add_argument("--receipt",required=True)
    args=ap.parse_args()

    master=pathlib.Path(args.master).resolve();slave=pathlib.Path(args.slave).resolve()
    if not master.exists() or not slave.exists(): raise FileNotFoundError("MASTER_OR_SLAVE_MISSING")
    if master==slave: raise ValueError("DISTINCT_ACQUISITIONS_REQUIRED")

    probe=probe_snap(args.gpt)
    missing=[k for k,v in probe.items() if not v]
    if args.probe_only:
        print(json.dumps({"gpt":args.gpt,"operators":probe,"allRequired":not missing},indent=2))
        return 0 if not missing else 2
    if missing: raise RuntimeError("SNAP_OPERATORS_MISSING:"+",".join(missing))

    if args.execute:
        out=pathlib.Path(args.output).resolve();out.parent.mkdir(parents=True,exist_ok=True)
        cmd=[
            args.gpt,str(pathlib.Path(args.graph).resolve()),
            "-Pmaster="+str(master),"-Pslave="+str(slave),
            "-Psubswath="+args.subswath,"-Ppolarization="+args.polarization,
            "-PfirstBurst="+str(args.first_burst),"-PlastBurst="+str(args.last_burst),
            "-PdemName="+args.dem_name,"-Poutput="+str(out),
            "-c","2G","-q",str(max(1,os.cpu_count() or 4)),"-x"
        ]
        run(cmd)

    coreg=load_json(args.coreg_proof)
    for k in ("azimuthResidualSamples","rangeResidualSamples","rangeThresholdSamples"):
        if k not in coreg: raise ValueError("COREG_PROOF_MISSING_"+k)
    proof_art=artifact(args.coreg_proof,fmt="application/json")
    geo=load_json(args.geometric_phase_proof)
    if geo.get("flatEarthRemoved") is not True or geo.get("topographicRemoved") is not True:
        raise ValueError("GEOMETRIC_PHASE_PROOF_INCOMPLETE")

    unwrap_proof=load_json(args.unwrap_proof) if args.unwrap_proof else {}
    deformation_proof=load_json(args.deformation_proof) if args.deformation_proof else {}
    independent=load_json(args.independent_los_json) if args.independent_los_json else []
    if independent and not isinstance(independent,list): raise ValueError("INDEPENDENT_LOS_MUST_BE_ARRAY")

    receipt={
        "schema":SCHEMA,"revision":"R344","createdAt":datetime.now(timezone.utc).isoformat(),
        "processor":"ESA SNAP/S1TBX GPT","processorVersion":coreg.get("processorVersion","PROBED_AT_RUNTIME"),
        "master":source_ref(master,args.polarization,args.master_acquired),
        "slave":source_ref(slave,args.polarization,args.slave_acquired),
        "annotations":{"master":annotation_hashes(master),"slave":annotation_hashes(slave)},
        "orbit":{"master":artifact(args.master_orbit),"slave":artifact(args.slave_orbit),"precise":bool(coreg.get("preciseOrbit",True))},
        "dem":artifact(args.dem_artifact) if args.dem_artifact else None,
        "coregistration":{
            "fullResolution":bool(coreg.get("fullResolution",True)),
            "burstGeometryBound":bool(coreg.get("burstGeometryBound",True)),
            "method":str(coreg.get("method","Back-Geocoding + Enhanced-Spectral-Diversity")),
            "resampler":str(coreg.get("resampler","SNAP Back-Geocoding mission operator")),
            "azimuthResidualSamples":float(coreg["azimuthResidualSamples"]),
            "rangeResidualSamples":float(coreg["rangeResidualSamples"]),
            "rangeThresholdSamples":float(coreg["rangeThresholdSamples"]),
            "proofArtifact":proof_art
        },
        "radiometry":{k:v for k,v in {
            "beta0":artifact(args.beta0,units="linear power") if args.beta0 else None,
            "sigma0":artifact(args.sigma0,units="linear power") if args.sigma0 else None,
            "gamma0":artifact(args.gamma0,units="linear power") if args.gamma0 else None,
            "terrainFlattenedGamma0":artifact(args.terrain_gamma0,units="linear power") if args.terrain_gamma0 else None
        }.items() if v is not None},
        "interferogram":artifact(args.interferogram,units="rad"),
        "coherence":artifact(args.coherence,units="unitless"),
        "geometricPhase":{
            "flatEarthRemoved":True,"topographicRemoved":True,
            "correctedInterferogram":artifact(args.corrected_interferogram,units="rad"),
            "proofArtifact":artifact(args.geometric_phase_proof,fmt="application/json")
        },
        "truthBoundary":"Machine-generated host receipt. A process exit is not proof; R344 independently re-checks exact hashes, residual thresholds, correction/unwrap evidence and look-geometry rank."
    }
    if args.unwrap and args.unwrap_mask and args.unwrap_proof:
        receipt["unwrap"]={
            "artifact":artifact(args.unwrap,units="rad"),"mask":artifact(args.unwrap_mask),
            "closureRmsRad":float(unwrap_proof.get("closureRmsRad",float("inf"))),
            "residueCount":int(unwrap_proof.get("residueCount",-1)),
            "largestComponentPixels":int(unwrap_proof.get("largestComponentPixels",0)),
            "validPixels":int(unwrap_proof.get("validPixels",0))
        }
    corrections={}
    if args.atmosphere: corrections["atmosphere"]=artifact(args.atmosphere,units="rad")
    if args.etad: corrections["etad"]=artifact(args.etad,units="rad")
    if args.other_correction: corrections["other"]=artifact(args.other_correction,units="rad")
    if corrections: receipt["corrections"]=corrections
    if args.los and args.los_sign and args.sign_convention:
        receipt["los"]={"artifact":artifact(args.los,units="m"),"wavelengthM":args.wavelength_m,"signConvention":args.sign_convention,"sign":args.los_sign,"validPixels":int(unwrap_proof.get("validPixels",0))}
    if args.corrected_los: receipt["correctedLos"]=artifact(args.corrected_los,units="m")
    if independent: receipt["independentLos"]=independent
    if args.deformation_east and args.deformation_north and args.deformation_up and args.deformation_proof:
        receipt["deformation3d"]={
            "east":artifact(args.deformation_east,units="m"),"north":artifact(args.deformation_north,units="m"),"up":artifact(args.deformation_up,units="m"),
            "rank":int(deformation_proof.get("rank",0)),"conditionNumber":float(deformation_proof.get("conditionNumber",float("inf"))),
            "weightedRmsResidualM":float(deformation_proof.get("weightedRmsResidualM",float("inf")))
        }
    pv=preview(args.preview_json)
    if pv: receipt["preview"]=pv

    # Omit absent optional objects instead of serializing null as evidence.
    receipt={k:v for k,v in receipt.items() if v is not None}
    rp=pathlib.Path(args.receipt).resolve();rp.parent.mkdir(parents=True,exist_ok=True)
    rp.write_text(json.dumps(receipt,indent=2,sort_keys=True),encoding="utf-8")
    print(json.dumps({"receipt":str(rp),"sha256":sha256_file(rp),"operatorProbe":probe},indent=2))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
