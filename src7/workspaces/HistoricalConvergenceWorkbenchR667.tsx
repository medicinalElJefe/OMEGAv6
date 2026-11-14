import {useEffect,useState} from 'react';
import {getMandala20736Field,type Mandala20736Field} from '../../src/mandala20736Runtime';
import {defaultObserverR666,stepObserverR666,normalizeAddressR666,SCALES_R666,type ObserverR666} from './historicalObserverR666';
import {B053_RECOVERY_R665,B053_CAPABILITIES_R665,capabilityAdmissionR665} from './historicalConvergenceR665';
// Browser-local recovery for the actual R666 observer and computed route playback.
// Never restore an untrusted address as CanonState or as an execution receipt.
const SESSION_KEY_R828='omega.r828.historicalObserver';
type SavedObserverR828={observer:ObserverR666;route:number[];routeCursor:number};
function recoverObserverR828():SavedObserverR828|null{
 try{
  const raw=sessionStorage.getItem(SESSION_KEY_R828);if(!raw||raw.length>16000)return null;
  const value=JSON.parse(raw) as SavedObserverR828;
  if(!value||!value.observer||!value.observer.address)return null;
  const a=value.observer.address;
  if(![a.d,a.p,a.r,a.l].every(n=>Number.isInteger(n)&&n>=1&&n<=12))return null;
  if(!Array.isArray(value.observer.position)||value.observer.position.length!==3||!value.observer.position.every(n=>typeof n==='number'&&Number.isFinite(n)))return null;
  if(!Array.isArray(value.observer.velocity)||value.observer.velocity.length!==3||!value.observer.velocity.every(n=>typeof n==='number'&&Number.isFinite(n)))return null;
  if(!Number.isFinite(value.observer.yaw)||!Number.isFinite(value.observer.pitch)||Math.abs(value.observer.pitch)>1.5358897418)return null;
  if(!SCALES_R666.includes(value.observer.scale as typeof SCALES_R666[number]))return null;
  if(!['FIRST_PERSON','FLY','SHELL_FOLLOW','HOST_FOLLOW','PROOF_FOLLOW','ORBIT'].includes(value.observer.mode))return null;
  if(!Number.isSafeInteger(value.observer.revision)||value.observer.revision<0)return null;
  if(!Array.isArray(value.route)||value.route.length>64||!value.route.every(n=>Number.isInteger(n)&&n>=0&&n<20736))return null;
  if(!Number.isInteger(value.routeCursor)||value.routeCursor<0||value.routeCursor>Math.max(0,value.route.length-1))return null;
  return value;
 }catch{return null}
}
const index=(o:ObserverR666)=>(((o.address.d-1)*12+o.address.p-1)*12+o.address.r-1)*12+o.address.l-1;
const address=(i:number)=>normalizeAddressR666({d:Math.floor(i/1728)+1,p:Math.floor(i/144)%12+1,r:Math.floor(i/12)%12+1,l:i%12+1});
export function HistoricalConvergenceWorkbenchR667(){
 const [recovered]=useState<SavedObserverR828|null>(recoverObserverR828);
 const [field,setField]=useState<Mandala20736Field|null>(null),[error,setError]=useState(''),[observer,setObserver]=useState<ObserverR666>(()=>recovered?.observer??defaultObserverR666()),[route,setRoute]=useState<number[]>(()=>recovered?.route??[]);
 useEffect(()=>{let live=true;getMandala20736Field().then(f=>{if(live)setField(f)}).catch(e=>{if(live)setError(String(e))});return()=>{live=false}},[]);
 const i=index(observer),next=field?.routeNext[i]??i;
 const [density,setDensity]=useState(24);
 const [showProof,setShowProof]=useState(false);
 const [routeCursor,setRouteCursor]=useState(()=>recovered?.routeCursor??0);
 useEffect(()=>{try{sessionStorage.setItem(SESSION_KEY_R828,JSON.stringify({observer,route,routeCursor}))}catch{/* Browser storage may be disabled; live execution remains available. */}},[observer,route,routeCursor]);
 const move=(forward:number,strafe:number,vertical=0)=>setObserver(s=>stepObserverR666(s,{dt:.1,forward,strafe,vertical}));
 const trace=()=>{if(!field)return;const seen=new Set<number>(),out:number[]=[];let at=i;for(let k=0;k<64&&!seen.has(at);k++){if(!Number.isInteger(at)||at<0||at>=field.count)break;seen.add(at);out.push(at);at=field.routeNext[at]}setRoute(out);setRouteCursor(0)};
 // Export the actual computed traversal with model metrics, not a fabricated proof receipt.
 const exportTrace=()=>{
  if(!field||route.length===0)return;
  const columns=['step','address_0_based','node_id','continuity','plasticity','contradiction','burden','scar','evidence','next_address_0_based'];
  const rows=route.map((n,k)=>[k+1,n,address(n).node_id,field.C[n],field.Phi[n],field.q[n],field.Lambda[n],field.scar[n],field.evidence[n],field.routeNext[n]]);
  const csv=[columns.join(','),...rows.map(row=>row.join(','))].join('\\r\\n')+'\\r\\n';
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-r829-model-traversal.csv';document.body.appendChild(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const select=(n:number)=>{if(!Number.isInteger(n)||n<0||n>=20736)return;setObserver(s=>({...s,address:address(n),revision:s.revision+1}))};
 const metrics=field?{continuity:field.C[i],plasticity:field.Phi[i],contradiction:field.q[i],burden:field.Lambda[i],scar:field.scar[i],evidence:field.evidence[i],geometry:field.geometry[i],motion:field.motion[i],velocity:field.velocity[i],acceleration:field.acceleration[i]}:null;
 return <section data-r667-historical-workbench='true' style={{margin:'18px 0',padding:18,border:'1px solid #56718a',borderRadius:12}}>
 <h2>Recovered canonical state and observer</h2><p>Historical B053 observer operations bound to the existing 20,736-state model. Computed model-space, not calibrated physical matter.</p>
 {error&&<p role='alert'>{error}</p>}{!field&&<p role='status'>Compiling canonical field…</p>}
 <div style={{display:'flex',flexWrap:'wrap',gap:10,alignItems:'center'}}>
 <label>Sampling <select aria-label='Projection sample stride' value={density} onChange={e=>setDensity(Number(e.target.value))}><option value={96}>216 points</option><option value={24}>864 points</option><option value={6}>3456 points</option><option value={1}>20736 points</option></select></label>
 <label>Scale <select aria-label='Historical scale' value={observer.scale} onChange={e=>setObserver(s=>({...s,scale:e.target.value}))}>{SCALES_R666.map(s=><option key={s}>{s}</option>)}</select></label>
 {(['d','p','r','l'] as const).map(k=><label key={k}>{k.toUpperCase()} <select aria-label={'Address '+k} value={observer.address[k]} onChange={e=>setObserver(s=>({...s,address:normalizeAddressR666({...s.address,[k]:Number(e.target.value)})}))}>{Array.from({length:12},(_,j)=><option key={j+1} value={j+1}>{j+1}</option>)}</select></label>)}
 </div>
 <p data-r828-recovery='browser-session'>Observer and computed route playback recover within this browser session; no canonical state or server receipt is changed.</p>
 <p><strong>{observer.address.node_id}</strong> · position {observer.position.map(x=>x.toFixed(2)).join(', ')} · next {next+1}</p>
 <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
 <button onClick={()=>move(1,0)}>Forward</button><button onClick={()=>move(-1,0)}>Back</button><button onClick={()=>move(0,-1)}>Left</button><button onClick={()=>move(0,1)}>Right</button><button onClick={()=>move(0,0,1)}>Up</button><button onClick={()=>move(0,0,-1)}>Down</button>
 <button onClick={()=>setObserver(s=>stepObserverR666(s,{dt:0,yawDelta:.15}))}>Turn right</button><button onClick={()=>setObserver(s=>stepObserverR666(s,{dt:0,yawDelta:-.15}))}>Turn left</button>
 <button disabled={!field} onClick={()=>select(next)}>Follow computed route</button><button disabled={!field} onClick={trace}>Trace 64 transitions</button><button onClick={()=>{setObserver(defaultObserverR666());setRoute([]);setRouteCursor(0)}}>Reset</button>
 </div>
 {field&&<svg role='img' aria-label='Canonical model-space XY projection sampled from the 20736-state field' viewBox='0 0 640 300' style={{width:'100%',background:'#07121d',borderRadius:8,marginTop:12}}>
 {Array.from({length:Math.ceil(field.count/density)},(_,k)=>k*density).filter(j=>j<field.count).map(j=><circle key={j} cx={320+field.x[j]*235} cy={150-field.y[j]*115} r={1.1+field.evidence[j]*1.2} fill='#74cdd9' opacity={Math.max(.18,field.C[j])}/>)}
 <circle cx={320+field.x[i]*235} cy={150-field.y[i]*115} r='7' fill='none' stroke='#ffca70' strokeWidth='2'/>
 <text x='12' y='20' fill='#c8d9e8' fontSize='12'>MODEL XY PROJECTION · sampled canonical states · selected address outlined</text>
 </svg>}
 {metrics&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8,marginTop:12}}>{Object.entries(metrics).map(([key,value])=><div key={key} style={{padding:10,border:'1px solid #47617a',borderRadius:8}}><small>{key}</small><div>{value.toFixed(5)}</div></div>)}</div>}
 {route.length>0&&<div><h3>Computed routeNext sequence</h3><button type='button' onClick={exportTrace}>Export computed traversal CSV</button><small> Model-space values only; no Canon admission or host proof.</small><p>Route playback position {routeCursor+1} / {route.length} · selected address {i+1}</p><button disabled={routeCursor===0} onClick={()=>{const k=Math.max(0,routeCursor-1);setRouteCursor(k);select(route[k])}}>Previous route state</button><button disabled={routeCursor>=route.length-1} onClick={()=>{const k=Math.min(route.length-1,routeCursor+1);setRouteCursor(k);select(route[k])}}>Next route state</button><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{route.map((n,k)=><button key={k} onClick={()=>{setRouteCursor(k);select(n)}}>{n+1}</button>)}</div></div>}
 <button type='button' aria-expanded={showProof} onClick={()=>setShowProof(x=>!x)}>{showProof?'Hide':'Show'} verification details</button>
 {showProof&&<p role='status'>Historical archive integrity is verified. CI verifies source checks; live visual fidelity and calibrated physical reconstruction remain unverified.</p>}
 <details><summary>Historical provenance and runtime admission</summary><p>B053: {B053_RECOVERY_R665.parts} verified archive parts; {B053_RECOVERY_R665.verifiedFiles} SHA-256 matches; {B053_RECOVERY_R665.nestedArchives} nested ZIPs.</p>{B053_CAPABILITIES_R665.map(c=><p key={c.id}><b>{c.id}</b> {c.archivePath}: {capabilityAdmissionR665(c.id,'RUNTIME_VERIFIED').admitted?'verified':'runtime not verified'}</p>)}</details>
 </section>
}
