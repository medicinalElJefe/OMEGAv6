"""OMEGA SAR heavy-data processor.

Measured-product processing only. This package never converts catalog footprints,
browse imagery, proxy Earth charts, or Atlas inference into SAR measurements.
"""

from .nisar import NisarProduct, ProductInspection, ScienceDataset
from .stack import accumulate_geocoded_stack, render_stack_gif
from .proof import sha256_file, deterministic_digest, write_json

__all__ = [
    "NisarProduct",
    "ProductInspection",
    "ScienceDataset",
    "accumulate_geocoded_stack",
    "render_stack_gif",
    "sha256_file",
    "deterministic_digest",
    "write_json",
]

__version__ = "0.2.0"
