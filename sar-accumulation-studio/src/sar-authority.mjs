const finite=v=>Number.isFinite(Number(v));
const normalizeLon=value=>{let x=Number(value);while(x>180)x-=360;while(x<-180)x+=360;return x;};
const pointKey=p=>p&&finite(p.lon)&&finite(p.lat)?`${normalizeLon(p.lon).toFixed(6)},${Number(p.lat).toFixed(6)}`:null;
const sceneKey=s=>String(s?.id||s||'').trim()||null;

function emit(detail){
  if(typeof window==='undefined')return;
  window.dispatchEvent(new CustomEvent('omega-sar-authority-change',{detail}));
}

export const sarAuthority={
  target:null,targetKey:null,targetEpoch:0,
  camera:null,cameraEpoch:0,
  scene:null,sceneKey:null,sceneEpoch:0,
  measurement:null,source:null,
  rejected:{source:0,measurement:0,context:0},
  revision:0,

  bindTarget(point,reason='target'){
    if(!point||!finite(point.lon)||!finite(point.lat))return this.capture();
    const next={lon:normalizeLon(point.lon),lat:Math.max(-90,Math.min(90,Number(point.lat)))},key=pointKey(next);
    if(key!==this.targetKey){
      this.targetEpoch++;this.target=next;this.targetKey=key;
      this.measurement=null;this.source=null;this.revision++;
      emit({kind:'TARGET',reason,...this.capture()});
    }else if(!this.target)this.target=next;
    return this.capture();
  },

  bindCamera(view,reason='camera'){
    if(!view||!finite(view.centerLon)||!finite(view.centerLat)||!finite(view.scale))return this.capture();
    const next={centerLon:normalizeLon(view.centerLon),centerLat:Number(view.centerLat),scale:Number(view.scale),bbox:Array.isArray(view.bbox)?[...view.bbox]:null};
    const prev=this.camera;
    const changed=!prev||Math.abs(prev.centerLon-next.centerLon)>1e-10||Math.abs(prev.centerLat-next.centerLat)>1e-10||Math.abs(prev.scale-next.scale)>1e-10;
    this.camera=next;
    if(changed){this.cameraEpoch++;this.revision++;emit({kind:'CAMERA',reason,...this.capture()});}
    return this.capture();
  },

  bindScene(scene,reason='scene'){
    const id=sceneKey(scene);if(!id)return this.capture();
    if(id!==this.sceneKey){this.sceneEpoch++;this.scene=typeof scene==='object'?{...scene,id}: {id};this.sceneKey=id;this.measurement=null;this.revision++;emit({kind:'SCENE',reason,...this.capture()});}
    return this.capture();
  },

  bindSource(source){
    if(!source)return false;const id=sceneKey(source.id);if(id&&this.sceneKey&&id!==this.sceneKey)return false;
    this.source={...source,targetKey:this.targetKey,targetEpoch:this.targetEpoch,sceneKey:this.sceneKey,sceneEpoch:this.sceneEpoch};this.revision++;emit({kind:'SOURCE',...this.capture()});return true;
  },

  bindMeasurement(patch){
    const key=pointKey(patch?.target),id=sceneKey(patch?.id);if(!patch||key!==this.targetKey||id!==this.sceneKey)return false;
    this.measurement={state:patch.state,id,targetKey:key,targetEpoch:this.targetEpoch,sceneEpoch:this.sceneEpoch,evidence:patch.evidence||null};this.revision++;emit({kind:'MEASUREMENT',...this.capture()});return true;
  },

  reject(kind,detail={}){
    if(kind in this.rejected)this.rejected[kind]++;
    this.revision++;emit({kind:'REJECTED_STALE_RESULT',rejectedKind:kind,...detail,...this.capture()});return false;
  },

  capture(){return {revision:this.revision,target:this.target?{...this.target}:null,targetKey:this.targetKey,targetEpoch:this.targetEpoch,camera:this.camera?{...this.camera,bbox:this.camera.bbox?[...this.camera.bbox]:null}:null,cameraEpoch:this.cameraEpoch,scene:this.scene?{...this.scene}:null,sceneKey:this.sceneKey,sceneEpoch:this.sceneEpoch,rejected:{...this.rejected}};},

  accepts(snapshot,{target=true,camera=false,scene=false}={}){
    if(!snapshot)return false;
    if(target&&(snapshot.targetEpoch!==this.targetEpoch||snapshot.targetKey!==this.targetKey))return false;
    if(camera&&snapshot.cameraEpoch!==this.cameraEpoch)return false;
    if(scene&&(snapshot.sceneEpoch!==this.sceneEpoch||snapshot.sceneKey!==this.sceneKey))return false;
    return true;
  },

  targetMatches(point){return pointKey(point)===this.targetKey;},
  sceneMatches(scene){return sceneKey(scene)===this.sceneKey;},
  pointKey,sceneKey
};

globalThis.OMEGA_SAR_AUTHORITY=sarAuthority;

if(typeof document!=='undefined'){
  const install=()=>{
    const map=document.querySelector('#map');
    map?.addEventListener('omega-map-select',event=>sarAuthority.bindTarget(event.detail,'map selection'));
    map?.addEventListener('omega-map-view',event=>sarAuthority.bindCamera(event.detail,'renderer view'));
    const scene=document.querySelector('#currentScene');
    if(scene){
      const update=()=>{const id=(scene.textContent||'').trim();if(id&&id!=='—')sarAuthority.bindScene({id,startTime:(document.querySelector('#currentTime')?.textContent||'').trim()||null},'timeline scene');};
      new MutationObserver(update).observe(scene,{childList:true,subtree:true,characterData:true});update();
    }
    // These guards run in capture phase on window before ordinary consumers. A delayed
    // source/calibration result from an older target or acquisition is therefore unable
    // to paint itself onto the currently authoritative SAR camera.
    window.addEventListener('omega-source-sar-frame',event=>{
      const frame=event.detail||{};
      if(sarAuthority.sceneKey&&sceneKey(frame.id)!==sarAuthority.sceneKey){event.stopImmediatePropagation();sarAuthority.reject('source',{reason:'SCENE_EPOCH_MISMATCH',candidateScene:sceneKey(frame.id)});return;}
      sarAuthority.bindSource(frame);
    },true);
    window.addEventListener('omega-calibrated-sar-patch',event=>{
      const patch=event.detail?.patch;
      if(!patch||!sarAuthority.targetMatches(patch.target)||!sarAuthority.sceneMatches(patch.id)){
        event.stopImmediatePropagation();sarAuthority.reject('measurement',{reason:'TARGET_OR_SCENE_EPOCH_MISMATCH',candidateTarget:pointKey(patch?.target),candidateScene:sceneKey(patch?.id)});return;
      }
      sarAuthority.bindMeasurement(patch);
    },true);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);
}
