const map=document.querySelector('#map');
let targetKey=null;
let patch=null;

function keyOf(point){return point&&Number.isFinite(Number(point.lon))&&Number.isFinite(Number(point.lat))?`${Number(point.lon).toFixed(6)},${Number(point.lat).toFixed(6)}`:null;}
function meshBounds(mesh){
  const pts=[];for(const row of mesh?.nodes||[])for(const n of row||[])if(Number.isFinite(n?.lon)&&Number.isFinite(n?.lat))pts.push(n);
  if(pts.length<4)return null;
  const lons=pts.map(p=>Number(p.lon)),lats=pts.map(p=>Number(p.lat));return [Math.min(...lons),Math.min(...lats),Math.max(...lons),Math.max(...lats)];
}
function patchMatchesTarget(candidate){const a=keyOf(candidate?.target),b=targetKey||keyOf(globalThis.OMEGA_SAR_NAVIGATION?.target);return !!a&&!!b&&a===b;}
function focusPatch(candidate=patch){
  const r=globalThis.OMEGA_SAR_RENDERER,bbox=meshBounds(candidate?.geoMesh);if(!r||!bbox||!patchMatchesTarget(candidate))return false;
  const pixels=Math.max(Number(candidate?.width)||0,Number(candidate?.height)||0),deep=pixels>=240;
  if(!r.fitBounds(bbox,{padding:deep?1.10:1.22,minScale:850,maxScale:deep?7600:5200}))return false;
  if(candidate.target)r.setPoint(candidate.target.lon,candidate.target.lat,{emit:false,redraw:true});
  globalThis.OMEGA_SAR_LOCAL_FOCUS={state:deep?'CALIBRATED_DEEP_PATCH_FIT_EXPLICIT':'CALIBRATED_PATCH_FIT_EXPLICIT',targetKey:keyOf(candidate.target),bbox,scale:r.view.scale,sourcePixels:[candidate.width,candidate.height],deep};
  return true;
}
function updateButton(){const button=document.querySelector('#omegaFitSar');if(!button)return;button.disabled=!(patch?.evidence?.measured===true&&patchMatchesTarget(patch));button.dataset.ready=button.disabled?'false':'true';}
function ensureButton(){
  const nav=document.querySelector('#omegaMapNav');if(!nav||document.querySelector('#omegaFitSar'))return false;
  const button=document.createElement('button');button.id='omegaFitSar';button.className='small';button.title='Fit the exact calibrated SAR patch';button.textContent='FIT SAR';button.disabled=true;button.addEventListener('click',()=>focusPatch());nav.append(button);return true;
}
map?.addEventListener('omega-map-select',event=>{const k=keyOf(event.detail);if(k&&k!==targetKey){targetKey=k;patch=null;globalThis.OMEGA_SAR_LOCAL_FOCUS=null;updateButton();}});
window.addEventListener('omega-calibrated-sar-patch',event=>{const candidate=event.detail?.patch;if(candidate?.evidence?.measured===true&&candidate?.inferred!==true&&patchMatchesTarget(candidate)){patch=candidate;updateButton();}});
window.addEventListener('omega-calibrated-sar-patch-clear',()=>{patch=null;globalThis.OMEGA_SAR_LOCAL_FOCUS=null;updateButton();});
if(!ensureButton()){const observer=new MutationObserver(()=>{if(ensureButton()){updateButton();observer.disconnect();}});observer.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),15000);}
globalThis.OMEGA_SAR_PATCH_FOCUS={focusPatch,meshBounds,get patch(){return patch;}};
