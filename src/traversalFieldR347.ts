import{corpusState,projectionPoint}from'./corpusRuntime';
import{compileSourceTraversal}from'./sourceBackedModeRuntimeR21';
import{unifiedFromRecord}from'./unifiedCalculus';
import{deriveWeaveStateR100}from'./weaveStateR100';

export const TRAVERSAL_FIELD_SCHEMA_R347='OMEGA_TRAVERSAL_FIELD_R347';
export const TRAVERSAL_VISUAL_GRAMMAR_R347={
 position:'canonical projection/address geometry only',
 edgeWidth:'continuityFlux + invariantCarry',
 branchSpread:'future plasticity + admissible alternative structure',
 compression:'burden Λ',
 fracture:'contradiction q',
 trailPersistence:'scar/history carry',
 opacityFocus:'evidence weight',
 handedness:'signed orientation σ',
 resolutionShell:'effective atlas/address resolution; representational only',
 motionRate:'motionRelativity + water conductance',
 intensity:'model light intensity/action proxy unless unit-bound physical energy is supplied',
 logicalTime:'canonical route step; never labeled event time',
 eventTime:'only externally bound timestamps',
 futureSupport:'existing unifiedCoherence channel for candidate readability; admitted-next relation remains canonical; never probability without calibrated probability authority'
}as const;

const cl=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
const alternatives=(r:any)=>[
 ['ADMITTED_NEXT',r?.autoPing?.dataNext],['PHASE_PLUS',r?.autoPing?.phasePlus],['REGULATION_PLUS',r?.autoPing?.regulationPlus],
 ['LAYER_PLUS',r?.autoPing?.layerPlus],['HOURGLASS_MIRROR',r?.autoPing?.hourglassMirror],['OPPOSITE_DOMAIN',r?.autoPing?.oppositeDomain]
]as const;

export type TraversalFieldNodeR347={
 address:number;stateId:number;step:number;decision:string;x:number;y:number;z:number;
 continuity:number;plasticity:number;contradiction:number;burden:number;scar:number;evidence:number;
 continuityFlux:number;invariantCarry:number;residualCarry:number;recoverability:number;orientation:-1|0|1;
 effectiveResolution:number;motionRate:number;modelIntensity:number;actionProxy:number;support:number;
 eventTime:string|null;physicalEnergy:{value:number;unit:string}|null;energyAuthority:'MODEL_PROXY'|'UNIT_BOUND_PHYSICAL';
 physicalPosition:{x:number;y:number;z:number;unit:string;frame:string}|null;spaceAuthority:'ATLAS_SPACE'|'UNIT_BOUND_PHYSICAL_SPACE';
};

export type TraversalObservationPacketR347={
 address:number;sourceId:string;eventTime:string;receivedAt:string;frame:string;provenance:string[];
 physicalEnergy?:{value:number;unit:string};
 physicalPosition?:{x:number;y:number;z:number;unit:string;frame:string};
};
function validIso(v:string){return Number.isFinite(Date.parse(v))}
export function bindTraversalObservationR347(node:TraversalFieldNodeR347,packet?:TraversalObservationPacketR347|null):TraversalFieldNodeR347{
 if(!packet||packet.address!==node.address||!packet.sourceId||!packet.frame||!Array.isArray(packet.provenance)||!packet.provenance.length||!validIso(packet.eventTime)||!validIso(packet.receivedAt))return node;
 const pe=packet.physicalEnergy,physicalEnergy=pe&&Number.isFinite(pe.value)&&pe.unit.trim()?{value:Number(pe.value),unit:pe.unit.trim()}:null,pp=packet.physicalPosition,physicalPosition=pp&&[pp.x,pp.y,pp.z].every(Number.isFinite)&&pp.unit.trim()&&pp.frame.trim()?{x:Number(pp.x),y:Number(pp.y),z:Number(pp.z),unit:pp.unit.trim(),frame:pp.frame.trim()}:null;
 return{...node,eventTime:new Date(packet.eventTime).toISOString(),physicalEnergy,energyAuthority:physicalEnergy?'UNIT_BOUND_PHYSICAL':'MODEL_PROXY',physicalPosition,spaceAuthority:physicalPosition?'UNIT_BOUND_PHYSICAL_SPACE':'ATLAS_SPACE'};
}

export type TraversalFutureR347={
 relation:string;address:number;stateId:number;support:number;x:number;y:number;z:number;decision:string;
 probability:null;truthBoundary:string;
};

export function traversalNodeR347(address:number,step=0):TraversalFieldNodeR347{
 const r=corpusState(address),u=unifiedFromRecord(r),w=deriveWeaveStateR100(address,u,0,1),p=projectionPoint(address,'MANDALA',1000);
 const support=cl(u.unifiedCoherence);
 const z=Math.sin(u.phase)*(.28+.52*w.depth)*(w.orientation||1);
 return{address,stateId:r.stateId,step,decision:String(r.metrics.decision),x:(p.x/1000-.5)*2,y:(p.y/1000-.5)*2,z,
  continuity:u.C,plasticity:u.Phi,contradiction:u.q,burden:u.Lambda,scar:u.scar,evidence:u.evidence,
  continuityFlux:w.continuityFlux,invariantCarry:w.invariantCarry,residualCarry:w.residualCarry,recoverability:w.recoverability,
  orientation:w.orientation,effectiveResolution:w.effectiveResolution,motionRate:cl(.55*u.motionRelativity+.45*u.water.conductance),
  modelIntensity:u.light.intensity,actionProxy:u.water.actionProxy,support,eventTime:null,physicalEnergy:null,energyAuthority:'MODEL_PROXY',physicalPosition:null,spaceAuthority:'ATLAS_SPACE'};
}

export function traversalFuturesR347(address:number):TraversalFutureR347[]{
 const r=corpusState(address),seen=new Set<number>(),rows:TraversalFutureR347[]=[];
 for(const [relation,raw]of alternatives(r)){
  const a=Math.max(0,Math.min(20735,Math.floor(Number(raw))));
  if(!Number.isFinite(a)||seen.has(a)||a===address)continue;seen.add(a);
  const n=traversalNodeR347(a,1);
  rows.push({relation,address:a,stateId:n.stateId,support:n.support,x:n.x,y:n.y,z:n.z,decision:n.decision,probability:null,
   truthBoundary:'R347 support is the existing candidate unifiedCoherence channel used only for visual readability; ADMITTED_NEXT is the canonical route relation. Support is not a calibrated probability or a replacement route score.'});
 }
 return rows.sort((a,b)=>b.support-a.support);
}

export function compileTraversalFieldR347(startAddress:number,depth=48,observations:TraversalObservationPacketR347[]=[]){
 const route=compileSourceTraversal(startAddress,depth),obs=new Map(observations.map(x=>[x.address,x]));
 const nodes=route.path.map((x:any,i:number)=>bindTraversalObservationR347(traversalNodeR347(x.address,i),obs.get(x.address)));
 const futures=traversalFuturesR347(startAddress),physicalPositions=nodes.filter(x=>x.physicalPosition).map(x=>x.physicalPosition!),spaceCompatible=nodes.length>0&&physicalPositions.length===nodes.length&&physicalPositions.every(x=>x.frame===physicalPositions[0].frame&&x.unit===physicalPositions[0].unit);
 return{schema:TRAVERSAL_FIELD_SCHEMA_R347,startAddress,nodes,futures,closed:route.closed,routeBoundary:route.boundary,
  time:{logicalAuthority:'ROUTE_STEP',eventTimeBound:nodes.some(x=>!!x.eventTime),renderClockAuthority:'DISPLAY_ONLY'},
  space:{authority:spaceCompatible?'UNIT_BOUND_PHYSICAL_SPACE':'ATLAS_SPACE',physicalPositionBound:spaceCompatible,frame:spaceCompatible?physicalPositions[0].frame:null,unit:spaceCompatible?physicalPositions[0].unit:null,mixedFrameHold:physicalPositions.length>0&&!spaceCompatible},
  energy:{authority:nodes.some(x=>x.energyAuthority==='UNIT_BOUND_PHYSICAL')?'UNIT_BOUND_PHYSICAL':'MODEL_PROXY',label:nodes.some(x=>x.energyAuthority==='UNIT_BOUND_PHYSICAL')?'PHYSICAL ENERGY / MODEL INTENSITY':'MODEL INTENSITY',physicalEnergyBound:nodes.some(x=>x.energyAuthority==='UNIT_BOUND_PHYSICAL')},
  grammar:TRAVERSAL_VISUAL_GRAMMAR_R347,
  truthBoundary:'R347 visual geometry is a deterministic projection of canonical OMEGA packet state. Logical route time is not wall-clock/event time. Model intensity/action proxy is not physical energy. Future support is not probability. External unit-bound observations may add physical position or energy only with explicit provenance, units, frame and event time. Atlas position remains separate from physical position.'};
}
