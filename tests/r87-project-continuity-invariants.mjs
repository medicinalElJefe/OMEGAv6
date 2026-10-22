import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R87 '+msg)};
const project=read('src/omegaProjectContinuityR87.ts');
const workflow=read('src/omegaWorkflowRuntimeR85.ts');
const workbench=read('src/OmegaIntentWorkbenchR85.tsx');
const media=read('src/OmegaGovernanceProjectMediaR29.tsx');
const prompt=read('src/PromptOrchestrator.tsx');
const evidence=read('src/OmegaEvidenceMemoryR28.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const opbus=read('src/omegaOperationBusR86.ts');
const living=read('src/OmegaR36LivingSurfaces.tsx');

must(project.includes("const PROJECT_KEY='omega.v6.projects.r29'"),'project continuity must extend the existing Projects authority rather than a shadow store');
must(project.includes("const ACTIVE_KEY='omega.r87.activeProject'"),'active project pointer missing');
must(project.includes("crypto.subtle.digest('SHA-256'"),'project continuity hashes must be SHA-256');
must(project.includes("workflowRefs?:ProjectWorkflowRefR87[]")&&project.includes("operationRefs?:ProjectOperationRefR87[]"),'project must bind both workflows and operation receipts');
must(project.includes("operationRefs:p.operationRefs||[]")&&project.includes("workflowRefs:p.workflowRefs||[]"),'continuity hash must cover workflow and operation linkage');
must(project.includes("ops.slice(-188)"),'project operation history must stay bounded');
must(project.includes("Project continuity is browser-local organization"),'project truth boundary missing');

must(workflow.includes("projectId?:string"),'workflow sessions must carry project binding');
must(workflow.includes("startWorkflowR85(intent:WorkflowIntentR85,goal:string,record:any,projectId?:string)"),'workflow start must accept project binding');
must(workflow.includes("projectId,status:'ACTIVE'"),'workflow session must persist project id');

must(workbench.includes("readProjectsR87")&&workbench.includes("projectChoice"),'Home workflow engine must expose project continuity selection');
must(workbench.includes("<option value='NEW'>New project from this goal</option>"),'new project path missing');
must(workbench.includes("createProjectR87(goal,intent,record)"),'new workflow must be able to create project continuity');
must(workbench.includes("attachWorkflowToProjectR87(project.id,s)"),'workflow must attach to chosen project');
must(workbench.includes("recordProjectOperationR87(prev.projectId,event)"),'operation receipts must flow into active project');
must(workbench.includes("updateProjectWorkflowR87(next.projectId,next,'COMPLETE')"),'completed workflow must update project state');
must(workbench.includes("PROJECT {activeProject?.name||'UNBOUND'}"),'active project must be visible in workflow UI');
must(workbench.includes("activeProject?.name||'unbound project'"),'project identity must persist in cross-surface workflow strip');

must(media.includes("workflowRefs?:Array")&&media.includes("operationRefs?:Array"),'Projects UI must understand R87 continuity fields');
must(media.includes("ACTIVE CONTINUITY"),'Projects UI must visibly mark active project');
must(media.includes("setActiveProjectR87(x.id)"),'Projects UI must let operator switch active project');
must(media.includes("x.workflowRefs?.length||0")&&media.includes("x.operationRefs?.length||0"),'Projects UI must expose workflow/operation depth');
must(media.includes("x.continuityHash||x.sha256"),'Projects UI must expose continuity hash');
must(media.includes("setActiveProjectR87('')"),'deleting active local project must clear active pointer');

must(prompt.includes("projectContinuitySummaryR87(getProjectR87(workflow?.projectId))"),'governed SAI/host context must include project continuity');
must(prompt.includes("projectId:workflow.projectId||null"),'workflow host context must preserve project id');
must(prompt.includes("project,metrics:"),'project summary must enter governed host state context');

must(evidence.includes("projectContinuity=projectContinuitySummaryR87"),'Evidence must resolve active project continuity');
must(evidence.includes("projectContinuity,operationReceipts:"),'proof export must bind project continuity and operation receipts');
must(evidence.includes("<span>Project</span>"),'Evidence UI must show project continuity');
must(evidence.includes("projectContinuity.operations"),'Evidence UI must expose project operation count');

must(opbus.includes("const MAX=188"),'R86 operation receipt boundary must remain');
const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(routes.length===44&&new Set(routes).size===44,'R87 must preserve 44 canonical routes');
for(const token of ["view==='DEEP'&&<MatterTraversal","view==='DEEP'&&<OmegaVisualInstrument","view==='DEEP'&&<OmegaTraversalStudio"])must(living.includes(token),'deep specialist surface lost '+token);

console.log('R87 PROJECT CONTINUITY PASS · workflows + hashed operations bind to real Projects · host/proof context carries project · 44/44 routes preserved');