// Compare independently recomputed R651 Heightened Mode finite differences.
// Derivatives are model diagnostics, never measured physical velocity or causation.
const ORDERS=['velocity','acceleration','jerk'];
const FIELDS=['continuity','burden','scar','contradiction','plasticity'];
const EPS=1e-12;
export function compareDevelopmentalDerivativesR714(left,right){
 if(left?.schema!=='OMEGA_HEIGHTENED_SEQUENCE_R651'||right?.schema!=='OMEGA_HEIGHTENED_SEQUENCE_R651')throw Error('R714 requires recomputed R651 developmental sequences');
 const orders={};
 for(const order of ORDERS){
  const a=left[order],b=right[order];
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)throw Error('R714 derivative sample alignment mismatch');
  let changedSamples=0,peak=null;
  const samples=a.map((nodes,index)=>{
   const other=b[index];
   if(!Array.isArray(nodes)||!Array.isArray(other)||nodes.length!==other.length)throw Error('R714 derivative node alignment mismatch');
   const changedNodes=[];
   for(let j=0;j<nodes.length;j++){
    const l=nodes[j],r=other[j];
    if(typeof l?.id!=='string'||l.id!==r?.id)throw Error('R714 derivative identity drift');
    const delta={};
    for(const field of FIELDS){
     if(typeof l[field]!=='number'||!Number.isFinite(l[field])||typeof r[field]!=='number'||!Number.isFinite(r[field]))throw Error('R714 nonfinite derivative');
     const d=r[field]-l[field];
     delta[field]=d;
     if(Math.abs(d)>EPS&&(!peak||Math.abs(d)>peak.absoluteDelta))peak={sampleIndex:index,nodeId:l.id,field,delta:d,absoluteDelta:Math.abs(d)};
    }
    if(FIELDS.some(field=>Math.abs(delta[field])>EPS)){changedNodes.push({id:l.id,delta});changedSamples++;}
   }
   return {sampleIndex:index,changedNodes};
  });
  orders[order]={sampleCount:samples.length,changedSamples,firstDivergenceIndex:samples.find(s=>s.changedNodes.length)?.sampleIndex??null,peak,samples};
 }
 return {schema:'OMEGA_HEIGHTENED_COUNTERFACTUAL_SENSITIVITY_R714',truthClass:'LOCAL_RECOMPUTED_FINITE_DIFFERENCE_ONLY',orders,
  boundary:'R651 finite-difference sensitivity between two independently recomputed source scenarios. Sample indices refer to model derivatives, not measured time or empirical causation; no physical dimensions, historical equation parity, canonical admission or production proof.'};
}
