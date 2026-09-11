const $=selector=>document.querySelector(selector);
const body=document.body;
const map=$('#map');
let lastGeometryKey='';
const observers=[];
const state={
  state:'INITIALIZING',release:'R260.3',
  contract:'ONE_COMMAND_BAR_ONE_IMAGE_PLANE_CONTAINED_DRAWERS',
  viewport:null,drawer:null,surface:null,syncs:0,
  boundary:'Presentation geometry, contrast and paint scheduling only. Measurement authority and source arrays are unchanged.'
};
globalThis.OMEGA_SAR_VISUAL_STABILITY=state;

const VISUAL_CSS=String.raw`
/* R260.3_VISUAL_CONTRACT */
:root{
  --omega-command-height:40px;
  --omega-mission-width:min(340px,calc(100vw - 24px));
  --omega-evidence-width:min(380px,calc(100vw - 24px));
  --omega-analysis-height:min(42vh,420px);
  --omega-panel-gap:8px;
}
html,body{max-width:100%;overflow-x:hidden}
body.omega-experience{color:#e8eef0;background:#030607}
body.omega-experience *,body.omega-experience *:before,body.omega-experience *:after{box-sizing:border-box}

/* One crisp image hierarchy. World context remains context; calibrated SAR stays primary. */
body.omega-experience .map-wrap{background:#020506!important;isolation:isolate}
body.omega-experience .map-wrap:before{background:radial-gradient(circle at 50% 46%,transparent 58%,rgba(0,0,0,.14) 100%),linear-gradient(180deg,rgba(0,0,0,.04),transparent 20%,transparent 78%,rgba(0,0,0,.14))!important}
body.omega-experience[data-data-native-surface=world_relief] .omega-data-native-surface canvas{opacity:.16!important;mix-blend-mode:soft-light!important;filter:contrast(1.05) saturate(.72)!important;transition:none!important}
body.omega-experience[data-data-native-surface=regional_shaped_sar] .omega-data-native-surface canvas,
body.omega-experience[data-data-native-surface=exact_shaped_sar] .omega-data-native-surface canvas{opacity:1!important;mix-blend-mode:normal!important;filter:none!important;transition:none!important}
body.omega-experience .omega-global-sar-fabric canvas{filter:none!important;transform:none!important;mix-blend-mode:screen!important;transition:none!important}
body.omega-experience .omega-woven-motion canvas{filter:none!important;transform:none!important;mix-blend-mode:screen!important;transition:none!important}
body.omega-experience[data-mode=explore] #omegaDataNativeBadge{display:none!important}

/* Command strip and image plane share the same reserved geometry. */
body.omega-experience .earth-stage{grid-template-rows:var(--omega-command-height) minmax(0,1fr)!important;overflow:hidden!important}
body.omega-experience .place-dock{
  width:100%!important;height:36px!important;min-width:0!important;margin:0 0 4px!important;padding:3px 5px!important;
  display:grid!important;grid-template-columns:minmax(220px,360px) minmax(0,1fr)!important;align-items:center!important;gap:7px!important;
  overflow:visible!important;transition:none!important;background:#080d0f!important;border-color:rgba(222,240,244,.12)!important;
}
body.omega-experience .place-dock .place-search{width:100%!important;min-width:0!important;max-width:none!important}
body.omega-experience .place-dock .place-search input{min-width:0!important;height:30px!important;font-size:10px!important}
body.omega-experience .place-dock .place-search button{height:30px!important;min-width:48px!important;font-size:8px!important}
body.omega-experience .omega-sar-primary-controls{width:100%!important;min-width:0!important;height:30px!important;max-height:30px!important;margin:0!important;justify-content:flex-end!important;gap:4px!important;overflow:hidden!important}
body.omega-experience .omega-sar-primary-controls>*{min-width:0!important}
body.omega-experience .omega-sar-primary-state{display:none!important}
body.omega-experience .omega-sar-primary-controls button{height:30px!important;max-height:30px!important;min-width:44px!important;padding:0 8px!important;font-size:7.5px!important}
body.omega-experience .omega-r258-layer-control{height:30px!important;min-width:146px!important;max-width:230px!important;padding:0 5px!important;grid-template-columns:auto auto minmax(0,1fr)!important}
body.omega-experience .omega-r258-layer-control select{height:24px!important;min-width:76px!important;font-size:7.5px!important}
body.omega-experience .omega-r259-canon-readout{height:30px!important;min-width:126px!important;max-width:210px!important}
body.omega-experience .map-wrap{width:100%!important;height:100%!important;min-width:0!important;margin:0!important;transition:none!important}

body.omega-experience[data-drawer=mission] .place-dock,
body.omega-experience[data-drawer=mission] .map-wrap{
  width:calc(100% - var(--omega-mission-width) - var(--omega-panel-gap))!important;
  margin-left:calc(var(--omega-mission-width) + var(--omega-panel-gap))!important;
  margin-right:0!important;transition:none!important;
}
body.omega-experience[data-drawer=evidence] .place-dock,
body.omega-experience[data-drawer=evidence] .map-wrap{
  width:calc(100% - var(--omega-evidence-width) - var(--omega-panel-gap))!important;
  margin-left:0!important;margin-right:calc(var(--omega-evidence-width) + var(--omega-panel-gap))!important;transition:none!important;
}
body.omega-experience[data-drawer=analysis] .map-wrap{
  height:calc(100% - var(--omega-analysis-height) - var(--omega-panel-gap))!important;
  margin-bottom:calc(var(--omega-analysis-height) + var(--omega-panel-gap))!important;transition:none!important;
}
body.omega-experience[data-drawer=mission] .omega-r257-stage,
body.omega-experience[data-drawer=evidence] .omega-r257-stage,
body.omega-experience[data-drawer=mission] #omegaR259CanonReadout,
body.omega-experience[data-drawer=evidence] #omegaR259CanonReadout,
body.omega-experience[data-drawer=mission] .omega-r258-layer-control>b,
body.omega-experience[data-drawer=evidence] .omega-r258-layer-control>b{display:none!important}

/* Drawers are bounded work surfaces with a persistent escape action. */
body.omega-experience .mission-rail,
body.omega-experience .evidence-dock,
body.omega-experience .analysis-deck{overflow-x:hidden!important;overscroll-behavior:contain;scrollbar-gutter:stable;transition:none!important}
body.omega-experience .mission-rail{
  left:8px!important;right:auto!important;top:calc(var(--omega-top) + 44px)!important;bottom:8px!important;
  width:var(--omega-mission-width)!important;padding:0 10px 10px!important;border-radius:13px!important;background:#090e10!important;
}
body.omega-experience .evidence-dock{
  right:8px!important;left:auto!important;top:calc(var(--omega-top) + 44px)!important;bottom:8px!important;
  width:var(--omega-evidence-width)!important;padding:0!important;border-radius:13px!important;background:#070b0d!important;border:1px solid rgba(225,241,245,.12)!important;
}
body.omega-experience .analysis-deck{
  left:8px!important;right:8px!important;bottom:8px!important;width:auto!important;height:var(--omega-analysis-height)!important;
  max-height:none!important;padding:0 8px 8px!important;gap:7px!important;border-radius:13px!important;background:#070b0d!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;transform:translate(0,calc(100% + 24px))!important;
}
body.omega-experience[data-drawer=analysis] .analysis-deck{transform:translate(0,0)!important}
body.omega-experience .mission-rail>*,body.omega-experience .evidence-dock>*,body.omega-experience .analysis-deck>*{min-width:0!important;max-width:100%!important}
body.omega-experience .mission-rail .two{grid-template-columns:repeat(2,minmax(0,1fr))!important}
body.omega-experience .mission-rail label,body.omega-experience .mission-rail input,body.omega-experience .mission-rail select,
body.omega-experience .mission-rail button,body.omega-experience .evidence-dock input,body.omega-experience .evidence-dock select,
body.omega-experience .evidence-dock button{min-width:0!important;max-width:100%!important}
body.omega-experience .mission-rail input,body.omega-experience .mission-rail select{width:100%!important}
body.omega-experience .evidence-dock>.panel{margin:0 0 7px!important;border-radius:10px!important;background:#0a1012!important;contain:layout paint}
body.omega-experience .analysis-deck>.canon-console,body.omega-experience .analysis-deck>.query-drawer,
body.omega-experience .analysis-deck>.omega-r258-calculus-panel,body.omega-experience .analysis-deck>.omega-r259-canon-analysis{grid-column:1/-1!important}
.omega-stability-toolbar{
  position:sticky;z-index:8;top:0;grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px;
  min-height:42px;margin:0 -2px 8px;padding:7px 7px 6px;background:linear-gradient(180deg,#090e10 74%,rgba(9,14,16,.90));
  border-bottom:1px solid rgba(225,241,245,.10);
}
.mission-rail>.omega-stability-toolbar{margin:0 -10px 8px;padding-left:10px;padding-right:10px}
.omega-stability-toolbar b{font:750 10px Inter,Segoe UI,sans-serif;letter-spacing:.08em;color:#dfe9eb}
.omega-drawer-close{height:28px!important;min-width:62px!important;padding:0 9px!important;border:1px solid rgba(225,241,245,.15)!important;border-radius:7px!important;background:rgba(235,248,250,.07)!important;color:#dce7e9!important;font:750 7.5px Inter,Segoe UI,sans-serif!important;letter-spacing:.08em!important;cursor:pointer}
.omega-drawer-close:hover,.omega-drawer-close:focus-visible{background:rgba(235,248,250,.14)!important;outline:1px solid rgba(225,241,245,.30);outline-offset:1px}
body.omega-experience .omega-drawer-scrim{background:transparent!important;backdrop-filter:none!important;pointer-events:none!important;transition:none!important}

/* Rail and transport are legible, but the image remains the visual center. */
body.omega-experience .omega-quickrail{z-index:108!important}
body.omega-experience .omega-quickrail button{width:38px!important;height:38px!important}
body.omega-experience .omega-quickrail button span{display:block!important;font-size:5.5px!important}
body.omega-experience .transport-deck{background:rgba(5,9,10,.86)!important;backdrop-filter:blur(12px)!important}

@media(max-width:1120px){
  :root{--omega-mission-width:min(310px,calc(100vw - 20px));--omega-evidence-width:min(330px,calc(100vw - 20px))}
  body.omega-experience .place-dock{grid-template-columns:minmax(190px,300px) minmax(0,1fr)!important}
  body.omega-experience .omega-r258-layer-control{min-width:118px!important}
  body.omega-experience .omega-r258-layer-control>b,body.omega-experience #omegaR259CanonReadout b{display:none!important}
  body.omega-experience .omega-r259-canon-readout{min-width:94px!important;max-width:125px!important}
  body.omega-experience .analysis-deck{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}

@media(max-width:760px){
  :root{--omega-command-height:76px;--omega-analysis-height:calc(100vh - var(--omega-top) - 84px)}
  body.omega-experience .topbar{padding-left:max(8px,env(safe-area-inset-left))!important;padding-right:max(8px,env(safe-area-inset-right))!important}
  body.omega-experience .omega-mark{width:26px!important;height:26px!important}
  body.omega-experience .identity b{font-size:9px!important}
  body.omega-experience .omega-mode-switch button{height:26px!important;min-width:48px!important;padding:3px 6px!important;font-size:7px!important}
  body.omega-experience .earth-stage{grid-template-rows:76px minmax(0,1fr)!important}
  body.omega-experience .place-dock{
    width:100%!important;height:72px!important;margin:0 0 4px!important;padding:3px!important;
    display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:32px 32px!important;gap:4px!important;overflow:visible!important;
  }
  body.omega-experience .place-dock .place-search{grid-row:1;width:100%!important;min-width:0!important}
  body.omega-experience .place-dock .place-search input,body.omega-experience .place-dock .place-search button{height:32px!important}
  body.omega-experience .omega-sar-primary-controls{grid-row:2;width:100%!important;height:32px!important;max-height:32px!important;justify-content:stretch!important;gap:3px!important;overflow:hidden!important}
  body.omega-experience .omega-sar-primary-controls button{height:30px!important;max-height:30px!important;min-width:42px!important;flex:0 0 auto!important;padding:0 6px!important;font-size:7px!important}
  body.omega-experience #omegaSarFit,body.omega-experience #omegaR259CanonReadout,
  body.omega-experience .omega-r257-stage,body.omega-experience .omega-r258-layer-control>span,
  body.omega-experience .omega-r258-layer-control>b{display:none!important}
  body.omega-experience #omegaSarEvidence{display:block!important}
  body.omega-experience .omega-r258-layer-control{display:flex!important;flex:1 1 auto!important;width:auto!important;min-width:0!important;max-width:none!important;height:30px!important;padding:0 3px!important}
  body.omega-experience .omega-r258-layer-control select{width:100%!important;min-width:0!important;height:24px!important;font-size:7px!important}
  body.omega-experience .map-wrap{width:100%!important;height:100%!important;margin:0!important;opacity:1!important;transition:none!important;border-radius:9px!important}
  body.omega-experience[data-drawer=mission] .place-dock,body.omega-experience[data-drawer=mission] .map-wrap,
  body.omega-experience[data-drawer=evidence] .place-dock,body.omega-experience[data-drawer=evidence] .map-wrap{width:100%!important;margin-left:0!important;margin-right:0!important}
  body.omega-experience .mission-rail,body.omega-experience .evidence-dock,body.omega-experience .analysis-deck{
    z-index:130!important;left:4px!important;right:4px!important;top:calc(var(--omega-top) + 80px)!important;bottom:max(4px,env(safe-area-inset-bottom))!important;
    width:auto!important;height:auto!important;max-height:none!important;border-radius:11px!important;transform:translateY(calc(100% + 24px))!important;
    background:#070b0d!important;box-shadow:0 18px 60px rgba(0,0,0,.72)!important;
  }
  body.omega-experience[data-drawer=mission] .mission-rail,body.omega-experience[data-drawer=evidence] .evidence-dock,
  body.omega-experience[data-drawer=analysis] .analysis-deck{transform:translateY(0)!important}
  body.omega-experience .analysis-deck{display:grid!important;grid-template-columns:1fr!important;padding:0 7px 7px!important}
  body.omega-experience .analysis-deck>*{grid-column:1!important}
  body.omega-experience .mission-rail .two{grid-template-columns:1fr!important}
  body.omega-experience .omega-quickrail{left:5px!important;bottom:42px!important;z-index:108!important}
  body.omega-experience .omega-quickrail button{width:34px!important;height:34px!important}
  body.omega-experience .omega-quickrail button span{display:none!important}
  body.omega-experience .transport-deck{bottom:max(5px,env(safe-area-inset-bottom))!important}
  body.omega-experience[data-drawer] .omega-quickrail,body.omega-experience[data-drawer] .transport-deck{opacity:0!important;pointer-events:none!important}
  body.omega-experience[data-mode=proof]:not([data-drawer]) .map-wrap{width:100%!important;margin:0 0 46%!important}
  body.omega-experience[data-mode=proof] .omega-r257-proof-stack{left:4px!important;right:4px!important;width:auto!important;bottom:max(4px,env(safe-area-inset-bottom))!important}
}

@media(max-width:430px){
  body.omega-experience .identity .omega-mark{display:none!important}
  body.omega-experience .omega-mode-switch button{min-width:45px!important}
  body.omega-experience .omega-sar-primary-controls button{min-width:39px!important;padding:0 5px!important}
}
@media(max-height:620px) and (max-width:760px){
  :root{--omega-command-height:68px}
  body.omega-experience .earth-stage{grid-template-rows:68px minmax(0,1fr)!important}
  body.omega-experience .place-dock{height:64px!important;grid-template-rows:28px 28px!important}
  body.omega-experience .place-dock .place-search input,body.omega-experience .place-dock .place-search button{height:28px!important}
  body.omega-experience .mission-rail,body.omega-experience .evidence-dock,body.omega-experience .analysis-deck{top:calc(var(--omega-top) + 72px)!important}
}
@media(prefers-reduced-motion:reduce){body.omega-experience *,body.omega-experience *:before,body.omega-experience *:after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
`;

function installStyle(){
  if($('#omegaSarVisualStabilityStyle'))return;
  const style=document.createElement('style');
  style.id='omegaSarVisualStabilityStyle';
  style.textContent=VISUAL_CSS;
  document.head.append(style);
}

function toolbar(panel,label){
  if(!panel)return;
  const existing=panel.querySelector(':scope > .omega-stability-toolbar');
  if(existing){if(panel.firstElementChild!==existing)panel.prepend(existing);return;}
  const bar=document.createElement('div');
  bar.className='omega-stability-toolbar';
  bar.setAttribute('role','toolbar');bar.setAttribute('aria-label',`${label} drawer actions`);
  bar.innerHTML=`<b>${label}</b><button class="omega-drawer-close" type="button" aria-label="Close ${label.toLowerCase()}">CLOSE</button>`;
  bar.querySelector('button').addEventListener('click',()=>{globalThis.OMEGA_SAR_EXPERIENCE?.setDrawer?.(null);sync();});
  panel.prepend(bar);
}

function installToolbars(){
  toolbar($('.mission-rail'),'MISSION');
  toolbar($('.evidence-dock'),'EVIDENCE');
  toolbar($('.analysis-deck'),'ANALYSIS');
}

function setPanelAccess(panel,open){
  if(!panel)return;
  panel.inert=!open;
  panel.setAttribute('aria-hidden',open?'false':'true');
}

function balanceSurface(){
  const surface=String(body.dataset.dataNativeSurface||'world_relief');
  const shaped=surface==='regional_shaped_sar'||surface==='exact_shaped_sar';
  const set=(selector,value)=>{const node=$(selector);if(node)node.style.setProperty('opacity',String(value),'important');};
  set('.omega-global-sar-fabric canvas',shaped?.004:.075);
  set('.omega-woven-motion canvas',shaped?.012:.055);
  set('.omega-jrc-water-layer canvas',shaped?.05:.055);
  set('#map',surface==='exact_shaped_sar'?.012:surface==='regional_shaped_sar'?.001:1);
  state.surface=surface;
}

function settleCanvases(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    globalThis.OMEGA_SAR_RENDERER?.resize?.();
  }));
}

function sync(){
  installToolbars();
  const drawer=body.dataset.drawer||null;
  setPanelAccess($('.mission-rail'),drawer==='mission');
  setPanelAccess($('.evidence-dock'),drawer==='evidence');
  setPanelAccess($('.analysis-deck'),drawer==='analysis');
  balanceSurface();
  state.drawer=drawer;
  state.viewport={width:innerWidth,height:innerHeight,compact:matchMedia('(max-width:760px)').matches};
  state.syncs++;
  state.state='READY';
  body.dataset.visualStability='ready';
  const geometryKey=`${drawer||'closed'}|${body.dataset.mode||'explore'}|${innerWidth}x${innerHeight}`;
  if(geometryKey!==lastGeometryKey){lastGeometryKey=geometryKey;settleCanvases();}
}

function scheduleSync(){
  cancelAnimationFrame(scheduleSync.raf);
  scheduleSync.raf=requestAnimationFrame(sync);
}

function install(){
  if(!body||!map)return;
  installStyle();
  installToolbars();
  const stateObserver=new MutationObserver(scheduleSync),layerObserver=new MutationObserver(scheduleSync);
  stateObserver.observe(body,{attributes:true,attributeFilter:['data-drawer','data-mode','data-data-native-surface','data-sar-surface']});
  layerObserver.observe(map.closest('.map-wrap'),{childList:true,subtree:true});
  observers.push(stateObserver,layerObserver);
  $('#omegaQuickRail')?.addEventListener('click',()=>queueMicrotask(sync));
  $('#omegaModeSwitch')?.addEventListener('click',()=>queueMicrotask(sync));
  document.addEventListener('keydown',event=>{if(['Escape','m','M','e','E','a','A'].includes(event.key))queueMicrotask(sync);});
  for(const event of ['omega-earth-canon-update','omega-data-native-terrain','omega-regional-sar-measurement','omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear'])window.addEventListener(event,scheduleSync);
  map.addEventListener('omega-map-view',scheduleSync);
  window.addEventListener('resize',scheduleSync,{passive:true});
  sync();
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});
  else requestAnimationFrame(install);
}
state.sync=sync;
