const map=document.querySelector('#map');
const wrap=map?.closest('.map-wrap');
let overlayCanvas=null,ctx=null,patchState=null;
let view={centerLon:0,centerLat:0,scale:1};

function wrapLon(value){let x=Number(value);while(x>180)x-=360;while(x<-180)x+=360;return x;}
function project(lon,lat){
  const rect=overlayCanvas.getBoundingClientRect();
  const dlon=wrapLon(Number(lon)-view.centerLon);
  return [rect.width/2+dlon*(rect.width/360)*view.scale,rect.height/2-(Number(lat)-view.centerLat)*(rect.height/180)*view.scale];
}
function resize(){
  if(!overlayCanvas)return;
  const rect=overlayCanvas.getBoundingClientRect(),dpr=Math.max(1,globalThis.devicePixelRatio||1);
  overlayCanvas.width=Math.max(1,Math.round(rect.width*dpr));overlayCanvas.height=Math.max(1,Math.round(rect.height*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);draw();
}
function sourceCopy(canvas){
  const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;copy.getContext('2d').drawImage(canvas,0,0);return copy;
}
function affineCell(image,s00,s10,s01,d00,d10,d01,d11){
  const sx0=s00[0],sy0=s00[1],sx1=s10[0],sy1=s01[1];
  if(!(sx1>sx0&&sy1>sy0))return false;
  const a=(d10[0]-d00[0])/(sx1-sx0),b=(d10[1]-d00[1])/(sx1-sx0);
  const c=(d01[0]-d00[0])/(sy1-sy0),d=(d01[1]-d00[1])/(sy1-sy0);
  const e=d00[0]-a*sx0-c*sy0,f=d00[1]-b*sx0-d*sy0;
  ctx.save();ctx.beginPath();ctx.moveTo(...d00);ctx.lineTo(...d10);ctx.lineTo(...d11);ctx.lineTo(...d01);ctx.closePath();ctx.clip();
  ctx.globalAlpha=.94;ctx.imageSmoothingEnabled=true;ctx.transform(a,b,c,d,e,f);ctx.drawImage(image,0,0);ctx.restore();return true;
}
function draw(){
  if(!ctx||!overlayCanvas)return;
  const rect=overlayCanvas.getBoundingClientRect();ctx.clearRect(0,0,rect.width,rect.height);
  const patch=patchState?.patch,image=patchState?.image,mesh=patch?.geoMesh;
  if(!patch||!image||!mesh?.nodes||mesh.validNodeCount<4)return;
  const [x0,y0]=mesh.sourceWindow||patch.sourceWindow||[0,0],n=mesh.segments||mesh.nodes.length-1;
  let cells=0;
  for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
    const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];
    if(![q00,q10,q01,q11].every(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat)))continue;
    const d00=project(q00.lon,q00.lat),d10=project(q10.lon,q10.lat),d01=project(q01.lon,q01.lat),d11=project(q11.lon,q11.lat);
    const s00=[q00.pixel-x0,q00.line-y0],s10=[q10.pixel-x0,q10.line-y0],s01=[q01.pixel-x0,q01.line-y0];
    if(affineCell(image,s00,s10,s01,d00,d10,d01,d11))cells++;
  }
  if(!cells)return;
  const [tx,ty]=project(patch.target.lon,patch.target.lat);
  ctx.save();ctx.fillStyle='rgba(0,0,0,.52)';ctx.beginPath();ctx.arc(tx,ty,9,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.96)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(tx,ty,5,0,Math.PI*2);ctx.stroke();
  const label=`Sentinel-1 ${patch.polarization} · calibrated ${patch.quantity}`;ctx.font='600 11px Inter,Segoe UI,sans-serif';
  const w=ctx.measureText(label).width+18;ctx.fillStyle='rgba(8,12,14,.82)';ctx.fillRect(tx+12,ty-24,w,22);ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillText(label,tx+21,ty-9);ctx.restore();
}

if(wrap){
  overlayCanvas=document.createElement('canvas');overlayCanvas.className='sar-earth-overlay';overlayCanvas.setAttribute('aria-hidden','true');wrap.append(overlayCanvas);ctx=overlayCanvas.getContext('2d');
  new ResizeObserver(resize).observe(wrap);resize();
  map.addEventListener('omega-map-view',event=>{const d=event.detail||{};if(Number.isFinite(d.centerLon)&&Number.isFinite(d.centerLat)&&Number.isFinite(d.scale)){view={centerLon:d.centerLon,centerLat:d.centerLat,scale:d.scale};draw();}});
  window.addEventListener('omega-calibrated-sar-patch',event=>{const {patch,canvas}=event.detail||{};if(!patch||!canvas)return;patchState={patch,image:sourceCopy(canvas)};draw();});
  window.addEventListener('omega-calibrated-sar-patch-clear',()=>{patchState=null;draw();});
}
