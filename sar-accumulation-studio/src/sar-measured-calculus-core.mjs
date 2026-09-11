const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)));
const median=values=>{const a=values.filter(finite).map(Number).sort((x,y)=>x-y);if(!a.length)return NaN;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;};
function sampledQuantile(values,q=.98,max=10000){const n=values?.length||0;if(!n)return NaN;const stride=Math.max(1,Math.floor(n/max)),a=[];for(let i=0;i<n;i+=stride){const v=Number(values[i]);if(finite(v))a.push(v);}if(!a.length)return NaN;a.sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.max(0,Math.round((a.length-1)*q)))];}
function at(db,w,h,x,y){if(x<0||y<0||x>=w||y>=h)return NaN;return Number(db[y*w+x]);}
function localStats(db,w,h,x,y,r=1){let sum=0,sum2=0,n=0;for(let yy=Math.max(0,y-r);yy<=Math.min(h-1,y+r);yy++)for(let xx=Math.max(0,x-r);xx<=Math.min(w-1,x+r);xx++){const v=at(db,w,h,xx,yy);if(!finite(v))continue;sum+=v;sum2+=v*v;n++;}if(!n)return {mean:NaN,std:NaN};const mean=sum/n;return {mean,std:Math.sqrt(Math.max(0,sum2/n-mean*mean))};}
function stretch(v,lo,hi,gamma=.82){if(!finite(v)||!finite(lo)||!finite(hi)||hi<=lo)return NaN;return Math.pow(clamp((v-lo)/(hi-lo)),gamma);}

export function buildMeasuredSpatialCalculus(patch,{dxMeters=null,dyMeters=null}={}){
  if(!patch?.db||!patch.width||!patch.height)throw new Error('Measured calculus requires a calibrated SAR patch');
  const w=Number(patch.width),h=Number(patch.height),db=patch.db,n=w*h;
  if(db.length<n)throw new Error('Measured SAR array is shorter than declared patch dimensions');
  const rangeSpacing=Number(dxMeters)||Number(patch.product?.rangePixelSpacing)||Number(patch.spacing?.range)||10;
  const azimuthSpacing=Number(dyMeters)||Number(patch.product?.azimuthPixelSpacing)||Number(patch.spacing?.azimuth)||10;
  const dx=Math.max(.01,Math.abs(rangeSpacing)),dy=Math.max(.01,Math.abs(azimuthSpacing));
  const gradient=new Float32Array(n),curvature=new Float32Array(n),texture=new Float32Array(n),detail=new Float32Array(n),raw=new Float32Array(n),orientation=new Float32Array(n);gradient.fill(NaN);curvature.fill(NaN);texture.fill(NaN);detail.fill(NaN);raw.fill(NaN);orientation.fill(NaN);
  const lo=finite(patch.stats?.p02)?Number(patch.stats.p02):sampledQuantile(db,.02),hi=finite(patch.stats?.p98)?Number(patch.stats.p98):sampledQuantile(db,.98);
  let valid=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,c=at(db,w,h,x,y);if(!finite(c))continue;valid++;
    const l=finite(at(db,w,h,x-1,y))?at(db,w,h,x-1,y):c,r=finite(at(db,w,h,x+1,y))?at(db,w,h,x+1,y):c,u=finite(at(db,w,h,x,y-1))?at(db,w,h,x,y-1):c,d=finite(at(db,w,h,x,y+1))?at(db,w,h,x,y+1):c;
    const gx=(r-l)/(2*dx),gy=(d-u)/(2*dy),g=Math.hypot(gx,gy),lap=(r-2*c+l)/(dx*dx)+(d-2*c+u)/(dy*dy),local=localStats(db,w,h,x,y,1),base=stretch(c,lo,hi,.80);
    raw[i]=base;gradient[i]=g;curvature[i]=lap;texture[i]=local.std;orientation[i]=Math.atan2(gy,gx);
    const highpass=finite(local.mean)?Math.tanh((c-local.mean)/Math.max(1.25,local.std||1.25)):0;detail[i]=finite(base)?clamp(base+.18*highpass):NaN;
  }
  const g98=sampledQuantile(gradient,.98),c98=sampledQuantile(Array.from(curvature,v=>Math.abs(v)),.98),t98=sampledQuantile(texture,.98);
  return {state:'MEASURED_SPATIAL_CALCULUS_READY',width:w,height:h,source:{id:patch.id,startTime:patch.startTime||null,quantity:patch.quantity,polarization:patch.polarization,evidence:patch.evidence},spacingMeters:{range:dx,azimuth:dy},arrays:{raw,detail,gradient,curvature,texture,orientation},scales:{db:[lo,hi],gradientP98:g98,absCurvatureP98:c98,textureP98:t98},stats:{validCount:valid,validFraction:n?valid/n:0},boundary:'Spatial derivative surfaces are deterministic transforms of calibrated measured SAR samples. They reveal local intensity structure but are not new measurements, terrain height, velocity, displacement, coherence or InSAR phase.'};
}

export function renderMeasuredSpatialSurface(calculus,mode='detail'){
  if(!calculus?.arrays)throw new Error('Spatial calculus is not ready');
  const {width:w,height:h,arrays,scales}=calculus,rgba=new Uint8ClampedArray(w*h*4),key=String(mode||'detail').toLowerCase();
  for(let i=0;i<w*h;i++){
    let v=NaN;
    if(key==='detail')v=arrays.detail[i];
    else if(key==='raw'||key==='measured')v=arrays.raw[i];
    else if(key==='gradient')v=finite(arrays.gradient[i])&&scales.gradientP98>0?Math.pow(clamp(arrays.gradient[i]/scales.gradientP98),.62):NaN;
    else if(key==='curvature')v=finite(arrays.curvature[i])&&scales.absCurvatureP98>0?Math.pow(clamp(Math.abs(arrays.curvature[i])/scales.absCurvatureP98),.62):NaN;
    else if(key==='texture')v=finite(arrays.texture[i])&&scales.textureP98>0?Math.pow(clamp(arrays.texture[i]/scales.textureP98),.68):NaN;
    if(!finite(v))continue;const b=Math.round(clamp(v)*255),j=i*4;rgba[j]=b;rgba[j+1]=b;rgba[j+2]=b;rgba[j+3]=255;
  }
  return {width:w,height:h,rgba,mode:key,evidence:{sourceMeasured:true,displayDerived:key!=='raw'&&key!=='measured',measurementPromotion:false},boundary:key==='raw'||key==='measured'?'Percentile-stretched calibrated SAR measurement display. Source values are unchanged.':'Derived display from calibrated SAR samples. No new observation is created.'};
}

export function analyzeMeasuredTemporalSamples(samples){
  const valid=(samples||[]).filter(s=>Number.isFinite(Number(s?.db))&&Number.isFinite(new Date(s?.startTime||'').getTime())&&s?.measured!==false).map(s=>({...s,db:Number(s.db),t:new Date(s.startTime).getTime()})).sort((a,b)=>a.t-b.t);
  if(!valid.length)return {state:'TEMPORAL_UNRESOLVED',observations:0,boundary:'No measured calibrated target samples are available.'};
  const values=valid.map(s=>s.db),med=median(values),absDev=values.map(v=>Math.abs(v-med)),mad=median(absDev),pairs=[];
  for(let i=1;i<valid.length;i++){const dtDays=(valid[i].t-valid[i-1].t)/86400000;if(!(dtDays>0))continue;pairs.push({from:valid[i-1].startTime,to:valid[i].startTime,deltaDb:valid[i].db-valid[i-1].db,days:dtDays,rateDbPerDay:(valid[i].db-valid[i-1].db)/dtDays});}
  const latest=valid.at(-1),previous=valid.at(-2)||null,lastPair=pairs.at(-1)||null,medianRate=median(pairs.map(p=>p.rateDbPerDay)),cadenceHours=median(pairs.map(p=>p.days*24));
  const robustZ=mad>1e-9?.67448975*(latest.db-med)/mad:0;
  return {state:'MEASURED_TEMPORAL_CALCULUS_READY',observations:valid.length,firstTime:valid[0].startTime,lastTime:latest.startTime,spanDays:(latest.t-valid[0].t)/86400000,latestDb:latest.db,previousDb:previous?.db??null,deltaDb:lastPair?.deltaDb??null,rateDbPerDay:lastPair?.rateDbPerDay??null,medianRateDbPerDay:Number.isFinite(medianRate)?medianRate:null,medianCadenceHours:Number.isFinite(cadenceHours)?cadenceHours:null,medianDb:med,madDb:mad,latestRobustZ:robustZ,pairs,evidence:{measuredSamples:valid.length,derived:true,measurementPromotion:false},boundary:'Temporal deltas, rates and robust anomaly scores are derived from calibrated target backscatter samples at acquisition timestamps. They are intensity-change diagnostics only; they are not ground velocity, displacement, causal attribution or continuous live radar.'};
}
