const $=s=>document.querySelector(s);
const map=$('#map'),wrap=map?.closest('.map-wrap');
const PROOF_IDS=['omegaFieldHud','omegaCellInspector','omegaEarthAwarenessHud','omegaTemporalSyncHud','omegaGlobalSarFabricHud','omegaBladeLens'];
let proofStack=null,stageEl=null,observer=null,raf=0;
const state={state:'INITIALIZING',release:'R257',phase:'BOOT',detail:'',proofPanels:0,overlapPolicy:'RESERVED_ZONES_AND_SINGLE_STACK',progressiveLoading:true,updatedAt:null};
globalThis.OMEGA_SAR_R257_EXPERIENCE=state;

function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function exact(){const p=renderer()?.sarOverlay?.patch;return p?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&p?.evidence?.measured===true?p:null;}
function regional(){const r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT;return r?.state==='READY'&&r?.patch?.evidence?.measured===true?r:null;}
function terrain(){const t=globalThis.OMEGA_DATA_NATIVE_TERRAIN;return t?.state==='READY'?t:null;}
function humanStage(value){return String(value||'').replace(/^REGIONAL_/,'').replaceAll('_',' ').replace(/\bCOG\b/g,'COG').replace(/\bLUT\b/g,'LUT');}
function phase(){
  const e=exact(),r=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT,t=globalThis.OMEGA_DATA_NATIVE_TERRAIN,s=globalThis.OMEGA_DATA_NATIVE_SURFACE;
  if(e&&Math.min(e.width||0,e.height||0)>=240)return {phase:'EXACT HD',detail:`${e.width}×${e.height} measured · ${e.stats?.validCount?.toLocaleString?.()||0} valid`};
  if(e)return {phase:'EXACT',detail:`${e.width}×${e.height} measured · deep source read refining`};
  if(r?.state==='LOADING')return {phase:'MEASURED SAR',detail:humanStage(r.stage||'loading source data')};
  if(r?.state==='READY'&&r.patch)return {phase:'REGIONAL HD',detail:`${r.patch.width}×${r.patch.height} calibrated · ${terrain()?'terrain shaped':'terrain resolving'}`};
  if(t?.state==='LOADING')return {phase:'EARTH DETAIL',detail:humanStage(t.stage||'loading terrain')};
  if(s?.surface==='WORLD_RELIEF'&&t?.state==='READY')return {phase:'EARTH',detail:`DEM ${t.terrain?.width||0}×${t.terrain?.height||0} · select target for SAR`};
  return {phase:'READY',detail:'select a target · source context remains visible while measured detail resolves'};
}
function ensureStage(){
  const host=$('#omegaSarPrimaryControls');if(!host||stageEl)return false;
  stageEl=document.createElement('span');stageEl.id='omegaR257Stage';stageEl.className='omega-r257-stage';stageEl.innerHTML='<b>READY</b><span>progressive measured view</span>';host.prepend(stageEl);return true;
}
function ensureProofStack(){
  if(!wrap)return null;if(proofStack)return proofStack;
  proofStack=document.createElement('section');proofStack.id='omegaR257ProofStack';proofStack.className='omega-r257-proof-stack';proofStack.setAttribute('aria-label','OMEGA proof telemetry');wrap.append(proofStack);return proofStack;
}
function collectProofPanels(){
  const stack=ensureProofStack();if(!stack)return;
  for(const id of PROOF_IDS){const node=document.getElementById(id);if(node&&node!==stack&&node.parentElement!==stack)stack.append(node);}
  state.proofPanels=stack.children.length;
}
function applyStage(){
  cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
    ensureStage();collectProofPanels();const p=phase();state.phase=p.phase;state.detail=p.detail;state.updatedAt=new Date().toISOString();
    if(stageEl){stageEl.querySelector('b').textContent=p.phase;stageEl.querySelector('span').textContent=p.detail;stageEl.dataset.phase=p.phase.toLowerCase().replaceAll(' ','_');}
    document.body.dataset.r257Load=p.phase.includes('HD')||p.phase==='READY'||p.phase==='EARTH'?'settled':'progressive';
  });
}
function installStyle(){
  if($('#omegaR257ExperienceStyle'))return;const style=document.createElement('style');style.id='omegaR257ExperienceStyle';style.textContent=`
  body.omega-experience #omegaDataNativeBadge{display:none!important}
  .omega-r257-stage{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;column-gap:6px;min-width:210px;max-width:min(360px,29vw);height:28px;padding:0 8px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:rgba(255,255,255,.025);overflow:hidden}
  .omega-r257-stage b{font:800 7px Inter,Segoe UI,sans-serif;letter-spacing:.08em;color:#eef7f9;white-space:nowrap}.omega-r257-stage span{font:600 7px Inter,Segoe UI,sans-serif;color:#718187;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-r257-stage[data-phase*="measured"],.omega-r257-stage[data-phase*="exact"],.omega-r257-stage[data-phase*="regional"]{border-color:rgba(221,245,249,.16);background:rgba(218,242,246,.045)}
  body[data-r257-load=progressive] .omega-data-native-surface canvas{transition:opacity .30s ease,filter .30s ease;filter:contrast(1.015)}
  .omega-data-native-surface canvas,.omega-regional-sar-layer canvas,#map{transition:opacity .28s cubic-bezier(.2,.75,.2,1),filter .28s cubic-bezier(.2,.75,.2,1)}
  .omega-r257-proof-stack{position:absolute;z-index:42;right:52px;top:52px;width:min(390px,34vw);max-height:calc(100% - 118px);display:none;grid-auto-rows:min-content;gap:6px;overflow:auto;padding:6px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(4,7,8,.46);backdrop-filter:blur(18px) saturate(108%);box-shadow:0 16px 44px rgba(0,0,0,.24);pointer-events:none;scrollbar-width:thin}
  body.omega-experience[data-mode=proof] .omega-r257-proof-stack{display:grid!important;pointer-events:auto}
  body.omega-experience .omega-r257-proof-stack>#omegaFieldHud,body.omega-experience .omega-r257-proof-stack>#omegaCellInspector,body.omega-experience .omega-r257-proof-stack>#omegaEarthAwarenessHud,body.omega-experience .omega-r257-proof-stack>#omegaTemporalSyncHud,body.omega-experience .omega-r257-proof-stack>#omegaGlobalSarFabricHud,body.omega-experience .omega-r257-proof-stack>#omegaBladeLens{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;transform-origin:center!important;display:block!important;width:100%!important;max-width:none!important;min-width:0!important;max-height:180px!important;margin:0!important;opacity:.92!important;overflow:auto!important;box-sizing:border-box!important;pointer-events:auto!important}
  body.omega-experience .omega-r257-proof-stack>#omegaFieldHud{display:grid!important;grid-template-columns:minmax(130px,1.6fr) repeat(2,minmax(62px,.7fr))!important}.omega-r257-proof-stack>#omegaFieldHud>div:nth-of-type(n+4){display:none!important}.omega-r257-proof-stack>#omegaFieldHud small{grid-column:1/-1!important}
  body.omega-experience:not([data-mode=proof]) #omegaCellInspector{display:none!important}
  body.omega-experience[data-drawer] .omega-map-nav{opacity:0!important;pointer-events:none!important;transition:opacity .16s ease}
  body.omega-experience[data-drawer] .omega-r257-proof-stack{display:none!important}
  body.omega-experience .evidence-dock,body.omega-experience .mission-rail,body.omega-experience .analysis-deck{overscroll-behavior:contain}
  body.omega-experience .evidence-dock>.panel,body.omega-experience .analysis-deck>*{contain:layout paint}
  @media(max-width:1120px){.omega-r257-stage{max-width:240px;min-width:160px}.omega-r257-stage span{display:none}.omega-r257-proof-stack{width:min(340px,42vw)}}
  @media(max-width:760px){.omega-r257-stage{display:none}.omega-r257-proof-stack{right:6px;left:6px;top:46px;width:auto;max-height:42vh}.omega-r257-proof-stack>#omegaFieldHud{grid-template-columns:1fr 1fr!important}}
  `;document.head.append(style);
}
function install(){
  installStyle();ensureStage();ensureProofStack();collectProofPanels();applyStage();
  observer=new MutationObserver(()=>{collectProofPanels();ensureStage();});observer.observe(document.documentElement,{childList:true,subtree:true});
  const events=['omega-regional-sar-measurement','omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear','omega-data-native-terrain','omega-earth-awareness-update','omega-temporal-sync','omega-map-view','omega-map-select'];for(const name of events)(name.startsWith('omega-map')?map:window)?.addEventListener?.(name,applyStage);
  state.state='READY';
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(install),{once:true});else requestAnimationFrame(install);}
state.refresh=applyStage;state.collectProofPanels=collectProofPanels;
