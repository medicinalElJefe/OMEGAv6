const sceneEl=document.querySelector('#currentScene');
let pending=null;
let retryTimer=null;
const state={visible:false,patchId:null,cells:null,mode:'WORLD_RENDERER_SINGLE_CAMERA',surfacePriority:'SAR_FIRST'};
globalThis.OMEGA_SAR_EARTH_OVERLAY=state;

function currentScene(){return (sceneEl?.textContent||'').trim();}
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function applyContextOpacity(value){const r=renderer();if(!r)return;r.baseOpacity=Math.max(0,Math.min(1,Number(value)));r.redraw?.();}
function clear(){
  clearTimeout(retryTimer);pending=null;const r=renderer();r?.clearSarOverlay?.();if(r){r.baseOpacity=.14;r.redraw?.();}
  state.visible=false;state.patchId=null;state.cells=null;state.geolocation=null;state.measurement=false;
}
function bind(patch,canvas,attempt=0){
  if(!patch||!canvas||currentScene()!==patch.id)return false;const r=renderer();
  if(!r){if(attempt<24){pending={patch,canvas};clearTimeout(retryTimer);retryTimer=setTimeout(()=>bind(patch,canvas,attempt+1),25);}return false;}
  r.setSarOverlay(patch,canvas);r.baseOpacity=.035;r.redraw?.();state.visible=true;state.patchId=patch.id;state.cells=patch.geoMesh?.validNodeCount||0;state.geolocation=patch.geolocation?.quality||patch.geoMesh?.state||null;state.measurement=patch.evidence?.measured===true;pending=null;
  globalThis.OMEGA_SAR_SURFACE_PRIORITY={mode:'CALIBRATED_SAR_PRIMARY',contextOpacity:r.baseOpacity,sceneId:patch.id};return true;
}
window.addEventListener('omega-source-sar-frame',()=>{if(!state.visible){applyContextOpacity(.10);globalThis.OMEGA_SAR_SURFACE_PRIORITY={mode:'SOURCE_SAR_PRIMARY',contextOpacity:.10,sceneId:currentScene()};}});
window.addEventListener('omega-calibrated-sar-patch',event=>{const {patch,canvas}=event.detail||{};bind(patch,canvas);});
window.addEventListener('omega-calibrated-sar-patch-clear',clear);
if(sceneEl)new MutationObserver(()=>{const id=currentScene();if(state.patchId&&state.patchId!==id)clear();else if(pending?.patch?.id===id)bind(pending.patch,pending.canvas);}).observe(sceneEl,{childList:true,subtree:true,characterData:true});
