// R733: complete, source-bound 144 x 144 address raster of the R732 functional graph.
// Pixel (x,y) corresponds exactly to address y*144+x; colors are derived display encodings,
// not measured physics, authenticated source provenance, or historical renderer parity.
import {ROUTE_BASIN_SCHEMA_R732,ROUTE_BASIN_MAX_R732} from './routeBasinR732.mjs';
export const BASIN_RASTER_SCHEMA_R733='OMEGA_SOURCE_BASIN_RASTER_R733_V1';
export const BASIN_RASTER_SIDE_R733=144;
const validMode=m=>m==='basin'||m==='depth';
function basinColor(representative){
 let hash=Math.imul(representative+1,0x9e3779b1)>>>0;
 hash=(hash^(hash>>>16))>>>0;
 return [64+(hash&127),64+((hash>>>8)&127),64+((hash>>>16)&127)];
}
export function renderRouteBasinRasterR733(graph,mode='basin'){
 if(!graph||graph.schema!==ROUTE_BASIN_SCHEMA_R732||
    graph.nodeCount!==ROUTE_BASIN_MAX_R732||
    graph.basinOf?.length!==ROUTE_BASIN_MAX_R732||
    graph.depth?.length!==ROUTE_BASIN_MAX_R732||
    graph.entry?.length!==ROUTE_BASIN_MAX_R732||
    !Array.isArray(graph.cycles)||graph.cycles.length<1||
    !Number.isSafeInteger(graph.maxDepth)||graph.maxDepth<0||!validMode(mode))
  throw Error('R733 complete source basin graph or display mode refused');
 const rgba=new Uint8ClampedArray(ROUTE_BASIN_MAX_R732*4);
 for(let address=0;address<ROUTE_BASIN_MAX_R732;address++){
  const basin=graph.basinOf[address],depth=graph.depth[address],entry=graph.entry[address];
  const cycle=graph.cycles[basin];
  if(!cycle||!Number.isSafeInteger(depth)||depth<0||depth>graph.maxDepth||
     !Number.isSafeInteger(entry)||entry<0||entry>=ROUTE_BASIN_MAX_R732)
   throw Error('R733 invalid source basin state at '+address);
  const color=mode==='basin'?basinColor(cycle.representative):
   Array(3).fill(graph.maxDepth===0?240:Math.round(240-200*depth/graph.maxDepth));
  const k=address*4;
  rgba[k]=color[0];rgba[k+1]=color[1];rgba[k+2]=color[2];rgba[k+3]=255;
 }
 return {schema:BASIN_RASTER_SCHEMA_R733,mode,width:BASIN_RASTER_SIDE_R733,
  height:BASIN_RASTER_SIDE_R733,addressCount:ROUTE_BASIN_MAX_R732,
  rgba,sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  colorMeaning:mode==='basin'?'Cycle representative determines color':'Relative source-route steps to cycle determine grayscale'};
}
export function addressAtRasterPointR733(x,y,width=144,height=144){
 if(![x,y,width,height].every(Number.isFinite)||width<=0||height<=0||
    x<0||y<0||x>=width||y>=height)throw Error('R733 raster pointer outside image');
 const col=Math.min(143,Math.floor(x*144/width));
 const row=Math.min(143,Math.floor(y*144/height));
 return row*144+col;
}
