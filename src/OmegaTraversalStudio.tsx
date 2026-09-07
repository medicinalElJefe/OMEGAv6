import {useMemo} from 'react';
import {FastForward,Rotate3d,ShieldCheck} from 'lucide-react';
import CalculusTraversal from './CalculusTraversal';
import TransitionProofPanelR23 from './TransitionProofPanelR23';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import TraversalModeStageR99 from './TraversalModeStageR100';
import {corpusState,decodeAddress} from './corpusRuntime';
import {capabilityPerformanceHints} from './operationalCapabilityRuntimeR45';
import './designModesR99.css';

type Variant='Immersive Traversal'|'Extreme Traversal'|'Traversal';
type Props={variant:Variant;address:number;state:any;onAddress:(n:number)=>void};
const VARIANT=Object.freeze({
 'Traversal':{depth:12,sampleStride:1,role:'CANONICAL_ROUTE',lens:'reversible admitted-next manifold'},
 'Immersive Traversal':{depth:48,sampleStride:2,role:'IMMERSIVE_CONTEXT',lens:'wider source corridor with surface/skin continuity context'},
 'Extreme Traversal':{depth:144,sampleStride:4,role:'EXTREME_ROUTE_DEPTH',lens:'deep source corridor with high-density route/scar inspection'}
} as const);

export default function OmegaTraversalStudio({variant,address,state,onAddress}:Props){
 const r=corpusState(address),coords=decodeAddress(address),spec=VARIANT[variant],performance=useMemo(()=>capabilityPerformanceHints(variant),[variant]);
 const corridor=useMemo(()=>{const rows=[] as any[];let n=address;for(let i=0;i<spec.depth;i++){const x=corpusState(n);rows.push(x);n=x.autoPing.dataNext}return rows},[address,spec.depth]);
 const visibleCorridor=useMemo(()=>corridor.filter((_,i)=>i===0||i===corridor.length-1||i%spec.sampleStride===0),[corridor,spec.sampleStride]);
 return <section className={'special-app traversal-studio r99-traversal-studio '+variant.toLowerCase().replaceAll(' ','-')} data-r168-traversal-role={spec.role} data-route-depth={spec.depth} data-performance-quality={performance.quality}>
  <header className='special-head r99-special-head'><div><span>R168 TRAVERSAL VARIANT FABRIC · WOVEN CONTINUITY · SOURCE STATE PRESERVED</span><h2>{variant}</h2><p>{spec.lens}. Geometry responds to continuity exchange, invariant carry, scar/history carry and signed orientation. The variant changes route depth and inspection density only; canonical state, transition law and proof authority remain shared.</p></div><div className='special-status'><b>SOURCE-BACKED · {spec.depth} STEP DEPTH</b><small>STATE {r.stateId} · D{coords.d} P{coords.p} R{coords.r} L{coords.l} · {performance.quality} {performance.targetFps} FPS TARGET</small></div></header>
  <TraversalModeStageR99 variant={variant} address={address} onAddress={onAddress}/>
  <div className='corridor-strip r99-corridor-strip' aria-label={`${variant} canonical admitted-next corridor, ${spec.depth} source steps`}>{visibleCorridor.map((x,i)=><button key={`${x.address}:${i}`} onClick={()=>onAddress(x.address)} className={x.metrics.decision.toLowerCase()} style={{height:`${18+x.metrics.continuity*26}px`}} title={`Sample ${i} · source state ${x.stateId} · admitted next ${x.autoPing.dataNext+1}`}><span>{i*spec.sampleStride}</span><small>{x.stateId}</small></button>)}</div>
  <div className='instrument-controls r99-traversal-actions'><button onClick={()=>onAddress(r.autoPing.previous)}><Rotate3d/>Previous source state</button><button className='gold primary-action' onClick={()=>onAddress(r.autoPing.dataNext)}><FastForward/>Admitted next</button><span><ShieldCheck/> {spec.role}: {spec.depth} source transitions inspected · sampling {spec.sampleStride}:1 · Mode/weave changes alter lawful depiction only. Previous/current/next and receipts remain bound to the same canonical packet.</span></div>
  <details className='r99-support-layer' open={variant==='Extreme Traversal'}><summary>MOTION SKIN · route / scar / continuity layer</summary><OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress} compact/></details>
  <details className='r99-support-layer'><summary>PROOF · transition receipt</summary><TransitionProofPanelR23 address={address} onAddress={onAddress}/></details>
  <details className='r99-support-layer r99-donor-layer'><summary>RESTORED CALCULUS RENDERER · preserved donor / advanced comparison</summary><CalculusTraversal state={{...state,viewportMode:'CANON_FIELD'}} onSelect={(c:any)=>onAddress(1728*c.d+144*c.p+12*c.r+c.l)}/></details>
 </section>;
}
