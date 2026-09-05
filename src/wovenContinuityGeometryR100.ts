import type {UnifiedMath} from './unifiedCalculus';

export const WOVEN_CONTINUITY_R100_AUTHORITY={
 id:'WOVEN_CONTINUITY_GEOMETRY_R100',
 operator:'partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition',
 representation:'12→144→1728→20,736→248,832 are atlas/address resolution levels, not literal physical dimensions',
 orientation:'σ∈{-1,0,+1} factors orientation from structure; sign reversal does not redefine symmetry/asymmetry',
 symmetry:'preserved structure under a declared transform',
 asymmetry:'direction, phase differentiation, path/history, local offset, or emergence',
 referenceKernel:'37/73 may be retained as a reference bias only; it is not hard-coded as asymmetry/symmetry'
} as const;

export const WOVEN_ATLAS_TIERS_R100=[12,144,1728,20736,248832] as const;
export type WovenAtlasTierR100=typeof WOVEN_ATLAS_TIERS_R100[number];
export type WovenPointR100={x:number;y:number;z:number;weight:number};
export type WovenStateR100={
 phase:number;
 orientation:-1|0|1;
 continuity:number;
 recoverability:number;
 invariantCarry:number;
 scarCarry:number;
 contradiction:number;
 burden:number;
 frameRelativity:number;
 curvature:number;
 weaveCoherence:number;
 weaveStrain:number;
 exchange:number;
 partition:number;
 atlasTier:WovenAtlasTierR100;
 atlasCell:number;
 atlasCoordinate:[number,number,number];
 signature:string;
};

const TAU=Math.PI*2;
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const frac=(n:number)=>((n%1)+1)%1;
const wrap=(n:number)=>Math.atan2(Math.sin(n),Math.cos(n));
const mean=(...xs:number[])=>xs.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0)/Math.max(1,xs.length);
const orient=(phase:number):-1|0|1=>Math.abs(Math.sin(phase))<1e-9?0:(Math.sin(phase)>0?1:-1);

function atlasTierFor(complexity:number):WovenAtlasTierR100{
 const i=Math.max(0,Math.min(WOVEN_ATLAS_TIERS_R100.length-1,Math.floor(clamp(complexity)*WOVEN_ATLAS_TIERS_R100.length)));
 return WOVEN_ATLAS_TIERS_R100[i];
}

export function wovenStateR100(u:UnifiedMath,address:number,timeSeconds=0):WovenStateR100{
 const continuity=clamp(u.C),recoverability=clamp(u.Phi),contradiction=clamp(u.q),burden=clamp(u.Lambda),scar=clamp(u.scar),frameRelativity=clamp(u.motionRelativity),curvature=clamp(u.curvature);
 const temporalRate=.07+.18*frameRelativity+.08*u.water.conductance;
 const phase=wrap(u.phase+timeSeconds*temporalRate*TAU);
 const orientation=orient(phase);
 const invariantCarry=clamp(mean(continuity,u.evidence,u.rsc,u.geometry,1-contradiction));
 const scarCarry=clamp(mean(scar,Math.abs(u.carry.signed),u.water.residual,contradiction*.35));
 const exchange=clamp(mean(recoverability,u.water.conductance,frameRelativity,1-burden));
 const weaveStrain=clamp(mean(contradiction,burden,scarCarry,curvature,u.shape.anisotropy));
 const weaveCoherence=clamp(mean(continuity,recoverability,invariantCarry,1-weaveStrain,u.unifiedCoherence));
 const partition=clamp(mean(u.shape.shellPressure,u.shape.toroid,u.shape.petal,curvature,frameRelativity));
 const complexity=clamp(.28*partition+.24*frameRelativity+.2*curvature+.16*scarCarry+.12*(1-weaveCoherence));
 const atlasTier=atlasTierFor(complexity);
 const normalizedAddress=Math.max(0,Math.floor(Number.isFinite(address)?address:0));
 const phaseBin=Math.floor(frac(phase/TAU)*12);
 const shellBin=Math.floor(clamp(.42*u.shape.shellPressure+.34*recoverability+.24*continuity)*12);
 const orientationBin=orientation+1;
 const atlasCell=((normalizedAddress*37+phaseBin*73+shellBin*12+orientationBin)%atlasTier+atlasTier)%atlasTier;
 const atlasCoordinate:[number,number,number]=[
  frac((atlasCell+.5)/atlasTier),
  frac((phaseBin+.5)/12),
  frac((shellBin+.5)/12)
 ];
 const signature=`${atlasTier}:${atlasCell}:${orientation}:${phaseBin}:${shellBin}`;
 return{phase,orientation,continuity,recoverability,invariantCarry,scarCarry,contradiction,burden,frameRelativity,curvature,weaveCoherence,weaveStrain,exchange,partition,atlasTier,atlasCell,atlasCoordinate,signature};
}

export function warpWovenPointR100(p:WovenPointR100,index:number,total:number,state:WovenStateR100,timeSeconds:number):WovenPointR100{
 const n=Math.max(1,total),f=(index+.5)/n,sector=Math.floor(f*12),sectorPhase=sector/12*TAU;
 let{x,y,z}=p;

 // 1) partition: retain the source radius while assigning a deterministic 12-fold local frame.
 const r0=Math.max(1e-8,Math.hypot(x,y,z));
 const local=wrap(Math.atan2(y,x)-sectorPhase);
 const partitionGain=1+.055*state.partition*Math.cos(local*3+state.phase);
 x*=partitionGain;y*=partitionGain;z*=1-.025*state.partition;

 // 2) exchange/transform: oriented circulation is synchronized with runtime time, continuity and recoverability.
 const sigma=state.orientation||1;
 const exchangeAngle=sigma*(.05+.24*state.exchange)*Math.sin(state.phase+sectorPhase+timeSeconds*(.18+.32*state.frameRelativity));
 const ca=Math.cos(exchangeAngle),sa=Math.sin(exchangeAngle),xr=x*ca-y*sa,yr=x*sa+y*ca;
 x=xr;y=yr;
 z+=Math.sin(sectorPhase*2+state.phase)*(.02+.07*state.exchange)*state.recoverability;

 // 3) invariant carry: conserve the incoming radial magnitude up to declared strain instead of unconstrained decorative growth.
 const r1=Math.max(1e-8,Math.hypot(x,y,z));
 const carryTarget=r0*(1+.035*(state.invariantCarry-.5));
 const radialMix=state.invariantCarry;
 const preserveScale=(r1+(carryTarget-r1)*radialMix)/r1;
 x*=preserveScale;y*=preserveScale;z*=preserveScale;

 // 4) scar/history carry: persistent, signed path displacement remains visible across frames.
 const scarWave=Math.sin(index*.071+sectorPhase*3-state.phase*.65);
 const scarOffset=(.015+.12*state.scarCarry)*scarWave;
 x+=Math.cos(sectorPhase+state.phase)*scarOffset;
 y+=Math.sin(sectorPhase-state.phase)*scarOffset*.78;
 z+=sigma*scarOffset*.46;

 // 5) re-contextualize/repartition: observer/frame relativity changes presentation while keeping the same source state owner.
 const shear=(state.frameRelativity-.5)*.22;
 const compression=.96-.16*state.burden+.08*state.weaveCoherence;
 const xo=x+z*shear;
 const zo=z-x*shear*.45;
 x=xo*(1+.1*state.frameRelativity);
 y*=compression;
 z=zo*(1-.06*state.frameRelativity);

 return{x,y,z,weight:p.weight*(.82+.18*state.weaveCoherence)};
}

export function wovenGeometrySummaryR100(state:WovenStateR100){
 return{
  law:WOVEN_CONTINUITY_R100_AUTHORITY.operator,
  state:`CΩ ${state.continuity.toFixed(3)} · Φ ${state.recoverability.toFixed(3)} · carry ${state.invariantCarry.toFixed(3)} · scar ${state.scarCarry.toFixed(3)} · strain ${state.weaveStrain.toFixed(3)} · σ ${state.orientation}`,
  atlas:`${state.atlasTier.toLocaleString()} address atlas · cell ${state.atlasCell} · weave ${state.signature}`,
  boundary:WOVEN_CONTINUITY_R100_AUTHORITY.representation
 };
}
