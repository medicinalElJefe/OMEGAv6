import {corpusState,decodeAddress,encodeAddress} from './corpusRuntime';
import type {Mandala20736Field} from './mandala20736Runtime';
import {INTERFERENCE_CALIBRATION_R184} from './interferenceResolutionR184';

export const MULTIPATH_RECONSTRUCTION_REVISION='R185' as const;
export type RelationR185='ADMITTED_NEXT'|'D+'|'D-'|'P+'|'P-'|'R+'|'R-'|'L+'|'L-';
export type ReconstructionStateR185={address:number;stateId:number;decision:string;residual:number;evidence:number;scar:number;continuity:number;contradiction:number;burden:number;motion:number;velocity:number;acceleration:number;phase:number};
export type ReconstructionEdgeR185={from:number;to:number;relation:RelationR185;residualDelta:number;reverseReachable:boolean;motionConsistency:number;evidenceFloor:number;scarCost:number};
export type ReconstructionPathR185={id:string;states:ReconstructionStateR185[];edges:ReconstructionEdgeR185[];finalResidual:number;meanResidual:number;improvement:number;scarCost:number;evidenceFloor:number;reverseConsistency:number;motionConsistency:number;temporaryWorsening:number;cost:number;pareto:boolean;termination:string};
export type MultiPathReconstructionR185={schema:'OMEGA_MULTIPATH_RECONSTRUCTION_R185';revision:'R185';source:ReconstructionStateR185;beamWidth:number;maxDepth:number;expandedPaths:number;survivors:ReconstructionPathR185[];paretoFrontier:ReconstructionPathR185[];best:ReconstructionPathR185|null;localGreedyComparator:{available:boolean;finalState:number;finalResidual:number;improvement:number};truthBoundary:string};

const EPS=1e-9,cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0)),signed=(x:number)=>Math.max(-1,Math.min(1,Number.isFinite(x)?x:0));
const wrap=(x:number)=>{const t=Math.PI*2;return((x+Math.PI)%t+t)%t-Math.PI};
function neighbors(address:number,field:Mandala20736Field):Array<[RelationR185,number]>{const c=decodeAddress(address),rows:Array<[RelationR185,number]>=[['ADMITTED_NEXT',field.routeNext[address]??address],['D+',encodeAddress((c.d+1)%12,c.p,c.r,c.l)],['D-',encodeAddress((c.d+11)%12,c.p,c.r,c.l)],['P+',encodeAddress(c.d,(c.p+1)%12,c.r,c.l)],['P-',encodeAddress(c.d,(c.p+11)%12,c.r,c.l)],['R+',encodeAddress(c.d,c.p,(c.r+1)%12,c.l)],['R-',encodeAddress(c.d,c.p,(c.r+11)%12,c.l)],['L+',encodeAddress(c.d,c.p,c.r,(c.l+1)%12)],['L-',encodeAddress(c.d,c.p,c.r,(c.l+11)%12)]];const seen=new Set<number>();return rows.filter(([,a])=>a!==address&&!seen.has(a)&&seen.add(a))}
function scoreState(field:Mandala20736Field,address:number):ReconstructionStateR185{
 const a=Math.max(0,Math.min(field.count-1,Math.floor(address))),r=corpusState(a),n=field.routeNext[a]??a,w=INTERFERENCE_CALIBRATION_R184;
 const continuity=cl(Number(r.metrics.continuity)),contradiction=cl(Number(r.metrics.contradiction)),burden=cl(Number(r.metrics.burden)),scar=cl(Number(r.metrics.scar)),evidence=cl(Number(r.metrics.evidence)),motion=cl(Number(r.math.normalizedMotionRelativity)),velocity=signed(Number(field.velocity[a])),acceleration=signed(Number(field.acceleration[a])),phase=Number(field.phase[a])||0,phasePressure=cl(Math.abs(wrap(Number(field.phase[n])-phase))/Math.PI);
 const pressure=w.burdenPressure*burden+w.contradictionPressure*contradiction+w.scarPressure*scar*(1-continuity)+w.phasePressure*phasePressure+w.accelerationPressure*Math.abs(acceleration),protect=w.continuityProtective*continuity+w.evidenceProtection*evidence,residual=cl(pressure/(pressure+protect+EPS));
 return{address:a,stateId:a+1,decision:String(r.metrics.decision),residual,evidence,scar,continuity,contradiction,burden,motion,velocity,acceleration,phase}
}
function edge(field:Mandala20736Field,a:ReconstructionStateR185,b:ReconstructionStateR185,relation:RelationR185):ReconstructionEdgeR185{
 const reverseReachable=neighbors(b.address,field).some(([,x])=>x===a.address),phaseContinuity=1-cl(Math.abs(wrap(b.phase-a.phase))/Math.PI),velocityContinuity=1-cl(Math.abs(b.velocity-a.velocity)/2),motionContinuity=cl(.55*phaseContinuity+.45*velocityContinuity),evidenceFloor=Math.min(a.evidence,b.evidence),scarCost=cl(.55*b.scar+.25*Math.max(0,b.residual-a.residual)+.20*(1-motionContinuity));
 return{from:a.address,to:b.address,relation,residualDelta:b.residual-a.residual,reverseReachable,motionConsistency,evidenceFloor,scarCost}
}
function summarize(states:ReconstructionStateR185[],edges:ReconstructionEdgeR185[],sourceResidual:number,termination:string):ReconstructionPathR185{
 const final=states.at(-1)!,meanResidual=states.reduce((s,x)=>s+x.residual,0)/states.length,scarCost=edges.length?edges.reduce((s,x)=>s+x.scarCost,0)/edges.length:0,evidenceFloor=Math.min(...states.map(x=>x.evidence)),reverseConsistency=edges.length?edges.filter(x=>x.reverseReachable).length/edges.length:1,motionConsistency=edges.length?edges.reduce((s,x)=>s+x.motionConsistency,0)/edges.length:1,temporaryWorsening=Math.max(0,...states.map(x=>x.residual-sourceResidual)),depthPenalty=Math.min(1,edges.length/12);
 const cost=cl(.34*final.residual+.18*meanResidual+.12*scarCost+.10*(1-evidenceFloor)+.10*(1-reverseConsistency)+.08*(1-motionConsistency)+.05*temporaryWorsening+.03*depthPenalty),improvement=sourceResidual-final.residual,id=states.map(x=>x.stateId).join('>');
 return{id,states,edges,finalResidual:final.residual,meanResidual,improvement,scarCost,evidenceFloor,reverseConsistency,motionConsistency,temporaryWorsening,cost,pareto:false,termination}
}
function dominates(a:ReconstructionPathR185,b:ReconstructionPathR185){const noWorse=a.finalResidual<=b.finalResidual+EPS&&a.scarCost<=b.scarCost+EPS&&a.evidenceFloor>=b.evidenceFloor-EPS&&a.reverseConsistency>=b.reverseConsistency-EPS&&a.motionConsistency>=b.motionConsistency-EPS;const strict=a.finalResidual<b.finalResidual-EPS||a.scarCost<b.scarCost-EPS||a.evidenceFloor>b.evidenceFloor+EPS||a.reverseConsistency>b.reverseConsistency+EPS||a.motionConsistency>b.motionConsistency+EPS;return noWorse&&strict}
function dedupe(paths:ReconstructionPathR185[]){const best=new Map<string,ReconstructionPathR185>();for(const p of paths){const key=String(p.states.at(-1)!.address),old=best.get(key);if(!old||p.cost<old.cost-EPS)best.set(key,p)}return [...best.values()]}
export function reconstructMultipathR185(field:Mandala20736Field,address:number,beamWidth=12,maxDepth=8):MultiPathReconstructionR185{
 const source=scoreState(field,address),bw=Math.max(3,Math.min(24,Math.floor(beamWidth))),depth=Math.max(2,Math.min(12,Math.floor(maxDepth)));let expandedPaths=0;
 let beam:[ReconstructionStateR185[],ReconstructionEdgeR185[]][]=[[[source],[]]],completed:ReconstructionPathR185[]=[];
 for(let d=0;d<depth;d++){
  const nextBeam:[ReconstructionStateR185[],ReconstructionEdgeR185[]][]=[];
  for(const [states,edges] of beam){const current=states.at(-1)!,visited=new Set(states.map(x=>x.address)),alts=neighbors(current.address,field).filter(([,a])=>!visited.has(a));if(!alts.length){completed.push(summarize(states,edges,source.residual,'DEAD_END'));continue}
   for(const [relation,a] of alts){const s=scoreState(field,a),e=edge(field,current,s,relation),newStates=[...states,s],newEdges=[...edges,e];expandedPaths++;const p=summarize(newStates,newEdges,source.residual,d===depth-1?'DEPTH_LIMIT':'ACTIVE');
    if(p.evidenceFloor<.05||p.temporaryWorsening>.30){completed.push({...p,termination:p.evidenceFloor<.05?'EVIDENCE_FLOOR':'TEMPORARY_WORSENING_LIMIT'});continue}
    if(s.residual<=.08){completed.push({...p,termination:'RESIDUAL_BELOW_0.08'});continue}
    nextBeam.push([newStates,newEdges])}
  }
  const ranked=nextBeam.map(([s,e])=>summarize(s,e,source.residual,'ACTIVE')).sort((a,b)=>a.cost-b.cost||b.improvement-a.improvement||a.id.localeCompare(b.id));
  beam=ranked.slice(0,bw).map(p=>[p.states,p.edges]);if(!beam.length)break
 }
 completed.push(...beam.map(([s,e])=>summarize(s,e,source.residual,'BEAM_SURVIVOR')));
 const survivors=dedupe(completed).filter(p=>p.improvement>0).sort((a,b)=>a.cost-b.cost||b.improvement-a.improvement).slice(0,Math.max(8,bw));const frontier=survivors.filter((p,i,arr)=>!arr.some((q,j)=>i!==j&&dominates(q,p))).map(p=>({...p,pareto:true})).sort((a,b)=>a.cost-b.cost||b.improvement-a.improvement);
 const best=frontier[0]||survivors[0]||null;
 let greedy=source,current=source,visited=new Set<number>([source.address]);for(let i=0;i<depth;i++){const cands=neighbors(current.address,field).filter(([,a])=>!visited.has(a)).map(([rel,a])=>({rel,s:scoreState(field,a)})).sort((x,y)=>x.s.residual-y.s.residual);const g=cands[0];if(!g||g.s.residual>=current.residual-.004)break;current=g.s;greedy=current;visited.add(current.address)}
 return{schema:'OMEGA_MULTIPATH_RECONSTRUCTION_R185',revision:'R185',source,beamWidth:bw,maxDepth:depth,expandedPaths,survivors,paretoFrontier:frontier,best,localGreedyComparator:{available:greedy.address!==source.address,finalState:greedy.stateId,finalResidual:greedy.residual,improvement:source.residual-greedy.residual},truthBoundary:'R185 explores bounded competing chains over actual addressable OMEGA states only. It can retain a temporary local worsening only when bounded by excursion, evidence, scar, reversibility and motion-consistency gates. Surviving paths are ranked on a Pareto frontier; no path mutates CanonState or becomes empirical truth merely because it is internally coherent. External claims still require independent evidence.'}
}
