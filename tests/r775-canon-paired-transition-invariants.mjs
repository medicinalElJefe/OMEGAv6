import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reconstructCanonFullRowR772,R772_ORIGINAL_SOURCE_PROOF} from '../src/proof/canonFullSourceR772.js';
import {computeCanonPairedTransitionR775,verifyCanonPairedTransitionR775,
 parseCanonPairedTransitionR775,R775_SCHEMA,R775_DECISIONS} from '../src/proof/canonPairedTransitionR775.js';

const query={leftDomain:1,rightDomain:2,state:null,metric:'S_Coherence'};
const result=computeCanonPairedTransitionR775(query);
assert.equal(result.schema,R775_SCHEMA);
assert.equal(result.paired,20736);
assert.equal(result.stable+result.changed,result.paired);
assert.equal(result.matrix.length,9);
assert.equal(result.matrix.reduce((sum,x)=>sum+x.count,0),20736);
assert.equal(result.matrix.reduce((sum,x)=>sum+x.sumDeltaScaled4,0),result.sumDeltaScaled4);
assert.equal(result.sourceWorkbookSha256,R772_ORIGINAL_SOURCE_PROOF.workbookSha256);
assert.equal(result.sourceRows,248832);
assert.equal(result.sourceColumns,24);
assert.equal(result.sourceModelOnly,true);
assert.equal(result.empiricalAuthority,false);
assert.equal(result.canonicalMutation,false);
assert.equal(result.deviceAction,false);
for(const cell of result.matrix){
 assert.ok(R775_DECISIONS.includes(cell.from)&&R775_DECISIONS.includes(cell.to));
 if(cell.count===0){assert.equal(cell.firstLeftAddress,null);assert.equal(cell.firstRightAddress,null);assert.equal(cell.meanDelta,null);}
 else{
  assert.equal(reconstructCanonFullRowR772(cell.firstLeftAddress).Decision,cell.from);
  assert.equal(reconstructCanonFullRowR772(cell.firstRightAddress).Decision,cell.to);
  assert.equal(cell.firstRightAddress-cell.firstLeftAddress,20736);
 }
}
assert.equal(result.changed,result.matrix.filter(c=>c.from!==c.to).reduce((s,c)=>s+c.count,0));
assert.deepEqual(verifyCanonPairedTransitionR775(JSON.stringify(result)),result);
assert.deepEqual(parseCanonPairedTransitionR775(JSON.stringify(query)),query);
const same=computeCanonPairedTransitionR775({...query,rightDomain:1});
assert.equal(same.paired,20736);assert.equal(same.changed,0);
assert.equal(same.meanDelta,'0.0000');assert.equal(same.sumDeltaScaled4,0);
assert.ok(same.matrix.every(c=>c.from===c.to||c.count===0));
const state=computeCanonPairedTransitionR775({...query,state:1});
assert.equal(state.paired,1728);
const toScaled=(s)=>Number(s.replace('.',''));
let manual=0;
for(let local=1;local<=1728;local++){
 const left=reconstructCanonFullRowR772(local),right=reconstructCanonFullRowR772(local+20736);
 manual+=toScaled(right.S_Coherence)-toScaled(left.S_Coherence);
}
assert.equal(state.sumDeltaScaled4,manual);
assert.equal(state.matrix.reduce((s,c)=>s+c.count,0),1728);
assert.equal(state.matrix.reduce((s,c)=>s+c.sumDeltaScaled4,0),manual);
const one=computeCanonPairedTransitionR775({leftDomain:12,rightDomain:1,state:12,metric:'Φ_Future_Plasticity'});
assert.equal(one.paired,1728);
assert.ok(one.matrix.every(c=>c.firstLeftAddress===null||c.firstLeftAddress>228096));
assert.ok(one.matrix.every(c=>c.firstRightAddress===null||c.firstRightAddress<=20736));
for(const field of ['paired','changed','matrix','sourceWorkbookSha256','meanDelta']){
 const altered=JSON.parse(JSON.stringify(result));
 if(field==='matrix')altered.matrix[0].count++;
 else altered[field]='TAMPER';
 assert.throws(()=>verifyCanonPairedTransitionR775(JSON.stringify(altered)),/differ/);
}
assert.throws(()=>computeCanonPairedTransitionR775({...query,leftDomain:0}),/domain/);
assert.throws(()=>computeCanonPairedTransitionR775({...query,rightDomain:13}),/domain/);
assert.throws(()=>computeCanonPairedTransitionR775({...query,state:NaN}),/state/);
assert.throws(()=>computeCanonPairedTransitionR775({...query,state:undefined}),/state/);
assert.throws(()=>computeCanonPairedTransitionR775({...query,metric:'NOT_SOURCE'}),/unsupported/);
assert.throws(()=>computeCanonPairedTransitionR775({...query,deviceAction:true}),/unknown/);
assert.throws(()=>parseCanonPairedTransitionR775(' '.repeat(2049)),/bounded/);
assert.throws(()=>verifyCanonPairedTransitionR775(' '.repeat(16001)),/bounded/);
assert.throws(()=>verifyCanonPairedTransitionR775('{'),/invalid/);
assert.throws(()=>verifyCanonPairedTransitionR775('{}'),/unsupported/);
const ui=readFileSync('src/CanonPairedTransitionR775.tsx','utf8');
const parent=readFileSync('src/CanonSourceQueryR773.tsx','utf8');
for(const marker of ['data-r775-paired-transitions','data-r775-run','data-r775-pairs',
 'data-r775-changed','data-r775-transition-row','data-r775-open-left','data-r775-open-right',
 'data-r775-save','data-r775-restore','data-r775-export','data-r775-verify'])
 assert.ok(ui.includes(marker),'missing UI '+marker);
assert.ok(parent.includes('<CanonPairedTransitionR775 onSelect={onSelect}'));
const browser=readFileSync('tests/dewey-temporal-workbench-v9-browser-e2e.mjs','utf8');
const restoredRow="   await navigator.locator('[data-r763-start]').fill('1');";
const originalFixture="   const original=navigator.locator('[data-r772-source-semantics=\\\"source-matched\\\"]');";
assert.ok(browser.includes(restoredRow+'\\n'+originalFixture),
 'R775 must restore source address 1 with actual line breaks before declaring the inherited R772 fixture');
assert.ok(!browser.includes('source-pair inspection navigates to a real source address.\\\\n'),
 'R775 fixture setup must not contain escaped newline bytes inside a JavaScript comment');
console.log('R775 PAIRED CANON TRANSITIONS PASS · aligned source pairs, 3x3 decision matrix, exact deltas, local recovery and tamper refusal');
