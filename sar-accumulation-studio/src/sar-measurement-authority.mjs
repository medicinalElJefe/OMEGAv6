import { sarAuthority } from './sar-authority.mjs';

const readiness=new Map();
const key=id=>String(id||'').trim();
const now=()=>new Date().toISOString();

function setScene(id,state,detail={}){
  id=key(id);if(!id)return;readiness.set(id,{sceneId:id,state,updatedAt:now(),...detail});
  if(readiness.size>192)readiness.delete(readiness.keys().next().value);
  globalThis.OMEGA_SAR_MEASUREMENT_READINESS={current:readiness.get(sarAuthority.sceneKey)||null,scenes:readiness};
  window.dispatchEvent(new CustomEvent('omega-sar-measurement-readiness',{detail:readiness.get(id)}));
}

function currentUiScene(){return key(document.querySelector('#currentScene')?.textContent);}
function currentPoint(){return sarAuthority.target||null;}

function updateHud(){
  const dock=document.querySelector('.acquisition-card');if(!dock||document.querySelector('#omegaMeasurementState'))return;
  const el=document.createElement('div');el.id='omegaMeasurementState';el.className='mission-status';el.style.marginTop='10px';el.textContent='SAR measurement state · waiting for target/acquisition';dock.append(el);
  window.addEventListener('omega-sar-measurement-readiness',event=>{if(event.detail?.sceneId!==currentUiScene())return;const state=event.detail?.state||'UNRESOLVED';el.textContent=`SAR MEASUREMENT · ${state.replaceAll('_',' ')}${event.detail?.reason?` · ${event.detail.reason}`:''}`;el.dataset.kind=state==='EXACT_READY'?'ok':state==='EXACT_UNRESOLVED'?'error':'';});
}

function wrapSentinel(){
  const sentinel=globalThis.OMEGA_SAR_SENTINEL;if(!sentinel?.loadCalibratedCurrent||sentinel.__omegaAuthorityWrapped)return false;
  sentinel.__omegaAuthorityWrapped=true;const original=sentinel.loadCalibratedCurrent.bind(sentinel);
  sentinel.loadCalibratedCurrent=async options=>{
    const snapshot=sarAuthority.capture(),scene=snapshot.sceneKey||currentUiScene(),target=snapshot.target||currentPoint();
    if(scene)setScene(scene,'CALIBRATING',{targetKey:snapshot.targetKey});
    let patch=null;
    try{patch=await original(options||{});}catch(error){if(scene)setScene(scene,'EXACT_UNRESOLVED',{reason:error.message,targetKey:snapshot.targetKey});throw error;}
    if(!patch){if(scene&&sarAuthority.accepts(snapshot,{target:true,scene:true}))setScene(scene,'EXACT_UNRESOLVED',{reason:'No exact calibrated patch returned',targetKey:snapshot.targetKey});return null;}
    const stillCurrent=sarAuthority.accepts(snapshot,{target:true,scene:true})&&sarAuthority.targetMatches(patch.target)&&sarAuthority.sceneMatches(patch.id);
    if(!stillCurrent){sarAuthority.reject('measurement',{reason:'CALIBRATION_COMPLETED_AFTER_AUTHORITY_CHANGED',candidateScene:key(patch.id),candidateTarget:sarAuthority.pointKey(patch.target)});return null;}
    setScene(scene,'EXACT_READY',{targetKey:snapshot.targetKey,grade:patch.evidence?.grade||null,validCount:patch.stats?.validCount||0,geolocation:patch.geolocation?.quality||null});return patch;
  };
  return true;
}

function install(){
  updateHud();
  const scene=document.querySelector('#currentScene');if(scene){const mark=()=>{const id=currentUiScene();if(id&&!readiness.has(id))setScene(id,'SOURCE_ONLY',{targetKey:sarAuthority.targetKey});};new MutationObserver(mark).observe(scene,{childList:true,subtree:true,characterData:true});mark();}
  window.addEventListener('omega-source-sar-frame',event=>{const id=key(event.detail?.id);if(id&&!readiness.has(id))setScene(id,'SOURCE_ONLY',{targetKey:sarAuthority.targetKey});});
  window.addEventListener('omega-calibrated-sar-patch',event=>{const p=event.detail?.patch;if(p&&sarAuthority.targetMatches(p.target)&&sarAuthority.sceneMatches(p.id))setScene(p.id,'EXACT_READY',{targetKey:sarAuthority.targetKey,grade:p.evidence?.grade||null,validCount:p.stats?.validCount||0,geolocation:p.geolocation?.quality||null});});
  if(!wrapSentinel()){let tries=0;const timer=setInterval(()=>{if(wrapSentinel()||++tries>120)clearInterval(timer);},25);}
}

if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}

globalThis.OMEGA_SAR_MEASUREMENT_READINESS={current:null,scenes:readiness};
