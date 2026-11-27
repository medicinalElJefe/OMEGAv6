import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const runtime=read('src/saiB059Runtime.ts');
const control=read('src/SAISovereignControl.tsx');
const fabric=read('src/IntelligenceFabricPanel.tsx');
const bridge=read('src/intelligenceBridgeR195.ts');
const bridgeUi=read('src/IntelligenceBridgeR195.tsx');
const handoff=read('src/saiHybridHandoffR1961.ts');
const handoffUi=read('src/SaiHybridHandoffPanelR1961.tsx');
const differential=read('src/execution/differentialPartitionExecutionR195.js');
const pkg=read('package.json');
const manifest=read('RESTORE_MANIFEST_ADDENDUM_SAI_B059_R1.md');
const authorities=[...runtime.matchAll(/name:'([^']+)',role:'([^']+)',sha256:'([0-9a-f]{64})'/g)];
assert.equal(authorities.length,15,'B059 must retain exactly 15 SHA-bound corpus authorities');
for(const token of ['747786240','82082','188','250000',"['STAY','TURN','ESCALATE']","['Sense','Normalize','Score','Gate','Act','Ledger']","OMEGA_SAI_B059_HOSTED_RETRIEVAL_PLAN_V1","OMEGA_SAI_B059_HOSTED_RECEIPT_V1","compiledDonorDatabaseLoaded:false","foundationModelLoaded:false"])assert.match(runtime,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`missing B059 contract ${token}`);
for(const role of ['proof','tests','operators','calculus','qr','lenses','carry','atlas_merge','tree_nodes'])assert.match(runtime,new RegExp(`'${role}'`),`missing evidence role ${role}`);
assert.match(runtime,/crypto\.subtle\.digest\('SHA-256'/,'browser scar ledger must use SHA-256');
assert.match(runtime,/previous_hash/,'ledger must retain previous hash');
assert.match(runtime,/entry_hash/,'ledger must retain entry hash');
assert.match(control,/QUERY.*CORPUS.*TRAVERSAL.*LEDGER.*SELFTEST.*FABRIC/s,'SAI lab tabs must remain complete');
assert.match(control,/188-step retained source path/,'188-step traversal must remain visible');
assert.match(control,/15 SHA-bound authorities/,'source authority boundary must remain visible');
assert.match(control,/DONOR \{x\.donor\}/,'donor self-test evidence must remain separate from hosted status');
assert.match(fabric,/SAISovereignControl/,'SAI/Kernel Intelligence surface must bind B059 sovereign control');
assert.match(fabric,/IntelligenceBridgeR195/,'R195.1 live intelligence bridge must be wired above the retained SAI lab');
assert.match(fabric,/SaiHybridHandoffPanelR1961/,'R196.1 governed SAI to Hybrid handoff must be wired without replacing the SAI lab');
assert.match(fabric,/R209 may bind that validated held draft to SHA-256 ancestry for explicit operator review/,'R209 lineage truth boundary must be visible in Intelligence Fabric');
assert.match(differential,/OMEGA_DIFFERENTIAL_PARTITION_EXECUTION_R195/,'R195 differential partition execution must retain its canonical revision identity');
for(const token of ['OMEGA_AUTHENTICATED_INTELLIGENCE_BRIDGE_R195_1',"R195_REVISION='R195.1'",'AUTHENTICATED_SAI_HYBRID_BRIDGE_AVAILABLE','DEVICE_PROOF_REQUIRED','R147_EXECUTOR_SELECTION','R141_EXACT_RETURN_PROOF','R146_DURABLE_EXECUTION_HISTORY','R125_SEPARATE_CANON_ADMISSION','canonicalMutation:false','canonicalAdmissionAuthority:\'R125\''])assert.match(bridge,new RegExp(token.replace(/[.]/g,'\\.')),`missing R195.1 bridge contract ${token}`);
assert.match(bridge,/nativeExecutionClaimed===true&&devices\.length>0/,'R195.1 must require current authenticated device evidence before online bridge state');
assert.match(bridge,/TRAIN_LOCAL_PIPELINE_AVAILABILITY_IS_NOT_TRAINED_MODEL_WEIGHT_PROOF/,'R195.1 must separate trainer availability from trained weights');
assert.match(bridge,/R194_REUSE_IS_NOT_FRESH_PROVIDER_MODEL_SOLVER_OR_DEVICE_EXECUTION/,'R195.1 must preserve R194 fresh-execution boundary');
for(const endpoint of ['/api/core-health','/api/hybrid/status','/api/hybrid/capabilities','/api/federation/run/status'])assert.ok(bridgeUi.includes(endpoint),`R195.1 UI missing independent live proof probe ${endpoint}`);
assert.match(bridgeUi,/Promise\.allSettled/,'R195.1 proof probes must fail independently rather than blanking sibling truth');
assert.match(bridgeUi,/current-session read-only proof refresh; never queues work/,'R195.1 live refresh must remain read-only');
assert.match(bridgeUi,/R195 remains the differential partition-execution layer/,'R195.1 UI must disclose the concurrent R195 execution lineage');
for(const token of ['OMEGA_SAI_HYBRID_GOVERNED_HANDOFF_R196_1',"SAI_HYBRID_HANDOFF_REVISION='R196.1'",'DRAFT_ONLY_NOT_QUEUED','confirmationRequired:true','deviceBindingRequiredForExecution:true','mayQueue:false','mayConfirm:false','mayExecute:false','canonicalMutation:false',"canonicalAdmissionAuthority:'R125'",'OPERATOR_REVIEW_CONFIRMATION','R147_EXECUTOR_SELECTION','R141_EXACT_RETURN_PROOF'])assert.ok(handoff.includes(token),`R196.1 handoff missing ${token}`);
assert.match(handoff,/draft\?\.confirmed!==false/,'R196.1 must fail validation if a Hybrid draft is pre-confirmed');
assert.match(handoff,/draft\?\.deviceId!==null/,'R196.1 must fail validation if a held draft is pre-bound to a device');
assert.ok(handoffUi.includes("api.post<any>('/api/hybrid/plan'"),'R196.1 must use the existing governed Hybrid planning contract');
assert.ok(handoffUi.includes("api.post<any>('/api/hybrid/validate'"),'R196.1 must use the existing Hybrid validation contract');
assert.doesNotMatch(handoffUi,/\/api\/hybrid\/(?:queue|confirm|execute|claim|dispatch)/,'R196.1/R209 SAI panel must have no queue/confirm/execute/claim/dispatch endpoint');
assert.match(handoffUi,/queueMutation:false,executionClaimed:false/,'R196.1 ledger receipt must preserve held/non-executed truth');
assert.match(handoffUi,/After R209 lineage binding, the Hybrid Link R209 review surface must still explicitly import the held draft/,'R209 must route continuation through explicit Hybrid operator review');
assert.match(handoffUi,/R209_LINEAGE_HELD_FOR_OPERATOR_IMPORT/,'R209 lineage receipt must be appended after exact validation');
assert.doesNotMatch(bridge,/canonicalMutation:true|canonicalAdmissionAuthority:'R195(?:\.1)?'/,'R195.1 must never claim Canon mutation/admission authority');
assert.doesNotMatch(handoff,/canonicalMutation:true|canonicalAdmissionAuthority:'R196(?:\.1)?'/,'R196.1 must never claim Canon mutation/admission authority');
assert.doesNotMatch(runtime,/superintelligence.*true|foundationModelLoaded:true/i,'must not claim hidden superintelligence/model weights');
assert.doesNotMatch(pkg,/@appdeploy\/client|appdeploy\.ai/i,'SAI restoration must remain portable');
assert.match(manifest,/OMEGA_SAI_B059_PART_01_CORE_COMPILED\.zip/,'manifest must identify exact donor archive');
await import('./r209-end-to-end-mission-lineage-invariants.mjs');
console.log('SAI_B059_R209_INVARIANTS PASS · R195 differential + R195.1 live bridge + R196.1 held SAI→Hybrid handoff + R209 SHA-bound operator-review lineage · authority boundaries locked');

// R992 real parameter training, not merely a prepared training batch.
const {initializeR992,exampleR992,datasetR992,lossGradientR992,trainR992,predictR992,verifyTrainingR992}=await import('../src/saiRelationalLearningR992.mjs');
const ds992=datasetR992(37);
assert.equal(new Set([...ds992.train,...ds992.validation,...ds992.test].map(x=>x.address)).size,768);
const w992=initializeR992(37),sample992=[exampleR992(0),exampleR992(20735)],g992=lossGradientR992(w992,sample992);
for(let i=0;i<w992.length;i++){const plus=w992.slice(),minus=w992.slice(),eps=1e-6;plus[i]+=eps;minus[i]-=eps;const numeric=(lossGradientR992(plus,sample992).loss-lossGradientR992(minus,sample992).loss)/(2*eps);assert.ok(Math.abs(numeric-g992.gradient[i])<1e-7,'gradient '+i)}
const trained992=trainR992({seed:37,epochs:80});
assert.ok(trained992.final.test<trained992.initial.test);
assert.ok(trained992.final.validation<trained992.initial.validation);
assert.notDeepEqual(trained992.weights,w992);
assert.deepEqual(trainR992({seed:37,epochs:80}),trained992);
assert.deepEqual(verifyTrainingR992(JSON.parse(JSON.stringify(trained992))),trained992.final);
const changed992=JSON.parse(JSON.stringify(trained992));changed992.weights[0]+=.1;assert.throws(()=>verifyTrainingR992(changed992),/evaluation mismatch/);
assert.throws(()=>trainR992({epochs:201}),RangeError);
assert.ok(Number.isFinite(predictR992(trained992.weights,20735)));
assert.ok(fabric.includes('<SaiRelationalLearningR992 address={address}/>'));
console.log('R992 actual CPU relational gradient training PASS: '+JSON.stringify({before:trained992.initial,after:trained992.final,parameters:trained992.parameterCount}));

 // R993 continuation is equivalent to the original uninterrupted optimizer.
const {startTrainingR993,advanceTrainingR993,verifySessionR993,completeTrainingR993,chartPredictionsR993}=await import('../src/saiRelationalLearningR992.mjs');
const initial993=startTrainingR993({targetEpochs:80}),partial993=advanceTrainingR993(initial993,31);
assert.equal(initial993.epoch,0);assert.equal(partial993.epoch,31);assert.ok(Object.isFrozen(partial993.currentWeights));
assert.equal(partial993.status,'PAUSED');assert.throws(()=>completeTrainingR993(partial993),/requires completed/);
const restored993=verifySessionR993(JSON.parse(JSON.stringify(partial993)));
assert.deepEqual(restored993,partial993);
const finished993=advanceTrainingR993(restored993,49);
assert.equal(finished993.status,'COMPLETE');
assert.deepEqual(completeTrainingR993(finished993),trained992);
assert.deepEqual(advanceTrainingR993(initial993,80),finished993);
const corrupted993=JSON.parse(JSON.stringify(partial993));corrupted993.currentWeights[0]+=.01;
assert.throws(()=>verifySessionR993(corrupted993),/replay mismatch/);
assert.throws(()=>advanceTrainingR993(finished993,1),RangeError);
let count993=0;
for(let start=0;start<20736;start+=144){const rows=chartPredictionsR993(trained992.weights,start,144);for(const row of rows){assert.equal(row.address,count993++);assert.equal(row.prediction,predictR992(trained992.weights,row.address));assert.equal(row.residual,row.prediction-row.target)}}
assert.equal(count993,20736);
assert.throws(()=>chartPredictionsR993(trained992.weights,20735,2),RangeError);
const learningUi993=read('src/SaiRelationalLearningR992.tsx');
for(const token of ['Pause training','Resume training','verifySessionR993(packet.payload)','advanceTrainingR993(current,4)','Export 20,736 prediction field'])assert.ok(learningUi993.includes(token),'missing R993 UI '+token);
console.log('R993 PASS: exact 31+49 epoch continuation equals uninterrupted R992; tamper rejection and exhaustive addressed prediction export parity.');

// R994 real complete-field evaluation and independent forward implementation.
const {evaluateFieldR994,verifyFieldAuditR994}=await import('../src/saiRelationalLearningR992.mjs');
const audit994=evaluateFieldR994(finished993);
assert.equal(audit994.coverage,20736);
assert.equal(audit994.maximumReferenceDifference,0);
assert.deepEqual(Object.values(audit994.split).map(row=>row.count),[512,128,128,19968]);
assert.equal(audit994.domains.length,12);assert.ok(audit994.domains.every(row=>row.count===1728));
assert.equal(audit994.nodeRegions.length,144);assert.ok(audit994.nodeRegions.every(row=>row.count===144));
assert.ok(Math.abs(audit994.split.TEST.mse-trained992.final.test)<1e-12);
assert.ok(Math.abs(audit994.full.mse-Object.values(audit994.split).reduce((sum,row)=>sum+row.mse*row.count,0)/20736)<1e-12);
assert.deepEqual(verifyFieldAuditR994(JSON.parse(JSON.stringify(finished993)),JSON.parse(JSON.stringify(audit994))),audit994);
const changed994=JSON.parse(JSON.stringify(audit994));changed994.split.UNUSED.count--;
assert.throws(()=>verifyFieldAuditR994(finished993,changed994),/return mismatch/);
assert.throws(()=>evaluateFieldR994(partial993),/requires completed/);
assert.ok(learningUi993.includes('Verify full prediction field')&&learningUi993.includes('Export verified field audit'));
console.log('R994 PASS: '+JSON.stringify({coverage:audit994.coverage,split:audit994.split,reference:audit994.maximumReferenceDifference}));

// R995 explicit synthetic fixture exercising the real local-data path.
const {R995_HEADER,parseDatasetR995,splitDatasetR995,startUserTrainingR995,advanceUserTrainingR995,verifyUserTrainingR995,evaluateUserTrainingR995}=await import('../src/saiRelationalLearningR992.mjs');
const csv995=[R995_HEADER,...Array.from({length:120},(_,i)=>{const x=exampleR992(i*137);return [x.address,...x.features,x.target].join(',')})].join('\n');
const data995=parseDatasetR995(csv995,'SYNTHETIC_TEST_FIXTURE_R995');
const split995=splitDatasetR995(data995,37);
assert.deepEqual(Object.values(split995).map(rows=>rows.length),[72,24,24]);
assert.equal(new Set(Object.values(split995).flat().map(row=>row.address)).size,120);
assert.throws(()=>startUserTrainingR995(data995),/authorization/);
const begin995=startUserTrainingR995(data995,{authorized:true}),partial995=advanceUserTrainingR995(begin995,31);
assert.throws(()=>evaluateUserTrainingR995(partial995),/Complete/);
const end995=advanceUserTrainingR995(verifyUserTrainingR995(JSON.parse(JSON.stringify(partial995))),49);
assert.deepEqual(end995,advanceUserTrainingR995(begin995,80));
const eval995=evaluateUserTrainingR995(end995);assert.equal(eval995.predictions.length,120);assert.ok(eval995.partitions.test.mse<eval995.partitions.test.initialMse);
const corrupt995=JSON.parse(JSON.stringify(partial995));corrupt995.currentWeights[0]+=.01;assert.throws(()=>verifyUserTrainingR995(corrupt995),/replay mismatch/);
assert.throws(()=>parseDatasetR995(csv995+'\n'+csv995.split('\n')[1],'fixture'),/duplicate/);
assert.ok(learningUi993.includes('<SaiUserTrainingR995/>'));
console.log('R995 PASS: local supervision, address-disjoint partitions, exact replay and refusals.');

 // R998 complete 144-region training bank; synthetic fixture exercises the
 // identical projected-source feature adapter without claiming raw donors.
const {projectedRegionR998,trainProjectedRegionR998,summarizeBankR998,predictRegionalR998,verifyRegionalModelR998}=await import('../src/saiRelationalLearningR992.mjs');
const read998=address=>{const x=exampleR992(address),f=x.features;return {address,stateId:address+1,metrics:{continuity:f[0],plasticity:f[1],contradiction:f[2],burden:f[3],evidence:f[4],geometry:f[5],rsc:f[6],scar:x.target},math:{normalizedMotionRelativity:f[7]}}};
const models998=[];
for(let region=0;region<144;region++){const dataset=projectedRegionR998(read998,region),model=trainProjectedRegionR998(dataset,region);models998.push(model);for(const row of model.predictions){const inference=predictRegionalR998(dataset,model,row.address);assert.equal(inference.prediction,row.prediction);assert.equal(inference.residual,row.residual)}}
const summary998=summarizeBankR998(models998);assert.equal(summary998.addresses,20736);assert.equal(summary998.parameterCount,17424);assert.equal(summary998.complete,true);
assert.deepEqual(Object.values(summary998.partitions).map(x=>x.count),[12384,4032,4320]);
assert.deepEqual(verifyRegionalModelR998(projectedRegionR998(read998,143),JSON.parse(JSON.stringify(models998[143]))),models998[143]);
assert.throws(()=>summarizeBankR998([models998[0],models998[0]]),/Duplicate/);
assert.throws(()=>predictRegionalR998(projectedRegionR998(read998,0),models998[0],144),/region/);
assert.ok(fabric.includes('<SaiRegionalBankR998 address={address}/>'));
console.log('R998 PASS: 144 models, exhaustive 20736 addressed fixture inference and 17424 parameters.');

const {correlateFieldR999}=await import('../src/saiRelationalLearningR992.mjs');
const field999=models998.flatMap(m=>m.predictions.map(p=>p.prediction));
const result999=correlateFieldR999(field999,{steps:4});
assert.equal(result999.values.length,20736);
assert.equal(result999.edges,82944);
assert.ok(Math.abs(result999.residual)<1e-8);
assert.deepEqual(correlateFieldR999(field999,{steps:4}),result999);
const impulse999=Array(20736).fill(0);impulse999[0]=1;
const spread999=correlateFieldR999(impulse999).values;
assert.equal(spread999[0],0);
for(const i of [1,11,12,132,144,1584,1728,19008])assert.equal(spread999[i],.125);
assert.equal(spread999.reduce((a,b)=>a+b,0),1);
assert.deepEqual(correlateFieldR999(Array(20736).fill(2)).values,Array(20736).fill(2));
assert.throws(()=>correlateFieldR999(field999,{weight:.126}),/Invalid/);
assert.throws(()=>correlateFieldR999(field999,{steps:33}),/Invalid/);
assert.throws(()=>correlateFieldR999([NaN]),/Invalid/);
console.log('R999 PASS: periodic four-axis conservative prediction exchange and deterministic replay.');

const {fieldReceiptR1000,verifyFieldReceiptR1000}=await import('../src/saiRelationalLearningR992.mjs');
const binds1000=Array.from({length:144},(_,region)=>({region,sourceSha256:'a'.repeat(64),modelSha256:region.toString(16).padStart(64,'0')}));
const receipt1000=fieldReceiptR1000(field999,binds1000,{steps:4});
assert.deepEqual(receipt1000.result,result999);
assert.deepEqual(verifyFieldReceiptR1000(JSON.parse(JSON.stringify(receipt1000)),field999,binds1000),receipt1000);
const tamper1000=JSON.parse(JSON.stringify(receipt1000));tamper1000.result.values[0]+=.01;
assert.throws(()=>verifyFieldReceiptR1000(tamper1000,field999,binds1000),/replay mismatch/);
const changed1000=binds1000.map((b,i)=>i===0?{...b,modelSha256:'f'.repeat(64)}:b);
assert.throws(()=>verifyFieldReceiptR1000(receipt1000,field999,changed1000),/replay mismatch/);
assert.throws(()=>fieldReceiptR1000(field999,binds1000.slice(1)),/bindings/);
assert.throws(()=>fieldReceiptR1000(Array(20736),binds1000),/dense/);
console.log('R1000 PASS: full field receipt roundtrip, source/model binding and tamper rejection.');

const {auditCorrelationR1001}=await import('../src/saiRelationalLearningR992.mjs');
const audit1001=auditCorrelationR1001(receipt1000,read998);
assert.equal(audit1001.full.before.count,20736);
assert.deepEqual(Object.values(audit1001.partitions).map(p=>p.before.count),[12384,4032,4320]);
assert.equal(audit1001.regions.length,144);
assert.ok(audit1001.regions.every(r=>r.before.count===144&&r.after.count===144));
for(const kind of ['train','validation','test'])assert.ok(Math.abs(audit1001.partitions[kind].before.mse-summary998.partitions[kind].mse)<1e-12);
const identity1001=auditCorrelationR1001(fieldReceiptR1000(field999,binds1000,{weight:0}),read998);
assert.deepEqual(identity1001.full.before,identity1001.full.after);
assert.throws(()=>auditCorrelationR1001(tamper1000,read998),/replay mismatch/);
console.log('R1001 PASS: full and partitioned correlation evaluation, identity and tamper refusal.');

const {selectCorrelationR1002,verifySelectionR1002}=await import('../src/saiRelationalLearningR992.mjs');
const selected1002=selectCorrelationR1002(field999,binds1000,read998);
assert.equal(selected1002.candidates.length,13);
assert.equal(selected1002.selectionCount,4032);
assert.equal(selected1002.selected.mse,Math.min(...selected1002.candidates.map(c=>c.mse)));
assert.ok(selected1002.selected.mse<=selected1002.candidates[0].mse);
assert.equal(selected1002.audit.partitions.test.before.count,4320);
assert.ok(Math.abs(selected1002.selected.mse-selected1002.audit.partitions.validation.after.mse)<1e-12);
const testAddresses1002=new Set(Array.from({length:144},(_,r)=>splitDatasetR995(projectedRegionR998(read998,r),37).test.map(x=>x.address)).flat());
const alteredRead1002=a=>{const row=read998(a);return testAddresses1002.has(a)?{...row,metrics:{...row.metrics,scar:1-row.metrics.scar}}:row};
const altered1002=selectCorrelationR1002(field999,binds1000,alteredRead1002);
assert.deepEqual(altered1002.selected,selected1002.selected);
assert.deepEqual(altered1002.candidates,selected1002.candidates);
assert.deepEqual(verifySelectionR1002(JSON.parse(JSON.stringify(selected1002)),field999,binds1000,read998),selected1002);
const forged1002=JSON.parse(JSON.stringify(selected1002));forged1002.selected.mse+=1;
assert.throws(()=>verifySelectionR1002(forged1002,field999,binds1000,read998),/replay mismatch/);
console.log('R1002 PASS: validation-only bounded selection, held-out isolation and replay.');

const {verifySaiSphereR1003,saiSpherePixelR1003}=await import('../src/saiSphereBridgeR1003.mjs');
const digest1003=async value=>{const {createHash}=await import('node:crypto');return createHash('sha256').update(JSON.stringify(value)).digest('hex')};
const rows1003=[],bindings1003=[];
for(const model of models998){
 const sourceSha256=await digest1003(projectedRegionR998(read998,model.region));
 const compact={region:model.region,weights:model.weights,bestEpoch:model.bestEpoch,partitions:model.partitions,sourceSha256};
 rows1003.push(compact);bindings1003.push({region:model.region,sourceSha256,modelSha256:await digest1003(compact)});
}
const transfer1003={schema:'OMEGA_SAI_SPHERE_READONLY_R1003',models:rows1003,field:fieldReceiptR1000(field999,bindings1003,{steps:4}),canonicalMutation:false};
assert.deepEqual(await verifySaiSphereR1003(JSON.parse(JSON.stringify(transfer1003)),read998,{digest:digest1003}),transfer1003.field);
assert.equal(saiSpherePixelR1003(transfer1003.field,20735).value,transfer1003.field.result.values[20735]);
assert.throws(()=>saiSpherePixelR1003(transfer1003.field,20736),/address/);
await assert.rejects(()=>verifySaiSphereR1003({...transfer1003,canonicalMutation:true},read998,{digest:digest1003}),/read-only/);
await assert.rejects(()=>verifySaiSphereR1003({...transfer1003,models:rows1003.map((m,i)=>i===0?{...m,sourceSha256:'f'.repeat(64)}:m)},read998,{digest:digest1003}),/digest mismatch/);
console.log('R1003 PASS: independently replayed SAI to SPHERE read-only field projection.');
