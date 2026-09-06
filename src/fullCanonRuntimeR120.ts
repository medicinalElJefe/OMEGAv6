import {calculusVisualLaw} from './calculusVisualLawR37';
import {globalModeInfluenceR107,surfaceModeFabricR107} from './modeExecutionFabricR107';
import {unifiedFromRecord} from './unifiedCalculus';

const cl=(x:any)=>Math.max(0,Math.min(1,Number.isFinite(Number(x))?Number(x):0));
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;

export const FULL_CANON_ADDRESS_LEVELS_R120=[12,144,1728,20736,248832,61917364224] as const;
export const FULL_CANON_MASTER_OPERATOR_R120=['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_RESIDUAL_CARRY','RECONTEXTUALIZE_REPARTITION'] as const;
export const FULL_CANON_REFERENCE_KERNEL_R120={innerOuterBias:37,symmetryBias:73,law:'REFERENCE_KERNEL_ONLY__NOT_UNIVERSAL_PHYSICAL_CONSTANTS'} as const;

export type FullCanonContextR120=ReturnType<typeof compileFullCanonContextR120>;

export function compileFullCanonContextR120(surface:string,record:any){
 const u=unifiedFromRecord(record),global=globalModeInfluenceR107(record),surfaceFabric=surfaceModeFabricR107(surface,record),visual=calculusVisualLaw(record),channels=global.channels;
 const channelRows=Object.entries(channels).map(([name,value])=>({name,value:cl(value)})).sort((a,b)=>b.value-a.value);
 const orientation=u.carry.signed>1e-9?1:u.carry.signed<-1e-9?-1:0;
 const stability=cl((u.C*u.Phi)/(u.q+u.Lambda+1e-6));
 const invariantCarry=cl(mean([u.C,u.evidence,u.light.coherence,channels.COHERENCE,channels.PROOF,channels.GOVERNANCE]));
 const residualCarry=cl(mean([u.scar,u.q,u.Lambda,channels.MEMORY,channels.PRUNE,channels.COMPRESSION]));
 const transformCapacity=cl(mean([u.Phi,u.motionRelativity,u.geometry,channels.RELATIVITY,channels.TRAVERSAL,channels.FLOW,channels.TOPOLOGY]));
 const computeReadiness=cl(.30*invariantCarry+.25*transformCapacity+.18*stability+.12*channels.RECURSION+.08*channels.SCALE+.07*channels.GOVERNANCE);
 const proofReadiness=cl(.44*u.evidence+.24*channels.PROOF+.14*channels.GOVERNANCE+.10*u.C+.08*(1-u.q));
 const visualDepth=cl(mean([visual.depthGain,visual.perspectiveGain,visual.curvature,visual.branchSpread,channels.LIGHT,channels.SCALE,channels.TOPOLOGY]));
 const decision=String(record?.metrics?.decision||visual.modeDecision||u.sourceDecision||'TURN');
 return{
  schema:'OMEGA_FULL_OVERALL_CANON_CONTEXT_R120',surface,stateId:Number(record?.stateId??0),address:Number(record?.address??0),decision,
  woven:{continuity:u.C,plasticity:u.Phi,contradiction:u.q,burden:u.Lambda,scar:u.scar,evidence:u.evidence,stability,orientation},
  masterOperator:FULL_CANON_MASTER_OPERATOR_R120,
  carry:{invariant:invariantCarry,residual:residualCarry,transformCapacity,computeReadiness,proofReadiness},
  relativity:{motion:u.motionRelativity,geometry:u.geometry,curvature:u.curvature,scaleAddressLevels:FULL_CANON_ADDRESS_LEVELS_R120},
  referenceKernel:FULL_CANON_REFERENCE_KERNEL_R120,
  modes:{channels,top:channelRows.slice(0,8),sourceExact:global.sourceExactContributors,sourcePacket:global.sourcePacketContributors,gated:global.gatedSourceModes,catalogOnly:global.catalogOnly,authorityLenses:global.authorityLensContributors,surfaceApplicable:surfaceFabric.applicableCount,surfaceContributing:surfaceFabric.contributingCount,topSurfaceContributors:surfaceFabric.topContributors.slice(0,8)},
  visual:{phase:visual.phase01,routeStrength:visual.routeStrength,proofGlow:visual.proofGlow,contradictionPressure:visual.contradictionPressure,depth:visual.depthGain,perspective:visual.perspectiveGain,curvature:visual.curvature,fold:visual.fold,branchSpread:visual.branchSpread,trailPersistence:visual.trailPersistence,scarMemory:visual.scarMemory,visualDepth},
  intelligence:{computeReadiness,proofReadiness,priorityFamilies:channelRows.slice(0,5),sourceGroundedContributors:global.sourceExactContributors+global.sourcePacketContributors,boundary:'Full Overall Canon context is a deterministic, source-bounded coordination layer for computation, visualization, retrieval planning and governed SAI proposals. It does not claim unseen model weights, physical dimensionality, or empirical validation.'},
  boundary:'Woven Continuity is partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition. Atlas levels are representation/address resolutions, not literal physical dimensions. Symmetry/asymmetry remain transform- and frame-relative; 37/73 are retained only as a reference kernel/bias.'
 };
}

export function canonSurfaceStyleR120(ctx:FullCanonContextR120){
 return{
  '--omega-canon-C':String(ctx.woven.continuity),
  '--omega-canon-Phi':String(ctx.woven.plasticity),
  '--omega-canon-q':String(ctx.woven.contradiction),
  '--omega-canon-Lambda':String(ctx.woven.burden),
  '--omega-canon-stability':String(ctx.woven.stability),
  '--omega-canon-compute':String(ctx.carry.computeReadiness),
  '--omega-canon-proof':String(ctx.carry.proofReadiness),
  '--omega-canon-depth':String(ctx.visual.visualDepth),
  '--omega-canon-route':String(ctx.visual.routeStrength),
  '--omega-canon-scar':String(ctx.visual.scarMemory),
  '--omega-canon-orientation':String(ctx.woven.orientation)
 } as Record<string,string>;
}

export function fullCanonPromptContextR120(record:any,surface='Command Center'){
 const c=compileFullCanonContextR120(surface,record);
 return{
  schema:'OMEGA_FULL_CANON_PROMPT_CONTEXT_R120',stateId:c.stateId,address:c.address,decision:c.decision,
  kernel:{C:c.woven.continuity,Phi:c.woven.plasticity,q:c.woven.contradiction,Lambda:c.woven.burden,scar:c.woven.scar,evidence:c.woven.evidence,stability:c.woven.stability,orientation:c.woven.orientation},
  masterOperator:c.masterOperator,priorityFamilies:c.intelligence.priorityFamilies,computeReadiness:c.carry.computeReadiness,proofReadiness:c.carry.proofReadiness,
  referenceKernel:c.referenceKernel,boundary:c.boundary
 };
}
