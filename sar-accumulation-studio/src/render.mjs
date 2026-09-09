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
    this.baseOpacity = .58;
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
    this.onViewChange?.(this.viewBounds());
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
    this.redraw?.();this.onViewChange?.(this.viewBounds());
  }

  async setBaseImage(url, meta=null){
    if(!url){this.baseImage=null;this.baseMeta=null;this.redraw?.();return}
    const img=new Image();img.crossOrigin='anonymous';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Satellite context image failed to load'));img.src=url});
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

  clear() {
    const c = this.ctx;
    c.clearRect(0,0,this.w,this.h);
    const g=c.createLinearGradient(0,0,0,this.h);
    g.addColorStop(0,'#061119');g.addColorStop(1,'#03070a');c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    if(this.baseImage){c.globalAlpha=this.baseOpacity;c.drawImage(this.baseImage,0,0,this.w,this.h);c.globalAlpha=1;c.fillStyle='rgba(2,8,12,.18)';c.fillRect(0,0,this.w,this.h)}
    this._graticule();
  }

  _graticule() {
    const c = this.ctx;
    c.lineWidth = 1; c.strokeStyle = 'rgba(180,205,215,.19)';
    c.font = '10px ui-monospace, monospace'; c.fillStyle = 'rgba(218,237,244,.58)';
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

  drawRecords(records, currentId, mode='footprints', phase=0) {
    const c = this.ctx;
    const total = Math.max(1, records.length);
    records.forEach((r, index) => {
      const current = r.id === currentId;
      const recency = records.length <= 1 ? 1 : (index + 1) / records.length;
      const alpha = mode === 'density' ? Math.min(.44, .045 + .52/Math.sqrt(total)) : current ? .63 : .05 + .17 * recency;
      c.lineWidth = current ? 2.2 : .8;
      if(current){
        const pulse=.65+.35*Math.sin(phase*Math.PI*2);
        c.strokeStyle = `rgba(248,253,255,${.75+.18*pulse})`;c.fillStyle = `rgba(70,205,235,${alpha})`;
        c.shadowColor='rgba(102,225,255,.78)';c.shadowBlur=10+10*pulse;
      } else {c.strokeStyle=`rgba(92,207,232,${.15+.34*recency})`;c.fillStyle=`rgba(57,182,216,${alpha})`;c.shadowBlur=0}
      this._drawGeometry(r.geometry);c.shadowBlur=0;
    });
    const current=records.find(r=>r.id===currentId);if(current)this._drawMotionBeacon(current,phase);
    if (this.point) {
      const [x,y] = this.project(this.point.lon, this.point.lat);
      c.fillStyle='white'; c.beginPath(); c.arc(x,y,4,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(0,0,0,.8)'; c.lineWidth=1; c.stroke();
      c.beginPath();c.arc(x,y,9+5*Math.sin(phase*Math.PI*2),0,Math.PI*2);c.strokeStyle='rgba(255,255,255,.42)';c.stroke();
    }
  }

  _drawMotionBeacon(record,phase){
    const center=centroidOfGeometry(record.geometry);if(!center)return;
    const [x,y]=this.project(center[0],center[1]);const c=this.ctx;const r=9+24*((phase+.15)%1);
    c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=`rgba(239,250,255,${.75*(1-phase)})`;c.lineWidth=1.4;c.stroke();
    const sweep=(phase*2-1)*42;c.beginPath();c.moveTo(x-54,y+sweep);c.lineTo(x+54,y+sweep);c.strokeStyle='rgba(170,242,255,.34)';c.lineWidth=1;c.stroke();
    c.beginPath();c.arc(x,y,3.2,0,Math.PI*2);c.fillStyle='rgba(255,255,255,.92)';c.fill();
  }

  _drawGeometry(geometry) {
    const c = this.ctx;
    for (const rawRing of geometryRings(geometry)) {
      const ring = unwrapRing(rawRing);if (!ring.length) continue;
      for (const shift of [-360,0,360]) {c.beginPath();ring.forEach(([lon,lat], i) => {const [x,y] = this.project(lon+shift,lat);if (i===0) c.moveTo(x,y); else c.lineTo(x,y)});c.closePath(); c.fill(); c.stroke();}
    }
  }

  _wire() {
    this.canvas.addEventListener('wheel', e => {e.preventDefault();const factor=e.deltaY<0?1.18:1/1.18;this.view.scale=Math.max(1,Math.min(24,this.view.scale*factor));this.redraw?.();clearTimeout(this._viewTimer);this._viewTimer=setTimeout(()=>this.onViewChange?.(this.viewBounds()),120)}, {passive:false});
    this.canvas.addEventListener('pointerdown', e => {this.canvas.setPointerCapture(e.pointerId);this.drag={x:e.clientX,y:e.clientY,lon:this.view.centerLon,lat:this.view.centerLat}});
    this.canvas.addEventListener('pointermove', e => {if(!this.drag)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;this.view.centerLon=wrapLon(this.drag.lon-dx/((this.w/360)*this.view.scale));this.view.centerLat=Math.max(-80,Math.min(80,this.drag.lat+dy/((this.h/180)*this.view.scale)));this.redraw?.()});
    this.canvas.addEventListener('pointerup', e => {const moved=this.drag&&Math.hypot(e.clientX-this.drag.x,e.clientY-this.drag.y)>4;this.drag=null;if(!moved){const rect=this.canvas.getBoundingClientRect();const [lon,lat]=this.unproject(e.clientX-rect.left,e.clientY-rect.top);this.point={lon,lat};this.onPoint?.(this.point);this.redraw?.()}this.onViewChange?.(this.viewBounds())});
  }
}
