from __future__ import annotations

import argparse
import csv
import json
import math
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterator

import numpy as np
from PIL import Image

from .parenting_compiler import compile_atlas, validate, PACKET_COUNT

GRID_SIDE = 144
assert GRID_SIDE * GRID_SIDE == PACKET_COUNT
PRESETS = {"hd": (1920, 1080), "qhd": (2560, 1440), "4k": (3840, 2160), "8k": (7680, 4320)}

@dataclass
class PassRecord:
    pass_index: int
    rmse: float
    mae: float
    max_error: float
    construct_mean: float
    prune_mean: float
    carry_mean: float
    open_gap_pixels: int
    elapsed_s: float

@dataclass
class RenderConfig:
    image: str
    output_dir: str
    width: int
    height: int
    seed: str
    iterations: int = 6
    tile_rows: int = 192
    closure: str = "bounded"
    tolerance: float = 0.75
    preserve_alpha: bool = True
    detail_strength: float = 0.30

def _fit_image(path: Path, width: int, height: int) -> Image.Image:
    source = Image.open(path).convert("RGBA")
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    scale = min(width / source.width, height / source.height)
    nw, nh = max(1, round(source.width * scale)), max(1, round(source.height * scale))
    resized = source.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, ((width - nw) // 2, (height - nh) // 2))
    return canvas

def _parent_image(reference: Image.Image) -> Image.Image:
    return reference.resize((GRID_SIDE, GRID_SIDE), Image.Resampling.LANCZOS)

def _initial_reconstruction(parent: Image.Image, width: int, height: int) -> Image.Image:
    return parent.resize((width, height), Image.Resampling.BICUBIC)

def _metric_maps(packet_data: np.ndarray) -> dict[str, np.ndarray]:
    columns = {"carry":4,"construct":5,"prune":6,"scar":7,"burden":8,"contradiction":9,"plasticity":10,"torsion":11,"water":12,"triangulation":13,"teal":14,"branch":15,"inverse":16,"outverse":17,"phase_angle":18,"motion":19}
    return {name: packet_data[:, col].reshape(GRID_SIDE, GRID_SIDE) for name, col in columns.items()}

def _parent_indices(width: int, height: int) -> tuple[np.ndarray, np.ndarray]:
    px = np.minimum(GRID_SIDE - 1, (np.arange(width) * GRID_SIDE // width)).astype(np.int32)
    py = np.minimum(GRID_SIDE - 1, (np.arange(height) * GRID_SIDE // height)).astype(np.int32)
    return px, py

def _edge_field(reference: Image.Image) -> np.ndarray:
    gray = np.asarray(reference.convert("L"), dtype=np.float32) / 255.0
    gx, gy = np.zeros_like(gray), np.zeros_like(gray)
    gx[:, 1:-1] = (gray[:, 2:] - gray[:, :-2]) * 0.5
    gy[1:-1, :] = (gray[2:, :] - gray[:-2, :]) * 0.5
    return np.sqrt(gx * gx + gy * gy)

def _iter_tiles(height: int, tile_rows: int) -> Iterator[tuple[int, int]]:
    for y0 in range(0, height, tile_rows): yield y0, min(height, y0 + tile_rows)

def _stats(reference: np.ndarray, current: np.ndarray, tolerance: float) -> tuple[float, float, float, int]:
    delta = reference.astype(np.float32) - current.astype(np.float32); absd = np.abs(delta)
    return float(np.sqrt(np.mean(delta * delta))), float(np.mean(absd)), float(np.max(absd)), int(np.count_nonzero(np.max(absd[:, :, :3], axis=2) > tolerance))

def _save_gap_chart(records: list[PassRecord], path: Path) -> None:
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    x=[r.pass_index for r in records]; plt.figure(figsize=(10,5)); plt.plot(x,[r.rmse for r in records],marker="o",label="RMSE"); plt.plot(x,[r.mae for r in records],marker="o",label="MAE"); plt.xlabel("Dewey closure pass"); plt.ylabel("Pixel error (0–255)"); plt.title("Hierarchical supersampling gap closure"); plt.legend(); plt.tight_layout(); plt.savefig(path,dpi=180); plt.close()

def _cell_ledger(reference: np.ndarray,current: np.ndarray,packet_data: np.ndarray,width: int,height: int,px: np.ndarray,py: np.ndarray,path: Path,tolerance: float) -> dict:
    delta=np.abs(reference.astype(np.float32)-current.astype(np.float32)); rgb_gap=np.mean(delta[:,:,:3],axis=2); max_gap=np.max(delta[:,:,:3],axis=2); rows=[]; status_counts={"CLOSED":0,"TIGHT":0,"OPEN":0,"CRITICAL":0}
    for gy in range(GRID_SIDE):
        ys=np.where(py==gy)[0]
        if not len(ys): continue
        y0,y1=int(ys[0]),int(ys[-1])+1
        for gx in range(GRID_SIDE):
            xs=np.where(px==gx)[0]
            if not len(xs): continue
            x0,x1=int(xs[0]),int(xs[-1])+1; idx=gy*GRID_SIDE+gx; tile=rgb_gap[y0:y1,x0:x1]; tile_max=max_gap[y0:y1,x0:x1]; mean_gap=float(np.mean(tile)); maximum=float(np.max(tile_max)); children=int(tile.size); p=packet_data[idx]
            continuity,construct,prune,scar,burden,contradiction,plasticity=float(p[4]),float(p[5]),float(p[6]),float(p[7]),float(p[8]),float(p[9]),float(p[10])
            closure_capacity=float(np.clip((continuity*plasticity*(1.0+construct))/(1.0+burden+contradiction+1e-6),0.0,2.0))
            status="CLOSED" if maximum<=tolerance else "TIGHT" if maximum<=max(2.0,tolerance*2) else "OPEN" if maximum<=8.0 else "CRITICAL"; status_counts[status]+=1
            rows.append({"packet_id":idx,"grid_x":gx,"grid_y":gy,"domain":int(p[0]),"phase":int(p[1]),"regulation":int(p[2]),"layer":int(p[3]),"descendant_pixels":children,"mean_gap":mean_gap,"max_gap":maximum,"continuity":continuity,"construct":construct,"prune":prune,"scar":scar,"burden":burden,"contradiction":contradiction,"plasticity":plasticity,"closure_capacity":closure_capacity,"gap_status":status})
    fields=list(rows[0].keys()) if rows else []
    with path.open("w",newline="",encoding="utf-8") as handle:
        writer=csv.DictWriter(handle,fieldnames=fields); writer.writeheader(); writer.writerows(rows)
    return {"cells":len(rows),"status_counts":status_counts}

def render_hierarchical(config: RenderConfig) -> dict:
    started=time.perf_counter(); image_path=Path(config.image).expanduser().resolve()
    if not image_path.exists(): raise FileNotFoundError(image_path)
    out=Path(config.output_dir).expanduser().resolve(); out.mkdir(parents=True,exist_ok=True)
    compiled=compile_atlas(config.seed); checks=validate(compiled)
    if not checks["pass"]: raise RuntimeError(f"Atlas compiler validation failed: {checks}")
    packet_data=compiled.packet_data; metrics=_metric_maps(packet_data); reference_img=_fit_image(image_path,config.width,config.height); parent_img=_parent_image(reference_img); initial_img=_initial_reconstruction(parent_img,config.width,config.height)
    reference=np.asarray(reference_img,dtype=np.uint8); current=np.asarray(initial_img,dtype=np.float32).copy(); edge=_edge_field(reference_img); px,py=_parent_indices(config.width,config.height)
    reference_img.save(out/"reference_lanczos.png"); parent_img.save(out/"parent_lattice_144x144.png"); initial_img.save(out/"pass_00_parent_reconstruction.png")
    records=[]; rmse,mae,mx,open_pixels=_stats(reference,current,config.tolerance); records.append(PassRecord(0,rmse,mae,mx,0.0,0.0,1.0-mae/255.0,open_pixels,time.perf_counter()-started)); scar_memory=np.zeros((config.height,config.width),dtype=np.float32); pass_dir=out/"passes"; pass_dir.mkdir(exist_ok=True)
    for pass_index in range(1,config.iterations+1):
        pass_construct=pass_prune=pass_carry=0.0; count=0; phase_progress=pass_index/max(1,config.iterations)
        for y0,y1 in _iter_tiles(config.height,config.tile_rows):
            ref=reference[y0:y1].astype(np.float32); cur=current[y0:y1]; residual=ref-cur; positive=np.maximum(residual,0.0); negative=np.maximum(-residual,0.0); magnitude=np.mean(np.abs(residual[:,:,:3]),axis=2)/255.0; parent_y=py[y0:y1]
            def field(name): return metrics[name][parent_y[:,None],px[None,:]]
            carry,construct_state,prune_state,scar_state,burden,contradiction,plasticity,torsion,water,triangulation,branch,inverse,outverse,motion=(field(n) for n in ("carry","construct","prune","scar","burden","contradiction","plasticity","torsion","water","triangulation","branch","inverse","outverse","motion"))
            scar_memory[y0:y1]=0.82*scar_memory[y0:y1]+0.18*magnitude+0.08*scar_state
            burden_damp=1.0/(1.0+0.85*burden+0.35*contradiction); continuity_gate=0.30+0.70*carry; future_gate=0.35+0.65*plasticity; geometry_gate=0.45+0.30*triangulation+0.15*water+0.10*branch; asymmetry_gate=0.85+0.15*np.cos((inverse-outverse+torsion)*math.pi); base=0.34+0.52*phase_progress
            gain_construct=np.clip(base*burden_damp*continuity_gate*future_gate*geometry_gate*asymmetry_gate*(0.78+0.42*construct_state),0.12,0.96); gain_prune=np.clip(base*burden_damp*continuity_gate*(0.50+0.50*(1.0-contradiction))*(0.78+0.42*prune_state),0.12,0.96)
            detail_gate=np.clip(config.detail_strength*edge[y0:y1]*(0.35+0.65*plasticity)*(0.40+0.60*(1.0-burden)),0.0,0.60); update=positive*gain_construct[:,:,None]-negative*gain_prune[:,:,None]; update[:,:,:3]+=residual[:,:,:3]*detail_gate[:,:,None]; scar_boost=np.clip(scar_memory[y0:y1]*(0.06+0.12*motion),0.0,0.16); update[:,:,:3]+=residual[:,:,:3]*scar_boost[:,:,None]; cur+=update; np.clip(cur,0.0,255.0,out=cur)
            if config.preserve_alpha: cur[:,:,3]=ref[:,:,3]
            pass_construct+=float(np.mean(positive)); pass_prune+=float(np.mean(negative)); pass_carry+=float(np.mean(1.0-np.minimum(1.0,np.abs(residual)/255.0))); count+=1
        rmse,mae,mx,open_pixels=_stats(reference,current,config.tolerance); records.append(PassRecord(pass_index,rmse,mae,mx,pass_construct/max(1,count),pass_prune/max(1,count),pass_carry/max(1,count),open_pixels,time.perf_counter()-started)); Image.fromarray(np.rint(current).astype(np.uint8),"RGBA").save(pass_dir/f"pass_{pass_index:02d}.png")
    preclosure=np.rint(current).astype(np.uint8); Image.fromarray(preclosure,"RGBA").save(out/"atlas_hierarchical_preclosure.png"); pre_rmse,pre_mae,pre_max,pre_open=_stats(reference,preclosure,config.tolerance); closure_applied=False
    if config.closure not in {"none","bounded","exact"}: raise ValueError("closure must be none, bounded, or exact")
    if config.closure=="bounded": residual=reference.astype(np.float32)-current; mask=np.max(np.abs(residual[:,:,:3]),axis=2)>config.tolerance; current[mask]+=residual[mask]; closure_applied=bool(np.any(mask))
    elif config.closure=="exact": current[:]=reference; closure_applied=True
    final=np.rint(np.clip(current,0,255)).astype(np.uint8)
    if config.closure=="bounded": quantized_gap=np.max(np.abs(reference[:,:,:3].astype(np.int16)-final[:,:,:3].astype(np.int16)),axis=2); quantized_mask=quantized_gap>config.tolerance; final[quantized_mask]=reference[quantized_mask]
    elif config.closure=="exact": final[:]=reference
    final_path=out/("atlas_hierarchical_closed.png" if config.closure!="none" else "atlas_hierarchical.png"); Image.fromarray(final,"RGBA").save(final_path); final_rmse,final_mae,final_max,final_open=_stats(reference,final,config.tolerance); cell_summary=_cell_ledger(reference,final,packet_data,config.width,config.height,px,py,out/"cell_gap_ledger.csv",config.tolerance); _save_gap_chart(records,out/"gap_closure_chart.png")
    audit={"engine":"OMEGA Hierarchical Supersampling v15","configuration":asdict(config),"atlas":{"parents":PACKET_COUNT,"grid":[GRID_SIDE,GRID_SIDE],"descendant_pixels":config.width*config.height,"average_descendants_per_parent":config.width*config.height/PACKET_COUNT,"compiler_checks":checks,"packet_columns_used":list(metrics.keys())},"initial":asdict(records[0]),"passes":[asdict(r) for r in records],"preclosure":{"rmse":pre_rmse,"mae":pre_mae,"max_error":pre_max,"open_gap_pixels":pre_open},"closure":{"mode":config.closure,"applied":closure_applied,"tolerance":config.tolerance},"final":{"rmse":final_rmse,"mae":final_mae,"max_error":final_max,"open_gap_pixels":final_open,"output":str(final_path)},"cell_gap_summary":cell_summary,"elapsed_s":time.perf_counter()-started,"claim_boundary":"The hierarchy reconstructs and closes a supplied source image. It does not invent unseen photoreal detail or replace a generative image model."}
    (out/"render_audit.json").write_text(json.dumps(audit,indent=2),encoding="utf-8"); (out/"pass_ledger.json").write_text(json.dumps([asdict(r) for r in records],indent=2),encoding="utf-8"); return audit

def main() -> int:
    ap=argparse.ArgumentParser(description="OMEGA hierarchical atlas supersampler"); ap.add_argument("image"); ap.add_argument("--output-dir",default="workspace/outputs/hierarchical"); ap.add_argument("--preset",choices=sorted(PRESETS)); ap.add_argument("--width",type=int,default=1920); ap.add_argument("--height",type=int,default=1080); ap.add_argument("--seed",default="Omega full calculus hierarchical supersampling"); ap.add_argument("--iterations",type=int,default=6); ap.add_argument("--tile-rows",type=int,default=192); ap.add_argument("--closure",choices=["none","bounded","exact"],default="bounded"); ap.add_argument("--tolerance",type=float,default=0.75); ap.add_argument("--detail-strength",type=float,default=0.30); args=ap.parse_args(); width,height=PRESETS[args.preset] if args.preset else (args.width,args.height); cfg=RenderConfig(args.image,args.output_dir,width,height,args.seed,max(1,args.iterations),max(16,args.tile_rows),args.closure,max(0.0,args.tolerance),True,max(0.0,min(1.0,args.detail_strength))); print(json.dumps(render_hierarchical(cfg),indent=2)); return 0

if __name__=="__main__": raise SystemExit(main())
