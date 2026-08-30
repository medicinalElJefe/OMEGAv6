import {unifiedFromRecord,type UnifiedMath} from './unifiedCalculus';

const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const mix=(a:number,b:number,t:number)=>a+(b-a)*cl(t);
const TAU=Math.PI*2;
export type CalculusVisualLaw={
 u:UnifiedMath; phase01:number; phaseAngle:number; phaseSpeed:number; pulseRate:number;
 shellCount:number; shellOpacity:number; shellEccentricity:number; shellPrecession:number;
 density:number; pointRadius:number; depthGain:number; perspectiveGain:number;
 curvature:number; fold:number; branchSpread:number; trailPersistence:number; scarMemory:number;
 routeStrength:number; routeWidth:number; proofGlow:number; contradictionPressure:number;
 hue:number; hueInverse:number; saturation:number; luminance:number; alpha:number;
 modeDecision:'STAY'|'TURN'|'ESCALATE'|string;
};
export function calculusVisualLaw(record:any):CalculusVisualLaw{
 const u=unifiedFromRecord(record),phase01=((u.phase/TAU)%1+1)%1;
 const contradictionPressure=cl(.46*u.q+.34*u.Lambda+.20*u.scar);
 const routeStrength=cl(.24*u.C+.22*u.Phi+.18*u.evidence+.16*u.water.conductance+.12*u.motionRelativity+.08*(1-contradictionPressure));
 const phaseSpeed=.055+.42*u.motionRelativity+.26*u.water.speed+.17*u.carry.magnitude+.10*u.light.coherence;
 const pulseRate=.45+2.4*cl(.34*u.Phi+.24*u.light.coherence+.22*u.motionRelativity+.20*u.water.conductance);
 const shellCount=Math.round(6+12*cl(.28*u.C+.20*u.Phi+.18*u.shape.triangulation+.18*u.shape.toroid+.16*u.geometry));
 const shellOpacity=.045+.24*cl(.38*u.C+.24*u.evidence+.20*u.light.coherence+.18*u.shape.symmetry);
 const shellEccentricity=cl(.16+.64*u.shape.anisotropy+.20*u.motionRelativity);
 const shellPrecession=.025+.26*cl(.34*u.shape.toroid+.28*u.motionRelativity+.22*u.water.curvature+.16*u.carry.magnitude);
 const density=Math.round(520+2480*cl(.24*u.C+.20*u.Phi+.18*u.evidence+.14*u.geometry+.12*u.shape.triangulation+.12*u.water.conductance));
 const pointRadius=.45+2.35*cl(.32*u.evidence+.24*u.light.intensity+.18*u.C+.14*u.geometry+.12*u.shape.symmetry);
 const depthGain=.22+.78*cl(.26*u.Phi+.22*u.motionRelativity+.20*u.shape.toroid+.18*u.geometry+.14*u.water.conductance);
 const perspectiveGain=.32+.68*cl(.30*u.geometry+.24*u.shape.outverse+.20*u.C+.14*u.light.coherence+.12*u.motionRelativity);
 const curvature=cl(.36*u.curvature+.24*u.water.curvature+.20*u.shape.anisotropy+.20*u.shape.toroid);
 const fold=cl(.28*u.shape.compression+.24*u.shape.inverse+.20*u.scar+.16*u.q+.12*u.water.boundary);
 const branchSpread=cl(.30*u.Phi+.24*u.shape.outverse+.20*u.motionRelativity+.14*u.water.conductance+.12*(1-u.Lambda));
 const trailPersistence=cl(.34*u.C+.28*u.scar+.16*u.evidence+.12*u.shape.compression+.10*u.rsc);
 const scarMemory=cl(.46*u.scar+.22*u.shape.compression+.18*u.Lambda+.14*(1-u.Phi));
 const routeWidth=.8+5.2*routeStrength;
 const proofGlow=cl(.50*u.evidence+.22*u.light.intensity+.16*u.light.coherence+.12*u.geometry);
 // Color is relational: phase supplies base hue; inverse pressure rotates it; coherence/proof determine saturation/light.
 const hue=(188+phase01*112+34*u.shape.outverse-42*contradictionPressure+18*u.carry.signed+360)%360;
 const hueInverse=(hue+148+64*u.shape.inverse)%360;
 const saturation=42+48*cl(.30*u.light.coherence+.24*u.geometry+.20*u.C+.14*u.Phi+.12*u.water.conductance);
 const luminance=31+39*cl(.30*u.evidence+.22*u.light.intensity+.20*u.C+.16*u.shape.outverse+.12*(1-u.Lambda));
 const alpha=.20+.72*cl(.36*u.evidence+.24*u.C+.18*u.light.coherence+.12*u.geometry+.10*u.rsc);
 return{u,phase01,phaseAngle:u.phase,phaseSpeed,pulseRate,shellCount,shellOpacity,shellEccentricity,shellPrecession,density,pointRadius,depthGain,perspectiveGain,curvature,fold,branchSpread,trailPersistence,scarMemory,routeStrength,routeWidth,proofGlow,contradictionPressure,hue,hueInverse,saturation,luminance,alpha,modeDecision:String(record?.metrics?.decision||u.sourceDecision||'TURN')};
}
export function lawColor(law:CalculusVisualLaw,kind:'primary'|'inverse'|'proof'|'scar',alpha=1){
 const h=kind==='inverse'?law.hueInverse:kind==='proof'?(law.hue+38)%360:kind==='scar'?(law.hueInverse+32)%360:law.hue;
 const s=kind==='proof'?Math.min(96,law.saturation+10):kind==='scar'?Math.min(90,law.saturation+4):law.saturation;
 const l=kind==='inverse'?Math.max(18,law.luminance-12):kind==='proof'?Math.min(82,law.luminance+20):kind==='scar'?Math.max(24,law.luminance-4):law.luminance;
 return `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${cl(alpha).toFixed(3)})`;
}
export function transitionGeometry(a:CalculusVisualLaw,b:CalculusVisualLaw,t:number){
 const u=cl(t),circle=(x:number,y:number)=>x+Math.atan2(Math.sin(y-x),Math.cos(y-x))*u;
 return{phase:circle(a.phaseAngle,b.phaseAngle),curvature:mix(a.curvature,b.curvature,u),fold:mix(a.fold,b.fold,u),depth:mix(a.depthGain,b.depthGain,u),spread:mix(a.branchSpread,b.branchSpread,u),trail:mix(a.trailPersistence,b.trailPersistence,u),route:mix(a.routeStrength,b.routeStrength,u)};
}
