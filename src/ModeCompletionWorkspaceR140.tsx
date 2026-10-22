import {useMemo,useState} from 'react';
import {ArrowRight,BrainCircuit,Database,ShieldCheck,Wrench} from 'lucide-react';
import SourceBackedModesPanelR21 from './SourceBackedModesPanelR21';
import {compileModeCompletionFabricR140,nextModeBuildCandidatesR140} from './modeCompletionFabricR140';
import {compileModeRealizationRegistryR280} from './modeRealizationRegistryR280';
import './modeCompletionR140.css';

type Props={record:any;address:number;onAddress:(address:number)=>void;onNavigate:(panel:string)=>void};
const pct=(n:number)=>`${(n*100).toFixed(1)}%`;
export default function ModeCompletionWorkspaceR140(props:Props){
 const fabric=useMemo(()=>compileModeCompletionFabricR140(props.record),[props.record]);
 const realization=useMemo(()=>compileModeRealizationRegistryR280(props.record),[props.record]);
 const next=useMemo(()=>nextModeBuildCandidatesR140(props.record,12),[props.record]);
 const heavyBio=realization.rows.find(x=>x.name==='HEAVY BIO MODE REVIEW');
 const[open,setOpen]=useState(true);
 return <div className='r140-mode-workspace'>
  <section className='r140-completion-control'>
   <header><div><span>R280 · MODE REALIZATION + R140.1 COMPLETION FABRIC</span><h2>179-slot source census → 62-authority realization ledger → proof-gated build backlog</h2><p>Every catalog slot and canon authority now has a separate truth state. Named is not realized: CHARTED, IMPLEMENTED, TESTED, PROMOTED and GATED remain distinct. Unknown formulas stay unknown, missing inputs stay missing, and domain execution is never inferred from a derived lens.</p></div><button onClick={()=>setOpen(v=>!v)}>{open?'Collapse':'Expand'} build queue</button></header>
   <div className='r140-counts'><article><span>SOURCE EXECUTABLE</span><b>{fabric.executableCount}/{fabric.catalogCount}</b><small>{pct(fabric.completionRatio)} current source-runtime coverage</small></article><article><span>DOMAIN-BOUND</span><b>{realization.summary.domainExecutable}/{realization.authorityCount}</b><small>source/domain runtimes, not lens-only</small></article><article><span>PROMOTED</span><b>{realization.summary.promoted}</b><small>bound executable + test evidence</small></article><article><span>TESTED</span><b>{realization.summary.tested}</b><small>implemented with bound invariant tests</small></article><article><span>GATED / CHARTED</span><b>{realization.summary.gated} / {realization.summary.charted}</b><small>remaining realization debt</small></article><article><span>HEAVY BIO</span><b>{heavyBio?.stage??'CHARTED'}</b><small>{heavyBio?.executionClass??'EVIDENCE_GATED_DOMAIN_RUNTIME'}</small></article></div>
   <div className='r140-integrity' data-pass={fabric.completeCensus&&realization.authorityCount===62?'yes':'no'}><ShieldCheck/><span>{fabric.completeCensus&&realization.authorityCount===62?'Complete duplicate-free 179-slot census + 62-authority realization registry':'Mode census/realization integrity requires repair'}</span></div>
   {open&&<div className='r140-backlog'><header><Wrench/><div><b>NEXT MODE-BUILD CANDIDATES</b><small>source recover → bind inputs → domain operator → focused proof → inherited regression → R125 admission</small></div></header>{next.map(x=><article key={x.id} data-state={x.state}><code>{x.rank}</code><span><b>{x.id} · {x.name}</b><small>{x.reason}</small><em>{x.adapterTarget}</em></span><strong>{x.state.replaceAll('_',' ')}</strong></article>)}</div>}
   <details className='r140-backlog'><summary><b>R280 REALIZATION DEBT · {realization.criticalGaps.length} unresolved authorities</b></summary>{realization.criticalGaps.slice(0,16).map((x,i)=><article key={x.id} data-state={x.stage}><code>{i+1}</code><span><b>A{String(x.id).padStart(3,'0')} · {x.name}</b><small>{x.gaps.join(' · ')}</small><em>{x.stage==='GATED'?'Required authoritative inputs are still absent':'Historical definition exists; domain executor/test binding remains incomplete'}</em></span><strong>{x.stage}</strong></article>)}</details>
   <div className='r140-actions'><button onClick={()=>props.onNavigate('SAI Lab')}><BrainCircuit/>SAI adapter proposal surface<ArrowRight/></button><button onClick={()=>props.onNavigate('Build Out')}><Wrench/>Build adapter candidate<ArrowRight/></button><button onClick={()=>props.onNavigate('Evidence & Proof')}><ShieldCheck/>Proof / validate adapter<ArrowRight/></button><button onClick={()=>props.onNavigate('System Atlas')}><Database/>Trace software authority<ArrowRight/></button></div>
   <footer><ShieldCheck/><span>{realization.truthBoundary} {fabric.truthBoundary}</span></footer>
  </section>
  <SourceBackedModesPanelR21 {...props}/>
 </div>;
}
