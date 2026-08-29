import {corpusState} from './corpusRuntime';
import type {Mandala20736Field} from './mandala20736Runtime';
import type {CompilerLineageId} from './compilerLineageRuntime';
export type SpineView='FIELD'|'OCCUPANCY'|'PREDICTION'|'XRAY';
export const SPINE_VIEWS:SpineView[]=['FIELD','OCCUPANCY','PREDICTION','XRAY'];
const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
export function compilePcExecutionSpine(address:number,lineage:CompilerLineageId,depthLabel:string,lens:string){const r=corpusState(address),m=r.metrics,g=r.geometry,p=r.predict,a=r.autoPing,epsilon=.05,kernel=(Number(m.continuity)*Number(m.plasticity))/(Number(m.contradiction)+Number(m.burden)+epsilon);return{version:'PC_EXECUTION_SPINE_ADAPTED_V1',source:'CANON CONSOLE OMEGA v7 integration report',stages:[
{id:'CAMERA',label:'camera',value:depthLabel,detail:`lineage ${lineage}`},
{id:'FEATURE',label:'feature field',value:Number(m.geometry).toFixed(3),detail:`motion ${Number(r.math.normalizedMotionRelativity).toFixed(3)} · symmetry ${Number(g.symmetry).toFixed(3)}`},
{id:'CANON',label:'canon state',value:String(r.stateId),detail:`CΩ ${Number(m.continuity).toFixed(3)} · Φ ${Number(m.plasticity).toFixed(3)} · q ${Number(m.contradiction).toFixed(3)} · Λ ${Number(m.burden).toFixed(3)}`},
{id:'ATLAS',label:'runtime atlas sample',value:String(address+1),detail:`next ${Number(a.dataNext)+1} · evidence ${Number(m.evidence).toFixed(3)}`},
{id:'KERNEL',label:'unified kernel',value:kernel.toFixed(3),detail:`${m.decision} · ${lens}`},
{id:'LEARNING',label:'adaptive learning',value:Number(p.forecastScore).toFixed(3),detail:`reconstruct ${Number(p.reconstructability).toFixed(3)} · scar ${Number(m.scar).toFixed(3)}`},
{id:'RENDER',label:'renderer / panels',value:'BOUND',detail:'source packet → semantic camera'}],kernel,boundary:'Adapted browser execution spine. It preserves the archived stage order and current corpus correspondence; it is not a claim that every historical native package is fully code-merged.'}}
export function spineViewWeight(f:Mandala20736Field,i:number,view:SpineView,base:number){if(view==='OCCUPANCY')return cl(.18*base+.28*f.geometry[i]+.18*f.C[i]+.14*f.evidence[i]+.12*(1-f.q[i])+.10*f.symmetry[i]);if(view==='PREDICTION')return cl(.18*base+.24*f.forecast[i]+.18*f.continuityGate[i]+.15*f.Phi[i]+.12*f.evidence[i]+.08*f.motionDrive[i]+.05*(1-f.route[i]));if(view==='XRAY')return cl(.14*base+.24*f.geometry[i]+.20*f.symmetry[i]+.18*f.evidence[i]+.12*(1-f.q[i])+.07*f.scar[i]+.05*f.motion[i]);return cl(base)}
export function appendSpineLedger(packet:{version:string;stages:any[]},address:number,lineage:CompilerLineageId,view:SpineView){if(typeof localStorage==='undefined')return;const key='omega.pc.spine.ledger';let old:any[]=[];try{old=JSON.parse(localStorage.getItem(key)||'[]')}catch{}const entry={ts:new Date().toISOString(),address,stateId:address+1,lineage,view,version:packet.version,kernel:packet.stages.find(x=>x.id==='KERNEL')?.value};localStorage.setItem(key,JSON.stringify([...old,entry].slice(-188)))}
