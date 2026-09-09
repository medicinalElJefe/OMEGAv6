import './location-ui.mjs';
import { geometryRings, unwrapRing, wrapLon } from './geometry.mjs';

const WORLD_COUNTRIES_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@ca96624a/geojson/ne_50m_admin_0_countries.geojson';

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
    this.baseOpacity = .64;
    this.worldFeatures = [];
    this.worldBoundaryState = 'loading';
    this._wire();
    this._loadWorldBoundaries();
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
  }

  _maxCenterLat(scale=this.view.scale){
    const halfSpan = 90 / Math.max(1, scale);
    return Math.max(0, 90 - halfSpan);
  }

  _clampView(){
    this.view.centerLon = wrapLon(Number(this.view.centerLon) || 0);
    this.view.scale = Math.max(1, Math.min(48, Number(this.view.scale) || 1));
    const maxLat = this._maxCenterLat();
    this.view.centerLat = Math.max(-maxLat, Math.min(maxLat, Number(this.view.centerLat) || 0));
  }

  async _loadWorldBoundaries(){
    try {
      const response = await fetch(WORLD_COUNTRIES_URL, { cache: 'force-cache' });
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const geojson = await response.json();
      this.worldFeatures = Array.isArray(geojson?.features) ? geojson.features : [];
      this.worldBoundaryState = this.worldFeatures.length ? 'ready' : 'empty';
    } catch {
      this.worldFeatures = [];
      this.worldBoundaryState = 'unavailable';
    }
    this.redraw?.();
    this._dispatch('omega-map-boundaries', { state:this.worldBoundaryState, count:this.worldFeatures.length, source:'Natural Earth 1:50m' });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(1, devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.w = Math.max(1, rect.width); this.h = Math.max(1, rect.height);
    this._clampView();
    this.redraw?.();
    this._notifyView();
  }

  viewBounds(){
    this._clampView();
    const lonSpan=Math.min(360,360/this.view.scale);
    const latSpan=Math.min(180,180/this.view.scale);
    const minLon=this.view.centerLon-lonSpan/2,maxLon=this.view.centerLon+lonSpan/2;
    const minLat=Math.max(-90,this.view.centerLat-latSpan/2),maxLat=Math.min(90,this.view.centerLat+latSpan/2);
    if(minLon < -180 || maxLon > 180) return [-180,minLat,180,maxLat];
    return [minLon,minLat,maxLon,maxLat];
  }

  fitLocation(lon,lat,scale=8){
    this.view.centerLon=wrapLon(Number(lon));
    this.view.scale=Math.max(1,Math.min(48,Number(scale)||8));
    this.view.centerLat=Number(lat);
    this._clampView();
    this.redraw?.(); this._notifyView();
  }

  async setBaseImage(url, meta=null){
    if(!url){this.baseImage=null;this.baseMeta=null;this.redraw?.();return}
    const img=new Image();img.crossOrigin='anonymous';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Satellite context image failed to load'));img.src=url});
    this.baseImage=img;this.baseMeta=meta;this.redraw?.();
  }

  project(lon, lat) {
    const dlon = wrapLon(Number(lon) - this.view.centerLon);
    const x = this.w / 2 + dlon * (this.w / 360) * this.view.scale;
    const y = this.h / 2 - (Number(lat) - this.view.centerLat) * (this.h / 180) * this.view.scale;
    return [x,y];
  }

  _projectRaw(lon,lat){
    const x = this.w / 2 + (Number(lon) - this.view.centerLon) * (this.w / 360) * this.view.scale;
    const y = this.h / 2 - (Number(lat) - this.view.centerLat) * (this.h / 180) * this.view.scale;
    return [x,y];
  }

  unproject(x, y) {
    const lon = wrapLon(this.view.centerLon + (x - this.w/2) / ((this.w/360)*this.view.scale));
    const lat = Math.max(-90, Math.min(90, this.view.centerLat - (y - this.h/2) / ((this.h/180)*this.view.scale)));
    return [lon, lat];
  }

  _drawBaseImage(){
    if(!this.baseImage) return;
    const c=this.ctx;
    const bbox=Array.isArray(this.baseMeta?.bbox)&&this.baseMeta.bbox.length===4?this.baseMeta.bbox:[-180,-90,180,90];
    const [minLon,minLat,maxLon,maxLat]=bbox.map(Number);
    if(![minLon,minLat,maxLon,maxLat].every(Number.isFinite)||maxLon<=minLon||maxLat<=minLat) return;
    c.save(); c.globalAlpha=this.baseOpacity;
    for(const shift of [-360,0,360]){
      const [x0,y0]=this._projectRaw(minLon+shift,maxLat);
      const [x1,y1]=this._projectRaw(maxLon+shift,minLat);
      const left=Math.min(x0,x1), top=Math.min(y0,y1), width=Math.abs(x1-x0), height=Math.abs(y1-y0);
      if(width<1||height<1||left>this.w||left+width<0||top>this.h||top+height<0) continue;
      c.drawImage(this.baseImage,left,top,width,height);
    }
    c.restore();
    c.fillStyle='rgba(2,8,12,.13)';c.fillRect(0,0,this.w,this.h);
  }

  clear() {
    const c = this.ctx;
    c.clearRect(0,0,this.w,this.h);
    const g=c.createLinearGradient(0,0,0,this.h);
    g.addColorStop(0,'#061119');g.addColorStop(1,'#03070a');c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
    this._drawBaseImage();
    this._worldBoundaries();
    this._graticule();
  }

  _worldBoundaries(){
    if(!this.worldFeatures.length) return;
    const c=this.ctx;
    c.save();
    c.lineWidth=this.view.scale>=8?.8:.55;
    c.strokeStyle=this.baseImage?'rgba(230,245,250,.35)':'rgba(152,189,202,.48)';
    c.fillStyle=this.baseImage?'rgba(220,238,244,.018)':'rgba(75,110,122,.08)';
    for(const feature of this.worldFeatures) this._drawGeometry(feature.geometry, {fill:true,stroke:true});
    c.restore();
  }

  _graticule() {
    const c = this.ctx;
    c.lineWidth = 1; c.strokeStyle = 'rgba(180,205,215,.19)';
    c.font = '10px ui-monospace, monospace'; c.fillStyle = 'rgba(218,237,244,.58)';
    const latStep=this.view.scale>=12?5:this.view.scale>=5?10:30;
    const lonStep=this.view.scale>=12?5:this.view.scale>=5?10:30;
    for (let lat=-90+latStep; lat<90; lat+=latStep) {
      const [,y] = this.project(this.view.centerLon, lat);
      if(y<0||y>this.h) continue;
      c.beginPath(); c.moveTo(0,y); c.lineTo(this.w,y); c.stroke();
      c.fillText(`${lat}°`, 5, Math.max(11,y-3));
    }
    for (let lon=-180; lon<180; lon+=lonStep) {
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
      if(x>=-20&&x<=this.w+20&&y>=-20&&y<=this.h+20){
        c.fillStyle='white'; c.beginPath(); c.arc(x,y,4,0,Math.PI*2); c.fill();
        c.strokeStyle='rgba(0,0,0,.8)'; c.lineWidth=1; c.stroke();
        c.beginPath();c.arc(x,y,9+5*Math.sin(phase*Math.PI*2),0,Math.PI*2);c.strokeStyle='rgba(255,255,255,.42)';c.stroke();
      }
    }
  }

  _drawMotionBeacon(record,phase){
    const center=centroidOfGeometry(record.geometry);if(!center)return;
    const [x,y]=this.project(center[0],center[1]);const c=this.ctx;const r=9+24*((phase+.15)%1);
    if(x<-80||x>this.w+80||y<-80||y>this.h+80)return;
    c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=`rgba(239,250,255,${.75*(1-phase)})`;c.lineWidth=1.4;c.stroke();
    const sweep=(phase*2-1)*42;c.beginPath();c.moveTo(x-54,y+sweep);c.lineTo(x+54,y+sweep);c.strokeStyle='rgba(170,242,255,.34)';c.lineWidth=1;c.stroke();
    c.beginPath();c.arc(x,y,3.2,0,Math.PI*2);c.fillStyle='rgba(255,255,255,.92)';c.fill();
  }

  _drawGeometry(geometry,{fill=true,stroke=true}={}) {
    const c = this.ctx;
    for (const rawRing of geometryRings(geometry)) {
      const ring = unwrapRing(rawRing);if (!ring.length) continue;
      for (const shift of [-360,0,360]) {
        c.beginPath();
        ring.forEach(([lon,lat], i) => {const [x,y] = this._projectRaw(lon+shift,lat);if (i===0) c.moveTo(x,y); else c.lineTo(x,y)});
        c.closePath(); if(fill)c.fill(); if(stroke)c.stroke();
      }
    }
  }

  _dispatch(name,detail){
    this.canvas.dispatchEvent(new CustomEvent(name,{detail,bubbles:false}));
  }

  _notifyView(){
    const detail={ centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale,bbox:this.viewBounds() };
    this._dispatch('omega-map-view',detail);
    this.onViewChange?.(detail.bbox);
  }

  _zoomAt(factor,x=this.w/2,y=this.h/2){
    const [anchorLon,anchorLat]=this.unproject(x,y);
    this.view.scale=Math.max(1,Math.min(48,this.view.scale*factor));
    this.view.centerLon=wrapLon(anchorLon-(x-this.w/2)/((this.w/360)*this.view.scale));
    this.view.centerLat=anchorLat+(y-this.h/2)/((this.h/180)*this.view.scale);
    this._clampView(); this.redraw?.(); this._notifyView();
  }

  _panByFraction(dxFraction,dyFraction){
    const lonSpan=360/this.view.scale,latSpan=180/this.view.scale;
    this.view.centerLon=wrapLon(this.view.centerLon+lonSpan*dxFraction);
    this.view.centerLat=this.view.centerLat+latSpan*dyFraction;
    this._clampView(); this.redraw?.(); this._notifyView();
  }

  _command(detail={}){
    const type=detail.type;
    if(type==='zoom-in') this._zoomAt(1.45);
    else if(type==='zoom-out') this._zoomAt(1/1.45);
    else if(type==='world') this.fitLocation(0,0,1);
    else if(type==='center-selected'&&this.point) this.fitLocation(this.point.lon,this.point.lat,Math.max(8,this.view.scale));
    else if(type==='pan-north') this._panByFraction(0,.25);
    else if(type==='pan-south') this._panByFraction(0,-.25);
    else if(type==='pan-east') this._panByFraction(.25,0);
    else if(type==='pan-west') this._panByFraction(-.25,0);
  }

  _wire() {
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const rect=this.canvas.getBoundingClientRect();
      this._zoomAt(e.deltaY<0?1.18:1/1.18,e.clientX-rect.left,e.clientY-rect.top);
    }, {passive:false});

    this.canvas.addEventListener('pointerdown', e => {
      if(e.pointerType==='mouse'&&e.button!==0)return;
      this.canvas.setPointerCapture?.(e.pointerId);
      this.drag={x:e.clientX,y:e.clientY,lon:this.view.centerLon,lat:this.view.centerLat,pointerId:e.pointerId};
    });

    this.canvas.addEventListener('pointermove', e => {
      const rect=this.canvas.getBoundingClientRect();
      const [hoverLon,hoverLat]=this.unproject(e.clientX-rect.left,e.clientY-rect.top);
      this._dispatch('omega-map-hover',{lon:hoverLon,lat:hoverLat});
      if(!this.drag)return;
      const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;
      this.view.centerLon=wrapLon(this.drag.lon-dx/((this.w/360)*this.view.scale));
      this.view.centerLat=this.drag.lat+dy/((this.h/180)*this.view.scale);
      this._clampView(); this.redraw?.();
      this._dispatch('omega-map-view',{centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale,bbox:this.viewBounds()});
    });

    const finishPointer=e=>{
      if(!this.drag)return;
      const moved=Math.hypot(e.clientX-this.drag.x,e.clientY-this.drag.y)>5;
      this.drag=null;
      if(!moved){
        const rect=this.canvas.getBoundingClientRect();const [lon,lat]=this.unproject(e.clientX-rect.left,e.clientY-rect.top);
        this.point={lon,lat};this.onPoint?.(this.point);this._dispatch('omega-map-select',this.point);this.redraw?.();
      }
      this._notifyView();
    };
    this.canvas.addEventListener('pointerup',finishPointer);
    this.canvas.addEventListener('pointercancel',()=>{this.drag=null;this._notifyView()});
    this.canvas.addEventListener('lostpointercapture',()=>{if(this.drag){this.drag=null;this._notifyView()}});
    this.canvas.addEventListener('mouseleave',()=>this._dispatch('omega-map-hover',{lon:null,lat:null}));
    this.canvas.addEventListener('omega-map-command',e=>this._command(e.detail));
  }
}
