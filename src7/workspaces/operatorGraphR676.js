/**
 * R676 recovered TRUE Operator Engine v9.
 * Exact typed topology reconstructed independently from B053 donor:
 * SOURCE_VAULT/original_archives/TRUE_OPERATOR_ENGINE_v9.zip /
 * GraphEdges_v9.csv, Nodes_v9.csv, ENGINE_v9_README.json.
 * All 18,144 directed typed edges match the original donor multiset.
 *
 * This is the historical 1,728-node D×P×R operator graph, NOT a 20,736-D
 * physical manifold. OMEGA's 20,736 canonical address adds a distinct layer
 * axis; collapse is an explicit 12-layer projection with no canonical mutation.
 */
export const R676_SCHEMA='OMEGA_TRUE_OPERATOR_GRAPH_R676';
export const R676_DONOR_PROOF=Object.freeze({
 archive:'OMEGA-B053-NATIVE-FOUNDATION-INTELLIGENCE',
 zip:'SOURCE_VAULT/original_archives/TRUE_OPERATOR_ENGINE_v9.zip',
 nodes:1728,
 typedEdges:18144,
 canonicalSortedEdgeSha256:'9e2e7b03510e8bbcace8e19c993ddac05c2360e2a88173bdb49c70f44e17f42e',
 source:'GraphEdges_v9.csv',
 rowStochasticTolerance:2e-7,
 empiricalPhysics:false,
 productionDeployed:false,
 truth:'EXACT_GRAPH_RECONSTRUCTION_SOURCE_MODEL'
});
const size=1728;
const mod12=x=>(x+12)%12;
export function operatorNodeR676(d,p,r){
 if(![d,p,r].every(x=>Number.isInteger(x)&&x>=0&&x<12))throw Error('R676 invalid D/P/R coordinate');
 return d*144+r*12+p;
}
export function decodeOperatorNodeR676(id){
 if(!Number.isInteger(id)||id<0||id>=size)throw Error('R676 invalid operator node');
 return {d:Math.floor(id/144),p:id%12,r:Math.floor(id%144/12)};
}
export function operatorNodeForAddressR676(address){
 if(!Number.isInteger(address)||address<0||address>=20736)throw Error('R676 invalid OMEGA address');
 const d=Math.floor(address/1728),p=Math.floor(address%1728/144),r=Math.floor(address%144/12),l=address%12;
 return {node:operatorNodeR676(d,p,r),layer:l,address};
}
export function edgesFromOperatorNodeR676(id){
 const {d,p,r}=decodeOperatorNodeR676(id),to=(D,P,R)=>operatorNodeR676(D,P,R);
 const edges=[];
 const add=(dst,weight,type)=>edges.push({src:id,dst,weight,type});
 add(to(d,mod12(p+1),r),1.0,'PHASE_FWD_011');
 add(to(d,mod12(p-1),r),1.0,'PHASE_BWD_01-1');
 if(r<11)add(to(d,p,r+1),0.8,'REG_OUT_011');
 if(r>0)add(to(d,p,r-1),0.8,'REG_IN_01-1');
 if(p<11)add(to(d,p+1,r),0.3,'LOCAL');
 if(p>0)add(to(d,p-1,r),0.3,'LOCAL');
 if(r<11)add(to(d,p,r+1),0.3,'LOCAL');
 if(r>0)add(to(d,p,r-1),0.3,'LOCAL');
 add(to(mod12(d+3),p,r),0.35,'DOMAIN_TRIAD');
 add(to(mod12(d+6),p,r),0.35,'DOMAIN_TRIAD');
 add(to(mod12(d+6),p,r),0.25,'DOMAIN_ANTIPODE');
 return edges;
}
export function* typedOperatorEdgesR676(){for(let id=0;id<size;id++)yield* edgesFromOperatorNodeR676(id)}
const assertVector=(x)=>{
 if(!x||x.length!==size)throw Error('R676 requires exactly 1728 operator values');
 for(let i=0;i<size;i++)if(!Number.isFinite(x[i])||x[i]<0)throw Error('R676 non-finite or negative source value');
};
export function collapseCanonicalFieldR676(field,channel='C'){
 if(field?.count!==20736||!field[channel]||field[channel].length!==20736)throw Error('R676 requires 20736 canonical values');
 const source=field[channel],out=new Float64Array(size);
 for(let d=0;d<12;d++)for(let p=0;p<12;p++)for(let r=0;r<12;r++){
  let total=0;
  for(let l=0;l<12;l++){
   const v=source[d*1728+p*144+r*12+l];
   if(!Number.isFinite(v)||v<0)throw Error('R676 invalid canonical packet at layer '+l);
   total+=v;
  }
  out[operatorNodeR676(d,p,r)]=total/12;
 }
 return out;
}
export function applyOperatorR676(values,operation='P_plus_011'){
 assertVector(values);
 if(!['P_rw','P_plus_011','P_minus_01m1'].includes(operation))throw Error('R676 unrecognized operator');
 const result=new Float64Array(size);
 for(let id=0;id<size;id++){
  const rows=edgesFromOperatorNodeR676(id).filter(e=>
   operation==='P_rw'||(operation==='P_plus_011'
    ?['PHASE_FWD_011','REG_OUT_011','DOMAIN_TRIAD','DOMAIN_ANTIPODE'].includes(e.type)
    :['PHASE_BWD_01-1','REG_IN_01-1'].includes(e.type)));
  let denom=0,num=0;
  for(const e of rows){denom+=e.weight;num+=e.weight*values[e.dst]}
  if(!(denom>0))throw Error('R676 zero operator conductance');
  result[id]=num/denom;
 }
 return result;
}
export function propagateOperatorR676(seed,{iterations=60,eta=0.35,alpha=1,beta=0.85}={}){
 assertVector(seed);
 if(!Number.isInteger(iterations)||iterations<1||iterations>256)throw Error('R676 bounded iteration count required');
 if(![eta,alpha,beta].every(Number.isFinite)||eta<0||eta>1||alpha<0||beta<0)throw Error('R676 invalid propagation coefficients');
 let sum=0;for(const x of seed)sum+=x;
 if(!(sum>0))throw Error('R676 empty seed cannot be normalized');
 let x=Float64Array.from(seed,v=>v/sum);const ledger=[];
 for(let t=0;t<iterations;t++){
  const forward=applyOperatorR676(x,'P_plus_011');
  const reverse=applyOperatorR676(x,'P_minus_01m1');
  const next=new Float64Array(size);let mass=0,residual=0;
  for(let j=0;j<size;j++){const raw=(1-eta)*x[j]+eta*(alpha*forward[j]-beta*reverse[j]);next[j]=Math.max(0,raw);residual+=Math.max(0,-raw);mass+=next[j]}
  if(!(mass>0)||!Number.isFinite(mass))throw Error('R676 propagation collapsed to zero; proof held');
  for(let j=0;j<size;j++)next[j]/=mass;
  ledger.push({step:t+1,preNormalizationMass:mass,clippedNegativeMass:residual});
  x=next;
 }
 return Object.freeze({schema:R676_SCHEMA,operation:'CONSTRUCT_011_MINUS_PRUNE_01m1',sourceModel:R676_DONOR_PROOF.source,
  values:x,ledger,normalization:'CLIP_NONNEGATIVE_THEN_RENORMALIZE',canonicalMutation:false,
  reality:'HISTORICAL_1728_OPERATOR_MODEL_NOT_EMPIRICAL_PHYSICS',nativeParity:'UNVERIFIED'});
}
