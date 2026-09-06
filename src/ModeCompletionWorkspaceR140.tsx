import {useMemo,useState} from 'react';
import {ArrowRight,BrainCircuit,Database,ShieldCheck,Wrench} from 'lucide-react';
import SourceBackedModesPanelR21 from './SourceBackedModesPanelR21';
import {compileModeCompletionFabricR140,nextModeBuildCandidatesR140} from './modeCompletionFabricR140';
import './modeCompletionR140.css';

type Props={record:any;address:number;onAddress:(address:number)=>void;onNavigate:(panel:string)=>void};
const pct=(n:number)=>`${(n*100).toFixed(1)}%`;
export default function ModeCompletionWorkspaceR140(props:Props){
 const fabric=useMemo(()=>compileModeCompletionFabricR140(props.record),[props.record]);
 const next=useMemo(()=>nextModeBuildCandidatesR140(props.record,12),[props.record]);
 const[open,setOpen]=useState(true);
 return <div className='r140-mode-workspace'>
  <section className='r140-completion-control'>
   <header><div><span>R140.1 · MODE COMPLETION FABRIC</span><h2>179-slot execution census → proof-gated adapter backlog</h2><p>Every catalog slot has one explicit execution state. Unknown formulas stay unknown. Missing inputs stay missing. The queue converts recoverable source detail into tested adapters instead of inflating catalog membership into execution.</p></div><button onClick={()=>setOpen(v=>!v)}>{open?'Collapse':'Expand'} build queue</button></header>
   <div className='r140-counts'><article><span>EXECUTABLE</span><b>{fabric.executableCount}/{fabric.catalogCount}</b><small>{pct(fabric.completionRatio)} current runtime coverage</small></article><article><span>EXACT</span><b>{fabric.counts.exact}</b><small>formula evaluated now</small></article><article><span>PACKET / DERIVED</span><b>{fabric.counts.packet+fabric.counts.derived}</b><small>source-bound runtime channels</small></article><article><span>GATED</span><b>{fabric.counts.gated}</b><small>known formula · missing inputs</small></article><article><span>CATALOG ONLY</span><b>{fabric.counts.catalogOnly}</b><small>source detail/evaluator not hosted</small></article></div>
   <div className='r140-integrity' data-pass={fabric.completeCensus?'yes':'no'}><ShieldCheck/><span>{fabric.completeCensus?'Complete duplicate-free 179-slot census':'Census integrity requires repair'}</span></div>
   {open&&<div className='r140-backlog'><header><Wrench/><div><b>NEXT MODE-BUILD CANDIDATES</b><small>source recover → bind inputs → adapter → focused proof → inherited regression → R125 admission</small></div></header>{next.map(x=><article key={x.id} data-state={x.state}><code>{x.rank}</code><span><b>{x.id} · {x.name}</b><small>{x.reason}</small><em>{x.adapterTarget}</em></span><strong>{x.state.replaceAll('_',' ')}</strong></article>)}</div>}
   <div className='r140-actions'><button onClick={()=>props.onNavigate('SAI Lab')}><BrainCircuit/>SAI adapter proposal surface<ArrowRight/></button><button onClick={()=>props.onNavigate('Build Out')}><Wrench/>Build adapter candidate<ArrowRight/></button><button onClick={()=>props.onNavigate('Evidence & Proof')}><ShieldCheck/>Proof / validate adapter<ArrowRight/></button><button onClick={()=>props.onNavigate('System Atlas')}><Database/>Trace software authority<ArrowRight/></button></div>
   <footer><ShieldCheck/><span>{fabric.truthBoundary}</span></footer>
  </section>
  <SourceBackedModesPanelR21 {...props}/>
 </div>;
}
