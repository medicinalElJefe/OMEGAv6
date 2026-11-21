// R892 one-to-one 192x108 raster address projection; exactly 20,736 pixels.
// This is an address/visualization mapping, NOT 20,736 physical dimensions or neural model instances.
export const R892_WIDTH=192,R892_HEIGHT=108,R892_PIXELS=20736;
export const R892_SCHEMA='OMEGA_SPHERE_EXACT_PIXEL_PROJECTION_R892';
export const R892_MODES=Object.freeze(['INNER_20736','OUTER_20736']);
export function rasterAddressR892(x,y,mode='INNER_20736'){
 if(!R892_MODES.includes(mode)||!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||x<0||x>=R892_WIDTH||y<0||y>=R892_HEIGHT)throw new RangeError('Invalid exact 20,736 pixel coordinate or projection mode');
 const address=y*R892_WIDTH+x;
 return Object.freeze({schema:R892_SCHEMA,mode,x,y,address,inner:mode==='INNER_20736'?address:null,outer:mode==='OUTER_20736'?address:null});
}
export function rasterCoordinateR892(address,mode='INNER_20736'){
 if(!R892_MODES.includes(mode)||!Number.isSafeInteger(address)||address<0||address>=R892_PIXELS)throw new RangeError('Invalid raster address/mode');
 return rasterAddressR892(address%R892_WIDTH,Math.floor(address/R892_WIDTH),mode);
}
export function pointerAddressR892(clientX,clientY,left,top,width,height,mode='INNER_20736'){
 for(const n of [clientX,clientY,left,top,width,height])if(!Number.isFinite(n))throw new RangeError('Invalid pixel viewport geometry');
 if(width<=0||height<=0)throw new RangeError('Viewport must have positive area');
 const x=Math.max(0,Math.min(R892_WIDTH-1,Math.floor((clientX-left)/width*R892_WIDTH)));
 const y=Math.max(0,Math.min(R892_HEIGHT-1,Math.floor((clientY-top)/height*R892_HEIGHT)));
 return rasterAddressR892(x,y,mode);
}
