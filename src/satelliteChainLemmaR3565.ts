import{useEffect,useState}from'react';

export type SatelliteLemmaViewR3565='SOURCE'|'AMPLITUDE'|'PHASE'|'COHERENCE'|'INTERFEROGRAM'|'DEFORMATION'|'ELEVATION'|'POLARIMETRY'|'MULTI_BAND'|'TIME_STACK'|'SCAR_UNCERTAINTY'|'PROOF';
export type SatelliteLemmaStateR3565='LOADING'|'READY'|'UNAVAILABLE';

export interface SatelliteLemmaResultR3565{
 schema:'OMEGA_SATELLITE_CHAIN_LEMMA_R3565';
 state:SatelliteLemmaStateR3565;
 resolution:number;
 fields:Partial<Record<SatelliteLemmaViewR3565,number[]>>;
 anchors:{current:string;previous:string;currentDate?:string;previousDate?:string;evidenceBound:boolean;evidenceHash:string;lat:number;lon:number};
 metrics:{temporalResidual:number;meanGradient:number;meanCoherence:number;scar:number;support:number;cloudPenalty:number};
 operator:string;
 truthClass:'DERIVED_TRIANGULATED';
 boundary:string;
 error?:string;
}

const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
const day=(offset:number)=>new Date(Date.now()+offset*86400000).toISOString().slice(0,10);
const ANCHOR_TIMEOUT_MS_R487=12000;
const loadImage=(src:string,timeoutMs=ANCHOR_TIMEOUT_MS_R487)=>new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();let settled=false;const timer=window.setTimeout(()=>{if(settled)return;settled=true;img.onload=null;img.onerror=null;reject(new Error(`Satellite anchor image timeout after ${timeoutMs} ms`))},timeoutMs);img.onload=()=>{if(settled)return;settled=true;window.clearTimeout(timer);img.onerror=null;resolve(img)};img.onerror=()=>{if(settled)return;settled=true;window.clearTimeout(timer);img.onload=null;reject(new Error('Satellite anchor image unavailable'))};img.src=src});
const imageMaterialityR419=(img:HTMLImageElement)=>{const n=32,canvas=document.createElement('canvas');canvas.width=n;canvas.height=n;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(img,0,0,n,n);const p=ctx.getImageData(0,0,n,n).data,bins=new Set<number>();let opaque=0,min=1,max=0;for(let i=0;i<p.length;i+=4){const a=p[i+3]/255;if(a<.1)continue;opaque++;const l=(.2126*p[i]+.7152*p[i+1]+.0722*p[i+2])/255;min=Math.min(min,l);max=Math.max(max,l);bins.add(Math.round(l*31))}return{opaque,bins:bins.size,span:opaque?max-min:0}};
const materialAnchorR419=(q:{opaque:number;bins:number;span:number})=>q.opaque>=256&&(q.bins>=4||q.span>=.025);
const loadFirstImage=async(sources:{src:string;date:string}[])=>{const attempts=await Promise.all(sources.map(async candidate=>{try{const img=await loadImage(candidate.src),quality=imageMaterialityR419(img);return materialAnchorR419(quality)?{candidate,img,quality,error:null}:{candidate,img:null,quality:null,error:new Error(`Satellite anchor image non-material for ${candidate.date}: opaque=${quality.opaque} bins=${quality.bins} span=${quality.span.toFixed(4)}`)}}catch(error){return{candidate,img:null,quality:null,error}}}));let last:unknown=null;for(const attempt of attempts){if(attempt.img&&attempt.quality)return{...attempt.candidate,img:attempt.img,quality:attempt.quality};last=attempt.error}throw(last instanceof Error?last:new Error('Satellite anchor image unavailable across bounded fallback dates'))};
const pixels=(img:HTMLImageElement,n:number)=>{const canvas=document.createElement('canvas');canvas.width=n;canvas.height=n;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(img,0,0,n,n);return ctx.getImageData(0,0,n,n).data};
const lum=(p:Uint8ClampedArray,i:number)=>(.2126*p[i]+.7152*p[i+1]+.0722*p[i+2])/255;
const idx=(x:number,y:number,n:number)=>Math.max(0,Math.min(n-1,y))*n+Math.max(0,Math.min(n-1,x));
const sample=(a:number[],x:number,y:number,n:number)=>a[idx(x,y,n)]||0;

export function useSatelliteChainLemmaR3565(lat:number,lon:number,evidence?:any,resolution=64){
 const evidenceHash=String(evidence?.evidenceHash||'');
 const[result,setResult]=useState<SatelliteLemmaResultR3565>(()=>({schema:'OMEGA_SATELLITE_CHAIN_LEMMA_R3565',state:'LOADING',resolution,fields:{},anchors:{current:'',previous:'',evidenceBound:false,evidenceHash,lat,lon},metrics:{temporalResidual:0,meanGradient:0,meanCoherence:0,scar:1,support:0,cloudPenalty:0},operator:'PARTITION → TRANSFORM/EXCHANGE → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE',truthClass:'DERIVED_TRIANGULATED',boundary:'Derived triangulation only; no SAR measurement authority is claimed. GIBS anchors must be materially populated; blank or near-uniform newest-date imagery is rejected in favor of bounded fallback dates.'}));
 useEffect(()=>{let alive=true;const n=Math.max(24,Math.min(96,Math.floor(resolution))),mk=(offset:number)=>({date:day(offset),src:`/api/earth/gibs/image?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}&date=${day(offset)}&span=2.5`}),currentCandidates=[mk(-1),mk(-2),mk(-3)],previousCandidates=[mk(-8),mk(-9),mk(-10)];
  setResult(r=>({...r,state:'LOADING',fields:{},anchors:{current:currentCandidates[0].src,previous:previousCandidates[0].src,currentDate:currentCandidates[0].date,previousDate:previousCandidates[0].date,evidenceBound:Boolean(evidenceHash),evidenceHash,lat,lon},error:undefined}));
  if(!evidenceHash)return()=>{alive=false};
  (async()=>{try{
   const[aAnchor,bAnchor]=await Promise.all([loadFirstImage(currentCandidates),loadFirstImage(previousCandidates)]),aPix=pixels(aAnchor.img,n),bPix=pixels(bAnchor.img,n),N=n*n;
   const L0=new Array<number>(N),L1=new Array<number>(N),spread=new Array<number>(N);
   for(let i=0;i<N;i++){const p=i*4;L0[i]=lum(aPix,p);L1[i]=lum(bPix,p);const r=aPix[p]/255,g=aPix[p+1]/255,b=aPix[p+2]/255;spread[i]=Math.max(r,g,b)-Math.min(r,g,b)}
   const fields:Record<SatelliteLemmaViewR3565,number[]>={SOURCE:new Array(N),AMPLITUDE:new Array(N),PHASE:new Array(N),COHERENCE:new Array(N),INTERFEROGRAM:new Array(N),DEFORMATION:new Array(N),ELEVATION:new Array(N),POLARIMETRY:new Array(N),MULTI_BAND:new Array(N),TIME_STACK:new Array(N),SCAR_UNCERTAINTY:new Array(N),PROOF:new Array(N)};
   const cloudPenalty=clamp(Number(evidence?.localConditions?.cloudPct||0)/100),windPenalty=clamp(Number(evidence?.localConditions?.windKph||0)/180);
   let temporalSum=0,gradSum=0,cohSum=0,scarSum=0,supportSum=0;
   for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,l=L0[i],prev=L1[i],gx=(sample(L0,x+1,y,n)-sample(L0,x-1,y,n))/2,gy=(sample(L0,x,y+1,n)-sample(L0,x,y-1,n))/2,g=Math.hypot(gx,gy),temporal=Math.abs(l-prev),phase=(Math.atan2(gy,gx)+Math.PI)/(2*Math.PI);
    const neighbors=[sample(L0,x-1,y,n),sample(L0,x+1,y,n),sample(L0,x,y-1,n),sample(L0,x,y+1,n)],m=neighbors.reduce((s,v)=>s+v,0)/4,variance=neighbors.reduce((s,v)=>s+(v-m)*(v-m),0)/4;
    const coherence=clamp(1-temporal*1.35-Math.sqrt(variance)*.85-cloudPenalty*.18),residual=clamp(.5+(l-prev)*1.8),div=(sample(L0,x+1,y,n)+sample(L0,x-1,y,n)+sample(L0,x,y+1,n)+sample(L0,x,y-1,n)-4*l),deform=clamp(.5+(l-prev)*1.1+div*.8),terrain=clamp(.5+(-gx*.7-gy*.7)+g*.8),multi=clamp(.55*l+.45*spread[i]),scar=clamp(temporal*.6+Math.sqrt(variance)*.45+cloudPenalty*.35+windPenalty*.08),support=clamp((1-scar)*(.58+.42*coherence));
    fields.SOURCE[i]=l;fields.AMPLITUDE[i]=clamp(.35*l+.65*g*3);fields.PHASE[i]=phase;fields.COHERENCE[i]=coherence;fields.INTERFEROGRAM[i]=residual;fields.DEFORMATION[i]=deform;fields.ELEVATION[i]=terrain;fields.POLARIMETRY[i]=clamp(spread[i]*1.5);fields.MULTI_BAND[i]=multi;fields.TIME_STACK[i]=clamp(temporal*2.4);fields.SCAR_UNCERTAINTY[i]=scar;fields.PROOF[i]=support;
    temporalSum+=temporal;gradSum+=g;cohSum+=coherence;scarSum+=scar;supportSum+=support;
   }
   if(!alive)return;setResult({schema:'OMEGA_SATELLITE_CHAIN_LEMMA_R3565',state:'READY',resolution:n,fields,anchors:{current:aAnchor.src,previous:bAnchor.src,currentDate:aAnchor.date,previousDate:bAnchor.date,evidenceBound:Boolean(evidenceHash),evidenceHash,lat,lon},metrics:{temporalResidual:temporalSum/N,meanGradient:gradSum/N,meanCoherence:cohSum/N,scar:scarSum/N,support:supportSum/N,cloudPenalty},operator:'PARTITION → TRANSFORM/EXCHANGE → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE',truthClass:'DERIVED_TRIANGULATED',boundary:'NASA GIBS current/previous true-color anchors (resolved from bounded recent-date fallback sets after R419 materiality admission) plus returned local evidence are transformed into relational proxy fields immediately. SOURCE pixels are observed optical context. AMPLITUDE/PHASE/COHERENCE/INTERFEROGRAM/DEFORMATION/ELEVATION/POLARIMETRY/MULTI_BAND/TIME_STACK/SCAR/PROOF outputs are chain-lemma derived proxies, not native Sentinel-1 SAR measurements, interferometric phase, metric displacement, calibrated backscatter, DEM, or polarimetric products.'});
  }catch(error){if(!alive)return;setResult(r=>({...r,state:'UNAVAILABLE',fields:{},error:error instanceof Error?error.message:String(error)}))}})();return()=>{alive=false}},[lat,lon,evidenceHash,resolution]);
 const current=result.anchors.lat===lat&&result.anchors.lon===lon&&result.anchors.evidenceHash===evidenceHash;
 return current?result:{...result,state:'LOADING',fields:{},anchors:{...result.anchors,evidenceBound:Boolean(evidenceHash),evidenceHash,lat,lon}};
}
