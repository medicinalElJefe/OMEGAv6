import { WorldRenderer } from './render.mjs';

const $=s=>typeof document==='undefined'?null:document.querySelector(s);

export function formatAge(iso,now=Date.now()){
  const t=new Date(iso||'').getTime();
  if(!Number.isFinite(t))return '—';
  const seconds=Math.max(0,(Number(now)-t)/1000);
  if(seconds<90)return `${Math.round(seconds)}s`;
  if(seconds<3600)return `${Math.round(seconds/60)}m`;
  if(seconds<172800)return `${(seconds/3600).toFixed(seconds<36000?1:0)}h`;
  return `${(seconds/86400).toFixed(seconds<864000?1:0)}d`;
}

export function precisionTruth({overlay=null,sourceFrame=null,field=null}={}){
  const measured=overlay?.measurement===true;
  const source=!!sourceFrame?.src;
  const reconstructed=!!field?.cells?.length;
  return {
    measured,
    inferred:false,
    source,
    reconstructed,
    surface:measured?'CALIBRATED SAR':source?'SOURCE SAR':reconstructed?'Ω RECONSTRUCTION':'WAITING FOR SAR',
    measurementPromotion:measured
  };
}

function meshPerimeter(mesh){
  const rows=mesh?.nodes;if(!Array.isArray(rows)||rows.length<2)return [];
  const top=rows[0]||[],bottom=rows.at(-1)||[],right=rows.slice(1,-1).map(r=>r?.at(-1)),left=rows.slice(1,-1).reverse().map(r=>r?.[0]);
  return [...top,...right,...[...bottom].reverse(),...left].filter(n=>Number.isFinite(n?.lon)&&Number.isFinite(n?.lat));
}
function drawLine(renderer,nodes,{alpha=.34,width=1,dash=[]}={}){
  if(nodes.length<2)return;const c=renderer.ctx;c.save();c.beginPath();nodes.forEach((n,i)=>{const p=renderer.project(n.lon,n.lat);i?c.lineTo(...p):c.moveTo(...p)});c.strokeStyle=`rgba(238,248,251,${alpha})`;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.restore();
}
function drawPrecisionGeometry(renderer){
  const patch=renderer.sarOverlay?.patch,mesh=patch?.geoMesh;if(!patch||!mesh?.nodes||mesh.validNodeCount<4)return;
  const perimeter=meshPerimeter(mesh);drawLine(renderer,[...perimeter,perimeter[0]],{alpha:.70,width:1.25});
  if(renderer.view.scale>=1700){
    const rows=mesh.nodes;
    for(const row of rows)drawLine(renderer,row.filter(n=>Number.isFinite(n?.lon)&&Number.isFinite(n?.lat)),{alpha:.13,width:.7,dash:[2,3]});
    const cols=Math.max(...rows.map(r=>r?.length||0));
    for(let x=0;x<cols;x++)drawLine(renderer,rows.map(r=>r?.[x]).filter(n=>Number.isFinite(n?.lon)&&Number.isFinite(n?.lat)),{alpha:.13,width:.7,dash:[2,3]});
  }
  const target=patch.target;if(!Number.isFinite(target?.lon)||!Number.isFinite(target?.lat))return;
  const [x,y]=renderer.project(target.lon,target.lat),phase=Number(renderer.motionPhase)||0,c=renderer.ctx;
  c.save();c.translate(x,y);c.strokeStyle='rgba(249,253,255,.96)';c.lineWidth=1.2;
  const r=8+2*Math.sin(phase*Math.PI*2);c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();
  c.strokeStyle='rgba(235,248,252,.58)';c.beginPath();c.moveTo(-18,0);c.lineTo(-6,0);c.moveTo(6,0);c.lineTo(18,0);c.moveTo(0,-18);c.lineTo(0,-6);c.moveTo(0,6);c.lineTo(0,18);c.stroke();
  c.restore();
}

if(!WorldRenderer.prototype.__omegaR4LivePrecision){
  WorldRenderer.prototype.__omegaR4LivePrecision=true;
  const original=WorldRenderer.prototype._drawSarOverlay;
  WorldRenderer.prototype._drawSarOverlay=function(...args){const result=original.apply(this,args);drawPrecisionGeometry(this);return result;};
}

const runtime={
  release:'R4',state:'INITIALIZING',snapshot:null,lastEvent:null,startedAt:new Date().toISOString(),timer:null
};
globalThis.OMEGA_SAR_LIVE_PRECISION=runtime;

function sceneTime(){const value=($('#currentTime')?.textContent||'').trim();return value&&value!=='—'?value:null;}
function sceneId(){const value=($('#currentScene')?.textContent||'').trim();return value&&value!=='—'?value:null;}
function numericText(selector){const v=Number(String($(selector)?.textContent||'').replace(/[^0-9.\-]/g,''));return Number.isFinite(v)?v:null;}
function fieldSummary(){const f=globalThis.OMEGA_SAR_CONTINUOUS_FIELD,s=f?.summary||{};return {cells:f?.cells?.length||0,admitted:Number.isFinite(s.admittedFraction)?s.admittedFraction:null,anchors:f?.anchors?.count||0,channel:globalThis.OMEGA_SAR_FIELD_RUNTIME?.activeChannel||null};}
function snapshot(){
  const renderer=globalThis.OMEGA_SAR_RENDERER,overlay=globalThis.OMEGA_SAR_EARTH_OVERLAY||null,sourceFrame=globalThis.OMEGA_SAR_SOURCE_FRAME||null,field=globalThis.OMEGA_SAR_CONTINUOUS_FIELD||null;
  const truth=precisionTruth({overlay,sourceFrame,field}),time=sceneTime(),fs=fieldSummary(),view=renderer?.view||{};
  return {
    at:new Date().toISOString(),truth,sceneId:sceneId(),sceneTime:time,sceneAge:formatAge(time),observations:numericText('#obsCount')||0,
    sourceRegistration:sourceFrame?.registration||null,calibration:overlay?.geolocation||null,meshNodes:overlay?.cells||0,
    view:{centerLon:Number.isFinite(view.centerLon)?view.centerLon:null,centerLat:Number.isFinite(view.centerLat)?view.centerLat:null,scale:Number.isFinite(view.scale)?view.scale:null},
    field:fs,context:($('#contextStamp')?.textContent||'').trim()||'OFF',polling:($('#liveTag')?.textContent||'').trim()==='POLLING'
  };
}
function detailLabel(scale){const s=Number(scale)||1;if(s>=4000)return 'TARGET PIXEL';if(s>=1200)return 'LOCAL PATCH';if(s>=180)return 'REGIONAL SAR';if(s>=8)return 'MESOSCALE';return 'GLOBAL';}
function update(){
  const snap=snapshot();runtime.snapshot=snap;runtime.state=snap.truth.measured?'MEASURED':snap.truth.source?'SOURCE':snap.truth.reconstructed?'RECONSTRUCTED':'WAITING';
  const el=$('#omegaPrecisionStrip');if(el){
    el.dataset.state=runtime.state;el.querySelector('[data-k=utc]').textContent=new Date().toISOString().slice(11,19)+'Z';
    el.querySelector('[data-k=surface]').textContent=snap.truth.surface;
    el.querySelector('[data-k=age]').textContent=snap.sceneTime?`${snap.sceneAge} · ${snap.sceneTime.slice(0,10)}`:'—';
    el.querySelector('[data-k=detail]').textContent=detailLabel(snap.view.scale);
    el.querySelector('[data-k=mesh]').textContent=snap.truth.measured?`${snap.meshNodes||0} GEO NODES`:(snap.sourceRegistration||'UNBOUND');
    el.querySelector('[data-k=field]').textContent=snap.field.cells?`${snap.field.cells.toLocaleString()} CELLS · ${snap.field.anchors} ANCHORS`:'FIELD PENDING';
    const pulse=el.querySelector('.omega-precision-pulse');if(pulse)pulse.dataset.measured=snap.truth.measured?'true':'false';
  }
  window.dispatchEvent(new CustomEvent('omega-r4-precision-update',{detail:snap}));
}
function startWatchAfterTarget(){
  const live=$('#liveRefresh'),interval=$('#refreshInterval');if(!live||live.checked)return;
  if(interval)interval.value='300000';
  setTimeout(()=>{if(!live.checked&&sceneId()){live.checked=true;live.dispatchEvent(new Event('change',{bubbles:true}));}},900);
}
function install(){
  const wrap=$('.map-wrap');if(!wrap||$('#omegaPrecisionStrip'))return;
  const style=document.createElement('style');style.id='omegaPrecisionStyle';style.textContent=`
  .omega-precision-strip{position:absolute;z-index:10;left:50%;bottom:15px;transform:translateX(-50%);width:min(820px,66%);display:grid;grid-template-columns:auto repeat(5,minmax(92px,1fr));align-items:center;gap:0;border:1px solid rgba(255,255,255,.17);border-radius:15px;background:linear-gradient(180deg,rgba(7,10,12,.84),rgba(4,6,8,.74));backdrop-filter:blur(22px) saturate(120%);box-shadow:0 18px 55px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.035);overflow:hidden;pointer-events:none;color:#f3f7f8;font-family:Inter,Segoe UI,sans-serif}
  .omega-precision-strip>div{min-width:0;padding:9px 11px;border-left:1px solid rgba(255,255,255,.08)}.omega-precision-strip>div:first-of-type{border-left:0}.omega-precision-strip span{display:block;font-size:7px;font-weight:750;letter-spacing:.13em;color:#87969c}.omega-precision-strip b{display:block;margin-top:3px;font-size:9px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.omega-precision-pulse{width:8px;height:8px;margin:0 11px;border-radius:50%;background:#79878d;box-shadow:0 0 0 0 rgba(226,248,255,.28)}.omega-precision-pulse[data-measured=true]{background:#e8f8fb;animation:omegaPrecisionPulse 1.8s ease-out infinite}@keyframes omegaPrecisionPulse{0%{box-shadow:0 0 0 0 rgba(226,248,255,.28)}70%{box-shadow:0 0 0 9px rgba(226,248,255,0)}100%{box-shadow:0 0 0 0 rgba(226,248,255,0)}}
  .map-wrap:after{content:'';position:absolute;z-index:3;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 50%,transparent 0 26%,rgba(255,255,255,.018) 26.2% 26.5%,transparent 26.7%),linear-gradient(90deg,transparent 49.92%,rgba(255,255,255,.035) 50%,transparent 50.08%),linear-gradient(0deg,transparent 49.92%,rgba(255,255,255,.035) 50%,transparent 50.08%);mix-blend-mode:screen;opacity:.62}
  .omega-action-hud{bottom:79px!important;max-width:min(560px,44%)!important}.omega-cell-inspector{bottom:79px!important;max-width:420px!important}.map-hud{bottom:88px!important}.map-note{display:none!important}.earth-attribution{bottom:58px!important}.scale-readout{bottom:58px!important}
  @media(max-width:1100px){.omega-precision-strip{width:calc(100% - 26px);grid-template-columns:auto repeat(3,minmax(0,1fr))}.omega-precision-strip>div:nth-of-type(4),.omega-precision-strip>div:nth-of-type(5){display:none}.omega-action-hud{max-width:46%!important}.omega-cell-inspector{max-width:46%!important}}
  @media(max-width:760px){.omega-precision-strip{bottom:58px;grid-template-columns:auto repeat(2,minmax(0,1fr))}.omega-precision-strip>div:nth-of-type(3){display:none}.omega-precision-strip b{font-size:8px}.map-wrap:after{opacity:.36}.omega-action-hud{left:10px!important;right:10px!important;bottom:116px!important;max-width:none!important}.omega-cell-inspector{left:10px!important;right:10px!important;bottom:162px!important;max-width:none!important}.earth-attribution{bottom:102px!important}.scale-readout{bottom:78px!important}}
  @media(prefers-reduced-motion:reduce){.omega-precision-pulse[data-measured=true]{animation:none}}
  `;document.head.append(style);
  const el=document.createElement('div');el.id='omegaPrecisionStrip';el.className='omega-precision-strip';el.setAttribute('aria-label','R4 live SAR precision telemetry');
  el.innerHTML='<i class="omega-precision-pulse"></i><div><span>UTC NOW</span><b data-k="utc">—</b></div><div><span>PRIMARY SURFACE</span><b data-k="surface">WAITING FOR SAR</b></div><div><span>SAR FRAME AGE</span><b data-k="age">—</b></div><div><span>DETAIL</span><b data-k="detail">GLOBAL</b></div><div><span>GEO SUPPORT</span><b data-k="mesh">UNBOUND</b></div><div><span>Ω FIELD</span><b data-k="field">FIELD PENDING</b></div>';
  wrap.append(el);
  const events=['omega-source-sar-frame','omega-source-sar-visibility','omega-calibrated-sar-patch','omega-calibrated-sar-patch-clear','omega-map-view'];for(const name of events)window.addEventListener(name,()=>{runtime.lastEvent=name;update();});
  map?.addEventListener?.('omega-map-select',()=>{startWatchAfterTarget();update();});
  const point=$('#point');if(point)new MutationObserver(()=>{startWatchAfterTarget();update();}).observe(point,{childList:true,subtree:true,characterData:true});
  runtime.timer=setInterval(update,1000);update();
}

const map=$('#map');
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else queueMicrotask(install);}
