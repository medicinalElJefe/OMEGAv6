#!/usr/bin/env python3
"""R907 deterministic SVG state projection from verified 20,736D checkpoint.

R902 address base-12 digits (d0,d1,d2,d3) map bijectively to
x=d0+12*d1 and y=d2+12*d3 on a 144x144 grid. All 20,736 state
lanes in each cell aggregate as mass; the full checkpoint remains the
authority. No independently trained models, graphics hardware, or
physical simulation truth is implied.
"""
from __future__ import annotations
import math

SCHEMA = "OMEGA_SPARSE_CELL_PROJECTION_R907"
SIDE = 144
DIMENSIONS = SIDE * SIDE
MAX_ROWS = 100000
MAX_MASS = 10**15
GRID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"



def address_xy_r907(cell: int):
    if type(cell) is not int or not 0 <= cell < DIMENSIONS:
        raise ValueError("R907_ADDRESS_BOUND_HELD")
    d0 = cell % 12
    d1 = (cell // 12) % 12
    d2 = (cell // 144) % 12
    d3 = (cell // 1728) % 12
    return d0 + 12 * d1, d2 + 12 * d3


def project_verified_rows_r907(rows, source_state_sha256: str):
    if not isinstance(rows, list) or not 1 <= len(rows) <= MAX_ROWS:
        raise ValueError("R907_VERIFIED_ROWS_REQUIRED_HELD")
    if (not isinstance(source_state_sha256, str) or len(source_state_sha256) != 64
        or any(c not in "0123456789abcdef" for c in source_state_sha256)):
        raise ValueError("R907_SOURCE_STATE_HASH_HELD")
    cell_mass = {}
    total_mass = 0
    previous = (-1, -1)
    for entry in rows:
        if (not isinstance(entry, tuple) or len(entry) != 3
            or not all(type(v) is int for v in entry)):
            raise ValueError("R907_ROW_FORMAT_HELD")
        cell, lane, mass = entry
        if not 0 <= cell < DIMENSIONS or not 0 <= lane < DIMENSIONS or mass <= 0:
            raise ValueError("R907_ROW_BOUNDS_HELD")
        if (cell, lane) <= previous:
            raise ValueError("R907_ROW_ORDER_HELD")
        previous = (cell, lane)
        total_mass += mass
        if total_mass > MAX_MASS:
            raise ValueError("R907_MASS_BOUND_HELD")
        cell_mass[cell] = cell_mass.get(cell, 0) + mass
    max_cell_mass = max(cell_mass.values())
    # Use pure numeric SVG attributes: no scripts, external assets or text
    # interpolated from an untrusted file.
    # A 20,736-character quantized preview accompanies the complete SVG.
    # This is derived display data, never a substitute for exact file/state
    # hashes or the authenticated full checkpoint.
    grid = [GRID_ALPHABET[0]] * DIMENSIONS
    for cell, value in cell_mass.items():
        x, y = address_xy_r907(cell)
        alpha = 0.20 + 0.80 * math.log1p(value) / math.log1p(max_cell_mass)
        level = min(63, max(1, round(alpha * 63)))
        grid[y * SIDE + x] = GRID_ALPHABET[level]
    fragments = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="860" viewBox="0 0 800 860" role="img" aria-label="R907 complete verified sparse-state cell mass projection">',
        '<title>OMEGA verified 20,736-cell state projection</title>',
        '<desc>Each one of the 144 by 144 pixels is one distinct base-12 cell address. Color opacity shows aggregate conserved integer mass across that cell\'s 20,736 state lanes. Empty cells have zero mass. This is a mathematical view, not a physical observation.</desc>',
        '<rect width="800" height="860" fill="#0c1725"/>',
        '<text x="40" y="29" fill="#e2edf7" font-family="monospace" font-size="16">OMEGA / R907 / 12^4 CELL PROJECTION</text>',
        '<text x="40" y="51" fill="#9bbacd" font-family="monospace" font-size="10">x = d0 + 12*d1    y = d2 + 12*d3    lanes = 20,736 / cell</text>',
        '<g transform="translate(40 70)">',
        '<rect width="720" height="720" fill="#162a3b"/>'
    ]
    for cell in sorted(cell_mass):
        x, y = address_xy_r907(cell)
        value = cell_mass[cell]
        # Log-normalized intensity retains low-mass visibility, with 0
        # reserved only for truly empty cells.
        alpha = 0.20 + 0.80 * math.log1p(value) / math.log1p(max_cell_mass)
        fragments.append(
            f'<rect x="{x * 5}" y="{y * 5}" width="5" height="5" '
            f'fill="#5edac5" fill-opacity="{alpha:.6f}"/>'
        )
    fragments.extend([
        '</g>',
        f'<text x="40" y="813" fill="#bcd2e2" font-family="monospace" font-size="11">Active cells: {len(cell_mass)} / 20736    Nonzero lanes: {len(rows)}    Mass: {total_mass}</text>',
        f'<text x="40" y="836" fill="#9bbacd" font-family="monospace" font-size="9">Full state SHA-256: {source_state_sha256}</text>',
        '</svg>',
    ])
    svg = ("\n".join(fragments) + "\n").encode("utf-8")
    if len(svg) > 4 * 1024 * 1024:
        raise ValueError("R907_SVG_SIZE_LIMIT_HELD")
    return svg, {
        "schema": SCHEMA,
        "state": "VERIFIED_SPARSE_CELL_PROJECTION_RENDERED",
        "mapping": "BIJECTIVE_BASE12_D0_D1_D2_D3_144X144",
        "widthCells": SIDE,
        "heightCells": SIDE,
        "addressableCells": DIMENSIONS,
        "lanesPerCell": DIMENSIONS,
        "nonzeroComponents": len(rows),
        "activeCells": len(cell_mass),
        "totalMass": total_mass,
        "sourceFullStateSha256": source_state_sha256,
        "maxCellMass": max_cell_mass,
        "zeroMassCells": DIMENSIONS - len(cell_mass),
        "projectionGridEncoding": "BASE64_ALPHABET_QUANTIZED_MASS_INTENSITY_R907",
        "projectionGrid": "".join(grid),
        "denseTensorAllocated": False,
        "gpuComputeProven": False,
        "physicalPcAccepted": False,
        "physicalTruthProven": False,
    }
