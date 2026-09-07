import assert from 'node:assert/strict';
import machine from '../services/opticalMachineR1533.js';
import {fullwaveAdmissibilityR1533} from '../services/opticalExternalToolR1533.js';

const invoke=async body=>{
 const response=await machine.fetch(new Request('https://r1533.test/api/tool/invoke',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));
 const json=await response.json();return{response,json};
};
const get=async path=>{const response=await machine.fetch(new Request('https://r1533.test'+path));return{response,json:await response.json()}};
const baseCall={schema:'OMEGA_EXTERNAL_TOOL_CALL_v1',caller:{id:'r1533-invariant',kind:'test'},goal:'Prove reduced-order winners cannot bypass the inherited R41/R43 RCWA geometry manifold.'};

const health=(await get('/api/health')).json;
assert.equal(health.ok,true);
assert.equal(health.machineVersion,'R153.3');
assert.equal(health.authority,'SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE');
assert.equal(health.externalTool?.fullwaveAdmissibility,true);
assert.equal(health.externalTool?.fullwaveExecution,false);
assert.equal(health.externalTool?.canonicalMutation,false);

const descriptor=(await get('/api/tool/descriptor')).json;
assert.equal(descriptor.version,'R153.3');
assert.equal(descriptor.authority,'SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE');
assert.ok(descriptor.operations?.adaptive_cycle);
assert.ok(descriptor.operations?.fullwave_admissibility);
assert.ok(descriptor.operations?.prepare_robust_fullwave);
for(const op of ['adaptive_cycle','fullwave_admissibility','prepare_robust_fullwave'])assert.ok(descriptor.call_schema.properties.operation.enum.includes(op));

const probe=(await get('/api/tool/probe')).json;
assert.equal(probe.ready?.fullwave_admissibility,true);
assert.equal(probe.ready?.prepare_robust_fullwave,true);
assert.equal(probe.ready?.fullwave_execution,false);
assert.equal(probe.ready?.canonical_admission,false);
assert.match(probe.r41_manifold?.rule||'',/hypot/);

const openapi=(await get('/openapi.json')).json;
assert.equal(openapi.openapi,'3.1.0');
assert.equal(openapi['x-omega-tool-version'],'R153.3');
assert.ok(openapi.paths?.['/api/tool/invoke']?.post?.requestBody?.content?.['application/json']?.schema?.properties?.operation?.enum?.includes('prepare_robust_fullwave'));

const scalarWinner={pitch_nm:304,width_nm:137,length_nm:304,height_nm:572,orientation_deg:90,material:'TIO2_DESIGN_NOMINAL_ON_SIO2_FUSED'};
const direct=fullwaveAdmissibilityR1533(scalarWinner);
assert.equal(direct.r41.valid,false);
assert.ok(direct.r41.diagonal_nm>direct.r41.limit_nm);
assert.ok(direct.r41.diagonal_to_limit_ratio>1);
assert.ok(direct.projections.length>=2);
for(const p of direct.projections){
 const g=p.geometry;
 assert.ok(Math.hypot(g.width_nm,g.length_nm)<=0.95*g.pitch_nm+1e-6);
 assert.ok(g.width_nm<g.length_nm);
}

const admissibility=(await invoke({...baseCall,request_id:'invalid-scalar',operation:'fullwave_admissibility',payload:{geometry:scalarWinner}})).json;
assert.equal(admissibility.ok,true);
assert.equal(admissibility.receipt?.tool_version,'R153.3');
assert.equal(admissibility.result?.admissibility?.status,'FULLWAVE_GEOMETRY_REFINEMENT_REQUIRED');
assert.equal(admissibility.decision_support?.next_action,'run_fullwave_manifold_projection_then_robust_rcwa');

const robustQueue=(await invoke({...baseCall,request_id:'robust-queue',operation:'prepare_robust_fullwave',payload:{geometry:scalarWinner,tolerance_nm:5,phase_margin_deg:6,wavelengths_nm:[470,532,650]}})).json;
assert.equal(robustQueue.ok,true);
assert.equal(robustQueue.result?.robust_job?.state,'MANIFOLD_REFINEMENT_PREPARED_NOT_SOLVED');
assert.equal(robustQueue.result?.robust_job?.authority,'PREPARED_NOT_SOLVED');
assert.equal(robustQueue.result?.robust_job?.canonical_mutation,false);
assert.equal(robustQueue.result?.robust_job?.bridge,'sovereign/omega_fullwave_manifold_r1533.py');

const validAnchor={pitch_nm:320,width_nm:100,length_nm:280,height_nm:550};
const valid=(await invoke({...baseCall,request_id:'valid-anchor',operation:'fullwave_admissibility',payload:{geometry:validAnchor}})).json;
assert.equal(valid.result?.admissibility?.r41?.valid,true);
assert.equal(valid.result?.admissibility?.status,'FULLWAVE_GEOMETRY_ADMISSIBLE');

const cycle=(await invoke({...baseCall,request_id:'cycle-authority',operation:'adaptive_cycle',payload:{seed_address:1698,wavelength_nm:532,radius:1,budget:80,rounds:2,beam_width:3,max_evaluations:96}})).json;
assert.equal(cycle.ok,true);
assert.equal(cycle.receipt?.tool_version,'R153.3');
assert.equal(cycle.receipt?.authority,'SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE');
assert.ok(cycle.result?.fullwave_admissibility);
if(!cycle.result.fullwave_admissibility.r41.valid){
 assert.equal(cycle.result?.fullwave_handoff?.prepared,false);
 assert.equal(cycle.result?.fullwave_handoff?.state,'BLOCKED_BY_FULLWAVE_GEOMETRY');
 assert.equal(cycle.result?.ai_context?.next_action,'project_and_refine_on_fullwave_admissible_manifold');
 assert.equal(cycle.decision_support?.next_action,'project_and_refine_on_fullwave_admissible_manifold');
}

const rank=(await invoke({...baseCall,request_id:'rank-regression',operation:'rank_addresses',payload:{offset:0,limit:24,wavelength_nm:532}})).json;
assert.equal(rank.ok,true);
assert.equal(rank.result?.count,24);
assert.equal(rank.receipt?.tool_version,'R153.3');
assert.equal(rank.tool_upgrade?.fullwave_admissibility_available,true);

console.log('R153.3 FULLWAVE MANIFOLD AUTHORITY PASS',JSON.stringify({scalar:{geometry:scalarWinner,diagonal_nm:direct.r41.diagonal_nm,limit_nm:direct.r41.limit_nm,ratio:direct.r41.diagonal_to_limit_ratio},projection_count:direct.projections.length,cycle_final:cycle.result?.cycle?.final,cycle_admissibility:cycle.result?.fullwave_admissibility?.r41,cycle_next:cycle.result?.ai_context?.next_action,receipt:cycle.receipt?.receipt_id}));
