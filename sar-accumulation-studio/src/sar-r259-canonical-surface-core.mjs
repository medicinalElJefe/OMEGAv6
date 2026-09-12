import { meshGeoAtSource, sampleTerrainField, terrainLight } from './data-native-surface-core.mjs';

const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,finite(v)?Number(v):a));

function norm(v,scale,gamma=.72){
  const s=Math.max(1e-12,Math.abs(Number(scale)||0));
  if(!finite(v)||!finite(s))return 0;
  return Math.pow(clamp(Math.abs(Number(v))/s),gamma);
}
function sample(array,index,fallback=0){const v=Number(array?.[index]);return finite(v)?v:fallback;}
function luminanceToRgb(luma,{cool=0,warm=0}={}){
  const v=clamp(luma),shadow=.92+.08*v;
  return [
    Math.round(255*clamp(v*shadow*(1+.035*warm-.045*cool))),
    Math.round(255*clamp(v*(1+.008*warm+.018*cool))),
    Math.round(255*clamp(v*(1-.026*warm+.065*cool)))
  ];
}
function canonicalWeights(frame){
  const directive=frame?.directive||frame?.renderDirective||null,fusion=frame?.fusion||{},m=fusion.mode188||{};
  const detail=clamp(directive?.detailWeight??m.proofWeighted??.75,.22,1);
  const proof=clamp(directive?.proofWeight??fusion.evidence??.75,.15,1);
  const scar=clamp(fusion.scarLoad??0);
  const contradiction=clamp(fusion.contradiction??0);
  const continuity=clamp(fusion.continuity??.75);
  return {detail,proof,scar,contradiction,continuity,authority:String(frame?.render?.authority||directive?.primary||'UNKNOWN')};
}

export function buildCanonicalMeasuredSurface(patch,calculus,terrainState,frame,{mode='canon'}={}){
  if(!patch?.db||!calculus?.arrays||!patch.width||!patch.height)throw new Error('R259 canonical surface requires calibrated SAR plus measured calculus arrays');
  const width=Number(patch.width),height=Number(patch.height),n=width*height;
  if(patch.db.length<n)throw new Error('Calibrated SAR array is shorter than the declared patch dimensions');
  const a=calculus.arrays,s=calculus.scales||{},rgba=new Uint8ClampedArray(n*4),terrain=terrainState?.terrain||null,water=terrainState?.water?.geometry||terrainState?.water||null;
  const mesh=patch.geoMesh,[x0,y0,x1,y1]=patch.sourceWindow||mesh?.sourceWindow||[0,0,width,height],sx=(x1-x0)/width,sy=(y1-y0)/height,w=canonicalWeights(frame);
  const selected=String(mode||'canon').toLowerCase();
  let valid=0,terrainSamples=0,meanStructure=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x,j=i*4,raw=sample(a.raw,i,NaN),detail=sample(a.detail,i,NaN);if(!finite(raw))continue;valid++;
    const gradient=norm(sample(a.gradient,i),s.gradientP98,.60),curvature=norm(sample(a.curvature,i),s.absCurvatureP98,.62),texture=norm(sample(a.texture,i),s.textureP98,.66),orientation=sample(a.orientation,i,0);
    const structure=clamp(.46*gradient+.30*curvature+.24*texture);meanStructure+=structure;
    const highpass=finite(detail)?detail-raw:0;
    let terrainShade=.64,terrainCurv=0,flow=0,terrainValid=false;
    if(terrain&&mesh){
      const sourcePixel=x0+(x+.5)*sx,sourceLine=y0+(y+.5)*sy,geo=meshGeoAtSource(mesh,sourcePixel,sourceLine);
      if(geo){
        const slope=sampleTerrainField(terrain,water?.slope,geo.lon,geo.lat),aspect=sampleTerrainField(terrain,water?.aspect,geo.lon,geo.lat),tc=sampleTerrainField(terrain,water?.curvature,geo.lon,geo.lat),q=sampleTerrainField(terrain,water?.conveyance,geo.lon,geo.lat);
        if(finite(slope)&&finite(aspect)){terrainValid=true;terrainSamples++;terrainShade=clamp(.5+.5*terrainLight(slope,aspect,{azimuthDeg:315,elevationDeg:43}));}
        if(finite(tc))terrainCurv=Math.tanh(Number(tc)*2200);
        if(finite(q))flow=clamp(q);
      }
    }
    const orientLight=.5+.5*Math.cos(orientation-5.4977871438),edgeRelief=(orientLight-.5)*gradient;
    const detailGain=.08+.17*w.detail,proofGain=.93+.07*w.proof,scarPenalty=1-.18*w.scar,contradictionPenalty=1-.10*w.contradiction;
    let luma;
    if(selected==='structure'){
      luma=clamp(.15+.38*raw+.37*structure+.10*edgeRelief+.08*highpass);
    }else if(selected==='terrain'){
      luma=clamp(raw*(.72+.28*terrainShade)+.12*highpass+.08*structure-.035*terrainCurv);
    }else{
      const terrainFactor=terrainValid?(.82+.18*terrainShade):1;
      luma=clamp((raw+detailGain*highpass+.105*structure+.055*edgeRelief-.025*terrainCurv)*terrainFactor*proofGain*scarPenalty*contradictionPenalty);
    }
    const cool=terrainValid&&flow>.58?Math.pow((flow-.58)/.42,1.45)*.55:0;
    const warm=clamp(curvature*.12+gradient*.04);
    const [r,g,b]=luminanceToRgb(luma,{cool,warm});rgba[j]=r;rgba[j+1]=g;rgba[j+2]=b;rgba[j+3]=255;
  }
  const terrainCoverage=valid?terrainSamples/valid:0;
  return {
    width,height,rgba,mode:selected,
    stats:{validSar:valid,terrainSamples,terrainCoverage,meanStructure:valid?meanStructure/valid:0},
    control:{...w},
    evidence:{sourceMeasured:true,displayDerived:selected!=='measured',measurementPromotion:false,terrainContextUsed:terrainCoverage>0},
    boundary:'R259 canonical surface is a deterministic display transform of calibrated SAR samples. Gradient, Laplacian, texture, orientation and optional DEM/drainage modulation only shape the display. They do not create new SAR pixels, phase, coherence, displacement, velocity, water depth or measured 3-D geometry.'
  };
}

export function surfaceAdmission({patch,calculus,frame,mode='canon'}={}){
  const measured=patch?.evidence?.measured===true&&!!patch?.db;
  const valid=Number(calculus?.stats?.validFraction)||0;
  const authority=String(frame?.render?.authority||'UNKNOWN');
  const pruned=frame?.fusion?.mode188?.admissibility==='PRUNE';
  const accepted=measured&&valid>.1&&!pruned;
  return {accepted,measured,validFraction:valid,authority,mode188:frame?.fusion?.mode188?.decision||'UNRESOLVED',reason:accepted?'MEASURED_SOURCE_ADMITTED':!measured?'NO_CALIBRATED_MEASUREMENT':pruned?'MODE188_PRUNED':'INSUFFICIENT_VALID_SOURCE_SUPPORT'};
}