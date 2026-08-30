import {useCallback,useEffect,useState} from 'react';
import {AlertTriangle,CheckCircle2,RefreshCw,ShieldCheck} from 'lucide-react';
import {api,localState} from './platformAdapter';

type ChainProof={schema?:string;ok?:boolean;health?:string;segmentHash?:string;receiptCount?:number;headCheckpointHash?:string;errors?:string[];recomputed?:Array<{index:number;match:boolean}>;boundary?:string};
export default function ProofChainSupervisorR54(){
 const[proof,setProof]=useState<ChainProof>({}),[busy,setBusy]=useState(false),[checkedAt,setCheckedAt]=useState(0);
 const verify=useCallback(async()=>{const segment=localState.read<any[]>('omega.r53.delta.mesh.journal',[]);if(!segment.length){setProof({health:'AWAITING_CHAIN',receiptCount:0,errors:[]});return}setBusy(true);try{const r=await api.post<ChainProof>('/api/proof/chain',{segment});setProof(r.data||{});setCheckedAt(Date.now())}catch(e:any){const payload=e?.payload&&typeof e.payload==='object'?e.payload:{};setProof({...payload,ok:false,health:'REGRESSION_DETECTED',errors:Array.isArray(payload?.errors)?payload.errors:[String(e?.message||e)]});setCheckedAt(Date.now())}finally{setBusy(false)}},[]);
 useEffect(()=>{void verify();const id=window.setInterval(()=>void verify(),30000);return()=>window.clearInterval(id)},[verify]);
 const coherent=proof.schema==='OMEGA_SUPERVISED_PROOF_CHAIN_R54'&&proof.ok===true&&proof.health==='COHERENT';
 return <section className='r50-delta-ledger' data-r54-chain={proof.health||'AWAITING_CHAIN'}>
  <header>{coherent?<ShieldCheck/>:<AlertTriangle/>}<div><b>B012 supervised proof-chain · R54</b><small>Worker recomputes every submitted R53 checkpoint; browser remains journal owner</small></div><button onClick={()=>void verify()} disabled={busy} aria-label='Verify proof chain'><RefreshCw className={busy?'spin':''}/></button></header>
  <div><article><code>CHAIN HEALTH</code><span><b>{proof.health||'AWAITING_CHAIN'}</b></span><small>{proof.receiptCount||0} receipts · {proof.recomputed?.filter(x=>x.match).length||0} recomputed checkpoints matched</small></article><article><code>SEGMENT SHA-256</code><span><b>{proof.segmentHash||'awaiting journal'}</b></span><small>{proof.headCheckpointHash?`head ${proof.headCheckpointHash.slice(0,24)}…`:'no checkpoint head yet'}</small></article></div>
  {!!proof.errors?.length&&<div>{proof.errors.slice(0,8).map((e,i)=><article key={`${i}-${e}`}><AlertTriangle/><span>{e}</span></article>)}</div>}
  <footer>{coherent?<CheckCircle2/>:<AlertTriangle/>}<span>{proof.boundary||'R54 waits for at least one R53 receipt before chain verification.'}</span><em>{checkedAt?`Checked ${new Date(checkedAt).toLocaleTimeString()}`:'Awaiting first verification'}</em></footer>
 </section>
}
