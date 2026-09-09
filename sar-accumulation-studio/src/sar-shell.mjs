import { haversineKm } from './atlas.mjs';
import { shellSimplex } from './calibration.mjs';

function bearingRad(lon0,lat0,lon,lat){
  const cos=Math.cos(Number(lat0)*Math.PI/180);
  const x=(Number(lon)-Number(lon0))*cos;
  const y=Number(lat)-Number(lat0);
  return (Math.atan2(y,x)+Math.PI*2)%(Math.PI*2);
}

export function measuredSpatialShell(neighbors,lon,lat){
  const clean=(neighbors||[])
    .filter(n=>n?.measured!==false&&Number.isFinite(Number(n?.value))&&Number.isFinite(Number(n?.lon))&&Number.isFinite(Number(n?.lat)))
    .map(n=>({...n,value:Number(n.value),lon:Number(n.lon),lat:Number(n.lat),distanceKm:haversineKm(lon,lat,n.lon,n.lat)}));
  if(clean.length<7)return {state:'SHELL_UNRESOLVED',reason:'Fewer than seven measured raster samples are available',measuredCount:clean.length};
  clean.sort((a,b)=>a.distanceKm-b.distanceKm);
  const center=clean[0];
  const sectors=Array(6).fill(null);
  for(const sample of clean.slice(1)){
    const angle=bearingRad(center.lon,center.lat,sample.lon,sample.lat);
    const sector=Math.floor(((angle+Math.PI/6)%(Math.PI*2))/(Math.PI/3));
    if(!sectors[sector]||sample.distanceKm<sectors[sector].distanceKm)sectors[sector]=sample;
  }
  if(sectors.some(x=>!x))return {state:'SHELL_UNRESOLVED',reason:'Measured raster neighborhood does not populate all six angular sectors',measuredCount:clean.length,populatedSectors:sectors.filter(Boolean).length};
  const amplitudes=[center.value,...sectors.map(s=>s.value)];
  const simplex=shellSimplex(amplitudes);
  return {
    state:'MEASURED_1_PLUS_6_HOST_SHELL',
    measured:true,
    inferred:false,
    center,
    sectors,
    amplitudes,
    ...simplex,
    geometry:'Center plus nearest measured sample in each of six angular sectors of the raster neighborhood. This is a host observer construction, not a claim that the terrain or radar pixels form a literal hexagonal lattice.',
    proof:{sourceSamples:7,allMeasured:true,syntheticSamples:0}
  };
}
