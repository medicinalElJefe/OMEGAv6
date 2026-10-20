// R651 executable relational carry kernel. Computational model, not a new physical primitive.
// Typed directed edges allow cycles, merging parents, return paths and blocked ingress.
export const EDGE_KINDS=Object.freeze(['INGRESS','EGRESS','BLOCKED','RESIDUE','RETURN']);
const finite=(x,label)=>{if(typeof x!=='number'||!Number.isFinite(x))throw Error('invalid '+label);return x};
const clamp=x=>Math.max(0,Math.min(1,x));
export function normalizeState(s){if(!s||typeof s!=='object'||!String(s.id||''))throw Error('state id required');return Object.freeze({id:String(s.id),continuity:clamp(finite(s.continuity??0,'continuity')),burden:Math.max(0,finite(s.burden??0,'burden')),contradiction:Math.max(0,finite(s.contradiction??0,'contradiction')),plasticity:clamp(finite(s.plasticity??1,'plasticity')),scar:Math.max(0,finite(s.scar??0,'scar'))})}
export function normalizeEdge(e,ids){if(!e||!ids.has(e.from)||!ids.has(e.to))throw Error('edge endpoints required');if(!EDGE_KINDS.includes(e.kind))throw Error('invalid edge kind');const weight=finite(e.weight??1,'edge weight');if(weight<0||weight>1)throw Error('edge weight outside [0,1]');return Object.freeze({from:e.from,to:e.to,kind:e.kind,weight})}
export function evolveWovenField({nodes,edges,pressure={},step=0.1}={}){
 if(!Array.isArray(nodes)||!Array.isArray(edges)||!nodes.length||nodes.length>20736)throw Error('bounded nodes required');
 finite(step,'step');if(step<=0||step>1)throw Error('step outside (0,1]');
 const states=nodes.map(normalizeState),ids=new Set(states.map(x=>x.id));if(ids.size!==states.length)throw Error('duplicate node id');
 const links=edges.map(e=>normalizeEdge(e,ids)),delta=new Map(states.map(s=>[s.id,0]));
 const byId=new Map(states.map(s=>[s.id,s]));const ledger=[];
 for(const e of links){const from=byId.get(e.from),to=byId.get(e.to);
  if(e.kind==='BLOCKED'){ledger.push({kind:'BLOCKED',from:e.from,to:e.to,carried:0});continue}
  const available=from.continuity*from.plasticity;
  const gradient=e.kind==='RETURN'?available-to.continuity:Math.max(0,available-to.continuity);
  const carried=Math.min(from.continuity,Math.max(0,gradient)*e.weight*step);
  delta.set(e.from,delta.get(e.from)-carried);delta.set(e.to,delta.get(e.to)+carried);
  ledger.push({kind:e.kind,from:e.from,to:e.to,carried});
 }
 const next=states.map(s=>{const external=pressure[s.id]??0;finite(external,'pressure');const c=clamp(s.continuity+delta.get(s.id)+external*step);
 const loss=Math.max(0,s.continuity+delta.get(s.id)+external*step-c);
 return Object.freeze({...s,continuity:c,scar:s.scar+loss,contradiction:s.contradiction+loss,plasticity:clamp(s.plasticity-loss)})});
 return Object.freeze({schema:'OMEGA_WOVEN_FIELD_STEP_R651',truthClass:'EXECUTABLE_MODEL_NOT_EMPIRICAL_PHYSICS',nodes:next,ledger,netContinuityDelta:next.reduce((a,s)=>a+s.continuity,0)-states.reduce((a,s)=>a+s.continuity,0)});
}
export function developmentalDifference(previous,current){const a=new Map(previous.map(normalizeState).map(x=>[x.id,x]));return current.map(normalizeState).map(s=>{const p=a.get(s.id);if(!p)throw Error('missing previous node '+s.id);return {id:s.id,continuity:s.continuity-p.continuity,burden:s.burden-p.burden,contradiction:s.contradiction-p.contradiction,plasticity:s.plasticity-p.plasticity,scar:s.scar-p.scar}})}
export function heightenedSequence(frames,dt=1){finite(dt,'dt');if(dt<=0)throw Error('dt must be positive');if(!Array.isArray(frames)||frames.length<4)throw Error('four frames required for jerk');const vectors=[];for(let i=1;i<frames.length;i++)vectors.push(developmentalDifference(frames[i-1],frames[i]));const derivatives=[vectors];for(let order=2;order<=3;order++){const prev=derivatives.at(-1);derivatives.push(prev.slice(1).map((v,i)=>v.map((p,j)=>({id:p.id,continuity:(p.continuity-prev[i][j].continuity)/dt,burden:(p.burden-prev[i][j].burden)/dt,contradiction:(p.contradiction-prev[i][j].contradiction)/dt,plasticity:(p.plasticity-prev[i][j].plasticity)/dt,scar:(p.scar-prev[i][j].scar)/dt}))))}return {schema:'OMEGA_HEIGHTENED_SEQUENCE_R651',velocity:vectors.map(v=>v.map(x=>({...x,continuity:x.continuity/dt}))),acceleration:derivatives[1],jerk:derivatives[2],boundary:'finite-difference developmental diagnostics; not physical motion'};}
