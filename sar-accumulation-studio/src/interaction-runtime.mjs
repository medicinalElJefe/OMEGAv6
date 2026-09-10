const $=s=>document.querySelector(s);
const map=$('#map');
const state={target:null,targetKey:null,activation:0,activating:false,playing:false,playToken:0,lastPatchKey:null,lastExactFrame:null,lastExactScene:null,lastExactTargetKey:null,patchSequence:0,sourceSequence:0,lastSourceScene:null,lastSourceTime:null,calibrationBusy:false,settlingExact:false,lastStage:'READY'};
globalThis.OMEGA_SAR_INTERACTION=state;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
function pointFromText(){const m=($('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(!m)return null;const lat=Number(m[1]),lon=Number(m[2]);return Number.isFinite(lat)&&Number.isFinite(lon)?{lon,lat}:null;}
function keyOf(p){return p?`${Number(p.lon).toFixed(6)},${Number(p.lat).toFixed(6)}`:null;}
function currentFrame(){return Number($('#timeline')?.value)||0;}
function frameCount(){const max=Number($('#timeline')?.max);return Number.isFinite(max)&&max>=0?Math.floor(max)+1:0;}
function obsCount(){return Number(($('#obsCount')?.textContent||'0').replace(/[^0-9]/g,''))||0;}
function statusKind(){return $('#status')?.dataset.kind||'';}
function statusText(){return ($('#status')?.textContent||'').trim();}
function currentScene(){return ($('#currentScene')?.textContent||'').trim();}
function sourceFrame(){return globalThis.OMEGA_SAR_SOURCE_FRAME||null;}
function inject(){
  const wrap=map?.closest('.map-wrap');if(!wrap||$('#omegaActionHud'))return;
  const style=document.createElement('style');style.textContent=`.omega-action-hud{position:absolute;z-index:9;left:16px;bottom:16px;max-width:min(640px,72%);display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:14px;background:rgba(5,7,9,.88);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.17);box-shadow:0 18px 52px rgba(0,0,0,.38);color:#f4f5f6;font-family:Inter,Segoe UI,sans-serif;pointer-events:none}.omega-action-pulse{width:8px;height:8px;border-radius:50%;background:#e4e8ea}.omega-action-hud[data-busy=true] .omega-action-pulse{animation:omegaPulse 1.15s infinite}.omega-action-hud b{display:block;font-size:12px}.omega-action-hud span{display:block;margin-top:2px;font-size:9px;color:#afb4b8;line-height:1.42}.omega-action-hud em{font-style:normal;font-size:9px;color:#d8dcde;margin-left:auto;white-space:nowrap}@keyframes omegaPulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.35)}70%{box-shadow:0 0 0 8px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}@media(max-width:780px){.omega-action-hud{left:10px;right:10px;bottom:10px;max-width:none}.omega-action-hud em{display:none}}`;document.head.append(style);
  const hud=document.createElement('div');hud.id='omegaActionHud';hud.className='omega-action-hud';hud.innerHTML='<i class="omega-action-pulse"></i><div><b>Choose a SAR target</b><span>One WGS84 target drives camera, acquisition search, source imagery, calibration and OMEGA field.</span></div><em>READY</em>';wrap.append(hud);
}
function setHud(title,detail='',phase='READY',busy=false){state.lastStage=phase;const hud=$('#omegaActionHud');if(!hud)return;hud.dataset.busy=busy?'true':'false';hud.dataset.phase=phase;hud.querySelector('b').textContent=title;hud.querySelector('span').textContent=detail;hud.querySelector('em').textContent=phase;}
function ensureLiveSource(){const source=$('#sourceMode');if(source&&source.value!=='stac'){source.value='stac';source.dispatchEvent(new Event('change',{bubbles:true}));}const max=$('#maxResults');if(max&&Number(max.value)<18)max.value='24';}
function bindTargetInputs(point){const lat=$('#jumpLat'),lon=$('#jumpLon'),aoi=$('#aoi');if(lat)lat.value=point.lat.toFixed(6);if(lon)lon.value=point.lon.toFixed(6);if(aoi)aoi.value=`POINT(${point.lon.toFixed(6)} ${point.lat.toFixed(6)})`;}
function setSentinelAutoPatch(enabled){const box=$('#sarAutoPatch');if(!box)return;if(box.checked!==enabled){box.checked=enabled;box.dispatchEvent(new Event('change',{bubbles:true}));}}
async function waitFor(fn,{timeout=30000,interval=80}={}){const start=performance.now();let lastError=null;while(performance.now()-start<timeout){try{const value=fn();if(value)return value;}catch(error){lastError=error;}await sleep(interval);}if(lastError)throw lastError;throw new Error('Timed out waiting for live SAR state');}
function clearOldMeasurement(){globalThis.OMEGA_SAR_RENDERER?.clearSarOverlay?.();window.dispatchEvent(new CustomEvent('omega-calibrated-sar-patch-clear',{detail:{reason:'TARGET_OR_FRAME_CHANGED'}}));}
function selectTimelineFrame(index){const timeline=$('#timeline'),n=frameCount();if(!timeline||!n)return false;const next=Math.max(0,Math.min(n-1,Math.trunc(index)));if(next===currentFrame())return true;clearOldMeasurement();timeline.value=String(next);timeline.dispatchEvent(new Event('input',{bubbles:true}));return true;}
async function loadCatalog(point,token){
  ensureLiveSource();bindTargetInputs(point);setHud('Searching Sentinel-1 at the selected target',`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)} · Earth Search STAC`,'CATALOG',true);$('#load')?.click();
  await waitFor(()=>statusKind()==='ok'||statusKind()==='error',{timeout:45000});if(token!==state.activation)return false;if(statusKind()==='error')throw new Error(statusText()||'Sentinel-1 catalog query failed');if(obsCount()>0)return true;
  const end=$('#end')?.value||new Date().toISOString().slice(0,10),endMs=new Date(`${end}T12:00:00Z`).getTime(),start=$('#start');
  if(start){start.value=new Date(endMs-365*86400000).toISOString().slice(0,10);setHud('Expanding SAR history','No recent scene at this target · searching one year','HISTORY',true);$('#load')?.click();await waitFor(()=>statusKind()==='ok'||statusKind()==='error',{timeout:45000});}
  if(statusKind()==='error')throw new Error(statusText()||'Expanded Sentinel-1 query failed');return obsCount()>0;
}
async function waitForSourceFrame({after=0,scene=null,timeout=15000}={}){return waitFor(()=>{const frame=sourceFrame(),canvas=document.querySelector('.sar-source-browse-canvas'),visible=canvas?.dataset.ready==='true'&&canvas.width>1&&canvas.height>1,sceneOk=!scene||state.lastSourceScene===scene;return state.sourceSequence>after&&sceneOk&&visible&&frame?.src?{scene:state.lastSourceScene,sequence:state.sourceSequence,src:frame.src,registration:frame.registration}:null;},{timeout,interval:70});}
async function ensureSentinel(){return waitFor(()=>globalThis.OMEGA_SAR_SENTINEL?.loadCalibratedCurrent&&globalThis.OMEGA_SAR_SENTINEL,{timeout:15000});}
async function loadExactCurrent({force=false,announce=true}={}){
  const scene=currentScene(),sentinel=await ensureSentinel();
  try{
    const patch=await sentinel.loadCalibratedCurrent({force});if(!patch)return null;
    if(patch.id!==currentScene())return null;
    state.lastPatchKey=`${patch.id}|${patch.startTime}|${patch.target?.lon},${patch.target?.lat}`;state.lastExactFrame=currentFrame();state.lastExactScene=patch.id;state.lastExactTargetKey=state.targetKey;state.patchSequence++;
    if(announce)setHud('Exact measured SAR is ready',`${patch.polarization} ${patch.quantity} · ${patch.startTime} · source geolocation mesh · FIT SAR for measurement-scale view`,'CALIBRATED',false);
    return patch;
  }catch(error){if(currentScene()===scene&&!state.playing&&announce)setHud('Source SAR live · exact measured patch unresolved',error.message,'SOURCE SAR',false);return null;}
}
async function exactCalibration({force=false}={}){
  if(state.calibrationBusy)return null;state.calibrationBusy=true;
  try{return await loadExactCurrent({force,announce:true});}finally{state.calibrationBusy=false;}
}
function startCalibrationBackground(options={}){exactCalibration(options).catch(()=>{});}
function exactCandidateOrder(original,n){
  const out=[];if(state.lastExactTargetKey===state.targetKey&&Number.isInteger(state.lastExactFrame)&&state.lastExactFrame>=0&&state.lastExactFrame<n)out.push(state.lastExactFrame);out.push(original);
  for(let d=1;d<n;d++){if(original-d>=0)out.push(original-d);if(original+d<n)out.push(original+d);}
  return [...new Set(out)];
}
async function settleExactMeasurement({maxScenes=24}={}){
  if(state.calibrationBusy||state.settlingExact||state.playing)return null;
  const n=frameCount();if(!n)return null;
  state.calibrationBusy=true;state.settlingExact=true;
  const original=currentFrame(),targetKey=state.targetKey,order=exactCandidateOrder(original,n).slice(0,Math.max(1,Math.min(n,Number(maxScenes)||24)));
  let tried=0;
  try{
    for(const index of order){
      if(state.playing||state.targetKey!==targetKey)return null;
      selectTimelineFrame(index);await sleep(60);const scene=currentScene();if(!scene||scene==='—')continue;
      tried++;setHud('Resolving exact measured SAR',`${tried}/${order.length} · ${scene} · target remains ${targetKey}`,'CALIBRATING',true);
      const patch=await loadExactCurrent({force:false,announce:false});
      if(patch&&patch.id===scene&&patch.evidence?.measured===true&&patch.evidence?.inferred!==true){
        setHud('Exact measured SAR selected',`${patch.polarization} ${patch.quantity} · ${patch.startTime} · scene ${patch.id} · no source substitution`,'CALIBRATED',false);
        globalThis.OMEGA_SAR_EXACT_SETTLEMENT={state:'EXACT_MEASURED_FRAME_SELECTED',targetKey,frame:index,scene:patch.id,tried,at:new Date().toISOString()};
        return patch;
      }
    }
    if(currentFrame()!==original){selectTimelineFrame(original);await sleep(50);}
    globalThis.OMEGA_SAR_EXACT_SETTLEMENT={state:'EXACT_UNRESOLVED_ACROSS_LOADED_STACK',targetKey,frame:original,scene:currentScene(),tried,at:new Date().toISOString()};
    setHud('Source SAR remains authoritative',`No exact calibrated patch resolved across ${tried} loaded acquisition(s); unresolved state is preserved explicitly.`,'SOURCE ONLY',false);return null;
  }finally{state.settlingExact=false;state.calibrationBusy=false;}
}
async function activateTarget(point,{reason='target change'}={}){
  if(!point||!Number.isFinite(point.lon)||!Number.isFinite(point.lat))return;const k=keyOf(point);if(state.activating&&k===state.targetKey)return;
  const token=++state.activation;state.activating=true;state.target={lon:Number(point.lon),lat:Number(point.lat)};state.targetKey=k;state.lastExactFrame=null;state.lastExactScene=null;state.lastExactTargetKey=null;stopPlayback({quiet:true});clearOldMeasurement();setSentinelAutoPatch(false);bindTargetInputs(state.target);
  try{
    setHud('Binding SAR target',`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)} · ${reason}`,'TARGET',true);
    const found=await loadCatalog(point,token);if(token!==state.activation)return;if(!found){setHud('No Sentinel-1 acquisition resolved','Target remains exact; no matching scene was found in the expanded history.','NO SCENE',false);return;}
    const scene=currentScene(),before=state.sourceSequence;setHud(`${obsCount()} Sentinel-1 acquisitions found`,'Putting real source SAR on the current authoritative camera.','SOURCE SAR',true);try{await waitForSourceFrame({after:before,scene,timeout:18000});}catch{}if(token!==state.activation)return;
    setHud('SAR target is live',`${obsCount()} acquisitions · source SAR visible · exact calibrated patch computing without moving the camera`,'SOURCE SAR',false);startCalibrationBackground({force:true});
  }catch(error){if(token===state.activation)setHud('SAR target did not resolve',error.message,'ERROR',false);}finally{if(token===state.activation){state.activating=false;setSentinelAutoPatch(false);}}
}
function frameDelay(){const speed=Number($('#speed')?.value)||550;return clamp(1650-speed,650,1650);}
async function playLoop(token){while(state.playing&&token===state.playToken){const n=frameCount();if(n<2)break;const next=(currentFrame()+1)%n,timeline=$('#timeline'),before=state.sourceSequence;clearOldMeasurement();timeline.value=String(next);timeline.dispatchEvent(new Event('input',{bubbles:true}));const scene=currentScene();setHud(`Playing SAR ${next+1} / ${n}`,`${($('#currentTime')?.textContent||'').trim()} · changing actual Sentinel-1 source scene`,'PLAY',true);try{await waitForSourceFrame({after:before,scene,timeout:12000});setHud(`Playing SAR ${next+1} / ${n}`,`${scene} · source scene visible on the same camera`,'PLAY',false);}catch(error){setHud(`Frame ${next+1} / ${n} delayed`,error.message,'PLAY',true);}if(!state.playing||token!==state.playToken)break;await sleep(frameDelay());}}
async function startPlayback(){if(state.playing){stopPlayback();return;}if(state.activating)await waitFor(()=>!state.activating,{timeout:70000});const point=pointFromText();if(!point){setHud('Choose a SAR target first','Click the Earth, LOCATE, or search.','WAIT',false);return;}if(obsCount()<1){await activateTarget(point,{reason:'Play request'});if(obsCount()<1)return;}setSentinelAutoPatch(false);state.playing=true;const token=++state.playToken,button=$('#play');if(button)button.textContent='Pause';setHud('Starting SAR playback',`${obsCount()} acquisition(s) · source frames are synchronized to this target and camera`,'PLAY',true);await playLoop(token);}
function stopPlayback({quiet=false}={}){const was=state.playing;state.playing=false;state.playToken++;const button=$('#play');if(button)button.textContent='Play';if(was&&!quiet){setHud('Playback paused',`${currentFrame()+1} / ${frameCount()} · selecting an exact measured frame if the paused source frame is not calibratable`,'PAUSED',true);queueMicrotask(()=>settleExactMeasurement({maxScenes:24}).catch(error=>setHud('Exact SAR settlement failed',error.message,'ERROR',false)));}}
function wire(){
  inject();window.addEventListener('omega-source-sar-frame',event=>{state.sourceSequence++;state.lastSourceScene=event.detail?.id||null;state.lastSourceTime=event.detail?.startTime||null;});
  const point=$('#point');if(point){let last=keyOf(pointFromText());new MutationObserver(()=>{const p=pointFromText(),k=keyOf(p);if(!p||k===last)return;last=k;activateTarget(p,{reason:'authoritative WGS84 target change'});}).observe(point,{childList:true,subtree:true,characterData:true});}
  $('#play')?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();startPlayback();},true);$('#prev')?.addEventListener('click',()=>setTimeout(()=>{if(!state.playing){clearOldMeasurement();startCalibrationBackground({force:false});}},80));$('#next')?.addEventListener('click',()=>setTimeout(()=>{if(!state.playing){clearOldMeasurement();startCalibrationBackground({force:false});}},80));$('#timeline')?.addEventListener('change',()=>{if(!state.playing){clearOldMeasurement();startCalibrationBackground({force:false});}});
  map?.addEventListener('omega-map-select',event=>{const p=event.detail;if(p&&Number.isFinite(p.lon)&&Number.isFinite(p.lat))activateTarget({lon:Number(p.lon),lat:Number(p.lat)},{reason:'authoritative WGS84 target change'});});
}
state.activateTarget=activateTarget;state.exactCalibration=exactCalibration;state.settleExactMeasurement=settleExactMeasurement;
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else queueMicrotask(wire);}
