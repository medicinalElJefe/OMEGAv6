import {decodeAddress} from './corpusRuntime';
import type {UnifiedMath} from './unifiedCalculus';

export const ATLAS_RESOLUTION_LEVELS_R100=[12,144,1728,20736] as const;
export const WOVEN_CONTINUITY_OPERATOR_R100='partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition' as const;
export const WOVEN_CONTINUITY_BOUNDARY_R100='12→144→1728→20,736 are nested atlas/address resolution levels, not literal physical dimensions.' as const;

const TAU=Math.PI*2;
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const wrap=(n:number)=>((n%TAU)+TAU)%TAU;

export type WeaveStateR100={
 address:number;
 stateAddress:number;
 hierarchy:{level12:number;level144:number;level1728:number;level20736:number};
 atlasPath:string;
 orientation:-1|0|1;
 phase:number;
 phaseBand:number;
 pulse:number;
 continuityFlux:number;
 recoverability:number;
 invariantCarry:number;
 residualCarry:number;
 threadTension:number;
 aperture:number;
 ringCount:number;
 lobeCount:number;
 torsion:number;
 depth:number;
 branch:number;
 symmetry:number;
 asymmetry:number;
 operator:typeof WOVEN_CONTINUITY_OPERATOR_R100;
 boundary:typeof WOVEN_CONTINUITY_BOUNDARY_R100;
 weaveId:string;
};

export function deriveWeaveStateR100(address:number,u:UnifiedMath,timeSeconds=0,timeScale=1):WeaveStateR100{
 const a=Math.max(0,Math.min(20735,Math.floor(address))),c=decodeAddress(a);
 const orientation:(-1|0|1)=u.orientation===0?0:u.orientation>0?1:-1;
 const level12=c.l+1,level144=c.r*12+c.l+1,level1728=c.p*144+c.r*12+c.l+1,level20736=a+1;
 const rate=.12+.68*clamp(.55*u.motionRelativity+.45*u.water.conductance);
 const phase=wrap(u.phase+timeSeconds*Math.max(0,timeScale)*rate*(orientation||1));
 const phaseBand=Math.min(11,Math.floor(phase/TAU*12));
 const pulse=.5+.5*Math.sin(phase);
 const continuityFlux=clamp(u.C*(.62+.38*u.water.conductance)*(1-.34*u.q));
 const recoverability=clamp(u.Phi*(1-.58*u.Lambda)+.18*u.C);
 const invariantCarry=clamp((u.carry.magnitude+u.C+u.rsc+u.geometry)/4);
 const residualCarry=clamp((u.scar+u.q+u.water.residual)/3);
 const threadTension=clamp((u.Lambda+u.q+u.shape.anisotropy)/3);
 const aperture=clamp(.18+.54*recoverability+.28*continuityFlux-.18*threadTension);
 const ringCount=12+Math.round(12*clamp((u.shape.shellPressure+u.C)/2));
 const lobeCount=Math.max(3,Math.min(12,Math.round(3+9*clamp((u.shape.petal+u.shape.symmetry)/2))));
 const torsion=(orientation||1)*(.08+.54*u.shape.anisotropy+.28*residualCarry);
 const depth=clamp(.26+.44*u.shape.outverse+.30*u.shape.inverse);
 const branch=clamp(.15+.52*u.Phi+.18*u.curvature+.15*(1-u.q));
 const atlasPath=`${level12} / ${level144} / ${level1728} / ${level20736}`;
 return{
  address:a,stateAddress:a+1,hierarchy:{level12,level144,level1728,level20736},atlasPath,orientation,phase,phaseBand,pulse,continuityFlux,recoverability,invariantCarry,residualCarry,threadTension,aperture,ringCount,lobeCount,torsion,depth,branch,symmetry:u.shape.symmetry,asymmetry:u.shape.asymmetry,operator:WOVEN_CONTINUITY_OPERATOR_R100,boundary:WOVEN_CONTINUITY_BOUNDARY_R100,weaveId:`W${level12.toString(12).toUpperCase()}-${level144.toString(12).toUpperCase()}-${level1728.toString(12).toUpperCase()}-${level20736.toString(12).toUpperCase()}-S${orientation}`
 };
}

export function applyWovenContinuityR100(
 p:{x:number;y:number;z:number;weight:number},index:number,total:number,u:UnifiedMath,weave:WeaveStateR100,timeSeconds:number
){
 const f=index/Math.max(1,total-1),theta=f*TAU,orient=weave.orientation||1;
 const temporal=weave.phase+theta*weave.lobeCount+timeSeconds*(.08+.24*u.motionRelativity)*orient;
 const exchange=Math.sin(temporal)*(.018+.075*weave.continuityFlux);
 const scar=Math.sin(theta*(2+Math.round(weave.residualCarry*5))-weave.phase*.7)*(.012+.065*weave.residualCarry);
 const radial=1+exchange*(.45+.55*weave.aperture)-weave.threadTension*.035;
 const twist=weave.torsion*(.08+.20*Math.sin(theta+weave.phase));
 const ct=Math.cos(twist),st=Math.sin(twist),x0=p.x*radial,y0=p.y*radial;
 const x=x0*ct-y0*st+Math.cos(theta+weave.phase)*scar;
 const y=x0*st+y0*ct+Math.sin(theta*1.5-weave.phase)*scar*.7;
 const z=p.z*(.82+.28*weave.depth)+orient*exchange*.55+(weave.invariantCarry-.5)*.035;
 return{x,y,z,weight:p.weight*(.76+.24*weave.invariantCarry)};
}

export function weaveChannelR100(index:number,weave:WeaveStateR100,u:UnifiedMath){
 const channel=(index+weave.phaseBand)%4;
 const strength=channel===0?weave.continuityFlux:channel===1?weave.invariantCarry:channel===2?weave.residualCarry:clamp((u.motionRelativity+u.light.coherence)/2);
 if(channel===0)return{r:66,g:205,b:190,strength};
 if(channel===1)return{r:224,g:181,b:102,strength};
 if(channel===2)return{r:202,g:75,b:111,strength};
 return{r:91,g:151,b:214,strength};
}
