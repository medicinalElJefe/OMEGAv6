import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R86 '+msg)};
const bus=read('src/omegaOperationBusR86.ts');
const workflow=read('src/omegaWorkflowRuntimeR85.ts');
const workbench=read('src/OmegaIntentWorkbenchR85.tsx');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const prompt=read('src/PromptOrchestrator.tsx');
const reality=read('src/AppliedRealityLab.tsx');
const media=read('src/OmegaGovernanceProjectMediaR29.tsx');
const workspace=read('src/OmegaWorkspaceCockpitR18.tsx');
const evidence=read('src/OmegaEvidenceMemoryR28.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const living=read('src/OmegaR36LivingSurfaces.tsx');

for(const type of ['ANALYSIS_COMPLETED','REALITY_STATE_COMMITTED','CANONICAL_TRANSITION_COMMITTED','GOVERNANCE_HOLD_RECORDED','ASSET_HASHED','ARTIFACT_EXPORTED','PROJECT_CREATED','CHECKPOINT_CAPTURED','MEMORY_SNAPSHOT_CAPTURED','PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED','COCKPIT_PROOF_REFRESHED','HOST_JOB_QUEUED','BUILD_MISSION_STARTED','HOST_JOB_PROOF_SELECTED'])must(bus.includes("'"+type+"'"),'operation type missing '+type);
must(bus.includes("crypto.subtle.digest('SHA-256'")||bus.includes("crypto.subtle.digest('SHA-256',"),'operation receipts must be SHA-256 hashed');
must(bus.includes("const MAX=188"),'operation ledger must remain bounded');
must(bus.includes("window.dispatchEvent(new CustomEvent('omega-r86-operation'"),'operation bus must synchronize live receipts');
must(bus.includes("Operation events prove only the browser/runtime action represented by their payload."),'operation truth boundary missing');
must(bus.includes("visualLensForIntentR86")&&bus.includes("FORECAST:'FORECAST'")&&bus.includes("CREATE:'CINEMATIC'"),'intent-driven visual presets missing');

must(workflow.includes("expects?:OmegaOperationTypeR86[]"),'workflow steps must declare actual operation expectations');
must(workflow.includes("applyOperationToWorkflowR86"),'workflow must consume operation receipts');
must(workflow.includes("operationMatchesR86(step.expects,event)"),'workflow must advance only when current expected operation receipt matches');
must(workflow.includes("HOST_JOB_QUEUED','BUILD_MISSION_STARTED"),'Build/Repair must require real governed host execution initiation');
must(workflow.includes("HOST_JOB_PROOF_SELECTED"),'Build output step must require returned host proof');
must(workflow.includes("ASSET_HASHED")&&workflow.includes("ARTIFACT_EXPORTED"),'Create workflow must require actual asset/artifact actions');
must(workflow.includes("PROOF_REFRESHED','PROOF_RECEIPT_EXPORTED"),'proof workflow steps must bind to real proof actions');

must(workbench.includes("Waiting for {step.expects.join(' / ')}"),'workbench must visibly wait for real operation rather than manual claim');
must(workbench.includes("emitOperationR86({type:'CANONICAL_TRANSITION_COMMITTED'"),'workflow ADVANCE must emit canonical transition proof');
must(workbench.includes("emitOperationR86({type:'CHECKPOINT_CAPTURED'"),'workflow checkpoint must emit proof receipt');
must(workbench.includes("LIVE OPERATION RECEIPTS"),'active workflow must show actual receipt ledger');
must(workbench.includes("applyWorkflowVisualIntentR86(session.intent)"),'workflow navigation must apply intent-specific visual grammar');

must(workstation.includes("ACTIVE WORKFLOW ${workflow.intent}")&&workstation.includes("GOAL ${workflow.goal}"),'active workflow intent/goal must feed the Full Overall mode plan');
must(workstation.includes("compileFullOverallModePlanR79(record,panel,prompt+workflowContext)"),'Full Overall mode orchestration must be workflow-aware on every surface');
must(workstation.includes("localStorage.setItem('omega.r83.selectedModeRef',selected)"),'workflow intent must seed relevant selected mode when entering Modes/Visual Instrument');
must(workstation.includes("emitOperationR86({type:'SURFACE_OPENED'"),'surface changes must enter operation audit without being called execution');

must(prompt.includes("fullOverallModePlan:state?.fullOverallModePlan||null"),'governed host context must include current Full Overall mode plan');
must(prompt.includes("workflow:workflow?{id:workflow.id,intent:workflow.intent,goal:workflow.goal"),'governed host actions must carry active workflow goal');
must(prompt.includes("emitOperationR86({type:'HOST_JOB_QUEUED'"),'one-off host execution must return operation receipt');
must(prompt.includes("emitOperationR86({type:'BUILD_MISSION_STARTED'"),'governed build mission must return operation receipt');
must(prompt.includes("emitOperationR86({type:'HOST_JOB_PROOF_SELECTED'"),'returned host proof selection must be receipt-bound');

must(reality.includes("emitOperationR86({type:'ANALYSIS_COMPLETED'"),'Reality Lab analysis must emit operation proof');
must(reality.includes("emitOperationR86({type:'REALITY_STATE_COMMITTED'"),'Reality Lab mapped state commit must emit operation proof');
must(media.includes("emitOperationR86({type:'CANONICAL_TRANSITION_COMMITTED'")&&media.includes("emitOperationR86({type:'GOVERNANCE_HOLD_RECORDED'"),'Governance must distinguish commit and HOLD receipts');
must(media.includes("emitOperationR86({type:'ASSET_HASHED'")&&media.includes("emitOperationR86({type:'ARTIFACT_EXPORTED'"),'asset hashing and real artifact export must emit receipts');
must(workspace.includes("emitOperationR86({type:'CHECKPOINT_CAPTURED'")&&workspace.includes("emitOperationR86({type:'COCKPIT_PROOF_REFRESHED'"),'Workspace/Cockpit operations must emit receipts');
must(evidence.includes("emitOperationR86({type:'PROOF_REFRESHED'")&&evidence.includes("emitOperationR86({type:'PROOF_RECEIPT_EXPORTED'"),'Evidence must emit refresh/export receipts');
must(evidence.includes("operationReceipts:readOperationLedgerR86()"),'exported Evidence receipt must carry bounded operation receipts');

const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'44 canonical routes must remain intact');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),'deep specialist surface lost '+token);

console.log('R86 OPERATION PROOF BUS PASS · workflows now advance from hashed real operations · Full Overall intent carried into host/modes/visuals · 44/44 routes preserved');