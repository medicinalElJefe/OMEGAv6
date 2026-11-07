import {useEffect,useMemo,useState} from 'react';
import {ATLAS_FIELD_CHANNELS_R734} from '../../src/atlasFieldRasterR734.mjs';
import {computeSourceFieldLensR770,DEFAULT_SOURCE_LENS_R770,SOURCE_LENS_STORAGE_KEY_R770,serializeSourceLensSettingsR770,parseSourceLensSettingsR770} from '../../src/sourceFieldLensR770.mjs';
import {buildSourceTessellationR769,navigateSourceTessellationR769,serializeSourceTessellationSvgR769,SOURCE_TESSELLATION_SIZES_R769} from '../../src/sourceTessellationR769.mjs';
import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {buildSourceSceneBundleR793,verifySourceSceneBundleR793} from '../../src/sourceSceneBundleR793.mjs';
import {emitOperationR86} from '../../src/omegaOperationBusR86';
import {activeProjectIdR87,recordProjectOperationR87} from '../../src/omegaProjectContinuityR87';
type Props={field:Mandala20736Field;raster:any;address:number;onAddress:(address:number)=>void};
type LensSettings={mode:'single'|'woven';first:string;second:string;weightPercent:number};
/** Executable source-field tessellation, not an authenticated historical renderer. */
export default function SourceTessellationR769({field,raster,address,onAddress}:Props){
 const [tileSize,setTileSize]=useState(12),[showEdges,setShowEdges]=useState(true);
 const [sceneBusy,setSceneBusy]=useState(false),[sceneProof,setSceneProof]=useState('Not yet verified against the current source state.');
 const [lens,setLens]=useState<LensSettings>(()=>{
  try{return typeof window==='undefined'?{...DEFAULT_SOURCE_LENS_R770}:parseSourceLensSettingsR770(window.localStorage.getItem(SOURCE_LENS_STORAGE_KEY_R770)||'');}
  catch{return {...DEFAULT_SOURCE_LENS_R770};}
 });
 useEffect(()=>{try{window.localStorage.setItem(SOURCE_LENS_STORAGE_KEY_R770,serializeSourceLensSettingsR770(lens));}catch{/* private browsing or quota: source recomputation remains usable */}},[lens]);
 const displayRaster=useMemo(()=>lens.mode==='woven'?
  computeSourceFieldLensR770(field,lens.first,lens.second,lens.weightPercent):raster,
  [field,raster,lens]);
 const tile=useMemo(()=>buildSourceTessellationR769(field,displayRaster,address,tileSize),[field,displayRaster,address,tileSize]);
 const selected=tile.cells.find((c:any)=>c.address===address);
 const move=(dy:number,dx:number)=>onAddress(navigateSourceTessellationR769(address,dy,dx));
 const download=()=>{
  const svg=serializeSourceTessellationSvgR769(tile,{showEdges});
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  const a=document.createElement('a');a.href=url;a.download='omega-r769-source-'+displayRaster.channel+'-'+address+'.svg';
  document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const exportScene=async()=>{
  setSceneBusy(true);setSceneProof('Recomputing source, geometry and scene fingerprint…');
  try{
   const bundle=await buildSourceSceneBundleR793(field,displayRaster,{address,tileSize,showEdges});
   const replay=await verifySourceSceneBundleR793(field,displayRaster,bundle);
   if(!replay.ok)throw Error('R793 refused export: deterministic replay mismatch');
   const url=URL.createObjectURL(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='omega-r793-scene-'+address+'-'+bundle.sceneFingerprintSha256.slice(0,12)+'.json';
   document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   const event=await emitOperationR86({type:'ARTIFACT_EXPORTED',surface:'OMEGA7_SOURCE_TESSELLATION_R793',
    stateId:address+1,address,status:'PASS',
    detail:'Browser requested export of source-derived scene; local replay matched. Physical download and Canon admission are not claimed.',
    payload:{sceneFingerprintSha256:bundle.sceneFingerprintSha256,sourceFieldSha256:bundle.source.fieldSha256,
     outputSha256:bundle.scene.svgSha256,truthClass:'LOCAL_RECOMPUTED_SCENE',canonicalMutation:false}});
   await recordProjectOperationR87(activeProjectIdR87()||undefined,event);
   setSceneProof('LOCAL REPLAY MATCH · '+bundle.sceneFingerprintSha256+' · no Canon or native execution claim');
  }catch(error){setSceneProof('REFUSED · '+(error instanceof Error?error.message:String(error)))}
  finally{setSceneBusy(false)}
 };
 const importScene=async(file:File|undefined)=>{
  if(!file)return;
  setSceneBusy(true);setSceneProof('Verifying imported scene against the current live source…');
  try{
   if(file.size>8*1024*1024)throw Error('scene bundle exceeds 8 MiB local verification limit');
   const bundle=JSON.parse(await file.text());
   const replay=await verifySourceSceneBundleR793(field,null,bundle);
   if(!replay.ok)throw Error(replay.reason||'scene not reproducible');
   const event=await emitOperationR86({type:'ANALYSIS_COMPLETED',surface:'OMEGA7_SOURCE_TESSELLATION_R793',
    stateId:address+1,address,status:'PASS',
    detail:'Imported scene recomputed against local source state. External witness and Canon admission not established.',
    payload:{sceneFingerprintSha256:bundle.sceneFingerprintSha256,truthClass:'LOCAL_RECOMPUTED_SCENE',canonicalMutation:false}});
   await recordProjectOperationR87(activeProjectIdR87()||undefined,event);
   setSceneProof('IMPORTED SCENE MATCH · '+bundle.sceneFingerprintSha256+' · local recomputation only');
  }catch(error){setSceneProof('REFUSED · '+(error instanceof Error?error.message:String(error)))}
  finally{setSceneBusy(false)}
 };
 return <section data-r769-tessellation='source-field' aria-label='Source field multiscale tessellation' style={{margin:'12px 0',padding:10,border:'1px solid #617987',borderRadius:8,maxWidth:580}}>
  <h4>R769 · Source-field multiscale tessellation</h4>
  <p>Zoom into the computed 144 × 144 address field. Each address becomes two source-colored triangles; their contrast follows the actual metric difference to its declared successor. Optional lines connect only successors inside the visible tile.</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
   <label>Field lens <select data-r770-mode value={lens.mode} onChange={e=>setLens({...lens,mode:e.target.value as LensSettings['mode']})}><option value='single'>Single source channel</option><option value='woven'>Woven two-channel source lens</option></select></label>
  </div>
  {lens.mode==='woven'&&<div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',margin:'8px 0'}}>
   <label>First source <select data-r770-first value={lens.first} onChange={e=>setLens({...lens,first:e.target.value})}>{Object.entries(ATLAS_FIELD_CHANNELS_R734).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <label>Second source <select data-r770-second value={lens.second} onChange={e=>setLens({...lens,second:e.target.value})}>{Object.entries(ATLAS_FIELD_CHANNELS_R734).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
   <label>Second-source weight <input data-r770-weight type='range' min='0' max='100' step='5' value={lens.weightPercent} onChange={e=>setLens({...lens,weightPercent:Number(e.target.value)})}/>{lens.weightPercent}%</label>
  </div>}
  <p data-r770-summary role='status'>{lens.mode==='woven'?('Computed lens: '+(100-lens.weightPercent)+'% '+ATLAS_FIELD_CHANNELS_R734[lens.first]+' + '+lens.weightPercent+'% '+ATLAS_FIELD_CHANNELS_R734[lens.second]+' · '+displayRaster.values.length.toLocaleString()+' source addresses'):'Single source-channel projection (R769)'}</p>
  <small data-r770-boundary>Woven lens normalizes each existing source channel independently and blends by the selected weights. Saved settings restore only this browser view; source metrics are recomputed. This is model-space color geometry, not an observed field, empirical forecast, donor renderer, or physical dimensions.</small>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
   <label>Tile width <select data-r769-zoom value={tileSize} onChange={e=>setTileSize(Number(e.target.value))}>
    {SOURCE_TESSELLATION_SIZES_R769.map(n=><option key={n} value={n}>{n} × {n} addresses</option>)}
   </select></label>
   <label><input data-r769-edges type='checkbox' checked={showEdges} onChange={e=>setShowEdges(e.target.checked)}/> Source successor lines</label>
   <button type='button' data-r769-export onClick={download}>Export computed SVG</button>
   <button type='button' data-r793-scene-export disabled={sceneBusy} onClick={()=>void exportScene()}>Export scene + replay proof</button>
   <label>Verify saved scene <input data-r793-scene-import type='file' accept='.json,application/json' disabled={sceneBusy} onChange={e=>{void importScene(e.target.files?.[0]);e.target.value='';}}/></label>
  </div>
  <p data-r793-scene-status role='status' aria-live='polite'>{sceneProof}</p>
  <small data-r793-truth-boundary>Scene JSON contains the complete generated SVG plus hashes of all current atlas field channels, selected raster and output. It can be reverified against this live source. Local hashes are integrity evidence, never a signed external execution receipt or historical renderer parity.</small>
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
