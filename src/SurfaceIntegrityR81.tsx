import {useEffect,type ReactNode} from 'react';
import PanelBoundary from './PanelBoundary';

type Props={panel:string;children:ReactNode;onRecover:()=>void};

function slug(panel:string){return panel.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'unknown'}

export default function SurfaceIntegrityR81({panel,children,onRecover}:Props){
 useEffect(()=>{
  document.documentElement.dataset.omegaSurface=slug(panel);
  return()=>{delete document.documentElement.dataset.omegaSurface};
 },[panel]);
 return <PanelBoundary panel={panel} onRecover={onRecover}>
  <section className='omega-surface-r81' data-surface={slug(panel)} data-surface-name={panel}>
   {children}
  </section>
 </PanelBoundary>
}