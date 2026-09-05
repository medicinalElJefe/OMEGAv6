import {useMemo} from 'react';
import {FastForward,Rotate3d,ShieldCheck} from 'lucide-react';
import CalculusTraversal from './CalculusTraversal';
import TransitionProofPanelR23 from './TransitionProofPanelR23';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import TraversalModeStageR99 from './TraversalModeStageR99';
import {corpusState,decodeAddress} from './corpusRuntime';
import './designModesR99.css';
import './designModesR100.css';

type Props={variant:'Immersive Traversal'|'Extreme Traversal'|'Traversal';address:number;state:any;onAddress:(n:number)=>void};
export default function OmegaTraversalStudio({variant,address,state,onAddress}:Props){
 const r=corpusState(address),coords=decodeAddress(address);
 const corridor=useMemo(()=>{const rows=[] as any[];let n=address;for(let i=0;i<12;i++){const x=corpusState(n);rows.push(x);n=x.autoPing.dataNext}return rows},[address]);
 return <section className={'special-app traversal-studio r99-traversal-studio '+variant.toLowerCase().replaceAll(' ','-')}>
  <header className='special-head r99-special-head'><div><span>TRAVERSAL KERNEL · SOURCE STATE PRESERVED</span><h2>{variant}</h2><p>Move the canonical packet through distinct source-driven design modes. The active visualization owns the stage; proof, motion-skin telemetry and restored renderers stay reachable without covering it.</p></div><div className='special-status'><b>SOURCE-BACKED</b><small>STATE {r.stateId} · D{coords.d} P{coords.p} R{coords.r} L{coords.l}</small></div></header>
  <TraversalModeStageR99 variant={variant} address={address} onAddress={onAddress}/>
  <div className='corridor-strip r99-corridor-strip' aria-label='Canonical admitted-next corridor'>{corridor.map((x,i)=><button key={i} onClick={()=>onAddress(x.address)} className={x.metrics.decision.toLowerCase()} style={{height:`${18+x.metrics.continuity*26}px`}} title={`Step ${i} · source state ${x.stateId} · admitted next ${x.autoPing.dataNext+1}`}><span>{i}</span><small>{x.stateId}</small></button>)}</div>
  <div className='instrument-controls r99-traversal-actions'><button onClick={()=>onAddress(r.autoPing.previous)}><Rotate3d/>Previous source state</button><button className='gold primary-action' onClick={()=>onAddress(r.autoPing.dataNext)}><FastForward/>Admitted next</button><span><ShieldCheck/> Mode changes alter lawful depiction only. Previous/current/next, corridor and receipts remain bound to the same canonical packet.</span></div>
  <details className='r99-support-layer'><summary>MOTION SKIN · route / scar / continuity layer</summary><OmegaMotionSkinMapR35 address={address} onSelectAddress={onAddress} compact/></details>
  <details className='r99-support-layer'><summary>PROOF · transition receipt</summary><TransitionProofPanelR23 address={address} onAddress={onAddress}/></details>
  <details className='r99-support-layer r99-donor-layer'><summary>RESTORED CALCULUS RENDERER · preserved donor / advanced comparison</summary><CalculusTraversal state={{...state,viewportMode:'CANON_FIELD'}} onSelect={(c:any)=>onAddress(1728*c.d+144*c.p+12*c.r+c.l)}/></details>
 </section>;
}
