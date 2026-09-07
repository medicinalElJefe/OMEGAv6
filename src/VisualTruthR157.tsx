import {Eye,ShieldCheck} from 'lucide-react';
import {VISUAL_SPACE_LABEL_R157,VISUAL_TRUTH_KIND_LABEL_R157,visualTruthForSurfaceR157} from './visualTruthR157';
import './visualTruthR157.css';

export default function VisualTruthR157({surface,record}:{surface:string;record?:any}){
 const v=visualTruthForSurfaceR157(surface);if(!v)return null;
 const stateId=record?.stateId??null,address=Number.isFinite(record?.address)?Number(record.address):null;
 return <section className='r157-visual-truth' data-visual-kind={v.kind} data-visual-space={v.space} data-canon-effect={v.canonEffect} aria-label={`${surface} visual truth`}>
  <header><Eye/><span><small>R157 · VISUAL TRUTH</small><b>{VISUAL_TRUTH_KIND_LABEL_R157[v.kind]}</b></span><code>{VISUAL_SPACE_LABEL_R157[v.space]}</code></header>
  <div className='r157-visual-truth-strip'>
   <span><small>SOURCE</small><b>{v.sourceAuthority}</b></span>
   <span><small>RENDER</small><b>{v.renderAuthority}</b></span>
   <span><small>CANON</small><b>{v.canonEffect==='ADDRESS_COMMIT_ONLY'?'EXPLICIT ADDRESS COMMIT ONLY':'NO VISUAL CONTROL MUTATION'}</b></span>
   {(stateId!==null||address!==null)&&<span><small>BOUND STATE</small><b>{stateId!==null?`STATE ${stateId}`:''}{stateId!==null&&address!==null?' · ':''}{address!==null?`ADDRESS ${address+1}`:''}</b></span>}
  </div>
  <details><summary><ShieldCheck/><span>Accuracy / absence boundary</span></summary><div><p><b>Time:</b> {v.timeAuthority}</p><p><b>Interaction:</b> {v.interactionAuthority}</p><p><b>If data is missing:</b> {v.absenceLaw}</p><p><b>Forbidden claim:</b> {v.forbiddenClaim}</p></div></details>
 </section>;
}
