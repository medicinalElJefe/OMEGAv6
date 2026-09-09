"""OMEGA SAR heavy-data processor.

Source-backed SAR product processing only. This package never converts catalog
footprints, browse imagery, proxy Earth charts, test fixtures, or Atlas inference
into SAR measurements.
"""

from .nisar import NisarProduct, ProductInspection, ScienceDataset
from .stack import accumulate_geocoded_stack, render_stack_gif
from .gunw import (
    GUNWResult,
    export_gunw,
    parse_gunw_granule_name,
    phase_to_range_change_m,
    read_gunw,
)
from .proof import deterministic_digest, sha256_file, write_json

__all__ = [
    'NisarProduct', 'ProductInspection', 'ScienceDataset',
    'accumulate_geocoded_stack', 'render_stack_gif',
    'GUNWResult', 'read_gunw', 'export_gunw', 'parse_gunw_granule_name',
    'phase_to_range_change_m',
    'sha256_file', 'deterministic_digest', 'write_json',
]
__version__ = '0.5.0'
