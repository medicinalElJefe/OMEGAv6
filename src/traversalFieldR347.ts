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
 futureSupport:'normalized admissibility support; never probability without calibrated probability authority'
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
};

export type TraversalFutureR347={
 relation:string;address:number;stateId:number;support:number;x:number;y:number;z:number;decision:string;
 probability:null;truthBoundary:string;
};

export function traversalNodeR347(address:number,step=0):TraversalFieldNodeR347{
 const r=corpusState(address),u=unifiedFromRecord(r),w=deriveWeaveStateR100(address,u,0,1),p=projectionPoint(address,'MANDALA',1000);
 const support=cl(.24*u.C+.20*u.Phi+.20*u.evidence+.14*(1-u.q)+.12*(1-u.Lambda)+.10*u.unifiedCoherence);
 const z=Math.sin(u.phase)*(.28+.52*w.depth)*(w.orientation||1);
 return{address,stateId:r.stateId,step,decision:String(r.metrics.decision),x:(p.x/1000-.5)*2,y:(p.y/1000-.5)*2,z,
  continuity:u.C,plasticity:u.Phi,contradiction:u.q,burden:u.Lambda,scar:u.scar,evidence:u.evidence,
  continuityFlux:w.continuityFlux,invariantCarry:w.invariantCarry,residualCarry:w.residualCarry,recoverability:w.recoverability,
  orientation:w.orientation,effectiveResolution:w.effectiveResolution,motionRate:cl(.55*u.motionRelativity+.45*u.water.conductance),
  modelIntensity:u.light.intensity,actionProxy:u.water.actionProxy,support,eventTime:null,physicalEnergy:null,energyAuthority:'MODEL_PROXY'};
}

export function traversalFuturesR347(address:number):TraversalFutureR347[]{
 const r=corpusState(address),seen=new Set<number>(),rows:TraversalFutureR347[]=[];
 for(const [relation,raw]of alternatives(r)){
  const a=Math.max(0,Math.min(20735,Math.floor(Number(raw))));
  if(!Number.isFinite(a)||seen.has(a)||a===address)continue;seen.add(a);
  const n=traversalNodeR347(a,1);
  rows.push({relation,address:a,stateId:n.stateId,support:n.support,x:n.x,y:n.y,z:n.z,decision:n.decision,probability:null,
   truthBoundary:'R347 support is a deterministic admissibility/readability score derived from the candidate packet; it is not a calibrated probability.'});
 }
 return rows.sort((a,b)=>b.support-a.support);
}

export function compileTraversalFieldR347(startAddress:number,depth=48){
 const route=compileSourceTraversal(startAddress,depth);
 const nodes=route.path.map((x:any,i:number)=>traversalNodeR347(x.address,i));
 const futures=traversalFuturesR347(startAddress);
 return{schema:TRAVERSAL_FIELD_SCHEMA_R347,startAddress,nodes,futures,closed:route.closed,routeBoundary:route.boundary,
  time:{logicalAuthority:'ROUTE_STEP',eventTimeBound:false,renderClockAuthority:'DISPLAY_ONLY'},
  energy:{authority:'MODEL_PROXY',label:'MODEL INTENSITY',physicalEnergyBound:false},
  grammar:TRAVERSAL_VISUAL_GRAMMAR_R347,
  truthBoundary:'R347 visual geometry is a deterministic projection of canonical OMEGA packet state. Logical route time is not wall-clock/event time. Model intensity/action proxy is not physical energy. Future support is not probability. External unit-bound observations may be added only with explicit provenance, units, frame and event time.'};
}
