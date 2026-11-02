import {useMemo,useState} from 'react';
import {buildSourceTessellationR769,navigateSourceTessellationR769,serializeSourceTessellationSvgR769,SOURCE_TESSELLATION_SIZES_R769} from '../../src/sourceTessellationR769.mjs';
import type {Mandala20736Field} from '../../src/mandala20736Runtime';
type Props={field:Mandala20736Field;raster:any;address:number;onAddress:(address:number)=>void};
/** Executable source-field tessellation, not an authenticated historical renderer. */
export default function SourceTessellationR769({field,raster,address,onAddress}:Props){
 const [tileSize,setTileSize]=useState(12),[showEdges,setShowEdges]=useState(true);
 const tile=useMemo(()=>buildSourceTessellationR769(field,raster,address,tileSize),[field,raster,address,tileSize]);
 const selected=tile.cells.find((c:any)=>c.address===address);
 const move=(dy:number,dx:number)=>onAddress(navigateSourceTessellationR769(address,dy,dx));
 const download=()=>{
  const svg=serializeSourceTessellationSvgR769(tile,{showEdges});
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r769-source-'+raster.channel+'-'+address+'.svg';
  document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section data-r769-tessellation='source-field' aria-label='Source field multiscale tessellation' style={{margin:'12px 0',padding:10,border:'1px solid #617987',borderRadius:8,maxWidth:580}}>
  <h4>R769 · Source-field multiscale tessellation</h4>
  <p>Zoom into the computed 144 × 144 address field. Each address becomes two source-colored triangles; their contrast follows the actual metric difference to its declared successor. Optional lines connect only successors inside the visible tile.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
   <label>Tile width <select data-r769-zoom value={tileSize} onChange={e=>setTileSize(Number(e.target.value))}>
    {SOURCE_TESSELLATION_SIZES_R769.map(n=><option key={n} value={n}>{n} × {n} addresses</option>)}
   </select></label>
   <label><input data-r769-edges type='checkbox' checked={showEdges} onChange={e=>setShowEdges(e.target.checked)}/> Source successor lines</label>
   <button type='button' data-r769-export onClick={download}>Export computed SVG</button>
  </div>
  <p data-r769-summary role='status'>Channel {tile.label} · {tile.cells.length} addresses · {tile.cells.length*2} triangles · {tile.edges.length} in-tile source edges · tile origin ({tile.originCol}, {tile.originRow})</p>
  <svg data-r769-svg viewBox={'0 0 '+tileSize+' '+tileSize} role='img' aria-label={'Computed '+tileSize+' by '+tileSize+' source-field tessellation'} style={{display:'block',width:'min(100%,480px)',height:'auto',aspectRatio:'1 / 1',border:'1px solid #8fa8b9',background:'#111d2c',cursor:'crosshair'}}>
   {tile.cells.map((cell:any)=><g key={cell.address} data-r769-cell={cell.address} onClick={()=>onAddress(cell.address)}>
    {cell.triangles.map((tri:any,i:number)=><polygon key={i} points={tri.points} fill={tri.fill} stroke='#101925' strokeWidth='.012'/>)}
   </g>)}
   {showEdges&&<g pointerEvents='none' data-r769-source-edges>{tile.edges.map((edge:any)=><line key={edge.from} data-r769-edge={edge.from} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke='#ffffff' strokeOpacity='.38' strokeWidth='.045'/>)}</g>}
   <rect data-r769-selection pointerEvents='none' x={address%144-tile.originCol+.04} y={Math.floor(address/144)-tile.originRow+.04} width='.92' height='.92' fill='none' stroke='#fff' strokeWidth='.08'/>
  </svg>
  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}} aria-label='Keyboard-accessible address navigation'>
   <button type='button' data-r769-up onClick={()=>move(-1,0)}>↑ Row</button>
   <button type='button' data-r769-left onClick={()=>move(0,-1)}>← Column</button>
   <button type='button' data-r769-right onClick={()=>move(0,1)}>Column →</button>
   <button type='button' data-r769-down onClick={()=>move(1,0)}>Row ↓</button>
  </div>
  <p data-r769-selected>Selected address {address} · value {selected?.value.toFixed(6)} · successor {selected?.successor} · Δ {selected?.delta.toFixed(6)}</p>
  <small data-r769-boundary>All {tile.sourceAddressCount.toLocaleString()} addresses remain reachable through the source raster and navigation. Zoom is a computed model projection, not physical geometry, authenticated historical renderer parity, a forecast, or CanonState mutation. Export is portable SVG only; the source field is recomputed on reload.</small>
 </section>;
}
