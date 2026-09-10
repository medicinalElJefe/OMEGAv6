import { WorldRenderer } from './render.mjs';

const $=s=>document.querySelector(s);
const map=$('#map'),wrap=map?.closest('.map-wrap');
let patch=null,sourceCanvas=null,panel=null,lensCanvas=null,lensCtx=null,collapsed=false;

// At exact local measurement scale the acquisition-swath outline is no longer useful:
// one distant footprint edge can cut across the whole screen and visually compete with
// the calibrated target. Keep the target point and measured patch, suppress only the
// broad record polygons once exact evidence owns the camera.
if(!WorldRenderer.prototype.__omegaExactVisualClosure){
  WorldRenderer.prototype.__omegaExactVisualClosure=true;
  const original=WorldRenderer.prototype.drawRecords;
  WorldRenderer.prototype.drawRecords=function(records,currentId,mode='earth',phase=0){
    const exact=this.sarOverlay?.patch?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH';
    const local=mode==='earth'&&exact&&Number(this.view?.scale)>=900;
    return original.call(this,local?[]:records,currentId,mode,phase);
  };
}

function exactScale(){return Number(globalThis.OMEGA_SAR_RENDERER?.view?.scale)>=900;}
function fmt(v,d=1){return Number.isFinite(Number(v))?Number(v).toFixed(d):'—';}
function ensurePanel(){
  if(!wrap||panel)return;
  const style=document.createElement('style');style.id='omegaExactLensStyle';style.textContent=`
  .omega-exact-lens{position:absolute;z-index:11;left:14px;top:145px;width:min(400px,38%);max-height:calc(100% - 250px);display:none;overflow:hidden;border-radius:14px;border:1px solid rgba(219,240,246,.22);background:linear-gradient(180deg,rgba(3,7,9,.94),rgba(4,8,11,.88));box-shadow:0 22px 70px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(20px) saturate(118%);font-family:Inter,Segoe UI,sans-serif;color:#eef5f7;pointer-events:auto}.omega-exact-lens[data-visible=true]{display:block}.omega-exact-lens header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border-bottom:1px solid rgba(255,255,255,.08)}.omega-exact-lens header div{min-width:0}.omega-exact-lens header b{display:block;font-size:10px;letter-spacing:.09em}.omega-exact-lens header span{display:block;margin-top:2px;font-size:7px;color:#8fa1a8;letter-spacing:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-exact-lens button{border:1px solid rgba(255,255,255,.15);border-radius:7px;background:rgba(255,255,255,.04);color:#dce8eb;padding:4px 6px;font:700 7px Inter,Segoe UI,sans-serif;letter-spacing:.06em;cursor:pointer}.omega-exact-lens-body{padding:9px}.omega-exact-lens-frame{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;border-radius:9px;border:1px solid rgba(228,244,248,.16);background:#020405}.omega-exact-lens-frame canvas{width:100%;height:100%;display:block;image-rendering:auto}.omega-exact-lens-frame:before,.omega-exact-lens-frame:after{content:'';position:absolute;pointer-events:none;background:rgba(241,250,252,.56)}.omega-exact-lens-frame:before{left:50%;top:0;width:1px;height:100%}.omega-exact-lens-frame:after{left:0;top:50%;width:100%;height:1px}.omega-exact-lens-target{position:absolute;left:50%;top:50%;width:13px;height:13px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.94);border-radius:50%;box-shadow:0 0 0 4px rgba(0,0,0,.18)}.omega-exact-lens-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;padding:8px 2px 1px}.omega-exact-lens-meta span{display:block;font-size:6px;color:#7f9299;letter-spacing:.09em}.omega-exact-lens-meta b{display:block;margin-top:2px;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-exact-lens-boundary{padding:7px 2px 1px;font-size:7px;line-height:1.35;color:#93a3a9}.omega-exact-lens[data-collapsed=true] .omega-exact-lens-body{display:none}@media(max-width:900px){.omega-exact-lens{left:10px;top:52px;width:min(330px,calc(100% - 78px));max-height:48%}}@media(max-width:620px){.omega-exact-lens{display:none!important}}
  `;document.head.append(style);
  panel=document.createElement('section');panel.id='omegaExactSarLens';panel.className='omega-exact-lens';panel.dataset.visible='false';panel.dataset.collapsed='false';panel.innerHTML='<header><div><b>EXACT SAR · MEASURED SOURCE LENS</b><span data-k="subtitle">CALIBRATED SENTINEL-1 GRD</span></div><button type="button" data-action="collapse">COLLAPSE</button></header><div class="omega-exact-lens-body"><div class="omega-exact-lens-frame"><canvas></canvas><i class="omega-exact-lens-target"></i></div><div class="omega-exact-lens-meta"><div><span>SOURCE WINDOW</span><b data-k="window">—</b></div><div><span>VALID MEASUREMENTS</span><b data-k="valid">—</b></div><div><span>GEOLOCATION</span><b data-k="geo">—</b></div><div><span>SOURCE SPACING</span><b data-k="spacing">—</b></div></div><div class="omega-exact-lens-boundary">Magnified source-pixel lens only. Map registration remains WGS84/product-GCP bound; display magnification does not create spatial detail or new measurements.</div></div>';
  wrap.append(panel);lensCanvas=panel.querySelector('canvas');lensCtx=lensCanvas.getContext('2d');panel.querySelector('[data-action=collapse]').onclick=()=>{collapsed=!collapsed;panel.dataset.collapsed=collapsed?'true':'false';panel.querySelector('[data-action=collapse]').textContent=collapsed?'EXPAND':'COLLAPSE';};
}
function refreshLens(){
  ensurePanel();if(!panel)return;const visible=!!patch&&!!sourceCanvas&&exactScale();panel.dataset.visible=visible?'true':'false';if(!visible)return;
  const size=Math.max(patch.width||1,patch.height||1);lensCanvas.width=size;lensCanvas.height=size;lensCtx.clearRect(0,0,size,size);const ox=(size-(patch.width||size))/2,oy=(size-(patch.height||size))/2;lensCtx.drawImage(sourceCanvas,ox,oy);
  panel.querySelector('[data-k=subtitle]').textContent=`${patch.polarization} ${patch.quantity} · PRODUCT LUT · ${patch.evidence?.grade||'MEASURED'}`;
  panel.querySelector('[data-k=window]').textContent=`${patch.width}×${patch.height} px`;
  panel.querySelector('[data-k=valid]').textContent=`${Number(patch.stats?.validCount||0).toLocaleString()} · SOURCE MEASURED`;
  panel.querySelector('[data-k=geo]').textContent=`${patch.geolocation?.quality||patch.geolocation?.method||'PRODUCT GCP'} · ${patch.geoMesh?.validNodeCount||0} nodes`;
  panel.querySelector('[data-k=spacing]').textContent=`${fmt(patch.product?.rangePixelSpacing)} m R · ${fmt(patch.product?.azimuthPixelSpacing)} m A`;
}
function updateReleaseLabels(){
  const h=$('#omegaEarthAwarenessHud header b');if(h)h.textContent='EARTH AWARENESS · R251';
  const runtime=globalThis.OMEGA_SAR_LIVE_PRECISION;if(runtime)runtime.release='R4-R251';
}
function install(){
  ensurePanel();updateReleaseLabels();
  window.addEventListener('omega-calibrated-sar-patch',event=>{const candidate=event.detail?.patch,canvas=event.detail?.canvas;if(candidate?.state==='CALIBRATED_SENTINEL1_TARGET_PATCH'&&candidate?.evidence?.measured===true&&canvas){patch=candidate;sourceCanvas=canvas;refreshLens();}});
  window.addEventListener('omega-calibrated-sar-patch-clear',()=>{patch=null;sourceCanvas=null;refreshLens();});
  map?.addEventListener('omega-map-view',refreshLens);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}

globalThis.OMEGA_EXACT_SAR_LENS={get patch(){return patch;},refresh:refreshLens,get collapsed(){return collapsed;}};
