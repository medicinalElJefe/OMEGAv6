import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {reconstructCanonFullRowR772,canonFullSourceSemanticVectorR772,
 R772_FULL_SOURCE_HEADERS,R772_ORIGINAL_SOURCE_PROOF} from '../src/proof/canonFullSourceR772.js';

assert.equal(R772_FULL_SOURCE_HEADERS.length,24);
assert.equal(R772_ORIGINAL_SOURCE_PROOF.rows,248832);
assert.equal(R772_ORIGINAL_SOURCE_PROOF.originalWorkbookBytesBundled,false);
assert.equal(R772_ORIGINAL_SOURCE_PROOF.historicalOriginalGeneratorAuthenticated,false);
assert.equal(R772_ORIGINAL_SOURCE_PROOF.empiricalPhysicalInterpretationProved,false);
assert.equal(R772_ORIGINAL_SOURCE_PROOF.canonicalMutation,false);
assert.equal(R772_ORIGINAL_SOURCE_PROOF.deviceActionAuthority,false);
const digestNumeric=createHash('sha256'),digestSemantic=createHash('sha256');
const counts={STAY:0,TURN:0,ESCALATE:0};
for(let index=1;index<=248832;index++){
 const row=reconstructCanonFullRowR772(index);
 assert.equal(row.Atlas_Index,index);
 assert.equal(Object.keys(row).join(','),R772_FULL_SOURCE_HEADERS.join(','));
 const numeric=[row.Atlas_Index,row.Atlas_Key,row.Mode188_Gate,row['CΩ_Continuity'],
  row['q_Contradiction'],row['Λ_Burden'],row['Φ_Future_Plasticity'],row.S_Coherence,row.Decision];
 digestNumeric.update(numeric.join('\t')+'\n');
 digestSemantic.update(canonFullSourceSemanticVectorR772(index).join('\t')+'\n');
 counts[row.Decision]++;
}
assert.equal(digestNumeric.digest('hex'),R772_ORIGINAL_SOURCE_PROOF.normalizedNumericSha256);
assert.equal(digestSemantic.digest('hex'),R772_ORIGINAL_SOURCE_PROOF.normalizedSemanticSha256);
assert.deepEqual(counts,{STAY:73214,TURN:111786,ESCALATE:63832});
const first=reconstructCanonFullRowR772(1);
assert.equal(first.Mirror_Statement,'Origin as atom / bond / rest / seen');
assert.equal(first.Deep_Mother_Field,'Contain origin through droplet memory');
assert.equal(first.High_Father_Field,'Aim still via attraction boundary');
assert.equal(first.Coherence_Band,'Critical pressure');
const moved=reconstructCanonFullRowR772(13);
assert.equal(moved.Principle_Core,'Boundary');assert.equal(moved.Domain_Skin,'atom');
assert.equal(moved.Water_Geometry_Teal,'Ripple');
const changedRelation=reconstructCanonFullRowR772(145);
assert.equal(changedRelation.Domain_Skin,'crystal');
const changedState=reconstructCanonFullRowR772(1729);
assert.equal(changedState.Domain_Skin,'crystal');
assert.equal(changedState.Water_Geometry_Teal,'Droplet');
const last=reconstructCanonFullRowR772(248832);
assert.equal(last.Principle_Core,'Fracture');
assert.equal(last.Domain_Skin,'innovation');
assert.equal(last.Water_Geometry_Teal,'Rain');
assert.equal(last.Decision,'STAY');
assert.throws(()=>reconstructCanonFullRowR772(0));
assert.throws(()=>reconstructCanonFullRowR772(248833));
assert.throws(()=>reconstructCanonFullRowR772('1'));
const source=readFileSync('src/CanonTopologyWorkbenchR763.tsx','utf8');
for(const marker of ['data-r772-source-semantics','data-r772-mirror','data-r772-water','data-r772-original-fingerprint'])
 assert(source.includes(marker),'OMEGA7 source-semantic panel missing '+marker);
assert(source.includes('reconstructCanonFullRowR772'));
console.log('R772 FULL ORIGINAL SOURCE REPLAY PASS · 248832 x 24 columns · numeric '+R772_ORIGINAL_SOURCE_PROOF.normalizedNumericSha256+
 ' · semantic '+R772_ORIGINAL_SOURCE_PROOF.normalizedSemanticSha256+' · original bytes absent from public repo · authority held');
