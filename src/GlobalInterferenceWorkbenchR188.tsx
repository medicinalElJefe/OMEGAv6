import {useEffect,useRef,useState} from 'react';
import {Activity,ShieldCheck,Square,Waypoints} from 'lucide-react';
import type {Mandala20736Field} from './mandala20736Runtime';
import type {AnalysisCacheR189} from './analysisCacheR189';
import {scanGlobalInterferenceR188,type GlobalInterferenceAtlasR188 as Atlas} from './globalInterferenceAtlasR188';
import GlobalInterferenceAtlasR188 from './GlobalInterferenceAtlasR188';
import './globalInterferenceWorkbenchR188.css';

export default function GlobalInterferenceWorkbenchR188({field,cache,onSelectAddress,chunkSize=256}:{field:Mandala20736Field;cache:AnalysisCacheR189;onSelectAddress:(address:number)=>void;chunkSize?:number}){
 const[atlas,setAtlas]=useState<Atlas|null>(null),[busy,setBusy]=useState(false),[progress,setProgress]=useState(0),[error,setError]=useState('');const controller=useRef<AbortController|null>(null),boundedChunk=Math.max(32,Math.min(1024,Math.round(Number(chunkSize)||256)));
 useEffect(()=>()=>controller.current?.abort(),[]);
 const run=async()=>{controller.current?.abort();const next=new AbortController();controller.current=next;setBusy(true);setError('');setProgress(0);try{const result=await scanGlobalInterferenceR188(field,setProgress,next.signal,boundedChunk,cache);if(!next.signal.aborted)setAtlas(result)}catch(e:any){if(e?.name!=='AbortError')setError(e?.message||String(e))}finally{if(controller.current===next){setBusy(false);controller.current=null}}};
 const cancel=()=>{controller.current?.abort();controller.current=null;setBusy(false)};
 const stats=cache.stats();
 return <section className='global-workbench-r188'><header><div><span>FULL-FIELD ANALYSIS · OPERATOR INVOKED · R191 BOUNDED</span><b>20,736-state interference atlas</b><small>The scan is never automatic. It reuses the exact R189 state cache and accepts only a bounded R191 compute-envelope chunk size. Browser analysis does not replace R185 performance authority, R147 dispatch, R146 durable history, or R125 CanonState admission.</small></div><div className='actions'>{busy?<button onClick={cancel}><Square/>Cancel scan</button>:<button onClick={run}><Waypoints/>{atlas?'Recompile full field':'Compile full field'}</button>}</div></header>{busy&&<div className='progress'><Activity/><span><i><em style={{width:`${Math.round(progress*100)}%`}}/></i><b>{Math.round(progress*100)}%</b></span><small>Scanning actual address states in UI-yielding chunks of {boundedChunk.toLocaleString()} · cached states {stats.cachedStates.toLocaleString()}.</small></div>}{error&&<div className='error'>{error}</div>}{!atlas&&!busy&&<div className='boundary'><ShieldCheck/><span>Local R184–R187 computation remains immediately available. Full-field aggregation runs only when requested; R191 may bound chunk cost but cannot auto-run the scan or choose an executor.</span></div>}{atlas&&<GlobalInterferenceAtlasR188 atlas={atlas} onSelectAddress={onSelectAddress}/>}</section>
}