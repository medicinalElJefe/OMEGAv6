#!/usr/bin/env python3
"""R902 deterministic implicit 20,736 x 20,736 state operator.

Every 12^4 address can own a distinct sparse state over all 12^4 lanes.
The 429,981,696-component dense tensor is NEVER allocated.  Sparse finite
integer-mass transitions are deterministic, bounded and conservation-checked.
This is a computational state space, NOT 20,736 separately trained AI models.
"""
from __future__ import annotations
import hashlib
import json

AXIS = 12
DIMENSIONS = AXIS**4  # 20,736
TOTAL_POSSIBLE = DIMENSIONS**2  # 429,981,696
MAX_SEEDS = 128
MAX_STEPS = 8
MAX_NONZERO = 100000
MAX_ABS_MASS = 10**15
MAX_OUTPUT = 32


def valid_index(n):
    return type(n) is int and 0 <= n < DIMENSIONS


def shift_axis(index: int, digit: int, delta: int = 1) -> int:
    """Rotate one base-12 digit without carrying into the other 3 axes."""
    if not valid_index(index) or type(digit) is not int or not 0 <= digit < 4:
        raise ValueError("R902_ADDRESS_OR_AXIS_HELD")
    base = AXIS**digit
    value = (index // base) % AXIS
    return index + (((value + delta) % AXIS) - value) * base


def _compute_sparse_r902(args: dict):
    if not isinstance(args, dict) or set(args) - {"seeds", "steps", "cell_axis", "lane_axis"}:
        raise ValueError("R902_ARGUMENT_SCHEMA_HELD")
    steps = args.get("steps", 1)
    cell_axis = args.get("cell_axis", 0)
    lane_axis = args.get("lane_axis", 1)
    seeds = args.get("seeds")
    if type(steps) is not int or not 0 <= steps <= MAX_STEPS:
        raise ValueError("R902_STEP_BOUND_HELD")
    if type(cell_axis) is not int or type(lane_axis) is not int or not 0 <= cell_axis < 4 or not 0 <= lane_axis < 4:
        raise ValueError("R902_AXIS_BOUND_HELD")
    if not isinstance(seeds, list) or not 1 <= len(seeds) <= MAX_SEEDS:
        raise ValueError("R902_SEEDS_REQUIRED_OR_LIMIT_HELD")
    initial = {}
    modulus = 4**steps
    initial_sum = 0
    for seed in seeds:
        if not isinstance(seed, dict) or set(seed) != {"cell", "lane", "mass"}:
            raise ValueError("R902_SEED_SCHEMA_HELD")
        cell, lane, mass = seed["cell"], seed["lane"], seed["mass"]
        if not valid_index(cell) or not valid_index(lane) or type(mass) is not int:
            raise ValueError("R902_SEED_ADDRESS_OR_MASS_HELD")
        if not 0 < mass <= MAX_ABS_MASS or mass % modulus:
            raise ValueError("R902_INTEGER_CONSERVATION_BOUND_HELD")
        initial_sum += mass
        if initial_sum > MAX_ABS_MASS:
            raise ValueError("R902_TOTAL_MASS_BOUND_HELD")
        key = (cell, lane)
        initial[key] = initial.get(key, 0) + mass

    state = initial
    audit = []
    for step in range(steps):
        if len(state) * 3 > MAX_NONZERO * 3:
            raise ValueError("R902_SPARSE_ACTIVE_LIMIT_HELD")
        next_state = {}
        for (cell, lane), mass in state.items():
            if mass % 4:
                raise ValueError("R902_NONINTEGRAL_INTERMEDIATE_HELD")
            destinations = (
                ((cell, lane), mass // 2),
                ((shift_axis(cell, cell_axis), lane), mass // 4),
                ((cell, shift_axis(lane, lane_axis)), mass // 4),
            )
            for key, delta in destinations:
                next_state[key] = next_state.get(key, 0) + delta
        if len(next_state) > MAX_NONZERO:
            raise ValueError("R902_SPARSE_ACTIVE_LIMIT_HELD")
        if sum(next_state.values()) != initial_sum:
            raise ValueError("R902_CONSERVATION_FAILED")
        state = next_state
        audit.append({"step":step + 1,"activeComponents":len(state),"totalMass":initial_sum})

    # A full deterministic digest commits to EVERY non-zero entry, not a
    # preview, and uses a canonical delimiter-safe serialization.
    ordered = sorted((cell,lane,mass) for (cell,lane),mass in state.items() if mass)
    full_digest = hashlib.sha256()
    cell_mass = {}
    for cell,lane,mass in ordered:
        full_digest.update(f"{cell}:{lane}:{mass}\n".encode("ascii"))
        cell_mass[cell] = cell_mass.get(cell,0) + mass
    result = {
        "schema":"OMEGA_IMPLICIT_CELL_LANE_TENSOR_R902",
        "state":"DETERMINISTIC_SPARSE_TENSOR_EXECUTED",
        "cellCount":DIMENSIONS,
        "lanesPerCell":DIMENSIONS,
        "implicitComponents":TOTAL_POSSIBLE,
        "denseTensorAllocated":False,
        "independentAiModelsTrained":False,
        "steps":steps,
        "cellAxis":cell_axis,
        "laneAxis":lane_axis,
        "seedCount":len(seeds),
        "activeComponents":len(ordered),
        "activeCells":len(cell_mass),
        "totalMassBefore":initial_sum,
        "totalMassAfter":sum(m for _,_,m in ordered),
        "conservationExact":True,
        "fullStateSha256":full_digest.hexdigest(),
        "preview":[{"cell":cell,"lane":lane,"mass":mass} for cell,lane,mass in ordered[:MAX_OUTPUT]],
        "previewTruncated":len(ordered)>MAX_OUTPUT,
        "audit":audit,
        "physicalPcAccepted":False,
        "gpuComputeProven":False,
        "empiricalTruthProven":False
    }
    return result, ordered


def sparse_tensor_run_r902(args: dict) -> dict:
    result, _ = _compute_sparse_r902(args)
    return result


def sparse_tensor_rows_r904(args: dict):
    """Return exact R902 receipt plus every sorted nonzero component.

    This is an internal export seam. The authenticated Hub alone determines
    destination authority and durable artifact persistence.
    """
    return _compute_sparse_r902(args)


if __name__ == "__main__":
    print(json.dumps(sparse_tensor_run_r902({
        "seeds":[{"cell":0,"lane":0,"mass":4096}],
        "steps":4}),sort_keys=True))
