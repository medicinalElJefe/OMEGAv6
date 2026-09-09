import { geometryRings, unwrapRing, wrapLon } from './geometry.mjs';

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

  fitLocation(lon,lat,scale=8){
    this.view.centerLon=wrapLon(Number(lon));
    this.view.centerLat=Math.max(-85,Math.min(85,Number(lat)));
    this.view.scale=Math.max(1,Math.min(24,Number(scale)||8));
    this.redraw?.();this._notifyView();
  }

  async setBaseImage(url, meta=null){
    if(!url){this.baseImage=null;this.baseMeta=null;this.redraw?.();return}
    const img=new Image();
    img.decoding='async';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Earth context image failed to load'));img.src=url});
    this.baseImage=img;this.baseMeta=meta;this.redraw?.();
  }

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
        c.lineWidth=current?1.6:.45;
        c.strokeStyle=current?'rgba(210,248,255,.86)':`rgba(110,215,234,${.025+.06*recency})`;
        c.fillStyle=current?'rgba(57,184,210,.025)':'rgba(0,0,0,0)';
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
      const factor=e.deltaY<0?1.18:1/1.18;
      this.view.scale=Math.max(1,Math.min(24,this.view.scale*factor));
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
    window.addEventListener('mousemove', e => {
      if(!this.drag)return;
      this._moveDrag(e.clientX,e.clientY);
    });
    window.addEventListener('mouseup', e => {
      if(e.button!==0||!this.drag)return;
      this._finishDrag(e.clientX,e.clientY);
    });

    this.canvas.addEventListener('click', e => {
      if(performance.now()-this._lastSelectionAt<120)return;
      this._selectClient(e.clientX,e.clientY);
      this._notifyView();
    });
  }
}
