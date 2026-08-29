import {useMemo,useState} from 'react';
import {CheckCircle2,Download,GitMerge,Route,ShieldCheck,XCircle} from 'lucide-react';
import {compileOneSystemReceipt,CONSOLIDATION_RULES,ONE_SYSTEM_STAGES,OPERATOR_SEQUENCE,RESTORE_SEQUENCE} from './oneSystemRuntime';
import './oneSystemControl.css';

type Props={variant:'Consolidation'|'Instructions';record:any;status:any;restore:any;onNavigate:(name:string)=>void};
const ROUTES=[['Inspect source state','Field'],['Traverse admitted motion','Extreme Traversal'],['Inspect proof','Evidence & Proof'],['Review donor census','Archive Census'],['Operate donor admission','Archive Operators'],['Review governance','Governance'],['Build / restore','Development'],['Validate candidate','Validation']] as const;
function saveReceipt(data:any){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='OMEGA_ONE_SYSTEM_RECEIPT.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),800)}
export default function OneSystemControl({variant,record,status,restore,onNavigate}:Props){
 const receipt=useMemo(()=>compileOneSystemReceipt(record,status,restore),[record,status,restore]);
 const[focus,setFocus]=useState(variant==='Instructions'?'OPERATE':'CONSOLIDATE');
 return <section className='special-app one-system-app'>
  <header className='special-head'><div><span>ONE SYSTEM · SINGLE STATE AUTHORITY · PORTABLE SOURCE</span><h2>{variant}</h2></div><div className={'one-system-score '+(receipt.ready?'pass':'hold')}><b>{receipt.passed}/{receipt.total}</b><small>{receipt.ready?'HOSTED INVARIANTS PASS':'HOLD / INSPECT'}</small></div></header>
  <div className='one-system-tabs'><button className={focus==='CONSOLIDATE'?'active':''} onClick={()=>setFocus('CONSOLIDATE')}><GitMerge/>Consolidate</button><button className={focus==='OPERATE'?'active':''} onClick={()=>setFocus('OPERATE')}><Route/>Operate</button><button onClick={()=>saveReceipt(receipt)}><Download/>Receipt</button></div>
  {focus==='CONSOLIDATE'?<>
   <div className='one-system-spine'>{ONE_SYSTEM_STAGES.map((s,i)=><article key={s.id}><code>{s.id}</code><div><b>{s.name}</b><span>{s.owner}</span><small>{s.target}</small></div><strong>{s.gate}</strong>{i<ONE_SYSTEM_STAGES.length-1&&<i/>}</article>)}</div>
   <div className='one-system-checks'>{receipt.checks.map((c:any)=><article className={c.pass?'pass':'hold'} key={c.name}>{c.pass?<CheckCircle2/>:<XCircle/>}<div><b>{c.name}</b><span>{c.detail}</span></div><strong>{c.pass?'PASS':'HOLD'}</strong></article>)}</div>
   <div className='one-system-rules'>{CONSOLIDATION_RULES.map((r,i)=><p key={r}><code>R{i+1}</code>{r}</p>)}</div>
  </>:<>
   <div className='instruction-sequence'><section><span>CANON WORKFLOW</span><div>{OPERATOR_SEQUENCE.map((x,i)=><b key={x}>{i+1}. {x}</b>)}</div></section><section><span>RESTORE WORKFLOW</span><div>{RESTORE_SEQUENCE.map((x,i)=><b key={x}>{i+1}. {x.replaceAll('_',' ')}</b>)}</div></section></div>
   <div className='instruction-routes'>{ROUTES.map(([label,target],i)=><button key={target} onClick={()=>onNavigate(target)}><code>{String(i+1).padStart(2,'0')}</code><div><b>{label}</b><span>{target}</span></div><strong>OPEN ›</strong></button>)}</div>
   <div className='instruction-contract'><h3>Operator contract</h3><p>Use one canonical packet. Route before generation. Preserve parent identity. Keep external observations distinct from modeled state. Proof before promotion. Drive controls release authority; browser controls do not.</p></div>
  </>}
  <div className='special-boundary'><ShieldCheck/>Consolidation validates and routes one-system state; it does not manufacture evidence, execute native-device actions, or mutate the Drive release pointer.</div>
 </section>
}
