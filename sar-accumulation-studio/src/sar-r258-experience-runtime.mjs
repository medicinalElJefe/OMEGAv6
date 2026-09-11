const $=s=>document.querySelector(s),map=$('#map'),wrap=map?.closest('.map-wrap'),body=document.body;
let reticle=null,observer=null,raf=0,lastMode='';
const state={state:'INITIALIZING',release:'R258',layout:'ONE_IMAGE_PLANE_WITH_RESERVED_TOOL_ZONES',legacyImageSuppression:true,proofRail:'RESERVED_RIGHT_COLUMN',drawerPolicy:'RESIZE_CAMERA_SURFACE_NOT_OVERLAY_IT',precisionStrip:'MERGED_OUT_OF_IMAGE_PLANE',sourceFootprint:'DATA_PANEL_ONLY_NOT_MAIN_IMAGE',updatedAt:null};
globalThis.OMEGA_SAR_R258_EXPERIENCE=state;

function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function target(){return globalThis.OMEGA_SAR_NAVIGATION?.target||renderer()?.point||null;}
function updateReticle(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(!reticle||!map)return;const r=renderer(),t=target(),rect=map.getBoundingClientRect();if(!r||!t){reticle.hidden=true;return;}const [x,y]=r.project(Number(t.lon),Number(t.lat));const visible=x>=0&&y>=0&&x<=rect.width&&y<=rect.height;reticle.hidden=!visible;if(visible){reticle.style.left=`${x}px`;reticle.style.top=`${y}px`;reticle.title=`${Number(t.lat).toFixed(5)}, ${Number(t.lon).toFixed(5)}`;}});}
function closeDrawerForMode(){const mode=body.dataset.mode||'explore',exp=globalThis.OMEGA_SAR_EXPERIENCE;if((mode==='explore'||mode==='proof')&&body.dataset.drawer&&lastMode!==mode)exp?.setDrawer?.(null);lastMode=mode;}
function reserve(){closeDrawerForMode();body.dataset.r258Layout='reserved';state.updatedAt=new Date().toISOString();requestAnimationFrame(()=>{renderer()?.resize?.();updateReticle();});}
function ensureReticle(){if(!wrap||reticle)return;reticle=document.createElement('div');reticle.id='omegaR258TargetReticle';reticle.className='omega-r258-target-reticle';reticle.innerHTML='<i></i><b></b>';reticle.hidden=true;wrap.append(reticle);}
function installStyle(){if($('#omegaR258ExperienceStyle'))return;const style=document.createElement('style');style.id='omegaR258ExperienceStyle';style.textContent=`
:root{--r258-side:326px;--r258-mission:294px;--r258-analysis:min(37vh,360px)}
/* One authoritative image plane: legacy canvas remains interactive but not visually double-exposed. */
body.omega-experience[data-data-native-surface=regional_shaped_sar] #map,body.omega-experience[data-data-native-surface=exact_shaped_sar] #map{opacity:.001!important;transition:none!important}
body.omega-experience .sar-source-browse-layer{opacity:0!important;visibility:hidden!important}
body.omega-experience .sar-source-browse-badge{display:none!important}
body.omega-experience .map-wrap:after{display:none!important}
body.omega-experience #omegaPrecisionStrip{display:none!important}
body.omega-experience .earth-attribution{bottom:12px!important;right:12px!important;opacity:.34!important}
body.omega-experience .scale-readout{bottom:27px!important;right:12px!important;opacity:.42!important}

/* Drawer geometry reserves pixels instead of laying panels on top of SAR pixels. */
body.omega-experience[data-drawer=evidence] .map-wrap{width:calc(100% - var(--r258-side) - 8px)!important;margin-right:calc(var(--r258-side) + 8px)!important;transition:width .22s cubic-bezier(.2,.75,.2,1),margin .22s cubic-bezier(.2,.75,.2,1)}
body.omega-experience[data-drawer=mission] .map-wrap{width:calc(100% - var(--r258-mission) - 8px)!important;margin-left:calc(var(--r258-mission) + 8px)!important;transition:width .22s cubic-bezier(.2,.75,.2,1),margin .22s cubic-bezier(.2,.75,.2,1)}
body.omega-experience[data-drawer=analysis] .map-wrap{height:calc(100% - var(--r258-analysis) - 8px)!important;margin-bottom:calc(var(--r258-analysis) + 8px)!important;transition:height .22s cubic-bezier(.2,.75,.2,1),margin .22s cubic-bezier(.2,.75,.2,1)}
body.omega-experience .omega-drawer-scrim{background:transparent!important;backdrop-filter:none!important;pointer-events:none!important}
body.omega-experience[data-drawer=evidence] .evidence-dock{right:8px!important;width:var(--r258-side)!important;top:50px!important;bottom:8px!important}
body.omega-experience[data-drawer=mission] .mission-rail{left:8px!important;width:var(--r258-mission)!important;top:50px!important;bottom:8px!important}
body.omega-experience[data-drawer=analysis] .analysis-deck{left:8px!important;right:8px!important;bottom:8px!important;width:auto!important;max-height:none!important;height:var(--r258-analysis)!important;transform:translate(0,0)!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}
body.omega-experience[data-drawer=analysis] .analysis-deck>.probe-panel,body.omega-experience[data-drawer=analysis] .analysis-deck>.atlas-inference,body.omega-experience[data-drawer=analysis] .analysis-deck>.diagnostics-panel{min-height:0!important}

/* PROOF is a real workstation column, not a pile of translucent cards over the target. */
body.omega-experience[data-mode=proof]:not([data-drawer]) .map-wrap{width:calc(100% - var(--r258-side) - 8px)!important;margin-right:calc(var(--r258-side) + 8px)!important}
body.omega-experience[data-mode=proof] .omega-r257-proof-stack{position:fixed!important;z-index:75!important;right:8px!important;left:auto!important;top:50px!important;bottom:8px!important;width:var(--r258-side)!important;max-height:none!important;padding:6px!important;gap:5px!important;border-radius:12px!important;background:rgba(5,8,9,.94)!important;backdrop-filter:blur(18px)!important;box-shadow:none!important;overflow:auto!important}
body.omega-experience[data-mode=proof] .omega-r257-proof-stack>#omegaFieldHud,body.omega-experience[data-mode=proof] .omega-r257-proof-stack>#omegaCellInspector,body.omega-experience[data-mode=proof] .omega-r257-proof-stack>#omegaEarthAwarenessHud,body.omega-experience[data-mode=proof] .omega-r257-proof-stack>#omegaTemporalSyncHud,body.omega-experience[data-mode=proof] .omega-r257-proof-stack>#omegaGlobalSarFabricHud,body.omega-experience[data-mode=proof] .omega-r257-proof-stack>#omegaBladeLens{max-height:142px!important;opacity:.88!important;border-radius:9px!important}
body.omega-experience[data-mode=proof] .transport-deck{left:calc((100% - var(--r258-side))/2)!important;width:min(620px,calc(100% - var(--r258-side) - 110px))!important}

/* Explore is the clean, full-width image experience. */
body.omega-experience[data-mode=explore]:not([data-drawer]) .evidence-dock,body.omega-experience[data-mode=explore]:not([data-drawer]) .mission-rail,body.omega-experience[data-mode=explore]:not([data-drawer]) .analysis-deck{pointer-events:none!important}
body.omega-experience .transport-deck{min-height:32px!important;padding:3px 5px!important;border-radius:9px!important;background:rgba(5,8,9,.67)!important}
body.omega-experience[data-mode=explore] .transport-options,body.omega-experience[data-mode=proof] .transport-options{display:none!important}
body.omega-experience .transport-main{min-height:26px!important}
body.omega-experience .omega-experience-status{top:8px!important;left:8px!important}
body.omega-experience .omega-experience-chip{background:rgba(4,7,8,.54)!important;backdrop-filter:blur(10px)!important}

.omega-r258-target-reticle{position:absolute;z-index:12;width:22px;height:22px;transform:translate(-50%,-50%);pointer-events:none;border:1px solid rgba(244,250,252,.80);border-radius:50%;box-shadow:0 0 0 5px rgba(245,250,252,.045)}.omega-r258-target-reticle:before,.omega-r258-target-reticle:after{content:'';position:absolute;background:rgba(245,250,252,.76)}.omega-r258-target-reticle:before{left:50%;top:-7px;bottom:-7px;width:1px;transform:translateX(-.5px)}.omega-r258-target-reticle:after{top:50%;left:-7px;right:-7px;height:1px;transform:translateY(-.5px)}.omega-r258-target-reticle i{position:absolute;inset:7px;border:1px solid rgba(245,250,252,.55);border-radius:50%}.omega-r258-target-reticle b{display:none}

@media(max-width:1120px){:root{--r258-side:286px;--r258-mission:268px}.omega-r257-proof-stack{font-size:90%}body.omega-experience[data-drawer=analysis] .analysis-deck{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:760px){:root{--r258-side:min(86vw,310px);--r258-mission:min(86vw,290px);--r258-analysis:44vh}body.omega-experience[data-mode=proof]:not([data-drawer]) .map-wrap{width:100%!important;margin-right:0!important;height:54%!important;margin-bottom:46%!important}body.omega-experience[data-mode=proof] .omega-r257-proof-stack{left:5px!important;right:5px!important;top:auto!important;bottom:5px!important;width:auto!important;max-height:43vh!important}body.omega-experience[data-drawer=evidence] .map-wrap,body.omega-experience[data-drawer=mission] .map-wrap{width:100%!important;margin:0!important;opacity:.35!important}body.omega-experience[data-drawer=analysis] .analysis-deck{grid-template-columns:1fr!important}.omega-r258-target-reticle{width:18px;height:18px}}
`;document.head.append(style);}
function install(){if(!body||!wrap)return;installStyle();ensureReticle();lastMode=body.dataset.mode||'explore';observer=new MutationObserver(reserve);observer.observe(body,{attributes:true,attributeFilter:['data-mode','data-drawer','data-data-native-surface']});map?.addEventListener('omega-map-view',updateReticle);map?.addEventListener('omega-map-select',updateReticle);window.addEventListener('omega-regional-sar-measurement',updateReticle);window.addEventListener('omega-calibrated-sar-patch',updateReticle);window.addEventListener('resize',reserve);state.state='READY';reserve();}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
state.reserve=reserve;state.updateReticle=updateReticle;
