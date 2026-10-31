import {useEffect,useMemo,useRef,useState} from 'react';
import {getMandala20736Field} from '../../src/mandala20736Runtime';
import {computeRouteBasinsR732,inspectRouteBasinR732} from '../../src/routeBasinR732.mjs';
import {renderRouteBasinRasterR733,addressAtRasterPointR733} from '../../src/routeBasinRasterR733.mjs';
import {renderAtlasFieldRasterR734,ATLAS_FIELD_CHANNELS_R734} from '../../src/atlasFieldRasterR734.mjs';

type Props={address:number;onAddress:(address:number)=>void};
type RouteField=Awaited<ReturnType<typeof getMandala20736Field>>;
export default function RouteBasinInstrumentR732({address,onAddress}:Props){
 const [analysis,setAnalysis]=useState<any>(null);
 const [field,setField]=useState<RouteField|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [rasterMode,setRasterMode]=useState<'basin'|'depth'>('basin');
 const [fieldChannel,setFieldChannel]=useState('C');
 const [jump,setJump]=useState('0');
 const rasterCanvas=useRef<HTMLCanvasElement|null>(null);
 const fieldRasterCanvas=useRef<HTMLCanvasElement|null>(null);
 const raster=useMemo(()=>analysis?renderRouteBasinRasterR733(analysis,rasterMode):null,[analysis,rasterMode]);
 const fieldRaster=useMemo(()=>field?renderAtlasFieldRasterR734(field,fieldChannel):null,[field,fieldChannel]);
 useEffect(()=>{
  const canvas=rasterCanvas.current;
  if(!canvas||!raster)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const pixels=ctx.createImageData(144,144);
  pixels.data.set(raster.rgba);ctx.putImageData(pixels,0,0);
  if(Number.isSafeInteger(address)&&address>=0&&address<20736){
   ctx.strokeStyle='#ffffff';ctx.lineWidth=1;
   ctx.strokeRect(address%144+0.1,Math.floor(address/144)+0.1,0.8,0.8);
  }
 },[raster,address]);
 useEffect(()=>{
  const canvas=fieldRasterCanvas.current;
  if(!canvas||!fieldRaster)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const pixels=ctx.createImageData(144,144);
  pixels.data.set(fieldRaster.rgba);ctx.putImageData(pixels,0,0);
  if(Number.isSafeInteger(address)&&address>=0&&address<20736){
   ctx.strokeStyle='#ffffff';ctx.lineWidth=1;
   ctx.strokeRect(address%144+0.1,Math.floor(address/144)+0.1,0.8,0.8);
  }
 },[fieldRaster,address]);
 const selected=useMemo(()=>analysis&&field?inspectRouteBasinR732(analysis,field.routeNext,address):null,[analysis,field,address]);
 const compute=async()=>{
  if(busy)return;
  setBusy(true);setError('');
  try{
   const source=await getMandala20736Field();
   if(source.count!==20736||source.routeNext.length!==20736)throw Error('R732 complete source atlas unavailable');
   const result=computeRouteBasinsR732(source.routeNext);
   setField(source);setAnalysis(result);
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
   <h3>R733 · Complete source-address raster</h3>
   <p data-r733-summary>Every one of the 20,736 model addresses occupies exactly one pixel in a 144 × 144 grid, ordered by address. {raster?.colorMeaning}. White outline marks the selected address. Click a pixel or enter an address to inspect its actual source route.</p>
   <label>Display channel <select data-r733-mode value={rasterMode} onChange={e=>setRasterMode(e.target.value as 'basin'|'depth')}><option value='basin'>Cycle basin identity</option><option value='depth'>Distance to source cycle</option></select></label>
   <canvas ref={rasterCanvas} data-r733-raster width={144} height={144} role='img' aria-label={'144 by 144 source-route atlas, '+rasterMode+' channel'} onClick={e=>{
    const bounds=e.currentTarget.getBoundingClientRect();
    onAddress(addressAtRasterPointR733(e.clientX-bounds.left,e.clientY-bounds.top,bounds.width,bounds.height));
   }} style={{display:'block',width:'min(100%,432px)',height:'auto',aspectRatio:'1 / 1',imageRendering:'pixelated',cursor:'crosshair',margin:'10px 0',border:'1px solid #6d8795'}}/>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
    <label>Address <input data-r733-address type='number' min={0} max={20735} step={1} value={jump} onChange={e=>setJump(e.target.value)} style={{maxWidth:110}}/></label>
    <button type='button' data-r733-jump onClick={()=>{const n=Number(jump);if(Number.isSafeInteger(n)&&n>=0&&n<20736)onAddress(n);else setError('R733 address must be an integer from 0 through 20735');}}>Select exact source address</button>
   </div>
   <small data-r733-boundary>Colors are deterministic visualization encodings of R732 source-model topology, not observed physical fields, empirical basins, historical renderer fidelity or canonical authority. No route is modified by viewing or selecting a pixel.</small>
   {fieldRaster&&<div data-r734-field-instrument>
    <h3>R734 · Source metric field and successor gradient</h3>
    <p>Render actual computed corpus channels at every model address, including a signed difference along each declared successor route. This is a source-state projection, not a measured spatial field.</p>
    <label>Computed source channel <select data-r734-channel value={fieldChannel} onChange={e=>setFieldChannel(e.target.value)}>
     {Object.entries(ATLAS_FIELD_CHANNELS_R734).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select></label>
    <p data-r734-range role='status'>{fieldRaster.label} · 20,736 source addresses · minimum {fieldRaster.minimum.toFixed(5)} · maximum {fieldRaster.maximum.toFixed(5)} · {fieldRaster.normalization}</p>
    <canvas ref={fieldRasterCanvas} data-r734-raster width={144} height={144} role='img' aria-label={'144 by 144 computed source field, '+fieldRaster.label} onClick={e=>{
     const bounds=e.currentTarget.getBoundingClientRect();
     onAddress(addressAtRasterPointR733(e.clientX-bounds.left,e.clientY-bounds.top,bounds.width,bounds.height));
    }} style={{display:'block',width:'min(100%,432px)',height:'auto',aspectRatio:'1 / 1',imageRendering:'pixelated',cursor:'crosshair',margin:'10px 0',border:'1px solid #6d8795'}}/>
    <p data-r734-selected>Address {address}: {fieldRaster.label} = {fieldRaster.values[address]?.toFixed(6)??'unavailable'}</p>
    <small data-r734-boundary>Colors normalize within the computed source channel; signed channels center on zero. These values are deterministic model projections, not measured physical fields, historical donor parity, empirical forecasts or CanonState changes.</small>
   </div>}
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
