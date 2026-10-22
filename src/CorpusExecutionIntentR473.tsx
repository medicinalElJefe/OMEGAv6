import {X} from 'lucide-react';
import type {CorpusExecutionStateR473} from './yearCorpusExecutionR473';

export type CorpusExecutionIntentR473={
 schema:'OMEGA_CORPUS_EXECUTION_INTENT_R473';id:string;name:string;route:string;operation:string;domain:string;
 state:CorpusExecutionStateR473;capabilityId:string;executionDomain:string;capabilityReality:string;routable:boolean;receiptAuthority:'R142';admissionAuthority:'R125';at:string;canonicalMutation:false;
};

export const readCorpusExecutionIntentR473=():CorpusExecutionIntentR473|null=>{
 try{
  const raw=localStorage.getItem('omega.r473.corpusExecutionIntent');if(!raw)return null;
  const parsed=JSON.parse(raw);return parsed?.schema==='OMEGA_CORPUS_EXECUTION_INTENT_R473'&&parsed?.canonicalMutation===false?parsed:null;
 }catch{return null}
};

export const clearCorpusExecutionIntentR473=()=>{
 try{localStorage.removeItem('omega.r473.corpusExecutionIntent');window.dispatchEvent(new CustomEvent('omega:r473-corpus-execution-cleared'))}catch{}
};

export default function CorpusExecutionIntentR473({intent,currentRoute,onClear}:{intent:CorpusExecutionIntentR473;currentRoute:string;onClear:()=>void}){
 const atTarget=intent.route===currentRoute;
 return <aside className='r473-active-intent' data-at-target={atTarget?'true':'false'} data-state={intent.state}>
  <div><span>YEAR-CORPUS EXECUTION · {intent.state.replaceAll('_',' ')}</span><b>{intent.name}</b><small>{intent.operation} → {intent.route} · {intent.capabilityId} · {intent.executionDomain} · {intent.capabilityReality}{atTarget?' · CURRENT EXECUTOR ACTIVE':' · HANDOFF CONTEXT RETAINED'}</small></div>
  <button type='button' onClick={()=>{clearCorpusExecutionIntentR473();onClear()}} aria-label='Clear year-corpus execution context'><X/></button>
 </aside>;
}
