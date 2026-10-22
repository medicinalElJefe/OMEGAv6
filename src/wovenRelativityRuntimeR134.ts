import {corpusState,decodeAddress,encodeAddress,STATE_COUNT,type Projection} from './corpusRuntime';
import {compilePhysicsRelativityR132} from './physicsRelativityRuntimeR132';
import {BUILD_POTENTIAL_LANES_R133} from './buildPotentialRuntimeR133';

export const R134_REVISION='R134' as const;
export const R134_SCHEMA='OMEGA_WOVEN_RELATIVITY_CONTINUUM_R134' as const;
export const R134_CONTINUITY_LAW='partition -> transform/exchange -> invariant carry -> scar/history carry -> re-contextualize -> repartition' as const;
export const R134_TRUTH_CLASSES=['CANONICAL_ADJACENCY','DERIVED_ROUTE_CANDIDATE','OBSERVED_EVIDENCE','EXECUTION_RECEIPT','OPERATIONAL_STATUS','REPRESENTATIONAL_PROJECTION','GATED'] as const;
export type R134TruthClass=typeof R134_TRUTH_CLASSES[number];
export type R134LodId='FRAME_144'|'VOLUME_1728'|'FULL_20736';
export type R134ObserverFrame='GLOBAL'|'LOCAL';
export type R134Axis='D'|'P'|'R'|'L';

export const R134_LODS=[
 {id:'FRAME_144' as R134LodId,count:144,label:'144 · FRAME',vary:['D','P'] as R134Axis[],fixed:['R','L'] as R134Axis[],boundary:'D/P vary inside the selected R/L observer frame.'},
 {id:'VOLUME_1728' as R134LodId,count:1728,label:'1,728 · VOLUME',vary:['D','P','R'] as R134Axis[],fixed:['L'] as R134Axis[],boundary:'D/P/R vary inside the selected L observer frame.'},
 {id:'FULL_20736' as R134LodId,count:20736,label:'20,736 · FULL',vary:['D','P','R','L'] as R134Axis[],fixed:[] as R134Axis[],boundary:'All canonical address coordinates are represented.'}
] as const;

const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const tau=Math.PI*2;
const axisValue=(c:ReturnType<typeof decodeAddress>,axis:R134Axis)=>axis==='D'?c.d:axis==='P'?c.p:axis==='R'?c.r:c.l;
const setAxis=(c:ReturnType<typeof decodeAddress>,axis:R134Axis,v:number)=>axis==='D'?encodeAddress(v,c.p,c.r,c.l):axis==='P'?encodeAddress(c.d,v,c.r,c.l):axis==='R'?encodeAddress(c.d,c.p,v,c.l):encodeAddress(c.d,c.p,c.r,v);

export function selectAdaptiveLodR134(width:number,dpr:number,zoom:number,requested:'AUTO'|R134LodId='AUTO'):R134LodId{
 if(requested!=='AUTO')return requested;
 const budget=Math.max(1,width)*Math.max(1,Math.min(3,dpr))*Math.max(.55,zoom);
 return budget>=1900?'FULL_20736':budget>=760?'VOLUME_1728':'FRAME_144';
}

export function addressesForLodR134(anchor:number,lod:R134LodId){
 const c=decodeAddress(anchor),out:number[]=[];
 if(lod==='FRAME_144')for(let d=0;d<12;d++)for(let p=0;p<12;p++)out.push(encodeAddress(d,p,c.r,c.l));
 else if(lod==='VOLUME_1728')for(let d=0;d<12;d++)for(let p=0;p<12;p++)for(let r=0;r<12;r++)out.push(encodeAddress(d,p,r,c.l));
 else for(let i=0;i<STATE_COUNT;i++)out.push(i);
 return out;
}

function minimalDelta12(v:number,origin:number){let d=v-origin;if(d>6)d-=12;if(d<-6)d+=12;return d/6;}
export function projectedPositionR134(address:number,anchor:number,frame:R134ObserverFrame,projection:Projection){
 const c=decodeAddress(address),a=decodeAddress(anchor);
 const raw=frame==='LOCAL'?[minimalDelta12(c.d,a.d),minimalDelta12(c.p,a.p),minimalDelta12(c.r,a.r),minimalDelta12(c.l,a.l)]:[(c.d-5.5)/5.5,(c.p-5.5)/5.5,(c.r-5.5)/5.5,(c.l-5.5)/5.5];
 if(projection==='MANDALA'){
  const A=tau*(c.d+(c.p+.5)/12)/12,B=tau*(c.r+(c.l+.5)/12)/12,local=frame==='LOCAL'?.62:1;
  return [Math.cos(A)*local,Math.sin(A)*local,Math.cos(B)*local,Math.sin(B)*local] as const;
 }
 if(projection==='THREAD')return [((c.d*12+c.p)-71.5)/71.5,((c.r*12+c.l)-71.5)/71.5,(c.p-c.r)/11,(c.d-c.l)/11] as const;
 if(projection==='INVERSE')return [-raw[0],-raw[1],-raw[2],-raw[3]] as const;
 return raw as readonly [number,number,number,number];
}

function localSpectrumR134(address:number,source:number[],authority:number[]){
 const c=decodeAddress(address),phase=tau*(c.d+2*c.p+3*c.r+5*c.l)/144;
 let s=0,w=0;
 for(let k=0;k<12;k++){
  const a=(source[k]||0)*.62+(authority[k]||0)*.38,theta=phase*(k+1)+tau*(k+1)*(c.l+.5)/144;
  s+=a*(.5+.5*Math.cos(theta));w+=Math.max(.001,a);
 }
 return clamp(w?s/w:.5);
}

export type R134Point={
 address:number;position:readonly [number,number,number,number];C:number;Phi:number;q:number;Lambda:number;scar:number;evidence:number;motion:number;geometry:number;
 modeResponse:number;invariantCarry:number;scarCarry:number;proofWeight:number;routeWeight:number;
};
export type R134Edge={from:number;to:number;axis:R134Axis|'ROUTE';truth:R134TruthClass;transport:number;scarGradient:number;proofWeight:number;routeWeight:number};

function pointOf(address:number,anchor:number,frame:R134ObserverFrame,projection:Projection,source:number[],authority:number[],routeSet:Set<number>):R134Point{
 const r=corpusState(address),C=clamp(Number(r.metrics.continuity)),Phi=clamp(Number(r.metrics.plasticity)),q=clamp(Number(r.metrics.contradiction)),Lambda=clamp(Number(r.metrics.burden)),scar=clamp(Number(r.metrics.scar)),evidence=clamp(Number(r.metrics.evidence)),motion=clamp(Number(r.math.normalizedMotionRelativity)),geometry=clamp(Number(r.metrics.geometry)),modeResponse=localSpectrumR134(address,source,authority);
 const invariantCarry=clamp(C*(.58+.42*Phi)*(1-.55*q)*(1-.45*Lambda)),scarCarry=clamp(scar*(.42+.58*motion)),proofWeight=clamp(evidence*(1-q)*(1-Lambda));
 return{address,position:projectedPositionR134(address,anchor,frame,projection),C,Phi,q,Lambda,scar,evidence,motion,geometry,modeResponse,invariantCarry,scarCarry,proofWeight,routeWeight:address===anchor?1:routeSet.has(address)?.48:0};
}

export function compileWovenRelativityR134(anchor:number,lod:R134LodId='VOLUME_1728',projection:Projection='MANDALA',frame:R134ObserverFrame='GLOBAL'){
 const physics=compilePhysicsRelativityR132(anchor),source=physics.sourceModeField.harmonics.map(x=>x.amplitude),authority=physics.canonAuthorityField.harmonics.map(x=>x.amplitude),addresses=addressesForLodR134(anchor,lod),addressSet=new Set(addresses),routePath=physics.dynamics.route.path.map((x:any)=>Number(x.address)).filter(Number.isFinite),routeSet=new Set(routePath),points=addresses.map(a=>pointOf(a,anchor,frame,projection,source,authority,routeSet)),byAddress=new Map(points.map(p=>[p.address,p]));
 const meta=R134_LODS.find(x=>x.id===lod)!,edges:R134Edge[]=[];
 for(const from of addresses){
  const c=decodeAddress(from),A=byAddress.get(from)!;
  for(const axis of meta.vary){const v=axisValue(c,axis);if(v>=11)continue;const to=setAxis(c,axis,v+1);if(!addressSet.has(to))continue;const B=byAddress.get(to)!;edges.push({from,to,axis,truth:'CANONICAL_ADJACENCY',transport:clamp(Math.sqrt(A.invariantCarry*B.invariantCarry)*(1-Math.abs(A.q-B.q)*.35)),scarGradient:clamp(Math.abs(A.scarCarry-B.scarCarry)),proofWeight:Math.min(A.proofWeight,B.proofWeight),routeWeight:A.routeWeight&&B.routeWeight?Math.min(A.routeWeight,B.routeWeight):0})}
 }
 const routeEdges:R134Edge[]=[];
 for(let i=0;i<routePath.length-1;i++){
  const from=routePath[i],to=routePath[i+1],A=byAddress.get(from)||pointOf(from,anchor,frame,projection,source,authority,routeSet),B=byAddress.get(to)||pointOf(to,anchor,frame,projection,source,authority,routeSet);
  routeEdges.push({from,to,axis:'ROUTE',truth:'DERIVED_ROUTE_CANDIDATE',transport:clamp(mean([A.invariantCarry,B.invariantCarry,A.modeResponse,B.modeResponse])),scarGradient:clamp(mean([A.scarCarry,B.scarCarry])),proofWeight:Math.min(A.proofWeight,B.proofWeight),routeWeight:1});
 }
 const development=BUILD_POTENTIAL_LANES_R133.map(x=>({lane:x.lane,count:x.count,priority:x.priority,truth:'OPERATIONAL_STATUS' as R134TruthClass}));
 return{
  schema:R134_SCHEMA,revision:R134_REVISION,anchor,lod,frame,projection,points,edges,routeEdges,physics,development,
  counts:{points:points.length,canonicalEdges:edges.length,routeCandidateEdges:routeEdges.length,sourceModes:physics.sourceModeField.registryCount,canonAuthorities:physics.canonAuthorityField.count},
  continuityLaw:R134_CONTINUITY_LAW,
  observerLaw:'Whole/part, inner/outer and representation are observer-frame roles. GLOBAL and LOCAL change coordinates of view without mutating CanonState.',
  causalityBoundary:'CANONICAL_ADJACENCY is structural address topology. DERIVED_ROUTE_CANDIDATE is an OMEGA computational route. Neither is promoted to empirical physical causation without independent observed evidence and an admitted proof receipt.',
  dimensionBoundary:'144 -> 1,728 -> 20,736 are adaptive atlas/address resolution levels, not literal spacetime dimensions.',
  authorityBoundary:'Visualization, Hybrid execution receipts, swarm returns and development status do not mutate CanonState. Canonical admission remains governed by the existing R125 admission authority.'
 };
}
