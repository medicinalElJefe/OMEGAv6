import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const visual=read('src/visualTruthR157.ts'),integrity=read('src/SurfaceIntegrityR81.tsx'),provenance=read('src/surfaceProvenanceR94.ts'),workstation=read('src/OmegaWorkstationFullV2.tsx'),r118=read('tests/r118-browser-operational-e2e.mjs');
const earth=read('src/EarthObservatoryR8.tsx'),forecast=read('src/ForecastSovereignPanel.tsx'),relativity=read('src/RelativityLab.tsx'),matter=read('src/MatterTraversal.tsx'),instrument=read('src/OmegaVisualInstrument.tsx');
const expected=['Matter Traversal','Visual Instrument','Immersive Traversal','Extreme Traversal','Traversal','Forecast','Relativity','Earth Now','Atlas','Infinity','Scale Compiler','Reality Lab','Field','Data Motion','Convergence'];

assert.ok(visual.includes("R157_VISUAL_TRUTH_SCHEMA='OMEGA_VISUAL_TRUTH_R157'"),'R157 visual schema missing');
for(const name of expected)assert.ok(visual.includes(`V('${name}'`),`R157 visual truth missing ${name}`);
const contracts=[...visual.matchAll(/V\('([^']+)'/g)].map(x=>x[1]);
assert.equal(contracts.length,expected.length,'R157 must define exactly the full visual-first contract set');
assert.equal(new Set(contracts).size,expected.length,'R157 visual contracts must be unique');
for(const name of expected)assert.ok(contracts.includes(name),`R157 registry mismatch ${name}`);
assert.ok(visual.includes('visualTruthAuditR157')&&visual.includes('literalDimensionClaims'),'R157 must self-audit truth boundaries and dimensional overclaim');
assert.ok(!/20,?736 physical dimensions/i.test(visual),'R157 must never describe logical 20,736 resolution as physical dimensions');

for(const token of ["import VisualTruthR157 from './VisualTruthR157'","visualTruthForSurfaceR157(panel)","data-visual-truth-r157={visual?'true':'false'}","data-visual-kind={visual?.kind||'NONE'}","data-visual-space={visual?.space||'NONE'}","data-visual-canon-effect={visual?.canonEffect||'NONE'}","data-visual-address={address===null?'':String(address)}",'<VisualTruthR157 surface={panel} record={record}/>'])assert.ok(integrity.includes(token),`SurfaceIntegrity missing R157 binding ${token}`);

const workstationVisual=(workstation.match(/VISUAL_FIRST_SURFACES=new Set<Panel>\(\[([^\]]+)\]\)/)||[])[1]||'';
for(const name of expected)assert.ok(workstationVisual.includes(`'${name}'`),`workstation visual-first registry lost ${name}`);
const r118Visual=(r118.match(/criticalVisual=new Set\(\[([^\]]+)\]\)/)||[])[1]||'';
for(const name of expected)assert.ok(r118Visual.includes(`'${name}'`),`browser visual gate does not cover ${name}`);

// Returned Earth observations stay distinct from model address mapping and representational calculus.
for(const token of ['WGS84 target','/api/earth/evidence?lat=','/api/earth/noaa/catalog','evidenceHash','RETURNED EVIDENCE BOUND','Missing or unavailable source material is not synthetically replaced','REPRESENTATIONAL ONLY'])assert.ok(earth.includes(token),`Earth visual truth regression: ${token}`);
assert.ok(provenance.includes("P('Earth Now','RETURNED_EVIDENCE'"),'Earth provenance must remain returned evidence');

// Forecast geometry must come from actual forecast-plan points and never claim future observation.
for(const token of ['buildForecastPlan(address,horizon','c.points.slice(0,maxH)','Advanced competing future corridor comparison','futureObservationUsed:false','Competing legal futures without pretending to observe the future','Each row is one legal model transition, not an invented minute/hour interval.'])assert.ok(forecast.includes(token),`Forecast visual truth regression: ${token}`);
assert.ok(provenance.includes("P('Forecast','FORECAST_MODEL'"),'Forecast provenance must remain forecast model');

// Relativity sliders change observer projection only; canonical packet stays the source authority.
for(const token of ['Observer speed β','gamma=1/Math.sqrt','doppler=Math.sqrt','observerBeta={observerBeta}','β, γ and Doppler alter only the observer projection shown by this surface','observer changes projection, not canonical existence'])assert.ok(relativity.includes(token),`Relativity visual truth regression: ${token}`);
assert.ok(provenance.includes("P('Relativity','EXACT_EVALUATION'"),'Relativity provenance must remain exact evaluation');

// Deep Matter rendering is parameterized by canonical field-node metrics and explicit view/projection contracts.
for(const token of ['VIEW_CONTRACT','PROJECTION_CONTRACT','Matter = complete occupancy/decision field','Proof = evidence-gated reduction','Proof rescales and weights geometry by evidence; it never creates evidence.','aCore.x','aCore.y','aCore.z','aCore.w','aMore.x','aMore.y'])assert.ok(matter.includes(token),`Matter visual truth regression: ${token}`);
assert.ok(provenance.includes("P('Matter Traversal','CANONICAL_PACKET'"),'Matter provenance must remain canonical packet');

// Visual Instrument must render the actual 20,736 field arrays/calibration rather than a generic animation.
for(const token of ['getMandala20736Field()','getVisualCalibration()','field.count','field.C[i]','field.Phi[i]','field.q[i]','mandalaLensWeight(field,i,lens)','SOURCE ${address+1} / 20,736','calibration'])assert.ok(instrument.includes(token),`Visual Instrument source binding regression: ${token}`);
assert.ok(provenance.includes("P('Visual Instrument','CANONICAL_PACKET'"),'Visual Instrument provenance must remain canonical packet');

for(const token of [
 "V('Earth Now','RETURNED_OBSERVATION','WGS84_GEOGRAPHIC'",
 "V('Reality Lab','IMPORTED_OBSERVATION','USER_DATA_SPACE'",
 "V('Forecast','FORECAST_MODEL','MODEL_FUTURE_SPACE'",
 "V('Relativity','EXACT_TRANSFORM','OBSERVER_PROJECTION'",
 "V('Data Motion','EXACT_TRANSFORM','OMEGA_TRANSITION_SPACE'",
 "V('Atlas','DERIVED_PROJECTION','OMEGA_ADDRESS_SPACE'",
 "V('Visual Instrument','CANONICAL_STATE','OMEGA_ADDRESS_SPACE'"
])assert.ok(visual.includes(token),`R157 visual-space classification missing ${token}`);

console.log('PASS R157 visual truth convergence · 15/15 visual-first surfaces classified · Earth returned evidence separated · forecast non-observational · relativity projection-only · Matter/Visual Instrument source-bound · 20,736 remains logical/address resolution');
