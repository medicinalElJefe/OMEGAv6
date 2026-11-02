import assert from 'node:assert/strict';
import {R757_EVIDENCE_BOUNDARY,canon5KeyR757,v8SourceAtlasIdR757,pscMasterPingIdR757,mode188ValueR757,canonDecisionR757,boundedResearchLinkR757,computeTypedProvenanceWitnessR757,verifyTypedProvenanceWitnessR757} from '../src/proof/canonCrossDomainProvenanceR757.js';
const v8=new Set(),canon=new Set(),psc=new Set(),mode=new Set();
for(let i=0;i<20736;i++){
 const id=v8SourceAtlasIdR757(i),ping=pscMasterPingIdR757(i);
 assert(!v8.has(id));v8.add(id);
 assert(!psc.has(ping));psc.add(ping);
 const s=Math.floor(i/1728)+1,r=Math.floor(i/144)%12+1,m=Math.floor(i/12)%12+1,p=i%12+1;
 for(let d=1;d<=12;d++){const k=canon5KeyR757(d,i);assert(!canon.has(k));canon.add(k);mode.add(mode188ValueR757(d,s,r,m,p));}
}
assert.equal(v8.size,20736);assert.equal(psc.size,20736);assert.equal(canon.size,248832);assert.equal(mode.size,188);
assert.equal(v8SourceAtlasIdR757(0),'D00-P00-R00-L00');
assert.equal(v8SourceAtlasIdR757(20735),'D11-P11-R11-L11');
assert.equal(canon5KeyR757(1,0),'D01-S01-R01-M01-P01');
assert.equal(canon5KeyR757(12,20735),'D12-S12-R12-M12-P12');
assert.equal(pscMasterPingIdR757(0),'PSC-00001');
assert.equal(pscMasterPingIdR757(20735),'PSC-20736');
assert.equal(mode188ValueR757(1,1,1,1,1),40);
assert.equal(canonDecisionR757(.0833,.3889,.1176,.4167).decision,'ESCALATE');
assert.equal(canonDecisionR757(.1,.42,.1,.1).provenance,'REQUIRES_ORIGINAL_PRECISION');
const x=boundedResearchLinkR757({slot0:0,v8Id:'D00-P00-R00-L00',pscPingId:'PSC-00001',chartId:'C20376-00000',chartStatus:'PROVED_EMPTY_OF_FOURFOLD',sourceDigestVerified:true});
assert.equal(x.proofStatusAdmissible,false);
assert.equal(x.sourceAuthority,'HOLD_R295_ADMISSION_EVEN_IF_HASH_MATCHES');
assert.equal(x.pscSemanticIdentity,false);assert.equal(x.canon5PhysicalIdentity,false);assert.equal(x.globalSharpSingmaster,'OPEN');
assert.throws(()=>boundedResearchLinkR757({slot0:0,v8Id:'D00-P00-R00-L01',pscPingId:'PSC-00001',chartId:'C20376-00000',chartStatus:'OPEN_GLOBAL_FOURFOLD',sourceDigestVerified:true}));
assert.throws(()=>canon5KeyR757(0,0));
assert.throws(()=>mode188ValueR757(13,1,1,1,1));
assert.equal(R757_EVIDENCE_BOUNDARY.productionAuthority,false);
console.log('R757 exact 20736-address and 248832-five-axis bijection PASS; all cross-domain theorem promotions HELD');

const witness=computeTypedProvenanceWitnessR757({slot0:20735,domain1:12,metrics:{c:.1,phi:.42,q:.1,lambda:.1}});
assert.equal(witness.coordinates.v8Id,'D11-P11-R11-L11');
assert.equal(witness.coordinates.pscPingId,'PSC-20736');
assert.equal(witness.coordinates.canon5Key,'D12-S12-R12-M12-P12');
assert.equal(witness.modeledDecision.decision,'ESCALATE');
assert.equal(witness.inputs.metricAuthority,'USER_SUPPLIED_HYPOTHETICAL');
assert.equal(witness.evidence.semanticIdentityProved,false);
assert.deepEqual(verifyTypedProvenanceWitnessR757(JSON.stringify(witness)),witness);
assert.throws(()=>verifyTypedProvenanceWitnessR757(JSON.stringify({...witness,evidence:{...witness.evidence,productionAuthority:true}})),/mismatch/);
assert.throws(()=>verifyTypedProvenanceWitnessR757(JSON.stringify({...witness,coordinates:{...witness.coordinates,pscPingId:'PSC-00001'}})),/mismatch/);
assert.throws(()=>computeTypedProvenanceWitnessR757({slot0:20736,domain1:1,metrics:{c:1,phi:1,q:1,lambda:1}}),/outside/);
assert.throws(()=>computeTypedProvenanceWitnessR757({slot0:0,domain1:1,metrics:{c:0,phi:1,q:1,lambda:1}}),/positive/);
console.log('R757 executable typed provenance witness, recomputation and tamper refusal PASS');
