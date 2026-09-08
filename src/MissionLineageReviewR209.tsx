import {useEffect,useState} from 'react';
import {CheckCircle2,ClipboardCheck,GitBranch,ShieldCheck,TriangleAlert} from 'lucide-react';
import {acceptPendingLineageR209,readAcceptedLineageR209,readPendingLineageR209,R209_EVENT,type R209AcceptedImport,type R209LineageEnvelope} from './missionLineageR209';

export default function MissionLineageReviewR209(){
 const[pending,setPending]=useState<R209LineageEnvelope|null>(()=>readPendingLineageR209());
 const[accepted,setAccepted]=useState<R209AcceptedImport|null>(()=>readAcceptedLineageR209());
 const[message,setMessage]=useState('');
 useEffect(()=>{const sync=()=>setPending(readPendingLineageR209());sync();window.addEventListener(R209_EVENT,sync);return()=>window.removeEventListener(R209_EVENT,sync)},[]);
 const importHeld=()=>{const result=acceptPendingLineageR209(pending);if(!result.ok){setMessage(`R209 import held · ${result.code}`);return}setAccepted(result.acceptance);setMessage(`Imported ${result.lineageId} for review only. Confirmation, device binding, queueing and execution remain separate existing Hybrid authorities.`)};
 if(!pending)return <section className='hybrid-r32-pair' data-r209-lineage-review='empty'><header><div><GitBranch/><span><b>R209 · END-TO-END MISSION LINEAGE</b><small>No validated SAI→Hybrid lineage is pending. Prepare and validate a governed draft in Intelligence Fabric first.</small></span></div></header></section>;
 const imported=accepted?.lineageId===pending.lineageId;
 return <section className='hybrid-r32-pair' data-r209-lineage-review={imported?'imported-held':'pending-held'} data-queue-mutation='false' data-dispatch-mutation='false'>
  <header><div><ShieldCheck/><span><b>R209 · SAI LINEAGE READY FOR OPERATOR IMPORT</b><small>{pending.proposalId} · lineage {pending.lineageId} · draft {String(pending.draftFingerprint).slice(0,20)}…</small></span></div><div className='hybrid-r32-buttons'><button onClick={importHeld}><ClipboardCheck/>{imported?'Re-verify held import':'Import exact held draft for review'}</button></div></header>
  <div className='hybrid-r73-action'><div><span>AUTHORITY BOUNDARY</span><h3>Import is review—not confirmation.</h3><p>The SHA-bound lineage was validated while still <code>DRAFT_ONLY_NOT_QUEUED</code>. This surface verifies and imports the exact held draft into operator review without creating any executor, queue, dispatch, device, persistence, truth or Canon authority.</p><small>R179 authorization · R147 executor · R141 exact return proof · R146 durable history · R125 Canon admission remain separate existing authorities.</small></div><div className='hybrid-r73-proof'>{imported?<CheckCircle2/>:<TriangleAlert/>}<b>{imported?'IMPORTED · STILL HELD':'OPERATOR IMPORT REQUIRED'}</b><span>ancestry {String(pending.ancestrySha256).slice(0,28)}…</span><code>{pending.draftFingerprint}</code></div></div>
  <details className='hybrid-r76-proofgrid'><summary>Inspect exact R209 held draft · {pending.heldDraft?.operations?.length||0} operations</summary><div className='hybrid-r8-steps'>{pending.heldDraft?.operations?.map((x:any)=><article key={x.step}><code>{String(x.step).padStart(2,'0')}</code><b>{x.op}</b><span>{x.profile||'typed operation'}</span></article>)}</div><div className='special-boundary'><ShieldCheck/>confirmed={String(pending.heldDraft?.confirmed)} · device={String(pending.heldDraft?.deviceId)} · queueMutation=false · dispatchMutation=false · executionClaimed=false · canonicalMutation=false.</div></details>
  {message&&<div className='hybrid-r32-message'>{message}</div>}
 </section>;
}
