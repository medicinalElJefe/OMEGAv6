import {evaluateWovenExchangeR621} from './wovenBoundaryExchangeR621.mjs';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const point=(v)=>Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)));
/** Sample explicit state transitions; frames and address scales remain representational. */
export function traverseDevelopmentalContinuityR622({nodes,initial={},frames,dt=1,observer='CANONICAL'}){
 if(!Array.isArray(frames)||frames.length===0||!finite(dt)||dt<=0)throw new Error('nonempty frames and positive finite dt required');
 if(!Array.isArray(nodes)||nodes.length===0)throw new Error('nodes required');
 let state={...initial};const timeline=[point(Object.fromEntries(nodes.map(x=>[x,state[x]??0])))],receipts=[];
 for(const [index,frame] of frames.entries()){
  const result=evaluateWovenExchangeR621({nodes,initial:state,exchanges:frame.exchanges});
  if(result.invariant.conserved!==true)throw new Error('nonconservative transition');
  state=point(result.stocks);timeline.push(state);
  receipts.push({frame:index+1,observer,parents:result.parents,blocked:result.blocked,residues:result.residues,conservation:result.invariant});
 }
 const derive=(series)=>series.slice(1).map((x,i)=>point(Object.fromEntries(nodes.map(k=>[k,(x[k]-series[i][k])/dt]))));
 const velocity=derive(timeline),acceleration=derive(velocity),jerk=derive(acceleration);
 const curvature=acceleration.map((a,i)=>point(Object.fromEntries(nodes.map(k=>[k,Math.abs(a[k])/Math.pow(1+velocity[i+1][k]**2,1.5)]))));
 return {schema:'OMEGA_DEVELOPMENTAL_TRAVERSAL_R622',dt,observer,nodes:[...nodes],timeline,velocity,acceleration,jerk,curvature,receipts,
  invariants:{conservedEveryFrame:receipts.every(r=>r.conservation.conserved),frames:frames.length},
  limitations:'Discrete scalar rate/curvature instruments, not a spacetime metric; difference-based jerk requires >=3 transfers; no evidence of physical dimensionality or historical parity.'};
}
