import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R85 '+msg)};
const runtime=read('src/omegaWorkflowRuntimeR85.ts');
const workbench=read('src/OmegaIntentWorkbenchR85.tsx');
const css=read('src/omegaIntentWorkbenchR85.css');
const home=read('src/OmegaHomeR71.tsx');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const evidence=read('src/OmegaEvidenceMemoryR28.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const governance=read('src/OmegaGovernanceProjectMediaR29.tsx');
const living=read('src/OmegaR36LivingSurfaces.tsx');

for(const intent of ['EXPLORE','ANALYZE','FORECAST','BUILD','REPAIR','PROVE','CREATE','CONNECT'])must(runtime.includes(`{id:'${intent}'`),`intent missing ${intent}`);
must(runtime.includes("compileFullOverallModePlanR79(record,meta.anchorPanel"),'workflow must compile existing Full Overall mode plan from current state and intent');
must(runtime.includes("compactModePlanR79"),'workflow must retain bounded mode-plan receipt');
must(runtime.includes("kind:'ADVANCE'")&&runtime.includes("kind:'CHECKPOINT'")&&runtime.includes("kind:'VERIFY'"),'workflow engine must perform state action/checkpoint/verification, not only route listing');
must(runtime.includes("writeWorkflowR85")&&runtime.includes("omega-r85-workflow-changed"),'workflow state must persist and synchronize across surfaces');
must(runtime.includes("status:'ACTIVE'|'COMPLETE'|'CANCELLED'"),'workflow lifecycle must be explicit');
must(runtime.includes("truthBoundary:'Workflow execution coordinates existing OMEGA tools"),'workflow execution truth boundary missing');

const registered=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
const workflowRoutes=[...runtime.matchAll(/route:'([^']+)'/g)].map(x=>x[1]);
for(const route of workflowRoutes)must(registered.includes(route),`workflow targets non-canonical route ${route}`);
must(new Set(registered).size===44&&registered.length===44,'R85 must preserve 44 canonical application routes');

must(workbench.includes("onAddress(nextAddress)"),'ADVANCE action must actually commit the admitted canonical candidate');
must(workbench.includes("localState.write('omega.r18.workspace.snapshots'"),'CHECKPOINT action must actually write a replayable Workspace snapshot');
must(workbench.includes("crypto.subtle.digest('SHA-256'"),'checkpoint must hash canonical packet content');
must(workbench.includes("step.route&&currentPanel!==step.route")&&workbench.includes("Complete this step"),'OPEN/VERIFY steps must require entering the actual tool and explicit completion rather than auto-claiming success');
must(workbench.includes("nextAddress===null?'No admitted candidate'"),'missing admitted transition must stay visibly gated');
must(workbench.includes("Start workflow")&&workbench.includes("Operational workflow engine"),'Home workbench must be an executable workflow surface, not an inventory title');
must(workbench.includes("variant==='STRIP'"),'active workflow must continue across workstation applications');

must(home.includes("<OmegaIntentWorkbenchR85 record={record} address={address} currentPanel='Home'"),'Home must mount the operational workflow engine');
must(workstation.includes("<OmegaIntentWorkbenchR85 variant='STRIP'"),'every workstation surface must receive active workflow continuity');
must(workstation.indexOf("<OmegaIntentWorkbenchR85 variant='STRIP'")<workstation.indexOf("<SurfaceIntegrityR81 panel={panel}"),'workflow strip must sit inside normal document flow before the active surface, not cover it');

must(evidence.includes("readWorkflowR85")&&evidence.includes("workflow:workflow?"),'Evidence & Proof must include active workflow state in exported proof receipt');
must(evidence.includes("Workflow state is browser-local coordination evidence. It does not prove external/native execution."),'workflow proof must not inflate local coordination into external execution');
must(evidence.includes("ACTIVE OPERATIONAL WORKFLOW"),'Evidence surface must make active workflow proof context visible');

must(css.includes("@media(max-width:900px)")&&css.includes(".r85-active-grid{grid-template-columns:1fr}"),'workflow engine needs dedicated mobile layout');
must(css.includes(".r85-workflow-strip{position:relative"),'workflow strip must remain document-contained, not fixed overlay');
must(!css.includes(".r85-workflow-strip{position:fixed"),'workflow strip may not overlap mobile/desktop surfaces');

must(governance.includes("Admit and commit candidate")&&governance.includes("onAddress(candidate.address)"),'existing governance transition executor must remain intact');
must(governance.includes("Queue SVG")&&governance.includes("Queue PNG")&&governance.includes("BROWSER_LOCAL_HASHED_ASSET"),'existing real asset hashing and artifact generation must remain intact');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),`deep specialist surface lost ${token}`);

console.log('R85 INTENT WORKFLOW ENGINE PASS · 8 executable intents · canonical transition + checkpoint + proof continuity · 44/44 routes preserved · mobile/desktop contained');