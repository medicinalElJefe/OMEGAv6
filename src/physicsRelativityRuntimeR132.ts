import {evaluateCanonAuthorityStack,ALL_MODES_BOUNDARY} from './allModesAuthority';
import {compileDimensionalRelativity} from './dimensionalRelativityR24';
import {computeLensScore,LENS_CALCULUS,type LensInput,type OmegaLens} from './lensCalculus';
import {compileSourceTraversal,evaluateSourceBackedModes} from './sourceBackedModeRuntimeR21';
import {decodeAddress,evaluateCorpusModes,corpusState,STATE_COUNT} from './corpusRuntime';

export const R132_REVISION='R132' as const;
export const R132_SCHEMA='OMEGA_RELATIONAL_PHYSICS_MANIFOLD_R132' as const;
export const R132_TRUTH_CLASSES=['REFERENCE_PHYSICS','OBSERVED_EVIDENCE','CANONICAL_PACKET','DERIVED_RUNTIME','REPRESENTATIONAL_PROJECTION','GATED'] as const;
export type R132TruthClass=typeof R132_TRUTH_CLASSES[number];

export const R132_REFERENCE_CONSTANTS=[
 {symbol:'c',name:'speed of light',value:299792458,unit:'m/s',valueType:'SI exact',truth:'REFERENCE_PHYSICS' as R132TruthClass},
 {symbol:'h',name:'Planck constant',value:6.62607015e-34,unit:'J Hz^-1',valueType:'SI exact',truth:'REFERENCE_PHYSICS' as R132TruthClass},
 {symbol:'e',name:'elementary charge',value:1.602176634e-19,unit:'C',valueType:'SI exact',truth:'REFERENCE_PHYSICS' as R132TruthClass},
 {symbol:'alpha',name:'fine-structure constant',value:0.0072973525643,unit:'dimensionless',valueType:'CODATA 2022 donor value',truth:'REFERENCE_PHYSICS' as R132TruthClass},
 {symbol:'G',name:'gravitational constant',value:6.6743e-11,unit:'m^3 kg^-1 s^-2',valueType:'CODATA 2022 donor value',truth:'REFERENCE_PHYSICS' as R132TruthClass}
] as const;

export const R132_FORCE_REFERENCE=[
 {force:'Strong interaction',relativeStrength:1,valueType:'approximate comparison',truth:'REFERENCE_PHYSICS' as R132TruthClass},
 {force:'Electromagnetic interaction',relativeStrength:1e-2,valueType:'approximate comparison',truth:'REFERENCE_PHYSICS' as R132TruthClass},
 {force:'Weak interaction',relativeStrength:1e-13,valueType:'approximate comparison',truth:'REFERENCE_PHYSICS' as R132TruthClass},
 {force:'Gravity',relativeStrength:1e-38,valueType:'approximate particle-scale comparison',truth:'REFERENCE_PHYSICS' as R132TruthClass}
] as const;

export const R132_SCALE_HIERARCHY=[
 {scale:'Nuclear',dominantForce:'Strong interaction',role:'binds quarks/nucleons; preserves nuclear identity',coherence:1,form:.1,aggregation:0},
 {scale:'Atomic',dominantForce:'Electromagnetic interaction',role:'binds electrons to nuclei; creates atomic shells',coherence:.8,form:.9,aggregation:.05},
 {scale:'Chemical',dominantForce:'Electromagnetic interaction',role:'creates bonds, reactions, polarity and materials',coherence:.7,form:1,aggregation:.1},
 {scale:'Biological',dominantForce:'Electromagnetic interaction',role:'supports chemistry, signaling, membranes and metabolism',coherence:.6,form:.95,aggregation:.2},
 {scale:'Human-scale materials',dominantForce:'Electromagnetic interaction',role:'rigidity, contact, conductivity and magnetism',coherence:.55,form:.9,aggregation:.35},
 {scale:'Planetary',dominantForce:'Gravity',role:'mass aggregation, surface weight and orbital structure',coherence:.35,form:.4,aggregation:.9},
 {scale:'Stellar',dominantForce:'Gravity',role:'compresses matter into stars and fusion conditions',coherence:.3,form:.35,aggregation:.95},
 {scale:'Galactic',dominantForce:'Gravity',role:'binds stars, gas and dust into galactic systems',coherence:.2,form:.25,aggregation:1}
] as const;

export const R132_DOMAIN_BASIS=[
 {name:'Coherence',bind:1,shape:.5,gather:.75,motion:.75},
 {name:'Structure',bind:.933013,shape:.75,gather:.933013,motion:.933013},
 {name:'Motion',bind:.75,shape:.933013,gather:1,motion:1},
 {name:'Memory',bind:.5,shape:1,gather:.933013,motion:.933013},
 {name:'Compression',bind:.25,shape:.933013,gather:.75,motion:.75},
 {name:'Expansion',bind:.066987,shape:.75,gather:.5,motion:.5},
 {name:'Emergence',bind:0,shape:.5,gather:.25,motion:.25},
 {name:'Stability',bind:.066987,shape:.25,gather:.066987,motion:.066987},
 {name:'Adaptation',bind:.25,shape:.066987,gather:0,motion:0},
 {name:'Observation',bind:.5,shape:0,gather:.066987,motion:.066987},
 {name:'Traversal',bind:.75,shape:.066987,gather:.25,motion:.25},
 {name:'Forecast',bind:.933013,shape:.25,gather:.5,motion:.5}
] as const;

export const R132_STATE_BASIS=[
 {name:'Seed',coherence:1,form:.5,aggregation:0,transition:0},
 {name:'Bind',coherence:.940909,form:.75,aggregation:.066987,transition:.5},
 {name:'Shape',coherence:.881818,form:.933013,aggregation:.25,transition:.866025},
 {name:'Flow',coherence:.822727,form:1,aggregation:.5,transition:1},
 {name:'Charge',coherence:.763636,form:.933013,aggregation:.75,transition:.866025},
 {name:'Mass',coherence:.704545,form:.75,aggregation:.933013,transition:.5},
 {name:'Field',coherence:.645455,form:.5,aggregation:1,transition:0},
 {name:'Boundary',coherence:.586364,form:.25,aggregation:.933013,transition:.5},
 {name:'Scar',coherence:.527273,form:.066987,aggregation:.75,transition:.866025},
 {name:'Basin',coherence:.468182,form:0,aggregation:.5,transition:1},
 {name:'Phase',coherence:.409091,form:.066987,aggregation:.25,transition:.866025},
 {name:'Horizon',coherence:.35,form:.25,aggregation:.066987,transition:.5}
] as const;

const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const num=(n:any)=>Number.isFinite(Number(n))?Number(n):0;
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const v4=(address:number)=>{const c=decodeAddress(address);return[(c.d-5.5)/5.5,(c.p-5.5)/5.5,(c.r-5.5)/5.5,(c.l-5.5)/5.5] as const};
const delta=(a:readonly number[],b:readonly number[])=>a.map((x,i)=>(b[i]??0)-x);
const mag=(a:number[])=>Math.sqrt(a.reduce((s,x)=>s+x*x,0));
const dot=(a:number[],b:number[])=>a.reduce((s,x,i)=>s+x*(b[i]??0),0);

export type R132Harmonic={index:number,re:number,im:number,amplitude:number,phase:number};
export function harmonicFoldR132(values:number[],count=12):R132Harmonic[]{
 const N=Math.max(1,values.length),centered=values.map(v=>clamp(v)-.5);
 return Array.from({length:count},(_,k)=>{let re=0,im=0;for(let i=0;i<N;i++){const a=2*Math.PI*(k+1)*i/N;re+=centered[i]*Math.cos(a);im+=centered[i]*Math.sin(a)}re/=N;im/=N;const amplitude=clamp(Math.sqrt(re*re+im*im)*4);return{index:k,re,im,amplitude,phase:Math.atan2(im,re)}});
}

export function routeDynamicsR132(address:number,depth=36){
 const route=compileSourceTraversal(address,depth),pts=route.path.slice(0,4).map(x=>v4(x.address)),zero=[0,0,0,0];
 const v1=pts.length>1?delta(pts[0],pts[1]):zero,v2=pts.length>2?delta(pts[1],pts[2]):v1,a=delta(v1,v2),speed=clamp(mag(v1)/2),acceleration=clamp(mag(a)/2);
 const denom=Math.max(1e-9,mag(v1)*mag(v2)),turn=denom?Math.acos(Math.max(-1,Math.min(1,dot(v1,v2)/denom))):0,curvature=clamp(turn/Math.PI);
 return{route,speed,acceleration,curvature,velocity4:v1,acceleration4:a,truth:'DERIVED_RUNTIME' as R132TruthClass,boundary:'Route speed, acceleration and curvature are derivatives in canonical address embedding, not measured SI kinematics.'};
}

export function earthObservationVectorR132(evidence:any){
 const has=Boolean(evidence&&evidence.schema==='OMEGA_EARTH_EVIDENCE_V1');
 const temperature=num(evidence?.localConditions?.temperatureC),wind=num(evidence?.localConditions?.windKph),cloud=num(evidence?.localConditions?.cloudPct),kp=num(evidence?.spaceWeather?.kp),quake=num(evidence?.seismic?.maxMagnitude),context=num(evidence?.derivedContext?.index);
 return{available:has,temperatureC:has?temperature:null,windKph:has?wind:null,cloudPct:has?cloud:null,kp:has?kp:null,maxMagnitude:has?quake:null,contextIndex:has?context:null,evidenceHash:has?String(evidence?.evidenceHash||''):null,truth:has?'OBSERVED_EVIDENCE' as R132TruthClass:'GATED' as R132TruthClass};
}

export function compilePhysicsRelativityR132(address:number,earthEvidence?:any){
 const record=corpusState(address),coords=decodeAddress(address),sourceModes=evaluateCorpusModes(record),exactModes=evaluateSourceBackedModes(record),authorities=evaluateCanonAuthorityStack(record),dimensional=compileDimensionalRelativity(record),dynamics=routeDynamicsR132(address,48),observed=earthObservationVectorR132(earthEvidence);
 const C=clamp(num(record.metrics.continuity)),Phi=clamp(num(record.metrics.plasticity)),q=clamp(num(record.metrics.contradiction)),Lambda=clamp(num(record.metrics.burden)),scar=clamp(num(record.metrics.scar)),evidence=clamp(num(record.metrics.evidence)),rsc=clamp(num(record.metrics.rsc)),geometry=clamp(num(record.metrics.geometry)),motion=clamp(num(record.math.normalizedMotionRelativity)),symmetry=clamp(num(record.geometry.symmetry)),forecast=clamp(num(record.predict.forecastScore)*5),route=clamp(1-dynamics.speed),gate=clamp(mean([C,Phi,evidence,1-q,1-Lambda])),drive=clamp(mean([dynamics.speed,motion,Phi]));
 const lensInput:LensInput={C,Phi,q,Lambda,scar,evidence,rsc,geometry,motion,symmetry,forecast,route,gate,drive,velocity:dynamics.speed,acceleration:dynamics.acceleration};
 const lenses=(Object.keys(LENS_CALCULUS) as OmegaLens[]).map(name=>({name,score:computeLensScore(name,lensInput),...LENS_CALCULUS[name]}));
 const sourceHarmonics=harmonicFoldR132(sourceModes.results.map((x:any)=>num(x.score)),12),authorityHarmonics=harmonicFoldR132(authorities.map(x=>x.activation),12);
 const exactExecuted=exactModes.filter(x=>x.state==='EXECUTED_EXACT').length,exactPacket=exactModes.filter(x=>x.state==='SOURCE_PACKET'||x.state==='DERIVED_RUNTIME').length,exactGated=exactModes.filter(x=>x.state==='GATED_MISSING_INPUTS').length;
 const modeEnergy=clamp(Math.sqrt(mean(sourceModes.results.map((x:any)=>num(x.score)**2)))),authorityEnergy=clamp(Math.sqrt(mean(authorities.map(x=>x.activation**2)))),modeEntropy=(()=>{const xs=sourceModes.results.map((x:any)=>Math.max(1e-9,num(x.score))),sum=xs.reduce((a,b)=>a+b,0);if(sum<=0)return 0;const H=-xs.reduce((s,x)=>{const p=x/sum;return s+p*Math.log(p)},0);return clamp(H/Math.log(xs.length))})();
 const domain=R132_DOMAIN_BASIS[coords.d],state=R132_STATE_BASIS[coords.p];
 const motionRelativityIndex=clamp(mean([domain.motion,state.transition,motion,dynamics.speed,dynamics.curvature]));
 const field={modeEnergy,authorityEnergy,modeEntropy,motionRelativityIndex,radialWarp:clamp(mean([C,Phi,geometry,modeEnergy,authorityEnergy])),twist:clamp(mean([motion,dynamics.curvature,sourceHarmonics[2]?.amplitude||0,authorityHarmonics[4]?.amplitude||0])),anisotropy:clamp(mean([q,Lambda,scar,Math.abs(domain.bind-domain.shape)])),proofDensity:clamp(mean([evidence,1-q,1-Lambda,rsc,geometry])),phaseRate:clamp(mean([Phi,motion,state.transition,sourceHarmonics[0]?.amplitude||0]))};
 return{
  schema:R132_SCHEMA,revision:R132_REVISION,address,stateId:record.stateId,coordinates:coords,record,
  truthClasses:R132_TRUTH_CLASSES,
  sourceModeField:{registryCount:sourceModes.count,stay:sourceModes.stay,turn:sourceModes.turn,escalate:sourceModes.escalate,harmonics:sourceHarmonics,strongest:sourceModes.strongest,weakest:sourceModes.weakest,boundary:'All 179 source-mode scores contribute to the harmonic field fold. They remain source-model evaluations, not 179 independent physical laws.'},
  exactModeField:{represented:exactModes.length,executedExact:exactExecuted,sourcePacket:exactPacket,gated:exactGated,rows:exactModes},
  canonAuthorityField:{count:authorities.length,active:authorities.filter(x=>x.state==='ACTIVE').length,watch:authorities.filter(x=>x.state==='WATCH').length,quiet:authorities.filter(x=>x.state==='QUIET').length,harmonics:authorityHarmonics,top:[...authorities].sort((a,b)=>b.activation-a.activation).slice(0,8)},
  lensField:lenses,dimensional,dynamics,observed,field,
  physicsReference:{constants:R132_REFERENCE_CONSTANTS,forceReference:R132_FORCE_REFERENCE,scaleHierarchy:R132_SCALE_HIERARCHY,domainBasis:R132_DOMAIN_BASIS,stateBasis:R132_STATE_BASIS,source:'Standard_Model_Lagrangian_20736D_Pi_Motion_AutoPing.xlsx / 20736D Motion Relativity Force Atlas donor'},
  hierarchy:{canonicalStates:STATE_COUNT,addressResolution:'12×12×12×12',modeRegistry:ALL_MODES_BOUNDARY.sourceModeEvaluations,canonAuthorities:ALL_MODES_BOUNDARY.canonAuthorities},
  continuityLaw:'partition -> transform/exchange -> invariant carry -> scar/history carry -> re-contextualize -> repartition',
  truthBoundary:'REFERENCE_PHYSICS is kept separate from returned OBSERVED_EVIDENCE. Canonical CΩ/Φ/q/Λ/scar and all 179 mode evaluations remain computational packet channels. Route derivatives, harmonic folds, 4D projection, shells and visual curvature are DERIVED or REPRESENTATIONAL and are not asserted as literal extra spacetime dimensions, measured force fields, new physical constants or empirical causal proof.'
 };
}
