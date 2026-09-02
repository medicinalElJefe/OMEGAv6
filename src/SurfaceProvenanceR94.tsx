import {ShieldCheck} from 'lucide-react';
import {PROVENANCE_LABEL_R94,provenanceForSurfaceR94} from './surfaceProvenanceR94';
import './surfaceProvenanceR94.css';

export default function SurfaceProvenanceR94({surface}:{surface:string}){
 const p=provenanceForSurfaceR94(surface);
 return <details className='r94-provenance' data-primary={p.primary}>
  <summary>
   <ShieldCheck/>
   <span><b>{PROVENANCE_LABEL_R94[p.primary]}</b><small>{p.display}</small></span>
   <code>{surface}</code>
  </summary>
  <div className='r94-provenance-body'>
   <section><span>INPUT CLASSES</span><div>{p.inputs.map(x=><code key={x}>{PROVENANCE_LABEL_R94[x]}</code>)}</div></section>
   <section><span>ACTION AUTHORITY</span><p>{p.actionAuthority}</p></section>
   <section><span>PROOF</span><p>{p.proof}</p></section>
   <section><span>FORBIDDEN CLAIM</span><p>{p.forbidden}</p></section>
   {(p.optionalRepresentations?.length??0)>0&&<section className='r94-representations'><span>OPTIONAL REPRESENTATIONS</span><div>{p.optionalRepresentations.map(x=><code key={x}>{x}</code>)}</div><p>These may visualize or explain bounded source data. They never become observations or independent state authority.</p></section>}
  </div>
 </details>
}
