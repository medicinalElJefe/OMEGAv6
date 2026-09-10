import { WorldRenderer } from './render.mjs';
import { sarAuthority } from './sar-authority.mjs';

const MAX_CONTEXT_OPACITY=.11;
const cameraSame=(a,b)=>!!a&&!!b&&Math.abs(Number(a.centerLon)-Number(b.centerLon))<1e-10&&Math.abs(Number(a.centerLat)-Number(b.centerLat))<1e-10&&Math.abs(Number(a.scale)-Number(b.scale))<1e-10;

if(!WorldRenderer.prototype.__omegaR4SarFirstRenderer){
  WorldRenderer.prototype.__omegaR4SarFirstRenderer=true;

  // Optical/context imagery is orientation context only. It is never allowed to
  // visually replace the SAR/OMEGA surface, even before the first source scene loads.
  const originalDrawBase=WorldRenderer.prototype._drawBaseImage;
  WorldRenderer.prototype._drawBaseImage=function(...args){
    if(Number(this.baseOpacity)>MAX_CONTEXT_OPACITY)this.baseOpacity=MAX_CONTEXT_OPACITY;
    return originalDrawBase.apply(this,args);
  };

  // A context image is accepted only if the camera that requested it is still the
  // camera being rendered when the bytes finish loading. This removes the old defect
  // where a newly displayed image represented an earlier/global bbox while click
  // inverse math used the newer/local camera.
  WorldRenderer.prototype.setBaseImage=async function(url,meta=null){
    if(!url){this.baseImage=null;this.baseMeta=null;this.redraw?.();return true;}
    const requested={centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale};
    const requestedAuthority=sarAuthority.capture();
    const img=new Image();img.decoding='async';
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Earth context image failed to load'));img.src=url;});
    const now={centerLon:this.view.centerLon,centerLat:this.view.centerLat,scale:this.view.scale};
    const authorityCameraOk=!requestedAuthority.camera||sarAuthority.accepts(requestedAuthority,{target:false,camera:true,scene:false});
    if(!cameraSame(requested,now)||!authorityCameraOk){sarAuthority.reject('context',{reason:'STALE_CAMERA_CONTEXT_REJECTED',requested,now});return false;}
    this.baseImage=img;this.baseMeta=meta;this.baseOpacity=Math.min(Number(this.baseOpacity)||MAX_CONTEXT_OPACITY,MAX_CONTEXT_OPACITY);this.redraw?.();return true;
  };
}

globalThis.OMEGA_SAR_RENDER_POLICY={mode:'SAR_FIRST',maxOpticalContextOpacity:MAX_CONTEXT_OPACITY,staleContextCommit:'REJECT'};
