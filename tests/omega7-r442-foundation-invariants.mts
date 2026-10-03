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
assert.ok(OMEGA7_NATIVE_ROUTES.length>=17,'R442 native set may grow in successors but cannot shrink below 17');
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

assert.match(lock.sourceMainSha,/^[a-f0-9]{40}$/,'successor lock must retain an exact source SHA');
assert.ok(typeof lock.sourceMilestone==='string'&&lock.sourceMilestone.length>0,'successor lock must retain a declared source milestone');
assert.ok(lock.nativeFamilies.includes('FORECAST_VISUAL_FIELD'));
assert.equal(lock.forecastTruthRule,'MODEL_FUTURES_ARE_NOT_FUTURE_OBSERVATIONS');
assert.equal(lock.motionTruthRule,'ADDRESS_SPACE_MOTION_IS_NOT_PHYSICAL_VELOCITY');
assert.equal(lock.registeredRouteCount,44);

console.log('OMEGA7 R442 CONTRACT PASS · forecast + visual family remain native in successors · future/model and motion/physics boundaries preserved · zero retirement');
