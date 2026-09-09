import { geometryRings, unwrapRing, wrapLon } from './geometry.mjs';

const MAX_VIEW_SCALE=8192;

function centroidOfGeometry(geometry) {
  const points=[];
  for(const ring of geometryRings(geometry)) for(const [lon,lat] of ring) if(Number.isFinite(lon)&&Number.isFinite(lat)) points.push([lon,lat]);
  if(!points.length) return null;
  const anchor=points[0][0];
  let sx=0,sy=0;
  for(const [lon,lat] of points){let x=lon;while(x-anchor>180)x-=360;while(x-anchor<-180)x+=360;sx+=x;sy+=lat}
  return [wrapLon(sx/points.length),sy/points.length];
}

export class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.view = { centerLon: 0, centerLat: 0, scale: 1 };
    this.drag = null;
    this.point = null;
    this.onPoint = null;
    this.onViewChange = null;
    this.motionPhase = 0;
    this.baseImage = null;
    this.baseMeta = null;
    this.baseOpacity = 1;
    this.displayMode = 'earth';
    this.sarOverlay = null;
    this._lastSelectionAt = 0;
    this._lastPointerDownAt = 0;
    this._wire();
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(1, devicePixelRatio || 1);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.w = rect.width; this.h = rect.height;
    this.redraw?.();
    this._notifyView();
  }

  viewBounds(){
    const lonSpan=Math.min(360,360/this.view.scale);
    const latSpan=Math.min(180,180/this.view.scale);
    const minLon=this.view.centerLon-lonSpan/2,maxLon=this.view.centerLon+lonSpan/2;
    const minLat=Math.max(-90,this.view.centerLat-latSpan/2),maxLat=Math.min(90,this.view.centerLat+latSpan/2);
    if(minLon<-180||maxLon>180)return [-180,-90,180,90];
    return [minLon,minLat,maxLon,maxLat];
  }

  fitLocation(lon,lat,scale=180){
    this.view.centerLon=wrapLon(Number(lon));
    this.view.centerLat=Math.max(-85,Math.min(85,Number(lat)));
    this.view.scale=Math.max(1,Math.min(MAX_VIEW_SCALE,Number(scale)||180));
    this.redraw?.();this._notifyView();
  }

  fitBounds(bbox,{padding=1.55,minScale=1,maxScale=MAX_VIEW_SCALE}={}){
    if(!Array.isArray(bbox)||bbox.length!==4||!bbox.every(Number.isFinite))return false;
    let [minLon,minLat,maxLon,maxLat]=bbox;
    if(maxLat<=minLat)return false;
    let lonSpan=maxLon-minLon;
    if(lonSpan<0)lonSpan+=360;
    if(lonSpan<=0)return false;
    const centerLon=wrapLon(minLon+lonSpan/2),centerLat=(minLat+maxLat)/2;
    const paddedLon=Math.max(lonSpan*padding,0.0008),paddedLat=Math.max((maxLat-minLat)*padding,0.0005);
    const scaleLon=360/paddedLon,scaleLat=180/paddedLat;
    this.view.centerLon=centerLon;
    this.view.centerLat=Math.max(-85,Math.min(85,centerLat));
    this.view.scale=Math.max(minScale,Math.min(maxScale,Math.min(scaleLon,scaleLat)));
    this.redraw?.();this._notifyView();
    return true;
  }

  async setBaseImage(url, meta=null){
    if(!url){this.baseImage=null;this.baseMeta=null;this.redraw?.();return}
    const img=new Image();
    img.decoding='async';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Earth context image failed to load'));img.src=url});
    this.baseImage=img;this.baseMeta=meta;this.redraw?.();
  }

  setSarOverlay(patch,sourceCanvas){
    if(!patch||!sourceCanvas||!sourceCanvas.width||!sourceCanvas.height){this.sarOverlay=null;this.redraw?.();return}
    const copy=document.createElement('canvas');copy.width=sourceCanvas.width;copy.height=sourceCanvas.height;
    copy.getContext('2d').drawImage(sourceCanvas,0,0);
    this.sarOverlay={patch,image:copy};
    this.redraw?.();
  }

  clearSarOverlay(){this.sarOverlay=null;this.redraw?.();}

  project(lon, lat) {
    const dlon = wrapLon(lon - this.view.centerLon);
    const x = this.w / 2 + dlon * (this.w / 360) * this.view.scale;
    const y = this.h / 2 - (lat - this.view.centerLat) * (this.h / 180) * this.view.scale;
    return [x,y];
  }

  unproject(x, y) {
    const lon = wrapLon(this.view.centerLon + (x - this.w/2) / ((this.w/360)*this.view.scale));
    const lat = Math.max(-90, Math.min(90, this.view.centerLat - (y - this.h/2) / ((this.h/180)*this.view.scale)));
    return [lon, lat];
  }

  _drawBaseImage(){
    if(!this.baseImage)return false;
    const c=this.ctx,bbox=this.baseMeta?.bbox;
    c.save();c.globalAlpha=this.baseOpacity;
    if(Array.isArray(bbox)&&bbox.length===4&&bbox.every(Number.isFinite)){
      const [minLon,minLat,maxLon,maxLat]=bbox;
      const [x0,y0]=this.project(minLon,maxLat),[x1,y1]=this.project(maxLon,minLat);
      const w=x1-x0,h=y1-y0;
      if(Number.isFinite(w)&&Number.isFinite(h)&&Math.abs(w)>1&&Math.abs(h)>1)c.drawImage(this.baseImage,x0,y0,w,h);
      else c.drawImage(this.baseImage,0,0,this.w,this.h);
    }else c.drawImage(this.baseImage,0,0,this.w,this.h);
    c.restore();
    return true;
  }

  _drawSarCell(image,s00,s10,s01,d00,d10,d01,d11){
    const sx0=s00[0],sy0=s00[1],sx1=s10[0],sy1=s01[1];
    if(!(sx1>sx0&&sy1>sy0))return;
    const a=(d10[0]-d00[0])/(sx1-sx0),b=(d10[1]-d00[1])/(sx1-sx0);
    const cc=(d01[0]-d00[0])/(sy1-sy0),d=(d01[1]-d00[1])/(sy1-sy0);
    const e=d00[0]-a*sx0-cc*sy0,f=d00[1]-b*sx0-d*sy0;
    const c=this.ctx;c.save();
    c.beginPath();c.moveTo(d00[0],d00[1]);c.lineTo(d10[0],d10[1]);c.lineTo(d11[0],d11[1]);c.lineTo(d01[0],d01[1]);c.closePath();c.clip();
    c.globalAlpha=.96;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.transform(a,b,cc,d,e,f);c.drawImage(image,0,0);c.restore();
  }

  _drawSarOverlay(){
    const overlay=this.sarOverlay,mesh=overlay?.patch?.geoMesh;
    if(!overlay||!mesh?.nodes||mesh.validNodeCount<4)return false;
    const image=overlay.image,[x0,y0]=mesh.sourceWindow||overlay.patch.sourceWindow||[0,0];
    const n=mesh.segments||mesh.nodes.length-1;
    let cells=0;
    for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
      const q00=mesh.nodes[gy]?.[gx],q10=mesh.nodes[gy]?.[gx+1],q01=mesh.nodes[gy+1]?.[gx],q11=mesh.nodes[gy+1]?.[gx+1];
      if(![q00,q10,q01,q11].every(q=>Number.isFinite(q?.lon)&&Number.isFinite(q?.lat)))continue;
      const d00=this.project(q00.lon,q00.lat),d10=this.project(q10.lon,q10.lat),d01=this.project(q01.lon,q01.lat),d11=this.project(q11.lon,q11.lat);
      const s00=[q00.pixel-x0,q00.line-y0],s10=[q10.pixel-x0,q10.line-y0],s01=[q01.pixel-x0,q01.line-y0];
      this._drawSarCell(image,s00,s10,s01,d00,d10,d01,d11);cells++;
    }
    if(cells){
      const c=this.ctx,target=overlay.patch.target,[tx,ty]=this.project(target.lon,target.lat);
      c.save();c.strokeStyle='rgba(246,250,252,.98)';c.lineWidth=1.5;c.beginPath();c.arc(tx,ty,5,0,Math.PI*2);c.stroke();
      c.fillStyle='rgba(0,6,9,.80)';c.fillRect(tx+8,ty-20,170,18);c.fillStyle='rgba(244,248,250,.98)';c.font='600 10px Inter,Segoe UI,sans-serif';
      c.fillText(`CALIBRATED S1 ${overlay.patch.polarization} ${overlay.patch.quantity}`,tx+13,ty-7);c.restore();
    }
    return cells>0;
  }

  clear() {
    const c = this.ctx;
    c.clearRect(0,0,this.w,this.h);
    const hasEarth=this._drawBaseImage();
    if(!hasEarth){
      const g=c.createLinearGradient(0,0,0,this.h);
      g.addColorStop(0,'#061119');g.addColorStop(1,'#020507');c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    }else{
      c.fillStyle='rgba(0,5,8,.055)';c.fillRect(0,0,this.w,this.h);
    }
    if(this.displayMode==='earth')this._drawSarOverlay();
    if(!hasEarth||this.displayMode!=='earth')this._graticule(hasEarth?.08:.19);
  }

  _graticule(alpha=.12) {
    const c = this.ctx;
    c.lineWidth = 1; c.strokeStyle = `rgba(205,225,232,${alpha})`;
    c.font = '10px ui-monospace, monospace'; c.fillStyle = `rgba(230,240,244,${Math.min(.55,alpha*2.8)})`;
    for (let lat=-60; lat<=60; lat+=30) {
      const [,y] = this.project(this.view.centerLon, lat);
      c.beginPath(); c.moveTo(0,y); c.lineTo(this.w,y); c.stroke();
      c.fillText(`${lat}°`, 5, y-3);
    }
    for (let lon=-180; lon<180; lon+=30) {
      const [x] = this.project(lon, this.view.centerLat);
      if (x < 0 || x > this.w) continue;
      c.beginPath(); c.moveTo(x,0); c.lineTo(x,this.h); c.stroke();
      c.fillText(`${lon}°`, x+3, this.h-6);
    }
  }

  drawRecords(records, currentId, mode='earth', phase=0) {
    const c = this.ctx;
    const total = Math.max(1, records.length);
    records.forEach((r, index) => {
      const current = r.id === currentId;
      const recency = records.length <= 1 ? 1 : (index + 1) / records.length;
      if(mode==='earth'){
        c.lineWidth=current?1.4:.4;
        c.strokeStyle=current?'rgba(235,245,248,.58)':`rgba(210,225,230,${.018+.04*recency})`;
        c.fillStyle='rgba(0,0,0,0)';
        c.shadowBlur=0;
      }else{
        const alpha = mode === 'density' ? Math.min(.38, .035 + .46/Math.sqrt(total)) : current ? .48 : .035 + .13 * recency;
        c.lineWidth = current ? 1.8 : .7;
        if(current){
          const pulse=.65+.35*Math.sin(phase*Math.PI*2);
          c.strokeStyle = `rgba(235,251,255,${.72+.14*pulse})`;c.fillStyle = `rgba(55,191,219,${alpha})`;
          c.shadowColor='rgba(102,225,255,.45)';c.shadowBlur=5+5*pulse;
        } else {c.strokeStyle=`rgba(92,207,232,${.10+.22*recency})`;c.fillStyle=`rgba(57,182,216,${alpha})`;c.shadowBlur=0}
      }
      this._drawGeometry(r.geometry);c.shadowBlur=0;
    });
    const current=records.find(r=>r.id===currentId);
    if(current&&mode!=='earth')this._drawMotionBeacon(current,phase);
    if (this.point) {
      const [x,y] = this.project(this.point.lon, this.point.lat);
      c.fillStyle='white'; c.beginPath(); c.arc(x,y,3.5,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(0,0,0,.8)'; c.lineWidth=1; c.stroke();
      c.beginPath();c.arc(x,y,8+2*Math.sin(phase*Math.PI*2),0,Math.PI*2);c.strokeStyle='rgba(255,255,255,.45)';c.stroke();
    }
  }

  _drawMotionBeacon(record,phase){
    const center=centroidOfGeometry(record.geometry);if(!center)return;
    const [x,y]=this.project(center[0],center[1]);const c=this.ctx;const r=8+16*((phase+.15)%1);
    c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=`rgba(239,250,255,${.55*(1-phase)})`;c.lineWidth=1.2;c.stroke();
    c.beginPath();c.arc(x,y,3,0,Math.PI*2);c.fillStyle='rgba(255,255,255,.9)';c.fill();
  }

  _drawGeometry(geometry) {
    const c = this.ctx;
    for (const rawRing of geometryRings(geometry)) {
      const ring = unwrapRing(rawRing);if (!ring.length) continue;
      for (const shift of [-360,0,360]) {c.beginPath();ring.forEach(([lon,lat], i) => {const [x,y] = this.project(lon+shift,lat);if (i===0) c.moveTo(x,y); else c.lineTo(x,y)});c.closePath(); c.fill(); c.stroke();}
    }
  }

  _dispatch(name,detail){this.canvas.dispatchEvent(new CustomEvent(name,{detail,bubbles:false}));}

  _notifyView(){
    const detail={centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale,bbox:this.viewBounds()};
    this._dispatch('omega-map-view',detail);
    this.onViewChange?.(detail.bbox);
  }

  _selectClient(clientX,clientY){
    const rect=this.canvas.getBoundingClientRect();
    const [lon,lat]=this.unproject(clientX-rect.left,clientY-rect.top);
    this.point={lon,lat};
    this._lastSelectionAt=performance.now();
    this.onPoint?.(this.point);
    this._dispatch('omega-map-select',this.point);
    this.redraw?.();
  }

  _beginDrag(clientX,clientY){
    this.drag={x:clientX,y:clientY,lon:this.view.centerLon,lat:this.view.centerLat};
  }

  _moveDrag(clientX,clientY){
    if(!this.drag)return false;
    const dx=clientX-this.drag.x,dy=clientY-this.drag.y;
    this.view.centerLon=wrapLon(this.drag.lon-dx/((this.w/360)*this.view.scale));
    this.view.centerLat=Math.max(-80,Math.min(80,this.drag.lat+dy/((this.h/180)*this.view.scale)));
    this.redraw?.();
    this._dispatch('omega-map-view',{centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale,bbox:this.viewBounds()});
    return true;
  }

  _finishDrag(clientX,clientY,{selectOnClick=true}={}){
    if(!this.drag)return false;
    const moved=Math.hypot(clientX-this.drag.x,clientY-this.drag.y)>4;
    this.drag=null;
    if(!moved&&selectOnClick)this._selectClient(clientX,clientY);
    this._notifyView();
    return moved;
  }

  _wire() {
    this.canvas.style.touchAction='none';
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const factor=e.deltaY<0?1.35:1/1.35;
      this.view.scale=Math.max(1,Math.min(MAX_VIEW_SCALE,this.view.scale*factor));
      this.redraw?.();
      clearTimeout(this._viewTimer);
      this._viewTimer=setTimeout(()=>this._notifyView(),120);
    }, {passive:false});

    this.canvas.addEventListener('pointerdown', e => {
      if(e.pointerType==='mouse'&&e.button!==0)return;
      this._lastPointerDownAt=performance.now();
      this.canvas.setPointerCapture?.(e.pointerId);
      this._beginDrag(e.clientX,e.clientY);
    });
    this.canvas.addEventListener('pointermove', e => this._moveDrag(e.clientX,e.clientY));
    this.canvas.addEventListener('pointerup', e => this._finishDrag(e.clientX,e.clientY));
    this.canvas.addEventListener('pointercancel', () => {this.drag=null;this._notifyView()});
    this.canvas.addEventListener('lostpointercapture', () => {if(this.drag){this.drag=null;this._notifyView()}});

    this.canvas.addEventListener('mousedown', e => {
      if(e.button!==0)return;
      if(performance.now()-this._lastPointerDownAt<80)return;
      this._beginDrag(e.clientX,e.clientY);
    });
    window.addEventListener('mousemove', e => {if(!this.drag)return;this._moveDrag(e.clientX,e.clientY);});
    window.addEventListener('mouseup', e => {if(e.button!==0||!this.drag)return;this._finishDrag(e.clientX,e.clientY);});

    this.canvas.addEventListener('click', e => {
      if(performance.now()-this._lastSelectionAt<120)return;
      this._selectClient(e.clientX,e.clientY);
      this._notifyView();
    });
  }
}
