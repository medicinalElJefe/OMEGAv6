from __future__ import annotations
import hashlib, json
from pathlib import Path
from typing import Any
import numpy as np
import rasterio


def sha256_file(path, block=4*1024*1024):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        while True:
            b=f.read(block)
            if not b: break
            h.update(b)
    return h.hexdigest()


def load_manifest(path: str|Path)->dict[str,Any]:
    p=Path(path);m=json.loads(p.read_text(encoding='utf-8'));m['_manifest_file']=str(p);return m


def select_product(manifest:dict[str,Any], product_key='gamma0_db')->Path:
    products=manifest.get('products') or {}
    if product_key not in products: raise KeyError(f"Manifest has no product {product_key}; available={sorted(products)}")
    p=Path(products[product_key])
    if not p.is_absolute(): p=Path(manifest['_manifest_file']).parent/p
    return p


def grid_signature(ds):
    return {'crs':ds.crs.to_string() if ds.crs else None,'transform':tuple(ds.transform),'width':ds.width,'height':ds.height}


def validate_registered(paths):
    sig=None
    for p in paths:
        with rasterio.open(p) as ds:
            s=grid_signature(ds)
        if sig is None: sig=s
        elif s!=sig: raise ValueError(f"GRID_MISMATCH: refusing unregistered stack. expected={sig}, got={s}, file={p}")
    return sig


def _write(path,array,profile,tags):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    out=np.where(np.isfinite(array),array,-9999).astype('float32')
    p=profile.copy();p.update(driver='GTiff',dtype='float32',count=1,nodata=-9999,compress='deflate',tiled=True)
    with rasterio.open(path,'w',**p) as dst:
        dst.write(out,1);dst.update_tags(**tags)
    return str(path)


def compile_stack(manifest_paths, out_dir, product_key='gamma0_db'):
    manifests=[load_manifest(p) for p in manifest_paths]
    if len(manifests)<2: raise ValueError('At least two measurement manifests are required for temporal accumulation')
    manifests.sort(key=lambda m:str((m.get('granule') or {}).get('start_time') or ''))
    paths=[select_product(m,product_key) for m in manifests]
    sig=validate_registered(paths)
    sum_=sum2=count=first=last=None;profile=None
    for p in paths:
        with rasterio.open(p) as ds:
            a=ds.read(1).astype('float64');profile=ds.profile
            if ds.nodata is not None: a[a==ds.nodata]=np.nan
        valid=np.isfinite(a)
        if sum_ is None:
            sum_=np.zeros(a.shape,'float64');sum2=np.zeros(a.shape,'float64');count=np.zeros(a.shape,'uint32');first=np.full(a.shape,np.nan);last=np.full(a.shape,np.nan)
        sum_[valid]+=a[valid];sum2[valid]+=a[valid]**2;count[valid]+=1
        first[np.isnan(first)&valid]=a[np.isnan(first)&valid]
        last[valid]=a[valid]
    mean=np.full(sum_.shape,np.nan);ok=count>0;mean[ok]=sum_[ok]/count[ok]
    var=np.full(sum_.shape,np.nan);var[ok]=np.maximum(0,sum2[ok]/count[ok]-mean[ok]**2);std=np.sqrt(var)
    change=last-first
    z=np.full(mean.shape,np.nan);zok=ok&(std>0)&np.isfinite(last);z[zok]=(last[zok]-mean[zok])/std[zok]
    out=Path(out_dir);out.mkdir(parents=True,exist_ok=True)
    tags={'OMEGA_KIND':'DERIVED_FROM_REGISTERED_MEASURED_STACK','SOURCE_COUNT':str(len(paths)),'PRODUCT_KEY':product_key,'RESAMPLING':'NONE_REFUSED_ON_MISMATCH'}
    products={
      'observation_count':_write(out/f'{product_key}_observation_count.tif',count.astype('float32'),profile,tags),
      'temporal_mean':_write(out/f'{product_key}_temporal_mean.tif',mean,profile,tags),
      'temporal_std':_write(out/f'{product_key}_temporal_std.tif',std,profile,tags),
      'first_to_last_change':_write(out/f'{product_key}_first_to_last_change.tif',change,profile,tags),
      'latest_zscore':_write(out/f'{product_key}_latest_zscore.tif',z,profile,tags),
    }
    proof={
      'schema':'omega.sar.nisar.registered-stack.v1','product_key':product_key,'source_count':len(paths),'grid_signature':sig,
      'sources':[{'manifest':m['_manifest_file'],'manifest_sha256':sha256_file(m['_manifest_file']),'measurement_file':str(p),'measurement_sha256':sha256_file(p),'granule':m.get('granule'),'dataset_path':m.get('dataset_path'),'frequency':m.get('frequency'),'term':m.get('term')} for m,p in zip(manifests,paths)],
      'products':products,'output_sha256':{k:sha256_file(v) for k,v in products.items()},
      'semantics':{'resampling_performed':False,'grid_mismatch_policy':'REFUSE','all_outputs_derived':True,'inferred':False,'first_to_last_change':'last measured pixel minus first measured pixel where both exist','latest_zscore':'(latest - temporal mean)/temporal std where std>0'}
    }
    proof_path=out/f'{product_key}_stack_manifest.json';proof_path.write_text(json.dumps(proof,indent=2,sort_keys=True),encoding='utf-8');proof['manifest_path']=str(proof_path)
    return proof
