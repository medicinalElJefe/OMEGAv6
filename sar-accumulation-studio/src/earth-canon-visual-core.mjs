const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));

function boxIntegral(values,w,h){
  const stride=w+1,out=new Float64Array((w+1)*(h+1));
  for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){const v=finite(values[y*w+x])?Number(values[y*w+x]):0;row+=v;out[(y+1)*stride+x+1]=out[y*stride+x+1]+row;}}
  return out;
}
function boxSum(integral,w,h,x0,y0,x1,y1){
  const stride=w+1,a=Math.max(0,Math.min(w,x0)),b=Math.max(0,Math.min(w,x1)),c=Math.max(0,Math.min(h,y0)),d=Math.max(0,Math.min(h,y1));return integral[d*stride+b]-integral[c*stride+b]-integral[d*stride+a]+integral[c*stride+a];
}
function quantile(values,q=.98,max=12000){const n=values?.length||0;if(!n)return NaN;const step=Math.max(1,Math.floor(n/max)),a=[];for(let i=0;i<n;i+=step){const v=Number(values[i]);if(finite(v))a.push(v);}if(!a.length)return NaN;a.sort((x,y)=>x-y);return a[Math.max(0,Math.min(a.length-1,Math.round((a.length-1)*q)))];}

export function buildMeasuredStructureTensor(calculus,{radius=2}={}){
  if(!calculus?.arrays||!calculus.width||!calculus.height)throw new Error('Structure tensor requires measured spatial calculus');
  const w=calculus.width,h=calculus.height,n=w*h,{gradient,orientation}=calculus.arrays,gxx=new Float32Array(n),gxy=new Float32Array(n),gyy=new Float32Array(n);gxx.fill(NaN);gxy.fill(NaN);gyy.fill(NaN);
  for(let i=0;i<n;i++){const g=Number(gradient[i]),o=Number(orientation[i]);if(!(finite(g)&&finite(o)))continue;const gx=g*Math.cos(o),gy=g*Math.sin(o);gxx[i]=gx*gx;gxy[i]=gx*gy;gyy[i]=gy*gy;}
  const ixx=boxIntegral(gxx,w,h),ixy=boxIntegral(gxy,w,h),iyy=boxIntegral(gyy,w,h),anisotropy=new Float32Array(n),axis=new Float32Array(n),energy=new Float32Array(n);anisotropy.fill(NaN);axis.fill(NaN);energy.fill(NaN);let valid=0,sumA=0;
  const r=Math.max(1,Math.min(5,Math.round(radius)));
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,x0=x-r,y0=y-r,x1=x+r+1,y1=y+r+1,count=Math.max(1,(Math.min(w,x1)-Math.max(0,x0))*(Math.min(h,y1)-Math.max(0,y0))),a=boxSum(ixx,w,h,x0,y0,x1,y1)/count,b=boxSum(ixy,w,h,x0,y0,x1,y1)/count,c=boxSum(iyy,w,h,x0,y0,x1,y1)/count;
    if(!(finite(a)&&finite(b)&&finite(c)))continue;const trace=Math.max(0,a+c),disc=Math.sqrt(Math.max(0,(a-c)*(a-c)+4*b*b)),l1=.5*(trace+disc),l2=.5*(trace-disc),coh=trace>1e-18?clamp((l1-l2)/(trace+1e-18)):0,theta=.5*Math.atan2(2*b,a-c);anisotropy[i]=coh;axis[i]=theta;energy[i]=trace;valid++;sumA+=coh;
  }
  const energyP98=quantile(energy,.98);
  return {state:'MEASURED_STRUCTURE_TENSOR_READY',width:w,height:h,arrays:{anisotropy,axis,energy},scales:{energyP98},stats:{validCount:valid,validFraction:n?valid/n:0,meanAnisotropy:valid?sumA/valid:0,radius:r},evidence:{sourceMeasured:true,displayDerived:true,measurementPromotion:false},boundary:'The structure tensor is a deterministic local second-moment transform of calibrated SAR intensity gradients. It reveals directional reflectivity structure for display/analysis only; it is not interferometric coherence, phase, displacement, material identity, surface-normal measurement or new spatial resolution.'};
}

export function buildCanonicalMeasuredVisualSurface(patch,calculus,{terrainRgba=null,terrainCoverage=0,directives=null,lightAzimuthRad=5.49778714378}={}){
  if(!patch?.db||!calculus?.arrays)throw new Error('Canonical visual surface requires calibrated SAR plus measured calculus');const w=calculus.width,h=calculus.height,n=w*h;if(patch.db.length<n)throw new Error('Measured patch array shorter than visual surface');
  const tensor=buildMeasuredStructureTensor(calculus),rgba=new Uint8ClampedArray(n*4),a=calculus.arrays,s=calculus.scales,t=tensor.arrays,structureGain=clamp(directives?.measuredStructure??.20,0,.28),contrastGain=clamp(directives?.localContrast??.16,0,.22),terrainWeight=terrainRgba&&terrainCoverage>=.36?clamp(directives?.terrainRelief??.16,0,.18):0,g98=Number(s.gradientP98)||0,c98=Number(s.absCurvatureP98)||0,tx98=Number(s.textureP98)||0,e98=Number(tensor.scales.energyP98)||0;
  let valid=0,terrainSamples=0,structureSamples=0;
  for(let i=0;i<n;i++){
    const raw=Number(a.raw[i]);if(!finite(raw))continue;valid++;const detail=finite(a.detail[i])?Number(a.detail[i]):raw,g=g98>0&&finite(a.gradient[i])?clamp(Math.abs(a.gradient[i])/g98):0,texture=tx98>0&&finite(a.texture[i])?clamp(Math.abs(a.texture[i])/tx98):0,curv=c98>0&&finite(a.curvature[i])?clamp(Number(a.curvature[i])/c98,-1,1):0,anis=finite(t.anisotropy[i])?Number(t.anisotropy[i]):0,axis=finite(t.axis[i])?Number(t.axis[i]):0,energy=e98>0&&finite(t.energy[i])?clamp(Number(t.energy[i])/e98):0;
    if(finite(t.anisotropy[i]))structureSamples++;const directional=Math.cos(axis-lightAzimuthRad)*anis*Math.sqrt(Math.max(0,energy)),high=detail-raw,localShape=.36*high+.22*g+.14*texture+.18*directional-.10*curv,localContrast=(raw-.5)*(1+.85*contrastGain*anis),structured=clamp(.5+localContrast+structureGain*localShape);let v=structured;
    if(terrainWeight>0){const j=i*4,tr=Number(terrainRgba[j]),tg=Number(terrainRgba[j+1]),tb=Number(terrainRgba[j+2]);if([tr,tg,tb].every(finite)){terrainSamples++;const terrainLum=(tr+tg+tb)/(3*255);v=clamp((1-terrainWeight)*v+terrainWeight*terrainLum);}}
    // Bounded tone curve improves legibility but cannot create frequencies or samples.
    v=clamp(.5+.5*Math.tanh((v-.5)*(2.05+.85*contrastGain)));const b=Math.round(v*255),j=i*4;rgba[j]=b;rgba[j+1]=b;rgba[j+2]=b;rgba[j+3]=255;
  }
  return {width:w,height:h,rgba,tensor,stats:{valid,validFraction:n?valid/n:0,structureSamples,structureFraction:n?structureSamples/n:0,meanAnisotropy:tensor.stats.meanAnisotropy,terrainSamples,terrainCoverageUsed:valid?terrainSamples/valid:0,structureGain,contrastGain,terrainWeight},evidence:{sarMeasured:true,structureDerived:true,terrainContext:terrainWeight>0,measurementPromotion:false,sourcePixelsUnchanged:true},boundary:'Calibrated SAR samples remain the luminance authority and are never mutated. High-detail shape comes only from deterministic local contrast, measured intensity derivatives, a source-derived structure tensor and, when coherently registered, bounded DEM relief. No missing pixel, interferometric coherence, phase, displacement, velocity, material class or physical geometry is synthesized.'};
}
