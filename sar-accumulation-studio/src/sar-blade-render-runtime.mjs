import { WorldRenderer } from './render.mjs';
import { drawWarpTriangle } from './sar-blade-geometry.mjs';

if(!WorldRenderer.prototype.__omegaBladeTriangleWarp){
  WorldRenderer.prototype.__omegaBladeTriangleWarp=true;
  WorldRenderer.prototype._drawSarCell=function(image,s00,s10,s01,d00,d10,d01,d11){
    if(!image||![s00,s10,s01,d00,d10,d01,d11].every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)))return false;
    const s11=[s10[0],s01[1]];
    const a=drawWarpTriangle(this.ctx,image,[s00,s10,s11],[d00,d10,d11],{alpha:.97});
    const b=drawWarpTriangle(this.ctx,image,[s00,s11,s01],[d00,d11,d01],{alpha:.97});
    return a||b;
  };
}

globalThis.OMEGA_SAR_BLADE_RENDER={
  state:'ACTIVE',
  warp:'PIECEWISE_TWO_TRIANGLE_PER_GEOREGISTERED_CELL',
  fourthCorner:'EXPLICIT',
  semantics:'Each registered source cell is split into two affine blades. All four Earth corners are honored; no single-affine quad approximation is used.'
};
