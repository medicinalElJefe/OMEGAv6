/** R769: source-field multiscale tessellation, not measured space or historical donor renderer parity. */
import {renderAtlasFieldRasterR734,ATLAS_FIELD_RASTER_SCHEMA_R734} from './atlasFieldRasterR734.mjs';
export const SOURCE_TESSELLATION_SCHEMA_R769='OMEGA_SOURCE_FIELD_TESSELLATION_R769_V1';
export const SOURCE_TESSELLATION_SIZES_R769=Object.freeze([6,12,24]);
const SIDE=144,COUNT=20736,validAddress=n=>Number.isSafeInteger(n)&&n>=0&&n<COUNT;
const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
const hex=(r,g,b)=>'#'+[r,g,b].map(x=>clamp(Math.round(x),0,255).toString(16).padStart(2,'0')).join('');
export function navigateSourceTessellationR769(address,dy,dx){
 if(!validAddress(address)||![dy,dx].every(Number.isSafeInteger)||Math.abs(dy)>1||Math.abs(dx)>1)
  throw RangeError('R769 address or one-step navigation refused');
 const row=Math.floor(address/SIDE),col=address%SIDE;
 return clamp(row+dy,0,SIDE-1)*SIDE+clamp(col+dx,0,SIDE-1);
}
/** Reuse a verified R734 source raster so changing tile or address never recomputes the entire field. */
export function buildSourceTessellationR769(field,raster,address,tileSize=12){
 if(!validAddress(address)||!SOURCE_TESSELLATION_SIZES_R769.includes(tileSize))
  throw RangeError('R769 address or zoom size refused');
 if(!field||field.count!==COUNT||!(field.routeNext instanceof Uint32Array)||field.routeNext.length!==COUNT||
    !raster||raster.schema!==ATLAS_FIELD_RASTER_SCHEMA_R734||raster.addressCount!==COUNT||
    raster.width!==SIDE||raster.height!==SIDE||raster.sourceBound!==true||
    !(raster.values instanceof Float32Array)||raster.values.length!==COUNT||
    !(raster.rgba instanceof Uint8ClampedArray)||raster.rgba.length!==COUNT*4)
  throw TypeError('R769 complete computed source field and R734 raster required');
 const row=Math.floor(address/SIDE),col=address%SIDE;
 const originRow=Math.floor(row/tileSize)*tileSize,originCol=Math.floor(col/tileSize)*tileSize;
 const scale=Math.max(1e-9,raster.maximum-raster.minimum);
 const cells=[],edges=[];
 for(let y=0;y<tileSize;y++)for(let x=0;x<tileSize;x++){
  const a=(originRow+y)*SIDE+originCol+x,next=field.routeNext[a];
  if(!validAddress(next))throw Error('R769 invalid source successor at '+a);
  const value=raster.values[a],nextValue=raster.values[next];
  if(!Number.isFinite(value)||!Number.isFinite(nextValue))throw Error('R769 nonfinite source metric at '+a);
  const delta=nextValue-value,magnitude=clamp(Math.abs(delta)/scale,0,1);
  const k=a*4,r=raster.rgba[k],g=raster.rgba[k+1],b=raster.rgba[k+2];
  const shift=Math.sign(delta)*Math.round(60*magnitude);
  const first=hex(r,g,b),second=hex(r+shift,g+shift,b+shift);
  const nextCol=next%SIDE,nextRow=Math.floor(next/SIDE);
  const slash=(nextCol-(originCol+x))*(nextRow-(originRow+y))>=0;
  const triangles=slash?
   [{points:x+','+y+' '+(x+1)+','+y+' '+(x+1)+','+(y+1),fill:first},
    {points:x+','+y+' '+(x+1)+','+(y+1)+' '+x+','+(y+1),fill:second}]:
   [{points:x+','+y+' '+(x+1)+','+y+' '+x+','+(y+1),fill:first},
    {points:(x+1)+','+y+' '+(x+1)+','+(y+1)+' '+x+','+(y+1),fill:second}];
  cells.push({address:a,x,y,value,successor:next,delta,asymmetry:magnitude,triangles});
  if(nextCol>=originCol&&nextCol<originCol+tileSize&&nextRow>=originRow&&nextRow<originRow+tileSize&&next!==a)
   edges.push({from:a,to:next,x1:x+.5,y1:y+.5,x2:nextCol-originCol+.5,y2:nextRow-originRow+.5});
 }
 return {schema:SOURCE_TESSELLATION_SCHEMA_R769,channel:raster.channel,label:raster.label,
  tileSize,originRow,originCol,selectedAddress:address,sourceAddressCount:COUNT,
  cells,edges,sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  historicalRendererParity:false};
}
export function computeSourceTessellationR769(field,channel,address,tileSize=12){
 return buildSourceTessellationR769(field,renderAtlasFieldRasterR734(field,channel),address,tileSize);
}
export function serializeSourceTessellationSvgR769(tile,{showEdges=true}={}){
 if(!tile||tile.schema!==SOURCE_TESSELLATION_SCHEMA_R769||
    !SOURCE_TESSELLATION_SIZES_R769.includes(tile.tileSize)||
    !validAddress(tile.selectedAddress)||tile.cells?.length!==tile.tileSize**2||
    !Array.isArray(tile.edges)||typeof showEdges!=='boolean')
  throw TypeError('R769 valid computed tile required');
 const s=tile.tileSize;
 // Refuse malformed externally supplied tile objects before embedding attributes in a portable SVG.
 // This is SVG structural safety, not proof that a tile came from the historical donor.
 const safePoints=/^\d+,\d+ \d+,\d+ \d+,\d+$/;
 const safeFill=/^#[0-9a-f]{6}$/i;
 const validCell=(c,i)=>c&&c.address===(tile.originRow+Math.floor(i/s))*SIDE+tile.originCol+(i%s)&&
  c.x===i%s&&c.y===Math.floor(i/s)&&Array.isArray(c.triangles)&&c.triangles.length===2&&
  c.triangles.every(t=>t&&typeof t.points==='string'&&safePoints.test(t.points)&&
   typeof t.fill==='string'&&safeFill.test(t.fill));
 const validEdge=e=>e&&validAddress(e.from)&&validAddress(e.to)&&e.from!==e.to&&
  [e.x1,e.y1,e.x2,e.y2].every(v=>Number.isFinite(v)&&v>=0&&v<=s);
 if(!Number.isSafeInteger(tile.originRow)||!Number.isSafeInteger(tile.originCol)||
    tile.originRow<0||tile.originCol<0||tile.originRow+s>SIDE||tile.originCol+s>SIDE||
    tile.originRow%s!==0||tile.originCol%s!==0||
    Math.floor(tile.selectedAddress/SIDE)<tile.originRow||
    Math.floor(tile.selectedAddress/SIDE)>=tile.originRow+s||
    tile.selectedAddress%SIDE<tile.originCol||tile.selectedAddress%SIDE>=tile.originCol+s||
    !tile.cells.every(validCell)||!tile.edges.every(validEdge))
  throw TypeError('R769 invalid source tile geometry refused');
 const polygons=tile.cells.map(c=>c.triangles.map(t=>
  '<polygon points="'+t.points+'" fill="'+t.fill+'" data-address="'+c.address+'"/>').join('')).join('');
 const edges=showEdges?tile.edges.map(e=>
  '<line x1="'+e.x1+'" y1="'+e.y1+'" x2="'+e.x2+'" y2="'+e.y2+'" stroke="#fff" stroke-opacity=".38" stroke-width=".045" data-from="'+e.from+'" data-to="'+e.to+'"/>').join(''):'';
 const x=tile.selectedAddress%SIDE-tile.originCol,y=Math.floor(tile.selectedAddress/SIDE)-tile.originRow;
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+s+' '+s+'" width="'+(s*32)+'" height="'+(s*32)+'" role="img" aria-label="Source field tessellation"><title>OMEGA source field tessellation</title><desc>Computed atlas-address values, two triangles per cell; not a physical field or historical renderer proof.</desc>'+polygons+edges+'<rect x="'+(x+.04)+'" y="'+(y+.04)+'" width=".92" height=".92" fill="none" stroke="#fff" stroke-width=".08"/></svg>';
}
