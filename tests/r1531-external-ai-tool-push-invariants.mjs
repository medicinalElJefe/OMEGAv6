import assert from 'node:assert/strict';
import worker from '../services/opticalMachineR1531.js';
import {R1531_TOOL_NAME,R1531_TOOL_VERSION,R1531_TOOL_SCHEMA,R1531_RECEIPT_SCHEMA} from '../services/opticalExternalToolR1531.js';

const call=async(path,options={})=>{
 const response=await worker.fetch(new Request('https://unit.test'+path,options));
 const text=await response.text();
 let body=null;try{body=JSON.parse(text)}catch{}
 return{response,text,body};
};
const proposal=(width=105,length=290,height=575,target=150)=>({
 schema:'OMEGA_PACKET_v1',packet_id:`ext_${width}_${length}_${height}_${target}`,source_node:'omega-external-tool',source_sha:'external-unit',wavelength_nm:532,target_phase_deg:target,
 geometry:{pitch_nm:330,width_nm:width,length_nm:length,height_nm:height,orientation_deg:75,material:'TIO2_DESIGN_NOMINAL_ON_SIO2_FUSED'},polarization:'circular',lineage:['r153.1-unit']
});
const invoke=payload=>call('/api/tool/invoke',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
const base={schema:R1531_TOOL_SCHEMA,caller:{id:'chatgpt-test',kind:'ai-agent'},request_id:'unit-1',goal:'Use deterministic optical computation as external decision support.'};

const health=await call('/api/health');
assert.equal(health.response.status,200);assert.equal(health.body.ok,true);assert.equal(health.body.externalTool.name,R1531_TOOL_NAME);assert.equal(health.body.externalTool.version,R1531_TOOL_VERSION);assert.equal(health.body.externalTool.canonicalMutation,false);
assert.equal(health.response.headers.get('x-omega-tool-version'),R1531_TOOL_VERSION);

const descriptor=await call('/api/tool/descriptor');
assert.equal(descriptor.response.status,200);assert.equal(descriptor.body.name,R1531_TOOL_NAME);assert.equal(descriptor.body.authority,'SCREEN_ONLY');assert.equal(descriptor.body.side_effects,'none');assert.equal(descriptor.body.canonical_mutation,false);
assert.deepEqual(Object.keys(descriptor.body.operations),['inspect_address','rank_addresses','screen_candidate','compare_candidates']);
assert.match(descriptor.body.interpretation,/does not modify the AI model/i);

const probe=await call('/api/tool/probe');
assert.equal(probe.body.ready.inspect_address,true);assert.equal(probe.body.ready.rank_addresses,true);assert.equal(probe.body.ready.screen_candidate,true);assert.equal(probe.body.ready.compare_candidates,true);assert.equal(probe.body.ready.fullwave_execution,false);assert.equal(probe.body.ready.canonical_admission,false);

const openapi=await call('/openapi.json');
assert.equal(openapi.body.openapi,'3.1.0');assert.ok(openapi.body.paths['/api/tool/invoke']);assert.equal(openapi.body['x-omega-authority'],'SCREEN_ONLY');assert.equal(openapi.body['x-omega-canonical-mutation'],false);

const inspected=await invoke({...base,operation:'inspect_address',payload:{address:20735,wavelength_nm:650}});
assert.equal(inspected.response.status,200);assert.equal(inspected.body.receipt.schema,R1531_RECEIPT_SCHEMA);assert.equal(inspected.body.receipt.operation,'inspect_address');assert.equal(inspected.body.receipt.side_effects,'none');assert.equal(inspected.body.result.item.address,20735);assert.equal(inspected.body.result.item.wavelength_nm,650);assert.equal(inspected.body.decision_support.evidence_class,'REDUCED_ORDER_SCREEN');

const ranked=await invoke({...base,request_id:'unit-rank',operation:'rank_addresses',payload:{offset:0,limit:1728,wavelength_nm:532}});
assert.equal(ranked.response.status,200);assert.equal(ranked.body.result.count,1728);assert.equal(ranked.body.result.top.length,12);
for(let i=1;i<ranked.body.result.items.length;i++)assert.ok(ranked.body.result.items[i-1].scalar_focus>=ranked.body.result.items[i].scalar_focus);
assert.ok(ranked.body.receipt.request_sha256.length===64);assert.match(ranked.body.decision_support.next_action,/screen_top_geometry|expand_or_shift/);

const rankedClamped=await invoke({...base,request_id:'unit-clamp',operation:'rank_addresses',payload:{offset:20730,limit:99999,wavelength_nm:900}});
assert.equal(rankedClamped.body.result.count,6);assert.equal(rankedClamped.body.result.wavelength_nm,780);

const screened=await invoke({...base,request_id:'unit-screen',operation:'screen_candidate',payload:{proposal:proposal()}});
assert.equal(screened.response.status,200);assert.equal(screened.body.result.screen.authority,'SCREEN_ONLY');assert.equal(screened.body.result.screen.canonical_mutation,false);assert.equal(screened.body.result.screen.packet.source_node,'omega-optical');
if(screened.body.result.screen.tier2_job)assert.equal(screened.body.result.screen.tier2_job.state,'PREPARED_NOT_SOLVED');
assert.ok(screened.body.decision_support.residuals.includes('full_wave_result_not_implied'));

const compared=await invoke({...base,request_id:'unit-compare',operation:'compare_candidates',payload:{proposals:[proposal(105,290,575,150),proposal(95,275,540,120),proposal(120,300,620,180)]}});
assert.equal(compared.response.status,200);assert.equal(compared.body.result.count,3);assert.equal(compared.body.result.top.length,3);assert.ok(compared.body.result.items[0].score>=compared.body.result.items[1].score);
for(const item of compared.body.result.items)if(item.tier2_job)assert.equal(item.tier2_job.state,'PREPARED_NOT_SOLVED');

const badSchema=await invoke({schema:'WRONG',caller:{id:'x'},operation:'inspect_address',payload:{address:0}});assert.equal(badSchema.response.status,400);assert.equal(badSchema.body.code,'OMEGA_EXTERNAL_TOOL_SCHEMA_REQUIRED');
const badCaller=await invoke({schema:R1531_TOOL_SCHEMA,caller:{},operation:'inspect_address',payload:{address:0}});assert.equal(badCaller.response.status,400);assert.equal(badCaller.body.code,'CALLER_ID_REQUIRED');
const badOperation=await invoke({...base,operation:'execute_arbitrary_code',payload:{}});assert.equal(badOperation.response.status,400);assert.equal(badOperation.body.code,'UNSUPPORTED_TOOL_OPERATION');
const badCompare=await invoke({...base,operation:'compare_candidates',payload:{proposals:[]}});assert.equal(badCompare.response.status,400);assert.equal(badCompare.body.code,'PROPOSALS_REQUIRED');

const cors=await call('/api/tool/descriptor',{method:'OPTIONS'});assert.equal(cors.response.status,204);assert.equal(cors.response.headers.get('access-control-allow-origin'),'*');
const inheritedUi=await call('/');assert.equal(inheritedUi.response.status,200);assert.match(inheritedUi.text,/VOLUMETRIC ADDRESS FIELD/);assert.match(inheritedUi.text,/PREPARED_NOT_SOLVED/);
const inheritedAtlas=await call('/api/optical/atlas?offset=0&limit=12&wavelength_nm=532');assert.equal(inheritedAtlas.body.items.length,12);assert.equal(inheritedAtlas.body.total,20736);
const inherited404=await call('/definitely-not-a-route');assert.equal(inherited404.response.status,404);

console.log('R153.1 EXTERNAL AI TOOL PUSH PASS · descriptor + OpenAPI + health + probe + inspect + 1,728 rank + screen + compare + hashed receipts + truth boundaries + inherited optical routes');
