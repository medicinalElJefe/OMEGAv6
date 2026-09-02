import {evaluateCorpusModes} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';

export type OmegaIntentR78=
 |'GENERAL'|'TRUTH'|'BUILD'|'REPAIR'|'PERFORMANCE'|'FORECAST'|'DESIGN'|'VISUAL'
 |'TRAVERSAL'|'RELATIVITY'|'EARTH'|'BIOLOGY'|'MEMORY'|'GOVERNANCE'|'PROOF'
 |'TRANSLATE'|'CREATE'|'RECURSION'|'SYSTEM'|'ALL_MODES';

export type ModeExecutionStateR78='EXECUTED_EXACT'|'SOURCE_PACKET'|'DERIVED_RUNTIME'|'GATED_MISSING_INPUTS'|'CATALOG_LENS';

export type PlannedModeR78={
 id:string;
 name:string;
 category:string;
 priority:string;
 relevance:number;
 gate:string;
 operator:string;
 state:ModeExecutionStateR78;
 reason:string;
 proof:string;
};

export type FullOverallPlanR78={
 schema:'OMEGA_FULL_OVERALL_MODE_PLAN_R78';
 intent:OmegaIntentR78;
 explicitAllModes:boolean;
 policy:'FULL_REQUESTED'|'INTENT_ADAPTIVE';
 kernel:PlannedModeR78[];
 intentModes:PlannedModeR78[];
 supportModes:PlannedModeR78[];
 backgroundCount:number;
 catalogCount:number;
 sourceBackedApplied:number;
 sourceBackedGated:number;
 truthBoundary:string;
 performance:{
  strategy:'RESIDENT_KERNEL_INTENT_DEEP_BACKGROUND_CATALOG';
  residentKernelCount:number;
  activeDeepCount:number;
  catalogEvaluatedCount:number;
  note:string;
 };
};

const CORE_PATTERNS=[
 /Full Overall Canon/i,/Unified Coherence/i,/Mode 188/i,/Dewey Calculus/i,
 /Relational Skin Calculus/i,/Truth-Only Orientation/i,/No-Nothing Truth/i,
 /Guidance Field/i,/Continuity Field Runtime/i,/Truth Traversal Runtime/i,
 /PRUNE.*TRANSLATE.*PROVE/i,/Evidence/i
];

const PACKS:Record<Exclude<OmegaIntentR78,'GENERAL'|'ALL_MODES'>,RegExp[]>={
 TRUTH:[/Truth/i,/Boundary/i,/Evidence/i,/Proof/i,/Contradiction/i,/Reduction/i,/Canon/i],
 BUILD:[/Build/i,/Construct/i,/Compiler/i,/Runtime/i,/Engine/i,/Project/i,/Create/i,/Authority/i],
 REPAIR:[/Repair/i,/Prune/i,/Contradiction/i,/Failure/i,/Rollback/i,/Validation/i,/Boundary/i,/Continuity/i],
 PERFORMANCE:[/Performance/i,/Compression/i,/Scheduler/i,/Compute/i,/Runtime/i,/Optimization/i,/Efficiency/i,/Kernel/i],
 FORECAST:[/Forecast/i,/Future/i,/Prospective/i,/Plasticity/i,/Guidance/i,/Trajectory/i,/Prediction/i],
 DESIGN:[/Design/i,/Creative/i,/Visual/i,/Render/i,/Geometry/i,/Color/i,/Composition/i,/Shape/i],
 VISUAL:[/Visual/i,/Render/i,/Geometry/i,/Field/i,/Light/i,/Color/i,/Cinematic/i,/Mandala/i,/Sphere/i],
 TRAVERSAL:[/Traversal/i,/Motion/i,/Route/i,/Field/i,/Continuity/i,/Scale/i,/Path/i],
 RELATIVITY:[/Relativity/i,/Observer/i,/Frame/i,/Motion/i,/Parent/i,/Interaction/i,/Woven/i],
 EARTH:[/Earth/i,/Geodes/i,/GIS/i,/Terrain/i,/World/i,/Observer/i,/Evidence/i],
 BIOLOGY:[/Biolog/i,/Human/i,/Cell/i,/Organ/i,/Host/i,/Embod/i,/Life/i],
 MEMORY:[/Memory/i,/Scar/i,/Carry/i,/Continuity/i,/Archive/i,/History/i,/Ledger/i],
 GOVERNANCE:[/Govern/i,/Canon/i,/Authority/i,/Boundary/i,/Admission/i,/Mode 188/i,/Law/i],
 PROOF:[/Proof/i,/Evidence/i,/Validation/i,/Falsif/i,/Audit/i,/Ledger/i,/Truth/i],
 TRANSLATE:[/Translat/i,/Language/i,/Comprehension/i,/Interpret/i,/Semantic/i,/Communication/i],
 CREATE:[/Creative/i,/Create/i,/Construct/i,/Generat/i,/Visual/i,/Render/i,/Design/i],
 RECURSION:[/Recursion/i,/Recursive/i,/Continuity/i,/Loop/i,/Self/i,/Scale/i,/Expansion/i],
 SYSTEM:[/System/i,/Runtime/i,/Kernel/i,/Integration/i,/Consolidation/i,/Scheduler/i,/Authority/i,/Compiler/i]
};

const PANEL_INTENT:Record<string,OmegaIntentR78>={
 'Command Center':'GENERAL','Hybrid Link':'SYSTEM','Workspace':'BUILD','Cockpit':'SYSTEM',
 'Immersive Traversal':'TRAVERSAL','Matter Traversal':'TRAVERSAL','Extreme Traversal':'TRAVERSAL',
 'Visual Instrument':'VISUAL','Relativity':'RELATIVITY','Earth Now':'EARTH','Forecast':'FORECAST',
 'Atlas':'SYSTEM','Traversal':'TRAVERSAL','Create':'CREATE','Field':'VISUAL','Data Motion':'TRAVERSAL',
 'Reality Lab':'TRUTH','Atlas Calculator':'SYSTEM','Infinity':'RECURSION','Convergence':'GOVERNANCE',
 'Quality Compiler':'PROOF','Build Out':'BUILD','Projects':'BUILD','Render Queue':'DESIGN','Assets':'DESIGN',
 'Modes':'SYSTEM','Kernel Intelligence':'SYSTEM','Evidence & Proof':'PROOF','Memory':'MEMORY',
 'Archive Census':'MEMORY','Archive Operators':'MEMORY','Development':'BUILD','Canon Evolution':'GOVERNANCE',
 'SAI Lab':'SYSTEM','Governance':'GOVERNANCE','Consolidation':'SYSTEM','Instructions':'TRANSLATE',
 'Plugins':'SYSTEM','Settings':'SYSTEM','System':'SYSTEM','Validation':'PROOF','System Atlas':'SYSTEM',
 'Scale Compiler':'RECURSION','Control Matrix':'GOVERNANCE'
};

const INTENT_PATTERNS:Array<[OmegaIntentR78,RegExp]>= [
 ['ALL_MODES',/\bALL[\s_-]*MODES\b|FULL\s+OVERALL\s+MODES?/i],
 ['REPAIR',/\bfix\b|\brepair\b|\bdebug\b|\bbroken\b|\bregression\b|\brollback\b/i],
 ['PERFORMANCE',/\bperformance\b|\boptimi[sz]e\b|\bfaster\b|\blatency\b|\bfps\b|\bbottleneck\b/i],
 ['PROOF',/\bprove\b|\bproof\b|\bevidence\b|\bverify\b|\bvalidation\b|\btruth\b/i],
 ['FORECAST',/\bforecast\b|\bpredict\b|\bfuture\b|\bprospective\b/i],
 ['DESIGN',/\bdesign\b|\bstyle\b|\baesthetic\b|\binterface\b|\bui\b|\bux\b/i],
 ['VISUAL',/\brender\b|\bvisual\b|\bimage\b|\bdisplay\b|\bfield view\b/i],
 ['TRAVERSAL',/\btravers\w*\b|\bmotion\b|\broute\b|\bzoom\b|\bscale\b/i],
 ['RELATIVITY',/\brelativ\w*\b|\bobserver\b|\bframe\b/i],
 ['EARTH',/\bearth\b|\bgis\b|\bsatellite\b|\bterrain\b|\bgeodes/i],
 ['BIOLOGY',/\bbiolog\w*\b|\bcell\b|\borgan\b|\bhuman\b|\bmolecule\b/i],
 ['MEMORY',/\bmemory\b|\barchive\b|\bhistory\b|\bscar\b|\bcontinuity\b/i],
 ['GOVERNANCE',/\bgovern\w*\b|\bcanon\b|\bauthority\b|\badmission\b/i],
 ['TRANSLATE',/\btranslate\b|\bplain language\b|\bexplain\b|\binterpret\b/i],
 ['CREATE',/\bcreate\b|\bmake\b|\bgenerate\b|\bcompose\b/i],
 ['RECURSION',/\brecurs\w*\b|\bself[- ]?(build|develop|organize)\b/i],
 ['BUILD',/\bbuild\b|\bdevelop\b|\bsoftware\b|\bcode\b|\bimplement\b/i],
 ['SYSTEM',/\bsystem\b|\bruntime\b|\bkernel\b|\bintegration\b/i]
];

const clamp01=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));

function inferIntent(panel:string,text:string):OmegaIntentR78{
 const t=String(text||'');
 for(const [intent,re] of INTENT_PATTERNS)if(re.test(t))return intent;
 return PANEL_INTENT[panel]||'GENERAL';
}

function regexScore(text:string,patterns:RegExp[]){
 let hits=0;
 for(const re of patterns)if(re.test(text))hits++;
 return patterns.length?hits/patterns.length:0;
}

function sourceState(summary:ReturnType<typeof sourceBackedModeSummary>,name:string):ModeExecutionStateR78{
 const row=summary.rows.find(x=>x.name.toLowerCase()===name.toLowerCase());
 return row?.state||'CATALOG_LENS';
}

function planRow(row:any,summary:ReturnType<typeof sourceBackedModeSummary>,relevance:number,reason:string):PlannedModeR78{
 return{
  id:String(row.id),
  name:String(row.name),
  category:String(row.category||''),
  priority:String(row.priority||row.all_modes_priority||'extension'),
  relevance:clamp01(relevance),
  gate:String(row.gate||'TURN'),
  operator:String(row.operator||''),
  state:sourceState(summary,String(row.name)),
  reason,
  proof:String(row.proof||'')
 };
}

export function compileFullOverallModePlanR78(record:any,panel:string,text=''):FullOverallPlanR78{
 const catalog=evaluateCorpusModes(record);
 const summary=sourceBackedModeSummary(record);
 const intent=inferIntent(panel,text);
 const explicitAllModes=intent==='ALL_MODES';
 const patterns=explicitAllModes?[]:(intent==='GENERAL'?[/Unified/i,/Continuity/i,/Guidance/i,/Comprehension/i,/Truth/i]:(PACKS[intent as Exclude<OmegaIntentR78,'GENERAL'|'ALL_MODES'>]||[]));

 const ranked=catalog.results.map((row:any)=>{
  const hay=`${row.name} ${row.category} ${row.operator} ${row.algebra} ${row.calculus} ${row.purpose||''} ${row.dimensionFrame||''} ${row.notes||''}`;
  const core=CORE_PATTERNS.some(re=>re.test(hay));
  const intentMatch=explicitAllModes?1:regexScore(hay,patterns);
  const priorityBoost=row.priority==='kernel'?.24:row.priority==='core'?.18:row.priority==='support'?.08:0;
  const relevance=clamp01(.34*Number(row.score||0)+.46*intentMatch+priorityBoost);
  return{row,core,intentMatch,relevance};
 }).sort((a,b)=>b.relevance-a.relevance);

 const kernel=ranked.filter(x=>x.core).slice(0,18).map(x=>planRow(x.row,summary,Math.max(.72,x.relevance),'always-on canon / truth / admissibility kernel'));
 const kernelIds=new Set(kernel.map(x=>x.id));
 const intentLimit=explicitAllModes?Math.min(96,catalog.count):22;
 const intentModes=ranked.filter(x=>!kernelIds.has(String(x.row.id))&&(explicitAllModes||x.intentMatch>0))
  .slice(0,intentLimit).map(x=>planRow(x.row,summary,x.relevance,explicitAllModes?'explicit ALL MODES request':'intent/design relevance'));
 const selected=new Set([...kernel,...intentModes].map(x=>x.id));
 const supportModes=ranked.filter(x=>!selected.has(String(x.row.id))).slice(0,explicitAllModes?Math.max(0,catalog.count-selected.size):12)
  .map(x=>planRow(x.row,summary,x.relevance,explicitAllModes?'remaining full-registry lens':'highest-value supporting lens'));
 const deepCount=kernel.length+intentModes.length+supportModes.length;

 return{
  schema:'OMEGA_FULL_OVERALL_MODE_PLAN_R78',
  intent,
  explicitAllModes,
  policy:explicitAllModes?'FULL_REQUESTED':'INTENT_ADAPTIVE',
  kernel,intentModes,supportModes,
  backgroundCount:Math.max(0,catalog.count-deepCount),
  catalogCount:catalog.count,
  sourceBackedApplied:summary.appliedCount,
  sourceBackedGated:summary.gatedCount,
  truthBoundary:'Mode selection is orchestration, not proof. Source-backed operators execute only when authoritative inputs exist; gated formulas stay gated; registry lenses guide routing/design without being mislabeled as executed computation.',
  performance:{
   strategy:'RESIDENT_KERNEL_INTENT_DEEP_BACKGROUND_CATALOG',
   residentKernelCount:kernel.length,
   activeDeepCount:deepCount,
   catalogEvaluatedCount:catalog.count,
   note:'Keep the shared state/canon kernel resident, deepen only relevant intent/design lenses, retain the entire catalog as evaluated metadata, and never trade proof/admissibility for frame rate.'
  }
 };
}

export function compactModePlanR78(plan:FullOverallPlanR78){
 return{
  schema:plan.schema,
  intent:plan.intent,
  policy:plan.policy,
  explicitAllModes:plan.explicitAllModes,
  catalogCount:plan.catalogCount,
  kernel:plan.kernel.map(x=>({id:x.id,name:x.name,state:x.state,relevance:x.relevance,gate:x.gate})),
  intentModes:plan.intentModes.map(x=>({id:x.id,name:x.name,state:x.state,relevance:x.relevance,gate:x.gate})),
  supportModes:plan.supportModes.slice(0,12).map(x=>({id:x.id,name:x.name,state:x.state,relevance:x.relevance,gate:x.gate})),
  backgroundCount:plan.backgroundCount,
  sourceBackedApplied:plan.sourceBackedApplied,
  sourceBackedGated:plan.sourceBackedGated,
  truthBoundary:plan.truthBoundary,
  performance:plan.performance
 };
}
