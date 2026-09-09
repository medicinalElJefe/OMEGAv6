const map=document.querySelector('#map');
const wrap=map?.closest('.map-wrap');
const sceneEl=document.querySelector('#currentScene');
let overlayCanvas=null,ctx=null,patchState=null;
let view={centerLon:0,centerLat:0,scale:1};

function wrapLon(value){let x=Number(value);while(x>180)x-=360;while(x<-180)x+=360;return x;}
function project(lon,lat){
  const rect=overlayCanvas.getBoundingClientRect();
  const dlon=wrapLon(Number(lon)-view.centerLon);
  return [rect.width/2+dlon*(rect.width/360)*view.scale,rect.height/2-(Number(lat)-view.centerLat)*(rect.height/180)*view.scale];
}
function currentScene(){return (sceneEl?.textContent||'').trim();}
function resize(){
  if(!overlayCanvas)return;
  const rect=overlayCanvas.getBoundingClientRect(),dpr=Math.max(1,globalThis.devicePixelRatio||1);
  overlayCanvas.width=Math.max(1,Math.round(rect.width*dpr));overlayCanvas.height=Math.max(1,Math.round(rect.height*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);draw();
}
function sourceCopy(canvas){const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;copy.getContext('2d').drawImage(canvas,0,0);return copy;}
function triangleTransform(s0,s1,s2,d0,d1,d2){
  const [x0,y0]=s0,[x1,y1]=s1,[x2,y2]=s2,[u0,v0]=d0,[u1,v1]=d1,[u2,v2]=d2;
  const den=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);if(Math.abs(den)<1e-9)return null;
  const a=(u0*(y1-y2)+u1*(y2-y0)+u2*(y0-y1))/den,c=(u0*(x2-x1)+u1*(x0-x2)+u2*(x1-x0))/den,e=(u0*(x1*y2-x2*y1)+u1*(x2*y0-x0*y2)+u2*(x0*y1-x1*y0))/den;
  const b=(v0*(y1-y2)+v1*(y2-y0)+v2*(y0-y1))/den,d=(v0*(x2-x1)+v1*(x0-x2)+v2*(x1-x0))/den,f=(v0*(x1*y2-x2*y1)+v1*(x2*y0-x0*y2)+v2*(x0*y1-x1*y0))/den;
  return {a,b,c,d,e,f};
}
function drawTriangle(image,s0,s1,s2,d0,d1,d2){const t=triangleTransform(s0,s1,s2,d0,d1,d2);if(!t)return false;ctx.save();ctx.beginPath();ctx.moveTo(...d0);ctx.lineTo(...d1);ctx.lineTo(...d2);ctx.closePath();ctx.clip();ctx.globalAlpha=.96;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.transform(t.a,t.b,t.c,t.d,t.e,t.f);ctx.drawImage(image,0,0);ctx.restore();return true;}
function drawCell(image,s00,s10,s01,s11,d00,d10,d01,d11){return drawTriangle(image,s00,s10,s11,d00,d10,d11)||drawTriangle(image,s00,s11,s01,d00,d11,d01);}
function draw(){
  if(!ctx||!overlayCanvas)return;
  const rect=overlayCanvas.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);
  const patch=patchState?.patch,image=patchState?.image,mesh=patch?.geoMesh;
  if(!patch||currentScene()!==patch.id||!image||!mesh?.nodes||mesh.validNodeCount<4)return;
  const [x0,y0]=mesh.sourceWindow||patch.sourceWindow||[0,0],n=mesh.segments||mesh.nodes.length-1;let cells=0;
  for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
    const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];if(![q00,q10,q01,q11].every(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat)))continue;
    const d00=project(q00.lon,q00.lat),d10=project(q10.lon,q10.lat),d01=project(q01.lon,q01.lat),d11=project(q11.lon,q11.lat),s00=[q00.pixel-x0,q00.line-y0],s10=[q10.pixel-x0,q10.line-y0],s01=[q01.pixel-x0,q01.line-y0],s11=[q11.pixel-x0,q11.line-y0];if(drawCell(image,s00,s10,s01,s11,d00,d10,d01,d11))cells++;
  }
  if(!cells)return;
  const [tx,ty]=project(patch.target.lon,patch.target.lat);ctx.save();ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(tx,ty,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.98)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(tx,ty,5,0,Math.PI*2);ctx.stroke();
  const label=`CALIBRATED ${patch.polarization} · ${patch.quantity}`;ctx.font='600 11px Inter,Segoe UI,sans-serif';const w=ctx.measureText(label).width+18;ctx.fillStyle='rgba(8,10,12,.86)';ctx.fillRect(tx+12,ty-24,w,22);ctx.fillStyle='rgba(255,255,255,.96)';ctx.fillText(label,tx+21,ty-9);ctx.restore();
}

if(wrap){
  overlayCanvas=document.createElement('canvas');overlayCanvas.className='sar-earth-overlay';overlayCanvas.setAttribute('aria-hidden','true');wrap.append(overlayCanvas);ctx=overlayCanvas.getContext('2d');new ResizeObserver(resize).observe(wrap);resize();
  map.addEventListener('omega-map-view',event=>{const d=event.detail||{};if(Number.isFinite(d.centerLon)&&Number.isFinite(d.centerLat)&&Number.isFinite(d.scale)){view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale};draw();}});
  window.addEventListener('omega-calibrated-sar-patch',event=>{const {patch,canvas}=event.detail||{};if(!patch||!canvas||currentScene()!==patch.id)return;patchState={patch,image:sourceCopy(canvas)};draw();});
  window.addEventListener('omega-calibrated-sar-patch-clear',()=>{patchState=null;draw();});
  if(sceneEl)new MutationObserver(()=>{if(patchState?.patch?.id!==currentScene())patchState=null;draw();}).observe(sceneEl,{childList:true,subtree:true,characterData:true});
}
