import {ArrowRight,ShieldCheck} from 'lucide-react';
import {routeLayerOutputR111} from './capability/routeLayerOutputRegistryR111';
import './routeOutputRibbonR111.css';

export default function RouteOutputRibbonR111({route}:{route:string}){
 const c=routeLayerOutputR111(route);
 return <section className='r111-output-ribbon' aria-label={`${route} input operation output and proof contract`}>
  <header><span>ACTIVE OUTPUT CONTRACT · R111</span><b>{c.primary}</b><small>{c.evidenceClass}</small></header>
  <div className='r111-output-flow'>
   <div><i>INPUT</i><span>{c.input}</span></div><ArrowRight/>
   <div><i>OPERATION</i><span>{c.operation}</span></div><ArrowRight/>
   <div><i>OUTPUT</i><span>{c.output}</span></div><ArrowRight/>
   <div><i>PROOF</i><span>{c.proof}</span></div>
  </div>
  <footer><ShieldCheck/><span>{c.layers.join(' · ')}</span><small>Responsibility map only · execution still requires the route's actual runtime/evidence gate.</small></footer>
 </section>;
}
