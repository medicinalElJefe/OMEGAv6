from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import h5py
from .. import nisar_gcov as _gcov
from .proof import sha256_file

@dataclass(frozen=True)
class ScienceDataset:
    path: str
    shape: tuple[int, ...]
    dtype: str
    role: str
    frequency: str | None = None
    term: str | None = None

@dataclass(frozen=True)
class ProductInspection:
    source_file: str
    source_sha256: str
    product: str
    granule: dict
    datasets: tuple[ScienceDataset, ...]
    warnings: tuple[str, ...]

class NisarProduct:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        if not self.path.exists():
            raise FileNotFoundError(self.path)

    def inspect(self) -> ProductInspection:
        datasets=[]; warnings=[]
        with h5py.File(self.path, 'r') as h5:
            product='UNKNOWN'
            for candidate in ('GCOV','GUNW','GSLC','GOFF','RUNW','RIFG','RSLC','ROFF'):
                if f'/science/LSAR/{candidate}' in h5:
                    product=candidate; break
            def visit(name,obj):
                if isinstance(obj,h5py.Dataset) and obj.ndim >= 2:
                    path='/' + name.lstrip('/')
                    frequency=None; term=None
                    parts=path.split('/')
                    for i,part in enumerate(parts):
                        if part in ('frequencyA','frequencyB'):
                            frequency=part[-1]
                            if i+1 < len(parts): term=parts[i+1]
                            break
                    datasets.append(ScienceDataset(path,tuple(int(v) for v in obj.shape),str(obj.dtype),'science' if '/grids/' in path else 'metadata',frequency,term))
            h5.visititems(visit)
        if product == 'UNKNOWN':
            warnings.append('No supported /science/LSAR product root detected.')
        return ProductInspection(str(self.path),sha256_file(self.path),product,_gcov.parse_granule_name(self.path.name),tuple(datasets),tuple(warnings))

    def read_gcov(self, frequency='A', term='HHHH', **kwargs):
        return _gcov.read_gcov(self.path, frequency, term, **kwargs)

    def export_gcov(self, out_dir, frequency='A', term='HHHH', **kwargs):
        return _gcov.export_gcov(self.path, out_dir, frequency, term, **kwargs)

DIAGONAL_TERMS = _gcov.DIAGONAL_TERMS
OFF_DIAGONAL_TERMS = _gcov.OFF_DIAGONAL_TERMS
read_gcov = _gcov.read_gcov
export_gcov = _gcov.export_gcov
power_to_db = _gcov.power_to_db
apply_provisional_phase_correction = _gcov.apply_provisional_phase_correction
