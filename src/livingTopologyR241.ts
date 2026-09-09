import type {Mandala20736Field} from './mandala20736Runtime';

export const LIVING_TOPOLOGY_NODE_COUNT_R241=1728;
export const LIVING_TOPOLOGY_BOUNDARY_R241='R241 living topology is a deterministic visual aggregation of the existing 20,736-state packet into 12×12×12 address groups. Gradient, curl and variance values are display/topology proxies derived from packet fields and source routeNext edges; they are not measured physical fluid quantities, execution proof, permission, or CanonState admission.';
export const ARCHIVE_VISUAL_DONORS_R241=[
 'governed_immersive_atlas_engine.html',
 'DeltaT_Turn_Operator_Runtime_Dashboard.html',
 'AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS'
] as const;

export type LivingDecisionR241='STAY'|'TURN'|'ESCALATE'|'UNPROVED';
export type LivingTopologyNodeR241={
 index:number;representativeAddress:number;d:number;p:number;r:number;
 continuity:number;plasticity:number;contradiction:number;burden:number;scar:number;evidence:number;
 phase:number;velocity:number;acceleration:number;closure:number;support:number;turnPressure:number;
 gradientPressure:number;curlProxy:number;neighborVariance:number;decision:LivingDecisionR241
};
export type LivingTopologyLinkR241={from:number;to:number;kind:'ROUTE'|'NEIGHBOR';evidence:number;continuity:number;contradiction:number;residual:number;decision:LivingDecisionR241};
export type LivingTopologyR241={schema:'OMEGA_LIVING_TOPOLOGY_R241';sourceStates:number;aggregateNodes:number;nodes:LivingTopologyNodeR241[];links:LivingTopologyLinkR241[];counts:Record<LivingDecisionR241,number>;boundary:string;donors:readonly string[]};

type AggregateSeed=Omit<LivingTopologyNodeR241,'gradientPressure'|'curlProxy'|'neighborVariance'|'decision'>;
const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const wrap=(x:number)=>((x%12)+12)%12;
const groupIndex=(d:number,p:number,r:number)=>wrap(d)*144+wrap(p)*12+wrap(r);
const sq=(x:number)=>x*x;

function aggregateGroup(field:Mandala20736Field,index:number):AggregateSeed{
 const d=Math.floor(index/144),p=Math.floor(index/12)%12,r=index%12,base=index*12;
 let C=0,Phi=0,q=0,Lambda=0,scar=0,evidence=0,velocity=0,acceleration=0,phx=0,phy=0,best=base,bestScore=-Infinity;
 for(let l=0;l<12;l++){
  const i=base+l;
  C+=field.C[i];Phi+=field.Phi[i];q+=field.q[i];Lambda+=field.Lambda[i];scar+=field.scar[i];evidence+=field.evidence[i];velocity+=field.velocity[i];acceleration+=field.acceleration[i];
  phx+=Math.cos(field.phase[i]);phy+=Math.sin(field.phase[i]);
  const score=.55*field.evidence[i]+.25*field.C[i]+.12*field.Phi[i]+.08*(1-field.q[i]);
  if(score>bestScore){bestScore=score;best=i}
 }
 const n=12,continuity=C/n,plasticity=Phi/n,contradiction=q/n,burden=Lambda/n,scarAvg=scar/n,evidenceAvg=evidence/n,velocityAvg=velocity/n,accelerationAvg=acceleration/n;
 const closure=clamp(continuity/(1+burden+contradiction)),support=clamp(.50*continuity+.24*plasticity+.18*evidenceAvg+.08*(1-scarAvg));
 const turnPressure=clamp(.37*contradiction+.24*burden+.17*scarAvg+.12*Math.min(1,Math.abs(velocityAvg)*4)+.10*Math.min(1,Math.abs(accelerationAvg)*5));
 return{index,representativeAddress:best,d,p,r,continuity,plasticity,contradiction,burden,scar:scarAvg,evidence:evidenceAvg,phase:(Math.atan2(phy,phx)+Math.PI*2)%(Math.PI*2),velocity:velocityAvg,acceleration:accelerationAvg,closure,support,turnPressure};
}

function classify(seed:AggregateSeed,gradientPressure:number,curlProxy:number,neighborVariance:number):LivingDecisionR241{
 if(seed.evidence<.045)return'UNPROVED';
 const localRisk=clamp(seed.turnPressure+.22*Math.min(1,Math.abs(gradientPressure)*4)+.14*Math.min(1,Math.abs(curlProxy)*4)+.16*Math.min(1,neighborVariance*5));
 if(seed.contradiction>.58&&seed.closure<.28&&localRisk>seed.support+.12)return'ESCALATE';
 if(localRisk>seed.support*.88||Math.abs(seed.acceleration)>.11)return'TURN';
 return'STAY';
}

export function compileLivingTopologyR241(field:Mandala20736Field):LivingTopologyR241{
 if(field.count!==20736)throw new Error(`R241 living topology requires exact 20,736-state packet; got ${field.count}`);
 const seeds=Array.from({length:LIVING_TOPOLOGY_NODE_COUNT_R241},(_,i)=>aggregateGroup(field,i));
 const nodes:LivingTopologyNodeR241[]=seeds.map(s=>{
  const dm=seeds[groupIndex(s.d-1,s.p,s.r)],dp=seeds[groupIndex(s.d+1,s.p,s.r)],pm=seeds[groupIndex(s.d,s.p-1,s.r)],pp=seeds[groupIndex(s.d,s.p+1,s.r)],rm=seeds[groupIndex(s.d,s.p,s.r-1)],rp=seeds[groupIndex(s.d,s.p,s.r+1)];
  const gradientPressure=((dp.continuity-dm.continuity)+(pp.plasticity-pm.plasticity)+(rp.velocity-rm.velocity))/3;
  const curlProxy=((pp.velocity-pm.velocity)-(rp.plasticity-rm.plasticity)+(dp.contradiction-dm.contradiction))/3;
  const neighborhood=[dm,dp,pm,pp,rm,rp];
  const neighborVariance=neighborhood.reduce((a,n)=>a+sq(n.closure-s.closure)+.6*sq(n.contradiction-s.contradiction)+.4*sq(n.plasticity-s.plasticity),0)/(neighborhood.length*2);
  return{...s,gradientPressure,curlProxy,neighborVariance,decision:classify(s,gradientPressure,curlProxy,neighborVariance)};
 });
 const links:LivingTopologyLinkR241[]=[];
 for(const n of nodes){
  const routeAddress=field.routeNext[n.representativeAddress],routeGroup=Math.max(0,Math.min(LIVING_TOPOLOGY_NODE_COUNT_R241-1,Math.floor(routeAddress/12)));
  if(routeGroup!==n.index){const b=nodes[routeGroup];links.push({from:n.index,to:routeGroup,kind:'ROUTE',evidence:(n.evidence+b.evidence)/2,continuity:(n.continuity+b.continuity)/2,contradiction:(n.contradiction+b.contradiction)/2,residual:(n.scar+b.scar+n.burden+b.burden)/4,decision:n.decision})}
  const candidates=[groupIndex(n.d+1,n.p,n.r),groupIndex(n.d,n.p+1,n.r),groupIndex(n.d,n.p,n.r+1)];
  let strongest=candidates[0],score=-Infinity;
  for(const idx of candidates){const b=nodes[idx],s=(n.continuity+b.continuity)+(n.evidence+b.evidence)-.65*(n.contradiction+b.contradiction);if(s>score){score=s;strongest=idx}}
  if(strongest!==n.index){const b=nodes[strongest];links.push({from:n.index,to:strongest,kind:'NEIGHBOR',evidence:(n.evidence+b.evidence)/2,continuity:(n.continuity+b.continuity)/2,contradiction:(n.contradiction+b.contradiction)/2,residual:(n.scar+b.scar+n.burden+b.burden)/4,decision:n.decision})}
 }
 const counts:Record<LivingDecisionR241,number>={STAY:0,TURN:0,ESCALATE:0,UNPROVED:0};for(const n of nodes)counts[n.decision]++;
 return{schema:'OMEGA_LIVING_TOPOLOGY_R241',sourceStates:field.count,aggregateNodes:nodes.length,nodes,links,counts,boundary:LIVING_TOPOLOGY_BOUNDARY_R241,donors:ARCHIVE_VISUAL_DONORS_R241};
}

export function livingTopologyReceiptR241(field:Mandala20736Field){const t=compileLivingTopologyR241(field);return{schema:t.schema,sourceStates:t.sourceStates,aggregateNodes:t.aggregateNodes,routeLinks:t.links.filter(x=>x.kind==='ROUTE').length,neighborLinks:t.links.filter(x=>x.kind==='NEIGHBOR').length,counts:t.counts,boundary:t.boundary,donors:t.donors}}
