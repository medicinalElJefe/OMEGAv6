const sceneEl=document.querySelector('#currentScene');
let pending=null;
let retryTimer=null;
const state={visible:false,patchId:null,cells:null,mode:'WORLD_RENDERER_SINGLE_CAMERA'};
globalThis.OMEGA_SAR_EARTH_OVERLAY=state;

function currentScene(){return (sceneEl?.textContent||'').trim();}
function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function clear(){
  clearTimeout(retryTimer);pending=null;const r=renderer();r?.clearSarOverlay?.();
  state.visible=false;state.patchId=null;state.cells=null;
}
function bind(patch,canvas,attempt=0){
  if(!patch||!canvas||currentScene()!==patch.id)return false;
  const r=renderer();
  if(!r){
    if(attempt<20){pending={patch,canvas};clearTimeout(retryTimer);retryTimer=setTimeout(()=>bind(patch,canvas,attempt+1),25);}
    return false;
  }
  r.setSarOverlay(patch,canvas);
  state.visible=true;state.patchId=patch.id;state.cells=patch.geoMesh?.validNodeCount||0;
  state.geolocation=patch.geolocation?.quality||patch.geoMesh?.state||null;
  state.measurement=patch.evidence?.measured===true;
  pending=null;return true;
}

window.addEventListener('omega-calibrated-sar-patch',event=>{const {patch,canvas}=event.detail||{};bind(patch,canvas);});
window.addEventListener('omega-calibrated-sar-patch-clear',clear);
if(sceneEl)new MutationObserver(()=>{const id=currentScene();if(state.patchId&&state.patchId!==id)clear();else if(pending?.patch?.id===id)bind(pending.patch,pending.canvas);}).observe(sceneEl,{childList:true,subtree:true,characterData:true});
