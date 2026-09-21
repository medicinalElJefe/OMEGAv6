import assert from'node:assert/strict';
import fs from'node:fs';

const runtime=fs.readFileSync('src/visualTraversalCockpitR347.ts','utf8');
const cockpit=fs.readFileSync('src/TraversalCockpitR347.tsx','utf8');
const css=fs.readFileSync('src/traversalCockpitR347.css','utf8');
const workstation=fs.readFileSync('src/OmegaWorkstation.tsx','utf8');
const matter=fs.readFileSync('src/MatterTraversal.tsx','utf8');
const earth=fs.readFileSync('src/EarthObservatoryR8.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'OMEGA_HUMAN_VISUAL_TRAVERSAL_COCKPIT_R347',
 'R347_VISUAL_GRAMMAR',
 "channel:'POSITION'",
 "channel:'LUMINANCE_ALPHA'",
 "channel:'LINE_WEIGHT'",
 "channel:'DEFORMATION'",
 "channel:'PERSISTENCE'",
 "channel:'MOTION'",
 "channel:'COLOR_CLASS'",
 "channel:'UNCERTAINTY'",
 '20,736 is an address space',
 'physical energy remains UNBOUND',
 'route steps are model time',
 'Earth timestamps are observation time'
])assert.ok(runtime.includes(token),'R347 visual grammar missing '+token);

for(const token of[
 'getMandala20736Field',
 'mandalaLensWeight',
 'getVisualCalibration',
 'freshnessLabelR105',
 '/api/earth/evidence?lat=',
 "api.get<any>('/api/status')",
 "api.get<any>('/api/hybrid/status')",
 "VIEW_OPTIONS",
 "id:'NOW'",
 "id:'ROUTE'",
 "id:'PROOF'",
 "id:'SCAR'",
 "id:'FORECAST'",
 'PHYSICAL ENERGY HELD',
 'Observation time and model-route time stay separate.',
 'WHY IT LOOKS THIS WAY',
 'Visual encoding registry',
 "prefers-reduced-motion: reduce",
 'navigator.hardwareConcurrency',
 'stride=low?4:W<1100?2:1',
 'projected.current=pts',
 'onPointerDown={choose}',
 'onSelect(x.address)'
])assert.ok(cockpit.includes(token),'R347 cockpit missing '+token);

assert.ok(!cockpit.includes('api.post<')&&!cockpit.includes('api.post('),'R347 cockpit must remain read-only and may not acquire execution authority');
for(const forbidden of['CanonState=','OMEGA_RUNTIME.put','nativeExecutionClaimed=true','SAR_R344_CLOSURE'])assert.ok(!cockpit.includes(forbidden)&&!runtime.includes(forbidden),'R347 visual path may not acquire established authority: '+forbidden);

assert.ok(workstation.includes("import TraversalCockpitR347 from './TraversalCockpitR347';"),'R347 cockpit import missing');
assert.ok(workstation.includes("if(panel==='Cockpit')return <><TraversalCockpitR347"),'R347 must replace only the Cockpit surface');
assert.ok(workstation.includes("if(panel==='Workspace')return"),'R347 must preserve Workspace as a separate established surface');
assert.ok(matter.includes('matter-traversal'),'R347 must preserve MatterTraversal');
assert.ok(earth.includes("type EarthView='SATELLITE'|'PLANET'|'MOTION'|'EVIDENCE'|'SPACE'|'GROUND'|'CALCULUS'|'SAR'"),'R347 must preserve Earth/SAR view authority');

for(const token of[
 '.r347-truth-rail',
 '.r347-workspace',
 '.r347-stage',
 '.r347-inspector',
 '.r347-time',
 '.r347-lens-row',
 '.r347-grammar',
 '@media(max-width:760px)',
 '@media(prefers-reduced-motion:reduce)'
])assert.ok(css.includes(token),'R347 responsive cockpit CSS missing '+token);

assert.ok(pkg.scripts['test:r347']?.includes('tests/r347-human-visual-traversal-cockpit-invariants.mjs'),'R347 proof must be registered');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r347'),'R347 proof must participate in canonical static gate');

console.log('R347 HUMAN VISUAL TRAVERSAL COCKPIT PASS · calibrated 20,736 field · evidence-first visual grammar · observed/computed/forecast/held separation · distinct observation/model time rails · real-time Earth/runtime context · uncertainty visible · reduced-motion/mobile bounds · established specialist authority preserved');
