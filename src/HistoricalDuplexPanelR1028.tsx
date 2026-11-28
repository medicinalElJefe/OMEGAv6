import {useMemo,useState} from 'react';
import {compileDuplexR1028,DUPLEX_VIEWS_R1028,DUPLEX_QUALITIES_R1028} from './duplexModelR1028.mjs';
const clamp=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const num=(n:number)=>n.toFixed(4);
export default function HistoricalDuplexPanelR1028({record}:{record:any}){
 const [scene,setScene]=useState({scale_index:1,domain_index:1,lens_index:1,phase_index:1,calculus_mode_index:1,view_mode:'FIELD',quality:'BALANCED'});
 const [compression,setCompression]=useState(1);
 const [prior,setPrior]=useState<any>(null);
 const [message,setMessage]=useState('');
 const profile=useMemo(()=>({proof_score:clamp(record.metrics?.evidence),continuity:clamp(record.metrics?.continuity),contradiction:clamp(record.metrics?.contradiction),burden:clamp(record.metrics?.burden),plasticity:clamp(record.metrics?.plasticity),symmetry:clamp(record.geometry?.symmetry),asymmetry:1-clamp(record.geometry?.symmetry),compression_ratio:compression}),[record,compression]);
 const result=useMemo(()=>{try{return {value:compileDuplexR1028(scene,profile,prior),error:''}}catch(e){return {value:null,error:String(e)}}},[scene,profile,prior]);
 const v=result.value;
 const download=async()=>{if(!v)return;try{const data=JSON.stringify(v,null,2),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(data)),sha256=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));try{const link=document.createElement('a');link.href=url;link.download='omega-v613-duplex-r1028.json';link.click();setMessage('Download initiated · payload SHA-256 '+sha256)}finally{setTimeout(()=>URL.revokeObjectURL(url),1000)}}catch(e){setMessage('Export refused: '+String(e))}};
 return <section data-r1028-duplex-model='ORIGINAL_NUMERICAL_TRANSLATION' aria-label='Recovered 24-BIN computation' style={{margin:'12px 0',padding:'12px 0',borderBlock:'1px solid #53606a'}}>
  <h3>24-BIN · Inverse / Presence / Outverse</h3>
  <p>Original V61.3 numerical model from recovered P15. Current model-state metrics are explicitly adapted as its profile; original global data authority and original Python state hash are not reproduced. No measured accuracy or Canon admission is claimed.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:12}}>{(['scale_index','domain_index','lens_index','phase_index','calculus_mode_index'] as const).map(k=><label key={k}>{k.replaceAll('_',' ')} <select aria-label={k} value={scene[k]} onChange={e=>setScene(x=>({...x,[k]:Number(e.target.value)}))}>{Array.from({length:12},(_,i)=><option key={i+1}>{i+1}</option>)}</select></label>)}<label>View <select value={scene.view_mode} onChange={e=>setScene(x=>({...x,view_mode:e.target.value}))}>{DUPLEX_VIEWS_R1028.map(x=><option key={x}>{x}</option>)}</select></label><label>Quality <select value={scene.quality} onChange={e=>setScene(x=>({...x,quality:e.target.value}))}>{DUPLEX_QUALITIES_R1028.map(x=><option key={x}>{x}</option>)}</select></label><label>Declared compression ratio <input type='number' min={1} max={1000000} value={compression} onChange={e=>setCompression(Math.max(1,Math.min(1000000,Number(e.target.value)||1)))}/></label></div>
  {result.error&&<p role='alert'>{result.error}</p>}
  {v&&<><p><strong>{v.plan.method}</strong> · {v.plan.active.length}/24 active · {v.plan.gates.STAY} STAY / {v.plan.gates.TURN} TURN / {v.plan.gates.ESCALATE} ESCALATE</p><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontVariantNumeric:'tabular-nums'}}><thead><tr>{['Authority','Inverse','Projected','Outverse','Residual','Validity','Gate'].map(s=><th key={s} scope='col' style={{textAlign:'left',padding:6}}>{s}</th>)}</tr></thead><tbody>{v.presence.map((p,i)=><tr key={p.channel_id} style={{borderTop:'1px solid #53606a55'}}><th scope='row' style={{textAlign:'left',padding:6}}>{p.authority_key}</th>{[v.inverse[i].value,p.projected_outverse,v.outverse[i].value,p.residual,p.validity].map((n,j)=><td key={j} style={{padding:6}}>{num(n)}</td>)}<td style={{padding:6}}>{p.gate}</td></tr>)}</tbody></table></div>
  <p>Predicted cost {num(v.plan.predicted_cost)} · reuse {num(v.plan.predicted_reuse)} · expected model accuracy {num(v.plan.expected_accuracy)} · {prior?'prior model values carried':'initial model evaluation'}</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}><button type='button' onClick={()=>setPrior(v)}>Carry current values as prior</button><button type='button' disabled={!prior} onClick={()=>setPrior(null)}>Clear prior</button><button type='button' onClick={()=>void download()}>Export 24-BIN result</button></div>
  <details><summary>Explicit source profile and propagation matrix</summary><pre style={{maxHeight:250,overflow:'auto'}}>{JSON.stringify({profile:v.profile,matrix:v.propagationMatrix,plan:v.plan},null,2)}</pre></details></>}
  {message&&<p role='status'>{message}</p>}
 </section>
}
