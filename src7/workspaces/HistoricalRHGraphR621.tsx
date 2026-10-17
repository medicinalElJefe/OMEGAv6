import {useMemo} from 'react';
/** Source-limited historical RH graph browser instrument.
 * This UI never fabricates edges or implies the donor is loaded into the browser.
 * Only the independently source-admitted E00001/E00002 golden records are embedded.
 */
type Edge={id:string;sourceConcept:string;targetConcept:string;kind:'antipode_state';weight:number;sourceRow:number;targetRow:number};
const verifiedEdges:readonly Edge[]=[
 {id:'E00001',sourceConcept:'RH0001',targetConcept:'RH0001',kind:'antipode_state',weight:0.2,sourceRow:5991,targetRow:16473},
 {id:'E00002',sourceConcept:'RH0002',targetConcept:'RH0002',kind:'antipode_state',weight:0.2,sourceRow:18087,targetRow:7833},
];
export function admittedHistoricalEdgesR621(address:number):readonly Edge[]{
 if(!Number.isInteger(address)||address<0||address>=20736)return [];
 return verifiedEdges.filter(e=>e.sourceRow-1===address);
}
export default function HistoricalRHGraphR621({address,onAddress}:{address:number;onAddress:(n:number)=>void}){
 const edges=useMemo(()=>admittedHistoricalEdgesR621(address),[address]);
 return <section data-r621-historical-rh-graph='true' data-address={address} aria-label='Historical RH graph instrument'>
  <h3>Historical RH graph · admitted source examples</h3>
  <p>Original v21 archive: 320 conceptual RH nodes and 416 typed edges. This browser instrument includes only two independently admitted golden records. The complete historical graph is not deployed here; missing edges are not interpreted as absent from the archive.</p>
  <p>Current canonical address: <strong>{address}</strong> (workbook row {address+1}). Source admission: local PASS; production graph execution: not verified.</p>
  {edges.length===0?<p data-r621-empty='true'>No admitted browser-side example at this address. This is not a graph-completeness result.</p>:
   <ol>{edges.map(e=><li key={e.id} data-r621-edge={e.id}>
    <b>{e.id}</b> · {e.sourceConcept} → {e.targetConcept} · {e.kind} · weight {e.weight}
    <div>Workbook rows {e.sourceRow} → {e.targetRow}; canonical addresses {e.sourceRow-1} → {e.targetRow-1}</div>
    <button type='button' onClick={()=>onAddress(e.targetRow-1)}>Traverse {e.id} to address {e.targetRow-1}</button>
   </li>)}</ol>}
  <p>Conceptual RH relationships are not interchangeable with Time Mandala operators. Separate coupling-edge claims remain unverified.</p>
 </section>;
}
