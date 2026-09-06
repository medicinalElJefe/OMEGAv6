import {useEffect,useMemo,type ReactNode} from 'react';
import PanelBoundary from './PanelBoundary';
import SurfaceProvenanceR94 from './SurfaceProvenanceR94';
import FullCalculusFabricR107 from './FullCalculusFabricR107';
import {provenanceForSurfaceR94} from './surfaceProvenanceR94';
import {surfaceLayerBindingR104} from './surfaceLayerContractR104';
import {canonSurfaceStyleR120,compileFullCanonContextR120} from './fullCanonRuntimeR120';
import './fullCanonSurfaceR120.css';

type Props={panel:string;children:ReactNode;onRecover:()=>void;record?:any};

function slug(panel:string){return panel.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'unknown'}

export default function SurfaceIntegrityR81({panel,children,onRecover,record}:Props){
 useEffect(()=>{
  document.documentElement.dataset.omegaSurface=slug(panel);
  return()=>{delete document.documentElement.dataset.omegaSurface};
 },[panel]);
 const provenance=provenanceForSurfaceR94(panel),layer=surfaceLayerBindingR104(panel);
 const metric=(v:any)=>Math.max(0,Math.min(1,Number(v)||0));
 const vital={c:metric(record?.metrics?.continuity),phi:metric(record?.metrics?.plasticity),q:metric(record?.metrics?.contradiction),e:metric(record?.metrics?.evidence)};
 const canon=useMemo(()=>record?compileFullCanonContextR120(panel,record):null,[panel,record]);
 return <PanelBoundary panel={panel} onRecover={onRecover}>
  <section className='omega-surface-r81 r120-canon-driven-surface' style={canon?canonSurfaceStyleR120(canon) as any:undefined} data-surface={slug(panel)} data-surface-name={panel} data-decision={String(record?.metrics?.decision||'UNBOUND')} data-provenance-primary={provenance.primary} data-layer-primary={layer.primary} data-layer-bindings={layer.layers.join(' ')} data-layer-contract='R104/R107/R120' data-calculus-fabric='R107+R120' data-canon-context={canon?.schema||'UNBOUND'} data-canon-orientation={canon?.woven.orientation??0} data-canon-compute={canon?.carry.computeReadiness?.toFixed?.(4)||'0'} data-canon-proof={canon?.carry.proofReadiness?.toFixed?.(4)||'0'}>
   <div className='r82-surface-vital' aria-hidden='true'><i style={{transform:`scaleX(${vital.c})`}}/><i style={{transform:`scaleX(${vital.phi})`}}/><i style={{transform:`scaleX(${vital.q})`}}/><i style={{transform:`scaleX(${vital.e})`}}/></div>
   <SurfaceProvenanceR94 surface={panel}/>
   {record&&<FullCalculusFabricR107 surface={panel} record={record}/>} 
   {children}
  </section>
 </PanelBoundary>
}
