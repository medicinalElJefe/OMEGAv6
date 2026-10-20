// R656: deterministic SVG rendering of R655 computed field cells.
// Geometry is an address grid, not an inferred physical spatial scene.
import {projectContinuityFieldR655} from './intrinsicFieldR655.js';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const unit=n=>Math.max(0,Math.min(1,n));
const byte=n=>Math.round(unit(n)*255).toString(16).padStart(2,'0');
export function renderIntrinsicSvgR656(input,options={}){
 const manifest=projectContinuityFieldR655(input,options);
 const cells=manifest.cells.map(c=>{
  const v=c.values;const red=unit(v.burden*0.5+v.asymmetry*0.5),green=unit(v.continuity*0.6+v.stability*0.4),blue=unit(v.contradiction*0.5+v.scar*0.5);
  const fill='#'+byte(red)+byte(green)+byte(blue);
  const r=c.rect;
  return '<rect x="'+r.x+'" y="'+r.y+'" width="'+r.width+'" height="'+r.height+'" fill="'+fill+'" stroke="#ffffff" stroke-opacity="0.15" stroke-width="0.4"><title>'+esc(c.id)+' C='+v.continuity+' burden='+v.burden+' contradiction='+v.contradiction+' scar='+v.scar+' symmetry='+v.symmetry+' asymmetry='+v.asymmetry+'</title></rect>';
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+manifest.width+' '+manifest.height+'" role="img" aria-label="OMEGA computed continuity field">'+'<desc>Address-grid projection of computed canonical state. Not physical-space imagery. Projection SHA256: '+manifest.projectionSha256+'</desc>'+cells+'</svg>';
 return {schema:'OMEGA_INTRINSIC_SVG_R656',truthClass:'LOCAL_COMPUTED_STATE_RENDER',svg,manifest,sourceProjectionSha256:manifest.projectionSha256,renderLaw:{red:'0.5 burden + 0.5 asymmetry',green:'0.6 continuity + 0.4 projected stability',blue:'0.5 contradiction + 0.5 scar',coordinateLaw:'index mapped to address-grid row and column'}};
}
