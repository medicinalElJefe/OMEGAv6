import {useEffect,useMemo,useState} from 'react';
import {Activity,BrainCircuit,Link2,ShieldCheck} from 'lucide-react';
import {api} from './platformAdapter';
import './livingRuntimePulseR33.css';

type Props={onNavigate:(panel:string)=>void;compact?:boolean};
const age=(at:number)=>{if(!at)return'waiting';const s=Math.max(0,Math.round((Date.now()-at)/1000));return s<60?`${s}s`:s<3600?`${Math.floor(s/60)}m`:`${Math.floor(s/3600)}h`};
export default function LivingRuntimePulseR33({onNavigate,compact=false}:Props){
 const[snapshot,setSnapshot]=useState<any>(null),[error,setError]=useState('');
 const refresh=async()=>{try{const r=await api.get<any>('/api/runtime/snapshot');setSnapshot(r.data);setError('')}catch(e:any){setError(e?.code||'RUNTIME_UNAVAILABLE')}};
 useEffect(()=>{let alive=true;const go=async()=>{if(alive)await refresh()};void go();const id=window.setInterval(()=>void go(),3500);return()=>{alive=false;window.clearInterval(id)}},[]);
 const online=useMemo(()=>((snapshot?.devices||[]) as any[]).filter(x=>x.online&&!x.revoked),[snapshot]),mission=useMemo(()=>[...((snapshot?.missions||[]) as any[])].reverse().find(x=>['ACTIVE','HOLD_REPAIR_REQUIRED','PAUSED'].includes(x.status)),[snapshot]),last=snapshot?.lastEvent;
 const status=error?'DEGRADED':online.length?'PC ONLINE':snapshot?.paired?'PAIRING READY':'CLOUD LIVE';
 return <section className={compact?'r33-runtime-pulse compact':'r33-runtime-pulse'} aria-label='Live OMEGA enacted runtime'>
  <header><Activity/><div><b>{status}</b><small>{last?`${last.type} · ${age(last.at)} ago`:'durable runtime waiting for activity'}</small></div><i className={online.length?'live':''}/></header>
  <div className='r33-runtime-facts'><button onClick={()=>onNavigate('Command Center')}><BrainCircuit/><span><b>{snapshot?.thread?.memoryTurns||0}</b><small>remembered turns</small></span></button><button onClick={()=>onNavigate('Hybrid Link')}><Link2/><span><b>{online.length}</b><small>proved PC{online.length===1?'':'s'}</small></span></button><button onClick={()=>onNavigate(mission?'Hybrid Link':'Evidence & Proof')}><ShieldCheck/><span><b>{snapshot?.activeJobs||0}</b><small>{mission?`${mission.status} mission`:'active jobs'}</small></span></button></div>
  {last&&<button className='r33-runtime-event' onClick={()=>onNavigate(last.type?.includes('DEVICE')||last.type?.includes('JOB')||last.type?.includes('MISSION')?'Hybrid Link':'Command Center')}><span>{last.message}</span><small>Open enacted state</small></button>}
 </section>
}
