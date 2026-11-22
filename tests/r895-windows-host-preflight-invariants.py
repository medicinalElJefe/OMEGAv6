#!/usr/bin/env python3
"""R895 host preflight invariants; real source inspection and synthetic probe only."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import r895_windows_host_preflight as host

COMMIT = "a" * 40


def fake_runner(command: list[str], timeout: int = 12):
    if command[:2] == ["git", "-C"] and command[-2:] == ["rev-parse", "HEAD"]:
        return 0, COMMIT + "\n"
    if command[:2] == ["git", "-C"] and "status" in command:
        return 0, ""
    if command and command[0] == "powershell.exe":
        return 0, json.dumps([{"Name": "Fixture adapter", "DriverVersion": "0.0",
                                "Status": "OK", "PNPDeviceID": "fixture"}])
    return -1, ""


def run():
    source = ROOT / "public" / "omega-hybrid-agent-base-r205.py"
    assert source.is_file()
    assert host.sha256_file(source) == host.BASE_SHA256, "immutable R205 executor drifted"
    assert host.gpu_observation(False, fake_runner)["state"] == "UNAVAILABLE_NON_WINDOWS"
    gpu = host.gpu_observation(True, fake_runner)
    assert gpu["state"] == "DEVICE_OBSERVED"
    assert gpu["controllers"][0]["name"] == "Fixture adapter"
    assert gpu["executable_proof"] is False

    receipt = host.build_receipt(ROOT, COMMIT, host_platform="linux",
                                 runner=fake_runner, observed_at="2026-01-01T00:00:00+00:00")
    assert receipt["status"] == "HOLD", "synthetic Linux fixture must never certify a host"
    assert receipt["held_conditions"] == ["windows_observed", "gpu_device_observed"]
    assert receipt["source"]["files"]["base"]["sha256"] == host.BASE_SHA256
    assert receipt["source"]["files"]["base"]["git_blob_sha256"] == host.BASE_SHA256
    assert receipt["source"]["files"]["base"]["checkout_matches_git_blob"] is True

    assert receipt["source"]["actual_commit"] == COMMIT
    assert receipt["conditions"]["exact_source_commit"] is True
    assert receipt["native_gpu_workload_proven"] is False
    assert receipt["installer_lifecycle_proven"] is False
    assert receipt["verified_execution_return"] is False
    assert host.verify_receipt(receipt)
    assert host.build_receipt(ROOT, COMMIT, host_platform="linux",
                              runner=fake_runner, observed_at="2026-01-01T00:00:00+00:00") == receipt
    corrupt = json.loads(json.dumps(receipt))
    corrupt["status"] = "READY_FOR_PAIRED_HOST_PROOF"
    assert not host.verify_receipt(corrupt)
    missing = json.loads(json.dumps(receipt))
    missing.pop("receipt_sha256")
    assert not host.verify_receipt(missing)
    assert not host.verify_receipt(None)

    def bad_git(command, timeout=12):
        if "rev-parse" in command:
            return 0, "b"*40
        if "status" in command:
            return 0, " M public/omega-hybrid-agent.py\n"
        return -1, ""
    bad = host.build_receipt(ROOT, COMMIT, host_platform="linux", runner=bad_git,
                             observed_at="2026-01-01T00:00:00+00:00")
    assert not bad["conditions"]["exact_source_commit"]
    assert bad["status"] == "HOLD"

    with tempfile.TemporaryDirectory() as temp:
        empty = Path(temp)
        no_source = host.build_receipt(empty, COMMIT, host_platform="linux", runner=fake_runner,
                                       observed_at="2026-01-01T00:00:00+00:00")
        assert no_source["status"] == "HOLD"
        assert not no_source["source"]["files"]["base"]["available"]
        assert no_source["source"]["files"]["base"]["git_blob_sha256"] is None

        assert not no_source["source"]["files"]["wrapper"]["available"]
        assert host.verify_receipt(no_source)
    try:
        host.build_receipt(ROOT, "missing", host_platform="linux", runner=fake_runner)
    except ValueError:
        pass
    else:
        raise AssertionError("missing exact SHA must fail closed")
    assert host.gpu_observation(True, lambda _: (0,"not json"))["state"] == "INVALID_PROBE_OUTPUT"
    assert host.gpu_observation(True, lambda _: (-1,""))["state"] == "PROBE_FAILED"
    launcher = (ROOT / "install" / "run-r895-windows-preflight.ps1").read_text(encoding="utf-8")
    for guard in ("ValidatePattern", "ExpectedCommit", "--expected-commit", "--output",
                  "rev-parse HEAD", "$LASTEXITCODE", "exit $resultCode",
                  "OMEGA WINDOWS CHECK: READY", "OMEGA WINDOWS CHECK: NEEDS ATTENTION",
                  "omega-windows-check.json"):
        assert guard in launcher, "Windows launcher lacks a required usability or fail-closed guard: " + guard
    assert "[Parameter(Mandatory=$true)]" not in launcher, "Windows check must not require user to type a SHA"
    click = (ROOT / "install" / "OMEGA-Windows-Check.cmd").read_text(encoding="utf-8")
    for guard in ("powershell.exe", "-NoProfile", "-File", "run-r895-windows-preflight.ps1",
                  "%~dp0", "pause", "exit /b %OMEGA_RESULT%"):
        assert guard in click, "double-click launcher missing expected safety/feedback: " + guard
    assert "--expected-commit" not in click, "double-click UI must not require a manual commit argument"
    print("R895 NATIVE PREFLIGHT PASS: immutable base SHA, Windows-only observation, exact git identity, deterministic receipt, tamper refusal and no fabricated installer/GPU proof")


if __name__ == "__main__":
    run()
