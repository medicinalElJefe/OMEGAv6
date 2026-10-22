from __future__ import annotations

import importlib.util
import json
import os
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / 'public' / 'omega-hybrid-agent-r141.py'

spec = importlib.util.spec_from_file_location('omega_r238_wrapper', WRAPPER)
assert spec and spec.loader, 'R238 wrapper import spec unavailable'
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

assert os.name == 'nt', 'R238 Windows host runtime proof must run on Windows'

profile = mod.host_profile(ROOT, {})
assert profile['schema'] == mod.HOST_PROFILE_SCHEMA
assert profile['revision'] == 'R238'
assert isinstance(profile.get('observedAt'), int) and profile['observedAt'] > 0
assert str(profile.get('hostName') or '').strip()
assert str(profile.get('platform') or '').strip()

cpu = profile.get('cpu') or {}
logical = int(cpu.get('logicalProcessors') or 0)
assert logical >= 1
physical = cpu.get('physicalCores')
assert physical is None or int(physical) >= 1

memory = profile.get('memory') or {}
assert int(memory.get('totalBytes') or 0) > 0
assert int(memory.get('availableBytes') or 0) >= 0
assert 0 <= int(memory.get('loadPercent') or 0) <= 100

storage = profile.get('storage') or {}
assert int(storage.get('totalBytes') or 0) > 0
assert int(storage.get('freeBytes') or 0) >= 0
assert str(storage.get('rootLabel') or '').strip()

python = profile.get('python') or {}
assert str(python.get('version') or '').strip()
assert str(python.get('executable') or '').strip()
assert str(python.get('architecture') or '').strip()

rcwa = profile.get('rcwa') or {}
assert rcwa.get('state') in {'PYTHON_DEPENDENCY_AVAILABLE', 'PYTHON_DEPENDENCY_NOT_INSTALLED'}
assert isinstance(rcwa.get('pythonDependencyAvailable'), bool)

scheduler = profile.get('schedulerAdvisory') or {}
workers = int(scheduler.get('recommendedCpuWorkers') or 0)
assert 1 <= workers <= 12
assert workers <= logical
assert scheduler.get('authority') == 'ADVISORY_ONLY'

profile_core = dict(profile)
observed_hash = profile_core.pop('profileSha256')
assert observed_hash == mod.sha_json(profile_core)

# The GPU result is allowed to be absent on a hosted runner, but it must remain
# a bounded observation envelope rather than an execution/CUDA claim.
gpu = profile.get('gpu') or {}
assert isinstance(gpu.get('present'), bool)
assert str(gpu.get('query') or '').strip()

class FakeBase:
    class AgentError(RuntimeError):
        pass

    @staticmethod
    def macro_path(root: Path, name: str) -> Path:
        return root / '.omega_hybrid' / 'macros' / (str(name) + '.json')

with tempfile.TemporaryDirectory() as td:
    root = Path(td)
    macro_dir = root / '.omega_hybrid' / 'macros'
    macro_dir.mkdir(parents=True)
    core = {
        'schema': 'OMEGA_LOCAL_MACRO_R132',
        'windowTitleLock': 'OMEGA R238 Test Window',
        'events': [
            {'t': 0.0, 'type': 'MOVE', 'x': 10, 'y': 20},
            {'t': 0.1, 'type': 'CLICK', 'x': 10, 'y': 20, 'button': 'LEFT'},
            {'t': 0.2, 'type': 'KEY_RAW', 'vk': 65},
        ],
        'eventCount': 3,
        'recordedAt': 1.0,
    }
    payload = dict(core)
    payload['macroSha256'] = mod.sha_json(core)
    macro_file = macro_dir / 'proof.json'
    macro_file.write_text(json.dumps(payload), encoding='utf-8')

    receipt = mod.verify_macro_replay(FakeBase, root, 'proof', 'OMEGA R238 Test Window')
    assert receipt['schema'] == mod.MACRO_PREFLIGHT_SCHEMA
    assert receipt['state'] == 'VERIFIED'
    assert receipt['eventCount'] == 3
    assert receipt['contentsReturned'] is False

    try:
        mod.verify_macro_replay(FakeBase, root, 'proof', 'Wrong Window')
        raise AssertionError('window-title mismatch was not rejected')
    except FakeBase.AgentError:
        pass

    payload['events'][0]['x'] = 999
    macro_file.write_text(json.dumps(payload), encoding='utf-8')
    try:
        mod.verify_macro_replay(FakeBase, root, 'proof', 'OMEGA R238 Test Window')
        raise AssertionError('tampered macro hash was not rejected')
    except FakeBase.AgentError:
        pass

print('OMEGA R238 WINDOWS HOST RUNTIME PROOF PASS · Windows CPU/RAM/storage/Python observed · scheduler bounded · RCWA state bounded · profile hash exact · macro schema/hash/window preflight tamper rejection proved')
