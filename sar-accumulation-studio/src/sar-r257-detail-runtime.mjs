const $=s=>document.querySelector(s);
let deepTimer=null,deepRunning=false,lastDeepKey='';
const state={state:'INITIALIZING',release:'R257',interactiveRadius:64,deepRadius:128,deepPatch:null,promotions:0,lastPromotion:null,boundary:'Progressive detail increases the number of source Sentinel-1 GRD pixels read and displayed. It does not interpolate or synthesize missing SAR measurements.'};
globalThis.OMEGA_SAR_R257_DETAIL=state;

function currentIdentity(){
  const scene=($('#currentScene')?.textContent||'').trim(),point=globalThis.OMEGA_SAR_NAVIGATION?.target;if(!scene||scene==='—'||!point)return null;
  return `${scene}|${Number(point.lon).toFixed(6)},${Number(point.lat).toFixed(6)}|${String($('#assetSelect')?.value||'vv').toLowerCase()}|${$('#sarCalQuantity')?.value||'sigmaNought'}`;
}
function setInteractiveDefault(){const select=$('#sarPatchRadius');if(select&&select.value==='32')select.value=String(state.interactiveRadius);}
async function promoteDeep(){
  const api=globalThis.OMEGA_SAR_SENTINEL,identity=currentIdentity();if(!api?.loadCalibratedCurrent||!identity||deepRunning||identity===lastDeepKey)return;
  const select=$('#sarPatchRadius');if(!select)return;const previous=select.value;deepRunning=true;state.state='DEEP_SOURCE_READ';
  try{
    select.value=String(state.deepRadius);
    const patch=await api.loadCalibratedCurrent({force:true});
    if(!patch||currentIdentity()!==identity)return;
    lastDeepKey=identity;state.deepPatch={id:patch.id,width:patch.width,height:patch.height,validCount:patch.stats?.validCount||0,sourceWindow:patch.sourceWindow,evidence:patch.evidence};state.promotions++;state.lastPromotion=new Date().toISOString();state.state='DEEP_READY';
    window.dispatchEvent(new CustomEvent('omega-r257-deep-detail',{detail:{...state.deepPatch,promotions:state.promotions}}));
  }catch(error){state.state='DEEP_UNRESOLVED';state.error=error.message;}
  finally{deepRunning=false;if(select)select.value=previous;globalThis.OMEGA_SAR_R257_EXPERIENCE?.refresh?.();}
}
function scheduleDeep(delay=420){clearTimeout(deepTimer);deepTimer=setTimeout(()=>promoteDeep(),delay);}
function onPatch(event){const patch=event.detail?.patch;if(patch?.state!=='CALIBRATED_SENTINEL1_TARGET_PATCH'||patch?.evidence?.measured!==true)return;if(Math.min(patch.width||0,patch.height||0)>=240){lastDeepKey=currentIdentity()||lastDeepKey;state.deepPatch={id:patch.id,width:patch.width,height:patch.height,validCount:patch.stats?.validCount||0,sourceWindow:patch.sourceWindow,evidence:patch.evidence};state.state='DEEP_READY';return;}scheduleDeep(360);}
function install(){
  setInteractiveDefault();const retry=setInterval(()=>{setInteractiveDefault();if($('#sarPatchRadius')&&globalThis.OMEGA_SAR_SENTINEL){clearInterval(retry);if(currentIdentity())globalThis.OMEGA_SAR_SENTINEL.loadCalibratedCurrent({force:true}).catch(()=>{});}},80);setTimeout(()=>clearInterval(retry),5000);
  window.addEventListener('omega-calibrated-sar-patch',onPatch);window.addEventListener('omega-calibrated-sar-patch-clear',()=>{clearTimeout(deepTimer);state.deepPatch=null;state.state='INTERACTIVE';});
  mapEvent('omega-map-select',()=>{clearTimeout(deepTimer);lastDeepKey='';state.deepPatch=null;state.state='INTERACTIVE';});
  $('#assetSelect')?.addEventListener('change',()=>{lastDeepKey='';scheduleDeep(650)});$('#sarCalQuantity')?.addEventListener('change',()=>{lastDeepKey='';scheduleDeep(650)});
  state.state='INTERACTIVE';
}
function mapEvent(name,handler){document.querySelector('#map')?.addEventListener(name,handler);}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
state.promoteDeep=promoteDeep;state.scheduleDeep=scheduleDeep;
