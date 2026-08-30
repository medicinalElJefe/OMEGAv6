import {unifiedFromRecord,type UnifiedMath} from './unifiedCalculus';
import {evaluateSourceBackedModes} from './sourceBackedModeRuntimeR21';

const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const mix=(a:number,b:number,t:number)=>a+(b-a)*cl(t);
const sat=(x:number)=>{const a=Math.abs(Number(x)||0);return a/(1+a)};
const signed=(x:number)=>Math.tanh(Number(x)||0);
const TAU=Math.PI*2;
export type OperatorColorRole='ALPHA'|'BASE'|'CONSTRUCT'|'PRUNE'|'OMEGA';
export const OPERATOR_COLOR_HUE:Record<OperatorColorRole,number>={ALPHA:286,BASE:43,CONSTRUCT:4,PRUNE:218,OMEGA:148};
export type SourceModeInfluenceR68={ids:string[];coherence:number;mode188:number;forecast:number;prune:number;host:number;turbulence:number;compression:number;scarCarry:number;boundary:string};
export type CalculusVisualLaw={u:UnifiedMath;phase01:number;phaseAngle:number;phaseSpeed:number;pulseRate:number;shellCount:number;shellOpacity:number;shellEccentricity:number;shellPrecession:number;density:number;pointRadius:number;depthGain:number;perspectiveGain:number;curvature:number;fold:number;branchSpread:number;trailPersistence:number;scarMemory:number;routeStrength:number;routeWidth:number;proofGlow:number;contradictionPressure:number;hue:number;hueInverse:number;saturation:number;luminance:number;alpha:number;modeDecision:string;operatorWeights:Record<OperatorColorRole,number>;sourceModeInfluence:SourceModeInfluenceR68};

function executableModeValue(record:any,id:string){const row=evaluateSourceBackedModes(record).find(x=>x.id===id&&x.state!=='GATED_MISSING_INPUTS');return typeof row?.value==='number'&&Number.isFinite(row.value)?row.value:0}

export function calculusVisualLaw(record:any):CalculusVisualLaw{
 const u=unifiedFromRecord(record),phase01=((u.phase/TAU)%1+1)%1;
 const sourceModeInfluence:SourceModeInfluenceR68={
  ids:['M001','M002','M004','M005','M006','M007','M008','M009'],
  coherence:sat(executableModeValue(record,'M001')),
  mode188:sat(executableModeValue(record,'M002')),
  forecast:signed(executableModeValue(record,'M004')),
  prune:signed(executableModeValue(record,'M005')),
  host:sat(executableModeValue(record,'M006')),
  turbulence:sat(executableModeValue(record,'M007')),
  compression:sat(executableModeValue(record,'M008')),
  scarCarry:sat(executableModeValue(record,'M009')),
  boundary:'Bounded renderer influence from already executed source-backed mode outputs M001/M002/M004-M009; no gated formula is substituted and no visual parameter is empirical proof.'
 };
 const mi=sourceModeInfluence;
 const contradictionPressure=cl(.40*u.q+.28*u.Lambda+.16*u.scar+.10*mi.turbulence+.06*Math.max(0,mi.prune));
 const routeStrength=cl(.21*u.C+.19*u.Phi+.16*u.evidence+.14*u.water.conductance+.10*u.motionRelativity+.08*(1-contradictionPressure)+.07*mi.coherence+.05*mi.host);
 const phaseSpeed=.05+.36*u.motionRelativity+.22*u.water.speed+.14*u.carry.magnitude+.09*u.light.coherence+.06*mi.turbulence+.05*mi.mode188;
 const pulseRate=.42+2.25*cl(.29*u.Phi+.20*u.light.coherence+.18*u.motionRelativity+.16*u.water.conductance+.10*mi.forecast+.07*mi.mode188);
 const shellCount=Math.round(6+12*cl(.24*u.C+.17*u.Phi+.15*u.shape.triangulation+.15*u.shape.toroid+.13*u.geometry+.09*mi.coherence+.07*mi.mode188));
 const shellOpacity=.045+.24*cl(.32*u.C+.21*u.evidence+.18*u.light.coherence+.14*u.shape.symmetry+.09*mi.coherence+.06*mi.host);
 const shellEccentricity=cl(.15+.56*u.shape.anisotropy+.18*u.motionRelativity+.11*mi.turbulence);
 const shellPrecession=.025+.26*cl(.29*u.shape.toroid+.24*u.motionRelativity+.19*u.water.curvature+.14*u.carry.magnitude+.08*mi.mode188+.06*mi.scarCarry);
 const density=Math.round(520+2480*cl(.21*u.C+.17*u.Phi+.16*u.evidence+.12*u.geometry+.10*u.shape.triangulation+.10*u.water.conductance+.08*mi.coherence+.06*mi.mode188));
 const pointRadius=.45+2.35*cl(.28*u.evidence+.21*u.light.intensity+.16*u.C+.12*u.geometry+.10*u.shape.symmetry+.07*mi.coherence+.06*mi.host);
 const depthGain=.22+.78*cl(.22*u.Phi+.19*u.motionRelativity+.17*u.shape.toroid+.15*u.geometry+.11*u.water.conductance+.08*mi.turbulence+.08*mi.host);
 const perspectiveGain=.32+.68*cl(.26*u.geometry+.20*u.shape.outverse+.17*u.C+.12*u.light.coherence+.10*u.motionRelativity+.08*mi.coherence+.07*mi.host);
 const curvature=cl(.30*u.curvature+.20*u.water.curvature+.17*u.shape.anisotropy+.16*u.shape.toroid+.09*mi.turbulence+.08*mi.scarCarry);
 const fold=cl(.24*u.shape.compression+.20*u.shape.inverse+.16*u.scar+.13*u.q+.10*u.water.boundary+.10*mi.compression+.07*Math.max(0,mi.prune));
 const branchSpread=cl(.25*u.Phi+.20*u.shape.outverse+.17*u.motionRelativity+.12*u.water.conductance+.10*(1-u.Lambda)+.09*cl((mi.forecast+1)/2)+.07*mi.coherence);
 const trailPersistence=cl(.28*u.C+.23*u.scar+.14*u.evidence+.10*u.shape.compression+.08*u.rsc+.09*mi.scarCarry+.08*mi.mode188);
 const scarMemory=cl(.39*u.scar+.18*u.shape.compression+.15*u.Lambda+.11*(1-u.Phi)+.10*mi.scarCarry+.07*Math.max(0,mi.prune));
 const routeWidth=.8+5.2*routeStrength;
 const proofGlow=cl(.44*u.evidence+.19*u.light.intensity+.14*u.light.coherence+.10*u.geometry+.07*mi.coherence+.06*mi.host);
 const hue=(188+phase01*112+34*u.shape.outverse-42*contradictionPressure+18*u.carry.signed+8*mi.mode188-6*mi.turbulence+360)%360;
 const hueInverse=(hue+148+64*u.shape.inverse)%360;
 const saturation=42+48*cl(.26*u.light.coherence+.20*u.geometry+.17*u.C+.12*u.Phi+.10*u.water.conductance+.08*mi.coherence+.07*mi.mode188);
 const luminance=31+39*cl(.26*u.evidence+.19*u.light.intensity+.17*u.C+.13*u.shape.outverse+.10*(1-u.Lambda)+.08*mi.host+.07*mi.coherence);
 const alpha=.20+.72*cl(.31*u.evidence+.21*u.C+.16*u.light.coherence+.11*u.geometry+.09*u.rsc+.07*mi.coherence+.05*mi.host);
 const operatorWeights={
  ALPHA:cl(.18+.39*u.Phi+.16*u.carry.magnitude+.10*(1-u.Lambda)+.10*cl((mi.forecast+1)/2)+.07*mi.mode188),
  BASE:cl(.17+.31*u.evidence+.22*u.C+.13*u.geometry+.10*mi.coherence+.07*mi.host),
  CONSTRUCT:cl(.13+.34*u.shape.outverse+.19*u.Phi+.16*u.motionRelativity+.10*cl((mi.forecast+1)/2)+.08*mi.coherence),
  PRUNE:cl(.11+.34*u.q+.20*u.shape.inverse+.14*u.scar+.11*mi.turbulence+.10*cl((mi.prune+1)/2)),
  OMEGA:cl(.17+.31*u.C+.19*u.rsc+.16*u.light.coherence+.10*mi.coherence+.07*mi.mode188)
 };
 return{u,phase01,phaseAngle:u.phase,phaseSpeed,pulseRate,shellCount,shellOpacity,shellEccentricity,shellPrecession,density,pointRadius,depthGain,perspectiveGain,curvature,fold,branchSpread,trailPersistence,scarMemory,routeStrength,routeWidth,proofGlow,contradictionPressure,hue,hueInverse,saturation,luminance,alpha,modeDecision:String(record?.metrics?.decision||u.sourceDecision||'TURN'),operatorWeights,sourceModeInfluence};
}
export function operatorColor(law:CalculusVisualLaw,role:OperatorColorRole,alpha=1){const base=OPERATOR_COLOR_HUE[role],phaseShift=(law.phase01-.5)*10,relShift=role==='ALPHA'?law.u.Phi*8:role==='BASE'?law.u.evidence*6:role==='CONSTRUCT'?law.u.shape.outverse*8:role==='PRUNE'?-law.u.q*7:law.u.C*7,h=(base+phaseShift+relShift+360)%360,w=law.operatorWeights[role],s=Math.min(94,48+law.saturation*.38+w*18),l=Math.min(78,Math.max(24,30+law.luminance*.36+w*15));return `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${cl(alpha).toFixed(3)})`}
export function lawColor(law:CalculusVisualLaw,kind:'primary'|'inverse'|'proof'|'scar'|OperatorColorRole,alpha=1){if(kind==='ALPHA'||kind==='BASE'||kind==='CONSTRUCT'||kind==='PRUNE'||kind==='OMEGA')return operatorColor(law,kind,alpha);const h=kind==='inverse'?law.hueInverse:kind==='proof'?(OPERATOR_COLOR_HUE.BASE+law.phase01*8)%360:kind==='scar'?(OPERATOR_COLOR_HUE.PRUNE+18)%360:law.hue,s=kind==='proof'?Math.min(96,law.saturation+10):kind==='scar'?Math.min(90,law.saturation+4):law.saturation,l=kind==='inverse'?Math.max(18,law.luminance-12):kind==='proof'?Math.min(82,law.luminance+20):kind==='scar'?Math.max(24,law.luminance-4):law.luminance;return `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${cl(alpha).toFixed(3)})`}
export function transitionGeometry(a:CalculusVisualLaw,b:CalculusVisualLaw,t:number){const u=cl(t),circle=(x:number,y:number)=>x+Math.atan2(Math.sin(y-x),Math.cos(y-x))*u;return{phase:circle(a.phaseAngle,b.phaseAngle),curvature:mix(a.curvature,b.curvature,u),fold:mix(a.fold,b.fold,u),depth:mix(a.depthGain,b.depthGain,u),spread:mix(a.branchSpread,b.branchSpread,u),trail:mix(a.trailPersistence,b.trailPersistence,u),route:mix(a.routeStrength,b.routeStrength,u)}}
