import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R108 '+msg)};

const runtime=read('src/ultimateCapabilityRuntimeR108.ts');
const membrane=read('src/UltimateCapabilityMembraneR108.tsx');
const css=read('src/ultimateCapabilityMembraneR108.css');
const workflow=read('src/omegaWorkflowRuntimeR85.ts');
const workbench=read('src/OmegaIntentWorkbenchR85.tsx');
const accepted=read('src/acceptedProductionContractR95.ts');
const source=read('src/sourceCorpusCorrelationR107.ts');
const router=read('src/federation/federationIntentRouterR103.js');
const packageJson=read('package.json');

// One compiler correlates existing authorities; it must not become a shadow router/state owner.
must(runtime.includes("schema:'OMEGA_ULTIMATE_CAPABILITY_MEMBRANE_R108'"),'capability plan schema missing');
must(runtime.includes("from './modeExecutionFabricR107'")&&runtime.includes("from './sourceCorpusCorrelationR107'")&&runtime.includes("from './federation/federationIntentRouterR103.js'"),'R107/R103 authority reuse missing');
must(!runtime.includes("from './omegaWorkflowRuntimeR85'"),'R108 compiler must remain independent of workflow runtime to avoid authority/cycle coupling');
must(runtime.includes("correlationOrder:ULTIMATE_DEVELOPMENT_FABRIC_R107.correlationOrder"),'accepted source→admission correlation order missing');
must(runtime.includes("physicalDimensionClaim:false"),'representational scale truth boundary missing');
must(runtime.includes("statusObserved:federationStatusKnown")&&runtime.includes("'STATUS_NOT_OBSERVED'"),'federation readiness must distinguish topology from current status observation');
must(!runtime.includes('Math.random'),'R108 capability compiler must be deterministic');

// Every recovered capability stays available, while only a minimum contextual set is required/supporting.
for(let i=1;i<=18;i++)must(runtime.includes(`CAP-${String(i).padStart(3,'0')}`),'recovered master capability not represented CAP-'+String(i).padStart(3,'0'));
for(const intent of ['EXPLORE','ANALYZE','FORECAST','BUILD','REPAIR','PROVE','CREATE','CONNECT'])must(runtime.includes(`${intent}:[`),'workflow intent mapping missing '+intent);
must(runtime.includes("CapabilityStateR108='REQUIRED'|'SUPPORTING'|'AVAILABLE'"),'required/supporting/available distinction missing');
must(runtime.includes("available:MASTER_CAPABILITIES_R83.length-required.length-supporting.length"),'complete recovered capability accounting missing');
must(runtime.includes('minimum required capability graph'),'runtime boundary must express minimum lawful graph');

// Drive/source, calculus/modes, eight layers, systems, menu controls, routes, federation and proof are all correlated.
for(const token of ['SOURCE_CORPUS_AUTHORITIES_R107','surfaceModeFabricR107','MASTER_CAPABILITIES_R83','MASTER_MENU_OPTIONS_R83','MASTER_SYSTEMS_R83','routeForCapabilityR83','proofGates','sourceGates','planIntentR103'])must(runtime.includes(token),'correlation input missing '+token);
for(const id of ['ONE_SYSTEM_MENU_LEDGER','J_DRIVE_AUTOPING_LEDGER','FULL_SOFTWARE_UNIVERSE','DEWEY_20736_CALCULUS','DEWEY_248832_SCALE_ATLAS','SCIENTIFIC_VALIDATION_BRIDGE','FOUR_NODE_CLOUD_FABRIC'])must(source.includes(id),'R107 source authority lost '+id);
must(source.includes('resident:20736')&&source.includes('expanded:248832')&&source.includes('virtualAddressCapacity:61917364224'),'scale/address hierarchy missing');
must(router.includes("schema:'OMEGA_FEDERATION_INTENT_PLAN_R103'"),'R103 federation router authority lost');

// Workflow continuity stores the R108 plan additively while keeping the established R85 schema.
must(workflow.includes("schema:'OMEGA_INTENT_WORKFLOW_R85'"),'R85 workflow schema changed');
must(workflow.includes("import {compileUltimateCapabilityPlanR108} from './ultimateCapabilityRuntimeR108'"),'workflow does not compile R108 capability plan');
must(workflow.includes('capabilityPlan?:any')&&workflow.includes('modePlan:plan,capabilityPlan'),'capability plan not persisted in workflow session');
must(workflow.includes('R108 ${capabilityPlan.capabilityCounts.required}/${capabilityPlan.capabilityCounts.total} capabilities required'),'workflow history lacks capability correlation receipt');

// Operator experience exposes the membrane before and during a workflow, with compact continuity on all active surfaces.
must(workbench.includes("import UltimateCapabilityMembraneR108 from './UltimateCapabilityMembraneR108'"),'workbench membrane import missing');
must((workbench.match(/<UltimateCapabilityMembraneR108/g)||[]).length>=2,'prospective + active capability membrane mounts required');
must(workbench.includes("data-capability-fabric='R108'")&&workbench.includes('R108 {capabilitySummary?.required}/{capabilitySummary?.total} capabilities'),'workflow continuity summary missing');
must(workbench.includes('INTENT → SOURCE → CALCULUS → MODES → CAPABILITY → ACTION → PROOF'),'operator correlation grammar missing');
must(membrane.includes('Drive + source authority')&&membrane.includes('Calculus + all-mode composition')&&membrane.includes('Capability graph')&&membrane.includes('Cloud / native capability path')&&membrane.includes('Proof / admission membrane'),'membrane correlation sections incomplete');
must(membrane.includes("['STATE','INTELLIGENCE','MEMORY','RELATION','COMPUTATION','ACTION','OBSERVATION','PROOF']"),'eight functional layers not visible');
must(membrane.includes("extends the R103 task router; no second federation authority"),'federation authority boundary missing');

// Membrane stays progressive, responsive and outside the primary visualization. Pseudo-element arrows may use absolute positioning; the membrane containers may not.
must(membrane.includes("<details className={'r108-capability-membrane ")&&membrane.includes("compact?'compact':''"),'progressive disclosure missing');
must(css.includes('@media(max-width:900px)'),'mobile containment missing');
must(!/\.r108-capability-membrane\{[^}]*position:(?:fixed|absolute)/.test(css)&&!/\.r108-body\{[^}]*position:(?:fixed|absolute)/.test(css),'capability membrane container may not overlay the primary visual stage');

// Persistent product law makes capability inflation and shadow routing regressions.
for(const rule of ['MINIMUM_LAWFUL_CAPABILITY_SET','ULTIMATE_CAPABILITY_MEMBRANE'])must(accepted.includes("id:'"+rule+"'"),'accepted production contract missing '+rule);
must(accepted.includes('R108 ultimate capability membrane + minimum-lawful workflow capability authority'),'R108 preservation lineage missing');
must(packageJson.includes('test:r108'),'R108 release gate missing from package scripts');

console.log('R108 ULTIMATE CAPABILITY MEMBRANE PASS · 18 recovered capabilities contextualized · R107 calculus/source fabric reused · R103 federation router reused · R85 workflow persistence · 8-layer + Drive/cloud/proof correlation · no shadow state/router/overlay');
