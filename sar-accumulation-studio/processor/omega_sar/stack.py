from __future__ import annotations
from pathlib import Path
import numpy as np
import rasterio
from PIL import Image
from ..nisar_stack import compile_stack, load_manifest, select_product, validate_registered
from .proof import sha256_file


def accumulate_geocoded_stack(manifest_paths, out_dir, product_key='gamma0_db'):
    return compile_stack(manifest_paths, out_dir, product_key)


def render_stack_gif(manifest_paths, output_path, product_key='gamma0_db', duration_ms=700):
    manifests=[load_manifest(p) for p in manifest_paths]
    manifests.sort(key=lambda m:str((m.get('granule') or {}).get('start_time') or ''))
    paths=[select_product(m,product_key) for m in manifests]
    validate_registered(paths)
    frames=[]
    for path in paths:
        with rasterio.open(path) as ds:
            a=ds.read(1).astype('float64')
            if ds.nodata is not None: a[a == ds.nodata] = np.nan
        finite=a[np.isfinite(a)]
        if not finite.size:
            img=np.zeros(a.shape,dtype='uint8')
        else:
            lo,hi=np.percentile(finite,[2,98]); hi=max(float(hi),float(lo)+1e-12)
            norm=np.clip((a-lo)/(hi-lo),0,1); norm=np.where(np.isfinite(norm),norm,0)
            img=(norm*255).astype('uint8')
        frames.append(Image.fromarray(img,mode='L'))
    if not frames: raise ValueError('No frames')
    out=Path(output_path); out.parent.mkdir(parents=True,exist_ok=True)
    frames[0].save(out,save_all=True,append_images=frames[1:],duration=int(duration_ms),loop=0,optimize=False)
    return {'schema':'omega.sar.nisar.animation.v1','output':str(out),'output_sha256':sha256_file(out),'frame_count':len(frames),'product_key':product_key,'display_only':True,'scientific_values_modified':False}
