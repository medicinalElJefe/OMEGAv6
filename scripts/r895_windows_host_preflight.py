#!/usr/bin/env python3
"""R895 Windows host evidence preflight, standard-library only.

Observe the local target without installing, changing services, pairing,
dispatching jobs, or declaring an installer/GPU workload successful.
The receipt is corruption-detectable SHA-256, never a signed attestation.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import platform
import re
import subprocess
import sys

SCHEMA = "OMEGA_R895_WINDOWS_HOST_PREFLIGHT"
BASE_SHA256 = "49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046"
MAX_SOURCE_BYTES = 512 * 1024
GPU_COMMAND = [
    "powershell.exe", "-NoProfile", "-NonInteractive", "-Command",
    "$ErrorActionPreference='Stop';"
    "@(Get-CimInstance Win32_VideoController | "
    "Select-Object Name,DriverVersion,Status,PNPDeviceID | "
    "ConvertTo-Json -Compress -Depth 4)"
]


def canonical_bytes(value: dict) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True,
                      allow_nan=False).encode("utf-8")


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(source: Path) -> str:
    if not source.is_file() or source.stat().st_size > MAX_SOURCE_BYTES:
        raise ValueError("Missing or oversized Hybrid Link source")
    digest = hashlib.sha256()
    with source.open("rb") as handle:
        for block in iter(lambda: handle.read(65536), b""):
            digest.update(block)
    return digest.hexdigest()


def run_command(args: list[str], timeout: int = 12) -> tuple[int, str]:
    try:
        result = subprocess.run(args, shell=False, text=True, capture_output=True,
                                timeout=timeout, check=False, encoding="utf-8", errors="replace")
        return result.returncode, result.stdout[:65536]
    except (OSError, subprocess.TimeoutExpired):
        return -1, ""


def gpu_observation(is_windows: bool, runner=run_command) -> dict:
    if not is_windows:
        return {"state": "UNAVAILABLE_NON_WINDOWS", "controllers": [], "executable_proof": False}
    code, raw = runner(GPU_COMMAND)
    if code != 0 or not raw.strip():
        return {"state": "PROBE_FAILED", "controllers": [], "executable_proof": False}
    try:
        parsed = json.loads(raw)
    except (ValueError, TypeError):
        return {"state": "INVALID_PROBE_OUTPUT", "controllers": [], "executable_proof": False}
    if isinstance(parsed, dict):
        parsed = [parsed]
    if not isinstance(parsed, list):
        return {"state": "INVALID_PROBE_OUTPUT", "controllers": [], "executable_proof": False}
    devices = []
    for entry in parsed[:16]:
        if not isinstance(entry, dict):
            continue
        name = entry.get("Name")
        status = entry.get("Status")
        driver = entry.get("DriverVersion")
        if not isinstance(name, str) or not name.strip():
            continue
        devices.append({"name": name.strip()[:120],
                        "driver_version": str(driver or "")[:80],
                        "device_status": str(status or "")[:40]})
    return {"state": "DEVICE_OBSERVED" if devices else "NO_DEVICE_OBSERVED",
            "controllers": devices, "executable_proof": False}


def build_receipt(root: Path, expected_commit: str, *, host_platform: str | None = None,
                  runner=run_command, observed_at: str | None = None) -> dict:
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError("Repository root must be a directory")
    if not re.fullmatch("[a-f0-9]{40}", expected_commit):
        raise ValueError("Expected Git source commit must be a 40-character lowercase SHA-1")
    is_windows = (host_platform or sys.platform) == "win32"
    wrapper = root / "public" / "omega-hybrid-agent.py"
    base = root / "public" / "omega-hybrid-agent-base-r205.py"
    files = {}
    for name, source in (("wrapper", wrapper), ("base", base)):
        try:
            files[name] = {"sha256": sha256_file(source), "available": True}
        except (OSError, ValueError):
            files[name] = {"sha256": None, "available": False}
    code, output = runner(["git", "-C", str(root), "rev-parse", "HEAD"])
    actual_commit = output.strip() if code == 0 and re.fullmatch("[a-f0-9]{40}", output.strip()) else None
    dirty_code, dirty_output = runner(["git", "-C", str(root), "status", "--porcelain", "--",
                                       "public/omega-hybrid-agent.py",
                                       "public/omega-hybrid-agent-base-r205.py"])
    clean_sources = dirty_code == 0 and not dirty_output.strip()
    gpu = gpu_observation(is_windows, runner)
    source_matches = actual_commit == expected_commit and clean_sources
    base_matches = files["base"]["sha256"] == BASE_SHA256
    wrapper_available = files["wrapper"]["available"]
    python_supported = sys.version_info >= (3, 10)
    conditions = {"windows_observed": is_windows, "python_supported": python_supported,
                  "exact_source_commit": source_matches, "base_sha256_verified": base_matches,
                  "wrapper_present": wrapper_available, "gpu_device_observed": bool(gpu["controllers"])}
    held = [key for key, value in conditions.items() if not value]
    body = {
        "schema": SCHEMA, "evidence_class": "TARGET_LOCAL_OBSERVATION_NOT_EXECUTION_PROOF",
        "observed_at_utc": observed_at or datetime.now(timezone.utc).isoformat(),
        "source": {"expected_commit": expected_commit, "actual_commit": actual_commit,
                   "agent_sources_clean": clean_sources, "files": files},
        "host": {"platform": host_platform or sys.platform,
                 "system": platform.system(), "release": platform.release(),
                 "python_version": platform.python_version()},
        "gpu": gpu, "conditions": conditions, "held_conditions": held,
        "status": "READY_FOR_PAIRED_HOST_PROOF" if not held else "HOLD",
        "verified_execution_return": False, "installer_lifecycle_proven": False,
        "native_gpu_workload_proven": False, "canon_admitted": False,
        "paired_host_proof_required": True,
        "integrity_notice": "SHA256 detects modification; it does not authenticate the machine or operator."
    }
    body["receipt_sha256"] = digest_bytes(canonical_bytes(body))
    return body


def verify_receipt(receipt: dict) -> bool:
    if not isinstance(receipt, dict) or receipt.get("schema") != SCHEMA:
        return False
    digest = receipt.get("receipt_sha256")
    if not isinstance(digest, str) or not re.fullmatch("[a-f0-9]{64}", digest):
        return False
    try:
        expected = digest_bytes(canonical_bytes({k: v for k, v in receipt.items()
                                                if k != "receipt_sha256"}))
    except (TypeError, ValueError):
        return False
    return digest == expected


def main() -> int:
    parser = argparse.ArgumentParser(description="OMEGA read-only Windows host preflight (not installer certification)")
    parser.add_argument("--root", required=True, type=Path, help="Checked-out OMEGA repository directory")
    parser.add_argument("--expected-commit", required=True, help="Exact 40-character Git source SHA")
    parser.add_argument("--output", required=True, type=Path, help="Local JSON evidence receipt")
    args = parser.parse_args()
    try:
        receipt = build_receipt(args.root, args.expected_commit)
        output = args.output.expanduser().resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(canonical_bytes(receipt) + b"\n")
        print(json.dumps({"status": receipt["status"], "held_conditions": receipt["held_conditions"],
                          "receipt_file": str(output), "receipt_sha256": receipt["receipt_sha256"]},
                         sort_keys=True))
        return 0 if receipt["status"] == "READY_FOR_PAIRED_HOST_PROOF" else 2
    except (OSError, ValueError) as exc:
        print("R895 host preflight refused: " + str(exc), file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
