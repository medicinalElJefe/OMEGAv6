#!/usr/bin/env python3
"""R905 exact exported sparse tensor verification against a durable R904 receipt.

Checks every serialized row, ordering, conservative mass, full state hash,
file SHA-256, and original receipt fields. This validates recorded internal
bytes; it is not a digital signature or physical/GPU proof.
"""
from __future__ import annotations
import hashlib
import re
from pathlib import Path

DIMENSIONS_R905 = 20736
MAX_ROWS_R905 = 100000
MAX_BYTES_R905 = 64 * 1024 * 1024
ROW_R905 = re.compile(rb"(0|[1-9][0-9]*),(0|[1-9][0-9]*),([1-9][0-9]*)\n\Z")
SHA_R905 = re.compile(r"^[0-9a-f]{64}$")


def verify_sparse_export_r905(path: Path, original: dict) -> dict:
    if not isinstance(original, dict) or original.get("schema") != "OMEGA_SPARSE_TENSOR_EXPORT_R904":
        raise ValueError("R905_ORIGINAL_EXPORT_RECEIPT_REQUIRED_HELD")
    artifact = original.get("artifact")
    tensor = original.get("tensor")
    if not isinstance(artifact, dict) or not isinstance(tensor, dict):
        raise ValueError("R905_RECEIPT_SCHEMA_HELD")
    file_sha = artifact.get("sha256")
    full_sha = tensor.get("fullStateSha256")
    if (not isinstance(file_sha, str) or not SHA_R905.fullmatch(file_sha)
        or not isinstance(full_sha, str) or not SHA_R905.fullmatch(full_sha)
        or full_sha != original.get("canonicalFullStateSha256")
        or tensor.get("cellCount") != DIMENSIONS_R905
        or tensor.get("lanesPerCell") != DIMENSIONS_R905
        or tensor.get("conservationExact") is not True):
        raise ValueError("R905_RECEIPT_HASH_OR_DIMENSIONS_HELD")
    count = original.get("exportedRows")
    mass = tensor.get("totalMassAfter")
    if (type(count) is not int or not 1 <= count <= MAX_ROWS_R905
        or count != tensor.get("activeComponents")
        or type(mass) is not int or not 1 <= mass <= 10**15
        or mass != tensor.get("totalMassBefore")):
        raise ValueError("R905_RECEIPT_COUNTS_HELD")

    path = Path(path)
    if not path.is_file() or path.stat().st_size > MAX_BYTES_R905:
        raise ValueError("R905_EXPORT_FILE_LIMIT_HELD")

    file_hash = hashlib.sha256()
    state_hash = hashlib.sha256()
    seen = 0
    total = 0
    previous = None
    byte_count = 0
    with path.open("rb") as stream:
        while True:
            raw = stream.readline(128)
            if not raw:
                break
            byte_count += len(raw)
            if byte_count > MAX_BYTES_R905:
                raise ValueError("R905_EXPORT_FILE_LIMIT_HELD")
            file_hash.update(raw)
            if seen == 0 and previous is None and raw == b"cell,lane,mass\n":
                previous = (-1, -1)
                continue
            matched = ROW_R905.fullmatch(raw)
            if not matched or previous is None:
                raise ValueError("R905_NONCANONICAL_ROW_HELD")
            cell, lane, weight = (int(group) for group in matched.groups())
            if (cell >= DIMENSIONS_R905 or lane >= DIMENSIONS_R905 or weight > mass
                or (cell, lane) <= previous):
                raise ValueError("R905_ADDRESS_ORDER_OR_MASS_HELD")
            previous = (cell, lane)
            total += weight
            if total > mass:
                raise ValueError("R905_MASS_CONSERVATION_HELD")
            state_hash.update(f"{cell}:{lane}:{weight}\n".encode("ascii"))
            seen += 1
            if seen > MAX_ROWS_R905:
                raise ValueError("R905_ROW_LIMIT_HELD")
    if previous is None or seen != count or total != mass:
        raise ValueError("R905_ROW_COUNT_OR_TOTAL_HELD")
    if file_hash.hexdigest() != file_sha:
        raise ValueError("R905_FILE_SHA_DRIFT_HELD")
    if state_hash.hexdigest() != full_sha:
        raise ValueError("R905_STATE_SHA_DRIFT_HELD")
    if type(artifact.get("byteSize")) is not int or byte_count != artifact["byteSize"]:
        raise ValueError("R905_FILE_SIZE_DRIFT_HELD")
    return {
        "schema": "OMEGA_SPARSE_EXPORT_ROUNDTRIP_R905",
        "state": "EXACT_EXPORTED_STATE_MATCH",
        "exportedRows": seen,
        "totalMass": total,
        "cellCount": DIMENSIONS_R905,
        "lanesPerCell": DIMENSIONS_R905,
        "fileSha256": file_hash.hexdigest(),
        "fullStateSha256": state_hash.hexdigest(),
        "exactFileBytesMatched": True,
        "exactStateMatched": True,
        "signedProvenance": False,
        "nativePcAccepted": False,
        "gpuComputeProven": False,
        "physicalTruthProven": False,
    }
