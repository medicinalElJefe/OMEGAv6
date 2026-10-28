import {useMemo,useState} from 'react';
import {exportWovenTopologySvgR707,projectWovenTopologyR707} from '../src/wovenTopologyProjectionR707.mjs';
import {inspectWovenRouteR708} from '../src/wovenRouteInspectorR708.mjs';

// Source-bound R706/R623/R651/R653 visualization; not an independent state or proof writer.
export function WovenTopologyR707({scenario}:{scenario:any}){
 const [frame,setFrame]=useState(0),[mirrored,setMirrored]=useState(false),[portable,setPortable]=useState('');
 const [routeFrom,setRouteFrom]=useState(''),[routeTo,setRouteTo]=useState('');
 const projection=useMemo(()=>projectWovenTopologyR707(scenario,frame,mirrored),[scenario,frame,mirrored]);
 const origin=projection.nodes.some(n=>n.id===routeFrom)?routeFrom:projection.nodes[0].id;
 const target=projection.nodes.some(n=>n.id===routeTo)?routeTo:projection.nodes.at(-1)!.id;
 const witness=useMemo(()=>inspectWovenRouteR708(projection,origin,target),[projection,origin,target]);
 const pathEdgeIds=new Set(witness.pathEdges.map(e=>e.id));
 return <section aria-label='Executable woven topology vector instrument' data-r707-vector-instrument='source-model-only'
  style={{border:'1px solid var(--o7-border, #65727d)',borderRadius:8,padding:12,margin:'12px 0',maxWidth:'100%',boxSizing:'border-box'}}>
  <h4>R707 · Woven topology and directional continuity</h4>
  <p>Each edge and node is projected from the executed R706 scenario and recomputed R623/R651/R653 frame. Multi-parent, return, blocked and cyclic relations remain explicit. Historical AG-009 SVG parity is not yet proved.</p>
  <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',marginBottom:8}}>
   <label>Frame <input data-r707-frame aria-label='Woven frame' type='range' min={0} max={projection.frames-1} value={frame} onChange={e=>{setFrame(Number(e.target.value));setPortable('');}}/> {frame+1}/{projection.frames}</label>
   <button type='button' data-r707-mirror aria-pressed={mirrored} onClick={()=>{setMirrored(v=>!v);setPortable('');}}>Reflect observer frame: {mirrored?'ON':'OFF'}</button>
   <button type='button' data-r707-export onClick={()=>setPortable(exportWovenTopologySvgR707(scenario,frame,mirrored))}>Prepare static SVG</button>
  </div>
  <div role='status' data-r707-topology-summary style={{marginBottom:8,fontSize:13}}>
   {projection.topology.nodes} nodes · {projection.topology.edges} directional edges · {projection.topology.blocked} blocked · {projection.topology.returns} return · {projection.topology.multiParentNodes} multi-parent nodes · {projection.topology.directedCycles} detected directed cycles
  </div>
  <div data-r708-route-controls style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',marginBottom:8}}>
   <label>Route origin <select data-r708-origin value={origin} onChange={e=>setRouteFrom(e.target.value)}>{projection.nodes.map(n=><option key={n.id} value={n.id}>{n.id}</option>)}</select></label>
   <label>Route target <select data-r708-target value={target} onChange={e=>setRouteTo(e.target.value)}>{projection.nodes.map(n=><option key={n.id} value={n.id}>{n.id}</option>)}</select></label>
  </div>
  <div role='status' data-r708-path-status style={{marginBottom:8,fontSize:13}}>{witness.reachable?`ADMISSIBLE GRAPH PATH: ${witness.pathNodes.join(' → ')} · ${witness.hops} hops · minimum declared edge weight ${witness.bottleneckDeclaredWeight===null?'n/a':witness.bottleneckDeclaredWeight.toFixed(3)}`:`NO ADMISSIBLE GRAPH PATH: ${origin} → ${target}`} · ${witness.reachableNodeIds.length} reachable nodes · ${witness.excludedEdges.length} excluded edges</div>
  <details data-r708-exclusions style={{marginBottom:8,fontSize:12}}><summary>Excluded edge evidence and refusal reasons</summary><ul>{witness.excludedEdges.map(e=><li key={e.id}>{e.from} → {e.to} · {e.kind} · {e.reason}</li>)}</ul></details>
  <svg data-r707-svg viewBox='0 0 640 440' role='img' aria-label='Computed relational continuity vector topology' style={{display:'block',width:'100%',maxWidth:720,height:'auto',background:'#0d1821',borderRadius:6}}>
   <defs><marker id='r707-arrow-ui' markerWidth='8' markerHeight='8' refX='6' refY='3' orient='auto'><path d='M0 0 L6 3 L0 6 Z' fill='#e9eef1'/></marker></defs>
   {projection.edges.map((edge:any)=><path key={edge.id} data-r707-edge-kind={edge.kind} data-r708-on-path={pathEdgeIds.has(edge.id)?'true':'false'} data-r707-edge-from={edge.from} data-r707-edge-to={edge.to}
    d={edge.path} stroke={edge.stroke} strokeWidth={edge.width+(pathEdgeIds.has(edge.id)?2:0)} strokeOpacity={pathEdgeIds.has(edge.id)?1:0.65} strokeDasharray={edge.dash||undefined} fill='none' markerEnd='url(#r707-arrow-ui)'>
    <title>{edge.from} → {edge.to} · {edge.kind} · weight {edge.weight.toFixed(3)}</title>
   </path>)}
   {projection.nodes.map((node:any)=><g key={node.id} data-r707-node={node.id}>
    <circle cx={node.x} cy={node.y} r={15+10*Math.max(0,Math.min(1,node.continuity))} fill='#143d4b' stroke='#d9e9e9' strokeWidth={1.5}/>
    <text x={node.x} y={node.y+4} textAnchor='middle' fill='#fff' fontSize={13}>{node.id}</text>
    <title>{node.id} · CΩ {node.continuity.toFixed(4)} · Δ {node.continuityDelta.toFixed(4)} · scar {node.scar.toFixed(4)} · q {node.contradiction.toFixed(4)}</title>
   </g>)}
   <text x={16} y={422} fontSize={12} fill='#b4c7cc'>R707 · MODEL ONLY · source-computed geometry</text>
  </svg>
  <div data-r707-node-metrics style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
   {projection.nodes.map((n:any)=><span key={n.id} style={{fontSize:12,border:'1px solid #596a74',padding:'4px 6px',borderRadius:4}}>{n.id}: CΩ {n.continuity.toFixed(3)} · Δ {n.continuityDelta.toFixed(3)} · Λ {n.scar.toFixed(3)} · q {n.contradiction.toFixed(3)}</span>)}
  </div>
  {portable&&<><label htmlFor='r707-static-svg'>Static SVG (copy to a .svg file; no scripts or executable authority)</label>
   <textarea id='r707-static-svg' data-r707-portable aria-label='Portable computed SVG' value={portable} readOnly rows={5} style={{display:'block',width:'100%',boxSizing:'border-box',fontFamily:'monospace',fontSize:12}}/></>}
  <small data-r708-boundary>{witness.boundary}</small>
  <small data-r707-truth-boundary>LOCAL_COMPUTED_VECTOR_MODEL_ONLY · {projection.boundary} Browser input persistence is supplied by R706; importing inputs recomputes every geometry frame.</small>
 </section>;
}
