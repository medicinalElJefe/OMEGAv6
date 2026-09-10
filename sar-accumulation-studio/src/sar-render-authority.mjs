import { WorldRenderer } from './render.mjs';
import { sarAuthority } from './sar-authority.mjs';

const MAX_CONTEXT_OPACITY=.11;
const cameraSame=(a,b)=>!!a&&!!b&&Math.abs(Number(a.centerLon)-Number(b.centerLon))<1e-10&&Math.abs(Number(a.centerLat)-Number(b.centerLat))<1e-10&&Math.abs(Number(a.scale)-Number(b.scale))<1e-10;
const bboxSame=(a,b,eps=2e-8)=>Array.isArray(a)&&Array.isArray(b)&&a.length===4&&b.length===4&&a.every((v,i)=>Number.isFinite(Number(v))&&Number.isFinite(Number(b[i]))&&Math.abs(Number(v)-Number(b[i]))<=eps);

if(!WorldRenderer.prototype.__omegaR4SarFirstRenderer){
  WorldRenderer.prototype.__omegaR4SarFirstRenderer=true;

  // Optical/context imagery is orientation context only. It is never allowed to
  // visually replace the SAR/OMEGA surface, even before the first source scene loads.
  const originalDrawBase=WorldRenderer.prototype._drawBaseImage;
  WorldRenderer.prototype._drawBaseImage=function(...args){
    if(Number(this.baseOpacity)>MAX_CONTEXT_OPACITY)this.baseOpacity=MAX_CONTEXT_OPACITY;
    return originalDrawBase.apply(this,args);
  };

  // A context image is accepted only if BOTH the requesting camera and requested bbox
  // are still the active camera when its bytes finish loading. The bbox check is
  // essential: an old scheduled GIBS request can begin after the camera already moved.
  WorldRenderer.prototype.setBaseImage=async function(url,meta=null){
    if(!url){this.baseImage=null;this.baseMeta=null;this.redraw?.();return true;}
    const requested={centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale};
    const requestedBbox=Array.isArray(meta?.bbox)?[...meta.bbox]:null;
    const requestedAuthority=sarAuthority.capture();
    const img=new Image();img.decoding='async';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Earth context image failed to load'));img.src=url;});
    const now={centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale},nowBbox=this.viewBounds?.();
    const authorityCameraOk=!requestedAuthority.camera||sarAuthority.accepts(requestedAuthority,{target:false,camera:true,scene:false});
    const bboxOk=!requestedBbox||bboxSame(requestedBbox,nowBbox);
    if(!cameraSame(requested,now)||!authorityCameraOk||!bboxOk){
      sarAuthority.reject('context',{reason:'STALE_CAMERA_CONTEXT_REJECTED',requested,now,requestedBbox,nowBbox});
      const error=new Error('Stale Earth context rejected because the authoritative SAR camera changed');error.code='OMEGA_STALE_CONTEXT';throw error;
    }
    this.baseImage=img;this.baseMeta=meta;this.baseOpacity=Math.min(Number(this.baseOpacity)||MAX_CONTEXT_OPACITY,MAX_CONTEXT_OPACITY);this.redraw?.();return true;
  };
}

globalThis.OMEGA_SAR_RENDER_POLICY={mode:'SAR_FIRST',maxOpticalContextOpacity:MAX_CONTEXT_OPACITY,staleContextCommit:'REJECT_CAMERA_AND_BBOX'};
