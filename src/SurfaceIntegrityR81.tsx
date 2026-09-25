import {useEffect,useState,type ReactNode} from 'react';
import PanelBoundary from './PanelBoundary';
import SurfaceProvenanceR94 from './SurfaceProvenanceR94';
import FullCalculusFabricR107 from './FullCalculusFabricR107';
import {provenanceForSurfaceR94} from './surfaceProvenanceR94';
import {surfaceLayerBindingR104} from './surfaceLayerContractR104';
import {productPresentationForRouteR356} from './system/productPresentationAuthorityR356';

type Props={panel:string;children:ReactNode;onRecover:()=>void;record?:any};

function slug(panel:string){return panel.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'unknown'}

export default function SurfaceIntegrityR81({panel,children,onRecover,record}:Props){
 const[proofOpen,setProofOpen]=useState(false),[proofDeep,setProofDeep]=useState(false);
 useEffect(()=>{setProofOpen(false);setProofDeep(false)},[panel]);
 useEffect(()=>{if(!proofOpen){setProofDeep(false);return}const id=window.setTimeout(()=>setProofDeep(true),120);return()=>window.clearTimeout(id)},[proofOpen,panel]);
 useEffect(()=>{
  document.documentElement.dataset.omegaSurface=slug(panel);
  return()=>{delete document.documentElement.dataset.omegaSurface};
 },[panel]);
 const provenance=provenanceForSurfaceR94(panel),layer=surfaceLayerBindingR104(panel),presentation=productPresentationForRouteR356(panel);
 const metric=(v:any)=>Math.max(0,Math.min(1,Number(v)||0));
 const vital={c:metric(record?.metrics?.continuity),phi:metric(record?.metrics?.plasticity),q:metric(record?.metrics?.contradiction),e:metric(record?.metrics?.evidence)};
 return <PanelBoundary panel={panel} onRecover={onRecover}>
  <section className='omega-surface-r81 r356-product-surface' data-r356-product-surface='true' data-r356-route={presentation.route} data-r356-workspace={presentation.workspace} data-r356-archetype={presentation.archetype} data-r356-tier={presentation.tier} data-r356-reality={presentation.reality} data-surface={slug(panel)} data-surface-name={panel} data-decision={String(record?.metrics?.decision||'UNBOUND')} data-provenance-primary={provenance.primary} data-layer-primary={layer.primary} data-layer-bindings={layer.layers.join(' ')} data-layer-contract='R104/R107' data-calculus-fabric='R107'>
   <header className='r356-surface-frame'>
    <div className='r356-surface-identity'><span>{presentation.workspaceLabel} · {presentation.masterMenu}</span><h1>{presentation.route}</h1><p>{presentation.purpose}</p></div>
    <div className='r356-surface-truth'><span>{presentation.family}</span><b>{presentation.realityLabel}</b><small>{presentation.boundary} · {presentation.tier}</small></div>
   </header>
   <div className='r82-surface-vital' aria-hidden='true'><i style={{transform:`scaleX(${vital.c})`}}/><i style={{transform:`scaleX(${vital.phi})`}}/><i style={{transform:`scaleX(${vital.q})`}}/><i style={{transform:`scaleX(${vital.e})`}}/></div>
   <details key={panel} className='r356-surface-provenance' onToggle={e=>setProofOpen(e.currentTarget.open)} data-r356-proof-state={proofOpen?(proofDeep?'DEEP_READY':'PROVENANCE_READY'):'CLOSED'}><summary>Proof & lineage</summary>{proofOpen&&<div className='r356-proof-lineage-summary'><SurfaceProvenanceR94 surface={panel}/></div>}{proofDeep&&record&&<div className='r356-proof-lineage-deep'><FullCalculusFabricR107 surface={panel} record={record}/></div>}</details>
   <div className='r356-surface-content'>{children}</div>
  </section>
 </PanelBoundary>
}