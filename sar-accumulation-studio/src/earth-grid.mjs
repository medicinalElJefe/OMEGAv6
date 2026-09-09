import { haversineKm } from './atlas.mjs';

export const EARTH_GRID_PARTS = Object.freeze([
  '../data/earth-grid.part00.txt','../data/earth-grid.part01.txt','../data/earth-grid.part02.txt',
  '../data/earth-grid.part03.txt','../data/earth-grid.part04.txt','../data/earth-grid.part05.txt','../data/earth-grid.part06.txt'
]);

export const EARTH_GRID_SOURCE_SHA256 = '9cb8f332356a50622b2bc377b3b116ec2a977b1353dfe747ff44e7b0d13eefac';
export const EARTH_GRID_BOUNDARY = 'Stored 5-degree proxy-real Earth comparison grid; not raw DEM/GEBCO and not SAR measurement.';

let gridPromise = null;

function bytesFromBase64(text) {
  const binary = atob(text.replace(/\s+/g,''));
  const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  return bytes;
}

async function gunzip(bytes) {
  if (typeof DecompressionStream !== 'function') throw new Error('This browser does not expose DecompressionStream(gzip); Earth proxy grid remains unavailable without changing proof semantics.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function decodeEarthGridPayload(base64) {
  const raw = await gunzip(bytesFromBase64(base64));
  const grid = JSON.parse(new TextDecoder().decode(raw));
  validateEarthGrid(grid);
  return grid;
}

export function validateEarthGrid(grid) {
  if (!grid || grid.schema !== 'omega.earth.proxy-grid.compact.v1') throw new Error('Earth proxy grid schema mismatch');
  if (grid.sourceSha256 !== EARTH_GRID_SOURCE_SHA256) throw new Error('Earth proxy grid source digest mismatch');
  if (!Array.isArray(grid.rows) || grid.rows.length !== 2664) throw new Error('Earth proxy grid row-count mismatch');
  if (!Array.isArray(grid.grid) || grid.grid[8] !== 2664) throw new Error('Earth proxy grid geometry mismatch');
  return true;
}

export async function loadEarthGrid({ force=false }={}) {
  if (!gridPromise || force) {
    gridPromise = (async()=>{
      const texts = await Promise.all(EARTH_GRID_PARTS.map(async relative => {
        const url = new URL(relative, import.meta.url);
        const response = await fetch(url, { cache:'force-cache' });
        if (!response.ok) throw new Error(`Earth proxy grid part failed: ${response.status} ${url.pathname}`);
        return response.text();
      }));
      return decodeEarthGridPayload(texts.join(''));
    })();
  }
  return gridPromise;
}

function wrapLon(lon) {
  let x=((Number(lon)+180)%360+360)%360-180;
  if (Object.is(x,-0)) x=0;
  return x;
}

function gridCoordinate(value,min,max,step,count,{longitude=false}={}) {
  let v=longitude?wrapLon(value):Math.max(min,Math.min(max,Number(value)));
  let index=Math.round((v-min)/step);
  if(longitude) index=((index%count)+count)%count;
  else index=Math.max(0,Math.min(count-1,index));
  return {index,value:min+index*step};
}

export function decodeEarthGridRow(grid,rowIndex) {
  validateEarthGrid(grid);
  const row=grid.rows[rowIndex];
  if(!row) return null;
  const [latMin,,latStep,lonMin,,lonStep,latCount,lonCount]=grid.grid;
  const latIndex=Math.floor(rowIndex/lonCount), lonIndex=rowIndex%lonCount;
  const result={
    rowIndex,
    latitude_deg:latMin+latIndex*latStep,
    longitude_deg:lonMin+lonIndex*lonStep,
    sourceSha256:grid.sourceSha256,
    evidenceKind:'EARTH_PROXY_CONTEXT',
    measuredSar:false,
    rawDem:false,
    boundary:grid.boundary||EARTH_GRID_BOUNDARY
  };
  let offset=0;
  for(const field of grid.categoryFields){
    const categoryIndex=row[offset++];
    result[field]=grid.categories[field]?.[categoryIndex] ?? null;
  }
  for(const field of grid.numericFields) result[field]=row[offset++];
  return result;
}

export function nearestEarthProxyCell(grid,lon,lat) {
  validateEarthGrid(grid);
  const [latMin,latMax,latStep,lonMin,lonMax,lonStep,latCount,lonCount]=grid.grid;
  const latCell=gridCoordinate(lat,latMin,latMax,latStep,latCount);
  const lonCell=gridCoordinate(lon,lonMin,lonMax,lonStep,lonCount,{longitude:true});
  const rowIndex=latCell.index*lonCount+lonCell.index;
  const cell=decodeEarthGridRow(grid,rowIndex);
  return {
    ...cell,
    query:{lon:Number(lon),lat:Number(lat)},
    nearestGridDistanceKm:haversineKm(Number(lon),Number(lat),cell.longitude_deg,cell.latitude_deg),
    gridResolutionDegrees:latStep,
    exactGridHit:Math.abs(Number(lat)-cell.latitude_deg)<1e-9 && Math.abs(wrapLon(lon)-cell.longitude_deg)<1e-9
  };
}

export function earthProxyProof(cell) {
  if(!cell) return null;
  return {
    sourceSha256:cell.sourceSha256,
    rowIndex:cell.rowIndex,
    gridCoordinate:[cell.longitude_deg,cell.latitude_deg],
    nearestGridDistanceKm:cell.nearestGridDistanceKm,
    threadTier:cell.thread_tier,
    relativityThread:cell.relativity_thread,
    lens:cell.new_lens_type,
    reliefAlignment:cell.relief_alignment_score,
    evidenceKind:'EARTH_PROXY_CONTEXT',
    rawDem:false,
    measuredSar:false,
    boundary:cell.boundary
  };
}
