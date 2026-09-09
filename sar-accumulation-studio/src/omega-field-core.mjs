import { deweyAtlasEstimate, atlasHierarchy, haversineKm, nominalCellScaleKm } from './atlas.mjs';
import { nearestEarthProxyCell } from './earth-grid.mjs';

export const OMEGA_SKINS = Object.freeze([
  'EVIDENCE','GEOMETRY','RELATIVITY','FULL_SPHERE','CRIMSON','DEEP_MOTHER','RSC_RAFT188','FORECAST','HEAVY_PRUNE','HIGH_FATHER','MODE188','NO_NOTHING_TRUTH','GUIDANCE_FIELD','UNIFIED_COHERENCE','PROOF_LEDGER'
]);

// Correlations are the previously charted Earth-proxy relationships. They shape the
// structural context prior only. They are never treated as SAR observations.
export const EARTH_EMPIRICAL_WEIGHTS = Object.freeze({
  motion_rel_score:-0.1248,
  water_triangle_ratio:0.0348,
  scar_carry_index:0.1137,
  thread_score:0.1490,
  relief_alignment_score:0.1269,
  depth_motion_tension:-0.8904,
  water_bathy_tension:-0.8752,
  orogenic_scar_tension:0.5982
});

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
const clamp01=v=>clamp(v,0,1);
const finite=v=>Number.isFinite(Number(v));
const mean=v=>{const x=v.filter(finite).map(Number);return x.length?x.reduce((a,b)=>a+b,0)/x.length:null};
const median=v=>{const x=v.filter(finite).map(Number).sort((a,b)=>a-b);if(!x.length)return null;const m=Math.floor(x.length/2);return x.length%2?x[m]:(x[m-1]+x[m])/2};
const mad=(v,c=median(v))=>finite(c)?median(v.filter(finite).map(x=>Math.abs(Number(x)-c))):null;
const logistic=x=>1/(1+Math.exp(-x));

export function buildEarthContextModel(grid){
  const numeric=grid?.numericFields||[];
  const categoryCount=(grid?.categoryFields||[]).length;
  const stats={};
  for(let j=0;j<numeric.length;j++){
    const values=(grid?.rows||[]).map(r=>Number(r?.[categoryCount+j])).filter(Number.isFinite);
    const center=median(values)??0;
    const robust=Math.max(1e-9,1.4826*(mad(values,center)??0));
    stats[numeric[j]]={center,robust,min:Math.min(...values),max:Math.max(...values)};
  }
  return {stats,weights:EARTH_EMPIRICAL_WEIGHTS,sourceSha256:grid?.sourceSha256||null};
}

export function earthStructuralScore(cell,model){
  if(!cell||!model)return {score:null,terms:[],confidence:0};
  const terms=[];let weighted=0,total=0;
  for(const [field,weight] of Object.entries(model.weights||{})){
    const value=Number(cell[field]),s=model.stats?.[field];
    if(!Number.isFinite(value)||!s)continue;
    const z=clamp((value-s.center)/s.robust,-4,4);
    weighted+=weight*z;total+=Math.abs(weight);terms.push({field,value,z,weight});
  }
  if(!total)return {score:null,terms,confidence:0};
  const raw=weighted/total;
  const score=Math.tanh(raw);
  const tier=String(cell.thread_tier||'').toLowerCase();
  const tierConfidence=tier.includes('strong')?.92:tier.includes('useful')?.78:tier.includes('weak')?.52:tier.includes('contradiction')?.32:.58;
  const alignment=finite(cell.relief_alignment_score)?clamp01(cell.relief_alignment_score):.5;
  return {score,terms,confidence:clamp01(.62*tierConfidence+.38*alignment),tier:cell.thread_tier||null,lens:cell.new_lens_type||null};
}

function solveLinearFit(points){
  const clean=points.filter(p=>finite(p.x)&&finite(p.y));
  if(clean.length<2)return null;
  let a=median(clean.map(p=>p.y))??0,b=0;
  for(let iter=0;iter<6;iter++){
    const residuals=clean.map(p=>p.y-(a+b*p.x));
    const scale=Math.max(1e-6,1.4826*(mad(residuals,median(residuals))??0));
    let sw=0,sx=0,sy=0,sxx=0,sxy=0;
    for(let i=0;i<clean.length;i++){
      const p=clean[i],r=Math.abs(residuals[i])/Math.max(scale*1.5,1e-9),w=r<=1?1:1/r;
      sw+=w;sx+=w*p.x;sy+=w*p.y;sxx+=w*p.x*p.x;sxy+=w*p.x*p.y;
    }
    const det=sw*sxx-sx*sx;
    if(Math.abs(det)<1e-10)break;
    a=(sy*sxx-sx*sxy)/det;b=(sw*sxy-sx*sy)/det;
  }
  const pred=clean.map(p=>a+b*p.x),actual=clean.map(p=>p.y),avg=mean(actual)??0;
  const ssTot=actual.reduce((s,y)=>s+(y-avg)**2,0),ssRes=actual.reduce((s,y,i)=>s+(y-pred[i])**2,0);
  const r2=ssTot>0?1-ssRes/ssTot:null;
  const rmse=Math.sqrt(ssRes/clean.length);
  return {intercept:a,slope:b,r2,rmse,n:clean.length};
}

export function enrichAnchorsWithContext(anchors,grid,contextModel){
  return (anchors||[]).filter(a=>a?.measured!==false&&finite(a.value)&&finite(a.lon)&&finite(a.lat)).map(a=>{
    const proxy=nearestEarthProxyCell(grid,a.lon,a.lat);
    const structure=earthStructuralScore(proxy,contextModel);
    return {...a,value:Number(a.value),proxy,structure};
  });
}

export function fitContextToSar(anchors){
  const points=(anchors||[]).filter(a=>finite(a?.structure?.score)&&finite(a.value)).map(a=>({x:a.structure.score,y:Number(a.value)}));
  const fit=solveLinearFit(points);
  if(!fit)return {state:'CONTEXT_SAR_FIT_UNRESOLVED',fit:null,confidence:0};
  const r2=Number.isFinite(fit.r2)?Math.max(-1,Math.min(1,fit.r2)):0;
  const support=1-Math.exp(-fit.n/12);
  const confidence=clamp01(support*(.45+.55*Math.max(0,r2)));
  return {state:'CONTEXT_SAR_FIT_READY',fit,confidence};
}

export function anchorsFromCalibratedPatch(patch,{stride=1}={}){
  if(!patch||patch.state!=='CALIBRATED_SENTINEL1_TARGET_PATCH'||!patch.measured&&patch.evidence?.measured!==true)return [];
  const mesh=patch.geoMesh,nodes=mesh?.nodes||[];
  const [x0,y0]=patch.sourceWindow||[0,0];
  const anchors=[];
  for(let gy=0;gy<nodes.length;gy+=Math.max(1,stride))for(let gx=0;gx<(nodes[gy]?.length||0);gx+=Math.max(1,stride)){
    const q=nodes[gy][gx];
    if(!finite(q?.lon)||!finite(q?.lat)||!finite(q?.pixel)||!finite(q?.line))continue;
    const px=Math.round(q.pixel-x0),py=Math.round(q.line-y0);
    if(px<0||py<0||px>=patch.width||py>=patch.height)continue;
    const k=py*patch.width+px,value=Number(patch.db?.[k]);
    if(!Number.isFinite(value))continue;
    anchors.push({id:`${patch.id}:${gy}:${gx}`,lon:Number(q.lon),lat:Number(q.lat),time:patch.startTime,value,measured:true,inferred:false,grade:patch.evidence?.grade||'B',source:'CALIBRATED_SENTINEL1_PATCH'});
  }
  const cx=Math.round(patch.centerPixel?.[0]-x0),cy=Math.round(patch.centerPixel?.[1]-y0),ck=cy*patch.width+cx,centerValue=Number(patch.db?.[ck]);
  if(Number.isFinite(centerValue)&&finite(patch.target?.lon)&&finite(patch.target?.lat))anchors.push({id:`${patch.id}:center`,lon:Number(patch.target.lon),lat:Number(patch.target.lat),time:patch.startTime,value:centerValue,measured:true,inferred:false,grade:patch.evidence?.grade||'B',source:'CALIBRATED_SENTINEL1_PATCH_CENTER'});
  return anchors;
}

export function anchorsFromCalibratedStack(stack,lon,lat){
  return (stack||[]).filter(s=>s?.state==='CALIBRATED_SENTINEL1_GRD_SAMPLE'&&finite(s.db)).map((s,i)=>({id:s.id||`stack-${i}`,lon:Number(lon),lat:Number(lat),time:s.startTime,value:Number(s.db),measured:true,inferred:false,grade:s.evidence?.grade||'B',source:'CALIBRATED_SENTINEL1_TEMPORAL_STACK'}));
}

function directionalPlane(anchors,target){
  const near=(anchors||[]).map(a=>({...a,d:haversineKm(target.lon,target.lat,a.lon,a.lat)})).filter(a=>a.d<350&&finite(a.value)).sort((a,b)=>a.d-b.d).slice(0,24);
  if(near.length<3)return null;
  const lat0=target.lat*Math.PI/180;
  const rows=near.map(a=>({x:(a.lon-target.lon)*111.32*Math.cos(lat0),y:(a.lat-target.lat)*110.57,z:a.value,w:Math.exp(-a.d/180)}));
  let s0=0,sx=0,sy=0,sxx=0,syy=0,sxy=0,sz=0,sxz=0,syz=0;
  for(const r of rows){s0+=r.w;sx+=r.w*r.x;sy+=r.w*r.y;sxx+=r.w*r.x*r.x;syy+=r.w*r.y*r.y;sxy+=r.w*r.x*r.y;sz+=r.w*r.z;sxz+=r.w*r.x*r.z;syz+=r.w*r.y*r.z;}
  const A=[[s0,sx,sy],[sx,sxx,sxy],[sy,sxy,syy]],b=[sz,sxz,syz];
  const det=(m)=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  const D=det(A);if(Math.abs(D)<1e-9)return null;
  const rep=(col)=>A.map((row,i)=>row.map((v,j)=>j===col?b[i]:v));
  const coeff=[det(rep(0))/D,det(rep(1))/D,det(rep(2))/D];
  const gradient=Math.hypot(coeff[1],coeff[2]);
  return {value:coeff[0],gradient,azimuthDeg:(Math.atan2(coeff[1],coeff[2])*180/Math.PI+360)%360,confidence:clamp01((1-Math.exp(-rows.length/6))*Math.exp(-gradient/12)),support:rows.length};
}

function temporalForecast(anchors,target){
  const timed=(anchors||[]).filter(a=>a.time&&finite(a.value)).map(a=>({...a,t:new Date(a.time).getTime()})).filter(a=>Number.isFinite(a.t)).sort((a,b)=>a.t-b.t);
  if(timed.length<3||!target.time)return null;
  const targetMs=new Date(target.time).getTime();if(!Number.isFinite(targetMs))return null;
  const t0=timed[0].t,scale=86400000;
  const pts=timed.map(a=>({x:(a.t-t0)/scale,y:a.value}));
  const fit=solveLinearFit(pts);if(!fit)return null;
  const x=(targetMs-t0)/scale,value=fit.intercept+fit.slope*x;
  const spanDays=Math.max(1,(timed.at(-1).t-timed[0].t)/scale),extrap=Math.max(0,Math.abs(x-(timed.length?median(pts.map(p=>p.x)):0))-spanDays/2);
  const confidence=clamp01((1-Math.exp(-timed.length/8))*(Number.isFinite(fit.r2)?Math.max(0,fit.r2):0)*Math.exp(-extrap/Math.max(1,spanDays)));
  return {value,trendPerDay:fit.slope,r2:fit.r2,rmse:fit.rmse,confidence,support:timed.length};
}

function contribution(name,value,confidence,uncertainty,meta={}){
  if(!finite(value)||!finite(confidence)||confidence<=0)return null;
  return {name,value:Number(value),confidence:clamp01(confidence),uncertainty:finite(uncertainty)?Math.max(1e-6,Number(uncertainty)):null,...meta};
}

function fuseContributions(contributions){
  const kept=(contributions||[]).filter(Boolean).filter(c=>c.confidence>=.08);
  if(!kept.length)return null;
  let sw=0,sv=0;
  for(const c of kept){const sigma=c.uncertainty??Math.max(1,.25*Math.abs(c.value));const w=c.confidence/(sigma*sigma+1e-6);c.weight=w;sw+=w;sv+=w*c.value;}
  if(sw<=0)return null;
  const value=sv/sw;
  let variance=0;for(const c of kept)variance+=c.weight*((c.value-value)**2+(c.uncertainty??0)**2);variance/=sw;
  const confidence=clamp01(1-Math.exp(-kept.reduce((s,c)=>s+c.confidence,0)/2.2));
  return {value,uncertainty:Math.sqrt(Math.max(0,variance)),confidence,contributions:kept};
}

export function evaluateOmegaCell({lon,lat,time,anchors=[],grid,contextModel,contextFit,previous=null}={}){
  const target={lon:Number(lon),lat:Number(lat),time:time||null};
  const proxy=grid?nearestEarthProxyCell(grid,target.lon,target.lat):null;
  const structure=proxy&&contextModel?earthStructuralScore(proxy,contextModel):{score:null,confidence:0,terms:[]};
  const atlas=deweyAtlasEstimate(anchors,target,{tauHours:24*24,radiusMultiplier:2.5});
  const plane=directionalPlane(anchors,target);
  const forecast=temporalForecast(anchors,target);
  const contributions=[];

  // EVIDENCE + FULL SPHERE: measured anchor interpolation, multiscale and robust-scar aware.
  if(atlas?.inferred&&finite(atlas.value))contributions.push(contribution('FULL_SPHERE_ATLAS',atlas.value,atlas.confidence,atlas.uncertainty,{level:atlas.level,support:atlas.support}));
  // CRIMSON: directional/asymmetric local field from measured spatial geometry.
  if(plane)contributions.push(contribution('CRIMSON_DIRECTIONAL',plane.value,.72*plane.confidence,Math.max(.6,plane.gradient),{azimuthDeg:plane.azimuthDeg,support:plane.support}));
  // Correlated Earth skin, mapped into SAR units only after fit to actual measured SAR anchors.
  if(contextFit?.fit&&finite(structure.score)){
    const f=contextFit.fit,value=f.intercept+f.slope*structure.score;
    const c=contextFit.confidence*structure.confidence;
    contributions.push(contribution('EARTH_CORRELATED_SKIN',value,c,Math.max(.75,f.rmse||1),{structuralScore:structure.score,tier:structure.tier,lens:structure.lens}));
  }
  // DEEP MOTHER / RSC continuity: previous accepted state remains a recoverable prior, never an observation.
  if(previous&&finite(previous.value))contributions.push(contribution('DEEP_MOTHER_CONTINUITY',previous.value,.34*clamp01(previous.confidence??.35),Math.max(1,previous.uncertainty??2),{scarCarry:true}));
  // FORECAST is a separate skin with explicit temporal support.
  if(forecast)contributions.push(contribution('FORECAST',forecast.value,.55*forecast.confidence,Math.max(.8,forecast.rmse||1.5),{trendPerDay:forecast.trendPerDay,support:forecast.support}));

  // HEAVY PRUNE + UNIFIED COHERENCE.
  const fused=fuseContributions(contributions);
  const normalizedPrior=finite(structure.score)?clamp01(.5+.5*structure.score):null;
  if(!fused){
    if(normalizedPrior!=null)return {
      state:'CONTEXT_PRIOR',value:null,displayValue:normalizedPrior,uncertainty:null,confidence:.18*structure.confidence,measured:false,inferred:true,
      provenance:{directSar:0,atlas:0,earthContext:1,forecast:0},proxy,structure,atlas:atlasHierarchy(target.lon,target.lat),
      skins:{NO_NOTHING_TRUTH:'PRESERVE_UNKNOWN_NOT_ZERO',MODE188:'CONTEXT_ONLY_NOT_ADMITTED_AS_SAR',HIGH_FATHER:'ABSOLUTE_SAR_VALUE_WITHHELD',GUIDANCE_FIELD:1},
      semantics:'Continuous structural prior from charted Earth context. No SAR-unit value is emitted until the prior is calibrated against measured SAR anchors.'
    };
    return {state:'UNRESOLVED',value:null,displayValue:null,uncertainty:null,confidence:0,measured:false,inferred:false,provenance:{directSar:0,atlas:0,earthContext:0,forecast:0},proxy,structure,atlas:atlasHierarchy(target.lon,target.lat),skins:{NO_NOTHING_TRUTH:'UNKNOWN_PRESERVED',MODE188:'REJECT',GUIDANCE_FIELD:1}};
  }

  const nearest=anchors.length?Math.min(...anchors.map(a=>haversineKm(target.lon,target.lat,a.lon,a.lat))):Infinity;
  const fineScale=nominalCellScaleKm(20736);
  const directSupport=Number.isFinite(nearest)?Math.exp(-nearest/Math.max(1,fineScale*.6)):0;
  const directConf=clamp01(directSupport*(1-Math.exp(-anchors.length/12)));
  const measured=directConf>.92;
  const reconstructionConfidence=clamp01(.78*fused.confidence+.22*directConf);
  const modeState=measured?'MEASURED_SUPPORTED':reconstructionConfidence>=.72?'OMEGA_RECONSTRUCTED_HIGH':reconstructionConfidence>=.42?'OMEGA_RECONSTRUCTED': 'OMEGA_RECONSTRUCTED_LOW';
  const guidance=clamp01((1-reconstructionConfidence)*(.5+.5*(1-directSupport)));
  const rangeCenter=median(anchors.map(a=>a.value));
  const rangeScale=Math.max(2,1.4826*(mad(anchors.map(a=>a.value),rangeCenter)??3));
  const displayValue=clamp01(.5+.18*((fused.value-(rangeCenter??fused.value))/rangeScale));
  const contributionTotal=fused.contributions.reduce((s,c)=>s+(c.weight||0),0)||1;
  const fraction=name=>fused.contributions.filter(c=>c.name===name).reduce((s,c)=>s+(c.weight||0),0)/contributionTotal;
  return {
    state:modeState,value:fused.value,displayValue,uncertainty:fused.uncertainty,confidence:reconstructionConfidence,measured,inferred:!measured,
    provenance:{directSar:directConf,atlas:fraction('FULL_SPHERE_ATLAS'),earthContext:fraction('EARTH_CORRELATED_SKIN'),forecast:fraction('FORECAST'),directional:fraction('CRIMSON_DIRECTIONAL'),continuity:fraction('DEEP_MOTHER_CONTINUITY')},
    proxy,structure,atlas:atlas.atlas||atlasHierarchy(target.lon,target.lat),support:atlas.support||null,contributions:fused.contributions,
    skins:{
      EVIDENCE:`${anchors.length} measured anchor(s)`,GEOMETRY:'WGS84 + source GCP geometry',RELATIVITY:'spatiotemporal frame-relative support',FULL_SPHERE:atlas.state,
      CRIMSON:plane?'DIRECTIONAL_ANISOTROPY_ACTIVE':'NO_SPATIAL_PLANE',DEEP_MOTHER:previous?'CONTINUITY_CARRY_ACTIVE':'NO_PRIOR_STATE',RSC_RAFT188:atlas.scar||null,
      FORECAST:forecast?'TEMPORAL_TREND_ACTIVE':'INSUFFICIENT_TEMPORAL_SUPPORT',HEAVY_PRUNE:'CONTRIBUTIONS_BELOW_0.08_REMOVED',HIGH_FATHER:'BOUNDS_AND_EVIDENCE_CLASS_ENFORCED',
      MODE188:modeState,NO_NOTHING_TRUTH:'NO_MISSING_VALUE_COERCED_TO_ZERO',GUIDANCE_FIELD:guidance,UNIFIED_COHERENCE:reconstructionConfidence,PROOF_LEDGER:'CONTRIBUTION_VECTOR_RETAINED'
    },
    semantics:'Continuous OMEGA SAR reconstruction. Direct measurements, correlated Earth context, temporal carry, directional geometry and forecast remain separately attributable in the provenance vector.'
  };
}

export function buildOmegaContinuousField({bbox=[-180,-90,180,90],cols=96,rows=48,time=null,anchors=[],grid,previousField=null}={}){
  if(!grid)throw new Error('Earth proxy grid is required');
  const [minLon,minLat,maxLon,maxLat]=bbox.map(Number);
  const contextModel=buildEarthContextModel(grid);
  const enriched=enrichAnchorsWithContext(anchors,grid,contextModel);
  const contextFit=fitContextToSar(enriched);
  const cells=[];
  const prevMap=new Map((previousField?.cells||[]).map(c=>[`${c.ix}:${c.iy}`,c]));
  for(let iy=0;iy<rows;iy++)for(let ix=0;ix<cols;ix++){
    const x0=minLon+(maxLon-minLon)*ix/cols,x1=minLon+(maxLon-minLon)*(ix+1)/cols;
    const y0=minLat+(maxLat-minLat)*iy/rows,y1=minLat+(maxLat-minLat)*(iy+1)/rows;
    const lon=(x0+x1)/2,lat=(y0+y1)/2;
    const cell=evaluateOmegaCell({lon,lat,time,anchors:enriched,grid,contextModel,contextFit,previous:prevMap.get(`${ix}:${iy}`)||null});
    cells.push({...cell,ix,iy,lon,lat,bounds:[x0,y0,x1,y1]});
  }
  const values=cells.map(c=>c.value).filter(Number.isFinite),conf=cells.map(c=>c.confidence).filter(Number.isFinite);
  const states=cells.reduce((m,c)=>(m[c.state]=(m[c.state]||0)+1,m),{});
  return {
    schema:'omega.sar.continuous-field.v1',time,bbox:[minLon,minLat,maxLon,maxLat],cols,rows,cells,
    anchors:{count:enriched.length,measuredOnly:true},contextFit,
    summary:{states,meanConfidence:mean(conf)??0,medianValue:median(values),robustScale:values.length?Math.max(1e-6,1.4826*(mad(values,median(values))??0)):null,guidanceMean:mean(cells.map(c=>c.skins?.GUIDANCE_FIELD).filter(Number.isFinite))??1},
    skins:OMEGA_SKINS,
    boundary:'A continuous rendered field may contain direct measurement support, calibrated reconstruction, temporal forecast and context-only prior. Every cell retains its provenance class; continuity of display does not erase evidence distinctions.'
  };
}
