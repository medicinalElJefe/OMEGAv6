import {buildDevelopmentResidualGraphR164} from '../system/developmentResidualGraphR164.js';
import {assembleLivingWorldFrameR136} from './livingWorldFrameR136.js';

export const R166_REVISION='R166';
export const R166_SCHEMA='OMEGA_DEVELOPMENT_RESIDUAL_WORLD_LENS_R166';
export const R166_LAWS=Object.freeze([
 'RESIDUAL_VISUALIZATION_IS_NOT_REPAIR_AUTHORIZATION',
 'RESIDUAL_ROUTING_INTENT_IS_NOT_EXECUTION_OR_FEDERATION_PROOF',
 'R164_REMAINS_OBSERVATIONAL_RESIDUAL_AUTHORITY',
 'R136_REMAINS_ADAPTIVE_VISUAL_WORLD_FRAME_AUTHORITY',
 'R134_REMAINS_CANONICAL_WORLD_SCAR_CONTINUITY_AUTHORITY',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'ADAPTIVE_PERFORMANCE_CHANGES_PROJECTION_COST_NOT_TRUTH',
 'PC_ONLINE_SOLVER_VALIDITY_AND_PHOTOREAL_REALITY_REQUIRE_DIRECT_PROOF'
]);

const text=(v,n=180)=>String(v??'').trim().slice(0,n);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const severityWeight={LOW:.2,MEDIUM:.45,HIGH:.75,CRITICAL:1};

function routeFamily(residual={}){
 const authority=text(residual.sourceAuthority).toUpperCase(),kind=text(residual.kind).toUpperCase();
 if(kind.includes('FEDERATION'))return'FEDERATION_EVIDENCE';
 if(kind.includes('EARTH'))return'EARTH_EVIDENCE';
 if(kind.includes('RENDER')||kind.includes('COMPUTED_REALITY'))return'COMPUTED_REALITY_EVIDENCE';
 if(kind.includes('HYBRID')||authority.includes('R141'))return'HYBRID_PROOF';
 if(kind.includes('DEPLOYMENT')||authority.includes('R144'))return'DEPLOYMENT_ATTESTATION';
 if(kind.includes('CORE_RUNTIME')||authority.includes('R163'))return'CANONICAL_RUNTIME_HEALTH';
 if(kind.includes('WORKFLOW')||authority.includes('GITHUB'))return'VALIDATION_PROOF';
 if(authority.includes('R125'))return'ACCURACY_ADMISSION_REVIEW';
 return'SYSTEM_REVIEW';
}

export async function assembleDevelopmentResidualWorldLensR166({accuracyState={},runtimeEvidence={},workflowEvidence=[],context={}}={}){
 const graph=buildDevelopmentResidualGraphR164({accuracyState,runtimeEvidence,workflowEvidence});
 const visible=graph.residuals.slice(0,12);
 const maxSeverity=visible.reduce((m,r)=>Math.max(m,severityWeight[r.severity]||0),0);
 const contradiction=visible.length?visible.reduce((s,r)=>s+(severityWeight[r.severity]||0),0)/visible.length:0;
 const evidenceSources=[...new Set(visible.flatMap(r=>r.evidence||[]).map(e=>text(e.source)).filter(Boolean))].slice(0,32);
 const scarIds=visible.map(r=>text(r.id)).filter(Boolean);
 const targetFamilies=[...new Set(visible.map(routeFamily))];
 const action=graph.summary.blocking>0?'BLOCK_AND_REVIEW':graph.summary.review>0?'QUEUE_FOR_REVIEW':graph.summary.total>0?'OBSERVE':'HEALTHY';
 const mission=visible.length?{
  id:`R166-RESIDUAL-LENS-${text(context.sessionId||context.observerId||'SESSION',80)}`,
  planDigest:`R166:${scarIds.join('>')}`.slice(0,160),
  scarIds
 }:null;
 const frame=await assembleLivingWorldFrameR136({
  eventTime:context.eventTime??Date.now(),
  observerId:context.observerId||'omega-development-residual-lens',
  projection:context.projection||'WOVEN',
  address:context.address??0,
  previousHead:context.previousHead||null,
  intent:visible.length?{id:`R166-REVIEW-${action}`,sourceIds:evidenceSources}:null,
  mission,
  performance:context.performance||{},
  metrics:{continuity:clamp(context.metrics?.continuity),plasticity:clamp(context.metrics?.plasticity),contradiction:clamp(contradiction),burden:clamp(maxSeverity),evidence:clamp(context.metrics?.evidence??(evidenceSources.length?0.8:0.2)),uncertainty:clamp(context.metrics?.uncertainty??(visible.length?0.5:0.1)),scar:clamp(maxSeverity)}
 });
 return{
  ok:graph.ok,
  schema:R166_SCHEMA,
  revision:R166_REVISION,
  graph,
  worldId:frame.worldId,
  frame,
  visualOverlay:{
   state:graph.state,
   action,
   counts:graph.summary,
   residuals:visible.map(r=>({id:r.id,kind:r.kind,severity:r.severity,mode:r.mode,summary:r.summary,routeFamily:routeFamily(r),sourceAuthority:r.sourceAuthority})),
   targetFamilies,
   lod:frame.visualState.lod,
   sampleBudget:frame.visualState.sampleBudget
  },
  routingIntent:{targetFamilies,dispatchAuthorized:false,federationClosed:false,reason:'R166 may expose governed target families for operator review but does not authorize dispatch or establish federation execution.'},
  canonicalMutation:false,
  autonomousMutationAuthority:false,
  canonicalAdmissionAuthority:'R125',
  claims:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false},
  truthBoundary:'R166 projects the read-only R164 residual graph into the existing R136/R134 living canonical-world visual/scar continuity. It can expose ranked residuals and governed routing intent, but cannot repair source, dispatch executors, prove federation closure, claim a PC online, validate solver output, prove computed photoreal reality, or admit CanonState.'
 };
}

export function manifestR166(){return{schema:R166_SCHEMA,revision:R166_REVISION,laws:R166_LAWS,canonicalMutation:false,autonomousMutationAuthority:false,canonicalAdmissionAuthority:'R125',sourceResidualAuthority:'R164',visualWorldAuthority:'R136/R134'};}
