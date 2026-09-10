const $=s=>document.querySelector(s);
const map=$('#map');
const REGIONAL_SCALE=420;
const REGIONAL_MIN=260;
const REGIONAL_MAX=720;
const STORAGE_KEY='omega-sar-last-target-v1';
const state={state:'INITIALIZING',intent:'sar',surface:'WORLD',target:null,restored:false,regionalScale:REGIONAL_SCALE,transitioning:false};
globalThis.OMEGA_SAR_PRIMARY_WORKSTATION=state;

function nav(){return globalThis.OMEGA_SAR_NAVIGATION||null;}
function renderer(){return globalThis.OMEGA_SAR_RENDERER||nav()?.renderer?.()||null;}
function validTarget(p){return p&&Number.isFinite(Number(p.lon))&&Number.isFinite(Number(p.lat));}
function saveTarget(p){if(!validTarget(p))return;state.target={lon:Number(p.lon),lat:Number(p.lat)};try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state.target));}catch{}}
function savedTarget(){try{const p=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return validTarget(p)?{lon:Number(p.lon),lat:Number(p.lat)}:null;}catch{return null;}}
function currentExact(){const p=renderer()?.sarOverlay?.patch;return p?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&p?.evidence?.measured===true?p:null;}
function currentRegional(){const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;return r?.state==='READY'&&r?.patch?.state==='CALIBRATED_SENTINEL1_REGIONAL_VIEWPORT'&&r?.patch?.evidence?.measured===true?r:null;}
function surface(){
  const exact=currentExact(),regional=currentRegional(),scale=Number(renderer()?.view?.scale)||1;
  if(exact&&scale>900)return 'EXACT_MEASURED';
  if(regional&&regional.visible!==false&&scale>=REGIONAL_MIN&&scale<=900)return 'REGIONAL_MEASURED';
  if(state.target&&scale>4)return 'SAR_LOADING';
  return 'WORLD';
}
function setSurface(){
  state.surface=surface();document.body.dataset.sarSurface=state.surface.toLowerCase();
  const label=$('#omegaSarPrimaryState'),sar=$('#omegaSarFocus'),worldButton=$('#omegaSarWorld'),fit=$('#omegaSarFit');
  if(label){
    const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;
    label.textContent=state.surface==='EXACT_MEASURED'?'EXACT SAR · MEASURED':state.surface==='REGIONAL_MEASURED'?'REGIONAL SAR · MEASURED':state.surface==='SAR_LOADING'?(r?.state==='LOADING'?`SAR · ${String(r.stage||'LOADING').replaceAll('_',' ')}`:'SAR · LOADING SOURCE DATA'):'WORLD · SELECT TARGET';
    label.dataset.kind=state.surface.includes('MEASURED')?'measured':state.surface==='SAR_LOADING'?'loading':'world';
  }
  if(sar)sar.setAttribute('aria-pressed',state.intent==='sar'?'true':'false');
  if(worldButton)worldButton.setAttribute('aria-pressed',state.intent==='world'?'true':'false');
  if(fit)fit.disabled=!currentExact();
}
function applyRegionalFocus(point=state.target,{reload=true}={}){
  const r=renderer();if(!r||!validTarget(point)||state.transitioning)return false;
  state.transitioning=true;state.intent='sar';saveTarget(point);
  r.fitLocation(Number(point.lon),Number(point.lat),REGIONAL_SCALE);
  setSurface();
  setTimeout(()=>{state.transitioning=false;if(reload)globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.reload?.();setSurface();},90);
  return true;
}
function focusSar(){
  // SAR always returns to the calibrated regional camera. Exact local pixels have a
  // separate explicit FIT control so a user can never lose the navigable SAR view
  // merely because an exact patch finished loading in the background.
  return applyRegionalFocus(nav()?.target||state.target);
}
function world(){state.intent='world';nav()?.world?.();setSurface();return true;}
function evidence(){const b=$('#omegaQuickRail [data-drawer="evidence"]');if(b)b.click();else window.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true}));}

function installStyle(){
  if($('#omegaSarPrimaryWorkstationStyle'))return;
  const style=document.createElement('style');style.id='omegaSarPrimaryWorkstationStyle';style.textContent=`
  body.omega-experience .earth-stage{display:grid!important;grid-template-rows:40px minmax(0,1fr)!important;height:100%!important;min-height:0!important;overflow:hidden!important}
  body.omega-experience .place-dock{grid-row:1!important;position:relative!important;z-index:60!important;top:auto!important;left:auto!important;right:auto!important;width:100%!important;height:36px!important;margin:0 0 4px!important;padding:3px 5px!important;transform:none!important;display:flex!important;align-items:center!important;gap:5px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:9px!important;background:rgba(7,10,12,.94)!important;box-shadow:none!important;overflow:visible!important;pointer-events:auto!important}
  body.omega-experience .place-dock-head,body.omega-experience .place-dock-grid{display:none!important}
  body.omega-experience .place-dock .place-search{position:relative!important;top:auto!important;left:auto!important;right:auto!important;transform:none!important;width:min(360px,31vw)!important;min-width:210px!important;z-index:62!important;pointer-events:auto!important}
  body.omega-experience .place-dock .place-search input{height:28px!important;font-size:9px!important;padding:4px 8px!important;background:#0b1012!important;border-color:rgba(255,255,255,.12)!important;box-shadow:none!important}
  body.omega-experience .place-dock .place-search button{height:28px!important;min-width:42px!important;padding:0 8px!important;font-size:8px!important}
  body.omega-experience .place-dock .place-search-results{top:31px!important;max-height:min(320px,46vh)!important}
  body.omega-experience .map-wrap{grid-row:2!important;height:100%!important;min-height:0!important;margin:0!important}
  .omega-sar-primary-controls{margin-left:auto;display:flex;align-items:center;gap:4px;min-width:0}.omega-sar-primary-state{max-width:230px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px;font:750 7px Inter,Segoe UI,sans-serif;letter-spacing:.07em;color:#829197}.omega-sar-primary-state[data-kind=measured]{color:#edf9fb}.omega-sar-primary-state[data-kind=loading]{color:#c8d8dd}.omega-sar-primary-controls button{height:28px;min-width:46px;padding:0 9px;border:1px solid rgba(255,255,255,.10);border-radius:7px;background:rgba(255,255,255,.035);color:#a9b7bb;font:750 7px Inter,Segoe UI,sans-serif;letter-spacing:.06em;cursor:pointer}.omega-sar-primary-controls button:hover,.omega-sar-primary-controls button[aria-pressed=true]{background:rgba(229,246,250,.11);color:#f1fafb;border-color:rgba(224,246,250,.20)}.omega-sar-primary-controls button:disabled{opacity:.28;cursor:not-allowed}
  body[data-sar-surface=regional_measured] .omega-global-sar-fabric canvas,body[data-sar-surface=exact_measured] .omega-global-sar-fabric canvas{opacity:.015!important;filter:none!important}
  body[data-sar-surface=regional_measured] .omega-woven-motion canvas,body[data-sar-surface=exact_measured] .omega-woven-motion canvas{opacity:.025!important}
  body[data-sar-surface=regional_measured] .omega-jrc-water-layer canvas,body[data-sar-surface=exact_measured] .omega-jrc-water-layer canvas{opacity:.05!important}
  body[data-sar-surface=regional_measured] .sar-source-browse-canvas,body[data-sar-surface=exact_measured] .sar-source-browse-canvas{opacity:.02!important}
  body[data-sar-surface=regional_measured] .omega-regional-sar-layer canvas{opacity:1!important;filter:contrast(1.22) brightness(1.04)!important}
  body[data-sar-surface=regional_measured] #omegaExperienceStatus,body[data-sar-surface=exact_measured] #omegaExperienceStatus{opacity:.28!important}
  body.omega-experience .omega-map-nav{top:12px!important;right:10px!important;gap:4px!important}.omega-experience .omega-map-nav button{width:34px!important;height:31px!important;border-radius:8px!important;font-size:12px!important}.omega-experience .omega-map-nav button.small{font-size:7px!important}.omega-experience .omega-map-nav-readout,.omega-experience .omega-map-nav-hint{display:none!important}
  @media(max-width:900px){.omega-sar-primary-state{display:none}.omega-sar-primary-controls button{min-width:40px;padding:0 6px}.omega-sar-primary-controls button:nth-last-child(1){display:none}body.omega-experience .place-dock .place-search{width:min(330px,43vw)!important}}
  @media(max-width:640px){body.omega-experience .earth-stage{grid-template-rows:38px minmax(0,1fr)!important}body.omega-experience .place-dock{height:34px!important;padding:3px!important}.omega-sar-primary-controls button{min-width:34px;font-size:6.5px;padding:0 5px}.omega-sar-primary-controls #omegaSarEvidence{display:none!important}body.omega-experience .place-dock .place-search{min-width:0!important;width:55vw!important}}
  `;document.head.append(style);
}
function installControls(){
  const dock=$('#placeDock');if(!dock||$('#omegaSarPrimaryControls'))return false;
  const controls=document.createElement('div');controls.id='omegaSarPrimaryControls';controls.className='omega-sar-primary-controls';controls.innerHTML='<span id="omegaSarPrimaryState" class="omega-sar-primary-state">WORLD · SELECT TARGET</span><button id="omegaSarFocus" type="button" aria-pressed="true" title="Center selected target on calibrated regional SAR">SAR</button><button id="omegaSarWorld" type="button" title="Whole-Earth navigation view">WORLD</button><button id="omegaSarFit" type="button" disabled title="Fit exact calibrated target pixels">FIT</button><button id="omegaSarEvidence" type="button" title="Open source measurement evidence">DATA</button>';
  dock.append(controls);$('#omegaSarFocus').onclick=focusSar;$('#omegaSarWorld').onclick=world;$('#omegaSarFit').onclick=()=>{state.intent='sar';globalThis.OMEGA_SAR_PATCH_FOCUS?.focusPatch?.();setSurface();};$('#omegaSarEvidence').onclick=evidence;return true;
}
function patchNavigation(){
  const n=nav();if(!n?.selectTarget||n.__omegaR255Primary)return false;n.__omegaR255Primary=true;
  const original=n.selectTarget.bind(n);
  n.selectTarget=async(point,options={})=>{
    const ok=await original(point,{...options,scale:Math.min(180,Number(options.scale)||180)});if(!ok)return false;
    saveTarget(point);setTimeout(()=>applyRegionalFocus(point),40);return true;
  };
  return true;
}
function restore(){if(state.restored||nav()?.target)return;const p=savedTarget();if(!p)return;state.restored=true;setTimeout(()=>nav()?.selectTarget?.(p,{scale:180,reason:'restore previous SAR target'}),450);}
function install(){
  installStyle();installControls();patchNavigation();restore();setSurface();
  const retry=setInterval(()=>{installControls();patchNavigation();if(nav()?.selectTarget&&$('#omegaSarPrimaryControls')){clearInterval(retry);restore();setSurface();}},120);setTimeout(()=>clearInterval(retry),5000);state.state='READY';
}

map?.addEventListener('omega-map-select',event=>{
  const p=event.detail;if(!validTarget(p))return;saveTarget(p);state.intent='sar';
  const scale=Number(renderer()?.view?.scale)||1;if(scale<REGIONAL_MIN||scale>REGIONAL_MAX)setTimeout(()=>applyRegionalFocus(p),60);
  setSurface();
});
map?.addEventListener('omega-map-view',setSurface);
window.addEventListener('omega-regional-sar-measurement',event=>{
  if(event.detail?.state==='READY'&&state.intent==='sar'){
    const scale=Number(renderer()?.view?.scale)||1;if(scale<REGIONAL_MIN||scale>REGIONAL_MAX)setTimeout(()=>applyRegionalFocus(nav()?.target||state.target,{reload:false}),20);
  }
  setSurface();
});
window.addEventListener('omega-calibrated-sar-patch',setSurface);
window.addEventListener('omega-calibrated-sar-patch-clear',setSurface);
window.addEventListener('omega-source-sar-frame',setSurface);
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
state.focusSar=focusSar;state.world=world;state.evidence=evidence;state.surfaceState=setSurface;state.applyRegionalFocus=applyRegionalFocus;
