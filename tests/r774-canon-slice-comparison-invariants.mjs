import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reconstructCanonFullRowR772,R772_ORIGINAL_SOURCE_PROOF} from '../src/proof/canonFullSourceR772.js';
import {compareCanonSlicesR774,verifyCanonComparisonR774,parseCanonComparisonR774,
 R774_SCHEMA,R774_METRICS,R774_GROUPS} from '../src/proof/canonSliceComparisonR774.js';

const slice=(d,s=null,decision='ANY')=>({coordinates:[d,s,null,null,null],decision});
const query={left:slice(1),right:slice(2),metric:'S_Coherence',groupBy:'Decision'};
const comparison=compareCanonSlicesR774(query);
assert.equal(comparison.schema,R774_SCHEMA);
assert.equal(comparison.left.examined,20736);
assert.equal(comparison.right.examined,20736);
assert.equal(comparison.left.matched,20736);
assert.equal(comparison.right.matched,20736);
assert.equal(comparison.left.summary.firstAddress,1);
assert.equal(comparison.right.summary.firstAddress,20737);
assert.equal(comparison.sourceWorkbookSha256,R772_ORIGINAL_SOURCE_PROOF.workbookSha256);
assert.equal(comparison.sourceRows,248832);
assert.equal(comparison.sourceColumns,24);
assert.equal(comparison.sourceModelOnly,true);
assert.equal(comparison.canonicalMutation,false);
assert.equal(comparison.empiricalAuthority,false);
assert.equal(comparison.deviceAction,false);
assert.equal(comparison.left.groups.reduce((s,g)=>s+g.count,0),comparison.left.matched);
assert.equal(comparison.right.groups.reduce((s,g)=>s+g.count,0),comparison.right.matched);
assert.equal(Object.values(comparison.left.decisionCounts).reduce((a,b)=>a+b,0),20736);
assert.equal(Object.values(comparison.right.decisionCounts).reduce((a,b)=>a+b,0),20736);
assert.equal(comparison.groups.reduce((s,g)=>s+g.leftCount,0),20736);
assert.equal(comparison.groups.reduce((s,g)=>s+g.rightCount,0),20736);
assert.ok(comparison.meanDelta!==null);
for(const g of comparison.groups){
 assert.ok(['STAY','TURN','ESCALATE'].includes(g.label));
 assert.equal(g.leftMean,comparison.left.groups.find(x=>x.label===g.label)?.mean??null);
 assert.equal(g.rightMean,comparison.right.groups.find(x=>x.label===g.label)?.mean??null);
 if(g.leftAddress!==null)assert.equal(reconstructCanonFullRowR772(g.leftAddress).Decision,g.label);
 if(g.rightAddress!==null)assert.equal(reconstructCanonFullRowR772(g.rightAddress).Decision,g.label);
}
const same=compareCanonSlicesR774({...query,right:slice(1)});
assert.equal(same.meanDelta,'0.0000');
assert.equal(same.matchDelta,0);
assert.deepEqual(same.left,same.right);
const one=compareCanonSlicesR774({left:{coordinates:[1,1,1,1,1],decision:'ANY'},
 right:{coordinates:[2,1,1,1,1],decision:'ANY'},metric:'Φ_Future_Plasticity',groupBy:'Domain'});
assert.equal(one.left.examined,1);assert.equal(one.right.examined,1);
assert.equal(one.left.summary.mean,reconstructCanonFullRowR772(1)['Φ_Future_Plasticity']);
assert.equal(one.right.summary.mean,reconstructCanonFullRowR772(20737)['Φ_Future_Plasticity']);
assert.equal(one.groups.length,2);
assert.ok(one.groups.every(g=>g.meanDelta===null));
const byState=compareCanonSlicesR774({...query,groupBy:'State',left:slice(1,1),right:slice(2,1)});
assert.equal(byState.left.examined,1728);assert.equal(byState.right.examined,1728);
assert.equal(byState.groups.length,1);
assert.equal(byState.groups[0].leftCount,1728);
for(const metric of R774_METRICS){
 const x=compareCanonSlicesR774({...query,metric,left:slice(1,1,1,1,1),right:slice(2,1,1,1,1)});
 assert.equal(x.left.summary.mean,reconstructCanonFullRowR772(1)[metric]);
}
const empty=compareCanonSlicesR774({...query,left:{coordinates:[1,1,1,1,1],decision:'STAY'},
 right:{coordinates:[1,1,1,1,1],decision:'ESCALATE'}});
assert.equal(empty.left.matched,0);assert.equal(empty.left.summary.mean,null);
assert.equal(empty.meanDelta,null);
assert.deepEqual(parseCanonComparisonR774(JSON.stringify(query)),query);
assert.deepEqual(verifyCanonComparisonR774(JSON.stringify(comparison)),comparison);
for(const key of ['meanDelta','sourceWorkbookSha256','groups','left','right']){
 const forged=JSON.parse(JSON.stringify(comparison));
 if(key==='groups')forged.groups[0].leftCount++;
 else if(key==='left')forged.left.summary.sumScaled4++;
 else if(key==='right')forged.right.decisionCounts.STAY++;
 else forged[key]='FORGED';
 assert.throws(()=>verifyCanonComparisonR774(JSON.stringify(forged)),/differs/);
}
assert.throws(()=>compareCanonSlicesR774({...query,metric:'FAKE'}),/unsupported/);
assert.throws(()=>compareCanonSlicesR774({...query,groupBy:'__proto__'}),/unsupported/);
assert.throws(()=>compareCanonSlicesR774({...query,left:slice(null)}),/fix at least one/);
assert.throws(()=>compareCanonSlicesR774({...query,right:slice(13)}),/integer/);
assert.throws(()=>compareCanonSlicesR774({...query,canonicalMutation:true}),/unknown comparison/);
assert.throws(()=>compareCanonSlicesR774({...query,left:{...slice(1),limit:248832}}),/slice accepts/);
assert.throws(()=>parseCanonComparisonR774(' '.repeat(4097)),/bounded/);
assert.throws(()=>verifyCanonComparisonR774(' '.repeat(32001)),/bounded/);
assert.throws(()=>verifyCanonComparisonR774('{'),/invalid/);
assert.throws(()=>verifyCanonComparisonR774('{}'),/unsupported/);
assert.ok(R774_GROUPS.includes('Decision'));
const ui=readFileSync('src/CanonSliceComparisonR774.tsx','utf8');
const parent=readFileSync('src/CanonSourceQueryR773.tsx','utf8');
for(const marker of ['data-r774-comparison','data-r774-run','data-r774-left-count','data-r774-right-count',
 'data-r774-group-row','data-r774-open-left','data-r774-open-right','data-r774-save','data-r774-restore',
 'data-r774-export','data-r774-verify'])
 assert.ok(ui.includes(marker),'missing UI '+marker);
assert.ok(parent.includes('<CanonSliceComparisonR774 onSelect={onSelect}'));
console.log('R774 CANON SOURCE SLICE COMPARISON PASS · exact scaled metrics, two bounded slices, group deltas, source navigation, portable recomputation and refusal');
