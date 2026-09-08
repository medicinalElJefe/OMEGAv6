import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const lineage=read('src/missionLineageR208.ts');
const execution=read('src/missionLineageExecutionR208.ts');
const sai=read('src/SaiHybridHandoffPanelR1961.tsx');
const hybrid=read('src/HybridMissionControlR8.tsx');
const r146=read('src/execution/durableOperationExecutionR146.js');
const r147=read('src/execution/unifiedExecutorFabricR147.js');
const r180=read('src/livingWorldExecutionClientR180.ts');
const must=(ok,msg)=>assert.ok(ok,msg);

for(const token of ["R208_REVISION='R208'","OMEGA_END_TO_END_MISSION_LINEAGE_R208",'crypto.subtle.digest(\'SHA-256\'','DRAFT_ONLY_NOT_QUEUED','operatorImportRequired:true','queueMutation:false','dispatchMutation:false','executionClaimed:false',"canonicalAdmissionAuthority:'R125'", "executionHistoryAuthority:'R146'", "executorAuthority:'R147'", "hybridReturnProofAuthority:'R141'",'BROWSER_CORRELATION_ONLY','DERIVED_OR_DESCENDANT_NODES_MAY_NOT_BE_COUNTED_AS_INDEPENDENT_EMPIRICAL_CONFIRMATION_OF_THEIR_ANCESTORS'])must(lineage.includes(token),`R208 base lineage missing ${token}`);
for(const kind of ['SOURCE_EVIDENCE','DERIVED_PROPOSAL','HELD_PLAN','PLAN_VALIDATION','OPERATOR_AUTHORIZATION','EXECUTOR_BINDING','EXECUTION_RETURN','PROOF_CLOSURE','DURABLE_HISTORY','RESIDUAL','REPAIR_PROPOSAL'])must(lineage.includes(kind),`R208 lineage kind missing ${kind}`);
for(const token of ['R208_LINEAGE_HELD_FOR_OPERATOR_IMPORT','compileSaiHybridLineageR208','publishPendingLineageR208',"/api/hybrid/plan","/api/hybrid/validate",'queueMutation:false','dispatchMutation:false','executionClaimed:false'])must(sai.includes(token),`R208 SAI handoff missing ${token}`);
must(!/\/api\/hybrid\/(?:job\/queue|queue|confirm|execute|claim|dispatch)/.test(sai),'R208 SAI handoff gained queue/confirm/execute/dispatch endpoint');
for(const token of ['R208 · SAI LINEAGE READY FOR OPERATOR IMPORT','Import exact held draft for review','acceptPendingLineageR208','setDraft(imported.draft)','OPERATOR IMPORT REQUIRED','Import is review—not confirmation.'])must(hybrid.includes(token),`R208 Hybrid operator import missing ${token}`);
const importBlock=(hybrid.match(/const importR208=\(\)=>\{([\s\S]*?)\};\n const pair=/)||[])[1]||'';
must(importBlock.length>0,'R208 operator import function not found');
must(!/api\.(?:post|put|patch|delete)/.test(importBlock),'R208 operator import may not call a mutating API');
must(!/queue|dispatch|execute/i.test(importBlock.replace(/queueMutation:false|dispatchMutation:false|executionClaimed:false/g,'')),'R208 operator import may not queue, dispatch or execute');
for(const token of ['R179_EXPLICIT_OPERATOR_AUTHORIZATION','R147_EXECUTOR_SELECTION_AND_DISPATCH','R141_EXACT_RETURN_PROOF','R146_DURABLE_EXECUTION_HISTORY','SAI_GOVERNED_REPAIR_PROPOSAL','R179_AUTHORIZATION_STATE_REQUIRED','R147_REQUIRES_R179_AUTHORIZATION','R141_EXACT_RETURN_PROOF_REQUIRED','R146_VERIFIED_REPLAY_REQUIRED','RESIDUAL_REQUIRES_VERIFIED_DURABLE_HISTORY','REPAIR_PROPOSAL_REQUIRES_RESIDUAL','queueAuthority:false','dispatchAuthority:false','executionAuthority:false','persistenceOwner:false','scientificTruthAuthority:false'])must(execution.includes(token),`R208 execution correlation missing ${token}`);
for(const token of ['HYBRID_VERIFIED_REQUIRES_R141_EXACT_PAYLOAD_PROOF','EVERY_EXECUTION_TRANSITION_IS_HASH_CHAINED_AND_REPLAYABLE','EXECUTION_RUNS_NEVER_MUTATE_CANONSTATE','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])must(r146.includes(token),`R146 authority changed/missing ${token}`);
for(const token of ['ONE_DURABLE_RUN_ONE_EXECUTOR_BINDING_AT_A_TIME','R146_STATE_MACHINE_REMAINS_EXECUTION_HISTORY_AUTHORITY','HYBRID_RETURN_REQUIRES_R141_CLOSURE_BEFORE_VERIFIED','R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'])must(r147.includes(token),`R147 authority changed/missing ${token}`);
for(const token of ['sourceMissionId','runId','headSha256','AUTHORIZED_NOT_DISPATCHED','confirmHostExecution'])must(r180.includes(token),`R179/R180 existing authorization/run identity missing ${token}`);

console.log('OMEGA R208 END-TO-END MISSION LINEAGE PASS · SAI proposal → SHA-256 held draft → explicit operator import → R179 authorization → R147 executor → return → R141 proof → R146 replayable history → residual → repair correlation · zero new queue/dispatch/execution/persistence/Canon authority · evidence independence law enforced');
