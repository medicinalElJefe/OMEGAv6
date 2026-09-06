from __future__ import annotations
import importlib.util
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
AGENT=ROOT/'public'/'omega-rcwa-agent.py'
spec=importlib.util.spec_from_file_location('omega_rcwa_agent_r146',AGENT)
module=importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)

assert module.VERSION=='R146.0'
assert module.MATERIAL_LIBRARY_VERSION.startswith('R35.0')

s470=module.resolve_material('sio2_fused',470)['n'].real
s650=module.resolve_material('sio2_fused',650)['n'].real
assert s470>1 and s650>1 and abs(s470-s650)>1e-6

t470=module.resolve_material('tio2_design',470)['n'].real
t532=module.resolve_material('tio2_design',532)['n'].real
t650=module.resolve_material('tio2_design',650)['n'].real
assert t470>t532>t650>2

model,provenance=module.resolve_stack({'incident':'air','feature':'tio2_design','background':'air','substrate':'sio2_fused'},532)
assert set(model)=={'n_incident','n_feature','n_background','n_substrate'}
assert model['n_feature']==t532
assert provenance['n_feature']['source']
assert provenance['n_substrate']['model']=='sellmeier'

job={'spectral':{'wavelengths_nm':[470,532,650,532]}}
assert module.spectral_wavelengths(job)==[470.0,532.0,650.0]
try:
    module.spectral_wavelengths({'spectral':{'wavelengths_nm':list(range(400,434))}})
except module.AgentError:
    pass
else:
    raise AssertionError('R146 accepted more than 33 spectral wavelengths')
try:
    module.resolve_material('tio2_design',900)
except module.AgentError:
    pass
else:
    raise AssertionError('R146 extrapolated beyond declared TiO2 design table')

print('R146 AGENT DISPERSION PASS',{'sio2_470':s470,'sio2_650':s650,'tio2_470':t470,'tio2_650':t650})
