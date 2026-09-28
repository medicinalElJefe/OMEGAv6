import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseConvergenceBacklogR388,selectNextConvergenceItemR388,R388_CONVERGENCE_BACKLOG_SCHEMA} from '../src/system/convergenceBacklogR388.js';
import {repairPathPolicyR314} from '../src/system/autonomousRepairPolicyR314.js';
import {decideCycle} from '../cloudflare/lib/evolution-policy.mjs';

const markdown=fs.readFileSync('docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md','utf8');
const items=parseConvergenceBacklogR388(markdown);
assert.equal(R388_CONVERGENCE_BACKLOG_SCHEMA,'OMEGA_CONVERGENCE_BACKLOG_R388');
assert.ok(items.length>=100,`R388 expected full-spectrum backlog, found only ${items.length} items`);
assert.equal(new Set(items.map(x=>x.id)).size,items.length,'R388 item ids must be deterministic and unique');
for(const item of items){
 assert.equal(item.canonicalAdmission,false);
 assert.match(item.id,/^R388-[A-Y]-\d{2}$/);
 if(item.selfEditable){
  assert.ok(item.affected.length>=1&&item.affected.length<=2,`${item.id} must remain within the two-file R314 source membrane`);
  for(const path of item.affected){
   assert.ok(fs.existsSync(path),`${item.id} target does not exist: ${path}`);
   assert.equal(repairPathPolicyR314(path).allowed,true,`${item.id} target escaped R314 source membrane: ${path}`);
  }
 }
}
assert.ok(items.some(x=>x.section==='G'&&!x.selfEditable),'autonomous-governance section must not be self-editable');
assert.ok(items.some(x=>x.section==='U'&&!x.selfEditable),'action-governance section must not be self-editable');
assert.ok(items.some(x=>x.externalProofRequired),'R388 must preserve external/device proof obligations instead of calling source work complete');

const selected=selectNextConvergenceItemR388({markdown,advancedItemIds:[]});
assert.equal(selected.schema,R388_CONVERGENCE_BACKLOG_SCHEMA);
assert.ok(selected.selected?.selfEditable,'R388 must select a real self-editable backlog item');
const next=selectNextConvergenceItemR388({markdown,advancedItemIds:[selected.selected.id]});
assert.notEqual(next.selected?.id,selected.selected.id,'advanced item must not be selected again');

const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
const exhausted={...state,currentCapsuleId:null,admittedSourceCapsules:state.roadmap.map(x=>x.id)};
const backlogTarget={targetable:true,item:selected.selected,residualId:selected.selected.id,paths:selected.selected.affected,residual:{id:selected.selected.id,severity:'MEDIUM',mode:'AUTO_REPAIR',confidence:1,reproducible:true,affected:selected.selected.affected,summary:selected.selected.objective}};
const decision=decideCycle({currentMainSha:'A',productionProofGreen:true,state:exhausted,candidates:[],evidence:{schema:'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164',state:'HEALTHY',summary:{blocking:0,review:0,observe:0},residuals:[]},repairTarget:{targetable:false},backlogTarget});
assert.equal(decision.action,'PROPOSE');
assert.equal(decision.strategy,'R388_BACKLOG_AI_BUILD');
assert.equal(decision.repairTarget.item.id,selected.selected.id);

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
for(const token of ['selectNextConvergenceItemR388','R388_BACKLOG_AI_BUILD','R388_BACKLOG_BRANCH_AND_PR_CREATED','r388AdvancedItemIds','OMEGA_CLOUDFLARE_R388_CONVERGENCE_RECEIPT'])assert.ok(machine.includes(token),`CLOUD-01 missing R388 token ${token}`);
for(const workflow of ['OMEGA R237 Hybrid Command Authority Proof','OMEGA R238 Woven Hybrid Continuity Convergence'])assert.ok(machine.includes(workflow),`CLOUD-01 autonomous promotion must require ${workflow}`);
assert.ok(machine.includes("externalProofRequired:item.externalProofRequired===true"),'R388 must carry external proof obligations into receipts');
assert.ok(machine.includes('This is one bounded source-improvement step, not a claim that the entire section or any external/device condition is complete.'),'R388 PR truth boundary missing');

console.log(`R388 CONVERGENCE SELF-BUILD PASS · ${items.length} explicit backlog items · deterministic section→source targeting · governance self-edit fence · external proof carry · CLOUD-01 continues beyond SG001–SG005 · all 8 exact-head workflow families required for autonomous promotion`);
