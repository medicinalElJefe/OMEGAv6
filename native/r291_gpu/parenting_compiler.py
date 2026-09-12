from __future__ import annotations
from dataclasses import dataclass
import hashlib
import json
import math
from pathlib import Path

import numpy as np

PACKET_COUNT = 12 ** 4
SKIN_NAMES = (
    "MACRO_COSMIC_LATTICE",
    "MESO_DODECA_CORRIDOR",
    "MATERIAL_WATER_GEOMETRY",
    "CELLULAR_ATOMIC_SHELL",
    "SUB_MICRO_MANDALA_PACKET",
)

@dataclass(frozen=True)
class CompiledAtlas:
    packet_data: np.ndarray
    parent_edges: np.ndarray
    ancestry: np.ndarray
    metadata: dict

    def save(self, folder: Path) -> None:
        folder.mkdir(parents=True, exist_ok=True)
        np.save(folder / "packet_data.npy", self.packet_data)
        np.save(folder / "parent_edges.npy", self.parent_edges)
        np.save(folder / "ancestry.npy", self.ancestry)
        (folder / "metadata.json").write_text(json.dumps(self.metadata, indent=2), encoding="utf-8")


def _clamp(v: float) -> float:
    return max(0.0, min(1.0, v))


def _digits(i: int) -> tuple[int, int, int, int]:
    layer = i % 12
    i //= 12
    regulation = i % 12
    i //= 12
    phase = i % 12
    i //= 12
    domain = i % 12
    return domain, phase, regulation, layer


def _packet_metrics(i: int, seed_bytes: bytes) -> tuple[float, ...]:
    d, p, r, l = _digits(i)
    sv = [b / 255.0 for b in seed_bytes]
    theta = 2.0 * math.pi * (p + sv[1] * 0.07) / 12.0
    phi = 2.0 * math.pi * (d + sv[0] * 0.07) / 12.0
    rr, ll = r / 11.0, l / 11.0

    continuity = _clamp(0.48 + 0.24 * math.sin(2 * theta + phi)
                        + 0.12 * math.cos(2 * math.pi * ll + theta)
                        + 0.10 * sv[7])
    burden = _clamp(0.14 + 0.32 * rr + 0.12 * abs(math.sin(phi - theta))
                    + 0.10 * (1 - sv[4]))
    contradiction = _clamp(0.08 + 0.36 * abs(math.sin(
        (d - p) * math.pi / 12 + r * 0.37 - l * 0.21 + sv[6])))
    motion = _clamp(0.12 + 0.52 * ll + 0.12 * math.cos(theta - phi) + 0.10 * sv[9])
    plasticity = _clamp(0.22 + 0.62 * continuity - 0.25 * contradiction
                        - 0.10 * burden + 0.14 * sv[10])
    scar = _clamp(0.16 * contradiction + 0.18 * burden + 0.26 * sv[6]
                  + 0.10 * (1 - continuity))
    inverse = _clamp(0.34 * motion + 0.22 * contradiction
                     + 0.22 * (1 - plasticity) + 0.22 * sv[9])
    outverse = _clamp(0.34 * plasticity + 0.22 * continuity
                      + 0.22 * (1 - burden) + 0.22 * sv[10])
    torsion = _clamp(abs(contradiction - (1 - continuity)) * 0.55
                     + abs(inverse - outverse) * 0.35)
    water = _clamp(0.34 * continuity + 0.22 * (1 - burden)
                   + 0.20 * plasticity + 0.24 * (1 - torsion))
    triangulation = (
        max(0.001, continuity) * max(0.001, plasticity)
        * max(0.001, 1 - burden) * max(0.001, 1 - contradiction)
        * max(0.001, water)
    ) ** 0.2
    proof_scar = _clamp(0.34 * scar + 0.22 * contradiction + 0.18 * torsion
                        + 0.14 * inverse + 0.12 * (1 - triangulation))
    teal = _clamp(0.30 * continuity + 0.28 * water
                  + 0.22 * triangulation + 0.20 * (1 - proof_scar))
    branch = _clamp(0.31 * outverse + 0.22 * (1 - inverse)
                    + 0.18 * plasticity + 0.17 * water + 0.12 * triangulation)
    construct = _clamp(plasticity * continuity * (1.0 - burden))
    prune = _clamp(contradiction * proof_scar * (0.4 + burden))
    carry = continuity
    phase_angle = 2.0 * math.pi * p / 12.0

    return (
        float(d), float(p), float(r), float(l),
        carry, construct, prune, scar, burden, contradiction,
        plasticity, torsion, water, triangulation, teal, branch,
        inverse, outverse, phase_angle, motion
    )


def _parent_index(i: int) -> int:
    d, p, r, l = _digits(i)
    if l > 0:
        return ((d * 12 + p) * 12 + r) * 12 + (l - 1)
    if r > 0:
        return ((d * 12 + p) * 12 + (r - 1)) * 12
    if p > 0:
        return ((d * 12 + (p - 1)) * 12) * 12
    if d > 0:
        return (((d - 1) * 12) * 12) * 12
    return 0


def compile_atlas(seed: str) -> CompiledAtlas:
    seed_hash = hashlib.sha256(seed.encode("utf-8")).digest()
    packet_data = np.empty((PACKET_COUNT, 20), dtype=np.float32)
    parent_edges = np.empty((PACKET_COUNT - 1, 2), dtype=np.uint32)
    ancestry = np.empty((PACKET_COUNT, 4), dtype=np.uint32)

    for i in range(PACKET_COUNT):
        packet_data[i] = _packet_metrics(i, seed_hash)
        chain = [i]
        cur = i
        for _ in range(3):
            cur = _parent_index(cur)
            chain.append(cur)
        ancestry[i] = chain
        if i:
            parent_edges[i - 1] = (_parent_index(i), i)

    meta = {
        "seed": seed,
        "seed_sha256": hashlib.sha256(seed.encode("utf-8")).hexdigest(),
        "packet_count": PACKET_COUNT,
        "edge_count": PACKET_COUNT - 1,
        "packet_columns": [
            "domain", "phase", "regulation", "layer",
            "carry", "construct", "prune", "scar", "burden",
            "contradiction", "plasticity", "torsion", "water",
            "triangulation", "teal", "branch", "inverse", "outverse",
            "phase_angle", "motion"
        ],
        "skins": list(SKIN_NAMES),
        "parent_rule": "layer -> regulation -> phase -> domain",
    }
    return CompiledAtlas(packet_data, parent_edges, ancestry, meta)


def validate(compiled: CompiledAtlas) -> dict:
    p = compiled.packet_data
    e = compiled.parent_edges
    checks = {
        "packet_shape": tuple(p.shape) == (PACKET_COUNT, 20),
        "edge_shape": tuple(e.shape) == (PACKET_COUNT - 1, 2),
        "finite": bool(np.isfinite(p).all()),
        "normalized_metrics": bool(((p[:, 4:18] >= 0) & (p[:, 4:18] <= 1)).all()),
        "valid_parent_ids": bool((e < PACKET_COUNT).all()),
        "no_forward_parenting": bool((e[:, 0] <= e[:, 1]).all()),
        "root_is_self_parent": _parent_index(0) == 0,
    }
    checks["pass"] = all(checks.values())
    return checks


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", default="Omega full atlas parenting traversal")
    ap.add_argument("--out", default="workspace/cache/compiled_atlas")
    args = ap.parse_args()
    result = compile_atlas(args.seed)
    checks = validate(result)
    result.save(Path(args.out))
    print(json.dumps({"metadata": result.metadata, "checks": checks}, indent=2))
    raise SystemExit(0 if checks["pass"] else 1)
