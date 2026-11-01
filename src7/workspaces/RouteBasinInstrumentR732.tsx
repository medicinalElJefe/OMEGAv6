import {useEffect,useMemo,useRef,useState} from 'react';
import {decodePiAddressR742,piAxisNeighborsR742,piAxisWitnessR742,verifyPiAxisWitnessR742} from '../../src/piAtlasTraversalR742.mjs';
import {METRIC_ATLAS_CHANNELS_R743,computeMetricAtlasRouteR743,verifyMetricAtlasRouteR743} from '../../src/sourceMetricAtlasRouteR743.mjs';
import {computeConstrainedAtlasJourneyR744,verifyConstrainedAtlasJourneyR744} from '../../src/constrainedAtlasJourneyR744.mjs';
import {getMandala20736Field} from '../../src/mandala20736Runtime';
import {computeRouteBasinsR732,inspectRouteBasinR732} from '../../src/routeBasinR732.mjs';
import {renderRouteBasinRasterR733,addressAtRasterPointR733} from '../../src/routeBasinRasterR733.mjs';
import {renderAtlasFieldRasterR734,ATLAS_FIELD_CHANNELS_R734} from '../../src/atlasFieldRasterR734.mjs';
import {computeSourceRouteProfileR735} from '../../src/sourceRouteProfileR735.mjs';
import {computeSourcePhasePortraitR736} from '../../src/sourcePhasePortraitR736.mjs';
import {computeSourcePhaseExchangeR737,serializeSourcePhaseExchangeR737} from '../../src/sourcePhaseExchangeR737.mjs';
import {verifySourceExchangeRecoveryR738} from '../../src/sourceExchangeRecoveryR738.mjs';
import {buildSourcePreimageIndexR739,inspectSourcePreimagesR739} from '../../src/sourcePreimageR739.mjs';
import {proveSourceContinuityR740} from '../../src/sourceContinuityR740.mjs';
import {findDirectedSourceRouteR741,verifyDirectedSourceRouteRecoveryR741} from '../../src/sourceDirectedRouteR741.mjs';

type Props={address:number;onAddress:(address:number)=>void};
type RouteField=Awaited<ReturnType<typeof getMandala20736Field>>;
export default function RouteBasinInstrumentR732({address,onAddress}:Props){
 const [analysis,setAnalysis]=useState<any>(null);
 const [field,setField]=useState<RouteField|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [rasterMode,setRasterMode]=useState<'basin'|'depth'>('basin');
 const [fieldChannel,setFieldChannel]=useState('C');
 const [routeLimit,setRouteLimit]=useState(32);
 const [inverseDepth,setInverseDepth]=useState(4),[inverseNodes,setInverseNodes]=useState(96);
 const [phaseX,setPhaseX]=useState('C'),[phaseY,setPhaseY]=useState('q');
 const [jump,setJump]=useState('0');
 const [routeTarget,setRouteTarget]=useState('0');
 const [piTarget,setPiTarget]=useState('0'),[piRecovery,setPiRecovery]=useState('');
 const [metricTarget,setMetricTarget]=useState('0'),[metricChannel,setMetricChannel]=useState('C'),[metricRecovery,setMetricRecovery]=useState('');
 const [journeyTarget,setJourneyTarget]=useState('0'),[journeyChannel,setJourneyChannel]=useState('C');
 const [journeyWaypoints,setJourneyWaypoints]=useState(''),[journeyBlocked,setJourneyBlocked]=useState(''),[journeyRecovery,setJourneyRecovery]=useState('');
 const [routeRecoveryStatus,setRouteRecoveryStatus]=useState('');
 const [recoveryStatus,setRecoveryStatus]=useState('');
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
 const routeProfile=useMemo(()=>field&&Number.isSafeInteger(address)&&address>=0&&address<20736?computeSourceRouteProfileR735(field,address,fieldChannel,routeLimit):null,[field,address,fieldChannel,routeLimit]);
 const phasePortrait=useMemo(()=>field&&Number.isSafeInteger(address)&&address>=0&&address<20736?computeSourcePhasePortraitR736(field,address,phaseX,phaseY,routeLimit):null,[field,address,phaseX,phaseY,routeLimit]);
 const phaseExchange=useMemo(()=>phasePortrait?computeSourcePhaseExchangeR737(phasePortrait):null,[phasePortrait]);
 const inverseIndex=useMemo(()=>field&&analysis?buildSourcePreimageIndexR739(field.routeNext,analysis):null,[field,analysis]);
 const continuity=useMemo(()=>inverseIndex&&analysis?proveSourceContinuityR740(inverseIndex,analysis):null,[inverseIndex,analysis]);
 const inverse=useMemo(()=>inverseIndex&&analysis&&Number.isSafeInteger(address)&&address>=0&&address<20736?inspectSourcePreimagesR739(inverseIndex,analysis,address,inverseDepth,inverseNodes):null,[inverseIndex,analysis,address,inverseDepth,inverseNodes]);
 const metricWitness=useMemo(()=>field&&Number.isSafeInteger(address)&&address>=0&&address<20736&&/^(0|[1-9]\d*)$/.test(metricTarget)&&Number(metricTarget)<20736?computeMetricAtlasRouteR743(field,address,Number(metricTarget),metricChannel):null,[field,address,metricTarget,metricChannel]);
 const journeyState=useMemo(()=>{
  if(!field)return {route:null,error:''};
  const parse=(value:string,label:string)=>value.trim()?value.split(',').map(part=>{
   const token=part.trim();
   if(!/^(0|[1-9]\d*)$/.test(token)||Number(token)>=20736)throw Error('R744 '+label+' must contain addresses 0–20735 separated by commas');
   return Number(token);
  }):[];
  try{
   if(!/^(0|[1-9]\d*)$/.test(journeyTarget)||Number(journeyTarget)>=20736)throw Error('R744 destination must be 0–20735');
   const route=computeConstrainedAtlasJourneyR744(field,address,Number(journeyTarget),journeyChannel,parse(journeyWaypoints,'waypoints'),parse(journeyBlocked,'blocked cells'));
   return {route,error:''};
  }catch(e){return {route:null,error:e instanceof Error?e.message:'R744 journey refused'}}
 },[field,address,journeyTarget,journeyChannel,journeyWaypoints,journeyBlocked]);
 const piWitness=useMemo(()=>Number.isSafeInteger(address)&&address>=0&&address<20736&&/^(0|[1-9]\d*)$/.test(piTarget)&&Number(piTarget)<20736?piAxisWitnessR742(address,Number(piTarget)):null,[address,piTarget]);
 const directedRoute=useMemo(()=>inverseIndex&&analysis&&continuity&&Number.isSafeInteger(address)&&address>=0&&address<20736&&/^(0|[1-9]\d*)$/.test(routeTarget)&&Number(routeTarget)<20736?findDirectedSourceRouteR741(inverseIndex,analysis,continuity,address,Number(routeTarget)):null,[inverseIndex,analysis,continuity,address,routeTarget]);
 const exportPhaseExchange=()=>{
  if(!phaseExchange)return;
  const blob=new Blob([serializeSourcePhaseExchangeR737(phaseExchange)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='omega-r737-source-exchange-'+phaseExchange.start+'.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
 };
 const exportContinuity=()=>{
  if(!continuity)return;
  const blob=new Blob([JSON.stringify(continuity,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='omega-r740-source-continuity.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
 };
 const exportDirectedRoute=()=>{
  if(!directedRoute)return;
  const blob=new Blob([JSON.stringify(directedRoute,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='omega-r741-directed-source-route.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
 };
 const importDirectedRoute=async(file:File|undefined)=>{
  if(!file||!inverseIndex||!analysis||!continuity)return;
  try{
   if(file.size>262144)throw Error('R741 source route export size refused');
   const recovered=verifyDirectedSourceRouteRecoveryR741(await file.text(),inverseIndex,analysis,continuity);
   setRouteTarget(String(recovered.to));onAddress(recovered.from);
   setRouteRecoveryStatus('VERIFIED · restored source '+recovered.from+' and destination '+recovered.to+' against fresh finite source execution');
  }catch(e){setRouteRecoveryStatus('REFUSED · '+(e instanceof Error?e.message:'invalid route export'))}
 };
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
   {routeProfile&&<div data-r735-route-profile>
    <h3>R735 · Computed successor metric traversal</h3>
    <p>Exact discrete successor steps from the selected address. This is not physical time or an observed field.</p>
    <label>Maximum steps <select data-r735-limit value={routeLimit} onChange={e=>setRouteLimit(Number(e.target.value))}>{![16,32,128,256].includes(routeLimit)&&<option value={routeLimit}>{routeLimit} · recovered bound</option>}<option value={16}>16</option><option value={32}>32</option><option value={128}>128</option><option value={256}>256</option></select></label>
    <p data-r735-summary role='status'>{routeProfile.steps.length} computed steps · {routeProfile.cycleStart===null?'bounded continuation at '+routeProfile.continuationAddress:'cycle starts at step '+routeProfile.cycleStart+' · period '+routeProfile.cyclePeriod} · range {routeProfile.minimum.toFixed(5)} to {routeProfile.maximum.toFixed(5)}</p>
    <div style={{maxHeight:240,overflow:'auto'}}><table data-r735-table style={{width:'100%',fontVariantNumeric:'tabular-nums'}}><thead><tr><th>Step</th><th>Address</th><th>Value</th><th>Δ successor</th></tr></thead><tbody>{routeProfile.steps.map(step=><tr key={step.index}><td>{step.index}</td><td><button type='button' onClick={()=>onAddress(step.address)}>{step.address}</button></td><td>{step.value.toFixed(5)}</td><td>{step.successorDifference.toFixed(5)}</td></tr>)}</tbody></table></div>
    <small>R735 follows the declared source graph only. No historical renderer equivalence, empirical measurements, or CanonState mutation.</small>
   </div>}
   {phasePortrait&&<div data-r736-phase-portrait style={{margin:'16px 0',maxWidth:'100%'}}>
    <h3>R736 · Two-metric source phase portrait</h3>
    <p>Plot the exact successor sequence against two independently computed source channels. Each point is one source address; the highlighted path closes only if a real cycle is encountered.</p>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
     <label>Horizontal metric <select data-r736-x value={phaseX} onChange={e=>{const v=e.target.value;setPhaseX(v);if(v===phaseY)setPhaseY(phaseX);}}>{Object.entries(ATLAS_FIELD_CHANNELS_R734).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
     <label>Vertical metric <select data-r736-y value={phaseY} onChange={e=>{const v=e.target.value;setPhaseY(v);if(v===phaseX)setPhaseX(phaseY);}}>{Object.entries(ATLAS_FIELD_CHANNELS_R734).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
    </div>
    <p data-r736-summary role='status'>{phasePortrait.points.length} source points · {phasePortrait.edges.length} exact successor edges · {phasePortrait.cycleStart===null?'bounded continuation; no inferred cycle':'cycle length '+phasePortrait.cyclePeriod} · horizontal {phasePortrait.xMinimum.toFixed(5)} to {phasePortrait.xMaximum.toFixed(5)} · vertical {phasePortrait.yMinimum.toFixed(5)} to {phasePortrait.yMaximum.toFixed(5)}</p>
    <svg data-r736-plot viewBox='0 0 360 280' role='img' aria-label={'Exact source successor phase portrait: '+phasePortrait.xLabel+' versus '+phasePortrait.yLabel} style={{display:'block',width:'min(100%,480px)',height:'auto',background:'#101c29',border:'1px solid #6d8795',borderRadius:5}}>
     <line x1={28} y1={240} x2={332} y2={240} stroke='#a5b9c4' strokeWidth={1}/>
     <line x1={28} y1={240} x2={28} y2={30} stroke='#a5b9c4' strokeWidth={1}/>
     {phasePortrait.edges.map((edge,i)=>{const a=phasePortrait.points[edge.from],b=phasePortrait.points[edge.to];return <line key={i} x1={28+a.xNormalized*300} y1={240-a.yNormalized*200} x2={28+b.xNormalized*300} y2={240-b.yNormalized*200} stroke={edge.cycleEdge?'#f5c76b':'#75b7c8'} strokeWidth={1.8} opacity={0.9}/>;})}
     {phasePortrait.points.map(point=><circle key={point.index} data-r736-point={point.index} cx={28+point.xNormalized*300} cy={240-point.yNormalized*200} r={point.index===0?5:3} fill={point.cycleMember?'#f5c76b':'#a3e1f1'} stroke='#122332' strokeWidth={1} onClick={()=>onAddress(point.address)} style={{cursor:'pointer'}}><title>{'Step '+point.index+' address '+point.address+' · '+phasePortrait.xLabel+' '+point.xValue.toFixed(5)+' · '+phasePortrait.yLabel+' '+point.yValue.toFixed(5)}</title></circle>)}
     <text x={180} y={266} textAnchor='middle' fontSize={11} fill='#e1ebef'>{phasePortrait.xLabel}</text>
     <text x={14} y={16} fontSize={11} fill='#e1ebef'>{phasePortrait.yLabel}</text>
    </svg>
    <small data-r736-boundary>Each axis is independently normalized to its actual bounded source-route range. Colors distinguish source-cycle edges, not empirical phases. No physical dynamics, new dimensions, historical donor equivalence or CanonState admission.</small>
    {phaseExchange&&<section data-r737-exchange aria-label='Woven source phase exchange geometry' style={{maxWidth:'100%',minWidth:0,overflowWrap:'anywhere',padding:'10px 0'}}>
     <h4>R737 · Woven successor exchange geometry</h4>
     <p>Compute exact metric exchange on every displayed successor edge, the total normalized path length, and the signed enclosed area only when the source actually closes a cycle. Mirror mismatch measures the average nearest-point reflection residual of the cycle; it is not a physical symmetry measurement.</p>
     <p data-r737-summary role='status'>{phaseExchange.edgeCount} exact source exchanges · transient length {phaseExchange.transientLength.toFixed(5)} · cycle length {phaseExchange.cycleLength.toFixed(5)} · orientation {phaseExchange.orientation} · {phaseExchange.signedCycleArea===null?'no enclosed cycle area': 'signed cycle area '+phaseExchange.signedCycleArea.toFixed(6)} · {phaseExchange.cycleClosureResidual===null?'cycle closure unobserved in bounded route':'cycle exchange closure residual '+phaseExchange.cycleClosureResidual.toFixed(8)}</p>
     <p data-r737-symmetry>Source-cycle reflection mismatch · vertical {phaseExchange.verticalReflectionMismatch===null?'not available':phaseExchange.verticalReflectionMismatch.toFixed(6)} · horizontal {phaseExchange.horizontalReflectionMismatch===null?'not available':phaseExchange.horizontalReflectionMismatch.toFixed(6)}</p>
     <div style={{maxWidth:'100%',overflowX:'auto',maxHeight:230,overflowY:'auto'}}><table data-r737-table style={{width:'100%',fontVariantNumeric:'tabular-nums',fontSize:12}}><thead><tr><th>From</th><th>To</th><th>Phase</th><th>ΔX</th><th>ΔY</th><th>Length</th></tr></thead><tbody>{phaseExchange.edges.slice(0,32).map(edge=><tr key={edge.index}><td>{edge.fromAddress}</td><td>{edge.toAddress}</td><td>{edge.phase}</td><td>{edge.dx.toFixed(4)}</td><td>{edge.dy.toFixed(4)}</td><td>{edge.length.toFixed(4)}</td></tr>)}</tbody></table></div>
     <p><button type='button' data-r737-export onClick={exportPhaseExchange}>Download exact source exchange JSON</button> <small>{phaseExchange.edgeCount>32?'First 32 edges shown; export includes all '+phaseExchange.edgeCount+' edges.':'All source edges shown.'}</small></p>
     <div data-r738-recovery style={{margin:'8px 0'}}>
      <label>Verify a previously exported source exchange JSON against the currently computed 20,736-address model
       <input type='file' accept='.json,application/json' data-r738-import onChange={async e=>{
        setRecoveryStatus('');
        const file=e.currentTarget.files?.[0];
        if(!file||!field)return;
        try{
         if(file.size>262144)throw Error('R738 export size refused');
         const result=verifySourceExchangeRecoveryR738(await file.text(),field);
         setRecoveryStatus('VERIFIED · '+result.edgeCount+' exact source exchanges · start '+result.start+' · '+result.xChannel+'/'+result.yChannel);
         onAddress(result.start);
         setPhaseX(result.xChannel);setPhaseY(result.yChannel);
         setRouteLimit(Math.max(1,result.edgeCount===0?1:result.cyclePeriod===null?result.edgeCount+1:result.edgeCount));
        }catch(error){setRecoveryStatus('REFUSED · '+(error instanceof Error?error.message:'invalid source export'))}
       }}/>
      </label>
      <p data-r738-status role='status'>{recoveryStatus||'No imported witness verified. Files remain local to this browser.'}</p>
     </div>
     <small data-r737-boundary>{phaseExchange.boundary} No CanonState mutation or empirical evidence is introduced by this derivative.</small>
    </section>}
   </div>}
   <h3>Selected address {address.toLocaleString()}</h3>
   <p data-r732-selected>Successor {selected.nextAddress} · basin {selected.basinId+1} · basin size {selected.basinSize} · {selected.distanceToCycle} steps to cycle · period {selected.cycleLength} · cycle entry {selected.cycleEntry}</p>
   <button type='button' data-r732-entry onClick={()=>onAddress(selected.cycleEntry)}>Select exact cycle-entry address {selected.cycleEntry}</button>
   <p data-r732-trace>Bounded successor witness: {selected.trace.join(' → ')}{selected.truncated?' → … (remaining path omitted)':''}</p>
   {inverse&&<section data-r739-inverse aria-label='Exact source predecessor explorer' style={{margin:'16px 0',maxWidth:'100%',minWidth:0}}>
    <h3>R739 · Inverse source-route branching</h3>
    <p>Follow the real incoming edges of the computed successor graph. Reverse traversal exposes predecessor branching, the cycle return and bounded ancestral layers of this mathematical model. The direction is the inverse of the declared source route, not a claim of physical causation.</p>
    <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
     <label>Reverse depth <select data-r739-depth value={inverseDepth} onChange={e=>setInverseDepth(Number(e.target.value))}>{[1,2,4,8,16].map(n=><option key={n} value={n}>{n} layers</option>)}</select></label>
     <label>Maximum nodes <select data-r739-nodes value={inverseNodes} onChange={e=>setInverseNodes(Number(e.target.value))}>{[32,96,256].map(n=><option key={n} value={n}>{n} nodes</option>)}</select></label>
     <button type='button' data-r739-hub onClick={()=>onAddress(inverse.hubAddress)}>Select strongest incoming branch · {inverse.hubAddress}</button>
    </div>
    <p data-r739-summary role='status'>Address {inverse.root} · {inverse.directPredecessors} direct source predecessors · {inverse.visitedCount} unique reverse nodes · {inverse.edges.length} exact source edges · {inverse.cycleClosureEdges} cycle return edges · layers {inverse.layerCounts.join(' / ')} · {inverse.truncated?inverse.omittedEdges+' bounded incoming edges omitted':'all incoming edges within the selected depth explored'}</p>
    <div style={{maxHeight:260,overflow:'auto',maxWidth:'100%'}}>
     <table data-r739-table style={{width:'100%',fontVariantNumeric:'tabular-nums',fontSize:12}}>
      <thead><tr><th>Layer</th><th>Predecessor</th><th>Successor</th><th>Incoming edges</th><th>Cycle state</th></tr></thead>
      <tbody>{inverse.nodes.slice(1).map(node=><tr key={node.address}>
       <td>{node.layer}</td>
       <td><button type='button' data-r739-parent={node.address} onClick={()=>onAddress(node.address)}>{node.address}</button></td>
       <td>{node.successor}</td><td>{node.indegree}</td><td>{node.cycleMember?'yes':'no'}</td>
      </tr>)}</tbody>
     </table>
    </div>
    <p data-r739-closure>{inverse.cycleClosureEdges} already-visited source edges close a witnessed cycle; they are not duplicated as new predecessor states. {inverse.truncated?'Increase the depth/node budget to inspect omitted incoming edges.':'No additional incoming edges were omitted within the chosen depth.'}</p>
    <small data-r739-boundary>{inverse.boundary} The 20,736 addresses are model states, not spatial or physical dimensions.</small>
   </section>}
   {continuity&&<section data-r740-continuity aria-label='Exact source graph continuity ledger' style={{margin:'16px 0',maxWidth:'100%',minWidth:0}}>
    <h3>R740 · Source continuity and conservation ledger</h3>
    <p>Audit every declared forward successor against its inverse predecessor index, then account for all model states and edges within their source-route basins. This is an executed, complete finite-graph audit, not a claim about physical conservation.</p>
    <p data-r740-summary role='status'>{continuity.nodeCount.toLocaleString()} verified source addresses · {continuity.edgeCount.toLocaleString()} conserved source edges · {continuity.basinCount.toLocaleString()} conserved basins · {continuity.cycleNodes.toLocaleString()} cycle states · {continuity.transientNodes.toLocaleString()} transient states</p>
    <p data-r740-branches>{continuity.branchNodes.toLocaleString()} branching addresses · {continuity.zeroPreimageNodes.toLocaleString()} addresses without incoming edges · maximum incoming degree {continuity.maxIndegree}</p>
    <p data-r740-selected>Selected address {address} belongs to basin {selected.basinId+1}; that basin has {continuity.basins[selected.basinId]?.nodeCount.toLocaleString()} states and {continuity.basins[selected.basinId]?.edgeCount.toLocaleString()} conserved edges.</p>
    <button type='button' data-r740-export onClick={exportContinuity}>Download computed conservation ledger JSON</button>
    <div style={{maxHeight:220,overflow:'auto',maxWidth:'100%',marginTop:10}}>
     <table data-r740-table style={{width:'100%',fontVariantNumeric:'tabular-nums',fontSize:12}}>
      <thead><tr><th>Basin</th><th>Addresses</th><th>Source edges</th><th>Cycle period</th><th>Inspect</th></tr></thead>
      <tbody>{analysis.ranked.slice(0,12).map((cycle:any)=>{
       const basin=continuity.basins[cycle.id];
       return <tr key={cycle.id} data-r740-basin={cycle.id}><td>{cycle.id+1}</td><td>{basin.nodeCount}</td><td>{basin.edgeCount}</td><td>{cycle.period}</td><td><button type='button' data-r740-select={cycle.id} onClick={()=>onAddress(cycle.representative)}>Select {cycle.representative}</button></td></tr>;
      })}</tbody>
     </table>
    </div>
    <small data-r740-boundary>{continuity.boundary} Download is a reproducible computed model witness, not a signed historical artifact.</small>
   </section>}
   {continuity&&<section data-r741-route aria-label='Exact directed source route explorer' style={{margin:'16px 0',maxWidth:'100%',minWidth:0}}>
    <h3>R741 · Directed source-route explorer</h3>
    <p>Choose a destination state and calculate whether the selected address reaches it by following actual successor edges. This distinguishes reachable cycle motion from unreachable branches and other basins; no reverse movement is invented.</p>
    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
     <label>Target source address <input data-r741-target type='number' min={0} max={20735} step={1} value={routeTarget} onChange={e=>setRouteTarget(e.target.value)} style={{width:112,maxWidth:'100%'}}/></label>
     <button type='button' data-r741-next onClick={()=>setRouteTarget(String(selected.nextAddress))}>Target next successor · {selected.nextAddress}</button>
     <button type='button' data-r741-self onClick={()=>setRouteTarget(String(address))}>Target selected address</button>
    </div>
    <p data-r741-summary role='status'>{directedRoute?(directedRoute.reachable?'Reachable · '+directedRoute.steps+' exact forward steps':'Unreachable · '+directedRoute.reason):'Enter an integer target address from 0 through 20,735.'}</p>
    {directedRoute&&<><p data-r741-path style={{overflowWrap:'anywhere'}}>{directedRoute.reachable?'Source path: '+directedRoute.addresses.join(' → ')+(directedRoute.omittedAddresses?' → … → '+directedRoute.to+' ('+directedRoute.omittedAddresses+' intermediate states omitted from display)':''):'No directed successor path from '+directedRoute.from+' to '+directedRoute.to+'.'}</p>
     <button type='button' data-r741-export onClick={exportDirectedRoute}>Download computed directed-route witness JSON</button></>}
    <label style={{display:'block',marginTop:8}}>Recover a previously exported route (local JSON)
     <input type='file' data-r741-import accept='.json,application/json' onChange={async e=>{
      const file=e.currentTarget.files?.[0];e.currentTarget.value='';
      await importDirectedRoute(file);
     }}/>
    </label>
    <p data-r741-recovery role='status'>{routeRecoveryStatus||'No imported route verified. The file stays in this browser.'}</p>
    <small data-r741-boundary>{directedRoute?.boundary||'Finite source-model directed reachability only; not physical travel, original donor parity or CanonState admission.'} Exported paths are bounded for display; step counts and endpoint checks are computed against the complete successor chain.</small>
   </section>}
   <section data-r742-atlas aria-label='Four-axis donor-derived traversal' style={{margin:'16px 0',maxWidth:'100%',minWidth:0}}>
    <h3>R742 · Four-axis π Atlas traversal</h3>
    <p>Navigate the recovered four-axis base-12 address topology. This computes an exact axis-neighbor witness, not the historical donor's weighted A* path or physical motion.</p>
    <p>Selected digits: {decodePiAddressR742(address).join(' · ')} · eight neighbors: {piAxisNeighborsR742(address).join(', ')}</p>
    <label>Destination address <input data-r742-target type='number' min={0} max={20735} step={1} value={piTarget} onChange={e=>setPiTarget(e.target.value)}/></label>
    <p data-r742-summary role='status'>{piWitness?piWitness.steps+' verified axis moves':'Enter a valid address from 0 to 20735.'}</p>
    {piWitness&&<><p data-r742-path style={{overflowWrap:'anywhere'}}>{piWitness.path.join(' → ')}</p>
     <button type='button' data-r742-export onClick={()=>{
      const blob=new Blob([JSON.stringify(piWitness,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='omega-r742-axis-witness.json';document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),0);
     }}>Export axis witness JSON</button></>}
    <label style={{display:'block',marginTop:8}}>Recover and verify an exported axis witness
     <input data-r742-import type='file' accept='.json,application/json' onChange={async e=>{
      const file=e.currentTarget.files?.[0];e.currentTarget.value='';
      if(!file)return;
      try{
       if(file.size>16384)throw Error('R742 witness size refused');
       const recovered=verifyPiAxisWitnessR742(await file.text());
       setPiTarget(String(recovered.to));onAddress(recovered.from);
       setPiRecovery('VERIFIED · '+recovered.steps+' recomputed axis moves');
      }catch(err){setPiRecovery('REFUSED · '+(err instanceof Error?err.message:'invalid witness'))}
     }}/>
    </label>
    <p data-r742-recovery role='status'>{piRecovery||'No imported witness verified. Local file only.'}</p>
    <small>Model-address topology and donor-derived geometry only. No donor metric buffers, weighted A* equivalence, empirical dimensionality or original-source identity claimed.</small>
   </section>
   <section data-r744-journey aria-label='Constrained source-metric Atlas journey' style={{margin:'16px 0',maxWidth:'100%',minWidth:0}}>
    <h3>R744 · Constrained multi-stop Atlas journey</h3>
    <p>Execute a least-cost route across the existing 20,736 model addresses, visiting intermediate addresses in order while excluding explicitly blocked model cells. Each leg uses real R743 source-metric costs and a bounded admissible A* search. Blocks are your planning constraints, not observed obstacles.</p>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
     <label>Destination <input data-r744-target type='number' min={0} max={20735} step={1} value={journeyTarget} onChange={e=>setJourneyTarget(e.target.value)} style={{maxWidth:120}}/></label>
     <label>Source metric <select data-r744-channel value={journeyChannel} onChange={e=>setJourneyChannel(e.target.value)}>{METRIC_ATLAS_CHANNELS_R743.map(channel=><option key={channel} value={channel}>{ATLAS_FIELD_CHANNELS_R734[channel]}</option>)}</select></label>
    </div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
     <label>Intermediate addresses (up to 4, comma separated) <input data-r744-waypoints type='text' value={journeyWaypoints} onChange={e=>setJourneyWaypoints(e.target.value)} placeholder='1728, 3456'/></label>
     <label>Excluded addresses (up to 64, comma separated) <input data-r744-blocked type='text' value={journeyBlocked} onChange={e=>setJourneyBlocked(e.target.value)} placeholder='1, 12'/></label>
    </div>
    <p data-r744-summary role='status'>{journeyState.route?journeyState.route.legs.length+' optimized legs · '+journeyState.route.steps+' steps · weighted cost '+journeyState.route.weightedCost.toFixed(6)+' · '+journeyState.route.blocked.length+' excluded addresses · '+journeyState.route.expanded+' expanded states':'REFUSED · '+(journeyState.error||'Source field unavailable')}</p>
    {journeyState.route&&<>
     <div data-r744-path style={{display:'flex',flexWrap:'wrap',gap:5,margin:'8px 0',maxHeight:180,overflowY:'auto'}}>
      {journeyState.route.addresses.map((step,i)=><button key={i} type='button' data-r744-step={i} onClick={()=>onAddress(step)} title={'Navigate to model address '+step}>{step}</button>)}
     </div>
     <button type='button' data-r744-export onClick={()=>{
      const blob=new Blob([JSON.stringify(journeyState.route,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='omega-r744-constrained-journey.json';document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),0);
     }}>Export exact journey JSON</button>
    </>}
    <label style={{display:'block',marginTop:8}}>Verify and recover a previously exported constrained journey
     <input data-r744-import type='file' accept='.json,application/json' onChange={async e=>{
      const file=e.currentTarget.files?.[0];e.currentTarget.value='';
      if(!file||!field)return;
      try{
       if(file.size>1048576)throw Error('R744 journey size refused');
       const recovered=verifyConstrainedAtlasJourneyR744(await file.text(),field);
       setJourneyTarget(String(recovered.to));setJourneyChannel(recovered.channel);
       setJourneyWaypoints(recovered.waypoints.join(','));setJourneyBlocked(recovered.blocked.join(','));
       onAddress(recovered.from);
       setJourneyRecovery('VERIFIED · '+recovered.legs.length+' recomputed constrained legs · '+recovered.steps+' steps');
      }catch(err){setJourneyRecovery('REFUSED · '+(err instanceof Error?err.message:'invalid journey'))}
     }}/>
    </label>
    <p data-r744-recovery role='status'>{journeyRecovery||'No journey recovered. Local file only.'}</p>
    <small>Planning occurs only in model-address space. No physical routing, original donor parity, external map obstruction, empirical dimension or CanonState mutation.</small>
   </section>
   <section data-r743-metric-atlas aria-label='Source-metric weighted Atlas traversal' style={{margin:'16px 0',maxWidth:'100%',minWidth:0}}>
    <h3>R743 · Source-metric Atlas route optimizer</h3>
    <p>Compute an actual least-cost path over the eight reversible R742 axis neighbors. Each edge costs one step plus the absolute difference in a selected, already-computed source metric. A* uses the admissible wrapped axis distance; it does not invent historical donor weights.</p>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
     <label>Destination address <input data-r743-target type='number' min={0} max={20735} step={1} value={metricTarget} onChange={e=>setMetricTarget(e.target.value)}/></label>
     <label>Source metric <select data-r743-channel value={metricChannel} onChange={e=>setMetricChannel(e.target.value)}>{METRIC_ATLAS_CHANNELS_R743.map(channel=><option key={channel} value={channel}>{ATLAS_FIELD_CHANNELS_R734[channel]}</option>)}</select></label>
    </div>
    <p data-r743-summary role='status'>{metricWitness?metricWitness.steps+' verified axis moves · optimized cost '+metricWitness.weightedCost.toFixed(6)+' · minimum axis distance '+metricWitness.axisLowerBound+' · '+metricWitness.expanded+' examined addresses':'Enter a valid address from 0 to 20735.'}</p>
    {metricWitness&&<>
     <div data-r743-path style={{display:'flex',flexWrap:'wrap',gap:5,margin:'8px 0'}}>
      {metricWitness.addresses.map((step,i)=><button key={i} type='button' data-r743-step={i} onClick={()=>onAddress(step)} title={'Select exact route address '+step}>{step}</button>)}
     </div>
     <button type='button' data-r743-export onClick={()=>{
      const blob=new Blob([JSON.stringify(metricWitness,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='omega-r743-source-metric-route.json';document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),0);
     }}>Export optimized route JSON</button>
    </>}
    <label style={{display:'block',marginTop:8}}>Recover and verify a source-metric route
     <input data-r743-import type='file' accept='.json,application/json' onChange={async e=>{
      const file=e.currentTarget.files?.[0];e.currentTarget.value='';
      if(!file)return;
      try{
       if(file.size>262144)throw Error('R743 route size refused');
       if(!field)throw Error('R743 source field unavailable');
       const recovered=verifyMetricAtlasRouteR743(await file.text(),field);
       setMetricTarget(String(recovered.to));setMetricChannel(recovered.channel);onAddress(recovered.from);
       setMetricRecovery('VERIFIED · '+recovered.steps+' source-metric axis moves');
      }catch(err){setMetricRecovery('REFUSED · '+(err instanceof Error?err.message:'invalid route'))}
     }}/>
    </label>
    <p data-r743-recovery role='status'>{metricRecovery||'No imported route verified. Local file only.'}</p>
    <small data-r743-boundary>Actual computed corpus metric buffers and model-address edges, not empirical motion, physical dimensions, original donor A* parity or canonical state mutation. Route export is verified against fresh source computation.</small>
   </section>
   <h3>Largest source-route basins</h3>
   <ol data-r732-ranked>{analysis.ranked.slice(0,8).map((cycle:any)=><li key={cycle.id} style={{padding:'4px 0'}}>
    <button type='button' data-r732-basin={cycle.id} onClick={()=>onAddress(cycle.representative)}>Select address {cycle.representative}</button>
    {' '}· {cycle.size.toLocaleString()} states · cycle period {cycle.period} · maximum entry depth {cycle.maxDepth}
   </li>)}</ol>
  </div>}
  <small data-r732-boundary>Source-bound deterministic model topology, not empirical attractors, physical time, physical dimensions, original historical equation parity, or CanonState admission. Selecting an address changes only the existing workspace selection. Full-state counts are conserved; source corpus loading and route validation are required before any result is shown.</small>
 </section>;
}
