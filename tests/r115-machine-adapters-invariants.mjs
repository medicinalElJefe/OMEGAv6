import assert from 'node:assert/strict';
import fs from 'node:fs';
import genesis from '../services/genesisMachineR115.js';
import optical from '../services/opticalMachineR115.js';

const gHealth=await genesis.fetch(new Request('https://genesis.test/api/health'));
const gh=await gHealth.json();
assert.equal(gHealth.status,200);assert.equal(gh.ok,true);assert.equal(gh.authority,'PROPOSE_ONLY');assert.equal(gh.canonicalMutation,false);

const gRes=await genesis.fetch(new Request('https://genesis.test/api/federation/propose',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ceremony_id:'cer_test_r115',intent:'Design a bounded dielectric metasurface candidate at 550 nm with target phase 180 degrees.'})}));
const gb=await gRes.json();assert.equal(gRes.status,200);assert.equal(gb.packet.schema,'OMEGA_PACKET_v1');assert.equal(gb.packet.source_node,'omega-genesis');assert.equal(gb.packet.requested_solver,'scalar');assert.ok(gb.packet.geometry.width_nm<=gb.packet.geometry.pitch_nm);assert.ok(gb.packet.geometry.length_nm<=gb.packet.geometry.pitch_nm);assert.match(gb.packet.truth_boundary,/does not claim Maxwell validation/i);

const oHealth=await optical.fetch(new Request('https://optical.test/api/health'));
const oh=await oHealth.json();assert.equal(oHealth.status,200);assert.equal(oh.ok,true);assert.equal(oh.authority,'SCREEN_ONLY');assert.equal(oh.canonicalMutation,false);

const oRes=await optical.fetch(new Request('https://optical.test/api/federation/screen',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ceremony_id:'cer_test_r115',proposal:gb.packet})}));
const ob=await oRes.json();assert.equal(oRes.status,200);assert.equal(ob.packet.schema,'OMEGA_PACKET_v1');assert.equal(ob.packet.source_node,'omega-optical');assert.equal(ob.packet.proof.gate,'STAY');assert.ok(ob.packet.proof.mode188_score>=1.05);assert.ok(ob.packet.proof.contradiction<.75);assert.equal(ob.packet.requested_solver,'rcwa');assert.equal(ob.tier2_job.schema,'OMEGA_FULLWAVE_QUEUE_v1');assert.equal(ob.tier2_job.solver,'rcwa');assert.equal(ob.tier2_job.source_packet_id,ob.packet.packet_id);for(const k of ['n_incident','n_feature','n_background','n_substrate'])assert.ok(Number(ob.tier2_job.material_model[k])>0);assert.match(ob.packet.truth_boundary,/not RCWA\/FDTD/i);

const worker=fs.readFileSync('src/workerR115.js','utf8');
const worker116=fs.existsSync('src/workerR116.js')?fs.readFileSync('src/workerR116.js','utf8'):'';
const config=fs.readFileSync('wrangler.jsonc','utf8');
assert.match(worker,/import r114/);assert.match(worker,/OMEGA_GENESIS_MACHINE/);assert.match(worker,/OMEGA_OPTICAL_MACHINE/);assert.match(worker,/ceremony\/proposal\/service/);assert.match(worker,/ceremony\/screen\/service/);assert.match(worker,/ceremony\/queue/);assert.match(worker,/CURRENT_RCWA_WORKER_REQUIRED|runtimeFetch/);
const direct115=/"main": "src\/workerR115\.js"/.test(config),successor116=/"main": "src\/workerR116\.js"/.test(config)&&/import r115/.test(worker116);
assert.ok(direct115||successor116,'canonical entrypoint must be R115 or a strict R116 successor importing R115');
assert.match(config,/omega-genesis-machine-r115/,'R115 Genesis machine remains the active proposed-generation binding until independently superseded');
const activeR115=/"binding"\s*:\s*"OMEGA_OPTICAL_MACHINE"\s*,\s*"service"\s*:\s*"omega-optical-machine-r115"/.test(config);
const activeR1532=/"binding"\s*:\s*"OMEGA_OPTICAL_MACHINE"\s*,\s*"service"\s*:\s*"omega-optical-machine-r1532"/.test(config);
assert.ok(activeR115||activeR1532,'active Optical binding must preserve R115 or use its admitted R153.2 successor');
if(activeR1532){
 assert.equal(fs.existsSync('services/opticalMachineR115.js'),true,'R115 Optical implementation must remain as lineage evidence after successor promotion');
 assert.equal(fs.existsSync('services/opticalMachineR152.js'),true,'R152 Optical successor lineage must remain present');
 assert.equal(fs.existsSync('services/opticalMachineR1531.js'),true,'R153.1 Optical successor lineage must remain present');
 assert.equal(fs.existsSync('services/opticalMachineR1532.js'),true,'R153.2 active Optical implementation must exist');
 assert.equal(fs.existsSync('public/omega-active-federation-r167.json'),true,'R167 active-generation truth manifest is required for R153.2 binding');
 const active=JSON.parse(fs.readFileSync('public/omega-active-federation-r167.json','utf8'));
 assert.equal(active.revision,'R167');
 assert.equal(active.active?.optical?.machineVersion,'R153.2');
 assert.equal(active.active?.optical?.authority,'SCREEN_ONLY');
 assert.equal(active.active?.optical?.canonicalMutation,false);
 assert.equal(active.active?.optical?.fullwaveExecutionClaimed,false);
}
console.log(`R115 machine adapters PASS · historical PROPOSE → SCREEN → admissible RCWA request preserved · active Optical ${activeR1532?'R153.2 successor':'R115'} · authority boundaries unchanged`);
