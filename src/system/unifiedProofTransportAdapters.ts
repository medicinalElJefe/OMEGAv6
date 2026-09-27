import{executeUnifiedProofTransportV1,type UnifiedDomainContractV1}from'./unifiedProofTransportKernel';
import type{WovenStatePacketV1}from'./proofCarryingWovenDynamics';
import{applyUnitaryQubitLemmaV1,type Matrix2V1}from'./proofCarryingWovenSpecializations';

export const UNIFIED_ADAPTER_BOUNDARY='These adapters translate established PCWD domain receipts into the unified proof-transport contract. Translation cannot strengthen the authority of the source domain and cannot turn software proof into physical or observational proof.' as const;

const maxAbs=(xs:number[])=>xs.reduce((m,v)=>Math.max(m,Math.abs(v)),0);
const localRecover=(p:WovenStatePacketV1)=>({
 continuity:p.P_G_x_t.continuity+p.r_t.continuity,
 plasticity:p.P_G_x_t.plasticity+p.r_t.plasticity,
 burden:p.P_G_x_t.burden+p.r_t.burden,
 contradiction:p.P_G_x_t.contradiction+p.r_t.contradiction,
 scar:p.P_G_x_t.scar+p.r_t.scar,
 evidence:p.P_G_x_t.evidence+p.r_t.evidence,
 invariant:p.P_G_x_t.invariant+p.r_t.invariant,
 motion:p.P_G_x_t.motion+p.r_t.motion,
 support:p.P_G_x_t.support+p.r_t.support,
 orientation:p.P_G_x_t.orientation+p.r_t.orientation,
});

export async function runR349PacketThroughUnifiedKernelV1(packet:WovenStatePacketV1,previousProofDigest='UNIFIED-PCWD-GENESIS'){
 const contract:UnifiedDomainContractV1<WovenStatePacketV1,any,any,any,any,any,any>={
  id:'OMEGA_R349_PCWD_ADAPTER',
  version:'1',
  address:p=>p.A_t,
  sense:p=>p.x_t,
  normalize:x=>x,
  decompose:(_x,p)=>({projected:p.P_G_x_t,residual:p.r_t}),
  lemma:(_d,p)=>p.L_t,
  transport:(_l,p)=>({path:p.Gamma_t,scar:p.Sigma_t}),
  recover:(_t,_l,_d,p)=>localRecover(p),
  measures:({input,recovered})=>{
   const r=input.Pi_t;
   const source=input.x_t;
   const reconstructionError=maxAbs([
    recovered.continuity-source.continuity,recovered.plasticity-source.plasticity,recovered.burden-source.burden,recovered.contradiction-source.contradiction,
    recovered.scar-source.scar,recovered.evidence-source.evidence,recovered.invariant-source.invariant,recovered.motion-source.motion,recovered.support-source.support,
    recovered.orientation-source.orientation,
   ]);
   return{
    continuity:input.C_omega,
    futurePlasticity:input.Phi,
    contradiction:input.q,
    burden:input.Lambda,
    errors:{
     recovery:Math.max(r.errors.recovery,reconstructionError),
     dynamics:r.errors.dynamics,
     observables:r.errors.observables,
     path:r.errors.holonomy,
     invariants:r.gates.invariantsPreserved?0:Number.POSITIVE_INFINITY,
    },
    tolerances:{
     recovery:r.tolerances.recovery,
     dynamics:r.tolerances.dynamics,
     observables:r.tolerances.observables,
     path:Math.max(r.tolerances.recovery,r.errors.holonomy),
     invariants:r.gates.invariantsPreserved?0:0,
     continuity:r.gates.continuityValid?0:1,
    },
    scarRetained:r.gates.scarRetained,
    evidenceAdmissible:r.gates.evidenceAdmissible,
    pathRecoverable:r.gates.pathRecoverable,
   };
  },
  packet:ctx=>({
   A_t:ctx.input.A_t,x_t:ctx.sensed,P_G_x_t:ctx.decomposed.projected,r_t:ctx.decomposed.residual,
   C_omega:ctx.input.C_omega,Phi:ctx.input.Phi,q:ctx.input.q,Lambda:ctx.input.Lambda,
   Sigma_t:ctx.input.Sigma_t,Gamma_t:ctx.input.Gamma_t,L_t:ctx.input.L_t,E_t:ctx.input.E_t,Pi_t:ctx.proof,
   sourceProofDigest:ctx.input.Pi_t.proofDigest,sourcePacketSchema:ctx.input.schema,
  }),
  stageDetail:(stage,_value,p)=>'R349 '+stage+' · source '+p.Pi_t.proofDigest.slice(0,12),
  boundary:packet.boundary+' '+UNIFIED_ADAPTER_BOUNDARY,
 };
 return executeUnifiedProofTransportV1(contract,packet,previousProofDigest);
}

type QubitUnifiedInputV1={rho:Matrix2V1;unitary:Matrix2V1;observables?:Matrix2V1[];tolerance?:number;address?:unknown;evidenceAdmissible?:boolean;continuity?:number;futurePlasticity?:number;contradiction?:number;burden?:number};
export async function runQubitThroughUnifiedKernelV1(input:QubitUnifiedInputV1,previousProofDigest='UNIFIED-PCWD-GENESIS'){
 const contract:UnifiedDomainContractV1<QubitUnifiedInputV1,Matrix2V1,Matrix2V1,{projected:Matrix2V1;residual:number[]},Matrix2V1,Awaited<ReturnType<typeof applyUnitaryQubitLemmaV1>>,Matrix2V1>={
  id:'OMEGA_QUBIT_UNITARY_PCWD_ADAPTER',
  version:'1',
  address:i=>i.address??'QUBIT:2x2',
  sense:i=>i.rho,
  normalize:rho=>rho,
  decompose:rho=>({projected:rho,residual:[0,0,0,0,0,0,0,0]}),
  lemma:d=>d.projected,
  transport:async(rho,i)=>applyUnitaryQubitLemmaV1(rho,i.unitary,i.observables||[],i.tolerance??1e-9),
  recover:t=>t.recovered,
  measures:({input,transported})=>({
   continuity:input.continuity??1,
   futurePlasticity:input.futurePlasticity??1,
   contradiction:input.contradiction??0,
   burden:input.burden??0,
   errors:{
    recovery:transported.recoveryError,
    dynamics:0,
    observables:transported.observableError,
    path:transported.recoveryError,
    invariants:transported.gates.recoveredDensityValid&&transported.gates.unitaryValid?0:Number.POSITIVE_INFINITY,
   },
   tolerances:{
    recovery:input.tolerance??1e-9,dynamics:0,observables:input.tolerance??1e-9,path:input.tolerance??1e-9,invariants:0,continuity:0,
   },
   scarRetained:true,
   evidenceAdmissible:input.evidenceAdmissible===true,
   pathRecoverable:transported.gates.recoveryBounded,
  }),
  packet:ctx=>({
   A_t:ctx.input.address??'QUBIT:2x2',
   x_t:ctx.sensed,
   P_G_x_t:ctx.decomposed.projected,
   r_t:ctx.decomposed.residual,
   C_omega:ctx.input.continuity??1,
   Phi:ctx.input.futurePlasticity??1,
   q:ctx.input.contradiction??0,
   Lambda:ctx.input.burden??0,
   Sigma_t:{recoveryError:ctx.transported.recoveryError,observableError:ctx.transported.observableError},
   Gamma_t:{kind:'UNITARY_CONJUGATION',proofDigest:ctx.transported.proofDigest},
   L_t:{kind:'DENSITY_MATRIX_IDENTITY_REPRESENTATION'},
   E_t:{admissible:ctx.input.evidenceAdmissible===true},
   Pi_t:ctx.proof,
   fidelity:ctx.transported.fidelity,
  }),
  stageDetail:stage=>'qubit '+stage.toLowerCase()+' · standard QM unitary specialization',
  boundary:'Finite 2x2 density-matrix/unitary specialization using standard quantum mechanics. No new physics, measurement outcome, experimental validation or physical authority is inferred. '+UNIFIED_ADAPTER_BOUNDARY,
 };
 return executeUnifiedProofTransportV1(contract,input,previousProofDigest);
}
