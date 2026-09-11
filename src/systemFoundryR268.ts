export type OmegaLayer='STATE'|'INTELLIGENCE'|'MEMORY'|'RELATION'|'COMPUTATION'|'ACTION'|'OBSERVATION'|'PROOF';
export type ExecutorClass='BROWSER'|'CLOUD'|'DEVICE'|'EXTERNAL';
export type EvidenceGate='NONE'|'AUTH_REQUIRED'|'DEVICE_PROOF_REQUIRED'|'EXTERNAL_DEGRADED';
export type AuthorityId='SOVEREIGN_CANON'|'SOURCE'|'DEPLOYMENT'|'RUNTIME'|'DEVICE'|'CANONSTATE_ADMISSION'|'R147_DISPATCH';

export interface CapabilityDescriptor{
 id:string;label:string;layer:OmegaLayer;inputs:string[];outputs:string[];operators:string[];
 allowedExecutors:ExecutorClass[];evidence:EvidenceGate[];sideEffect:boolean;authority?:AuthorityId;
 cost:number;latency:number;dependsOn?:string[];
}
export interface LensDescriptor{id:string;label:string;reads:string[];purpose:string}
export interface SystemGenome{
 id:string;version:string;label:string;purpose:string;
 capabilities:string[];goals:string[];lenses:LensDescriptor[];
 evolution:{objectives:string[];maxMutationCandidates:1};
}
export interface FoundryContext{authenticatedDeviceHeartbeat:boolean;externalBindings:boolean;preferredExecutor?:ExecutorClass}
export interface CompiledCapability extends CapabilityDescriptor{status:'ACTIVE'|'BLOCKED';executor:ExecutorClass|null;blockers:string[]}
export interface CompiledSystemPlan{
 genomeId:string;genomeVersion:string;fingerprint:string;activeFrontier:CompiledCapability[];dormantCapabilities:number;
 operatorDag:{operator:string;consumers:string[];reuse:number}[];proofObligations:string[];blockers:string[];
 lenses:LensDescriptor[];estimatedCost:number;estimatedLatency:number;authority:typeof FOUNDRY_AUTHORITY_R268;
}

export const FOUNDRY_AUTHORITY_R268={
 sovereignCanon:'Drive release pointer / accepted sovereign lineage remains independently governed',
 source:'exact Git commit SHA',deployment:'.github/workflows/ci.yml only',runtime:'exact deployed SHA + live acceptance + receipt',
 device:'current authenticated heartbeat only',canonStateAdmission:'R125 only',
 preserved:['R141 exact-return closure','R146 history','R179 explicit authorization','R147 dispatch','R205 immutable executor semantics','R239 resource governance','R240 exact-head promotion','R243 Woven planning/execution-motion truth boundary']
} as const;

const C=(x:CapabilityDescriptor)=>x;
export const FOUNDRY_CAPABILITIES_R268:CapabilityDescriptor[]=[
 C({id:'state.identity',label:'State identity',layer:'STATE',inputs:['genome'],outputs:['state-identity'],operators:['identity.bind'],allowedExecutors:['BROWSER','CLOUD'],evidence:['NONE'],sideEffect:false,cost:1,latency:1}),
 C({id:'relation.graph',label:'Relational graph',layer:'RELATION',inputs:['state-identity'],outputs:['typed-graph'],operators:['relation.index'],allowedExecutors:['BROWSER','CLOUD'],evidence:['NONE'],sideEffect:false,cost:2,latency:2,dependsOn:['state.identity']}),
 C({id:'continuity.weave',label:'Woven continuity',layer:'MEMORY',inputs:['typed-graph'],outputs:['continuity-carry'],operators:['continuity.partition','continuity.transform','continuity.invariantCarry','continuity.scarCarry','continuity.recontextualize'],allowedExecutors:['BROWSER','CLOUD'],evidence:['NONE'],sideEffect:false,cost:3,latency:3,dependsOn:['relation.graph']}),
 C({id:'compute.plan',label:'Operator DAG planner',layer:'COMPUTATION',inputs:['continuity-carry'],outputs:['operator-plan'],operators:['compute.resolve','compute.dedupe','compute.frontier'],allowedExecutors:['BROWSER','CLOUD'],evidence:['NONE'],sideEffect:false,cost:3,latency:2,dependsOn:['continuity.weave']}),
 C({id:'observe.provenance',label:'Observation provenance',layer:'OBSERVATION',inputs:['operator-plan'],outputs:['observation-ledger'],operators:['observe.bindEvidence'],allowedExecutors:['BROWSER','CLOUD'],evidence:['NONE'],sideEffect:false,cost:2,latency:2,dependsOn:['compute.plan']}),
 C({id:'proof.verify',label:'Proof obligations',layer:'PROOF',inputs:['observation-ledger'],outputs:['proof-state'],operators:['proof.classify','proof.failClosed'],allowedExecutors:['BROWSER','CLOUD'],evidence:['NONE'],sideEffect:false,authority:'CANONSTATE_ADMISSION',cost:2,latency:2,dependsOn:['observe.provenance']}),
 C({id:'intelligence.reason',label:'Typed system reasoning',layer:'INTELLIGENCE',inputs:['typed-graph','proof-state'],outputs:['bounded-recommendation'],operators:['intelligence.route','intelligence.rankResiduals'],allowedExecutors:['CLOUD','EXTERNAL'],evidence:['NONE'],sideEffect:false,cost:4,latency:4,dependsOn:['relation.graph','proof.verify']}),
 C({id:'action.dispatch',label:'Governed action request',layer:'ACTION',inputs:['bounded-recommendation'],outputs:['dispatch-request'],operators:['action.authorize','action.dispatch'],allowedExecutors:['CLOUD','DEVICE'],evidence:['AUTH_REQUIRED'],sideEffect:true,authority:'R147_DISPATCH',cost:3,latency:3,dependsOn:['intelligence.reason']}),
 C({id:'device.compute',label:'Native device assist',layer:'COMPUTATION',inputs:['operator-plan'],outputs:['device-result'],operators:['compute.deviceAssist'],allowedExecutors:['DEVICE'],evidence:['DEVICE_PROOF_REQUIRED'],sideEffect:false,cost:8,latency:2,dependsOn:['compute.plan']}),
 C({id:'external.observe',label:'External source adapter',layer:'OBSERVATION',inputs:['source-request'],outputs:['external-observation'],operators:['observe.external'],allowedExecutors:['EXTERNAL'],evidence:['EXTERNAL_DEGRADED'],sideEffect:false,cost:5,latency:6})
];
const capabilityById=new Map(FOUNDRY_CAPABILITIES_R268.map(c=>[c.id,c]));

function hash(input:string){let h=2166136261;for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
function closure(ids:string[]){const out=new Set<string>();const visit=(id:string)=>{if(out.has(id))return;const c=capabilityById.get(id);if(!c)throw new Error(`Unknown capability ${id}`);out.add(id);for(const d of c.dependsOn||[])visit(d)};ids.forEach(visit);return [...out]}
function chooseExecutor(c:CapabilityDescriptor,ctx:FoundryContext):ExecutorClass|null{
 const viable=c.allowedExecutors.filter(x=>x!=='DEVICE'||ctx.authenticatedDeviceHeartbeat).filter(x=>x!=='EXTERNAL'||ctx.externalBindings);
 if(ctx.preferredExecutor&&viable.includes(ctx.preferredExecutor))return ctx.preferredExecutor;
 return viable[0]||null;
}
export function compileSystemGenomeR268(genome:SystemGenome,ctx:FoundryContext):CompiledSystemPlan{
 const ids=closure(genome.capabilities).sort();
 const active=ids.map(id=>{
  const c=capabilityById.get(id)!;const blockers:string[]=[];
  if(c.sideEffect||c.evidence.includes('AUTH_REQUIRED'))blockers.push('AUTH_REQUIRED');
  if(c.evidence.includes('DEVICE_PROOF_REQUIRED')&&!ctx.authenticatedDeviceHeartbeat)blockers.push('DEVICE_PROOF_REQUIRED');
  if(c.evidence.includes('EXTERNAL_DEGRADED')&&!ctx.externalBindings)blockers.push('EXTERNAL_DEGRADED');
  const executor=chooseExecutor(c,ctx);if(!executor&&!blockers.length)blockers.push('NO_EXECUTOR');
  return {...c,status:blockers.length?'BLOCKED':'ACTIVE',executor:blockers.length?null:executor,blockers} as CompiledCapability;
 });
 const operators=new Map<string,string[]>();for(const c of active)for(const op of c.operators){const rows=operators.get(op)||[];rows.push(c.id);operators.set(op,rows)}
 const operatorDag=[...operators].map(([operator,consumers])=>({operator,consumers,reuse:Math.max(0,consumers.length-1)})).sort((a,b)=>a.operator.localeCompare(b.operator));
 const blockers=active.flatMap(c=>c.blockers.map(b=>`${c.id}:${b}`));
 const proofObligations=[
  'R125 remains sole CanonState admission authority','R141 exact-return closure preserved','R146 history preserved','R179 explicit authorization remains separate from R147 dispatch',
  'R205 executor semantics remain immutable','R239 governs device resource admission','R240 governs exact-head source promotion','R243 keeps planning distinct from execution-motion truth','.github/workflows/ci.yml remains sole production writer'
 ];
 const stable={
  schema:'OMEGA_SYSTEM_GENOME_R277',
  id:genome.id,
  version:genome.version,
  capabilities:ids.map(id=>{const c=capabilityById.get(id)!;return{id:c.id,label:c.label,layer:c.layer,inputs:c.inputs,outputs:c.outputs,operators:c.operators,allowedExecutors:c.allowedExecutors,evidence:c.evidence,sideEffect:c.sideEffect,authority:c.authority||null,cost:c.cost,latency:c.latency,dependsOn:c.dependsOn||[]}}),
  operators:operatorDag.map(x=>[x.operator,x.consumers]),
  lenses:genome.lenses.map(x=>x.id)
 };
 return {genomeId:genome.id,genomeVersion:genome.version,fingerprint:`r277-${hash(JSON.stringify(stable))}`,activeFrontier:active,dormantCapabilities:FOUNDRY_CAPABILITIES_R268.length-active.length,operatorDag,proofObligations,blockers,lenses:genome.lenses,estimatedCost:active.filter(x=>x.status==='ACTIVE').reduce((n,x)=>n+x.cost,0),estimatedLatency:active.filter(x=>x.status==='ACTIVE').reduce((n,x)=>n+x.latency,0),authority:FOUNDRY_AUTHORITY_R268};
}

const lens=(id:string,label:string,reads:string[],purpose:string):LensDescriptor=>({id,label,reads,purpose});
export const SYSTEM_GENOMES_R268:SystemGenome[]=[
 {id:'omega.self',version:'268.0',label:'OMEGA Self Genome',purpose:'Model OMEGA as a governed system assembled from reusable capability primitives without claiming legacy migration is complete.',capabilities:['action.dispatch','device.compute','external.observe'],goals:['self-observe','plan bounded improvements','preserve proof authority'],lenses:[lens('atlas','Atlas',['typed-graph'],'Relational topology'),lens('proof','Proof',['proof-state'],'Admission and evidence'),lens('runtime','Runtime',['operator-plan'],'Placement and frontier')],evolution:{objectives:['correctness','usefulness','latency','resource-efficiency','continuity','observability','UX-quality','proof-strength'],maxMutationCandidates:1}},
 {id:'collections.workbench',version:'1.0',label:'Collections Workbench',purpose:'Consumer/account workflow system with continuous history, calculations, bounded recommendations and governed action requests.',capabilities:['action.dispatch'],goals:['organize accounts','calculate next lawful work','retain history'],lenses:[lens('ledger','Ledger',['typed-graph','continuity-carry'],'Account/history continuity'),lens('workqueue','Work Queue',['bounded-recommendation'],'Prioritized next work'),lens('proof','Proof',['proof-state'],'Decision evidence')],evolution:{objectives:['accuracy','operator efficiency','workflow clarity'],maxMutationCandidates:1}},
 {id:'sar.lab',version:'1.0',label:'SAR Reconstruction Lab',purpose:'Evidence-bound remote-sensing system that keeps acquisition, transforms, reconstruction and provenance distinct.',capabilities:['proof.verify','external.observe','device.compute'],goals:['bind observations','plan reconstruction','surface uncertainty'],lenses:[lens('scene','Scene',['typed-graph'],'Scene/acquisition relations'),lens('field','Field',['operator-plan'],'Computed field representation'),lens('evidence','Evidence',['observation-ledger','proof-state'],'Source/proof boundary')],evolution:{objectives:['registration accuracy','compute efficiency','provenance coverage'],maxMutationCandidates:1}},
 {id:'science.lab',version:'1.0',label:'Scientific Investigation',purpose:'Hypothesis-to-observation system preserving prediction, measurement, residual and revision as distinct roles.',capabilities:['intelligence.reason','external.observe'],goals:['compare hypothesis and observation','rank residuals'],lenses:[lens('hypothesis','Hypothesis',['typed-graph'],'Model relations'),lens('residual','Residual',['bounded-recommendation'],'Contradictions and next tests'),lens('proof','Proof',['proof-state'],'Evidence sufficiency')],evolution:{objectives:['falsifiability','evidence coverage','prediction calibration'],maxMutationCandidates:1}},
 {id:'software.factory',version:'1.0',label:'Software Factory',purpose:'Requirement-to-deployment planning substrate with exact source, proof and promotion boundaries.',capabilities:['action.dispatch'],goals:['resolve residual','produce one bounded candidate','prove exact head'],lenses:[lens('lineage','Lineage',['continuity-carry'],'Commit/candidate history'),lens('pipeline','Pipeline',['operator-plan'],'Build and proof DAG'),lens('receipt','Receipt',['proof-state'],'Promotion evidence')],evolution:{objectives:['reliability','test coverage','deployment latency','rollback safety'],maxMutationCandidates:1}}
];
export const genomeByIdR268=(id:string)=>SYSTEM_GENOMES_R268.find(g=>g.id===id)||SYSTEM_GENOMES_R268[0];
