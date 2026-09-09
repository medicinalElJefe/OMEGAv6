import { fetchSentinel1Cog } from './stac.mjs';
import { calibratedTargetPatch, paintCalibratedPatch, sampleCalibratedSentinel1, supportTransportUrl, parseProductXml } from './sentinel1-calibration.mjs';
import { buildPatchGeoMesh } from './sar-registration.mjs';

const $=s=>typeof document==='undefined'?null:document.querySelector(s);
const cache=new Map();
let generation=0;
let autoPatch=true;
let initialized=false;

function pointFromUi(){
  const text=$('#point')?.textContent||'';
  const pair=text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if(pair){const lat=Number(pair[1]),lon=Number(pair[2]);if(Number.isFinite(lat)&&Number.isFinite(lon))return {lon,lat,source:'MAP_POINT'};}
  const wkt=$('#aoi')?.value||'';
  const m=wkt.match(/^\s*POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)\s*$/i);
  if(m){const lon=Number(m[1]),lat=Number(m[2]);if(Number.isFinite(lat)&&Number.isFinite(lon))return {lon,lat,source:'AOI_POINT'};}
  return null;
}

function recordFromUi(){
  const id=($('#currentScene')?.textContent||'').trim();
  if(!id||id==='—')return null;
  return {id,startTime:($('#currentTime')?.textContent||'').trim(),platform:(($('#platform')?.textContent||'sentinel-1').split('·')[0]||'sentinel-1').trim()};
}

function selectedPolarization(){return ($('#assetSelect')?.value||'vv').toLowerCase();}
function selectedQuantity(){return $('#sarCalQuantity')?.value||'sigmaNought';}
function fmt(v,d=3){return Number.isFinite(v)?Number(v).toFixed(d):'—';}
function patchKey(record,target,pol,quantity){return `${record.id}|${target.lon.toFixed(6)},${target.lat.toFixed(6)}|${pol}|${quantity}`;}

function remember(key,patch){
  cache.delete(key);cache.set(key,patch);
  while(cache.size>8)cache.delete(cache.keys().next().value);
}

async function attachGeoMesh(patch){
  const productHref=patch?.provenance?.product;
  if(!productHref)return patch;
  try{
    const response=await fetch(supportTransportUrl(productHref,'source'),{headers:{accept:'application/xml,text/xml,text/plain,*/*'}});
    if(!response.ok)throw new Error(`product annotation ${response.status}`);
    const product=parseProductXml(await response.text());
    const geoMesh=buildPatchGeoMesh(product,patch.sourceWindow,4);
    return {...patch,geoMesh};
  }catch(error){
    return {...patch,geoMesh:{state:'PATCH_GEOREGISTRATION_UNRESOLVED',error:error.message,validNodeCount:0,totalNodeCount:25}};
  }
}

function publishEarthOverlay(patch,canvas){
  if(typeof window==='undefined'||!patch||!canvas)return;
  window.dispatchEvent(new CustomEvent('omega-calibrated-sar-patch',{detail:{patch,canvas}}));
}

function renderPatchStatus(patch){
  const e=$('#rasterEmpty'),stats=$('#rasterStats');
  if(e)e.style.display='none';
  const s=patch.stats,g=patch.geolocation,p=patch.product,m=patch.geoMesh;
  const mesh=m?.state?` · Earth mesh ${m.state}${Number.isFinite(m.validNodeCount)?` ${m.validNodeCount}/${m.totalNodeCount}`:''}`:'';
  if(stats)stats.textContent=`CALIBRATED GRD · ${patch.id} · ${patch.polarization} ${patch.quantity} · target ${patch.target.lat.toFixed(5)}, ${patch.target.lon.toFixed(5)} · source window ${patch.width}×${patch.height} @ ${patch.centerPixel[0]},${patch.centerPixel[1]} · valid ${s.validCount.toLocaleString()} · dB p02 ${fmt(s.p02)} · median ${fmt(s.p50)} · p98 ${fmt(s.p98)} · geolocation ${g.method} residual ${Number.isFinite(g.residualDeg)?g.residualDeg.toExponential(2):'—'}° · spacing ${fmt(p.rangePixelSpacing,1)}m range / ${fmt(p.azimuthPixelSpacing,1)}m azimuth · PRODUCT LUT${mesh} · NOT RTC / NOT InSAR.`;
  const canvas=$('#raster');
  canvas?.classList.remove('flash');if(canvas){void canvas.offsetWidth;canvas.classList.add('flash');}
  const badge=$('#sarCalProof');
  if(badge){badge.textContent=`${g.quality} · ${patch.evidence.grade} · ${patch.processing.thermalNoiseCorrectionPerformed?'NOISE CORRECTED':'NOISE STATE UNCONFIRMED'} · ${m?.state||'EARTH MESH PENDING'}`;badge.dataset.state='ready';}
}

async function loadCalibratedCurrent({force=false}={}){
  const record=recordFromUi(),target=pointFromUi(),canvas=$('#raster');
  if(!record||!target||!canvas){
    const e=$('#rasterEmpty');if(e){e.style.display='grid';e.textContent='Bind an Earth point and select a real Sentinel-1 acquisition to load calibrated measurement pixels.';}return null;
  }
  const pol=selectedPolarization(),quantity=selectedQuantity(),key=patchKey(record,target,pol,quantity),my=++generation;
  if(!force&&cache.has(key)){
    const patch=cache.get(key);paintCalibratedPatch(patch,canvas);renderPatchStatus(patch);publishEarthOverlay(patch,canvas);return patch;
  }
  const e=$('#rasterEmpty');if(e){e.style.display='grid';e.textContent='Binding product geolocation grid…';}
  try{
    let patch=await calibratedTargetPatch(record,target.lon,target.lat,{polarization:pol,quantity,radiusPixels:Number($('#sarPatchRadius')?.value||96),onStage:stage=>{if(my!==generation)return;if(e)e.textContent={LOAD_PRODUCT_ANNOTATION:'Loading Sentinel-1 calibration + geolocation annotation…',INVERT_PRODUCT_GCP_GRID:'Inverting product GCP grid at Earth target…',READ_TARGET_SOURCE_BLOCKS:'Reading target source blocks from real GRD measurement…',APPLY_PRODUCT_CALIBRATION_LUT:'Applying product radiometric calibration LUT…',READY:'Building Earth-registration mesh…'}[stage]||stage;}});
    if(my!==generation)return null;
    patch=await attachGeoMesh(patch);
    if(my!==generation)return null;
    remember(key,patch);paintCalibratedPatch(patch,canvas);renderPatchStatus(patch);publishEarthOverlay(patch,canvas);return patch;
  }catch(error){
    if(my!==generation)return null;
    if(e){e.style.display='grid';e.textContent=`Calibrated patch unavailable: ${error.message}`;}
    const stats=$('#rasterStats');if(stats)stats.textContent='No calibrated raster evidence loaded; failure remains explicit.';
    const badge=$('#sarCalProof');if(badge){badge.textContent='CALIBRATION / GEOLOCATION UNRESOLVED';badge.dataset.state='error';}
    window.dispatchEvent(new CustomEvent('omega-calibrated-sar-patch-clear'));
    return null;
  }
}

function queryOptions(){
  const start=$('#start')?.value,end=$('#end')?.value,aoi=$('#aoi')?.value;
  return {start:start?`${start}T00:00:00Z`:null,end:end?`${end}T23:59:59Z`:null,intersectsWith:aoi||'',maxResults:Math.min(48,Math.max(1,Number($('#maxResults')?.value||24))),flightDirection:$('#direction')?.value||'',polarization:$('#polarization')?.value||''};
}

function paintTemporalChart(samples){
  const canvas=$('#probeChart');if(!canvas)return;
  const rect=canvas.getBoundingClientRect(),dpr=Math.max(1,globalThis.devicePixelRatio||1);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
  const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);const w=rect.width,h=rect.height;c.clearRect(0,0,w,h);c.fillStyle='#061017';c.fillRect(0,0,w,h);
  const valid=samples.filter(s=>Number.isFinite(s.db)&&s.startTime);
  if(!valid.length){c.fillStyle='#8ca2ad';c.font='11px ui-monospace,monospace';c.fillText('No calibrated Sentinel-1 samples resolved at this target.',12,22);return;}
  const times=valid.map(s=>new Date(s.startTime).getTime()),vals=valid.map(s=>s.db),minT=Math.min(...times),maxT=Math.max(...times),minV=Math.min(...vals),maxV=Math.max(...vals),pad=28;
  const x=t=>pad+(w-2*pad)*(maxT===minT?.5:(t-minT)/(maxT-minT));
  const y=v=>h-pad-(h-2*pad)*(maxV===minV?.5:(v-minV)/(maxV-minV));
  c.strokeStyle='rgba(123,185,207,.24)';c.lineWidth=1;c.beginPath();c.moveTo(pad,pad);c.lineTo(pad,h-pad);c.lineTo(w-pad,h-pad);c.stroke();
  c.strokeStyle='#71d6ff';c.lineWidth=1.5;c.beginPath();valid.forEach((s,i)=>{const px=x(new Date(s.startTime).getTime()),py=y(s.db);if(i)c.lineTo(px,py);else c.moveTo(px,py);});c.stroke();
  c.fillStyle='#e7f7ff';for(const s of valid){const px=x(new Date(s.startTime).getTime()),py=y(s.db);c.beginPath();c.arc(px,py,2.3,0,Math.PI*2);c.fill();}
  c.fillStyle='#8ca2ad';c.font='10px ui-monospace,monospace';c.fillText(`${fmt(minV,2)} dB`,3,h-pad);c.fillText(`${fmt(maxV,2)} dB`,3,pad+3);
}

async function probeCalibratedStack(){
  const target=pointFromUi(),status=$('#pixelProbeStatus'),button=$('#probeStack');
  if(!target){if(status)status.textContent='Bind a map/AOI point first.';return;}
  if(button)button.disabled=true;if(status)status.textContent='Querying current Sentinel-1 stack for calibrated point evidence…';
  try{
    const result=await fetchSentinel1Cog(queryOptions());
    const pol=selectedPolarization(),quantity=selectedQuantity(),records=result.records.slice(-Math.min(24,result.records.length));
    const samples=[];
    for(let i=0;i<records.length;i++){
      if(status)status.textContent=`Calibrating actual target sample ${i+1}/${records.length}…`;
      try{samples.push(await sampleCalibratedSentinel1(records[i],target.lon,target.lat,{polarization:pol,quantity}));}
      catch(error){samples.push({state:'SAMPLE_ERROR',id:records[i].id,startTime:records[i].startTime,measured:false,error:error.message});}
    }
    const valid=samples.filter(s=>s.state==='CALIBRATED_SENTINEL1_GRD_SAMPLE'&&Number.isFinite(s.db));
    globalThis.OMEGA_SAR_CALIBRATED_STACK=samples;
    paintTemporalChart(samples);
    if(status)status.textContent=`${valid.length}/${samples.length} calibrated Sentinel-1 ${pol.toUpperCase()} ${quantity} observations at ${target.lat.toFixed(5)}, ${target.lon.toFixed(5)} · product GCP geolocation + product LUT · values plotted in dB · inferred rows 0.`;
    const infer=$('#inferGap');if(infer)infer.disabled=valid.length<4;
  }catch(error){if(status)status.textContent=`Calibrated stack failed: ${error.message}`;}
  finally{if(button)button.disabled=false;}
}

function installControls(){
  const panel=document.querySelector('.pixel-panel');if(!panel||$('#sarCalControls'))return;
  const controls=document.createElement('div');controls.id='sarCalControls';controls.className='sar-cal-controls';
  controls.innerHTML=`<label>MEASUREMENT<select id="sarCalQuantity"><option value="sigmaNought">σ⁰ calibrated backscatter</option><option value="betaNought">β⁰ calibrated backscatter</option><option value="gamma">γ⁰ ellipsoid referenced</option></select></label><label>PATCH RADIUS<select id="sarPatchRadius"><option value="64">64 px</option><option value="96" selected>96 px</option><option value="128">128 px</option><option value="192">192 px</option></select></label><label class="inline-check"><input id="sarAutoPatch" type="checkbox" checked> AUTO FRAME RASTER</label><span id="sarCalProof" class="sar-proof-badge">TARGET + PRODUCT GRID + LUT + EARTH MESH</span>`;
  const stats=$('#rasterStats');stats?.before(controls);
  $('#sarCalQuantity')?.addEventListener('change',()=>loadCalibratedCurrent({force:true}));
  $('#sarPatchRadius')?.addEventListener('change',()=>loadCalibratedCurrent({force:true}));
  $('#sarAutoPatch')?.addEventListener('change',e=>{autoPatch=e.target.checked;if(autoPatch)loadCalibratedCurrent();});
}

function installInterceptors(){
  const raster=$('#loadRaster');
  raster?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();loadCalibratedCurrent({force:true});},true);
  const probe=$('#probeStack');
  probe?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();probeCalibratedStack();},true);
  const scene=$('#currentScene');
  if(scene){let last=scene.textContent;new MutationObserver(()=>{const now=scene.textContent;if(now===last)return;last=now;if(autoPatch&&now&&now!=='—')setTimeout(()=>loadCalibratedCurrent(),0);}).observe(scene,{childList:true,characterData:true,subtree:true});}
}

export function initializeSentinelConsole(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  installControls();installInterceptors();
  globalThis.OMEGA_SAR_SENTINEL={loadCalibratedCurrent,probeCalibratedStack,cache};
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeSentinelConsole,{once:true});
  else queueMicrotask(initializeSentinelConsole);
}
