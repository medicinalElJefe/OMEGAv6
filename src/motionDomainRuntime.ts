import {corpusState} from './corpusRuntime';
import {getFieldNode,interpolateCorridor,type TransitionOp} from './traversalRuntime';
import {unifiedFromRecord} from './unifiedCalculus';
const EPS=0.001,TAU=Math.PI*2,cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0)),mag=(p:{x:number;y:number;z:number})=>Math.hypot(p.x,p.y,p.z),sub=(a:any,b:any)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}),mul=(a:any,k:number)=>({x:a.x*k,y:a.y*k,z:a.z*k}),add=(a:any,b:any)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}),unit=(a:any)=>{const m=mag(a)||1;return{x:a.x/m,y:a.y/m,z:a.z/m}};

export const MATTER_SCALE_AUTHORITY_R310={
 schema:'OMEGA_MATTER_SCALE_AUTHORITY_R310',
 authority:'FORMAL_REFERENCE_ONLY',
 sharedCanonicalPacket:true,
 physicalMeasurement:false,
 externalTelemetry:false,
 scaleCount:8,
 truthBoundary:'The eight Matter scales are deterministic visualization/reference lenses over the same canonical packet. Their metre labels identify contextual orders of magnitude only; changing scale never creates a new observation, SI displacement, force measurement, particle trajectory, biological measurement, orbit solution or astronomical reconstruction.'
} as const;

export const SCALE_DOMAINS=[
 {id:'NUCLEAR',label:'Nuclear',extent:'≈10⁻¹⁵ m',force:'STRONG reference',rgb:[224,175,88] as [number,number,number],role:'short-range binding / shell structure',sceneLaw:'shell-bound radial contraction + scar-phase pulse',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false},
 {id:'ATOMIC',label:'Atomic',extent:'≈10⁻¹⁰ m',force:'EM reference',rgb:[83,216,203] as [number,number,number],role:'bound-state nucleus/electron relation',sceneLaw:'shell-indexed angular relation + evidence-weighted height',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false},
 {id:'CHEMICAL',label:'Chemical',extent:'10⁻⁹–10⁻⁷ m',force:'EM reference',rgb:[83,216,203] as [number,number,number],role:'bond / reaction topology',sceneLaw:'anisotropic bond-axis stretch + plasticity displacement',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false},
 {id:'BIOLOGICAL',label:'Biological',extent:'10⁻⁶–10⁰ m',force:'EM-dominant reference',rgb:[98,205,188] as [number,number,number],role:'adaptive embodied organization',sceneLaw:'coupled continuity/plasticity deformation with bounded phase motion',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false},
 {id:'HUMAN',label:'Human / material',extent:'≈10⁰ m',force:'EM-dominant reference',rgb:[105,212,196] as [number,number,number],role:'macroscopic material / action frame',sceneLaw:'embodied anisotropy weighted by continuity and plasticity',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false},
 {id:'PLANETARY',label:'Planetary',extent:'≈10⁷ m',force:'GRAVITY reference',rgb:[112,151,213] as [number,number,number],role:'orbital / geophysical relation',sceneLaw:'slow angular reference rotation + continuity-weighted flattening',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false},
 {id:'STELLAR',label:'Stellar',extent:'≈10⁹ m',force:'GRAVITY reference',rgb:[112,151,213] as [number,number,number],role:'stellar-system relation',sceneLaw:'slow angular relation + plasticity-weighted radial expansion',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false},
 {id:'GALACTIC',label:'Galactic',extent:'≈10²¹ m',force:'GRAVITY reference',rgb:[126,143,205] as [number,number,number],role:'large-scale gravitational relation',sceneLaw:'logarithmic-spiral reference transform + evidence-weighted flattening',authority:'FORMAL_REFERENCE_ONLY',physicalMeasurement:false}
] as const;

export const TERNARY_MOTION=[{value:1,label:'OUTWARD +1',legacy:'011',meaning:'bounded structural expansion'},{value:0,label:'CENTER 0',legacy:'0',meaning:'momentum and risk reset'},{value:-1,label:'RETURN −1',legacy:'01−1',meaning:'bounded integration / compression'}] as const;
function point(op:TransitionOp,t:number){const a=getFieldNode(op.from),b=getFieldNode(op.to);return interpolateCorridor(a,b,cl(t),op.water.curvature,op.phaseCarry.count||Math.sign(op.phaseDelta||1)||1)}

export function matterScaleAuditR310(){
 const ids=SCALE_DOMAINS.map(x=>x.id),extents=SCALE_DOMAINS.map(x=>x.extent),sceneLaws=SCALE_DOMAINS.map(x=>x.sceneLaw);
 return{schema:MATTER_SCALE_AUTHORITY_R310.schema,count:SCALE_DOMAINS.length,uniqueIds:new Set(ids).size===SCALE_DOMAINS.length,uniqueExtents:new Set(extents).size===SCALE_DOMAINS.length,uniqueSceneLaws:new Set(sceneLaws).size===SCALE_DOMAINS.length,allFormal:SCALE_DOMAINS.every(x=>x.authority==='FORMAL_REFERENCE_ONLY'&&x.physicalMeasurement===false),truthBoundary:MATTER_SCALE_AUTHORITY_R310.truthBoundary};
}

export function deriveMotionPacket(op:TransitionOp,t:number,scaleIndex:number){const u=cl(t),h=.0125,p0=point(op,u),pm=point(op,u-h),pp=point(op,u+h),pmm=point(op,u-2*h),ppp=point(op,u+2*h);const velocity=mul(sub(pp,pm),1/(2*h)),acceleration=mul(add(sub(pp,mul(p0,2)),pm),1/(h*h)),am=mul(add(sub(p0,mul(pm,2)),pmm),1/(h*h)),ap=mul(add(sub(ppp,mul(pp,2)),p0),1/(h*h)),jerk=mul(sub(ap,am),1/(2*h));const source=getFieldNode(op.from),target=getFieldNode(op.to),sr=mag(source),tr=mag(target),tier=tr>sr+.015?1:tr<sr-.015?-1:0,heading=Math.atan2(velocity.y,velocity.x),face=((Math.floor((((heading%TAU)+TAU)%TAU)/(TAU/12)))%12+12)%12,scale=SCALE_DOMAINS[Math.max(0,Math.min(SCALE_DOMAINS.length-1,scaleIndex|0))],a=unifiedFromRecord(corpusState(op.from));const common=(a.C*a.Phi)/(a.q+a.Lambda+EPS),turbulence=a.q/(a.C+EPS),burdenRatio=a.Lambda/(a.C+a.Phi+EPS),scarCarry=.62*Math.abs(Math.sin(a.phase))+.38*Math.abs(Math.cos(a.phase)),vhat=unit(velocity),ahat=unit(acceleration),jhat=unit(jerk),term=TERNARY_MOTION.find(x=>x.value===tier)||TERNARY_MOTION[1];return{u,source:op.from,target:op.to,edge:op.edge,scale,position:p0,velocity:{x:velocity.x,y:velocity.y,z:velocity.z,unitX:vhat.x,unitY:vhat.y,unitZ:vhat.z,speed:mag(velocity)},acceleration:{x:acceleration.x,y:acceleration.y,z:acceleration.z,unitX:ahat.x,unitY:ahat.y,unitZ:ahat.z,magnitude:mag(acceleration)},jerk:{x:jerk.x,y:jerk.y,z:jerk.z,unitX:jhat.x,unitY:jhat.y,unitZ:jhat.z,magnitude:mag(jerk)},heading,piTurn:heading/Math.PI,dodecaFace:face+1,antipode:((face+6)%12)+1,tier,term,common,turbulence,burdenRatio,scarCarry,continuity:a.C,possibility:a.Phi,contradiction:a.q,burden:a.Lambda,proof:op.proof,admissible:op.admissible,truthClass:'FORMAL_MODEL_FRAME',referenceFrame:{scaleId:scale.id,extent:scale.extent,forceReference:scale.force,role:scale.role,sceneLaw:scale.sceneLaw,sharedCanonicalPacket:true,physicalMeasurement:false},basis:`Formal model-space derivatives per normalized transition unit. ${scale.label} lens: ${scale.sceneLaw}. ${scale.extent} and ${scale.force} are contextual reference labels only; this view does not assert SI displacement, measured force, telemetry, or a literal physical reconstruction.`}}
