import {unifiedFromRecord,type UnifiedMath} from './unifiedCalculus';
import {evaluateSourceBackedModes} from './sourceBackedModeRuntimeR21';
import {globalModeInfluenceR107} from './modeExecutionFabricR107';

const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const mix=(a:number,b:number,t:number)=>a+(b-a)*cl(t);
const sat=(x:number)=>{const a=Math.abs(Number(x)||0);return a/(1+a)};
const signed=(x:number)=>Math.tanh(Number(x)||0);
const TAU=Math.PI*2;
export type OperatorColorRole='ALPHA'|'BASE'|'CONSTRUCT'|'PRUNE'|'OMEGA';
export const OPERATOR_COLOR_HUE:Record<OperatorColorRole,number>={ALPHA:286,BASE:43,CONSTRUCT:4,PRUNE:218,OMEGA:148};
export type SourceModeInfluenceR68={
 ids:string[];coherence:number;mode188:number;forecast:number;prune:number;host:number;turbulence:number;compression:number;scarCarry:number;
 relation:number;proof:number;governance:number;traversal:number;flow:number;light:number;topology:number;scale:number;
 catalogCount:number;authorityCount:number;exactContributors:number;packetContributors:number;lensContributors:number;boundary:string;
};
export type CalculusVisualLaw={u:UnifiedMath;phase01:number;phaseAngle:number;phaseSpeed:number;pulseRate:number;shellCount:number;shellOpacity:number;shellEccentricity:number;shellPrecession:number;density:number;pointRadius:number;depthGain:number;perspectiveGain:number;curvature:number;fold:number;branchSpread:number;trailPersistence:number;scarMemory:number;routeStrength:number;routeWidth:number;proofGlow:number;contradictionPressure:number;hue:number;hueInverse:number;saturation:number;luminance:number;alpha:number;modeDecision:string;operatorWeights:Record<OperatorColorRole,number>;sourceModeInfluence:SourceModeInfluenceR68};

function executableModeValue(record:any,id:string){const row=evaluateSourceBackedModes(record).find(x=>x.id===id&&x.state!=='GATED_MISSING_INPUTS');return typeof row?.value==='number'&&Number.isFinite(row.value)?row.value:0}

export function calculusVisualLaw(record:any):CalculusVisualLaw{
 const u=unifiedFromRecord(record),phase01=((u.phase/TAU)%1+1)%1,full=globalModeInfluenceR107(record),fm=full.channels;
 const sourceModeInfluence:SourceModeInfluenceR68={
  ids:['M001','M002','M004','M005','M006','M007','M008','M009'],
  coherence:cl(.72*sat(executableModeValue(record,'M001'))+.28*fm.COHERENCE),
  mode188:cl(.72*sat(executableModeValue(record,'M002'))+.28*fm.RECURSION),
  forecast:cl(.5+.36*signed(executableModeValue(record,'M004'))+.14*(fm.FORECAST-.5))*2-1,
  prune:cl(.5+.36*signed(executableModeValue(record,'M005'))+.14*(fm.PRUNE-.5))*2-1,
  host:cl(.72*sat(executableModeValue(record,'M006'))+.18*fm.SCALE+.10*fm.COHERENCE),
  turbulence:cl(.72*sat(executableModeValue(record,'M007'))+.18*fm.PRUNE+.10*fm.COMPRESSION),
  compression:cl(.72*sat(executableModeValue(record,'M008'))+.18*fm.COMPRESSION+.10*fm.SCALE),
  scarCarry:cl(.72*sat(executableModeValue(record,'M009'))+.18*fm.MEMORY+.10*fm.RECURSION),
  relation:cl(.55*fm.RELATIVITY+.45*fm.TOPOLOGY),
  proof:fm.PROOF,
  governance:fm.GOVERNANCE,
  traversal:fm.TRAVERSAL,
  flow:fm.FLOW,
  light:fm.LIGHT,
  topology:fm.TOPOLOGY,
  scale:fm.SCALE,
  catalogCount:full.catalogCount,
  authorityCount:full.authorityCount,
  exactContributors:full.sourceExactContributors,
  packetContributors:full.sourcePacketContributors,
  lensContributors:full.authorityLensContributors,
  boundary:'R107 full-mode visual fabric: direct source-backed M001/M002/M004-M009 outputs remain primary where exact, while all applicable executable mode families and all 62 bounded canon/calculus lenses contribute secondary governance/visual influence. Catalog-only affinity and gated formulas contribute zero; no visual parameter is empirical proof.'
 };
 const mi=sourceModeInfluence;
 const contradictionPressure=cl(.35*u.q+.24*u.Lambda+.14*u.scar+.09*mi.turbulence+.06*Math.max(0,mi.prune)+.05*mi.compression+.04*mi.governance+.03*(1-mi.proof));
 const routeStrength=cl(.18*u.C+.15*u.Phi+.13*u.evidence+.11*u.water.conductance+.09*u.motionRelativity+.08*(1-contradictionPressure)+.07*mi.coherence+.05*mi.host+.05*mi.traversal+.04*mi.relation+.03*mi.topology+.02*mi.flow);
 const phaseSpeed=.04+.31*u.motionRelativity+.18*u.water.speed+.12*u.carry.magnitude+.08*u.light.coherence+.06*mi.turbulence+.05*mi.mode188+.05*mi.traversal+.04*mi.flow+.03*mi.relation;
 const pulseRate=.40+2.25*cl(.25*u.Phi+.17*u.light.coherence+.15*u.motionRelativity+.13*u.water.conductance+.08*cl((mi.forecast+1)/2)+.06*mi.mode188+.06*mi.light+.05*mi.proof+.05*mi.governance);
 const shellCount=Math.round(6+12*cl(.20*u.C+.14*u.Phi+.13*u.shape.triangulation+.12*u.shape.toroid+.10*u.geometry+.08*mi.coherence+.06*mi.mode188+.06*mi.scale+.05*mi.topology+.03*mi.relation+.03*mi.proof));
 const shellOpacity=.045+.24*cl(.28*u.C+.18*u.evidence+.15*u.light.coherence+.12*u.shape.symmetry+.08*mi.coherence+.06*mi.host+.06*mi.proof+.04*mi.light+.03*mi.governance);
 const shellEccentricity=cl(.15+.50*u.shape.anisotropy+.15*u.motionRelativity+.09*mi.turbulence+.06*mi.relation+.05*mi.scale);
 const shellPrecession=.025+.26*cl(.25*u.shape.toroid+.20*u.motionRelativity+.16*u.water.curvature+.12*u.carry.magnitude+.07*mi.mode188+.06*mi.scarCarry+.05*mi.relation+.05*mi.flow+.04*mi.topology);
 const density=Math.round(520+2480*cl(.18*u.C+.14*u.Phi+.13*u.evidence+.10*u.geometry+.09*u.shape.triangulation+.08*u.water.conductance+.07*mi.coherence+.05*mi.mode188+.05*mi.topology+.04*mi.scale+.04*mi.light+.03*mi.proof));
 const pointRadius=.45+2.35*cl(.24*u.evidence+.18*u.light.intensity+.14*u.C+.10*u.geometry+.08*u.shape.symmetry+.06*mi.coherence+.05*mi.host+.05*mi.proof+.05*mi.light+.05*mi.governance);
 const depthGain=.22+.78*cl(.19*u.Phi+.16*u.motionRelativity+.14*u.shape.toroid+.12*u.geometry+.09*u.water.conductance+.07*mi.turbulence+.07*mi.host+.06*mi.scale+.05*mi.traversal+.05*mi.relation);
 const perspectiveGain=.32+.68*cl(.22*u.geometry+.17*u.shape.outverse+.14*u.C+.10*u.light.coherence+.08*u.motionRelativity+.07*mi.coherence+.06*mi.host+.06*mi.relation+.05*mi.scale+.05*mi.topology);
 const curvature=cl(.25*u.curvature+.17*u.water.curvature+.14*u.shape.anisotropy+.13*u.shape.toroid+.07*mi.turbulence+.07*mi.scarCarry+.06*mi.relation+.06*mi.flow+.05*mi.topology);
 const fold=cl(.20*u.shape.compression+.17*u.shape.inverse+.13*u.scar+.10*u.q+.08*u.water.boundary+.08*mi.compression+.06*Math.max(0,mi.prune)+.06*mi.governance+.06*mi.scale+.06*mi.relation);
 const branchSpread=cl(.21*u.Phi+.16*u.shape.outverse+.14*u.motionRelativity+.10*u.water.conductance+.08*(1-u.Lambda)+.08*cl((mi.forecast+1)/2)+.06*mi.coherence+.06*mi.traversal+.05*mi.flow+.04*mi.relation+.02*mi.governance);
 const trailPersistence=cl(.23*u.C+.19*u.scar+.12*u.evidence+.09*u.shape.compression+.07*u.rsc+.08*mi.scarCarry+.06*mi.mode188+.06*mi.memory+.04*mi.traversal+.03*mi.proof+.03*mi.topology);
 const scarMemory=cl(.33*u.scar+.15*u.shape.compression+.12*u.Lambda+.09*(1-u.Phi)+.09*mi.scarCarry+.06*Math.max(0,mi.prune)+.06*mi.memory+.04*mi.governance+.03*mi.compression+.03*mi.proof);
 const routeWidth=.8+5.2*routeStrength;
 const proofGlow=cl(.36*u.evidence+.16*u.light.intensity+.11*u.light.coherence+.08*u.geometry+.06*mi.coherence+.05*mi.host+.08*mi.proof+.05*mi.light+.03*mi.governance+.02*mi.topology);
 const hue=(188+phase01*112+30*u.shape.outverse-38*contradictionPressure+16*u.carry.signed+7*mi.mode188-5*mi.turbulence+8*mi.relation+6*mi.flow+4*mi.light+360)%360;
 const hueInverse=(hue+148+64*u.shape.inverse+8*mi.relation)%360;
 const saturation=42+48*cl(.22*u.light.coherence+.17*u.geometry+.14*u.C+.10*u.Phi+.08*u.water.conductance+.07*mi.coherence+.06*mi.mode188+.06*mi.light+.05*mi.proof+.05*mi.relation);
 const luminance=31+39*cl(.22*u.evidence+.16*u.light.intensity+.14*u.C+.10*u.shape.outverse+.08*(1-u.Lambda)+.06*mi.host+.06*mi.coherence+.06*mi.proof+.05*mi.light+.04*mi.governance+.03*mi.scale);
 const alpha=.20+.72*cl(.27*u.evidence+.18*u.C+.14*u.light.coherence+.09*u.geometry+.07*u.rsc+.06*mi.coherence+.05*mi.host+.05*mi.proof+.04*mi.light+.03*mi.relation+.02*mi.governance);
 const operatorWeights={
  ALPHA:cl(.16+.31*u.Phi+.13*u.carry.magnitude+.08*(1-u.Lambda)+.08*cl((mi.forecast+1)/2)+.06*mi.mode188+.06*mi.traversal+.05*mi.flow+.04*mi.light+.03*mi.governance),
  BASE:cl(.15+.25*u.evidence+.18*u.C+.10*u.geometry+.08*mi.coherence+.06*mi.host+.07*mi.proof+.05*mi.topology+.04*mi.light+.02*mi.governance),
  CONSTRUCT:cl(.12+.28*u.shape.outverse+.16*u.Phi+.13*u.motionRelativity+.08*cl((mi.forecast+1)/2)+.07*mi.coherence+.06*mi.traversal+.04*mi.topology+.03*mi.flow+.03*mi.scale),
  PRUNE:cl(.10+.28*u.q+.17*u.shape.inverse+.12*u.scar+.09*mi.turbulence+.08*cl((mi.prune+1)/2)+.06*mi.compression+.05*mi.governance+.03*mi.proof+.02*mi.scale),
  OMEGA:cl(.15+.25*u.C+.15*u.rsc+.13*u.light.coherence+.08*mi.coherence+.06*mi.mode188+.06*mi.relation+.05*mi.proof+.04*mi.governance+.03*mi.topology)
 };
 return{u,phase01,phaseAngle:u.phase,phaseSpeed,pulseRate,shellCount,shellOpacity,shellEccentricity,shellPrecession,density,pointRadius,depthGain,perspectiveGain,curvature,fold,branchSpread,trailPersistence,scarMemory,routeStrength,routeWidth,proofGlow,contradictionPressure,hue,hueInverse,saturation,luminance,alpha,modeDecision:String(record?.metrics?.decision||u.sourceDecision||'TURN'),operatorWeights,sourceModeInfluence};
}
export function operatorColor(law:CalculusVisualLaw,role:OperatorColorRole,alpha=1){const base=OPERATOR_COLOR_HUE[role],phaseShift=(law.phase01-.5)*10,relShift=role==='ALPHA'?law.u.Phi*8:role==='BASE'?law.u.evidence*6:role==='CONSTRUCT'?law.u.shape.outverse*8:role==='PRUNE'?-law.u.q*7:law.u.C*7,h=(base+phaseShift+relShift+360)%360,w=law.operatorWeights[role],s=Math.min(94,48+law.saturation*.38+w*18),l=Math.min(78,Math.max(24,30+law.luminance*.36+w*15));return `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${cl(alpha).toFixed(3)})`}
export function lawColor(law:CalculusVisualLaw,kind:'primary'|'inverse'|'proof'|'scar'|OperatorColorRole,alpha=1){if(kind==='ALPHA'||kind==='BASE'||kind==='CONSTRUCT'||kind==='PRUNE'||kind==='OMEGA')return operatorColor(law,kind,alpha);const h=kind==='inverse'?law.hueInverse:kind==='proof'?(OPERATOR_COLOR_HUE.BASE+law.phase01*8)%360:kind==='scar'?(OPERATOR_COLOR_HUE.PRUNE+18)%360:law.hue,s=kind==='proof'?Math.min(96,law.saturation+10):kind==='scar'?Math.min(90,law.saturation+4):law.saturation,l=kind==='inverse'?Math.max(18,law.luminance-12):kind==='proof'?Math.min(82,law.luminance+20):kind==='scar'?Math.max(24,law.luminance-4):law.luminance;return `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${cl(alpha).toFixed(3)})`}
export function transitionGeometry(a:CalculusVisualLaw,b:CalculusVisualLaw,t:number){const u=cl(t),circle=(x:number,y:number)=>x+Math.atan2(Math.sin(y-x),Math.cos(y-x))*u;return{phase:circle(a.phaseAngle,b.phaseAngle),curvature:mix(a.curvature,b.curvature,u),fold:mix(a.fold,b.fold,u),depth:mix(a.depthGain,b.depthGain,u),spread:mix(a.branchSpread,b.branchSpread,u),trail:mix(a.trailPersistence,b.trailPersistence,u),route:mix(a.routeStrength,b.routeStrength,u)}}
