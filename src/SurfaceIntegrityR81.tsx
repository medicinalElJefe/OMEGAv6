import {useEffect,type ReactNode} from 'react';
import PanelBoundary from './PanelBoundary';

type Props={panel:string;children:ReactNode;onRecover:()=>void;record?:any};

function slug(panel:string){return panel.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'unknown'}

export default function SurfaceIntegrityR81({panel,children,onRecover,record}:Props){
 useEffect(()=>{
  document.documentElement.dataset.omegaSurface=slug(panel);
  return()=>{delete document.documentElement.dataset.omegaSurface};
 },[panel]);
 const metric=(v:any)=>Math.max(0,Math.min(1,Number(v)||0));
 const vital={c:metric(record?.metrics?.continuity),phi:metric(record?.metrics?.plasticity),q:metric(record?.metrics?.contradiction),e:metric(record?.metrics?.evidence)};
 return <PanelBoundary panel={panel} onRecover={onRecover}>
  <section className='omega-surface-r81' data-surface={slug(panel)} data-surface-name={panel} data-decision={String(record?.metrics?.decision||'UNBOUND')}>
   <div className='r82-surface-vital' aria-hidden='true'><i style={{transform:`scaleX(${vital.c})`}}/><i style={{transform:`scaleX(${vital.phi})`}}/><i style={{transform:`scaleX(${vital.q})`}}/><i style={{transform:`scaleX(${vital.e})`}}/></div>
   {children}
  </section>
 </PanelBoundary>
}