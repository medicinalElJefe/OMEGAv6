import {useMemo,useState} from 'react';
import {CheckCircle2,Download,ExternalLink,FileWarning,Play,ShieldCheck,XCircle} from 'lucide-react';
import {emitOperationR86} from './omegaOperationBusR86';
import {
  SINGMASTER_ATLAS_VERSION_R290,
  SINGMASTER_EQUIVALENCES_R290,
  SINGMASTER_FOUR_TUPLE_REGISTRY_R290,
  SINGMASTER_PROOF_GATES_R290,
  SINGMASTER_PUBLIC_STATUS_R290,
  SINGMASTER_SOURCES_R290,
  SINGMASTER_TRUTH_BOUNDARY_R290,
  compactBigIntR290,
  singmasterProofStatsR290,
  verify3003CarryR290,
  verifyKnownFibersR290
} from './proof/singmasterProofAtlasR290';
import './singmasterProofWorkbenchR290.css';

type Props={record:any};
type AuditState={at:string;passed:boolean;fiberPassed:number;fiberCount:number;carryPassed:number;carryCount:number}|null;

async function sha256R290(value:string){const bytes=new TextEncoder().encode(value),hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function downloadJsonR290(name:string,data:any){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

export default function SingmasterProofWorkbenchR290({record}:Props){
  const fibers=useMemo(()=>verifyKnownFibersR290(),[]);
  const carry=useMemo(()=>verify3003CarryR290(),[]);
  const[run,setRun]=useState<AuditState>(null);
  const[busy,setBusy]=useState(false);
  const witness=fibers.find(x=>x.id==='3003');
  const runAudit=async()=>{setBusy(true);try{const stats=singmasterProofStatsR290(),at=new Date().toISOString(),passed=stats.fibersPassed===stats.fiberCount&&stats.carryPassed===stats.carryCount;setRun({at,passed,fiberPassed:stats.fibersPassed,fiberCount:stats.fiberCount,carryPassed:stats.carryPassed,carryCount:stats.carryCount});await emitOperationR86({type:'PROOF_REFRESHED',surface:'Evidence & Proof',stateId:Number(record?.stateId||0),address:Number(record?.address||0),status:passed?'PASS':'HOLD',detail:`R290 Singmaster exact witness/regression audit ${passed?'passed':'held'}; global theorem status remains OPEN`,payload:{proofProgram:'Singmaster',atlasVersion:SINGMASTER_ATLAS_VERSION_R290,publicStatus:SINGMASTER_PUBLIC_STATUS_R290,fibersPassed:stats.fibersPassed,fiberCount:stats.fiberCount,carryPassed:stats.carryPassed,carryCount:stats.carryCount}})}finally{setBusy(false)}};
  const exportPacket=async()=>{const stats=singmasterProofStatsR290(),body={schema:'OMEGA_SINGMASTER_WOVEN_PROOF_ATLAS_R290',generatedAt:new Date().toISOString(),atlasVersion:SINGMASTER_ATLAS_VERSION_R290,publicStatus:SINGMASTER_PUBLIC_STATUS_R290,truthBoundary:SINGMASTER_TRUTH_BOUNDARY_R290,equivalences:SINGMASTER_EQUIVALENCES_R290,gates:SINGMASTER_PROOF_GATES_R290,fourTupleRegistry:SINGMASTER_FOUR_TUPLE_REGISTRY_R290,exactFiberAudit:fibers.map(({id,className,representations,value,digits,pass})=>({id,className,representations,value,digits,pass})),kummerCarryAudit:carry,sources:SINGMASTER_SOURCES_R290,stats,omegaPacket:{stateId:record?.stateId??null,address:record?.address??null}};const canonical=JSON.stringify(body),hash=await sha256R290(canonical);downloadJsonR290(`omega-singmaster-r290-${Date.now()}.json`,{...body,sha256:hash});await emitOperationR86({type:'PROOF_RECEIPT_EXPORTED',surface:'Evidence & Proof',stateId:Number(record?.stateId||0),address:Number(record?.address||0),status:'PASS',detail:'Exported R290 Singmaster proof-audit packet; theorem status retained as OPEN',payload:{proofProgram:'Singmaster',atlasVersion:SINGMASTER_ATLAS_VERSION_R290,publicStatus:SINGMASTER_PUBLIC_STATUS_R290,sha256:hash}})};
  return <section className='r290-singmaster' data-omega-proof-surface='singmaster-r290'>
    <header className='r290-singmaster-head'><div><span>R290 · SINGMASTER / WOVEN CONTINUITY</span><h3>Sharp-bound proof workbench</h3><p>Exact integer fibers, p-adic carry signatures, certificate gates, and four-column closure architecture.</p></div><div className='r290-singmaster-status'><b>{SINGMASTER_PUBLIC_STATUS_R290}</b><small>global theorem status</small></div></header>
    <div className='r290-singmaster-kpis'><article><span>Sharp witness</span><b>N(3003) = 8</b><small>{witness?.representations.map(x=>`C(${x.n},${x.k})`).join(' = ')}</small></article><article><span>Equivalent target</span><b>M(a) ≤ 3</b><small>nontrivial left-half multiplicity</small></article><article><span>Counterexample object</span><b>4 columns · 1 integer fiber</b><small>all prime/carry signatures must agree</small></article><article><span>Known regression</span><b>{fibers.length} fibers</b><small>exact BigInt verification</small></article></div>
    <section className='r290-singmaster-kernel'><header><span>THEOREM KERNEL</span><b>Preserve integrality through every skin</b></header><div>{SINGMASTER_EQUIVALENCES_R290.map((x,i)=><article key={x}><strong>{i+1}</strong><p>{x}</p></article>)}</div></section>
    <section className='r290-singmaster-audit'><header><div><span>EXACT ARITHMETIC AUDIT</span><b>Known collision fibers + Kummer carry equality</b></div><button onClick={()=>void runAudit()} disabled={busy} aria-label='Run exact Singmaster bounded witness audit'><Play/>{busy?'Running…':'Run exact audit'}</button></header>{run?<div className={run.passed?'r290-audit-result pass':'r290-audit-result hold'}>{run.passed?<CheckCircle2/>:<XCircle/>}<div><b>{run.passed?'BOUNDED/WITNESS AUDIT PASS':'AUDIT HOLD'}</b><small>{run.fiberPassed}/{run.fiberCount} fibers · {run.carryPassed}/{run.carryCount} Kummer checks · {run.at}</small></div></div>:<p className='r290-audit-idle'>This audit verifies exact known identities and regression invariants. It deliberately does not promote the open global theorem.</p>}
      <div className='r290-fiber-table'>{fibers.map(f=><article key={f.id} className={f.pass?'pass':'hold'}><div><b>{f.id}</b><span>{f.className}</span></div><code>{compactBigIntR290(f.value)}</code><small>{f.representations.map(x=>`C(${x.n},${x.k})`).join(' = ')}</small><strong>{f.pass?'PASS':'HOLD'}</strong></article>)}</div>
    </section>
    <section className='r290-singmaster-carry'><header><span>3003 PRIME-CARRY SIGNATURE</span><b>Kummer: vₚ(C(n,k)) = base-p carry count</b></header><div className='r290-carry-grid'>{[2,3,5,7,11,13,17,19,23,29,31].map(p=>{const rows=carry.filter(x=>x.p===p),ok=rows.every(x=>x.pass)&&rows.every(x=>x.valuation===rows[0]?.valuation);return <article key={p} className={ok?'pass':'hold'}><span>p={p}</span><b>vₚ={rows[0]?.valuation??'—'}</b><small>{rows.length} reps · {ok?'carry match':'mismatch'}</small></article>})}</div></section>
    <section className='r290-singmaster-gates'><header><span>MODE 188 · CLAIM-PROMOTION GATES</span><b>OPEN cannot be promoted by search radius</b></header><div>{SINGMASTER_PROOF_GATES_R290.map(g=><article key={g.id} data-status={g.status}><div><span>{g.id}</span><b>{g.label}</b></div><p>{g.detail}</p><strong>{g.status.replaceAll('_',' ')}</strong></article>)}</div></section>
    <section className='r290-singmaster-registry'><header><span>FOUR-TUPLE REGISTRY</span><b>Counterexample-family exhaustiveness</b></header><div>{SINGMASTER_FOUR_TUPLE_REGISTRY_R290.map(f=><article key={f.id}><div><b>{f.id}</b><span>{f.status.replaceAll('_',' ')}</span></div><p>{f.scope}</p><small>{f.exhaustive?'exhaustive partition node':'exhaustiveness still required'}</small></article>)}</div></section>
    <section className='r290-singmaster-sources'><header><span>SOURCE AUTHORITY</span><b>External theorem evidence stays separate from OMEGA symbolic modes</b></header><div>{SINGMASTER_SOURCES_R290.map(s=><a key={s.id} href={s.url} target='_blank' rel='noreferrer'><span>{s.id} · {s.authority.replaceAll('_',' ')}</span><b>{s.label}</b><ExternalLink/></a>)}</div></section>
    <div className='r290-singmaster-actions'><button className='primary-action' onClick={()=>void exportPacket()}><Download/>Export SHA-256 R290 proof packet</button></div>
    <div className='r290-singmaster-boundary'><FileWarning/><p><b>Truth boundary:</b> {SINGMASTER_TRUTH_BOUNDARY_R290}</p><ShieldCheck/></div>
  </section>;
}
