import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseConvergenceBacklogR388,selectNextConvergenceItemR388,validateConvergenceRepairR450,R388_CONVERGENCE_BACKLOG_SCHEMA,R388_BACKLOG_CANDIDATE_LIMIT} from '../src/system/convergenceBacklogR388.js';
import {repairPathPolicyR314} from '../src/system/autonomousRepairPolicyR314.js';
import {decideCycle} from '../cloudflare/lib/evolution-policy.mjs';

const markdown=fs.readFileSync('docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md','utf8');
const items=parseConvergenceBacklogR388(markdown);
assert.equal(R388_CONVERGENCE_BACKLOG_SCHEMA,'OMEGA_CONVERGENCE_BACKLOG_R388');
assert.ok(items.length>=100,`R388 expected full-spectrum backlog, found only ${items.length} items`);
assert.equal(new Set(items.map(x=>x.id)).size,items.length,'R388 item ids must be deterministic and unique');
assert.equal(items.length,155,'R450 must retain all 155 absolute convergence rows including checked rows');
assert.deepEqual(items.filter(x=>x.completed).map(x=>x.id),['R388-B-01','R388-D-01'],'R450 checked rows must retain stable absolute identities');
assert.equal(items.find(x=>x.id==='R388-B-02')?.objective,'Every route proves functional inheritance, not menu presence alone: usable controls, state/output, proof, failure/recovery path.','B-01 completion must never renumber B-02');
assert.equal(items.find(x=>x.id==='R388-D-02')?.objective,'Native complex SAR acquisition binding and real source rasters where provider/data access permits.','D-01 completion must never renumber D-02');

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
const byId=id=>items.find(x=>x.id===id);
assert.deepEqual(byId('R388-A-01')?.affected,['src/runtimeIdentity.ts','src/operationalCapabilityRuntimeR45.ts'],'R448 one-runtime convergence must target runtime identity/operational authority rather than the workstation mount tree');
assert.deepEqual(byId('R388-A-02')?.affected,['src/capabilityAuthority.ts','src/OmegaViewAuthorityBar.tsx'],'R448 renderer-contract convergence must target view/capability authority');
assert.deepEqual(byId('R388-A-03')?.affected,['src/capabilityAuthority.ts','src/operationalCapabilityRuntimeR45.ts'],'R448 capability-state normalization must target capability truth, not mount ownership');
assert.equal(byId('R388-A-04')?.selfEditable,false,'R448 native OpenGL→CPU fallback must remain device-gated until a real native executor target exists');
assert.equal(byId('R388-A-04')?.externalProofRequired,true,'R448 native renderer fallback must retain first-hand external/device proof');
assert.deepEqual(byId('R388-C-04')?.affected,[],'R476 C-04 provider/live-proof objective must not expose an autonomous product-source mutation membrane');
assert.equal(byId('R388-C-04')?.selfEditable,false,'R476 C-04 must remain proof-only until returned provider evidence closes the external obligation');
assert.equal(byId('R388-C-04')?.externalProofRequired,true,'R476 C-04 must retain first-hand provider proof rather than source-change inference');
const a02=byId('R388-A-02'),a03=byId('R388-A-03');
assert.equal(a02?.acceptanceContract?.revision,'R450');
assert.equal(a03?.acceptanceContract?.revision,'R450');
const shallowA02=validateConvergenceRepairR450({item:a02,proposal:{files:[{replacements:[{before:'export const X=1',after:'export const CAPABILITY_BY_FAMILY=new Map()'}]}]}});
assert.equal(shallowA02.valid,false,'R450 must reject the exact class of shallow A-02 family-map churn exposed by PR #887');
assert.ok(shallowA02.reasons.some(x=>x.startsWith('SEMANTIC_REQUIRED_CHANGED_TOKENS_MISSING:')));
const shallowA03=validateConvergenceRepairR450({item:a03,proposal:{files:[{replacements:[{before:"type CapabilityReality='A'",after:"type CapabilityReality='A'|'FAILED'"}]}]}});
assert.equal(shallowA03.valid,false,'R450 must reject the exact class of shallow A-03 FAILED-only churn exposed by PR #888');
const strongA03=validateConvergenceRepairR450({item:a03,proposal:{files:[{replacements:[{before:'legacy capability state adapter '.repeat(12),after:"export type CapabilityAvailabilityState='READY'|'AVAILABLE_NOT_CONFIGURED'|'OPTIONAL_NOT_INSTALLED'|'DEGRADED'|'FAILED';\nexport function capabilityAvailabilityState(){ return 'READY' as CapabilityAvailabilityState }\n"+'normalized capability availability mapping '.repeat(12)}]}]}});
assert.equal(strongA03.valid,true,'R450 semantic gate must admit a materially sized proposal that carries the full declared A-03 contract');

const b02=byId('R388-B-02');
assert.deepEqual(b02?.affected,['src/OmegaSideNavigatorR88.tsx','src/OmegaWorkstationFullV2.tsx'],'R458 B-02 must preserve R143 authority and target its navigator + mounted-workstation consumers rather than route-list typing');
assert.equal(b02?.acceptanceContract?.revision,'R458','R458 must attach semantic acceptance to route-functional inheritance');
const rejectedB02=validateConvergenceRepairR450({item:b02,proposal:{files:[
 {path:'src/navigationRegistry.ts',replacements:[{before:'export const OMEGA_NAVIGATION=[',after:'export const OMEGA_NAVIGATION: readonly OmegaNavItem[] = ['}]},
 {path:'src/OmegaWorkstationFullV2.tsx',replacements:[{before:'export const OMEGA_SURFACES=OMEGA_NAV_NAMES;',after:'export const OMEGA_SURFACES: readonly OmegaRouteName[] = OMEGA_NAV_NAMES;'}]}
]}});
assert.equal(rejectedB02.valid,false,'R458 must reject the exact shallow readonly-annotation patch class from governed-rejected PR #899');
assert.ok(rejectedB02.reasons.some(x=>x.startsWith('SEMANTIC_PATCH_TOO_SHALLOW_')),'R458 B-02 must require material functional work');
assert.ok(rejectedB02.reasons.some(x=>x.includes('OMEGA_ROUTE_FUNCTIONAL_INHERITANCE')),'R458 B-02 must require explicit functional-inheritance semantics');
const strongB02=validateConvergenceRepairR450({item:b02,proposal:{files:[
 {path:'src/OmegaSideNavigatorR88.tsx',replacements:[{before:'legacy route navigation consumer '.repeat(45),after:[
  "const OMEGA_ROUTE_FUNCTIONAL_INHERITANCE=OMEGA_ALL_ROUTES_R82.map(route=>{",
  " const operation=operationContractForRouteR143(route);",
  " return {route,routeId:operation.routeId,usableControl:true,stateOutput:'ROUTE_STATE_AND_OUTPUT',proof:'R142',receiptAuthority:'R142',admissionAuthority:'R125',failureRecovery:'VISIBLE_FAILURE_AND_RETRY',degradeTo:'System Atlas',canonicalMutation:false};",
  "});",
  "OMEGA_ALL_ROUTES_R82; operationContractForRouteR143; R142; R125; usableControl; stateOutput; proof; failureRecovery; degradeTo; canonicalMutation:false;",
  'functional inheritance navigator binding '.repeat(45)
 ].join('\n')}]},
 {path:'src/OmegaWorkstationFullV2.tsx',replacements:[{before:'legacy mounted route surface '.repeat(35),after:[
  "const functionalInheritance=OMEGA_ROUTE_FUNCTIONAL_INHERITANCE.find(row=>row.route===panel);",
  "if(!functionalInheritance)throw new Error('route functional inheritance missing '+panel);",
  "const usableControl=functionalInheritance.usableControl;",
  "const stateOutput=functionalInheritance.stateOutput;",
  "const proof=functionalInheritance.proof;",
  "const receiptAuthority='R142';",
  "const failureRecovery=functionalInheritance.failureRecovery;",
  "const degradeTo=functionalInheritance.degradeTo;",
  "const canonicalMutation=false;",
  'mounted functional inheritance continuity '.repeat(35)
 ].join('\n')}]}]}});
assert.equal(strongB02.valid,true,'R458 semantic gate must admit a materially sized B-02 proposal carrying authority + mounted-surface + proof + recovery transition semantics');
assert.equal(strongB02.transition.authoritySurfaceBound,true);
assert.equal(strongB02.transition.proofTransportBound,true);
assert.equal(strongB02.transition.recoveryBound,true);
assert.equal(strongB02.transition.canonicalBoundaryPreserved,true);

assert.deepEqual(byId('R388-A-05')?.affected,['src/buildGovernance.ts','src/OmegaSystemConsolidationR30.tsx'],'R448 cumulative proof-surface work must target build/system validation');
for(const id of ['R388-A-01','R388-A-02','R388-A-03','R388-A-05'])assert.equal(byId(id)?.affected.includes('src/OmegaWorkstationFullV2.tsx'),false,`${id} must not fall back to the coarse workstation mount owner target`);


const selected=selectNextConvergenceItemR388({markdown,advancedItemIds:[]});
assert.equal(selected.schema,R388_CONVERGENCE_BACKLOG_SCHEMA);
assert.ok(selected.selected?.selfEditable,'R388 must select a real self-editable backlog item');
const next=selectNextConvergenceItemR388({markdown,advancedItemIds:[selected.selected.id]});
assert.notEqual(next.selected?.id,selected.selected.id,'advanced item must not be selected again');
assert.equal(R388_BACKLOG_CANDIDATE_LIMIT,3,'R421 bounded backlog queue must remain compact');
assert.ok(selected.candidates.length>=2&&selected.candidates.length<=R388_BACKLOG_CANDIDATE_LIMIT,'R421 must expose a small deterministic candidate queue');
assert.equal(selected.candidates[0].id,selected.selected.id,'R421 selected item must remain the first queued candidate');
const held=selectNextConvergenceItemR388({markdown,advancedItemIds:[],heldItemIds:[selected.selected.id]});
assert.notEqual(held.selected?.id,selected.selected.id,'recently declined R388 item must be temporarily bypassable without false advancement');
assert.ok(held.heldRecentDeclines.includes(selected.selected.id),'R421 must report recently declined held items explicitly');
assert.equal(held.advanced,0,'temporary decline hold must never increment advanced completion');

const state=JSON.parse(fs.readFileSync('public/omega-r170-selfbuild-state.json','utf8'));
assert.equal(state.r388AdvancedItemIds.includes('R388-C-04'),false,'R476 must remove false C-04 advancement from the effective advanced set');
assert.equal(state.r388AdvancedItemIds.includes('R388-C-05'),true,'R476 must retain the release-clean C-05 adaptive LOD advancement');
assert.ok((state.r388TruthCorrections||[]).some(x=>x.itemId==='R388-C-04'&&x.state==='NO_SAFE_PATCH'&&x.reasons?.includes('MODEL_DECLINED_BOUNDED_PATCH')),'R476 must restore the exact C-04 NO_SAFE_PATCH scar');
const exhausted={...state,currentCapsuleId:null,admittedSourceCapsules:state.roadmap.map(x=>x.id)};
const backlogTarget={targetable:true,item:selected.selected,residualId:selected.selected.id,paths:selected.selected.affected,residual:{id:selected.selected.id,severity:'MEDIUM',mode:'AUTO_REPAIR',confidence:1,reproducible:true,affected:selected.selected.affected,summary:selected.selected.objective}};
const decision=decideCycle({currentMainSha:'A',productionProofGreen:true,state:exhausted,candidates:[],evidence:{schema:'OMEGA_DEVELOPMENT_RESIDUAL_GRAPH_R164',state:'HEALTHY',summary:{blocking:0,review:0,observe:0},residuals:[]},repairTarget:{targetable:false},backlogTarget});
assert.equal(decision.action,'PROPOSE');
assert.equal(decision.strategy,'R388_BACKLOG_AI_BUILD');
assert.equal(decision.repairTarget.item.id,selected.selected.id);

const machine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
for(const token of ['selectNextConvergenceItemR388','R388_BACKLOG_AI_BUILD','R388_BACKLOG_BRANCH_AND_PR_CREATED','r388AdvancedItemIds','OMEGA_CLOUDFLARE_R388_CONVERGENCE_RECEIPT','backlogTargets','recentDeclinedItemIds','declinedItemScars'])assert.ok(machine.includes(token),`CLOUD-01 missing R388 token ${token}`);
for(const workflow of ['OMEGA R237 Hybrid Command Authority Proof','OMEGA R238 Woven Hybrid Continuity Convergence'])assert.ok(machine.includes(workflow),`CLOUD-01 autonomous promotion must require ${workflow}`);
assert.ok(machine.includes("externalProofRequired:item.externalProofRequired===true"),'R388 must carry external proof obligations into receipts');
assert.ok(machine.includes('This is one bounded source-improvement step, not a claim that the entire section or any external/device condition is complete.'),'R388 PR truth boundary missing');
assert.ok(machine.includes("repair:{state:repair.state,reasons:repair.reasons||repair.validation?.reasons||[],attempts:repair.attempts||[]"),'R388 must retain exact rejected-attempt evidence when no candidate is emitted');
assert.ok(machine.includes("repairAttemptLedger:repair.attempts||[]"),'R388 governed receipt must carry bounded AI attempt history');
assert.ok(machine.includes("rejectionScars:repair.rejectionHistory||[]"),'R388 governed receipt must preserve validator rejection scars after compliant reformulation');
assert.ok(machine.includes("if(repair.state!=='NO_SAFE_PATCH')"),'R421 may continue past only an explicit safe model decline; malformed/policy/generation failures must still terminate fail-closed');
assert.ok(machine.includes('validateConvergenceRepairR450({item,proposal:repair.proposal})'),'R450 CLOUD-01 must run semantic acceptance before selecting a repair candidate');
assert.ok(machine.includes("state:'SEMANTIC_ACCEPTANCE_REJECTED'")&&machine.includes('semanticAcceptanceContract:item.acceptanceContract||null'),'R450 must feed the item contract to the model and retain semantic rejection scars');
const semanticGateIndex=machine.indexOf('validateConvergenceRepairR450({item,proposal:repair.proposal})');
const branchCreateIndex=machine.indexOf("/git/refs",semanticGateIndex);
assert.ok(semanticGateIndex>=0&&branchCreateIndex>semanticGateIndex,'R450 semantic acceptance must execute before candidate branch creation');

assert.ok(machine.includes("declinedItemScars,createdAt"),'R421 accepted successor receipt must carry prior declined-item scars');
assert.ok(machine.includes("r388AdvancedItemIds:[...new Set([...(state.r388AdvancedItemIds||[]),item.id])]"),'R421 must advance only the item that actually produced the governed source candidate');
assert.ok(machine.includes("Prior bounded item declines carried without false advancement"),'R421 PR truth boundary must disclose skipped model-declined items');
assert.ok(machine.includes("OMEGA_CLOUDFLARE_R388_DECLINE_SCAR_RECEIPT"),'R423 all-decline cycles must have a governed durable scar receipt');
assert.ok(machine.includes("generatorContract:'R388_DECLINE_SCAR_CARRY'"),'R423 scar carry must be explicitly distinct from product-source advancement');
assert.ok(machine.includes("sourceAdvance:false,advancedItemIdsChanged:false"),'R423 scar receipt must explicitly deny source advancement and advanced-item mutation');
assert.ok(machine.includes("r388ObservationGeneration"),'R423 scar-only receipts need an observation generation independent of convergence advancement');
assert.ok(machine.includes("R388_DECLINE_SCARS_PENDING_PROOF"),'R423 scar carry must remain proof-gated before becoming durable on main');
assert.ok(machine.includes("Product-source changes: NONE"),'R423 scar-carry PR must disclose that it changes no product source');
assert.ok(machine.includes("r388AdvancedItemIds changed: NO"),'R423 scar-carry PR must disclose that no convergence item is advanced');
const scarStart=machine.indexOf("if(declinedItemScars.length){");
const scarEnd=machine.indexOf("return{...inspection,mutation:'NONE'",scarStart);
assert.ok(scarStart>=0&&scarEnd>scarStart,'R423 durable scar-carry branch must exist inside the all-decline boundary');
const scarCarryBlock=machine.slice(scarStart,scarEnd);
assert.ok(scarCarryBlock.includes("r388Receipts:[...(state.r388Receipts||[]),receipt]"),'R423 must persist decline scars only through the existing governed R388 receipt ledger');
assert.equal(scarCarryBlock.includes("r388AdvancedItemIds:"),false,'R423 scar-only state candidate must never mutate advanced completion');
assert.ok(machine.includes("stateOnly=candidate?.sourceAdvance===false||candidate?.status==='DECLINE_SCARS_PENDING_PROOF'"),'R423 promotion receipt must distinguish state-only scar carry from source advancement');
assert.ok(machine.includes('async function gitBlobShaR430(value)')&&machine.includes("crypto.subtle.digest('SHA-1',framed)")&&machine.includes("blob ${body.byteLength}\\0"),'R430 rejected-patch memory must derive exact Git blob SHA-1 identity from Git blob framing, not fuzzy text');
assert.ok(machine.includes("schema:'OMEGA_R430_PRODUCT_PATCH_IDENTITY'")&&machine.includes("rows.map(row=>\`\${row.path}:\${row.blobSha}\`).join('|')"),'R430 product patch identity must bind sorted product paths to exact resulting blob SHAs');
assert.ok(machine.includes("/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100")&&machine.includes("!pr.merged_at")&&machine.includes("startsWith('cloud/evolution-r388-')"),'R430 memory search must be restricted to closed unmerged CLOUD-01 R388 history');
assert.ok(machine.includes("/pulls/\${pr.number}/commits?per_page=100")&&machine.includes("prior.key!==proposed.key"),'R430 must inspect historical PR commits so a later repair/revert cannot erase the originally rejected exact patch identity');
assert.ok(machine.includes('GOVERNED_REJECTION_COMMENT')&&machine.includes('FAILED_EXACT_HEAD_PROOF'),'R430 must require explicit rejection evidence rather than treating every closed PR as proof-invalid');
assert.ok(machine.includes('R430_REQUIRED_PROOF_WORKFLOWS=new Set')&&machine.includes("R430_REQUIRED_PROOF_WORKFLOWS.has(run.name)"),'R430 failed-workflow rejection evidence must be limited to the authoritative eight-family promotion proof stack');
assert.ok(machine.includes('const itemSlug=slug(itemId)')&&machine.includes('branch.includes(itemSlug)'),'R430 must still identify the convergence item if a closed autonomous PR title was later edited');
assert.ok(machine.includes("state:'PROOF_REJECTED_PATCH_REPEAT'"),'R430 must record exact known-bad patch recurrence as a distinct decline scar');
assert.ok(machine.includes('patchIdentity:rejectedRepeat.proposed')&&machine.includes('matchedClosedPr:{number:rejectedRepeat.prNumber'),'R430 decline scar must preserve exact patch identity and closed-PR rejection provenance');
const repeatStart=machine.indexOf("if(rejectedRepeat.matched){");
const chooseStart=machine.indexOf("chosen={target,item,repair,patchIdentity:rejectedRepeat.proposed};break",repeatStart);
assert.ok(repeatStart>=0&&chooseStart>repeatStart,'R430 must check exact rejected-patch memory before choosing a source candidate');
const repeatBlock=machine.slice(repeatStart,chooseStart);
assert.ok(repeatBlock.includes('declinedItemScars.push(scar)')&&repeatBlock.includes('continue;'),'R430 exact repeat must become a decline scar and continue to the next bounded backlog candidate');
assert.equal(repeatBlock.includes('/git/refs'),false,'R430 exact repeat must be rejected before candidate branch creation');
assert.ok(machine.includes('productPatchIdentity:patchIdentity')&&machine.includes('Product patch identity: ${patchIdentity.key}'),'R430 accepted non-repeat candidate must carry its exact product patch identity into receipt/candidate/PR evidence');


console.log(`R388/R430 CONVERGENCE SELF-BUILD PASS · ${items.length} explicit backlog items · stable row identity · semantic item→subsystem targeting · pre-branch semantic acceptance · governance self-edit fence · external proof carry · CLOUD-01 continues beyond SG001–SG005 · validator-feedback scars preserved · exact Git-blob proof-rejected patch memory · bounded compliant reformulation only · durable all-decline scar carry without false advancement · all 8 exact-head workflow families required for autonomous promotion`);
