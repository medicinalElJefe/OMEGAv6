// Experimental boundary-exchange executor. Representational graph, not a physical law.
const kinds=new Set(['INGRESS','EGRESS','BLOCKED','RESIDUE']);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function evaluateWovenExchangeR621({nodes,exchanges,initial={}}){
 if(!Array.isArray(nodes)||!Array.isArray(exchanges))throw new TypeError('nodes and exchanges required');
 const keys=new Set(nodes);
 if(keys.size!==nodes.length||nodes.some(x=>typeof x!=='string'||!x))throw new Error('unique nonempty node IDs required');
 const stock=Object.fromEntries(nodes.map(id=>[id,initial[id]??0]));
 if(Object.values(stock).some(x=>!finite(x)||x<0))throw new Error('nonnegative finite initial stock required');
 const receipts=[],residues=[],blocked=[],incoming=new Map(nodes.map(x=>[x,0])),outgoing=new Map(nodes.map(x=>[x,0]));
 for(const [index,e] of exchanges.entries()){
  if(!kinds.has(e.kind)||!keys.has(e.from)||!keys.has(e.to)||!finite(e.amount)||e.amount<0)throw new Error('invalid exchange at '+index);
  if(e.kind==='BLOCKED'){blocked.push({index,from:e.from,to:e.to,amount:e.amount,reason:e.reason||'UNSPECIFIED'});continue;}
  if(e.kind==='RESIDUE'){residues.push({index,from:e.from,to:e.to,amount:e.amount,type:e.residueType||'UNTYPED',direction:e.direction||'UNSPECIFIED'});continue;}
  // EGRESS/INGRESS are directional edge readings, never silently reversed.
  outgoing.set(e.from,outgoing.get(e.from)+e.amount);
  incoming.set(e.to,incoming.get(e.to)+e.amount);
  receipts.push({index,kind:e.kind,from:e.from,to:e.to,amount:e.amount});
 }
 // Simultaneous transfer admits cycles and multi-parent convergence; not sequential edge-order dependent.
 for(const id of nodes)if(outgoing.get(id)>stock[id]+incoming.get(id)+1e-9)throw new Error('unfunded outgoing exchange at '+id);
 for(const id of nodes)stock[id]+=incoming.get(id)-outgoing.get(id);
 const initialTotal=nodes.reduce((s,id)=>s+(initial[id]??0),0);
 const finalTotal=nodes.reduce((s,id)=>s+stock[id],0);
 if(Math.abs(initialTotal-finalTotal)>1e-7*Math.max(1,initialTotal))throw new Error('conservation failure');
 const parents=Object.fromEntries(nodes.map(id=>[id,[...new Set(receipts.filter(x=>x.to===id).map(x=>x.from))].sort()]));
 return Object.freeze({schema:'OMEGA_WOVEN_BOUNDARY_EXCHANGE_R621',stocks:stock,parents,receipts,residues,blocked,
  invariant:{initialTotal,finalTotal,conserved:true,simultaneous:true},
  limitations:'Finite nonnegative abstract transferable stock; typed contradiction residue is retained but not resolved; no physical-dimensional or production proof.'});
}
