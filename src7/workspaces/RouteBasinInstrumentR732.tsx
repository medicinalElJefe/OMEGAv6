import {useMemo,useState} from 'react';
import {getMandala20736Field} from '../../src/mandala20736Runtime';
import {computeRouteBasinsR732,inspectRouteBasinR732} from '../../src/routeBasinR732.mjs';

type Props={address:number;onAddress:(address:number)=>void};
type RouteField={count:number;routeNext:Uint32Array};
export default function RouteBasinInstrumentR732({address,onAddress}:Props){
 const [analysis,setAnalysis]=useState<any>(null);
 const [field,setField]=useState<RouteField|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const selected=useMemo(()=>analysis&&field?inspectRouteBasinR732(analysis,field.routeNext,address):null,[analysis,field,address]);
 const compute=async()=>{
  if(busy)return;
  setBusy(true);setError('');
  try{
   const source=await getMandala20736Field();
   if(source.count!==20736||source.routeNext.length!==20736)throw Error('R732 complete source atlas unavailable');
   const result=computeRouteBasinsR732(source.routeNext);
   setField({count:source.count,routeNext:source.routeNext});setAnalysis(result);
  }catch(e){setAnalysis(null);setField(null);setError(e instanceof Error?e.message:'R732 route computation refused')}
  finally{setBusy(false)}
 };
 return <section data-r732-basin-instrument='source-model' aria-label='20,736-state route basin explorer' style={{padding:12,margin:'12px 0',border:'1px solid #627b87',borderRadius:9,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
  <h2>R732 · Source-route basin explorer</h2>
  <p>Compute the complete directed successor graph of the existing 20,736-address model. Every state has one declared source successor. Exact cycle detection and reverse-tree assignment reveal cycle periods, basin sizes and route distance without inventing observations.</p>
  <button type='button' data-r732-run disabled={busy} onClick={()=>void compute()}>{busy?'Computing source graph…':'Compute all 20,736 source routes'}</button>
  {error&&<p role='alert' data-r732-error>REFUSED: {error}</p>}
  {analysis&&selected&&<div data-r732-result>
   <p data-r732-summary role='status'>{analysis.nodeCount.toLocaleString()} verified model addresses assigned · {analysis.basinCount.toLocaleString()} route cycles · {analysis.cyclicNodes.toLocaleString()} cycle states · {analysis.transientNodes.toLocaleString()} transient states · maximum route depth {analysis.maxDepth}</p>
   <h3>Selected address {address.toLocaleString()}</h3>
   <p data-r732-selected>Successor {selected.nextAddress} · basin {selected.basinId+1} · basin size {selected.basinSize} · {selected.distanceToCycle} steps to cycle · period {selected.cycleLength} · cycle entry {selected.cycleEntry}</p>
   <button type='button' data-r732-entry onClick={()=>onAddress(selected.cycleEntry)}>Select exact cycle-entry address {selected.cycleEntry}</button>
   <p data-r732-trace>Bounded successor witness: {selected.trace.join(' → ')}{selected.truncated?' → … (remaining path omitted)':''}</p>
   <h3>Largest source-route basins</h3>
   <ol data-r732-ranked>{analysis.ranked.slice(0,8).map((cycle:any)=><li key={cycle.id} style={{padding:'4px 0'}}>
    <button type='button' data-r732-basin={cycle.id} onClick={()=>onAddress(cycle.representative)}>Select address {cycle.representative}</button>
    {' '}· {cycle.size.toLocaleString()} states · cycle period {cycle.period} · maximum entry depth {cycle.maxDepth}
   </li>)}</ol>
  </div>}
  <small data-r732-boundary>Source-bound deterministic model topology, not empirical attractors, physical time, physical dimensions, original historical equation parity, or CanonState admission. Selecting an address changes only the existing workspace selection. Full-state counts are conserved; source corpus loading and route validation are required before any result is shown.</small>
 </section>;
}
