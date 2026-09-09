const $=s=>document.querySelector(s);
const map=$('#map');
const state={target:null,targetKey:null,activation:0,activating:false,playing:false,playToken:0,autoFocus:true,lastPatchKey:null,lastStage:'READY'};
globalThis.OMEGA_SAR_INTERACTION=state;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
function pointFromText(){
  const m=($('#point')?.textContent||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if(!m)return null;const lat=Number(m[1]),lon=Number(m[2]);return Number.isFinite(lat)&&Number.isFinite(lon)?{lon,lat}:null;
}
function keyOf(p){return p?`${p.lon.toFixed(5)},${p.lat.toFixed(5)}`:null;}
function currentFrame(){return Number($('#timeline')?.value)||0;}
function frameCount(){return Math.max(0,(Number($('#timeline')?.max)||-1)+1);}
function obsCount(){return Number(($('#obsCount')?.textContent||'0').replace(/[^0-9]/g,''))||0;}
function statusKind(){return $('#status')?.dataset.kind||'';}
function statusText(){return ($('#status')?.textContent||'').trim();}

function inject(){
  const wrap=map?.closest('.map-wrap');if(!wrap||$('#omegaActionHud'))return;
  const style=document.createElement('style');style.textContent=`
  .omega-action-hud{position:absolute;z-index:8;left:16px;bottom:16px;max-width:min(520px,62%);display:flex;align-items:center;gap:12px;padding:10px 13px;border-radius:13px;background:rgba(5,7,9,.82);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.15);box-shadow:0 18px 48px rgba(0,0,0,.34);color:#f4f5f6;font-family:Inter,Segoe UI,sans-serif;pointer-events:none}.omega-action-pulse{width:8px;height:8px;border-radius:50%;background:#d5dade;box-shadow:0 0 0 0 rgba(255,255,255,.35)}.omega-action-hud[data-busy=true] .omega-action-pulse{animation:omegaPulse 1.15s infinite}.omega-action-hud b{display:block;font-size:11px;line-height:1.25}.omega-action-hud span{display:block;margin-top:2px;font-size:9px;color:#a8afb4;line-height:1.35}.omega-action-hud em{font-style:normal;font-size:9px;color:#d4d8da;margin-left:auto;white-space:nowrap}@keyframes omegaPulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.35)}70%{box-shadow:0 0 0 8px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}
  @media(max-width:780px){.omega-action-hud{left:10px;right:10px;bottom:10px;max-width:none}.omega-action-hud em{display:none}}
  `;document.head.append(style);
  const hud=document.createElement('div');hud.id='omegaActionHud';hud.className='omega-action-hud';hud.innerHTML='<i class="omega-action-pulse"></i><div><b>Choose a location on Earth</b><span>OMEGA will bind live Sentinel-1 evidence to the selected point.</span></div><em>READY</em>';wrap.append(hud);
}

function setHud(title,detail='',phase='READY',busy=false){
  const hud=$('#omegaActionHud');if(!hud)return;hud.dataset.busy=busy?'true':'false';hud.querySelector('b').textContent=title;hud.querySelector('span').textContent=detail;hud.querySelector('em').textContent=phase;
}

function ensureLiveSource(){
  const source=$('#sourceMode');if(source&&source.value!=='stac'){source.value='stac';source.dispatchEvent(new Event('change',{bubbles:true}));}
  const max=$('#maxResults');if(max&&Number(max.value)<18)max.value='24';
}

function bindTargetInputs(point){
  const lat=$('#jumpLat'),lon=$('#jumpLon'),aoi=$('#aoi');if(lat)lat.value=point.lat.toFixed(6);if(lon)lon.value=point.lon.toFixed(6);if(aoi)aoi.value=`POINT(${point.lon.toFixed(6)} ${point.lat.toFixed(6)})`;
}

async function focusTarget(point,{deep=false}={}){
  bindTargetInputs(point);
  $('#jumpLocation')?.click();
  await sleep(30);
  const steps=deep?18:10;
  for(let i=0;i<steps;i++)map?.dispatchEvent(new WheelEvent('wheel',{deltaY:-120,clientX:map.getBoundingClientRect().left+map.clientWidth/2,clientY:map.getBoundingClientRect().top+map.clientHeight/2,bubbles:true,cancelable:true}));
  await sleep(160);
}

async function waitFor(fn,{timeout=30000,interval=80}={}){
  const start=performance.now();let lastError=null;
  while(performance.now()-start<timeout){try{const value=fn();if(value)return value;}catch(error){lastError=error;}await sleep(interval);}
  if(lastError)throw lastError;throw new Error('Timed out waiting for live SAR state');
}

async function loadCatalog(point,token){
  ensureLiveSource();bindTargetInputs(point);
  setHud('Searching live Sentinel-1 acquisitions',`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)} · Earth Search STAC`,'CATALOG',true);
  $('#load')?.click();
  await waitFor(()=>statusKind()==='ok'||statusKind()==='error',{timeout:45000});
  if(token!==state.activation)return false;
  if(statusKind()==='error')throw new Error(statusText()||'Sentinel-1 catalog query failed');
  if(obsCount()>0)return true;
  const end=$('#end')?.value||new Date().toISOString().slice(0,10),endMs=new Date(`${end}T12:00:00Z`).getTime();
  const start=$('#start');if(start){start.value=new Date(endMs-180*86400000).toISOString().slice(0,10);setHud('Expanding SAR history window','No recent scene at this target · searching 180 days','HISTORY',true);$('#load')?.click();await waitFor(()=>statusKind()==='ok'||statusKind()==='error',{timeout:45000});}
  if(statusKind()==='error')throw new Error(statusText()||'Expanded Sentinel-1 query failed');
  return obsCount()>0;
}

async function ensureSentinel(){return waitFor(()=>globalThis.OMEGA_SAR_SENTINEL?.loadCalibratedCurrent&&globalThis.OMEGA_SAR_SENTINEL,{timeout:15000});}

async function loadFrameEvidence({force=true,focus=false,token=null}={}){
  const sentinel=await ensureSentinel();
  const scene=($('#currentScene')?.textContent||'').trim();
  const time=($('#currentTime')?.textContent||'').trim();
  setHud('Calibrating SAR measurement',`${scene||'current acquisition'} · ${time||''}`,'CALIBRATE',true);
  const patch=await sentinel.loadCalibratedCurrent({force});
  if(token!=null&&token!==state.playToken&&token!==state.activation)return null;
  if(!patch)throw new Error(($('#rasterEmpty')?.textContent||'Calibrated SAR patch did not resolve').trim());
  const patchKey=`${patch.id}|${patch.startTime}|${patch.target?.lon},${patch.target?.lat}`;
  if(focus&&state.autoFocus&&patch.geoMesh?.validNodeCount>=4){
    const points=patch.geoMesh.nodes.flat().filter(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat));
    if(points.length){
      const minLon=Math.min(...points.map(q=>q.lon)),maxLon=Math.max(...points.map(q=>q.lon)),minLat=Math.min(...points.map(q=>q.lat)),maxLat=Math.max(...points.map(q=>q.lat));
      bindTargetInputs(patch.target);
      $('#jumpLocation')?.click();await sleep(20);
      for(let i=0;i<18;i++)map?.dispatchEvent(new WheelEvent('wheel',{deltaY:-120,bubbles:true,cancelable:true}));
      await sleep(180);
    }
  }
  state.lastPatchKey=patchKey;
  setHud('Live calibrated SAR is on Earth',`${patch.polarization} ${patch.quantity} · ${patch.startTime} · ${patch.geoMesh?.validNodeCount||0} georegistration nodes`,'MEASURED',false);
  return patch;
}

async function activateTarget(point,{reason='Earth selection'}={}){
  if(!point||!Number.isFinite(point.lon)||!Number.isFinite(point.lat))return;
  const key=keyOf(point);if(state.activating&&key===state.targetKey)return;
  const token=++state.activation;state.activating=true;state.target={...point};state.targetKey=key;state.playing=false;state.playToken++;
  try{
    setHud('Targeting Earth location',`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)} · ${reason}`,'TARGET',true);
    await focusTarget(point,{deep:false});if(token!==state.activation)return;
    const found=await loadCatalog(point,token);if(token!==state.activation)return;
    if(!found){setHud('No Sentinel-1 acquisition resolved','The selected location remains active; widen the date range or switch evidence source.','NO SCENE',false);return;}
    setHud(`${obsCount()} Sentinel-1 acquisitions found`,'Binding the newest real acquisition to the selected Earth point.','SCENES',true);
    await loadFrameEvidence({force:true,focus:true,token});if(token!==state.activation)return;
    setHud('Location is live',`${obsCount()} acquisitions · calibrated SAR bound · press Play to animate measured frames`,'READY',false);
  }catch(error){if(token===state.activation)setHud('SAR target did not fully resolve',error.message,'ERROR',false);}
  finally{if(token===state.activation)state.activating=false;}
}

function frameDelay(){
  const mode=$('#playbackMode')?.value||'event';
  if(mode==='temporal'){
    const warp=Math.max(1,Number($('#timeWarp')?.value)||3600),i=currentFrame(),n=frameCount();if(n>1){
      const current=new Date($('#currentTime')?.textContent||'').getTime();
      const nextIndex=(i+1)%n;const timeline=$('#timeline');const prev=timeline.value;timeline.value=String(nextIndex);timeline.dispatchEvent(new Event('input',{bubbles:true}));const next=new Date($('#currentTime')?.textContent||'').getTime();timeline.value=prev;timeline.dispatchEvent(new Event('input',{bubbles:true}));
      if(Number.isFinite(current)&&Number.isFinite(next)&&next>current)return clamp((next-current)/warp,550,2800);
    }
  }
  const speed=Number($('#speed')?.value)||550;return clamp(1500-speed,450,1500);
}

async function playLoop(token){
  const n=frameCount();if(n<1)return;
  while(state.playing&&token===state.playToken){
    const current=currentFrame(),next=(current+1)%n,timeline=$('#timeline');
    timeline.value=String(next);timeline.dispatchEvent(new Event('input',{bubbles:true}));
    setHud(`Playing measured SAR ${next+1} / ${n}`,`${($('#currentTime')?.textContent||'').trim()} · loading calibrated frame`,'PLAY',true);
    try{await loadFrameEvidence({force:false,focus:false,token});}catch(error){setHud(`Frame ${next+1} / ${n} unresolved`,error.message,'SKIP',true);}
    if(!state.playing||token!==state.playToken)break;
    await sleep(frameDelay());
  }
}

async function startPlayback(){
  if(state.playing)return stopPlayback();
  let point=pointFromText();if(!point){setHud('Choose a location first','Click the Earth or search for a place; playback is evidence-bound to a target.','WAIT',false);return;}
  if(obsCount()<1){await activateTarget(point,{reason:'Play request'});if(obsCount()<1)return;}
  state.playing=true;const token=++state.playToken;const button=$('#play');if(button)button.textContent='Pause';
  setHud('Starting measured SAR playback',`${obsCount()} acquisition(s) at ${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`,'PLAY',true);
  try{await loadFrameEvidence({force:false,focus:state.lastPatchKey==null,token});if(state.playing&&token===state.playToken)await sleep(350);await playLoop(token);}catch(error){setHud('Playback stopped',error.message,'ERROR',false);stopPlayback();}
}
function stopPlayback(){state.playing=false;state.playToken++;const button=$('#play');if(button)button.textContent='Play';setHud('Playback paused',`${currentFrame()+1} / ${frameCount()} · ${($('#currentTime')?.textContent||'').trim()}`,'PAUSED',false);}

function wire(){
  inject();
  const point=$('#point');if(point){let last=keyOf(pointFromText());new MutationObserver(()=>{const p=pointFromText(),key=keyOf(p);if(!p||key===last)return;last=key;activateTarget(p,{reason:'selected Earth location'});}).observe(point,{childList:true,subtree:true,characterData:true});}
  $('#play')?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();startPlayback();},true);
  $('#prev')?.addEventListener('click',()=>setTimeout(()=>loadFrameEvidence({force:false,focus:false}).catch(error=>setHud('Previous frame unresolved',error.message,'ERROR',false)),0));
  $('#next')?.addEventListener('click',()=>setTimeout(()=>loadFrameEvidence({force:false,focus:false}).catch(error=>setHud('Next frame unresolved',error.message,'ERROR',false)),0));
  $('#timeline')?.addEventListener('change',()=>loadFrameEvidence({force:false,focus:false}).catch(error=>setHud('Selected frame unresolved',error.message,'ERROR',false)));
  const rasterEmpty=$('#rasterEmpty');if(rasterEmpty)new MutationObserver(()=>{if(state.activating||state.playing){const text=(rasterEmpty.textContent||'').trim();if(text)setHud(state.playing?'Playing measured SAR':'Building selected SAR location',text,state.playing?'PLAY':'CALIBRATE',true);}}).observe(rasterEmpty,{childList:true,subtree:true,characterData:true});
  map?.addEventListener('omega-map-select',event=>{const p=event.detail;if(p&&Number.isFinite(p.lon)&&Number.isFinite(p.lat)){bindTargetInputs(p);}});
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else queueMicrotask(wire);
}
