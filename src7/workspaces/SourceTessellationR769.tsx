import {useEffect,useMemo,useRef,useState} from 'react';
import {ATLAS_FIELD_CHANNELS_R734} from '../../src/atlasFieldRasterR734.mjs';
import {renderAtlasFieldRasterR734} from '../../src/atlasFieldRasterR734.mjs';
import {computeSourceFieldLensR770,DEFAULT_SOURCE_LENS_R770,SOURCE_LENS_STORAGE_KEY_R770,serializeSourceLensSettingsR770,parseSourceLensSettingsR770} from '../../src/sourceFieldLensR770.mjs';
import {buildSourceTessellationR769,navigateSourceTessellationR769,serializeSourceTessellationSvgR769,SOURCE_TESSELLATION_SIZES_R769} from '../../src/sourceTessellationR769.mjs';
import type {Mandala20736Field} from '../../src/mandala20736Runtime';
import {buildSourceSceneBundleR793,verifySourceSceneBundleR793,traceSourceContinuityR794} from '../../src/sourceSceneBundleR793.mjs';
import {parseSourceWorkspaceR795,assertSourceWorkspaceProjectR795} from '../../src/sourceWorkspaceRecoveryR795.mjs';
import {emitOperationR86} from '../../src/omegaOperationBusR86';
import {activeProjectIdR87,recordProjectOperationR87} from '../../src/omegaProjectContinuityR87';
type Props={field:Mandala20736Field;raster:any;address:number;onAddress:(address:number)=>void};
type LensSettings={mode:'single'|'woven';first:string;second:string;weightPercent:number};
/** Executable source-field tessellation, not an authenticated historical renderer. */
export default function SourceTessellationR769({field,raster,address,onAddress}:Props){
 const [tileSize,setTileSize]=useState(12),[showEdges,setShowEdges]=useState(true);
 const [sceneBusy,setSceneBusy]=useState(false),[sceneProof,setSceneProof]=useState('Not yet verified against the current source state.');
 const [singleChannelOverride,setSingleChannelOverride]=useState<string|null>(null);
 const [lens,setLens]=useState<LensSettings>(()=>{
  try{return typeof window==='undefined'?{...DEFAULT_SOURCE_LENS_R770}:parseSourceLensSettingsR770(window.localStorage.getItem(SOURCE_LENS_STORAGE_KEY_R770)||'');}
  catch{return {...DEFAULT_SOURCE_LENS_R770};}
 });
 useEffect(()=>{try{window.localStorage.setItem(SOURCE_LENS_STORAGE_KEY_R770,serializeSourceLensSettingsR770(lens));}catch{/* private browsing or quota: source recomputation remains usable */}},[lens]);
 const displayRaster=useMemo(()=>lens.mode==='woven'?
  computeSourceFieldLensR770(field,lens.first,lens.second,lens.weightPercent):
  (singleChannelOverride?renderAtlasFieldRasterR734(field,singleChannelOverride):raster),
  [field,raster,lens,singleChannelOverride]);
 const tile=useMemo(()=>buildSourceTessellationR769(field,displayRaster,address,tileSize),[field,displayRaster,address,tileSize]);
 const selected=tile.cells.find((c:any)=>c.address===address);
 // One selected source address drives all relational views; no second simulated state.
 const relation=useMemo(()=>{
  const successor=field.routeNext[address];
  const channels=[
   ['Continuity',field.C[address]],['Phase',field.phase[address]],
   ['Motion',field.motion[address]],['Symmetry',field.symmetry[address]],
   ['Scar',field.scar[address]],['Evidence',field.evidence[address]],
   ['Contradiction',field.q[address]],['Forecast model',field.forecast[address]]
  ] as [string,number][];
  return {successor,domain:field.domain[address],delta:field.C[successor]-field.C[address],channels};
 },[field,address]);
 const trace=useMemo(()=>traceSourceContinuityR794(field,address,{maxSteps:12}),[field,address]);
 const [recoveryStatus,setRecoveryStatus]=useState('No workspace checkpoint restored.');
 const workspaceKey=()=>{
  const project=activeProjectIdR87();
  return 'omega.r795.sourceWorkspace.'+(project?encodeURIComponent(project):'unassigned');
 };
 const saveWorkspace=()=>{
  try{
   const checkpoint={schema:'OMEGA_SOURCE_WORKSPACE_R795_V1',address,tileSize,showEdges,
    lens,channelOverride:singleChannelOverride,savedAt:new Date().toISOString(),
    sourceAuthority:'SETTINGS_ONLY_RECOMPUTE_ON_RESTORE'};
   const serialized=JSON.stringify(checkpoint);
   parseSourceWorkspaceR795(serialized,ATLAS_FIELD_CHANNELS_R734,SOURCE_TESSELLATION_SIZES_R769);
   window.localStorage.setItem(workspaceKey(),serialized);
   setRecoveryStatus('Saved local workspace settings; no source values or Canon state stored.');
  }catch(error){setRecoveryStatus('SAVE REFUSED · '+String(error))}
 };
 const restoreWorkspace=()=>{
  try{
   const raw=window.localStorage.getItem(workspaceKey());
   if(!raw)throw Error('no saved workspace');
   const saved=parseSourceWorkspaceR795(raw,ATLAS_FIELD_CHANNELS_R734,SOURCE_TESSELLATION_SIZES_R769);
   setTileSize(saved.tileSize);setShowEdges(saved.showEdges);
   setLens({mode:saved.lens.mode,first:saved.lens.first,
    second:saved.lens.second,weightPercent:saved.lens.weightPercent});
   setSingleChannelOverride(saved.channelOverride);
   onAddress(saved.address);
   setRecoveryStatus('Workspace restored · source values and traversal recomputed from current field.');
  }catch(error){setRecoveryStatus('RESTORE REFUSED · '+String(error))}
 };
 const exportWorkspace=()=>{
  try{
   const checkpoint={schema:'OMEGA_SOURCE_WORKSPACE_R795_V1',address,tileSize,showEdges,
    lens,channelOverride:singleChannelOverride,savedAt:new Date().toISOString(),
    sourceAuthority:'SETTINGS_ONLY_RECOMPUTE_ON_RESTORE'};
   const serialized=JSON.stringify(checkpoint);
   parseSourceWorkspaceR795(serialized,ATLAS_FIELD_CHANNELS_R734,SOURCE_TESSELLATION_SIZES_R769);
   const url=URL.createObjectURL(new Blob([serialized],{type:'application/json'}));
   const a=document.createElement('a');a.href=url;a.download='omega-r795-source-workspace-settings.json';
   document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setRecoveryStatus('Portable settings export requested · source values excluded; download not independently verified.');
  }catch(error){setRecoveryStatus('EXPORT REFUSED · '+String(error))}
 };
 const importSequence=useRef(0);
 const importWorkspace=async(file?:File)=>{
  if(!file)return;
  const request=++importSequence.current;
  const startingProject=activeProjectIdR87();
  try{
   if(file.size>8192)throw Error('checkpoint exceeds 8192-byte limit');
   const raw=await file.text();
   if(request!==importSequence.current)throw Error('superseded workspace import');
   // A slow file read must never apply one project's settings to another active project.
   assertSourceWorkspaceProjectR795(startingProject,activeProjectIdR87());
   const saved=parseSourceWorkspaceR795(raw,ATLAS_FIELD_CHANNELS_R734,SOURCE_TESSELLATION_SIZES_R769);
   // Do not write imported settings to local storage without explicit Save.
   setTileSize(saved.tileSize);setShowEdges(saved.showEdges);
   setLens({mode:saved.lens.mode,first:saved.lens.first,
    second:saved.lens.second,weightPercent:saved.lens.weightPercent});
   setSingleChannelOverride(saved.channelOverride);onAddress(saved.address);
   setRecoveryStatus('Portable settings imported · live source and traversal recomputed; Save to retain locally.');
  }catch(error){if(request===importSequence.current)setRecoveryStatus('IMPORT REFUSED · '+String(error))}
 };
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

 const exportPng=async()=>{
  setSceneBusy(true);setSceneProof('Computing and rasterizing the current Atlas source scene…');
  let svgUrl:string|null=null;
  try{
   const bundle=await buildSourceSceneBundleR793(field,displayRaster,{address,tileSize,showEdges});
   const replay=await verifySourceSceneBundleR793(field,displayRaster,bundle);
   if(!replay.ok)throw Error('source state changed during PNG projection');
   svgUrl=URL.createObjectURL(new Blob([bundle.svg],{type:'image/svg+xml;charset=utf-8'}));
   const img=new Image();
   await new Promise<void>((resolve,reject)=>{
    img.onload=()=>resolve();
    img.onerror=()=>reject(Error('source scene SVG could not be rasterized'));
    img.src=svgUrl!;
   });
   const canvas=document.createElement('canvas'),width=tileSize*64;
   canvas.width=width;canvas.height=width;
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas renderer unavailable');
   ctx.fillStyle='#111d2c';ctx.fillRect(0,0,width,width);
   ctx.drawImage(img,0,0,width,width);
   const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG encoding unavailable')),'image/png'));
   const url=URL.createObjectURL(png),a=document.createElement('a');
   a.href=url;a.download='omega-r793-source-'+address+'-'+bundle.sceneFingerprintSha256.slice(0,12)+'.png';
   document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   const event=await emitOperationR86({type:'ARTIFACT_EXPORTED',surface:'OMEGA7_SOURCE_TESSELLATION_R793',
    stateId:address+1,address,status:'PASS',
    detail:'Browser PNG conversion requested from verified source SVG; PNG bytes not independently attested by native host.',
    payload:{format:'PNG',sceneFingerprintSha256:bundle.sceneFingerprintSha256,sourceSvgSha256:bundle.scene.svgSha256,
     renderer:'BROWSER_CANVAS_FROM_SOURCE_SVG',canonicalMutation:false}});
   await recordProjectOperationR87(activeProjectIdR87()||undefined,event);
   setSceneProof('PNG RENDERED FROM VERIFIED SOURCE SVG · '+bundle.sceneFingerprintSha256+' · browser-only');
  }catch(error){setSceneProof('REFUSED · '+(error instanceof Error?error.message:String(error)))}
  finally{if(svgUrl)URL.revokeObjectURL(svgUrl);setSceneBusy(false)}
 };
 const importScene=async(file:File|undefined)=>{
  if(!file)return;
  setSceneBusy(true);setSceneProof('Verifying imported scene against the current live source…');
  try{
   if(file.size>8*1024*1024)throw Error('scene bundle exceeds 8 MiB local verification limit');
   const bundle=JSON.parse(await file.text());
   const replay=await verifySourceSceneBundleR793(field,null,bundle);
   if(!replay.ok)throw Error(replay.reason||'scene not reproducible');
   const saved=bundle.source.rasterDescriptor;
   if(saved.type==='R770_WOVEN_CHANNELS'){
    setSingleChannelOverride(null);
    setLens({mode:'woven',first:saved.first,second:saved.second,weightPercent:saved.secondWeightPercent});
   }else{
    setSingleChannelOverride(saved.channel);
    setLens(current=>({...current,mode:'single'}));
   }
   setTileSize(bundle.scene.tileSize);setShowEdges(bundle.scene.showEdges);
   onAddress(bundle.scene.address);
   const event=await emitOperationR86({type:'ANALYSIS_COMPLETED',surface:'OMEGA7_SOURCE_TESSELLATION_R793',
    stateId:bundle.scene.address+1,address:bundle.scene.address,status:'PASS',
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
  <p data-r770-summary role='status'>{lens.mode==='woven'?('Computed lens: '+(100-lens.weightPercent)+'% '+ATLAS_FIELD_CHANNELS_R734[lens.first]+' + '+lens.weightPercent+'% '+ATLAS_FIELD_CHANNELS_R734[lens.second]+' · '+displayRaster.values.length.toLocaleString()+' source addresses'):('Single source-channel projection (R769)'+(singleChannelOverride?' · imported channel '+singleChannelOverride:''))}</p>
  <small data-r770-boundary>Woven lens normalizes each existing source channel independently and blends by the selected weights. Saved settings restore only this browser view; source metrics are recomputed. This is model-space color geometry, not an observed field, empirical forecast, donor renderer, or physical dimensions.</small>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
   <label>Tile width <select data-r769-zoom value={tileSize} onChange={e=>setTileSize(Number(e.target.value))}>
    {SOURCE_TESSELLATION_SIZES_R769.map(n=><option key={n} value={n}>{n} × {n} addresses</option>)}
   </select></label>
   <label><input data-r769-edges type='checkbox' checked={showEdges} onChange={e=>setShowEdges(e.target.checked)}/> Source successor lines</label>
   <button type='button' data-r769-export onClick={download}>Export computed SVG</button>
   <button type='button' data-r793-scene-export disabled={sceneBusy} onClick={()=>void exportScene()}>Export scene + replay proof</button>
   <button type='button' data-r793-png-export disabled={sceneBusy} onClick={()=>void exportPng()}>Render source PNG</button>
   {singleChannelOverride&&<button type='button' data-r793-reset-source onClick={()=>setSingleChannelOverride(null)}>Return to route source channel</button>}
   <label>Verify saved scene <input data-r793-scene-import type='file' accept='.json,application/json' disabled={sceneBusy} onChange={e=>{void importScene(e.target.files?.[0]);e.target.value='';}}/></label>
  </div>
  <div data-r795-workspace-recovery style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}>
   <button type='button' data-r795-save-workspace onClick={saveWorkspace}>Save local workspace</button>
   <button type='button' data-r795-restore-workspace onClick={restoreWorkspace}>Restore local workspace</button>
   <button type='button' data-r795-export-workspace onClick={exportWorkspace}>Export portable settings</button>
   <label>Import portable settings <input data-r795-import-workspace type='file' accept='.json,application/json' onChange={e=>{void importWorkspace(e.target.files?.[0]);e.target.value='';}}/></label>
   <span data-r795-recovery-status role='status' aria-live='polite'>{recoveryStatus}</span>
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
  <div data-r794-relational-view aria-label='Live source relational field view' style={{marginTop:12,padding:10,border:'1px solid #617987',borderRadius:8}}>
   <strong>Relational source · address {address}</strong>
   <p data-r794-continuity>Domain {relation.domain} · successor {relation.successor} · successor continuity Δ {relation.delta.toFixed(6)}</p>
   <button type='button' data-r794-follow-successor onClick={()=>onAddress(relation.successor)} disabled={relation.successor===address}>Follow declared source successor</button>
   <details data-r794-traversal>
    <summary>Trace source continuity · {trace.steps.length} steps · {trace.termination}</summary>
    <ol style={{maxHeight:220,overflowY:'auto',paddingLeft:24}}>
     {trace.steps.map(step=><li key={step.address}>
      <button type='button' data-r794-trace-address={step.address} onClick={()=>onAddress(step.address)}>
       {step.address} → {step.successor}
      </button>
      {' · ΔC '+step.continuityDelta.toFixed(5)+' · motion '+step.motion.toFixed(5)+' · evidence '+step.evidence.toFixed(5)}
     </li>)}
    </ol>
    <small>Bounded traversal of the actual source successor graph. Cycles and step limits are explicit; no predicted future route is implied.</small>
   </details>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8}}>
    {relation.channels.map(([name,value])=><div key={name} style={{padding:8,background:'#17283a',borderRadius:6}}>
     <div style={{fontSize:12,color:'#d1dbe6'}}>{name}</div>
     <output style={{fontVariantNumeric:'tabular-nums'}}>{Number.isFinite(value)?value.toFixed(6):'INVALID SOURCE'}</output>
    </div>)}
   </div>
   <small data-r794-relational-boundary>These values are read directly from the same current 20,736-address Atlas field as the tessellation. The forecast value is a model score, not a measured prediction. No independent physical or Canon authority is asserted.</small>
  </div>
  <p data-r769-selected>Selected address {address} · value {selected?.value.toFixed(6)} · successor {selected?.successor} · Δ {selected?.delta.toFixed(6)}</p>
  <small data-r769-boundary>All {tile.sourceAddressCount.toLocaleString()} addresses remain reachable through the source raster and navigation. Zoom is a computed model projection, not physical geometry, authenticated historical renderer parity, a forecast, or CanonState mutation. SVG export and portable scene/replay JSON are computed from the current source field. Neither is a native-device, empirical, historical donor or CanonState proof; the current source field is recomputed on reload.</small>
 </section>;
}
