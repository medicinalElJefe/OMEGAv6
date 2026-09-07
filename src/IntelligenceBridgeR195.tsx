import {useCallback,useEffect,useMemo,useState} from 'react';
import {Activity,BrainCircuit,Cpu,Link2,RefreshCw,ShieldCheck} from 'lucide-react';
import {api} from './platformAdapter';
import {compileIntelligenceBridgeR195} from './intelligenceBridgeR195';
import './intelligenceBridgeR195.css';

type LiveInputs={core?:any;hybrid?:any;capabilities?:any;federation?:any};
const stateClass=(state:string)=>state==='LIVE'?'live':state==='AVAILABLE'?'available':state==='DEVICE_PROOF_REQUIRED'?'hold':'quiet';
const R195_INTELLIGENCE_EVENT='omega-intelligence-proof-r195';

export default function IntelligenceBridgeR195(){
 const[live,setLive]=useState<LiveInputs>({}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[lastRefresh,setLastRefresh]=useState('');
 const refresh=useCallback(async()=>{
  if(busy)return;
  setBusy(true);setError('');
  try{
   const [core,hybrid,capabilities,federation]=await Promise.allSettled([
    api.get<any>('/api/core-health'),
    api.get<any>('/api/hybrid/status'),
    api.get<any>('/api/hybrid/capabilities'),
    api.get<any>('/api/federation/run/status')
   ]);
   const value=(r:PromiseSettledResult<any>)=>r.status==='fulfilled'?r.value.data:undefined;
   setLive({core:value(core),hybrid:value(hybrid),capabilities:value(capabilities),federation:value(federation)});
   setLastRefresh(new Date().toISOString());
   const failures=[core,hybrid,capabilities,federation].filter(x=>x.status==='rejected').length;
   if(failures)setError(`${failures} live proof probe${failures===1?'':'s'} unavailable; unaffected lanes remain independently classified.`);
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
 },[busy]);
 useEffect(()=>{void refresh()},[]); // current-session read-only proof refresh; never queues work
 const bridge=useMemo(()=>compileIntelligenceBridgeR195({...live,measuredAt:lastRefresh||undefined}),[live,lastRefresh]);
 useEffect(()=>{if(!lastRefresh)return;window.dispatchEvent(new CustomEvent(R195_INTELLIGENCE_EVENT,{detail:bridge}))},[bridge,lastRefresh]); // R196.2 read-only projection input; never queues work
 return <section className='r195-bridge' data-r195-schema={bridge.schema} data-canonical-mutation='false'>
  <header className='r195-head'><div><span>R195.1 · AUTHENTICATED INTELLIGENCE BRIDGE</span><h3>AI + SAI + Hybrid, one proof-aware path</h3><p>R195 remains the differential partition-execution layer. R195.1 adds the intelligence bridge above it: grounded SAI may plan and prepare work; R147 remains execution authority; native work crosses Hybrid only after current authenticated device proof; R141 verifies the exact return; R125 alone may admit CanonState.</p></div><button onClick={()=>void refresh()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'Checking':'Refresh proof'}</button></header>
  <div className='r195-state'><div className={`r195-main ${bridge.hybridOnline?'live':'hold'}`}><Link2/><span>BRIDGE</span><b>{bridge.bridgeState.replaceAll('_',' ')}</b><small>{bridge.hybridOnline?`${bridge.deviceCount} current device proof${bridge.deviceCount===1?'':'s'}`:'SAI remains safe proposal mode until heartbeat proof exists'}</small></div><div><BrainCircuit/><span>SAI TRAINER</span><b>{bridge.trainerAvailable?'AVAILABLE':'NOT PROVEN'}</b><small>Availability does not prove trained weights are loaded.</small></div><div><Cpu/><span>HOST BUILD</span><b>{bridge.buildAvailable?'AVAILABLE':'NOT PROVEN'}</b><small>Build still requires governed mission confirmation.</small></div><div><ShieldCheck/><span>CANON</span><b>R125 ONLY</b><small>Execution and proof cannot self-promote.</small></div></div>
  <div className='r195-lanes'>{bridge.lanes.map(lane=><article key={lane.id} className={stateClass(lane.state)}><header><Activity/><div><span>{lane.label}</span><b>{lane.state.replaceAll('_',' ')}</b></div></header><p>{lane.detail}</p><small>{lane.authority}</small></article>)}</div>
  <div className='r195-chain'>{bridge.chain.map((x,i)=><span key={x}><code>{String(i+1).padStart(2,'0')}</code><b>{x.replaceAll('_',' ')}</b></span>)}</div>
  <footer><ShieldCheck/><p><b>Truth membrane:</b> SAI proposal ≠ host execution; heartbeat ≠ returned job; returned job ≠ factual truth; verified result ≠ Canon admission. R194 exact reuse and R195 partition carry remain excluded from Hybrid/build/provider-independent proof where fresh execution is required.</p>{lastRefresh&&<time>{new Date(lastRefresh).toLocaleTimeString()}</time>}</footer>
  {error&&<div className='r195-error'>{error}</div>}
 </section>
}
