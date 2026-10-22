import {compileOrganismReflexR156} from '../system/organismReflexR156.js';
import {assembleLivingWorldFrameR136} from './livingWorldFrameR136.js';

export const R157_REVISION='R157';
export const R157_SCHEMA='OMEGA_REFLEX_LIVING_WORLD_TRANSITION_R157';
export const R157_LAWS=Object.freeze([
 'R156_REFLEX_PLANNING_REMAINS_NON_EXECUTING',
 'R156_SCAR_ENTERS_THE_EXISTING_R134_WORLD_HISTORY_THROUGH_R136',
 'REFLEX_TARGETS_BECOME_INTENT_ASSEMBLED_MISSION_TARGETS_NOT_EXECUTION_CLAIMS',
 'ADAPTIVE_PERFORMANCE_CHANGES_VISUAL_PROJECTION_COST_NOT_TRUTH',
 'FEDERATION_RETURN_REMAINS_EVIDENCE_NOT_CANON',
 'HYBRID_PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT',
 'RENDER_RECEIPT_IS_NOT_COMPUTED_PHOTOREAL_REALITY_WITHOUT_DIRECT_VALIDATION',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'
]);

const text=(v,n=200)=>String(v??'').trim().slice(0,n);
const evidenceIds=residuals=>residuals.map(r=>text(r.evidence_id,160)).filter(Boolean);

export async function assembleReflexWorldTransitionR157(event={},context={}){
 const reflex=compileOrganismReflexR156(event,context.reflexOptions||{});
 if(!reflex.ok)return{ok:false,schema:R157_SCHEMA,revision:R157_REVISION,reflex,canonicalMutation:false,canonicalAdmissionAuthority:'R125'};
 const targets=reflex.bounded_route.targets.slice();
 const intentId=text(context.intentId||event.packet_id||reflex.scar.scar_id,160)||reflex.scar.scar_id;
 const missionId=text(context.missionId||`reflex-${reflex.scar.scar_id}`,160);
 const planDigest=`${R157_REVISION}:${reflex.scar.scar_id}:${targets.join('>')||'NO_TARGET'}`;
 const frame=await assembleLivingWorldFrameR136({
  eventTime:context.eventTime??Date.now(),observerId:context.observerId||'omega-reflex',projection:context.projection||'WOVEN',address:event.canonical_address??context.address??0,
  previousHead:context.previousHead||null,
  intent:{id:intentId,sourceIds:[event.packet_id,...evidenceIds(reflex.residuals)].filter(Boolean)},
  mission:{id:missionId,planDigest,scarIds:[reflex.scar.scar_id,...(event.prior_scars||[]).map(s=>text(s?.scar_id||s,160)).filter(Boolean)]},
  earth:context.earth||{},federation:context.federation||{},hybrid:context.hybrid||{},render:context.render||{},performance:context.performance||{},
  metrics:{continuity:context.metrics?.continuity??0.5,plasticity:context.metrics?.plasticity??0.5,contradiction:context.metrics?.contradiction??Math.min(1,reflex.residual_pressure/4),burden:context.metrics?.burden??Math.min(1,reflex.residual_pressure/4),evidence:context.metrics?.evidence??0,uncertainty:context.metrics?.uncertainty??1,scar:context.metrics?.scar??Math.min(1,reflex.residual_pressure/4)}
 });
 return{
  ok:true,schema:R157_SCHEMA,revision:R157_REVISION,
  reflex,
  world:frame,
  visualReflex:{action:reflex.action,next:reflex.next,residualPressure:reflex.residual_pressure,sourceFamily:reflex.source_family,targetFamilies:targets,scarId:reflex.scar.scar_id,projection:frame.visualState.projection,lod:frame.visualState.lod,sampleBudget:frame.visualState.sampleBudget},
  mission:{intentId,missionId,planDigest,targetFamilies:targets,requiresExecutionReceipts:true,requiresReturnVerification:true,state:targets.length?'INTENT_ASSEMBLED_NOT_EXECUTION_PROOF':'NO_CROSS_FAMILY_ACTION'},
  operationRef:frame.operationRef,
  canonicalMutation:false,canonicalAdmissionAuthority:'R125',
  truthBoundary:'R157 projects a bounded R156 organism reflex into the existing R136 visual-first frame and R134 scar/proof continuity. It assembles mission intent and preserves returned evidence/scars, but does not invoke target families, prove federation or PC execution, validate a solver, prove computed photoreal reality, mutate CanonState, or promote donor authority.'
 };
}

export function reflexWorldTransitionManifestR157(){return{ok:true,schema:R157_SCHEMA,revision:R157_REVISION,inherits:['R156 organism reflex','R136 living world frame','R134 canonical world continuity','R125 admission authority'],laws:R157_LAWS,loop:'R156 REFLEX → INTENT-ASSEMBLED MISSION → R136 VISUAL FRAME → R134 SCAR/PROOF HEAD → EXPLICIT EXECUTION/RETURN PROOF REQUIRED',canonicalMutation:false,canonicalAdmissionAuthority:'R125'};}
