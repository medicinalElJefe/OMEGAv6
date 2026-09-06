import assert from 'node:assert/strict';
import {compileCausalGraphR126,decodeCellR126,encodeCellR126,encodeLaneR126,validateEvidenceR126,CAUSAL_R126_LAWS} from '../src/causal/causalInteractionRelativityR126.ts';

assert.equal(encodeCellR126(0,0,0),0);
assert.equal(encodeCellR126(11,11,11),1727);
assert.deepEqual(decodeCellR126(1727),{index:1727,domain:11,phase:11,regulation:11,id:'omega-cell-11-11-11'});
assert.equal(encodeLaneR126(11,11,11,11),20735);
assert.equal(new Set(Array.from({length:1728},(_,i)=>{const c=decodeCellR126(i);return encodeCellR126(c.domain,c.phase,c.regulation)})).size,1728);

const frame={space:'ECEF',time:'UTC',orientation:'RH'};
const good=(x)=>({observedAt:'2026-09-06T18:00:00Z',frame,verified:true,...x});
const nodes=[{id:'A',label:'input'},{id:'B',label:'output'}];

const missingUnit=good({id:'bad',kind:'MEASUREMENT',source:'sensor-a',sourceFamily:'sensor',claim:'measurement',quantity:{value:2,unit:''}});
assert.equal(validateEvidenceR126(missingUnit).ok,false);

const modelOnly=compileCausalGraphR126({nodes,edges:[{id:'e1',cause:'A',effect:'B',sign:1,evidenceIds:['m1'],confidence:0,independentFamilies:0,interventionEvidence:0,replicationEvidence:0,contradictionEvidence:0,uncertainty:0,status:'UNKNOWN'}],evidence:[good({id:'m1',kind:'MODEL',source:'model-a',sourceFamily:'model',claim:'model predicts A->B',supports:['e1']})]});
assert.equal(modelOnly.edges[0].status,'CORRELATED');
assert.equal(modelOnly.dispatch.canonicalMutation,false);

const causalEvidence=[
 good({id:'i1',kind:'INTERVENTION',source:'lab-a',sourceFamily:'lab-a',claim:'controlled intervention changes B',supports:['e2'],intervention:true,reproducible:true,quantity:{value:1.2,unit:'ratio',uncertainty:0.05}}),
 good({id:'r1',kind:'REPLICATION',source:'lab-b',sourceFamily:'lab-b',claim:'independent replication',supports:['e2'],reproducible:true,quantity:{value:1.18,unit:'ratio',uncertainty:0.06}}),
 good({id:'x1',kind:'MEASUREMENT',source:'sensor-c',sourceFamily:'sensor-c',claim:'observed response',supports:['e2'],reproducible:true,quantity:{value:1.19,unit:'ratio',uncertainty:0.04}}),
];
const supported=compileCausalGraphR126({nodes,edges:[{id:'e2',cause:'A',effect:'B',sign:1,evidenceIds:causalEvidence.map(x=>x.id),confidence:0,independentFamilies:0,interventionEvidence:0,replicationEvidence:0,contradictionEvidence:0,uncertainty:0,status:'UNKNOWN'}],evidence:causalEvidence,requestedCells:1728,priorScar:{e2:0.8}});
assert.equal(supported.edges[0].status,'SUPPORTED_CAUSAL');
assert.ok(supported.edges[0].confidence>=0.72);
assert.equal(supported.edges[0].independentFamilies,3);
assert.equal(supported.dispatch.scope,'BODY_FULL');
assert.equal(supported.dispatch.cells,1728);
assert.ok(supported.scar.e2<0.8,'supported causal evidence should reduce prior scar');
assert.equal(supported.authority.state,'CANDIDATE_ONLY');

const contradiction=[
 good({id:'s1',kind:'MEASUREMENT',source:'one',sourceFamily:'one',claim:'weak support',supports:['e3'],quantity:{value:1,unit:'ratio',uncertainty:0.1}}),
 good({id:'n1',kind:'NEGATIVE_RESULT',source:'two',sourceFamily:'two',claim:'negative result',contradicts:['e3'],reproducible:true}),
 good({id:'n2',kind:'REPLICATION',source:'three',sourceFamily:'three',claim:'failed replication',contradicts:['e3'],reproducible:true}),
];
const contradicted=compileCausalGraphR126({nodes,edges:[{id:'e3',cause:'A',effect:'B',sign:1,evidenceIds:contradiction.map(x=>x.id),confidence:0,independentFamilies:0,interventionEvidence:0,replicationEvidence:0,contradictionEvidence:0,uncertainty:0,status:'UNKNOWN'}],evidence:contradiction});
assert.equal(contradicted.edges[0].status,'CONTRADICTED');
assert.ok(contradicted.scar.e3>0);

const noEvidence=compileCausalGraphR126({nodes,edges:[{id:'e4',cause:'A',effect:'B',sign:0,evidenceIds:[],confidence:0,independentFamilies:0,interventionEvidence:0,replicationEvidence:0,contradictionEvidence:0,uncertainty:0,status:'UNKNOWN'}],evidence:[]});
assert.equal(noEvidence.edges[0].status,'INSUFFICIENT');
assert.equal(noEvidence.summary.supportedCausal,0);
assert.match(noEvidence.truthBoundary,/does not create missing measurements/);
assert.ok(CAUSAL_R126_LAWS.includes('CORRELATION_NEVER_PROMOTES_TO_CAUSATION_WITHOUT_INTERVENTION_OR_INDEPENDENT_CAUSAL_EVIDENCE'));

console.log('R126 causal interaction relativity: PASS');
