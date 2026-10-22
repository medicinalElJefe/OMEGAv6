import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker,{R152_ATLAS_SIZE,R152_R44,R152_TRUTH_BOUNDARY,addressCandidateR152,screenCandidateR152,scalarMetricsR152} from '../services/opticalMachineR152.js';
import {OPTICAL_UI_R152} from '../services/opticalUiR152.js';

const must=(value,message)=>assert.ok(value,'R152 '+message);
assert.equal(R152_ATLAS_SIZE,20736);
assert.deepEqual([R152_R44.pitch_nm,R152_R44.width_nm,R152_R44.length_nm,R152_R44.height_nm],[330,105,290,575]);
assert.equal(R152_R44.status,'RECOMMENDED_NUMERICAL_CANDIDATE');
must(R152_TRUTH_BOUNDARY.includes('not RCWA/FDTD/FEM'),'must preserve reduced-order/full-wave truth boundary');

const a0=addressCandidateR152(0,532),aLast=addressCandidateR152(20735,650);
assert.equal(a0.address,0);assert.deepEqual([a0.d,a0.p,a0.r,a0.l],[0,0,0,0]);
assert.equal(aLast.address,20735);assert.deepEqual([aLast.d,aLast.p,aLast.r,aLast.l],[11,11,11,11]);
for(const item of [a0,aLast]){
 must(item.geometry.width_nm<=item.geometry.pitch_nm,'width must remain inside pitch');
 must(item.geometry.length_nm<=item.geometry.pitch_nm,'length must remain inside pitch');
 must(item.scalar_focus>=0&&item.scalar_focus<=1,'scalar focus bounded');
 must(['STAY','TURN','HOLD'].includes(item.gate),'gate must be explicit');
 assert.equal(item.evidence_class,'REDUCED_ORDER_SCREEN');
}

const r44Screen=scalarMetricsR152({geometry:{pitch_nm:330,width_nm:105,length_nm:290,height_nm:575},wavelength_nm:532,target_phase_deg:0});
must(Number.isFinite(r44Screen.metrics.mode188_score),'R44-centered screen must be executable');

const proposal={schema:'OMEGA_PACKET_v1',packet_id:'r152_test',source_node:'omega-genesis',source_sha:'r152_test_source',wavelength_nm:532,target_phase_deg:150,geometry:{pitch_nm:330,width_nm:105,length_nm:290,height_nm:575,orientation_deg:75,material:'TIO2_DESIGN_NOMINAL_ON_SIO2_FUSED'},polarization:'circular',lineage:['r152-test']};
const screened=await screenCandidateR152(proposal);
assert.equal(screened.ok,true);assert.equal(screened.body.authority,'SCREEN_ONLY');
assert.equal(screened.body.packet.source_node,'omega-optical');assert.equal(screened.body.packet.evidence_class,'REDUCED_ORDER_SCREEN');
assert.equal(screened.body.canonical_mutation,false);
if(screened.body.tier2_job){assert.equal(screened.body.tier2_job.schema,'OMEGA_FULLWAVE_QUEUE_v1');assert.equal(screened.body.tier2_job.solver,'rcwa');assert.equal(screened.body.tier2_job.state,'PREPARED_NOT_SOLVED');must(screened.body.tier2_job.truth.includes('not claimed'),'Tier-2 request must not impersonate solver proof')}

const health=await worker.fetch(new Request('https://unit.test/api/health'));
assert.equal(health.status,200);assert.equal(health.headers.get('access-control-allow-origin'),'*');
const healthBody=await health.json();assert.equal(healthBody.authority,'SCREEN_ONLY');assert.equal(healthBody.atlasSize,20736);assert.equal(healthBody.canonicalMutation,false);

const atlas=await worker.fetch(new Request('https://unit.test/api/optical/atlas?offset=20592&limit=288&wavelength_nm=470'));
assert.equal(atlas.status,200);const atlasBody=await atlas.json();assert.equal(atlasBody.items.length,144);assert.equal(atlasBody.nextOffset,null);assert.equal(atlasBody.total,20736);
for(let i=1;i<atlasBody.items.length;i++)must(atlasBody.items[i-1].scalar_focus>=atlasBody.items[i].scalar_focus,'atlas page must be deterministically ranked');

const batch=await worker.fetch(new Request('https://unit.test/api/optical/batch-screen',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({wavelength_nm:650,addresses:[0,1,1,20735]})}));
assert.equal(batch.status,200);const batchBody=await batch.json();assert.equal(batchBody.count,3);

const screenRoute=await worker.fetch(new Request('https://unit.test/api/federation/screen',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({proposal})}));
assert.equal(screenRoute.status,200);const screenBody=await screenRoute.json();assert.equal(screenBody.schema,'OMEGA_OPTICAL_SCREEN_RESPONSE_R152');

for(const token of ['VOLUMETRIC ADDRESS FIELD','20,736 Atlas','Candidate Lab','Tier‑2 Queue','Proof / Truth','PREPARED_NOT_SOLVED','RCWA unverified','address/composition grammar','@media(max-width:820px)','canvas id="fieldCanvas"'])must(OPTICAL_UI_R152.includes(token),`UI missing ${token}`);
must(!OPTICAL_UI_R152.includes('<svg class="line-chart"'),'must not regress into fake 2D line-chart presentation');
const scripts=[...OPTICAL_UI_R152.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(scripts.length,1);new Function(scripts[0]);

const inheritedR115=fs.readFileSync('services/opticalMachineR115.js','utf8');
must(inheritedR115.includes("authority:'SCREEN_ONLY'"),'must retain R115 worker authority');must(inheritedR115.includes('not RCWA/FDTD'),'must retain R115 truth boundary');
const r44Doc=fs.readFileSync('docs/OMEGA_R44_RECOMMENDED_OPTICAL_CANDIDATE.md','utf8');
for(const token of ['Pitch | 330 nm','Width | 105 nm','Length | 290 nm','Height | 575 nm','8.961217°','independent solver cross-validation'])must(r44Doc.includes(token),`must preserve R44 evidence token ${token}`);
const r151=fs.readFileSync('src/SovereignConnectionR117.tsx','utf8');must(r151.includes('CURRENT HEARTBEAT -> INDEX -> HASH_TREE -> PROOF-CONDITIONED REPAIR -> BUILD -> TEST -> PACKAGE -> R141 CLOSURE'),'must inherit current R151 execution spine');
const manifest=JSON.parse(fs.readFileSync('public/omega-optical-r152-manifest.json','utf8'));assert.equal(manifest.status,'CANDIDATE_UNTIL_LIVE_PROBE');assert.equal(manifest.authority,'SCREEN_ONLY');must(manifest.promotionGates.some(x=>x.includes('Vercel target project')),'must gate same-URL Vercel promotion on real writable access');

console.log('R152 OPTICAL OPERATIONAL CONVERGENCE PASS · 20,736 atlas + volumetric UI + bounded screening + Tier-2 truth gates + R44/R115/R151 continuity');
