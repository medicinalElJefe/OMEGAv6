import {decodeAddress,evaluateCorpusModes} from './corpusRuntime';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {calculusVisualLaw} from './calculusVisualLawR37';

export const WOVEN_CANONICAL_COUNT=20736;
export const WOVEN_OUTER_SHELL_COUNT=2985984;
export const WOVEN_VIRTUAL_COUNT=61917364224;

export const WOVEN_R77_AUTHORITY=Object.freeze({
 schema:'OMEGA_WOVEN_CONTINUITY_R77',
 canonicalAnchors:WOVEN_CANONICAL_COUNT,
 outerShells:WOVEN_OUTER_SHELL_COUNT,
 virtualAddresses:WOVEN_VIRTUAL_COUNT,
 radix:12,
 innerAxes:4,
 outerAxes:6,
 catalogModes:179,
 boundary:'20,736 is the resident 12^4 canonical execution lattice. 61,917,364,224 is an exact 12^10 virtual address space decomposed as 12^6 outer shells × 12^4 resident anchors. It is a computational model/address space, not a claim of physical dimensionality.'
} as const);

const cl=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const int=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Math.floor(Number.isFinite(n)?n:a)));

export type WovenBudgetR77={
 targetFps:number;
 refinementBatch:number;
 dprCap:number;
 compact:boolean;
 reducedMotion:boolean;
 hardwareThreads:number;
 deviceMemoryGiB:number|null;
 profile:'MOBILE'|'BALANCED'|'DESKTOP';
};

export function wovenBudgetR77():WovenBudgetR77{
 const nav=(typeof navigator!=='undefined'?navigator:null) as (Navigator & {deviceMemory?:number})|null;
 const threads=Math.max(1,Number(nav?.hardwareConcurrency||4));
 const memory=Number.isFinite(Number(nav?.deviceMemory))?Number(nav?.deviceMemory):null;
 const width=typeof window!=='undefined'?window.innerWidth:1280;
 const compact=width<900;
 const reducedMotion=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const constrained=threads<=4||(memory!==null&&memory<=4);
 const profile=compact?'MOBILE':constrained?'BALANCED':'DESKTOP';
 return{
  targetFps:reducedMotion?24:compact?30:constrained?45:60,
  refinementBatch:compact?192:constrained?384:768,
  dprCap:compact?1.5:2,
  compact,
  reducedMotion,
  hardwareThreads:threads,
  deviceMemoryGiB:memory,
  profile
 };
}

export function base12Digits(value:number,length:number){
 let n=Math.max(0,Math.floor(Number.isFinite(value)?value:0));
 const out=new Array<number>(Math.max(1,length)).fill(0);
 for(let i=out.length-1;i>=0;i--){out[i]=n%12;n=Math.floor(n/12)}
 return out;
}

export function decomposeVirtualAddressR77(value:number){
 const address=int(value,0,WOVEN_VIRTUAL_COUNT-1);
 const shellIndex=Math.floor(address/WOVEN_CANONICAL_COUNT);
 const canonicalAddress=address%WOVEN_CANONICAL_COUNT;
 const inner=decodeAddress(canonicalAddress);
 return{
  address,
  shellIndex,
  canonicalAddress,
  outerDigits:base12Digits(shellIndex,6),
  innerDigits:[inner.d,inner.p,inner.r,inner.l],
  digits:[...base12Digits(shellIndex,6),inner.d,inner.p,inner.r,inner.l]
 };
}

export function composeVirtualAddressR77(shellIndex:number,canonicalAddress:number){
 const shell=int(shellIndex,0,WOVEN_OUTER_SHELL_COUNT-1);
 const anchor=int(canonicalAddress,0,WOVEN_CANONICAL_COUNT-1);
 return shell*WOVEN_CANONICAL_COUNT+anchor;
}

export function compileWovenContinuityR77(record:any){
 const catalog=evaluateCorpusModes(record);
 const source=sourceBackedModeSummary(record);
 const law=calculusVisualLaw(record);
 const C=cl(Number(record?.metrics?.continuity));
 const Phi=cl(Number(record?.metrics?.plasticity));
 const q=cl(Number(record?.metrics?.contradiction));
 const burden=cl(Number(record?.metrics?.burden));
 const evidence=cl(Number(record?.metrics?.evidence));
 const scar=cl(Number(record?.metrics?.scar));
 const dewey=(C*Phi)/(q+burden+1e-9);
 return{
  schema:WOVEN_R77_AUTHORITY.schema,
  address:int(Number(record?.address||0),0,WOVEN_CANONICAL_COUNT-1),
  stateId:Number(record?.stateId||1),
  catalog:{
   count:catalog.count,
   stay:catalog.stay,
   turn:catalog.turn,
   escalate:catalog.escalate,
   strongest:catalog.strongest,
   weakest:catalog.weakest
  },
  source:{
   applied:source.appliedCount,
   exact:source.exactCount,
   packet:source.packetCount,
   gated:source.gatedCount,
   boundary:source.boundary
  },
  kernel:{
   C,Phi,q,burden,evidence,scar,dewey,
   decision:String(record?.metrics?.decision||'TURN'),
   mode188:String(record?.metrics?.mode188||'UNKNOWN')
  },
  visual:{
   coherence:law.sourceModeInfluence.coherence,
   mode188:law.sourceModeInfluence.mode188,
   forecast:law.sourceModeInfluence.forecast,
   prune:law.sourceModeInfluence.prune,
   routeStrength:law.routeStrength,
   proofGlow:law.proofGlow,
   contradictionPressure:law.contradictionPressure,
   phaseSpeed:law.phaseSpeed,
   pulseRate:law.pulseRate
  },
  boundary:WOVEN_R77_AUTHORITY.boundary
 };
}
