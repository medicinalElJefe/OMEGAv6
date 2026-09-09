from __future__ import annotations

from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any
import json
import math

import h5py
import numpy as np

from .proof import sha256_file, write_json
from ..nisar_gcov import parse_granule_name, write_geotiff

C_M_S = 299_792_458.0


def _datasets_by_basename(h5: h5py.File, root: str, basename: str) -> list[str]:
    out: list[str] = []
    group = h5[root] if root in h5 else None
    if group is None:
        return out
    def visit(name, obj):
        if isinstance(obj, h5py.Dataset) and name.rsplit('/', 1)[-1] == basename:
            out.append(root.rstrip('/') + '/' + name.lstrip('/'))
    group.visititems(visit)
    return sorted(set(out))


def _select_layer(h5: h5py.File, basename: str, polarization: str = 'HH', frequency: str = 'A', preferred_tokens: tuple[str, ...] = ('unwrappedInterferogram','interferogram')) -> str | None:
    root = f'/science/LSAR/GUNW/grids/frequency{frequency.upper()}'
    candidates = _datasets_by_basename(h5, root, basename)
    pol = polarization.upper()
    filtered = [p for p in candidates if f'/{pol}/' in p]
    if filtered:
        candidates = filtered
    preferred = [p for p in candidates if any(f'/{token}/' in p for token in preferred_tokens)]
    if preferred:
        candidates = preferred
    if len(candidates) == 1:
        return candidates[0]
    if not candidates:
        return None
    raise ValueError(f'AMBIGUOUS_GUNW_LAYER {basename}: {candidates}')


def _nearest_dataset(h5: h5py.File, data_path: str, basename: str) -> h5py.Dataset | None:
    parts = data_path.strip('/').split('/')[:-1]
    for i in range(len(parts), 0, -1):
        parent = '/' + '/'.join(parts[:i])
        direct = f'{parent}/{basename}'
        if direct in h5 and isinstance(h5[direct], h5py.Dataset):
            return h5[direct]
    root = '/science/LSAR/GUNW/grids/frequencyA'
    candidates = _datasets_by_basename(h5, root, basename)
    return h5[candidates[0]] if len(candidates) == 1 else None


def _projection_epsg(h5: h5py.File, data_path: str) -> int:
    obj = _nearest_dataset(h5, data_path, 'projection')
    values=[]
    if obj is not None:
        try: values.append(obj[()])
        except Exception: pass
        values.extend(obj.attrs.values())
    for value in values:
        if isinstance(value, bytes): value=value.decode('utf-8','replace')
        if isinstance(value, np.generic): value=value.item()
        if isinstance(value,(int,np.integer)) and 1000 <= int(value) <= 999999:
            return int(value)
        text=str(value)
        digits=''.join(ch if ch.isdigit() else ' ' for ch in text).split()
        for token in digits:
            if 4 <= len(token) <= 6 and 1000 <= int(token) <= 999999:
                return int(token)
    raise KeyError('Unable to resolve GUNW EPSG projection')


def _coords(h5: h5py.File, data_path: str, shape: tuple[int,int]) -> tuple[np.ndarray,np.ndarray]:
    x=_nearest_dataset(h5,data_path,'xCoordinates'); y=_nearest_dataset(h5,data_path,'yCoordinates')
    if x is not None and y is not None:
        xv=np.asarray(x[:],dtype=float); yv=np.asarray(y[:],dtype=float)
        if len(xv)==shape[1] and len(yv)==shape[0]: return xv,yv
    sx=_nearest_dataset(h5,data_path,'startingX'); sy=_nearest_dataset(h5,data_path,'startingY')
    dx=_nearest_dataset(h5,data_path,'xCoordinateSpacing'); dy=_nearest_dataset(h5,data_path,'yCoordinateSpacing')
    if all(v is not None for v in (sx,sy,dx,dy)):
        return (float(sx[()])+np.arange(shape[1])*float(dx[()]), float(sy[()])+np.arange(shape[0])*float(dy[()]))
    raise KeyError('Unable to resolve coordinate vectors for GUNW layer')


def _read_optional(h5: h5py.File, path: str | None, shape: tuple[int,int], dtype=None):
    if path is None: return None
    arr=np.asarray(h5[path][:],dtype=dtype) if dtype is not None else np.asarray(h5[path][:])
    if arr.shape != shape: raise ValueError(f'GUNW layer shape mismatch: {path} has {arr.shape}, expected {shape}')
    return arr


def _center_frequency_hz(h5: h5py.File, frequency: str='A') -> float | None:
    roots=['/science/LSAR/GUNW/metadata','/science/LSAR/GUNW/identification','/science/LSAR/GUNW']
    candidates=[]
    for root in roots:
        for name in ('centerFrequency','centerFrequencyHz','processedCenterFrequency'):
            candidates.extend(_datasets_by_basename(h5,root,name))
    for path in sorted(set(candidates)):
        if f'frequency{frequency.upper()}' not in path and '/frequency' in path: continue
        ds=h5[path]
        if ds.shape not in [(),(1,)]: continue
        try: value=float(np.asarray(ds[()]).reshape(-1)[0])
        except Exception: continue
        units=str(ds.attrs.get('units','')).lower()
        if 'ghz' in units: value*=1e9
        elif 'mhz' in units: value*=1e6
        if 1e8 < value < 2e9: return value
    return None


def phase_to_range_change_m(phase_rad: np.ndarray, wavelength_m: float, phase_to_range_sign: int | None = None) -> np.ndarray:
    if phase_to_range_sign not in (-1,1):
        raise ValueError('SIGNED_DISPLACEMENT_REQUIRES_EXPLICIT_PHASE_TO_RANGE_SIGN of +1 or -1')
    wavelength=float(wavelength_m)
    if not math.isfinite(wavelength) or wavelength <= 0: raise ValueError('wavelength_m must be finite and >0')
    return np.asarray(phase_rad,dtype=np.float64) * (phase_to_range_sign*wavelength/(4*np.pi))


@dataclass
class GUNWResult:
    source_file: str
    source_sha256: str
    granule: dict[str,Any]
    frequency: str
    polarization: str
    phase_path: str
    coherence_path: str | None
    connected_components_path: str | None
    mask_path: str | None
    ionosphere_path: str | None
    ionosphere_uncertainty_path: str | None
    epsg: int
    shape: tuple[int,int]
    unwrapped_phase: np.ndarray
    coherence: np.ndarray | None
    connected_components: np.ndarray | None
    mask: np.ndarray | None
    ionosphere_phase: np.ndarray | None
    ionosphere_uncertainty: np.ndarray | None
    qa_valid: np.ndarray
    center_frequency_hz: float | None
    wavelength_m: float | None
    warnings: list[str]

    def manifest(self):
        d=asdict(self)
        for key in ('unwrapped_phase','coherence','connected_components','mask','ionosphere_phase','ionosphere_uncertainty','qa_valid'):
            arr=d.pop(key)
            if arr is None: continue
            a=np.asarray(arr); finite=a[np.isfinite(a)] if np.issubdtype(a.dtype,np.number) else np.array([])
            d[key+'_summary']={'shape':list(a.shape),'dtype':str(a.dtype),'finite_count':int(finite.size),'min':float(np.min(finite)) if finite.size else None,'max':float(np.max(finite)) if finite.size else None}
        d['schema']='omega.sar.nisar.gunw.measurement.v1'
        d['semantics']={'unwrapped_phase':'source GUNW unwrapped interferometric phase in radians','coherence':'source normalized interferometric coherence magnitude when available','ionosphere_applied':False,'external_corrections_applied':False,'signed_displacement_emitted':False,'catalog_metadata_is_measurement':False,'inferred':False}
        return d


def read_gunw(path: str|Path, polarization='HH', frequency='A', min_coherence: float | None = None) -> GUNWResult:
    p=Path(path); warnings=[]; frequency=frequency.upper(); polarization=polarization.upper()
    if frequency != 'A': raise ValueError('Mission GUNW science layers are supported only for frequency A')
    with h5py.File(p,'r') as h5:
        phase_path=_select_layer(h5,'unwrappedPhase',polarization,frequency)
        if phase_path is None: raise KeyError('Missing GUNW unwrappedPhase')
        phase=np.asarray(h5[phase_path][:],dtype=np.float32)
        if phase.ndim != 2: raise ValueError(f'Expected 2-D GUNW unwrappedPhase, got {phase.shape}')
        shape=phase.shape
        coherence_path=_select_layer(h5,'coherenceMagnitude',polarization,frequency)
        cc_path=_select_layer(h5,'connectedComponents',polarization,frequency)
        iono_path=_select_layer(h5,'ionospherePhaseScreen',polarization,frequency)
        iono_unc_path=_select_layer(h5,'ionospherePhaseScreenUncertainty',polarization,frequency)
        mask_path=_select_layer(h5,'mask',polarization,frequency,preferred_tokens=('unwrappedInterferogram','interferogram'))
        coherence=_read_optional(h5,coherence_path,shape,np.float32)
        cc=_read_optional(h5,cc_path,shape)
        iono=_read_optional(h5,iono_path,shape,np.float32)
        iono_unc=_read_optional(h5,iono_unc_path,shape,np.float32)
        mask=_read_optional(h5,mask_path,shape)
        valid=np.isfinite(phase)
        if coherence is not None:
            valid &= np.isfinite(coherence) & (coherence >= 0) & (coherence <= 1)
            if min_coherence is not None:
                threshold=float(min_coherence)
                if not 0 <= threshold <= 1: raise ValueError('min_coherence must be within [0,1]')
                valid &= coherence >= threshold
        if cc is not None: valid &= np.isfinite(cc) & (cc > 0)
        if mask is not None: valid &= np.asarray(mask) != 0
        epsg=_projection_epsg(h5,phase_path)
        _coords(h5,phase_path,shape)  # hard registration/geolocation requirement
        center=_center_frequency_hz(h5,frequency)
        wavelength=(C_M_S/center) if center else None
        if iono is not None: warnings.append('Ionospheric phase screen is source evidence and is NOT applied to unwrapped phase by default.')
        warnings.append('External solid-Earth/tropospheric phase corrections are not applied automatically.')
        if min_coherence is None: warnings.append('No arbitrary coherence threshold was imposed; QA uses finite [0,1] coherence, positive connected components and source mask when present.')
    return GUNWResult(str(p),sha256_file(p),parse_granule_name(p.name),frequency,polarization,phase_path,coherence_path,cc_path,mask_path,iono_path,iono_unc_path,epsg,tuple(map(int,shape)),phase,coherence,cc,mask,iono,iono_unc,valid,center,wavelength,warnings)


def export_gunw(path: str|Path, out_dir: str|Path, polarization='HH', frequency='A', min_coherence: float | None = None, phase_to_range_sign: int | None = None):
    source=Path(path); out=Path(out_dir); out.mkdir(parents=True,exist_ok=True)
    r=read_gunw(source,polarization,frequency,min_coherence)
    with h5py.File(source,'r') as h5: x,y=_coords(h5,r.phase_path,r.shape)
    base=f'{source.stem}_frequency{frequency}_{polarization}'
    products={}
    products['unwrapped_phase_rad']=write_geotiff(out/f'{base}_unwrapped_phase_rad.tif',r.unwrapped_phase,x,y,r.epsg,tags={'OMEGA_KIND':'MEASURED_SOURCE_LAYER','NISAR_DATASET':r.phase_path,'UNITS':'radian'})
    if r.coherence is not None: products['coherence']=write_geotiff(out/f'{base}_coherence.tif',r.coherence,x,y,r.epsg,tags={'OMEGA_KIND':'MEASURED_SOURCE_LAYER','UNITS':'1','VALID_RANGE':'0..1'})
    if r.connected_components is not None: products['connected_components']=write_geotiff(out/f'{base}_connected_components.tif',r.connected_components.astype(np.float32),x,y,r.epsg,tags={'OMEGA_KIND':'MEASURED_SOURCE_LAYER'})
    if r.ionosphere_phase is not None: products['ionosphere_phase_rad']=write_geotiff(out/f'{base}_ionosphere_phase_rad.tif',r.ionosphere_phase,x,y,r.epsg,tags={'OMEGA_KIND':'MEASURED_SOURCE_CORRECTION_LAYER','APPLIED_TO_PHASE':'false'})
    if r.ionosphere_uncertainty is not None: products['ionosphere_uncertainty_rad']=write_geotiff(out/f'{base}_ionosphere_uncertainty_rad.tif',r.ionosphere_uncertainty,x,y,r.epsg,tags={'OMEGA_KIND':'MEASURED_SOURCE_UNCERTAINTY_LAYER'})
    products['qa_valid']=write_geotiff(out/f'{base}_qa_valid.tif',r.qa_valid.astype(np.float32),x,y,r.epsg,nodata=-1,tags={'OMEGA_KIND':'DERIVED_QA_MASK','MIN_COHERENCE':'none' if min_coherence is None else str(min_coherence)})
    signed_displacement=False
    if phase_to_range_sign is not None:
        if r.wavelength_m is None: raise ValueError('Cannot emit signed range change: no center frequency/wavelength found in product metadata')
        disp=phase_to_range_change_m(r.unwrapped_phase,r.wavelength_m,phase_to_range_sign)
        disp=np.where(r.qa_valid,disp,np.nan)
        products['signed_range_change_m']=write_geotiff(out/f'{base}_signed_range_change_m.tif',disp,x,y,r.epsg,tags={'OMEGA_KIND':'DERIVED_FROM_MEASURED_GUNW_PHASE','PHASE_TO_RANGE_SIGN':str(phase_to_range_sign),'WAVELENGTH_M':str(r.wavelength_m),'IONOSPHERE_APPLIED':'false','EXTERNAL_CORRECTIONS_APPLIED':'false'})
        signed_displacement=True
    manifest=r.manifest(); manifest['products']=products; manifest['output_sha256']={k:sha256_file(v) for k,v in products.items()}; manifest['semantics']['signed_displacement_emitted']=signed_displacement
    manifest_path=out/f'{base}_gunw_manifest.json'; write_json(manifest_path,manifest); manifest['manifest_path']=str(manifest_path)
    return manifest
