const R_EARTH_KM = 6371.0088;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export const ATLAS_LEVELS = [12, 144, 1728, 20736];

export function haversineKm(lon1, lat1, lon2, lat2) {
  const toRad = d => d * Math.PI / 180;
  const p1=toRad(lat1), p2=toRad(lat2), dp=toRad(lat2-lat1), dl=toRad(lon2-lon1);
  const a=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*R_EARTH_KM*Math.asin(Math.min(1,Math.sqrt(a)));
}

export function nominalCellScaleKm(count) {
  return Math.sqrt((4*Math.PI*R_EARTH_KM*R_EARTH_KM)/Number(count));
}

export function fibonacciCellCenter(index, count) {
  const n=Number(count), i=Math.max(0,Math.min(n-1,Number(index)));
  const z=1-2*(i+.5)/n;
  const lat=Math.asin(z)*180/Math.PI;
  const lon=((i*GOLDEN_ANGLE*180/Math.PI+180)%360)-180;
  return {lon,lat};
}

export function atlasAddress(lon, lat, count) {
  const n=Number(count);
  if(!ATLAS_LEVELS.includes(n)) throw new Error(`Unsupported Atlas level ${count}`);
  const z=Math.sin(Number(lat)*Math.PI/180);
  const guess=Math.max(0,Math.min(n-1,Math.round(((1-z)*n/2)-.5)));
  const span=Math.max(16,Math.ceil(2*Math.sqrt(n)));
  let best={index:guess,distanceKm:Infinity,center:fibonacciCellCenter(guess,n)};
  for(let i=Math.max(0,guess-span);i<=Math.min(n-1,guess+span);i++){
    const center=fibonacciCellCenter(i,n);
    const d=haversineKm(lon,lat,center.lon,center.lat);
    if(d<best.distanceKm) best={index:i,distanceKm:d,center};
  }
  return {
    level:n,
    address:`A${n}-F${String(best.index).padStart(String(n-1).length,'0')}`,
    index:best.index,
    center:best.center,
    distanceToCenterKm:best.distanceKm,
    nominalScaleKm:nominalCellScaleKm(n)
  };
}

export function atlasHierarchy(lon, lat) {
  return ATLAS_LEVELS.map(level=>atlasAddress(lon,lat,level));
}

function median(values){
  const v=values.filter(Number.isFinite).slice().sort((a,b)=>a-b);if(!v.length)return null;
  const m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;
}

function evidenceWeight(grade){return ({A:1,B:.82,C:.55}[grade]||.45)}
function clamp01(v){return Math.max(0,Math.min(1,v))}

function uniqueSpatialCount(anchors){
  const seen=new Set(anchors.map(a=>`${Number(a.lon).toFixed(5)},${Number(a.lat).toFixed(5)}`));
  return seen.size;
}

function weightedEstimate(anchors, target, radiusKm, tauHours) {
  const provisional=[];
  for(const a of anchors){
    if(!Number.isFinite(a.value)||!Number.isFinite(a.lon)||!Number.isFinite(a.lat))continue;
    const distanceKm=haversineKm(target.lon,target.lat,a.lon,a.lat);
    const dtHours=target.time&&a.time?Math.abs(new Date(target.time)-new Date(a.time))/3600000:0;
    if(distanceKm>radiusKm*3)continue;
    const spatial=Math.exp(-.5*(distanceKm/radiusKm)**2);
    const temporal=Math.exp(-dtHours/Math.max(1,tauHours));
    const q=evidenceWeight(a.grade);
    provisional.push({...a,distanceKm,dtHours,baseWeight:spatial*temporal*q});
  }
  if(!provisional.length)return null;
  const center=median(provisional.map(a=>a.value));
  const absResiduals=provisional.map(a=>Math.abs(a.value-center));
  const mad=median(absResiduals)||0;
  const robustScale=Math.max(Number.EPSILON,1.4826*mad);
  let sumW=0,sumWV=0;
  const support=provisional.map(a=>{
    const r=Math.abs(a.value-center)/(1.5*robustScale);
    const huber=r<=1?1:1/r;
    const weight=a.baseWeight*huber;
    sumW+=weight;sumWV+=weight*a.value;
    return {...a,residual:a.value-center,robustWeight:huber,weight};
  });
  if(sumW<=0)return null;
  const estimate=sumWV/sumW;
  let variance=0;
  for(const a of support)variance+=a.weight*(a.value-estimate)**2;
  variance/=sumW;
  const sigma=Math.sqrt(Math.max(0,variance));
  const nearestKm=Math.min(...support.map(a=>a.distanceKm));
  const maxDtHours=Math.max(...support.map(a=>a.dtHours));
  const spatialSupport=uniqueSpatialCount(support);
  const effectiveN=(sumW*sumW)/support.reduce((s,a)=>s+a.weight*a.weight,0);
  const geometryFactor=spatialSupport>=3?1:spatialSupport===2?.72:.48;
  const distanceFactor=Math.exp(-nearestKm/Math.max(1,radiusKm));
  const temporalFactor=Math.exp(-maxDtHours/Math.max(1,tauHours*2));
  const supportFactor=1-Math.exp(-effectiveN/3);
  const residualFactor=1/(1+(sigma/(Math.abs(estimate)+robustScale+1e-9)));
  const confidence=clamp01(geometryFactor*distanceFactor*temporalFactor*supportFactor*residualFactor);
  const uncertainty=Math.sqrt(sigma*sigma+(robustScale/Math.sqrt(Math.max(1,effectiveN)))**2);
  const outliers=support.filter(a=>a.robustWeight<.5).map(a=>({id:a.id||null,value:a.value,residual:a.residual,distanceKm:a.distanceKm,dtHours:a.dtHours}));
  return {estimate,uncertainty,confidence,effectiveN,nearestKm,maxDtHours,spatialSupport,support,outliers,robustScale};
}

export function deweyAtlasEstimate(anchors, target, options={}) {
  const clean=(anchors||[]).filter(a=>a&&a.measured!==false&&Number.isFinite(Number(a.value))).map(a=>({...a,value:Number(a.value)}));
  if(!clean.length)return {state:'GAP_UNRESOLVED',measured:false,inferred:false,reason:'No measured anchors available',atlas:atlasHierarchy(target.lon,target.lat)};
  const tauHours=Number(options.tauHours)||24*18;
  const fineToCoarse=[20736,1728,144,12];
  let chosen=null,chosenLevel=null;
  for(const level of fineToCoarse){
    const radiusKm=nominalCellScaleKm(level)*Math.max(1,Number(options.radiusMultiplier)||2.25);
    const result=weightedEstimate(clean,target,radiusKm,tauHours);
    if(result && result.effectiveN>=Math.min(3,clean.length)) {chosen=result;chosenLevel=level;break;}
    if(!chosen&&result){chosen=result;chosenLevel=level;}
  }
  if(!chosen)return {state:'GAP_UNRESOLVED',measured:false,inferred:false,reason:'Measured anchors exist but none have usable spatial/temporal support',atlas:atlasHierarchy(target.lon,target.lat)};
  const method=chosen.spatialSupport>=3?'DEWEY_ATLAS_SPATIOTEMPORAL_TRIANGULATION':chosen.spatialSupport===1?'DEWEY_ATLAS_TEMPORAL_KERNEL':'DEWEY_ATLAS_HYBRID_KERNEL';
  return {
    state:'INFERRED_ATLAS',
    measured:false,
    inferred:true,
    method,
    value:chosen.estimate,
    uncertainty:chosen.uncertainty,
    confidence:chosen.confidence,
    level:chosenLevel,
    atlas:atlasHierarchy(target.lon,target.lat),
    support:{count:chosen.support.length,effectiveN:chosen.effectiveN,spatialLocations:chosen.spatialSupport,nearestKm:chosen.nearestKm,maxDtHours:chosen.maxDtHours},
    scar:{robustScale:chosen.robustScale,outliers:chosen.outliers},
    semantics:'This is a bounded estimate from measured anchors. It is never promoted to an observation and must remain visually and procedurally distinct from source data.'
  };
}
