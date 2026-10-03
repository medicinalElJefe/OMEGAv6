import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';
import {buildForecastPlan} from '../src/forecastRuntime.ts';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const workspace=fs.readFileSync('src7/workspaces/ForecastVisualWorkspaceR442.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

const added=['Forecast','Visual Instrument','Field','Data Motion','Convergence'];
for(const route of added)assert.equal(isOmega7NativeRoute(route),true,route+' must be native in R442');
assert.equal(OMEGA7_NATIVE_ROUTES.length,17);
assert.ok(native.includes("lazy(()=>import('./workspaces/ForecastVisualWorkspaceR442'))"));
for(const token of ['ForecastSovereignPanel','VisualInstrumentR36','OmegaFieldMotionConvergenceR28','OmegaConvergenceSurfaceR416','buildForecastPlan','omega.v6.address'])assert.ok(workspace.includes(token),'R442 missing '+token);
assert.ok(workspace.includes("depth!=='STANDARD'")&&workspace.includes('Open full {route} instrument'),'Standard view must summarize before full instrument');
assert.ok(workspace.includes('future observations are not used or invented'));
assert.ok(workspace.includes('address-space motion remains distinct from physical motion'));

const forecast=buildForecastPlan(0,12,'CANON_PHASE');
assert.ok(forecast.corridors.length>1);
assert.match(forecast.boundary,/not observations from the future/i);
assert.equal(forecast.timeAuthority,'CANON_PHASE');

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
for(const route of OMEGA7_NATIVE_ROUTES)assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute===route)?.migration,'ADAPTED');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false);

assert.equal(lock.sourceMainSha,'25e98d1040704c897541db73370616b5f2b47928');
assert.equal(lock.sourceMilestone,'R441');
assert.ok(lock.nativeFamilies.includes('FORECAST_VISUAL_FIELD'));
assert.equal(lock.forecastTruthRule,'MODEL_FUTURES_ARE_NOT_FUTURE_OBSERVATIONS');
assert.equal(lock.motionTruthRule,'ADDRESS_SPACE_MOTION_IS_NOT_PHYSICAL_VELOCITY');
assert.equal(lock.registeredRouteCount,44);

console.log('OMEGA7 R442 PASS · native forecast + visual field · 17 native routes · future/model and motion/physics boundaries preserved · zero retirement');
