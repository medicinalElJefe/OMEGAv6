const $=s=>document.querySelector(s);
const body=document.body;
const map=$('#map');
const wrap=map?.closest('.map-wrap');
const state={mode:'explore',drawer:null,clean:false,ready:false,updates:0};
globalThis.OMEGA_SAR_EXPERIENCE=state;

function installStyle(){
  if($('#omegaExperienceStyle'))return;
  const style=document.createElement('style');style.id='omegaExperienceStyle';style.textContent=`
  :root{--omega-top:58px;--omega-edge:12px;--omega-glass:rgba(7,10,12,.78);--omega-glass-strong:rgba(8,12,14,.94);--omega-stroke:rgba(230,246,250,.13);--omega-soft:rgba(221,240,245,.72)}
  body.omega-experience{height:100vh;overflow:hidden;background:#050708;color:#f0f4f5}
  body.omega-experience .topbar{position:fixed!important;inset:0 0 auto 0;height:var(--omega-top);min-height:var(--omega-top);z-index:100;padding:8px 14px;background:rgba(5,8,9,.84);border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 8px 30px rgba(0,0,0,.24);backdrop-filter:blur(24px) saturate(118%);grid-template-columns:auto minmax(320px,1fr) auto}
  body.omega-experience .identity{min-width:0}.omega-experience .omega-mark{width:36px;height:36px;border-radius:12px}.omega-experience .identity b{font-size:12px}.omega-experience .identity span{font-size:8px;max-width:520px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  body.omega-experience .top-status>.state-pill{display:none}.omega-mode-switch{display:flex!important;justify-self:center;gap:3px;padding:3px;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(255,255,255,.035)}.omega-mode-switch button{min-width:86px;padding:6px 10px;border:0;border-radius:9px;background:transparent;color:#7f8c91;font:700 9px Inter,Segoe UI,sans-serif;letter-spacing:.08em}.omega-mode-switch button[aria-pressed=true]{background:rgba(235,248,250,.12);color:#f3fbfc;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
  body.omega-experience .telemetry-strip{display:flex;align-items:center;gap:12px;font-size:8px}.omega-experience .telemetry-strip span:nth-child(n+3){display:none}
  body.omega-experience .station{display:block;min-height:100vh;padding-top:var(--omega-top);background:#050708}
  body.omega-experience .workbench{height:calc(100vh - var(--omega-top));padding:8px;overflow:hidden}
  body.omega-experience .mission-banner{display:none}
  body.omega-experience .earth-grid{display:block;height:100%}
  body.omega-experience .earth-stage{height:100%;position:relative;padding:0;border:0;background:transparent;box-shadow:none}
  body.omega-experience .earth-stage>.panel-head{display:none}
  body.omega-experience .map-wrap{height:100%;min-height:0;border-radius:19px;border:1px solid rgba(255,255,255,.11);background:#020304;box-shadow:0 30px 100px rgba(0,0,0,.44);overflow:hidden}
  body.omega-experience .map-wrap:before{background:radial-gradient(circle at 50% 42%,transparent 48%,rgba(0,0,0,.16) 100%),linear-gradient(180deg,rgba(0,0,0,.10),transparent 18%,transparent 72%,rgba(0,0,0,.24));z-index:9}
  body.omega-experience .map-wrap canvas#map{cursor:grab}body.omega-experience .map-wrap canvas#map[data-dragging=true]{cursor:grabbing}

  /* The wide-camera source fabric should read as atmosphere/coverage, never graph paper. */
  body.omega-experience .omega-global-sar-fabric canvas{opacity:.075!important;filter:none;mix-blend-mode:screen!important;transform:none}
  body.omega-experience .omega-woven-motion canvas{opacity:.055!important;filter:none;mix-blend-mode:screen!important}
  body.omega-experience .sar-earth-overlay{opacity:.94}
  body.omega-experience .omega-regional-sar-layer canvas{opacity:.88!important}

  /* One consolidated instrument readout replaces the stack of overlapping proof cards. */
  .omega-experience-status{position:absolute;z-index:36;left:18px;top:18px;display:flex;align-items:center;gap:5px;max-width:min(620px,52%);pointer-events:none}.omega-experience-chip{display:flex;align-items:center;gap:6px;min-width:0;height:29px;padding:0 9px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(5,8,9,.66);backdrop-filter:blur(17px) saturate(115%);box-shadow:0 9px 25px rgba(0,0,0,.15)}.omega-experience-chip span{font:700 7px Inter,Segoe UI,sans-serif;letter-spacing:.10em;color:#76868b}.omega-experience-chip b{font:650 9px Inter,Segoe UI,sans-serif;color:#eaf1f3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-experience-chip[data-kind=measured]{border-color:rgba(220,246,250,.23);background:rgba(11,20,22,.70)}
  body.omega-experience #omegaFieldHud,body.omega-experience #omegaEarthAwarenessHud,body.omega-experience #omegaTemporalSyncHud,body.omega-experience #omegaGlobalSarFabricHud,body.omega-experience #omegaRegionalSarBadge,body.omega-experience #omegaBladeLens,body.omega-experience .omega-woven-motion-tag,body.omega-experience .map-hud,body.omega-experience .map-note,body.omega-experience .location-hero,body.omega-experience .view-location,body.omega-experience .north-compass{display:none!important}
  body.omega-experience .place-search{top:18px;width:min(440px,38%);z-index:37}.omega-experience .place-search input{height:38px;background:rgba(7,10,11,.66);border-color:rgba(255,255,255,.10);box-shadow:none}.omega-experience .place-search button{height:38px;padding:0 14px}
  body.omega-experience .scale-readout{z-index:35;right:18px;bottom:82px;opacity:.72}.omega-experience .earth-attribution{z-index:35;right:18px;bottom:108px;opacity:.64}

  /* Playback becomes a compact cinema transport over the Earth rather than another panel. */
  body.omega-experience .transport-deck{position:absolute;z-index:40;left:50%;bottom:14px;transform:translateX(-50%);width:min(920px,calc(100% - 210px));margin:0;padding:6px 7px;border:1px solid rgba(255,255,255,.10);border-radius:14px;background:rgba(6,9,10,.72);box-shadow:0 18px 48px rgba(0,0,0,.30);backdrop-filter:blur(22px) saturate(118%)}
  body.omega-experience .transport-main{grid-template-columns:30px 52px 30px minmax(170px,1fr) auto;gap:5px}.omega-experience .transport{height:30px;padding:4px}.omega-experience .transport-main input{height:26px}.omega-experience .transport-options{margin-top:3px;padding-top:3px;gap:4px;border-color:rgba(255,255,255,.06)}.omega-experience .transport-options label{font-size:7px}.omega-experience .transport-options select,.omega-experience .transport-options button{height:25px;padding:3px 6px;border-radius:7px;font-size:8px}.omega-experience .transport-options #export{margin-left:auto}

  /* Mission / evidence / analysis are deliberate drawers, not permanent space taxes. */
  body.omega-experience .mission-rail{position:fixed;z-index:120;left:var(--omega-edge);top:calc(var(--omega-top) + var(--omega-edge));bottom:var(--omega-edge);width:min(360px,calc(100vw - 36px));padding:12px;overflow:auto;border:1px solid var(--omega-stroke);border-radius:17px;background:var(--omega-glass-strong);box-shadow:0 30px 90px rgba(0,0,0,.56);backdrop-filter:blur(26px) saturate(115%);transform:translateX(calc(-100% - 28px));transition:transform .24s cubic-bezier(.2,.72,.2,1)}
  body.omega-experience[data-drawer=mission] .mission-rail{transform:translateX(0)}
  body.omega-experience .evidence-dock{position:fixed;z-index:120;right:var(--omega-edge);top:calc(var(--omega-top) + var(--omega-edge));bottom:var(--omega-edge);width:min(420px,calc(100vw - 36px));padding:0 2px 0 0;overflow:auto;display:block;background:transparent;transform:translateX(calc(100% + 30px));transition:transform .24s cubic-bezier(.2,.72,.2,1)}
  body.omega-experience[data-drawer=evidence] .evidence-dock{transform:translateX(0)}.omega-experience .evidence-dock>.panel{margin-bottom:9px;border-color:rgba(255,255,255,.11);background:rgba(9,13,15,.96);box-shadow:0 24px 70px rgba(0,0,0,.44);backdrop-filter:blur(22px)}
  body.omega-experience .analysis-deck{position:fixed;z-index:121;left:50%;bottom:var(--omega-edge);width:min(1180px,calc(100vw - 36px));max-height:min(70vh,760px);overflow:auto;padding:10px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;border:1px solid var(--omega-stroke);border-radius:18px;background:var(--omega-glass-strong);box-shadow:0 30px 100px rgba(0,0,0,.58);backdrop-filter:blur(28px) saturate(110%);transform:translate(-50%,calc(100% + 32px));transition:transform .26s cubic-bezier(.2,.72,.2,1)}
  body.omega-experience[data-drawer=analysis] .analysis-deck{transform:translate(-50%,0)}.omega-experience .analysis-deck>.canon-console{grid-column:1/-1;margin-top:0}.omega-experience .query-drawer{grid-column:1/-1}
  .omega-drawer-scrim{position:fixed;z-index:110;inset:var(--omega-top) 0 0;background:rgba(0,0,0,.28);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .2s}.omega-experience[data-drawer] .omega-drawer-scrim{opacity:1;pointer-events:auto}

  .omega-quickrail{position:fixed;z-index:105;left:17px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:6px;padding:5px;border:1px solid rgba(255,255,255,.09);border-radius:15px;background:rgba(6,9,10,.58);backdrop-filter:blur(18px);box-shadow:0 16px 38px rgba(0,0,0,.25)}.omega-quickrail button{width:42px;height:42px;display:grid;place-items:center;padding:0;border:0;border-radius:11px;background:transparent;color:#7f8d91;font:800 8px Inter,Segoe UI,sans-serif;letter-spacing:.05em}.omega-quickrail button:hover,.omega-quickrail button[aria-pressed=true]{background:rgba(236,248,250,.10);color:#f4fbfc}.omega-quickrail button b{font-size:13px;line-height:1}.omega-quickrail button span{font-size:6px;margin-top:-3px}

  /* Make source pixels useful when the evidence drawer is opened. Magnification is display-only. */
  body.omega-experience .pixel-stage{height:min(42vh,420px);background:#020304}.omega-experience .pixel-stage canvas{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain;image-rendering:auto}.omega-experience .browse-stage{height:min(34vh,330px)}
  body.omega-experience .panel-head h2{font-size:16px}.omega-experience .raster-stats,.omega-experience .micro{font-size:10px;line-height:1.5}.omega-experience .acquisition-readout b{font-size:11px}

  body.omega-experience.omega-clean .omega-experience-status,body.omega-experience.omega-clean .place-search,body.omega-experience.omega-clean .earth-attribution,body.omega-experience.omega-clean .scale-readout,body.omega-experience.omega-clean .transport-deck{opacity:0;pointer-events:none}.omega-experience.omega-clean .omega-quickrail{opacity:.22}.omega-experience.omega-clean .omega-quickrail:hover{opacity:1}

  body.omega-experience[data-mode=analyze] .omega-experience-status{max-width:min(760px,60%)}
  body.omega-experience[data-mode=proof] #omegaFieldHud,body.omega-experience[data-mode=proof] #omegaEarthAwarenessHud,body.omega-experience[data-mode=proof] #omegaTemporalSyncHud{display:grid!important;transform:scale(.86);transform-origin:top right;opacity:.82}

  @media(max-width:1100px){body.omega-experience .topbar{grid-template-columns:auto 1fr}.omega-experience .telemetry-strip{display:none}.omega-mode-switch{justify-self:end}.omega-experience-status{max-width:42%}.omega-experience .place-search{width:min(420px,48%)}.omega-experience .transport-deck{width:calc(100% - 150px)}.omega-experience .transport-options{overflow-x:auto;flex-wrap:nowrap}.omega-experience .transport-options>*{flex:0 0 auto}}
  @media(max-width:760px){:root{--omega-top:52px}body.omega-experience .topbar{grid-template-columns:1fr auto;padding:7px 9px}.omega-experience .identity span{display:none}.omega-mode-switch button{min-width:0;padding:6px 8px;font-size:7px}.omega-experience .workbench{padding:4px}.omega-experience .map-wrap{border-radius:13px}.omega-quickrail{left:8px;top:auto;bottom:76px;transform:none;flex-direction:row}.omega-quickrail button{width:36px;height:36px}.omega-experience-status{left:10px;top:58px;max-width:calc(100% - 20px);overflow-x:auto}.omega-experience .place-search{top:10px;width:calc(100% - 20px)}.omega-experience .transport-deck{left:8px;right:8px;bottom:8px;width:auto;transform:none}.omega-experience .transport-options{display:none}.omega-experience .scale-readout,.omega-experience .earth-attribution{display:none}.omega-experience .analysis-deck{grid-template-columns:1fr}.omega-experience .analysis-deck>*{grid-column:1!important}}
  `;document.head.append(style);
}

function buildModeSwitch(){
  const host=$('.top-status');if(!host||$('#omegaModeSwitch'))return;
  const nav=document.createElement('nav');nav.id='omegaModeSwitch';nav.className='omega-mode-switch';nav.setAttribute('aria-label','OMEGA experience mode');
  nav.innerHTML='<button data-mode="explore" aria-pressed="true">EXPLORE</button><button data-mode="analyze" aria-pressed="false">ANALYZE</button><button data-mode="proof" aria-pressed="false">PROOF</button>';
  host.replaceChildren(nav);nav.addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(b)setMode(b.dataset.mode);});
}
function buildQuickRail(){
  if($('#omegaQuickRail'))return;const rail=document.createElement('nav');rail.id='omegaQuickRail';rail.className='omega-quickrail';rail.setAttribute('aria-label','OMEGA quick tools');rail.innerHTML=`
    <button data-drawer="mission" title="Mission controls (M)"><b>≡</b><span>MISSION</span></button>
    <button data-drawer="evidence" title="Measurement evidence (E)"><b>◫</b><span>EVIDENCE</span></button>
    <button data-drawer="analysis" title="Analysis deck (A)"><b>∿</b><span>ANALYZE</span></button>
    <button data-clean="true" title="Clean cinema view (F)"><b>◇</b><span>CLEAN</span></button>`;
  document.body.append(rail);rail.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.drawer)toggleDrawer(b.dataset.drawer);else if(b.dataset.clean)setClean(!state.clean);});
}
function buildScrim(){if($('#omegaDrawerScrim'))return;const s=document.createElement('div');s.id='omegaDrawerScrim';s.className='omega-drawer-scrim';s.addEventListener('click',()=>setDrawer(null));document.body.append(s);}
function buildStatus(){
  if(!wrap||$('#omegaExperienceStatus'))return;const el=document.createElement('div');el.id='omegaExperienceStatus';el.className='omega-experience-status';el.innerHTML='<div class="omega-experience-chip"><span>SAR</span><b data-k="sar">ACQUIRING</b></div><div class="omega-experience-chip" data-kind="measured"><span>MEASURED</span><b data-k="measured">WAITING</b></div><div class="omega-experience-chip"><span>MODE 188</span><b data-k="lemma">READY</b></div><div class="omega-experience-chip"><span>ATLAS</span><b data-k="atlas">12</b></div>';wrap.append(el);
}
function setMode(mode){
  if(!['explore','analyze','proof'].includes(mode))mode='explore';state.mode=mode;body.dataset.mode=mode;for(const b of document.querySelectorAll('#omegaModeSwitch [data-mode]'))b.setAttribute('aria-pressed',b.dataset.mode===mode?'true':'false');
  if(mode==='explore'&&state.drawer==='analysis')setDrawer(null);if(mode==='analyze')setDrawer('analysis');if(mode==='proof')setDrawer(null);
  try{localStorage.setItem('omega-sar-experience-mode',mode)}catch{}
}
function setDrawer(name){state.drawer=name||null;if(state.drawer)body.dataset.drawer=state.drawer;else delete body.dataset.drawer;for(const b of document.querySelectorAll('#omegaQuickRail [data-drawer]'))b.setAttribute('aria-pressed',b.dataset.drawer===state.drawer?'true':'false');requestAnimationFrame(()=>globalThis.OMEGA_SAR_RENDERER?.resize?.());}
function toggleDrawer(name){setDrawer(state.drawer===name?null:name);}
function setClean(value){state.clean=!!value;body.classList.toggle('omega-clean',state.clean);const b=$('#omegaQuickRail [data-clean]');if(b)b.setAttribute('aria-pressed',state.clean?'true':'false');}
function updateStatus(){
  const el=$('#omegaExperienceStatus');if(!el)return;state.updates++;
  const fabric=globalThis.OMEGA_SAR_GLOBAL_FABRIC,regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT,exact=globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch,lemma=globalThis.OMEGA_SAR_LEMMA_TRANSLATOR,scale=Number(globalThis.OMEGA_SAR_RENDERER?.view?.scale)||1;
  const sar=el.querySelector('[data-k=sar]'),measured=el.querySelector('[data-k=measured]'),lem=el.querySelector('[data-k=lemma]'),atlas=el.querySelector('[data-k=atlas]');
  if(sar)sar.textContent=fabric?.state==='READY'?`${fabric.records?.length||0} SCENES · ${fabric.fabric?.cells?.filter(c=>c.coverage>0).length||0} CELLS`:String(fabric?.state||'ACQUIRING').replaceAll('_',' ');
  if(measured)measured.textContent=exact?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'?`EXACT · ${Number(exact.stats?.validCount||0).toLocaleString()} PX`:regional?.state==='READY'?'REGIONAL COG':regional?.state==='LOADING'?'CALIBRATING':regional?.state==='SOURCE_CONTEXT_SCALE'?'SOURCE CONTEXT':'WAITING';
  if(lem)lem.textContent=lemma?.state==='READY'?`${lemma.annotated||0} CELLS`:'TRANSLATING';
  if(atlas)atlas.textContent=scale<2?'12':scale<12?'144':scale<180?'1,728':scale<900?'20,736':'248,832';
}
function onKey(e){if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey)return;const tag=e.target?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;const k=e.key.toLowerCase();if(k==='escape')setDrawer(null);else if(k==='m')toggleDrawer('mission');else if(k==='e')toggleDrawer('evidence');else if(k==='a')toggleDrawer('analysis');else if(k==='f')setClean(!state.clean);}
function install(){
  if(!body||!wrap||state.ready)return;installStyle();body.classList.add('omega-experience');buildModeSwitch();buildQuickRail();buildScrim();buildStatus();
  let remembered='explore';try{remembered=localStorage.getItem('omega-sar-experience-mode')||'explore'}catch{}setMode(remembered);setDrawer(null);setClean(false);document.addEventListener('keydown',onKey);setInterval(updateStatus,700);updateStatus();state.ready=true;state.state='READY';
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
state.setMode=setMode;state.setDrawer=setDrawer;state.setClean=setClean;state.update=updateStatus;
