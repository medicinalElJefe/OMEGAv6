import { analyzeBladeLens, reverseFocusOffset } from './sar-blade-geometry.mjs';

const $=s=>document.querySelector(s);
let lastPatch=null,lastLens=null;

function fmt(v,d=2){return Number.isFinite(Number(v))?Number(v).toFixed(d):'—';}
function ensureHud(){
  const wrap=$('.map-wrap');if(!wrap)return null;
  let el=$('#omegaBladeLens');if(el)return el;
  const style=document.createElement('style');style.id='omegaBladeLensStyle';style.textContent=`
  .omega-blade-lens{position:absolute;z-index:7;left:14px;bottom:14px;min-width:250px;max-width:420px;padding:10px 12px;border-radius:11px;background:rgba(5,7,9,.82);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.15);box-shadow:0 14px 38px rgba(0,0,0,.34);pointer-events:none;color:#eef1f2;font-family:Inter,Segoe UI,sans-serif}.omega-blade-lens span{display:block;font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:#a7adb0}.omega-blade-lens b{display:block;margin-top:3px;font-size:11px}.omega-blade-lens small{display:block;margin-top:5px;font-size:9px;line-height:1.35;color:#abb1b4}.omega-blade-lens[data-state=ready]{border-color:rgba(235,239,241,.32)}@media(max-width:980px){.omega-blade-lens{left:12px;bottom:86px;right:12px;max-width:none;min-width:0}}
  `;document.head.append(style);
  el=document.createElement('div');el.id='omegaBladeLens';el.className='omega-blade-lens';el.innerHTML='<span>BLADE GEOMETRY · SOURCE ↔ EARTH</span><b>Waiting for registered SAR mesh</b><small>Exact reverse focus remains unavailable until source geolocation resolves.</small>';wrap.append(el);return el;
}

function publish(patch){
  const el=ensureHud();lastPatch=patch||null;lastLens=patch?.geoMesh?analyzeBladeLens(patch.geoMesh,patch.target):null;
  globalThis.OMEGA_SAR_BLADE_FOCUS={
    patchId:patch?.id||null,lens:lastLens,
    reverseEastNorth:(eastMeters,northMeters)=>reverseFocusOffset(lastLens,eastMeters,northMeters),
    semantics:'Reverse focus returns source pixel/line from local Earth ENU offsets through the inverse registered Jacobian. It does not invent SAR values.'
  };
  if(!el)return;
  if(lastLens?.state!=='BLADE_LENS_READY'){
    el.dataset.state='unresolved';el.innerHTML=`<span>BLADE GEOMETRY · SOURCE ↔ EARTH</span><b>Lens unresolved</b><small>${lastLens?.reason||'Registered patch required.'}</small>`;return;
  }
  const s=lastLens.principalMetersPerPixel,condition=lastLens.conditionNumber;
  el.dataset.state='ready';
  el.innerHTML=`<span>BLADE GEOMETRY · REVERSE FOCUS LENS</span><b>${fmt(s.minor)}–${fmt(s.major)} m/source px · κ ${fmt(condition,3)}</b><small>pixel axis ${fmt(lastLens.pixelAxisDeg,1)}° · line axis ${fmt(lastLens.lineAxisDeg,1)}° · inverse Jacobian armed · source coordinate ${fmt(lastLens.center.pixel,1)}, ${fmt(lastLens.center.line,1)}</small>`;
}

window.addEventListener('omega-calibrated-sar-patch',event=>publish(event.detail?.patch||null));
window.addEventListener('omega-calibrated-sar-patch-clear',()=>publish(null));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>ensureHud(),{once:true});else queueMicrotask(ensureHud);

globalThis.OMEGA_SAR_BLADE_LENS_RUNTIME={get patch(){return lastPatch;},get lens(){return lastLens;},analyze:publish};
