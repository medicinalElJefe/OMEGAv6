from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Iterable

import h5py
import numpy as np

DIAGONAL_TERMS = ("HHHH", "HVHV", "VVVV", "VHVH", "RHRH", "RVRV")
OFF_DIAGONAL_TERMS = ("HHHV", "HHVH", "HHVV", "HVVH", "HVVV", "VHVV", "RHRV")
ALL_TERMS = DIAGONAL_TERMS + OFF_DIAGONAL_TERMS
PHASE_CORRECTION_DEG = 59.0
PHASE_CORRECTION_SIGN = {
    "HVVH": +1,
    "HHHV": -1,
    "HHVV": -1,
    "VHVV": -1,
    "HHVH": 0,
    "HVVV": 0,
    "RHRV": 0,
}
DATA_GAP = ("2026-07-27T22:03:25Z", "2026-08-10T00:55:27Z")


def sha256_file(path: str | Path, block: int = 4 * 1024 * 1024) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            b = f.read(block)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def _decode(v: Any) -> Any:
    if isinstance(v, bytes):
        return v.decode("utf-8", "replace")
    if isinstance(v, np.ndarray) and v.shape == ():
        return _decode(v.item())
    if isinstance(v, np.generic):
        return v.item()
    return v


def _first_existing(h5: h5py.File | h5py.Group, paths: Iterable[str]):
    for path in paths:
        if path in h5:
            return h5[path]
    return None


def _scalar(h5: h5py.File | h5py.Group, paths: Iterable[str], default=None):
    obj = _first_existing(h5, paths)
    if obj is None:
        return default
    try:
        value = obj[()]
    except Exception:
        return default
    value = _decode(value)
    if isinstance(value, np.ndarray):
        return value.tolist()
    return value


def parse_granule_name(name: str) -> dict[str, Any]:
    stem = Path(name).name.rsplit(".", 1)[0]
    parts = stem.split("_")
    out = {"granule": stem}
    if len(parts) >= 18 and parts[0] == "NISAR":
        keys = ["mission","instrument_level","processing_type","product","cycle","relative_orbit","orbit_direction","frame","mode","polarization_mode","source","start_time","end_time","crid","accuracy","coverage","location","counter"]
        out.update(dict(zip(keys, parts[:18])))
        out["maturity"] = "PROVISIONAL" if str(out.get("crid", "")).upper().startswith("P05") else "UNKNOWN"
    else:
        m = re.search(r"_(P\d{5})_", stem)
        if m:
            out["crid"] = m.group(1)
            out["maturity"] = "PROVISIONAL" if m.group(1) >= "P05023" else "BETA_OR_EARLIER"
    return out


def gcov_group(frequency: str) -> str:
    f = str(frequency).upper().replace("FREQUENCY", "")
    if f not in {"A", "B"}:
        raise ValueError("frequency must be A or B")
    return f"/science/LSAR/GCOV/grids/frequency{f}"


def list_gcov_layers(h5: h5py.File, frequency: str = "A") -> dict[str, str]:
    base = gcov_group(frequency)
    if base not in h5:
        raise KeyError(f"Missing {base}")
    group = h5[base]
    return {key: f"{base}/{key}" for key in group.keys() if isinstance(group[key], h5py.Dataset)}


def coordinate_vectors(h5: h5py.File, frequency: str = "A") -> tuple[np.ndarray, np.ndarray]:
    base = gcov_group(frequency)
    x = _first_existing(h5, [f"{base}/xCoordinates", f"{base}/coordinateX"])
    y = _first_existing(h5, [f"{base}/yCoordinates", f"{base}/coordinateY"])
    if x is not None and y is not None and x.ndim == 1 and y.ndim == 1:
        return np.asarray(x[:], dtype=float), np.asarray(y[:], dtype=float)
    x0 = _scalar(h5, [f"{base}/startingX", f"{base}/xStart"])
    y0 = _scalar(h5, [f"{base}/startingY", f"{base}/yStart"])
    dx = _scalar(h5, [f"{base}/xCoordinateSpacing", f"{base}/xSpacing"])
    dy = _scalar(h5, [f"{base}/yCoordinateSpacing", f"{base}/ySpacing"])
    layers = list_gcov_layers(h5, frequency)
    term = next((layers[t] for t in DIAGONAL_TERMS if t in layers), None)
    if term and all(v is not None for v in [x0, y0, dx, dy]):
        rows, cols = h5[term].shape[-2:]
        return np.asarray(x0 + np.arange(cols) * dx, dtype=float), np.asarray(y0 + np.arange(rows) * dy, dtype=float)
    raise KeyError(f"Unable to resolve geocoded x/y vectors under {base}")


def resolve_epsg(h5: h5py.File, frequency: str = "A") -> int:
    base = gcov_group(frequency)
    obj = _first_existing(h5, [f"{base}/projection", f"{base}/epsg", "/science/LSAR/GCOV/grids/projection"])
    candidates = []
    if obj is not None:
        try:
            candidates.append(_decode(obj[()]))
        except Exception:
            pass
        candidates.extend(_decode(v) for v in obj.attrs.values())
    candidates.extend(_decode(v) for v in h5[base].attrs.values())
    for value in candidates:
        if isinstance(value, (int, np.integer)) and 1000 <= int(value) <= 999999:
            return int(value)
        text = str(value)
        m = re.search(r"EPSG[:= ]+(\d{4,6})", text, re.I)
        if m:
            return int(m.group(1))
        if text.isdigit() and 1000 <= int(text) <= 999999:
            return int(text)
    raise KeyError("Unable to resolve EPSG code from NISAR GCOV projection metadata")


def apply_provisional_phase_correction(data: np.ndarray, term: str) -> tuple[np.ndarray, dict[str, Any]]:
    term = term.upper()
    sign = PHASE_CORRECTION_SIGN.get(term, 0)
    if not np.iscomplexobj(data) or sign == 0:
        return data, {"applied": False, "degrees": 0.0, "term": term}
    degrees = PHASE_CORRECTION_DEG * sign
    return data * np.exp(1j * np.deg2rad(degrees)), {"applied": True, "degrees": degrees, "term": term}


def gamma_to_sigma(gamma0: np.ndarray, factor: np.ndarray) -> np.ndarray:
    if gamma0.shape != factor.shape:
        raise ValueError("rtcGammaToSigmaFactor shape must match covariance grid")
    out = np.asarray(gamma0, dtype=np.float64) * np.asarray(factor, dtype=np.float64)
    out[~np.isfinite(out)] = np.nan
    return out


def power_to_db(power: np.ndarray, floor: float = 1e-12) -> np.ndarray:
    arr = np.asarray(power, dtype=np.float64)
    out = np.full(arr.shape, np.nan, dtype=np.float32)
    valid = np.isfinite(arr) & (arr > 0)
    out[valid] = (10.0 * np.log10(np.maximum(arr[valid], floor))).astype(np.float32)
    return out


def qa_mask(mask: np.ndarray | None, looks: np.ndarray | None, min_looks: float = 1.0) -> np.ndarray | None:
    valid = None
    if mask is not None:
        valid = np.asarray(mask) != 0
    if looks is not None:
        look_valid = np.isfinite(looks) & (np.asarray(looks) >= min_looks)
        valid = look_valid if valid is None else valid & look_valid
    return valid


@dataclass
class GCOVResult:
    source_file: str
    source_sha256: str
    granule: dict[str, Any]
    frequency: str
    term: str
    dataset_path: str
    epsg: int
    shape: tuple[int, int]
    gamma0: np.ndarray
    sigma0: np.ndarray | None
    mask: np.ndarray | None
    number_of_looks: np.ndarray | None
    rtc_gamma_to_sigma_factor: np.ndarray | None
    qa_valid: np.ndarray | None
    phase_correction: dict[str, Any]
    warnings: list[str]

    def manifest(self) -> dict[str, Any]:
        payload = asdict(self)
        for key in ["gamma0", "sigma0", "mask", "number_of_looks", "rtc_gamma_to_sigma_factor", "qa_valid"]:
            arr = payload.pop(key)
            if arr is not None:
                a = np.asarray(arr)
                finite = a[np.isfinite(a)] if np.issubdtype(a.dtype, np.number) else np.asarray([])
                payload[f"{key}_summary"] = {"shape": list(a.shape), "dtype": str(a.dtype), "finite_count": int(finite.size), "min": float(np.min(finite)) if finite.size else None, "max": float(np.max(finite)) if finite.size else None}
        payload["schema"] = "omega.sar.nisar.gcov.measurement.v1"
        payload["semantics"] = {"gamma0": "source NISAR GCOV radiometrically terrain-corrected gamma0 power", "sigma0": "derived only when source rtcGammaToSigmaFactor is present", "inferred": False, "catalog_metadata_is_measurement": False}
        return payload


def read_gcov(path: str | Path, frequency: str = "A", term: str = "HHHH", *, apply_phase_correction: bool = True, min_looks: float = 1.0) -> GCOVResult:
    path = Path(path)
    term = term.upper()
    frequency = frequency.upper().replace("FREQUENCY", "")
    if term not in ALL_TERMS:
        raise ValueError(f"Unsupported GCOV covariance term: {term}")
    warnings = []
    with h5py.File(path, "r") as h5:
        base = gcov_group(frequency)
        dataset_path = f"{base}/{term}"
        if dataset_path not in h5:
            raise KeyError(f"Missing covariance dataset {dataset_path}")
        data = np.asarray(h5[dataset_path][:])
        if data.ndim != 2:
            raise ValueError(f"Expected 2-D GCOV grid, got {data.shape}")
        phase_meta = {"applied": False, "degrees": 0.0, "term": term}
        if term in OFF_DIAGONAL_TERMS:
            if not np.iscomplexobj(data):
                warnings.append("Off-diagonal GCOV term is expected to be complex-valued; source dtype should be reviewed.")
            if apply_phase_correction:
                data, phase_meta = apply_provisional_phase_correction(data, term)
            warnings.append("Off-diagonal polarimetric term remains subject to PROVISIONAL relative-phase known-issue handling.")
        gamma0 = data if np.iscomplexobj(data) else np.asarray(data, dtype=np.float32)
        mask_ds = _first_existing(h5, [f"{base}/mask"])
        looks_ds = _first_existing(h5, [f"{base}/numberOfLooks"])
        factor_ds = _first_existing(h5, [f"{base}/rtcGammaToSigmaFactor"])
        mask = np.asarray(mask_ds[:]) if mask_ds is not None else None
        looks = np.asarray(looks_ds[:], dtype=np.float32) if looks_ds is not None else None
        factor = np.asarray(factor_ds[:], dtype=np.float32) if factor_ds is not None else None
        sigma0 = gamma_to_sigma(gamma0, factor).astype(np.float32) if term in DIAGONAL_TERMS and factor is not None else None
        epsg = resolve_epsg(h5, frequency)
        x, y = coordinate_vectors(h5, frequency)
        if len(x) != data.shape[1] or len(y) != data.shape[0]:
            raise ValueError(f"Coordinate vectors {len(x)}x{len(y)} do not match grid {data.shape[1]}x{data.shape[0]}")
        granule = parse_granule_name(path.name)
        if frequency == "B":
            warnings.append("Frequency B 5 MHz has larger systematic radiometric calibration residuals in current PROVISIONAL products.")
        if granule.get("maturity") not in {"PROVISIONAL", "UNKNOWN"}:
            warnings.append("Product maturity is not confirmed PROVISIONAL; do not mix BETA/pre-calibration values as temporal change without explicit maturity controls.")
        valid = qa_mask(mask, looks, min_looks=min_looks)
    return GCOVResult(str(path), sha256_file(path), granule, frequency, term, dataset_path, epsg, tuple(int(v) for v in data.shape), gamma0, sigma0, mask, looks, factor, valid, phase_meta, warnings)


def _transform_from_xy(x: np.ndarray, y: np.ndarray):
    from rasterio.transform import Affine
    if len(x) < 2 or len(y) < 2:
        raise ValueError("Need at least two x/y coordinates to build affine transform")
    dx = float(np.median(np.diff(x)))
    dy = float(np.median(np.diff(y)))
    return Affine(dx, 0, float(x[0] - dx / 2), 0, dy, float(y[0] - dy / 2))


def write_geotiff(path: str | Path, array: np.ndarray, x: np.ndarray, y: np.ndarray, epsg: int, *, nodata: float = -9999.0, tags: dict[str, str] | None = None, cog: bool = True) -> str:
    import rasterio
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    arr = np.asarray(array)
    if np.iscomplexobj(arr):
        raise ValueError("Complex arrays must be exported as explicit real/imaginary/amplitude/phase layers")
    out = np.where(np.isfinite(arr), arr, nodata).astype(np.float32)
    transform = _transform_from_xy(x, y)
    driver = "COG" if cog else "GTiff"
    profile = dict(driver=driver, height=out.shape[0], width=out.shape[1], count=1, dtype="float32", crs=f"EPSG:{epsg}", transform=transform, nodata=nodata)
    if driver == "GTiff":
        profile.update(tiled=True, compress="deflate")
    try:
        with rasterio.open(path, "w", **profile) as dst:
            dst.write(out, 1)
            if tags:
                dst.update_tags(**tags)
    except Exception:
        if cog:
            return write_geotiff(path, array, x, y, epsg, nodata=nodata, tags=tags, cog=False)
        raise
    return str(path)


def export_gcov(path: str | Path, out_dir: str | Path, frequency: str = "A", term: str = "HHHH", *, db: bool = True, min_looks: float = 1.0) -> dict[str, Any]:
    source = Path(path)
    out_dir = Path(out_dir)
    result = read_gcov(source, frequency, term, min_looks=min_looks)
    with h5py.File(source, "r") as h5:
        x, y = coordinate_vectors(h5, frequency)
    manifest = result.manifest()
    products = {}
    base_name = f"{source.stem}_frequency{frequency}_{term}"
    if term in DIAGONAL_TERMS:
        gamma = power_to_db(result.gamma0) if db else result.gamma0
        products["gamma0_db" if db else "gamma0_power"] = write_geotiff(out_dir / f"{base_name}_gamma0{'_db' if db else ''}.tif", gamma, x, y, result.epsg, tags={"OMEGA_KIND":"MEASURED_SOURCE_DERIVED","NISAR_DATASET":result.dataset_path,"RADIOMETRY":"gamma0","DB":str(bool(db)).lower()})
        if result.sigma0 is not None:
            sigma = power_to_db(result.sigma0) if db else result.sigma0
            products["sigma0_db" if db else "sigma0_power"] = write_geotiff(out_dir / f"{base_name}_sigma0{'_db' if db else ''}.tif", sigma, x, y, result.epsg, tags={"OMEGA_KIND":"DERIVED_FROM_MEASURED_SOURCE","NISAR_DATASET":result.dataset_path,"RADIOMETRY":"sigma0","DERIVATION":"gamma0*rtcGammaToSigmaFactor","DB":str(bool(db)).lower()})
    else:
        corrected = result.gamma0
        products["complex_real"] = write_geotiff(out_dir / f"{base_name}_real.tif", np.real(corrected), x, y, result.epsg, tags={"OMEGA_KIND":"MEASURED_SOURCE_DERIVED","COMPONENT":"real","PHASE_CORRECTION_DEG":str(result.phase_correction.get("degrees",0))})
        products["complex_imag"] = write_geotiff(out_dir / f"{base_name}_imag.tif", np.imag(corrected), x, y, result.epsg, tags={"OMEGA_KIND":"MEASURED_SOURCE_DERIVED","COMPONENT":"imag","PHASE_CORRECTION_DEG":str(result.phase_correction.get("degrees",0))})
        products["amplitude"] = write_geotiff(out_dir / f"{base_name}_amplitude.tif", np.abs(corrected), x, y, result.epsg, tags={"OMEGA_KIND":"MEASURED_SOURCE_DERIVED","COMPONENT":"amplitude"})
        products["phase_rad"] = write_geotiff(out_dir / f"{base_name}_phase_rad.tif", np.angle(corrected), x, y, result.epsg, tags={"OMEGA_KIND":"MEASURED_SOURCE_DERIVED","COMPONENT":"phase_rad"})
    if result.number_of_looks is not None:
        products["number_of_looks"] = write_geotiff(out_dir / f"{base_name}_numberOfLooks.tif", result.number_of_looks, x, y, result.epsg, tags={"OMEGA_KIND":"QA_SOURCE_LAYER"})
    if result.rtc_gamma_to_sigma_factor is not None:
        products["rtc_gamma_to_sigma_factor"] = write_geotiff(out_dir / f"{base_name}_rtcGammaToSigmaFactor.tif", result.rtc_gamma_to_sigma_factor, x, y, result.epsg, tags={"OMEGA_KIND":"QA_SOURCE_LAYER"})
    if result.qa_valid is not None:
        products["qa_valid"] = write_geotiff(out_dir / f"{base_name}_qa_valid.tif", result.qa_valid.astype(np.float32), x, y, result.epsg, nodata=-1, tags={"OMEGA_KIND":"DERIVED_QA_MASK","RULE":f"mask!=0 and numberOfLooks>={min_looks}"})
    manifest["products"] = products
    manifest["output_sha256"] = {k: sha256_file(v) for k, v in products.items()}
    manifest_path = out_dir / f"{base_name}_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
    manifest["manifest_path"] = str(manifest_path)
    return manifest
