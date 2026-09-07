import assert from 'node:assert/strict';
import machine,{R1532_MACHINE_SERVICE,R1532_MACHINE_VERSION,R1532_BASE_SCREENING_SERVICE,R1532_BASE_SCREENING_VERSION} from '../services/opticalMachineR1532.js';

const call=async(path,{method='GET',body=null}={})=>{
 const response=await machine.fetch(new Request('https://r1532.test'+path,{method,headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined}));
 const text=await response.text();
 let json=null;try{json=JSON.parse(text)}catch{}
 return{response,text,json};
};

assert.equal(R1532_MACHINE_SERVICE,'omega-optical-machine-r1532');
assert.equal(R1532_MACHINE_VERSION,'R153.2');
assert.equal(R1532_BASE_SCREENING_SERVICE,'omega-optical-machine-r152');
assert.equal(R1532_BASE_SCREENING_VERSION,'R152.0');

const health=await call('/api/health');
assert.equal(health.response.status,200);
assert.equal(health.json.ok,true);
assert.equal(health.json.service,'omega-optical-machine-r1532');
assert.equal(health.json.version,'R153.2');
assert.equal(health.json.authority,'SCREEN_ONLY');
assert.equal(health.json.machineVersion,'R153.2');
assert.equal(health.json.baseScreening?.service,'omega-optical-machine-r152');
assert.equal(health.json.baseScreening?.version,'R152.0');
assert.equal(health.json.externalTool?.version,'R153.2');
assert.equal(health.json.externalTool?.adaptiveCycle,true);
assert.equal(health.json.externalTool?.canonicalMutation,false);
assert.equal(health.response.headers.get('x-omega-machine-service'),'omega-optical-machine-r1532');
assert.equal(health.response.headers.get('x-omega-machine-version'),'R153.2');

const descriptor=(await call('/api/tool/descriptor')).json;
assert.equal(descriptor.version,'R153.2');
assert.equal(descriptor.authority,'SCREEN_ONLY');
assert.equal(descriptor.side_effects,'none');
assert.equal(descriptor.canonical_mutation,false);
assert.ok(descriptor.operations?.adaptive_refine);
assert.ok(descriptor.operations?.adaptive_cycle);
assert.ok(descriptor.call_schema?.properties?.operation?.enum?.includes('adaptive_refine'));
assert.ok(descriptor.call_schema?.properties?.operation?.enum?.includes('adaptive_cycle'));

const probe=(await call('/api/tool/probe')).json;
assert.equal(probe.ready?.adaptive_refine,true);
assert.equal(probe.ready?.adaptive_cycle,true);
assert.equal(probe.ready?.fullwave_execution,false);
assert.equal(probe.ready?.canonical_admission,false);
assert.equal(probe.live_evidence_basis?.r1531_rank_top?.address,1698);

const openapi=(await call('/openapi.json')).json;
assert.equal(openapi.openapi,'3.1.0');
assert.ok(openapi.paths?.['/api/tool/insight']);
assert.ok(openapi.paths?.['/api/tool/cycle']);
assert.ok(openapi.paths?.['/api/tool/invoke']?.post?.requestBody?.content?.['application/json']?.schema?.properties?.operation?.enum?.includes('adaptive_cycle'));

const insight=(await call('/api/tool/insight?seed_address=1698&wavelength_nm=532&radius=1&budget=128')).json;
assert.equal(insight.ok,true);
assert.equal(insight.receipt?.tool_version,'R153.2');
assert.equal(insight.receipt?.operation,'adaptive_refine');
assert.equal(insight.receipt?.side_effects,'none');
assert.equal(insight.receipt?.canonical_mutation,false);
assert.equal(insight.result?.seed?.address,1698);
assert.ok(insight.result?.boundary_pressure?.some(x=>x.axis==='d'&&x.side==='low'));
assert.ok(insight.result?.boundary_pressure?.some(x=>x.axis==='p'&&x.side==='high'));
assert.equal(insight.result?.ai_context?.schema,'OMEGA_AI_REASONING_PACKET_v1');
assert.equal(insight.decision_support?.evidence_class,'REDUCED_ORDER_SCREEN');
assert.equal(insight.decision_support?.confidence_class,'SCREENING_ONLY');
for(const item of insight.result?.expanded_geometry_probes||[]){
 if(!item.ok)continue;
 const g=item.proposal.geometry;
 assert.ok(g.width_nm<=g.pitch_nm,'expanded width must remain within pitch');
 assert.ok(g.length_nm<=g.pitch_nm,'expanded length must remain within pitch');
}
if(insight.result?.fullwave_handoff?.prepared)assert.equal(insight.result.fullwave_handoff.job?.state,'PREPARED_NOT_SOLVED');

const cycle=(await call('/api/tool/cycle?seed_address=1698&wavelength_nm=532&radius=1&budget=128&rounds=4&beam_width=4&max_evaluations=192')).json;
assert.equal(cycle.ok,true);
assert.equal(cycle.receipt?.operation,'adaptive_cycle');
assert.equal(cycle.receipt?.tool_version,'R153.2');
assert.equal(cycle.result?.cycle?.schema,'OMEGA_ADAPTIVE_CYCLE_R1532');
assert.ok(cycle.result.cycle.rounds_completed<=4);
assert.ok(cycle.result.cycle.evaluations<=192);
assert.ok(cycle.result.cycle.trace.length>=1);
assert.ok(cycle.result.cycle.final.utility>=cycle.result.cycle.trace[0].utility-1e-9,'closed loop must not regress best utility');
const finalGeometry=cycle.result.cycle.final.geometry;
assert.ok(finalGeometry.width_nm<=finalGeometry.pitch_nm);
assert.ok(finalGeometry.length_nm<=finalGeometry.pitch_nm);
assert.equal(cycle.result.ai_context?.schema,'OMEGA_AI_REASONING_PACKET_v1');
if(cycle.result?.fullwave_handoff?.prepared)assert.equal(cycle.result.fullwave_handoff.job?.state,'PREPARED_NOT_SOLVED');

const rank=(await call('/api/tool/invoke',{method:'POST',body:{schema:'OMEGA_EXTERNAL_TOOL_CALL_v1',caller:{id:'r1532-regression',kind:'test'},request_id:'rank-regression',operation:'rank_addresses',payload:{offset:0,limit:24,wavelength_nm:532}}})).json;
assert.equal(rank.ok,true);
assert.equal(rank.result?.count,24);
assert.equal(rank.receipt?.tool_version,'R153.2');
assert.equal(rank.receipt?.base_tool_version,'R153.1');
assert.equal(rank.tool_upgrade?.adaptive_cycle_available,true);

console.log('R153.2 ADAPTIVE EXTERNAL SEARCH PASS',JSON.stringify({service:health.json.service,version:health.json.version,base:health.json.baseScreening,seed:1698,pressure:insight.result.boundary_pressure.map(x=>`${x.axis}:${x.side}`),best:cycle.result.cycle.final,rounds:cycle.result.cycle.rounds_completed,evaluations:cycle.result.cycle.evaluations,next:cycle.result.ai_context.next_action,receipt:cycle.receipt.receipt_id}));
