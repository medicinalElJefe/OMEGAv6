import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {V9_SCENARIO_NAMES} from '../src/proof/deweyTemporalRotationV9.js';
import {computeTemporalWorkbenchV9,verifyTemporalWorkbenchV9,TEMPORAL_WORKBENCH_SCHEMA_V9} from '../src/proof/deweyTemporalWorkbenchRuntimeV9.js';
for(const model of V9_SCENARIO_NAMES){
 const packet=computeTemporalWorkbenchV9(model,'1','2','1','1');
 assert.equal(packet.schema,TEMPORAL_WORKBENCH_SCHEMA_V9);
 assert.deepEqual(verifyTemporalWorkbenchV9(JSON.stringify(packet)),packet);
 assert.equal(packet.productionAuthority,false);
 assert.equal(packet.physicalMeasurement,false);
 assert.throws(()=>verifyTemporalWorkbenchV9(JSON.stringify({...packet,composition:{...packet.composition,squaredDefect:'0'}})),/differs/);
 assert.throws(()=>verifyTemporalWorkbenchV9(JSON.stringify({...packet,source:'EMPIRICAL'})),/differs/);
}
const relative=computeTemporalWorkbenchV9('relative','1','2','1','1');
assert.equal(relative.composition.squaredDefect,'0');
assert.equal(relative.rotatedReturn.squaredDefect,'0');
assert.equal(relative.equivariance.allIntegerStatesAndAllQuarterTurns,true);
assert.equal(computeTemporalWorkbenchV9('relative','1','2','1','0').rotatedReturn.squaredDefect,'10');
assert.equal(computeTemporalWorkbenchV9('relative','1','2','4','0').rotatedReturn.squaredDefect,'0');
assert.equal(computeTemporalWorkbenchV9('anisotropic','1','2','1','1').composition.squaredDefect,'5');
for(const bad of [['relative','21','2','1','1'],['relative','1','2','17','1'],['relative','1','2','1','17'],['bad','1','2','1','1'],['relative','1.1','2','1','1']])assert.throws(()=>computeTemporalWorkbenchV9(...bad));
assert.throws(()=>verifyTemporalWorkbenchV9('{broken'),/invalid JSON/);
assert.throws(()=>verifyTemporalWorkbenchV9('x'.repeat(8193)),/size refused/);
assert.throws(()=>verifyTemporalWorkbenchV9(JSON.stringify({...relative,initialState:[1.5,2]})),/exact integer/);
const ui=readFileSync(new URL('../src/DeweyTemporalWorkbenchV9.tsx',import.meta.url),'utf8');
const host=readFileSync(new URL('../src/OmegaResearchAdvancementR316.tsx',import.meta.url),'utf8');
for(const marker of ['data-dewey-v9-workbench','data-v9-model','data-v9-composition','data-v9-return','data-v9-equivariance','data-v9-export','data-v9-import','data-v9-verify','data-v9-recovery'])assert.ok(ui.includes(marker),'missing executable V9 UI marker '+marker);
assert.ok(host.includes('<DeweyTemporalWorkbenchV9/>'),'existing research workspace must expose executable V9 tool');
console.log('V9 exact research workbench six-model execution, deterministic export recovery, tamper refusal, bounded inputs and OMEGA UI binding PASS');
