const $=s=>document.querySelector(s);
const map=$('#map');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
const wrapLon=v=>{let x=Number(v);while(x>180)x-=360;while(x<-180)x+=360;return x};
const state={state:'INITIALIZING',drag:null,raf:0,inertia:null,zoom:null,lastEmitAt:0,lastFrameAt:0,suppressClickUntil:0,frames:0,settles:0};
globalThis.OMEGA_SAR_SMOOTH_MOTION=state;

function renderer(){return globalThis.OMEGA_SAR_RENDERER||null;}
function emitFrame(r,now,force=false){
  r.redraw?.();state.frames++;
  if(force||now-state.lastEmitAt>=32){state.lastEmitAt=now;r._emitView?.();}
}
function commit(r){state.settles++;r._commitView?.();window.dispatchEvent(new CustomEvent('omega-camera-motion-settled',{detail:{view:{...r.view},at:new Date().toISOString()}}));}
function cancelAnimation(){if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;state.inertia=null;state.zoom=null;state.lastFrameAt=0;}
function schedule(){if(!state.raf)state.raf=requestAnimationFrame(step);}
function applyDrag(r,now){
  const d=state.drag;if(!d||!d.pending)return false;const p=d.pending,dx=p.x-d.startX,dy=p.y-d.startY;
  r.view.centerLon=wrapLon(d.startLon-dx/((r.w/360)*r.view.scale));r.view.centerLat=clamp(d.startLat+dy/((r.h/180)*r.view.scale),-85,85);d.pending=null;emitFrame(r,now);return true;
}
function applyZoom(r,now,dt){
  const z=state.zoom;if(!z)return false;const current=Math.max(1,Number(r.view.scale)||1),target=Math.max(1,Math.min(8192,z.scale)),alpha=1-Math.exp(-Math.max(1,dt)/54),next=current+(target-current)*alpha;
  r.view.scale=next;r.view.centerLon=wrapLon(z.anchorLon-(z.px-r.w/2)/((r.w/360)*next));r.view.centerLat=clamp(z.anchorLat+(z.py-r.h/2)/((r.h/180)*next),-85,85);emitFrame(r,now);
  if(Math.abs(Math.log(target/next))<.0015){r.view.scale=target;r.view.centerLon=wrapLon(z.anchorLon-(z.px-r.w/2)/((r.w/360)*target));r.view.centerLat=clamp(z.anchorLat+(z.py-r.h/2)/((r.h/180)*target),-85,85);state.zoom=null;emitFrame(r,now,true);commit(r);}
  return true;
}
function applyInertia(r,now,dt){
  const i=state.inertia;if(!i)return false;const decay=Math.exp(-Math.max(1,dt)/210);i.vx*=decay;i.vy*=decay;const dx=i.vx*dt,dy=i.vy*dt;
  r.view.centerLon=wrapLon(r.view.centerLon-dx/((r.w/360)*r.view.scale));r.view.centerLat=clamp(r.view.centerLat+dy/((r.h/180)*r.view.scale),-85,85);emitFrame(r,now);
  if(Math.hypot(i.vx,i.vy)<.018){state.inertia=null;emitFrame(r,now,true);commit(r);}
  return true;
}
function step(now){
  state.raf=0;const r=renderer();if(!r)return;const dt=state.lastFrameAt?Math.min(40,Math.max(1,now-state.lastFrameAt)):16.67;state.lastFrameAt=now;
  let active=false;if(state.drag?.pending)active=applyDrag(r,now)||active;if(!state.drag&&state.zoom)active=applyZoom(r,now,dt)||active;if(!state.drag&&!state.zoom&&state.inertia)active=applyInertia(r,now,dt)||active;
  if(state.drag||state.zoom||state.inertia||active)schedule();else state.lastFrameAt=0;
}
function relativePoint(e,r){const rect=r.canvas.getBoundingClientRect();return {px:clamp(e.clientX-rect.left,0,r.w),py:clamp(e.clientY-rect.top,0,r.h)};}
function onWheel(e){
  const r=renderer();if(!r)return;e.preventDefault();e.stopImmediatePropagation();if(state.drag)return;state.inertia=null;
  const {px,py}=relativePoint(e,r),[anchorLon,anchorLat]=r.unproject(px,py),unit=e.deltaMode===1?16:e.deltaMode===2?120:1,delta=clamp(e.deltaY*unit,-420,420),factor=Math.exp(-delta*.00155),base=state.zoom?.scale||r.view.scale;
  state.zoom={scale:clamp(base*factor,1,8192),anchorLon,anchorLat,px,py};state.state='SMOOTH_ZOOM';schedule();
}
function onPointerDown(e){
  const r=renderer();if(!r||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();e.stopImmediatePropagation();cancelAnimation();const now=performance.now();state.drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,startLon:r.view.centerLon,startLat:r.view.centerLat,lastX:e.clientX,lastY:e.clientY,lastT:now,vx:0,vy:0,pending:null,moved:false};state.state='DRAGGING';r.canvas.style.cursor='grabbing';r.canvas.dataset.dragging='true';r.canvas.focus({preventScroll:true});r.canvas.setPointerCapture?.(e.pointerId);
}
function onPointerMove(e){
  const d=state.drag;if(!d||e.pointerId!==d.id)return;e.preventDefault();e.stopImmediatePropagation();const now=performance.now(),dt=Math.max(1,now-d.lastT),vx=(e.clientX-d.lastX)/dt,vy=(e.clientY-d.lastY)/dt;d.vx=.72*d.vx+.28*vx;d.vy=.72*d.vy+.28*vy;d.lastX=e.clientX;d.lastY=e.clientY;d.lastT=now;d.pending={x:e.clientX,y:e.clientY};d.moved=d.moved||Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>4;schedule();
}
function finishPointer(e,cancel=false){
  const r=renderer(),d=state.drag;if(!r||!d||(!cancel&&e.pointerId!==d.id))return;if(e?.preventDefault)e.preventDefault();if(e?.stopImmediatePropagation)e.stopImmediatePropagation();if(!cancel){d.pending={x:e.clientX,y:e.clientY};applyDrag(r,performance.now());}
  state.drag=null;delete r.canvas.dataset.dragging;r.canvas.style.cursor='grab';state.suppressClickUntil=performance.now()+450;
  if(!cancel&&!d.moved){r._selectClient?.(e.clientX,e.clientY);state.inertia=null;state.state='SETTLED';commit(r);return;}
  const speed=Math.hypot(d.vx,d.vy);if(!cancel&&speed>.045){state.inertia={vx:d.vx,vy:d.vy};state.state='INERTIA';schedule();}else{state.inertia=null;state.state='SETTLED';commit(r);}
}
function onClick(e){if(performance.now()<state.suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}}
function onDblClick(e){const r=renderer();if(!r)return;e.preventDefault();e.stopImmediatePropagation();state.suppressClickUntil=performance.now()+500;const {px,py}=relativePoint(e,r),[anchorLon,anchorLat]=r.unproject(px,py);state.inertia=null;state.zoom={scale:clamp(r.view.scale*2,1,8192),anchorLon,anchorLat,px,py};state.state='SMOOTH_ZOOM';schedule();}
function suppressLegacyMouse(e){if(state.drag||performance.now()<state.suppressClickUntil||e.type==='mousedown'){e.preventDefault();e.stopImmediatePropagation();}}
function install(){
  if(!map||map.dataset.omegaSmoothMotion==='true')return;map.dataset.omegaSmoothMotion='true';map.addEventListener('wheel',onWheel,{capture:true,passive:false});map.addEventListener('pointerdown',onPointerDown,{capture:true});map.addEventListener('pointermove',onPointerMove,{capture:true});map.addEventListener('pointerup',e=>finishPointer(e,false),{capture:true});map.addEventListener('pointercancel',e=>finishPointer(e,true),{capture:true});map.addEventListener('mousedown',suppressLegacyMouse,{capture:true});map.addEventListener('click',onClick,{capture:true});map.addEventListener('dblclick',onDblClick,{capture:true});state.state='READY';
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);}
state.cancel=cancelAnimation;state.install=install;
