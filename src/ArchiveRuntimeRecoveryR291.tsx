import {useMemo,useState} from 'react';
import {Activity,CheckCircle2,Cpu,Database,Play,ShieldCheck,TriangleAlert} from 'lucide-react';
import {proveRscPairR291,type RscSkin} from './rscProofRuntimeR291';
import {IMPLEMENTATION_CANON_CORPUS_R291} from './implementationCanonCorpusR291';
import {reconcileImplementationCanonRowR291,type CanonRow} from './implementationCanonReconcilerR291';
import {advanceQtiTransactionR291,beginQtiTransactionR291,type QtiContext,type QtiIntent} from './qtiControlledAgentR291';
import './archiveGenomeR288.css';

const left:RscSkin={id:'r291-left',domain:'software',label:'Version A',nodes:[{id:'p',role:'parent'},{id:'s',role:'scar'},{id:'c',role:'constraint'},{id:'o',role:'continuity'}],edges:[{from:'p',to:'s',relation:'interaction'},{from:'s',to:'c',relation:'constrains'},{from:'c',to:'o',relation:'carries'}]};
const right:RscSkin={id:'r291-right',domain:'software',label:'Version B',nodes:[{id:'p2',role:'parent'},{id:'s2',role:'scar'},{id:'c2',role:'constraint'},{id:'o2',role:'continuity'}],edges:[{from:'p2',to:'s2',relation:'interaction'},{from:'s2',to:'c2',relation:'constrains'},{from:'c2',to:'o2',relation:'carries'}]};
const sampleCanon:CanonRow={rowId:'CANON-R291-DEMO',type:'MODULE',phase:'Runtime',component:'R291 bounded recovery demo',artifact:'src/ArchiveRuntimeRecoveryR291.tsx',symbol:'ArchiveRuntimeRecoveryR291',purpose:'Prove source+test admission semantics without changing CanonState.',archiveStatus:'PLANNED',priority:'P0',sequence:0};
const qtiContext:QtiContext={evidenceBound:true,stateConsistent:true,permissionGranted:true,resourcesWithinBudget:true,securityClean:true,humanAuthorized:true,simulationPassed:true,postconditionVerified:true};

export default function ArchiveRuntimeRecoveryR291(){
 const [runs,setRuns]=useState(0),[qtiState,setQtiState]=useState('NOT_RUN');
 const rsc=useMemo(()=>proveRscPairR291(left,right),[runs]);
 const canon=useMemo(()=>reconcileImplementationCanonRowR291(sampleCanon,{sourcePresent:true,testPassed:true,runtimeObserved:true,sourceArtifact:sampleCanon.artifact,testProof:'R291 source/build/browser proof lane'}),[runs]);
 const runQti=()=>{const intent:QtiIntent={id:`r291-demo-${Date.now()}`,principal:'R291_OPERATOR_DEMO',scope:'LOCAL_BOUNDED_DEMO',action:'NO_EXTERNAL_EFFECT',stateVersion:'R291',expiresAt:new Date(Date.now()+60_000).toISOString(),reversible:true,externalConsequence:false,humanAuthorizationRequired:false,inputHash:'a'.repeat(64)};let tx=beginQtiTransactionR291(intent);tx=advanceQtiTransactionR291(tx,'SIMULATE');tx=advanceQtiTransactionR291(tx,'VERIFY');tx=advanceQtiTransactionR291(tx,'AUTHORIZE',qtiContext);tx=advanceQtiTransactionR291(tx,'EXECUTE');tx=advanceQtiTransactionR291(tx,'OBSERVE');tx=advanceQtiTransactionR291(tx,'AUDIT');setQtiState(`${tx.stage} · ${tx.gates.filter(g=>g.pass).length}/10 GATES · EXECUTION ${tx.executionAdmitted?'ADMITTED':'DENIED'}`);setRuns(x=>x+1)};
 return <section className='agr-runtime-r291' aria-label='R291 recovered runtime proving ground'>
  <header><div><span>R291 · RECOVERED RUNTIME PROVING GROUND</span><h3>Archive → Executable, Bounded Organs</h3><p>These probes exercise recovered logic without creating a second Canon, Hybrid, deployment, scientific, medical or device authority.</p></div><button onClick={runQti}><Play/>Run bounded proof cycle</button></header>
  <div className='agr-runtime-grid'>
   <article data-state={rsc.comparison.equivalent?'pass':'hold'}><header><Activity/><div><b>RSC PROOF VM</b><small>ρ → compare → gate → τ</small></div></header><strong>CΩ {rsc.comparison.continuity.toFixed(3)} · {rsc.comparison.gate}</strong><p>{rsc.translation.admitted?'Translation admitted after structural reduction.':'Translation denied by structural-equivalence gate.'}</p><small>{rsc.truthBoundary}</small></article>
   <article data-state={canon.disposition==='IMPLEMENTED'?'pass':'hold'}><header><Database/><div><b>675-ROW CANON RECONCILER</b><small>exact corpus {IMPLEMENTATION_CANON_CORPUS_R291.source.sha256.slice(0,12)}…</small></div></header><strong>{IMPLEMENTATION_CANON_CORPUS_R291.rows} ROWS · DEMO {canon.disposition}</strong><p>{IMPLEMENTATION_CANON_CORPUS_R291.types.MODULE} modules · {IMPLEMENTATION_CANON_CORPUS_R291.types.SYMBOL} symbols · {IMPLEMENTATION_CANON_CORPUS_R291.types.SHADER_BINDING} shader bindings.</p><small>{IMPLEMENTATION_CANON_CORPUS_R291.truthBoundary}</small></article>
   <article data-state={qtiState.startsWith('AUDIT')?'pass':'hold'}><header><ShieldCheck/><div><b>QTI CONTROLLED AGENT</b><small>propose → simulate → verify → authorize → execute → observe → audit</small></div></header><strong>{qtiState}</strong><p>Independent authorization is required before execution; this demo has no external effect.</p><small>The reasoner cannot authorize itself. Completion is not Canon admission.</small></article>
   <article data-state='gated'><header><Cpu/><div><b>NATIVE GPU</b><small>sovereign-host admission boundary</small></div></header><strong>PARENT + SUPERSAMPLE VERIFIED · OPENGL DEVICE GATED</strong><p>20,736 packet compiler and bounded reconstruction are source-recovered. Interactive renderer requires exact-hash device/context/program/frame/capture proof.</p><small>Static shader/source validation is not live GPU proof.</small></article>
  </div>
  <footer><TriangleAlert/><span>R291 deliberately keeps archive existence, source validation, execution, device proof and Canon admission as distinct states.</span></footer>
 </section>;
}
