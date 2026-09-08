import { geometryRings, unwrapRing, wrapLon } from './geometry.mjs';

export class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.view = { centerLon: 0, centerLat: 0, scale: 1 };
    this.drag = null;
    this.point = null;
    this.onPoint = null;
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
  }

  project(lon, lat) {
    let dlon = wrapLon(lon - this.view.centerLon);
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
    c.fillStyle = '#071017'; c.fillRect(0,0,this.w,this.h);
    this._graticule();
  }

  _graticule() {
    const c = this.ctx;
    c.lineWidth = 1; c.strokeStyle = 'rgba(150,180,195,.16)';
    c.font = '10px ui-monospace, monospace'; c.fillStyle = 'rgba(180,205,217,.5)';
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
    const [x0] = this.project(0,0); const [,y0] = this.project(0,0);
    c.strokeStyle = 'rgba(200,220,230,.25)';
    c.beginPath(); c.moveTo(0,y0); c.lineTo(this.w,y0); c.stroke();
    c.beginPath(); c.moveTo(x0,0); c.lineTo(x0,this.h); c.stroke();
  }

  drawRecords(records, currentId, mode='footprints') {
    const c = this.ctx;
    const total = Math.max(1, records.length);
    records.forEach((r) => {
      const current = r.id === currentId;
      const alpha = mode === 'density' ? Math.min(.5, .07 + .4/Math.sqrt(total)) : (current ? .8 : .20);
      c.lineWidth = current ? 2.4 : 1;
      c.strokeStyle = current ? 'rgba(227,248,255,.95)' : 'rgba(98,211,245,.55)';
      c.fillStyle = `rgba(${current ? '137,224,255' : '54,181,220'},${alpha})`;
      this._drawGeometry(r.geometry);
    });
    if (this.point) {
      const [x,y] = this.project(this.point.lon, this.point.lat);
      c.fillStyle='white'; c.beginPath(); c.arc(x,y,4,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(0,0,0,.8)'; c.stroke();
    }
  }

  _drawGeometry(geometry) {
    const c = this.ctx;
    for (const rawRing of geometryRings(geometry)) {
      const ring = unwrapRing(rawRing);
      if (!ring.length) continue;
      for (const shift of [-360,0,360]) {
        c.beginPath();
        ring.forEach(([lon,lat], i) => {
          const [x,y] = this.project(lon+shift,lat);
          if (i===0) c.moveTo(x,y); else c.lineTo(x,y);
        });
        c.closePath(); c.fill(); c.stroke();
      }
    }
  }

  _wire() {
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.18 : 1/1.18;
      this.view.scale = Math.max(1, Math.min(24, this.view.scale*factor));
      this.redraw?.();
    }, {passive:false});
    this.canvas.addEventListener('pointerdown', e => {
      this.canvas.setPointerCapture(e.pointerId);
      this.drag = {x:e.clientX,y:e.clientY,lon:this.view.centerLon,lat:this.view.centerLat};
    });
    this.canvas.addEventListener('pointermove', e => {
      if (!this.drag) return;
      const dx=e.clientX-this.drag.x, dy=e.clientY-this.drag.y;
      this.view.centerLon = wrapLon(this.drag.lon - dx / ((this.w/360)*this.view.scale));
      this.view.centerLat = Math.max(-80,Math.min(80,this.drag.lat + dy / ((this.h/180)*this.view.scale)));
      this.redraw?.();
    });
    this.canvas.addEventListener('pointerup', e => {
      const moved = this.drag && Math.hypot(e.clientX-this.drag.x,e.clientY-this.drag.y) > 4;
      this.drag = null;
      if (!moved) {
        const rect=this.canvas.getBoundingClientRect();
        const [lon,lat]=this.unproject(e.clientX-rect.left,e.clientY-rect.top);
        this.point={lon,lat}; this.onPoint?.(this.point); this.redraw?.();
      }
    });
  }
}
