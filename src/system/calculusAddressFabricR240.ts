import {allModeContributionsR107,type ModeContributionR107} from '../modeExecutionFabricR107';
import {R240_ORGANS,R240_RESOLUTION,type R240Orientation,type R240Organ} from './recursiveSelfBuildR240';
import type {ResourceEnvelopeR239} from '../hybridResourceGovernorR239';
import {R314_SCHEMA,R314_REVISION,R314_NUMERICAL_CAPABILITIES,R314_AUTHORITY,R314_TRUTH_BOUNDARY,compileNumericalReceiptR314} from './wovenNumericalComputeR314.js';
import {executeNumericalPlanR314} from './wovenExpressionComputeR314.js';

export const R240_CALCULUS_SCHEMA='OMEGA_20736_CALCULUS_ADDRESS_FABRIC_R240' as const;
export const R240_RADIX=12 as const;
export type R240Address={organ:number;branch:number;cell:number;lane:number;address:number;deepPhase:number;deepAddress:number};
export type R240AddressedOperator={ref:string;name:string;family:string;state:string;applicable:boolean;weight:number;orientation:R240Orientation;address:R240Address;organ:R240Organ;active:boolean;basis:string;boundary:string};

const FAMILY_ORGAN:Record<string,R240Organ>={
 COHERENCE:'STATE_MEMORY',FORECAST:'INTELLIGENCE',PRUNE:'PROOF_GOVERNANCE',RELATIVITY:'APPLIED_CALCULUS',FLOW:'SWARM_ORGANISM',MEMORY:'STATE_MEMORY',PROOF:'PROOF_GOVERNANCE',TOPOLOGY:'APPLIED_CALCULUS',COMPRESSION:'CLOUD_FABRIC',TRAVERSAL:'HYBRID_COMPUTE',RECURSION:'EVOLUTION_BUILD',GOVERNANCE:'PROOF_GOVERNANCE',SCALE:'RENDER_PROJECTION',LIGHT:'EVIDENCE_WORLD',GENERIC:'INTELLIGENCE'
};
const clampOrientation=(n:number):R240Orientation=>n<0?-1:n>0?1:0;
const refOrdinal=(ref:string)=>{const m=String(ref).match(/^M(\d+)$/);if(m)return Math.max(0,Number(m[1])-1);const a=String(ref).match(/^A(\d+)$/);if(a)return 179+Math.max(0,Number(a[1])-1);let h=2166136261;for(const ch of String(ref)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0)%1728};
export function r240EncodeAddress(organ:number,branch:number,cell:number,lane:number){for(const [name,value] of Object.entries({organ,branch,cell,lane}))if(!Number.isInteger(value)||value<0||value>=R240_RADIX)throw new Error(`R240 ${name} must be 0..11`);return (((organ*R240_RADIX)+branch)*R240_RADIX+cell)*R240_RADIX+lane}
export function r240DecodeAddress(address:number):R240Address{if(!Number.isInteger(address)||address<0||address>=R240_RESOLUTION.lanes)throw new Error('R240 calculus address must be 0..20735');let x=address;const lane=x%12;x=Math.floor(x/12);const cell=x%12;x=Math.floor(x/12);const branch=x%12;const organ=Math.floor(x/12);const deepPhase=0;return{organ,branch,cell,lane,address,deepPhase,deepAddress:address*12+deepPhase}}
export function stableOperatorAddressR240(ref:string,family:string,orientation:R240Orientation=0,deepPhase=0):R240Address{const organName=FAMILY_ORGAN[family]||'APPLIED_CALCULUS',organ=Math.max(0,R240_ORGANS.indexOf(organName)),ordinal=refOrdinal(ref),branch=Math.floor(ordinal/144)%12,cell=Math.floor(ordinal/12)%12,lane=ordinal%12,address=r240EncodeAddress(organ,branch,cell,lane),phase=Math.max(0,Math.min(11,Math.floor(Number(deepPhase)||0)));return{organ,branch,cell,lane,address,deepPhase:phase,deepAddress:address*12+phase}}

export function numericalReceiptForOperatorR240(ref:string,family:string,result:unknown,{orientation=0,deepPhase=0,provenance=[]}:{orientation?:R240Orientation;deepPhase?:number;provenance?:string[]}={}){
 const address=stableOperatorAddressR240(ref,family,orientation,deepPhase);
 return compileNumericalReceiptR314({operation:`${family}:${ref}`,result,address,orientation,provenance});
}

export function executeAddressedNumericalPlanR240(ref:string,family:string,plan:any,{orientation=0,deepPhase=0,provenance=[]}:{orientation?:R240Orientation;deepPhase?:number;provenance?:string[]}={}){
 const sigma=clampOrientation(orientation),address=stableOperatorAddressR240(ref,family,sigma,deepPhase),declaredPlan={...plan,address,orientation:sigma,provenance:[...(Array.isArray(plan?.provenance)?plan.provenance:[]),...provenance]};
 const computation=executeNumericalPlanR314(declaredPlan);
 return{schema:'OMEGA_R240_ADDRESSED_NUMERICAL_PLAN',revision:'R240/R314.3',ref,family,address,orientation:sigma,computation,receipt:compileNumericalReceiptR314({operation:`${family}:${ref}:${String(plan?.kind||'PLAN')}`,result:computation.result,address,orientation:sigma,provenance:declaredPlan.provenance}),parallelDispatchRequested:false,dispatchAuthority:'R147',durableHistoryAuthority:'R146',hybridReturnAuthority:'R141',canonAdmissionAuthority:'R125',physicalDimensionsClaimed:false,executionProofClaimed:false,externalScientificTruthClaimed:false};
}

export function compile20736CalculusFabricR240(record:any,{surface,orientation=0,deepPhase=0,resourceEnvelope}:{surface?:string;orientation?:R240Orientation;deepPhase?:number;resourceEnvelope?:ResourceEnvelopeR239}={}){
 const fabric=allModeContributionsR107(record,surface),sigma=clampOrientation(orientation),rows=fabric.all.map((row:ModeContributionR107):R240AddressedOperator=>{const address=stableOperatorAddressR240(row.ref,row.family,sigma,deepPhase),organ=R240_ORGANS[address.organ];const active=Boolean(row.applicable&&row.weight>0&&row.state!=='CATALOG_ONLY'&&row.state!=='GATED_MISSING_INPUTS');return{ref:row.ref,name:row.name,family:row.family,state:row.state,applicable:row.applicable,weight:row.weight,orientation:sigma,address,organ,active,basis:row.basis,boundary:row.boundary}}),active=rows.filter(x=>x.active).sort((a,b)=>b.weight-a.weight||a.address.address-b.address.address),parallelBound=Math.max(1,Math.min(12,Number(resourceEnvelope?.effectiveCpuWorkers)||1));
 return{schema:R240_CALCULUS_SCHEMA,revision:'R240',resolution:R240_RESOLUTION,radix:R240_RADIX,physicalDimensionClaim:false,sparseActivation:true,orientation:sigma,registeredOperators:rows.length,activeOperators:active.length,parallelExecutionBound:parallelBound,resourceTier:resourceEnvelope?.tier||'UNPROVED',operators:rows,activeFrontier:active.slice(0,parallelBound),numericalCompute:{schema:R314_SCHEMA,revision:R314_REVISION,capabilities:[...R314_NUMERICAL_CAPABILITIES],authority:R314_AUTHORITY,truthBoundary:R314_TRUTH_BOUNDARY,addressBound:true,serializablePlanExecution:true,parallelismStillGovernedByR239:true},continuityOperator:'PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION',truthBoundary:'20,736 is a sparse computational/address fabric: 12×12×12×12 addresses. All registered modes/lenses remain addressable, but only applicable source-bound or bounded authority outputs activate. R314 supplies deterministic bounded numerical kernels and serializable plans behind those addresses without creating execution, empirical, or Canon authority. Orientation σ is separate from operator structure. R239 bounds parallel execution; address capacity never implies literal physical dimensions or 20,736 simultaneous tasks.'};
}
