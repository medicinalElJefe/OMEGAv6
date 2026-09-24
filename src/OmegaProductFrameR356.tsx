import type {ReactNode} from 'react';
import {Home,Menu,ShieldCheck,SlidersHorizontal} from 'lucide-react';
import {omegaMasterMenuForRouteR289,omegaNavItem} from './navigationRegistry';
import {workspaceForRouteR82} from './omegaExperienceRegistryR82';
import {capabilityExecutionContract} from './operationalCapabilityRuntimeR45';
import {LayoutModeSwitch,type OmegaUiMode} from './SingleFrameRuntimeShellR27';
import './omegaProductFrameR356.css';

type Props={
 panel:string;record:any;address:number;coords:any;reality:string;
 uiMode:OmegaUiMode;onUiMode:(mode:OmegaUiMode)=>void;onNavigate:(panel:string)=>void;
 appliedModes:number;gatedModes:number;catalogCount:number;workflowSlot?:ReactNode;children:ReactNode;
};

const f=(v:any,d=3)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';

export default function OmegaProductFrameR356({panel,record,address,coords,reality,uiMode,onUiMode,onNavigate,appliedModes,gatedModes,catalogCount,workflowSlot,children}:Props){
 const nav=omegaNavItem(panel),workspace=workspaceForRouteR82(panel as any),master=omegaMasterMenuForRouteR289(panel),contract=capabilityExecutionContract(panel),metrics=record?.metrics||{};
 const openMenu=()=>window.dispatchEvent(new CustomEvent('omega-r88-open-navigator',{detail:{layer:'APPLICATIONS',workspace:workspace?.id}}));
 return <section className='r356-product-frame' data-r356-product='COHERENT_PRODUCT_FRAME' data-route={panel} data-route-reality={reality}>
  <header className='r356-route-header'>
   <div className='r356-route-identity'>
    <div className='r356-breadcrumb'>
     <button type='button' onClick={()=>window.dispatchEvent(new CustomEvent('omega-home-request'))}><Home aria-hidden='true'/>OMEGA</button>
     <i/>
     <span>{workspace?.label||nav?.group||'WORKSPACE'}</span>
     {master&&<><i/><span>{master.id} · {master.label}</span></>}
    </div>
    <h1>{panel}</h1>
    <p>{nav?.hint||contract.output}</p>
   </div>
   <div className='r356-header-actions'>
    <button type='button' className='r356-systems' onClick={openMenu}><Menu aria-hidden='true'/><span>Systems</span></button>
    <LayoutModeSwitch value={uiMode} onChange={onUiMode} compact/>
   </div>
  </header>

  <div className='r356-state-ribbon' aria-label='Current canonical route context'>
   <span><small>STATE</small><b>{record?.stateId??'—'}</b></span>
   <span><small>ADDRESS</small><b>{address+1} / 20,736</b></span>
   <span><small>FRAME</small><b>D{(coords?.d??0)+1} P{(coords?.p??0)+1} R{(coords?.r??0)+1} L{(coords?.l??0)+1}</b></span>
   <span><small>DECISION</small><b>{String(metrics?.decision||'—')}</b></span>
   <span><small>REALITY</small><b>{reality.replaceAll('_',' ')}</b></span>
  </div>

  {workflowSlot&&<details className='r356-workflow-drawer'>
   <summary><SlidersHorizontal aria-hidden='true'/><span><b>Active workflow</b><small>Open task progression and returned operation receipts</small></span></summary>
   <div>{workflowSlot}</div>
  </details>}

  <div className='r356-workspace-grid'>
   <main className='r356-primary-stage'>{children}</main>
   <aside className='r356-context-rail' aria-label='Route context'>
    <section>
     <span>ROUTE CONTRACT</span>
     <b>{nav?.effect||'READ'} · {nav?.authority||'CANONICAL'}</b>
     <small>{contract.executionDomain} · {contract.persistence} persistence · {contract.performance} workload</small>
    </section>
    <section className='r356-metric-grid'>
     <div><small>CΩ</small><b>{f(metrics?.continuity)}</b></div>
     <div><small>Φ</small><b>{f(metrics?.plasticity)}</b></div>
     <div><small>q</small><b>{f(metrics?.contradiction)}</b></div>
     <div><small>Λ</small><b>{f(metrics?.burden)}</b></div>
     <div><small>scar</small><b>{f(metrics?.scar)}</b></div>
     <div><small>evidence</small><b>{f(metrics?.evidence)}</b></div>
    </section>
    <section>
     <span>MODE FABRIC</span>
     <b>{appliedModes} applied · {gatedModes} gated</b>
     <small>{catalogCount} catalog contracts remain addressable; missing authority stays gated.</small>
    </section>
    <nav className='r356-context-routes' aria-label='Related system routes'>
     {['Evidence & Proof','Convergence','System'].filter(x=>x!==panel).map(route=><button type='button' key={route} onClick={()=>onNavigate(route)}>{route}</button>)}
    </nav>
    <footer><ShieldCheck aria-hidden='true'/><span>One route authority · one canonical state · secondary instrumentation never replaces the active tool.</span></footer>
   </aside>
  </div>
 </section>;
}
