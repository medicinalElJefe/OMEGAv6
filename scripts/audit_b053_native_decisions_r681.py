#!/usr/bin/env python3
"""R681 read-only native decision discriminator and source-consistency audit.

Authoritative observations: the original B053 State Traversal SQLite snapshot,
not an inferred physics field. The source DecisionKernel is a *comparison*
algorithm, not an authority to silently overwrite historical decisions.

No database writes, automated threshold tuning, or source mutation.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from contextlib import contextmanager
import hashlib
import json
import math
from pathlib import Path
import sqlite3
import tempfile
from urllib.parse import quote
import zipfile

DB_MEMBER = "Dimensional_Relativity_Stabilized/atlas_runtime.db"
ORIGINAL_SHA256 = "be3dc2f5a7e80f672d9a6820d780d7821195005f5d8760a05c9f116135b5b13c"
EXPECTED_COUNT = 20736
MAX_SQLITE_BYTES = 12 * 1024 * 1024
LABELS = ("STAY", "TURN", "ESCALATE")
KERNEL = {"gamma": 0.25, "epsilon": 1e-9, "stay": 1.05, "escalate": 0.78, "turn": 0.33}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()



def canonical_audit_bytes(report: dict) -> bytes:
    """Deterministic report serialization; the receipt field cannot attest itself."""
    body = {k:v for k,v in report.items() if k != "audit_receipt_sha256"}
    return json.dumps(body,sort_keys=True,separators=(",",":"),allow_nan=False).encode("utf-8")


def verify_audit_receipt(report: dict) -> bool:
    """Verify report integrity only; source identity still requires hashing SQLite bytes."""
    candidate = report.get("audit_receipt_sha256")
    return (isinstance(candidate,str) and len(candidate)==64 and
            candidate == hashlib.sha256(canonical_audit_bytes(report)).hexdigest())


def source_decision(c: float, burden: float, q: float):
    """Unmodified historical backend/truth_spine/decision.py defaults."""
    if not all(math.isfinite(x) for x in (c, burden, q)) or min(c, burden, q) < 0:
        raise ValueError("R681 invalid non-finite or negative canonical source packet")
    denominator = burden + q + KERNEL["gamma"] * burden * q + KERNEL["epsilon"]
    s = c / denominator
    t = max(0.0, q + 0.25 * burden - 0.18 * c)
    label = ("STAY" if s > KERNEL["stay"] and t < KERNEL["turn"]
             else "ESCALATE" if s < KERNEL["escalate"] else "TURN")
    return s, t, label


@contextmanager
def trusted_snapshot(source: Path, from_zip: bool):
    source = Path(source)
    if from_zip:
        with zipfile.ZipFile(source) as container:
            members = [x for x in container.infolist() if x.filename == DB_MEMBER]
            if len(members) != 1:
                raise ValueError("R681 source donor contains missing or duplicate SQLite snapshot")
            if members[0].file_size > MAX_SQLITE_BYTES:
                raise ValueError("R681 source database exceeds bounded extraction size")
            data = container.read(members[0])
            if len(data) != members[0].file_size:
                raise ValueError("R681 truncated source member")
        with tempfile.TemporaryDirectory(prefix="omega-r681-") as temp:
            temp_file = Path(temp) / "source.db"
            temp_file.write_bytes(data)
            yield temp_file, digest(data), len(data)
    else:
        if not source.is_file() or source.stat().st_size > MAX_SQLITE_BYTES:
            raise ValueError("R681 requires bounded immutable SQLite source")
        raw = source.read_bytes()
        yield source, digest(raw), len(raw)


def audit_database(database: Path, *, expected_count: int = EXPECTED_COUNT,
                   source_sha256: str | None = None, source_bytes: int | None = None):
    if not isinstance(expected_count, int) or expected_count <= 0 or expected_count > EXPECTED_COUNT:
        raise ValueError("R681 invalid expected runtime cardinality")
    database = Path(database).resolve(strict=True)
    # R688: independently bind every proof to the actual bounded SQLite bytes.
    # Caller-provided digests and lengths are assertions, never proof by themselves.
    size = database.stat().st_size
    if size > MAX_SQLITE_BYTES:
        raise ValueError("R688 source database exceeds bounded audit size")
    actual_sha256 = digest(database.read_bytes())
    if source_sha256 is not None and source_sha256 != actual_sha256:
        raise ValueError("R688 claimed source digest does not match SQLite bytes")
    if source_bytes is not None and source_bytes != size:
        raise ValueError("R688 claimed source length does not match SQLite bytes")
    source_sha256 = actual_sha256
    source_bytes = size
    uri = "file:" + quote(str(database), safe="/:") + "?mode=ro&immutable=1"
    connection = sqlite3.connect(uri, uri=True)
    try:
        connection.execute("PRAGMA query_only=ON")
        names = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        if not {"runtime_state", "atlas_nodes"} <= names:
            raise ValueError("R681 original native runtime schema incomplete")
        rows = connection.execute("""
            SELECT r.node_id, r.continuity, r.ledger, r.contradiction,
                   r.stability_ratio, r.turn_pressure, r.decision_state, a.shell
            FROM runtime_state AS r
            LEFT JOIN atlas_nodes AS a ON a.node_id=r.node_id
            ORDER BY r.node_id
        """).fetchall()
        if len(rows) != expected_count:
            raise ValueError(f"R681 runtime cardinality mismatch: {len(rows)} != {expected_count}")
        if any(row[7] is None for row in rows):
            raise ValueError("R681 missing/duplicated runtime-to-atlas node provenance")
        stored = Counter()
        computed = Counter()
        divergence = Counter()
        shells = defaultdict(Counter)
        ratio_diff_count = 0
        turn_diff_count = 0
        max_ratio_diff = 0.0
        max_turn_diff = 0.0
        examples = []
        for node,c,ledger,q,old_ratio,old_turn,old_decision,shell in rows:
            if (not isinstance(node,str) or not isinstance(shell,int)
                    or shell < 1 or shell > 12 or old_decision not in LABELS):
                raise ValueError("R681 invalid node identity, shell, or saved decision")
            ratio, turn, calculated = source_decision(c,ledger,q)
            if not all(isinstance(v,(int,float)) and math.isfinite(v) for v in (old_ratio,old_turn)):
                raise ValueError("R681 invalid saved numerical diagnostic")
            dr = abs(ratio-old_ratio)
            dt = abs(turn-old_turn)
            if dr > 1e-8: ratio_diff_count += 1
            if dt > 1e-8: turn_diff_count += 1
            max_ratio_diff = max(max_ratio_diff,dr)
            max_turn_diff = max(max_turn_diff,dt)
            stored[old_decision] += 1
            computed[calculated] += 1
            shells[shell][old_decision] += 1
            if old_decision != calculated:
                divergence[old_decision+"→"+calculated] += 1
                if len(examples) < 12: examples.append({"node_id":node,"stored":old_decision,"kernel":calculated})
        n = len(rows)
        dominant = max(stored.values()) / n
        entropy = -sum((v/n)*math.log2(v/n) for v in stored.values() if v)
        # Detect concurrent source replacement even for a direct audit_database caller.
        if database.stat().st_size != size or digest(database.read_bytes()) != actual_sha256:
            raise ValueError("R688 source bytes changed during immutable audit")
        historical_source = actual_sha256 == ORIGINAL_SHA256 and expected_count == EXPECTED_COUNT
        reasons = []
        if not historical_source: reasons.append("SOURCE_IDENTITY_NOT_ORIGINAL_B053")
        if stored["STAY"] == 0: reasons.append("STAY_CLASS_UNREPRESENTED")
        if dominant > 0.95: reasons.append("DECISION_CLASS_CONCENTRATION_EXCEEDS_95_PERCENT")
        if divergence: reasons.append("STORED_DECISIONS_CONFLICT_WITH_RECOVERED_KERNEL")
        if ratio_diff_count or turn_diff_count: reasons.append("CACHED_DIAGNOSTICS_CONFLICT_WITH_RECOVERED_KERNEL")
        # Independently calibrated ground truth, sensor validation, and downstream
        # action outcomes are absent. No threshold fitting to this same snapshot.
        reasons.append("EMPIRICAL_LABEL_AND_OUTCOME_CALIBRATION_MISSING")
        report = {
            "schema": "OMEGA_B053_NATIVE_DECISION_TRUTH_AUDIT_R681",
            "source": DB_MEMBER, "source_sha256": source_sha256,
            "source_bytes": source_bytes, "historical_source_hash_verified": historical_source,
            "nodes": n, "source_decision_kernel": "backend/truth_spine/decision.py",
            "kernel_default_parameters": KERNEL,
            "stored": {x:stored[x] for x in LABELS},
            "recomputed": {x:computed[x] for x in LABELS},
            "stored_to_recomputed_disagreement": dict(sorted(divergence.items())),
            "disagreement_count": sum(divergence.values()),
            "cached_stability_ratio_disagreements": ratio_diff_count,
            "cached_turn_pressure_disagreements": turn_diff_count,
            "max_absolute_stability_ratio_residual": max_ratio_diff,
            "max_absolute_turn_pressure_residual": max_turn_diff,
            "stored_shannon_entropy_bits": entropy,
            "dominant_fraction": dominant,
            "shells": {str(shell):{label:counts[label] for label in LABELS}
                       for shell,counts in sorted(shells.items())},
            "sample_disagreement_ledger": examples,
            "source_mutation": False, "thresholds_modified": False,
            "production_admission": "HELD",
            "blocking_reasons": reasons,
            "truth_boundary": "Native source snapshot is historical; the recovered DecisionKernel is not proven to be the original generator or empirical ground truth. Differences are evidence, not an instruction to overwrite database rows."
        }
        report["audit_receipt_sha256"] = hashlib.sha256(canonical_audit_bytes(report)).hexdigest()
        assert verify_audit_receipt(report)
        return report
    finally:
        connection.close()


def audit_source(path: Path, *, from_zip: bool, expected_count: int = EXPECTED_COUNT):
    with trusted_snapshot(path,from_zip) as (db,sha,size):
        result = audit_database(db,expected_count=expected_count,source_sha256=sha,source_bytes=size)
        if not from_zip and digest(Path(path).read_bytes()) != sha:
            raise ValueError("R681 source changed during read-only audit")
        return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument("--source-zip",type=Path)
    src.add_argument("--database",type=Path)
    parser.add_argument("--out",required=True,type=Path)
    args = parser.parse_args()
    result = audit_source(args.source_zip or args.database,from_zip=bool(args.source_zip))
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print(json.dumps({"source_verified":result["historical_source_hash_verified"],
        "nodes":result["nodes"],"stored":result["stored"],"disagreements":result["disagreement_count"],
        "production_admission":result["production_admission"]},sort_keys=True))


if __name__ == "__main__":
    main()
