import {useEffect,useRef,useState,type ReactNode} from 'react';
import PanelBoundary from './PanelBoundary';
import SurfaceProvenanceR94 from './SurfaceProvenanceR94';
import FullCalculusFabricR107 from './FullCalculusFabricR107';
import {provenanceForSurfaceR94} from './surfaceProvenanceR94';
import {surfaceLayerBindingR104} from './surfaceLayerContractR104';
import {productPresentationForRouteR356} from './system/productPresentationAuthorityR356';

type Props={panel:string;children:ReactNode;onRecover:()=>void;record?:any};

function slug(panel:string){return panel.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'unknown'}

export default function SurfaceIntegrityR81({panel,children,onRecover,record}:Props){
 const[proofOpen,setProofOpen]=useState(false),[proofDeep,setProofDeep]=useState(false),[interactionReady,setInteractionReady]=useState(false),proofDetailsRef=useRef<HTMLDetailsElement|null>(null),surfaceRef=useRef<HTMLElement|null>(null),proofOpenTimer=useRef<number|undefined>(undefined),proofDeepTimer=useRef<number|undefined>(undefined);
 const clearProofTimers=()=>{if(proofOpenTimer.current!==undefined)window.clearTimeout(proofOpenTimer.current);if(proofDeepTimer.current!==undefined)window.clearTimeout(proofDeepTimer.current);proofOpenTimer.current=undefined;proofDeepTimer.current=undefined};
 const onProofToggle=(open:boolean)=>{clearProofTimers();if(!open){setProofOpen(false);setProofDeep(false);return}proofOpenTimer.current=window.setTimeout(()=>{if(!proofDetailsRef.current?.open)return;setProofOpen(true)},240);proofDeepTimer.current=window.setTimeout(()=>{if(!proofDetailsRef.current?.open)return;setProofOpen(true);setProofDeep(true)},900)};
 useEffect(()=>{clearProofTimers();setProofOpen(false);setProofDeep(false);return clearProofTimers},[panel]);
 useEffect(()=>{
  setInteractionReady(false);
  let cancelled=false,raf1=0,raf2=0,timer=0,observer:MutationObserver|null=null;
  const capabilityReady=()=>{const cap=surfaceRef.current?.querySelector<HTMLElement>('.r138-capability-field');return !cap||cap.dataset.r356CapabilityReady==='true'};
  const attempt=()=>{if(cancelled)return;if(!capabilityReady()){timer=window.setTimeout(attempt,60);return}raf1=window.requestAnimationFrame(()=>{raf2=window.requestAnimationFrame(()=>{if(!cancelled&&capabilityReady())setInteractionReady(true);else if(!cancelled)timer=window.setTimeout(attempt,60)})})};
  const root=surfaceRef.current;
  if(root){observer=new MutationObserver(()=>{if(!interactionReady&&capabilityReady())attempt()});observer.observe(root,{subtree:true,attributes:true,attributeFilter:['data-r356-capability-ready']})}
  attempt();
  return()=>{cancelled=true;observer?.disconnect();window.cancelAnimationFrame(raf1);window.cancelAnimationFrame(raf2);if(timer)window.clearTimeout(timer)};
 },[panel]);
 useEffect(()=>{
  document.documentElement.dataset.omegaSurface=slug(panel);
  return()=>{delete document.documentElement.dataset.omegaSurface};
 },[panel]);
 const provenance=provenanceForSurfaceR94(panel),layer=surfaceLayerBindingR104(panel),presentation=productPresentationForRouteR356(panel);
 const metric=(v:any)=>Math.max(0,Math.min(1,Number(v)||0));
 const vital={c:metric(record?.metrics?.continuity),phi:metric(record?.metrics?.plasticity),q:metric(record?.metrics?.contradiction),e:metric(record?.metrics?.evidence)};
 return <PanelBoundary panel={panel} onRecover={onRecover}>
  <section ref={surfaceRef} className='omega-surface-r81 r356-product-surface' data-r356-product-surface='true' data-r356-interaction-ready={interactionReady?'true':'false'} data-r356-route={presentation.route} data-r356-workspace={presentation.workspace} data-r356-archetype={presentation.archetype} data-r356-tier={presentation.tier} data-r356-reality={presentation.reality} data-surface={slug(panel)} data-surface-name={panel} data-decision={String(record?.metrics?.decision||'UNBOUND')} data-provenance-primary={provenance.primary} data-layer-primary={layer.primary} data-layer-bindings={layer.layers.join(' ')} data-layer-contract='R104/R107' data-calculus-fabric='R107'>
   <header className='r356-surface-frame'>
    <div className='r356-surface-identity'><span>{presentation.workspaceLabel} · {presentation.masterMenu}</span><h1>{presentation.route}</h1><p>{presentation.purpose}</p></div>
    <div className='r356-surface-truth'><span>{presentation.family}</span><b>{presentation.realityLabel}</b><small>{presentation.boundary} · {presentation.tier}</small></div>
   </header>
   <div className='r82-surface-vital' aria-hidden='true'><i style={{transform:`scaleX(${vital.c})`}}/><i style={{transform:`scaleX(${vital.phi})`}}/><i style={{transform:`scaleX(${vital.q})`}}/><i style={{transform:`scaleX(${vital.e})`}}/></div>
   <details key={panel} ref={proofDetailsRef} className='r356-surface-provenance' onToggle={e=>onProofToggle(e.currentTarget.open)} data-r356-proof-state={proofOpen?(proofDeep?'DEEP_READY':'PROVENANCE_READY'):'CLOSED'}><summary>Proof & lineage</summary>{proofOpen&&<div className='r356-proof-lineage-summary' data-r356-lightweight-proof='true'><span><b>PRIMARY</b> {provenance.primary}</span><span><b>LAYER</b> {layer.primary}</span><span><b>BINDINGS</b> {layer.layers.join(' · ')}</span><span><b>CANON</b> presentation does not mutate CanonState</span></div>}{proofDeep&&<div className='r356-proof-lineage-deep'><SurfaceProvenanceR94 surface={panel}/>{record&&<FullCalculusFabricR107 surface={panel} record={record}/>}</div>}</details>
   <div className='r356-surface-content'>{children}</div>
  </section>
 </PanelBoundary>
}