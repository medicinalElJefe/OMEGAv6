import {ALL_MODES_BOUNDARY,CANON_AUTHORITY_COUNT,CANON_AUTHORITY_STACK,evaluateCanonAuthorityStack} from './allModesAuthority';
import {R21_MODE_AUTHORITY,sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {ULTIMATE_DEVELOPMENT_FABRIC_R107,SOURCE_CORPUS_AUTHORITIES_R107} from './sourceCorpusCorrelationR107';
import {R123_LAWS,deviceTier,inferIntent,normalizeMetrics,omegaDecision,renderBudget,type LivingMetricPacket,type OmegaDeviceTier,type OmegaProjection} from './livingOmegaRuntimeR123';
import {R124_SELF_BUILD_LAWS} from './selfBuildRuntimeR124';
import {R125_LAWS as R125_ACCURACY_LAWS} from './accuracyResidualEngineR125';

export const R126_RUNTIME='OMEGA_R126_TOTAL_MAXIMUM_BUILD' as const;
export const R126_RELEASE='R126' as const;

export const R126_HIERARCHY={seed:1,organs:12,branches:144,cells:1728,lanes:20736} as const;
export const R126_SCALE_ATLAS={residentStates:20736,representationStates:248832,virtualAddressCapacity:61917364224,physicalDimensionClaim:false} as const;
export const R126_PROJECTIONS:readonly OmegaProjection[]=['FIELD','MATTER','TRAVERSAL','FORECAST','RELATIVITY','INFINITY','SCALE','CONVERGENCE','EARTH','OPTICAL','PROOF','BUILD'];
export const R126_SCOPES=['BODY','ORGAN','BRANCH','CELL'] as const;
export const R126_EXECUTION_STAGES=['PROPOSE','SCREEN','EXECUTE','VERIFY','RENDER','ADMIT'] as const;

export const R126_SYSTEM_FAMILIES=[
 'CANONICAL_RUNTIME','MODE_CALCULUS','FIELD_VISUALIZATION','MATTER_TRAVERSAL','DIMENSIONAL_RELATIVITY','FORECAST_TRAJECTORY',
 'EARTH_EVIDENCE','OPTICAL_MATERIAL','SOVEREIGN_COMPUTE','HYBRID_LINK','FEDERATION','GENESIS_PROPOSAL','PROOF_GOVERNANCE',
 'EVIDENCE_MEMORY','ARCHIVE_DONOR_MEMORY','SELF_BUILD','ACCURACY_RESIDUAL','AUTONOMIC_SWARM','ORGANISM_SWARM','DIRECT_SWARM',
 'UNIVERSAL_DATA','AUDIO_LIGHT_SPECTRUM','ECO_BIO_LIFE','OPERATOR_INTERFACE'
] as const;

export type R126ModePolicy='ALL'|'RELEVANT'|'EXPLICIT';
export type R126ScalePolicy='AUTO'|'SOLO'|'FLOCK'|'TREE'|'PIPELINE'|'CONSENSUS'|'MIRROR'|'FULL';
export type R126Scope={type:'BODY'|'ORGAN'|'BRANCH'|'CELL';domain?:number;phase?:number;regulation?:number};
export type R126TruthState='LIVE'|'READY'|'DEGRADED'|'UNAVAILABLE'|'UNPROVEN';
export type R126EvidencePacket={id:string;summary:string;authority?:string;source?:string};
export type R126CompileInput={
 intent:string;
 record?:any;
 width?:number;
 nativePc?:boolean;
 metrics?:Partial<LivingMetricPacket>;
 modePolicy?:R126ModePolicy;
 explicitCanonIds?:number[];
 requestedProjection?:OmegaProjection;
 scalePolicy?:R126ScalePolicy;
 requestedCells?:number;
 allowFullAuto?:boolean;
 scope?:R126Scope;
 providerBudget?:number;
 genesisBudget?:number;
 opticalBudget?:number;
 evidence?:R126EvidencePacket[];
 constraints?:string[];
 accuracyTarget?:number;
};

const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const unique=<T,>(xs:T[])=>[...new Set(xs)];
const sanitizeScope=(scope:R126Scope|undefined):R126Scope=>{
 const s=scope??{type:'BODY'};
 const out:R126Scope={type:s.type};
 if(s.type!=='BODY')out.domain=Math.floor(clamp(Number(s.domain??0),0,11));
 if(s.type==='BRANCH'||s.type==='CELL')out.phase=Math.floor(clamp(Number(s.phase??0),0,11));
 if(s.type==='CELL')out.regulation=Math.floor(clamp(Number(s.regulation??0),0,11));
 return out;
};

function autoCells(decision:'STAY'|'TURN'|'ESCALATE'){return decision==='STAY'?24:decision==='TURN'?144:288}
function policyCells(input:R126CompileInput,decision:'STAY'|'TURN'|'ESCALATE',scope:R126Scope){
 if(scope.type==='ORGAN')return 144;
 if(scope.type==='BRANCH')return 12;
 if(scope.type==='CELL')return 1;
 if(input.scalePolicy==='FULL')return 1728;
 const requested=Math.floor(clamp(Number(input.requestedCells??autoCells(decision)),1,1728));
 if(input.allowFullAuto===true)return requested;
 return Math.min(requested,autoCells(decision));
}

function relevantCanonIds(intent:string,projection:OmegaProjection){
 const t=`${intent} ${projection}`.toLowerCase();
 const hits=CANON_AUTHORITY_STACK.filter(x=>{
  const n=x.name.toLowerCase();
  if(/proof|truth|evidence|verify|audit/.test(t))return /truth|science|admission|ledger|governance|boundary/.test(n);
  if(/forecast|future|trajectory/.test(t))return /forecast|future|plasticity|guidance|phase/.test(n);
  if(/optical|light|material|rcwa|fdtd/.test(t))return /geometry|relativity|color|sphere|atlas|science|proof/.test(n);
  if(/earth|terrain|satellite|weather/.test(t))return /sphere|atlas|relativity|forecast|evidence|truth/.test(n);
  if(/build|code|repair|deploy|software/.test(t))return /runtime|control|patch|deployment|recovery|packaging|truth|governance/.test(n);
  if(/music|sound|audio|language/.test(t))return /sound|music|language|interpreter|color|geometry/.test(n);
  return /overall canon|unified coherence|mode 188|guidance|sphere|relativity|prune/.test(n);
 });
 return hits.map(x=>x.id);
}

export function compileOmegaMaximumR126(input:R126CompileInput){
 const intent=String(input.intent??'').trim().slice(0,8000);
 const metrics=normalizeMetrics(input.metrics??input.record?.metrics??{});
 const decision=omegaDecision(metrics);
 const inferred=inferIntent(intent);
 const projection=(input.requestedProjection??inferred.requestedProjection??'FIELD') as OmegaProjection;
 const scope=sanitizeScope(input.scope);
 const cells=policyCells(input,decision,scope);
 const providerTotal=Math.floor(clamp(Number(input.providerBudget??6),0,12));
 const providerReconvergence=providerTotal>0?1:0;
 const providerCells=Math.max(0,providerTotal-providerReconvergence);
 const modePolicy: R126ModePolicy=input.modePolicy??'ALL';
 const canonIds=modePolicy==='ALL'
  ?CANON_AUTHORITY_STACK.map(x=>x.id)
  :modePolicy==='EXPLICIT'
   ?unique((input.explicitCanonIds??[]).map(Number).filter(x=>Number.isInteger(x)&&x>=1&&x<=CANON_AUTHORITY_COUNT))
   :relevantCanonIds(intent,projection);
 const canonModes=CANON_AUTHORITY_STACK.filter(x=>canonIds.includes(x.id));
 const sourceSummary=input.record?sourceBackedModeSummary(input.record):null;
 const canonEvaluations=input.record?evaluateCanonAuthorityStack(input.record).filter(x=>canonIds.includes(x.id)):[];
 const tier:OmegaDeviceTier=deviceTier(Number(input.width??1280),input.nativePc===true);
 const render=renderBudget(tier,metrics,true);
 const evidence=(input.evidence??[]).slice(0,32).map((x,i)=>({id:String(x.id||`evidence-${i+1}`).slice(0,120),summary:String(x.summary||'').slice(0,2000),source:String(x.source||'operator').slice(0,300),authority:String(x.authority||'OPERATOR_SUPPLIED_NOT_INDEPENDENTLY_VERIFIED').slice(0,160)}));
 const requiredCapabilities=unique([...(inferred.requiredCapabilities??[]),projection.toLowerCase(),...R126_SYSTEM_FAMILIES]);
 const sourceModeContract={catalogCount:R21_MODE_AUTHORITY.catalogCount,hostedEvaluationContracts:sourceSummary?.rows.length??20,appliedNow:sourceSummary?.appliedCount??0,exactNow:sourceSummary?.exactCount??0,gatedNow:sourceSummary?.gatedCount??0,policy:modePolicy,allCatalogEntriesInformRouting:modePolicy==='ALL',truthBoundary:R21_MODE_AUTHORITY.boundary};
 const modeContract={source:sourceModeContract,canon:{available:CANON_AUTHORITY_COUNT,selected:canonModes.length,modes:canonModes,evaluations:canonEvaluations},countingRule:ALL_MODES_BOUNDARY.countingRule,truthBoundary:ALL_MODES_BOUNDARY.truthBoundary};
 const execution={scope,detached:scope.type!=='BODY',cells,fullExplicit:input.scalePolicy==='FULL',allowFullAuto:input.allowFullAuto===true,providerBudget:{total:providerTotal,cells:providerCells,reconvergence:providerReconvergence},machineBudget:{genesis:Math.floor(clamp(Number(input.genesisBudget??1),0,4)),optical:Math.floor(clamp(Number(input.opticalBudget??1),0,4))},stages:R126_EXECUTION_STAGES};
 return{
  ok:Boolean(intent),schema:'OMEGA_R126_TOTAL_MAXIMUM_PLAN',runtime:R126_RUNTIME,release:R126_RELEASE,intent,projection,deviceTier:tier,decision,metrics,renderBudget:render,
  hierarchy:R126_HIERARCHY,scaleAtlas:R126_SCALE_ATLAS,systemFamilies:R126_SYSTEM_FAMILIES,requiredCapabilities,modeContract,execution,
  corpusAuthorities:SOURCE_CORPUS_AUTHORITIES_R107.map(x=>({id:x.id,title:x.title,kind:x.kind,boundary:x.truthBoundary})),
  corpusFabric:ULTIMATE_DEVELOPMENT_FABRIC_R107,evidence,constraints:(input.constraints??[]).slice(0,32).map(x=>String(x).slice(0,800)),accuracyTarget:clamp(Number(input.accuracyTarget??.98),0,1),
  authority:{canonical:'OMEGAV6',autonomic:'EXECUTION_PLANNING_NOT_CANON',quorum:'EXECUTION_QUORUM_NOT_TRUTH',detachedReceipt:'SWARM_RECEIPT_RETURNED_NOT_ADMITTED',build:'SELF_BUILD_CANDIDATE_NOT_ADMITTED',mode:'CATALOG_MEMBERSHIP_NOT_EXECUTION'},
  continuityLaw:'partition -> exchange/transform -> invariant carry -> scar/residual carry -> re-contextualize/repartition -> proof-gated admission',
  inheritedLaws:{living:R123_LAWS,selfBuild:R124_SELF_BUILD_LAWS,accuracy:R125_ACCURACY_LAWS},
  truthBoundary:'R126 unifies the available OMEGA software, source-backed mode catalog, canon lenses, swarm hierarchy, federation, self-build and accuracy controls. 20,736 / 248,832 / 61,917,364,224 are address/representation capacities, not literal physical dimensions. ALL MODES means every preserved source/canon lens may inform routing or expression when lawful; it never means every catalog row executed, every model was called, every cloud is live, or any missing empirical evidence was created. OMEGAv6 proof/admission remains the only canonical authority.'
 };
}

export const R126_MANIFEST={
 schema:'OMEGA_R126_TOTAL_MAXIMUM_MANIFEST',runtime:R126_RUNTIME,release:R126_RELEASE,canonicalAuthority:'OMEGAV6',hierarchy:R126_HIERARCHY,scaleAtlas:R126_SCALE_ATLAS,
 projections:R126_PROJECTIONS,scopes:R126_SCOPES,stages:R126_EXECUTION_STAGES,systemFamilies:R126_SYSTEM_FAMILIES,
 modes:{sourceCatalog:R21_MODE_AUTHORITY.catalogCount,canonLenses:CANON_AUTHORITY_COUNT,allModesRule:'all preserved source and canon authorities are available to lawful routing/expression; execution remains input/proof gated'},
 inherited:{r121:'stateful swarm',r123:'organism + living runtime',r124:'governed continuous self-build',r125:'accuracy-first residual engine',r126:'autonomic + total maximum convergence'},
 truthBoundary:ULTIMATE_DEVELOPMENT_FABRIC_R107.boundary
} as const;
