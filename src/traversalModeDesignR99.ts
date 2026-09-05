export type TraversalDesignModeR99='UNIFIED'|'SHELL'|'WATER'|'LIGHT'|'SCAR'|'RELATIVITY'|'FORECAST'|'PROOF';

export type TraversalVisualProfileR99={
 id:TraversalDesignModeR99;
 bands:number;
 petals:number;
 density:number;
 radial:number;
 polyScale:number;
 particleScale:number;
 alpha:number;
 flow:number;
 branch:number;
 scar:number;
 relativity:number;
 proofGate:number;
 shellQuantize:number;
 satelliteCount:number;
 sourceMap:string;
 geometryMap:string;
};

export const TRAVERSAL_MODE_DESIGN_R99:Record<TraversalDesignModeR99,Omit<TraversalVisualProfileR99,'sourceMap'|'geometryMap'>>={
 UNIFIED:{id:'UNIFIED',bands:12,petals:5,density:1,radial:1,polyScale:1,particleScale:1,alpha:1,flow:.18,branch:.08,scar:.08,relativity:.18,proofGate:.06,shellQuantize:0,satelliteCount:6},
 SHELL:{id:'SHELL',bands:18,petals:6,density:.86,radial:1.08,polyScale:1.16,particleScale:.92,alpha:.92,flow:.06,branch:.02,scar:.04,relativity:.06,proofGate:.04,shellQuantize:.92,satelliteCount:12},
 WATER:{id:'WATER',bands:10,petals:3,density:1.12,radial:1.02,polyScale:.84,particleScale:.82,alpha:.82,flow:1,branch:.05,scar:.04,relativity:.12,proofGate:.02,shellQuantize:0,satelliteCount:6},
 LIGHT:{id:'LIGHT',bands:8,petals:12,density:.72,radial:1.16,polyScale:1.05,particleScale:1.24,alpha:1.18,flow:.08,branch:.16,scar:.02,relativity:.08,proofGate:.62,shellQuantize:0,satelliteCount:8},
 SCAR:{id:'SCAR',bands:9,petals:4,density:.88,radial:.94,polyScale:.92,particleScale:.9,alpha:1.08,flow:.12,branch:.08,scar:1,relativity:.05,proofGate:.08,shellQuantize:.18,satelliteCount:7},
 RELATIVITY:{id:'RELATIVITY',bands:12,petals:5,density:.96,radial:1,polyScale:1,particleScale:.95,alpha:.96,flow:.12,branch:.08,scar:.04,relativity:1,proofGate:.05,shellQuantize:0,satelliteCount:6},
 FORECAST:{id:'FORECAST',bands:8,petals:7,density:.78,radial:1.12,polyScale:.9,particleScale:.88,alpha:.9,flow:.08,branch:1,scar:.06,relativity:.18,proofGate:.1,shellQuantize:0,satelliteCount:9},
 PROOF:{id:'PROOF',bands:6,petals:6,density:.62,radial:.9,polyScale:.94,particleScale:1.28,alpha:1.22,flow:.02,branch:.04,scar:.06,relativity:.04,proofGate:1,shellQuantize:.08,satelliteCount:6}
};

const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));

export function traversalVisualProfileR99(mode:TraversalDesignModeR99,u:any):TraversalVisualProfileR99{
 const base=TRAVERSAL_MODE_DESIGN_R99[mode];
 const C=clamp(Number(u?.C)),Phi=clamp(Number(u?.Phi)),q=clamp(Number(u?.q)),Lambda=clamp(Number(u?.Lambda)),scar=clamp(Number(u?.scar)),evidence=clamp(Number(u?.evidence)),coherence=clamp(Number(u?.unifiedCoherence));
 return{
  ...base,
  bands:Math.max(4,Math.round(base.bands*(.82+.28*C))),
  density:base.density*(.78+.3*coherence),
  radial:base.radial*(.92+.14*Phi-.05*Lambda),
  particleScale:base.particleScale*(.86+.26*evidence),
  alpha:base.alpha*(.78+.34*evidence)*(1-.18*q),
  sourceMap:`CΩ ${C.toFixed(3)} · Φ ${Phi.toFixed(3)} · q ${q.toFixed(3)} · Λ ${Lambda.toFixed(3)} · scar ${scar.toFixed(3)} · evidence ${evidence.toFixed(3)}`,
  geometryMap:mode==='WATER'?'continuity/plasticity → streamline curl + wave spacing':mode==='LIGHT'?'evidence/coherence → surviving emitters + beam clarity':mode==='SCAR'?'scar/contradiction → path displacement + persistence':mode==='RELATIVITY'?'observer relativity/anisotropy → frame shear + depth compression':mode==='FORECAST'?'plasticity/route branch → split corridor ghosts':mode==='PROOF'?'evidence/contradiction → visibility gate + luminance':mode==='SHELL'?'shell pressure/continuity → quantized radial bands':'all declared channels → balanced membrane geometry'
 };
}

export function warpTraversalPointR99(mode:TraversalDesignModeR99,p:{x:number;y:number;z:number;weight:number},index:number,total:number,u:any,t:number,profile:TraversalVisualProfileR99){
 let{x,y,z}=p;const q=clamp(Number(u?.q)),C=clamp(Number(u?.C)),Phi=clamp(Number(u?.Phi)),scar=clamp(Number(u?.scar)),ev=clamp(Number(u?.evidence));const phase=index/Math.max(1,total-1)*Math.PI*2;
 if(mode==='WATER'){
  const w=(.055+.16*Phi)*profile.flow;x+=Math.sin(y*5.2+t*.52+phase*.18)*w;y+=Math.sin(z*4.1-t*.39+phase*.11)*w*.72;z+=Math.cos(x*3.4+t*.31)*w*.5;
 }else if(mode==='LIGHT'){
  const beam=.78+1.18*ev;x*=beam;y*=.38+.44*C;z*=.5+.48*ev;
 }else if(mode==='SCAR'){
  const s=(.035+.18*scar+.08*q)*profile.scar;x+=Math.sin(phase*3+t*.16)*s;y+=Math.sin(phase*5-t*.11)*s*.7;z+=(scar-.5)*s*1.8;
 }else if(mode==='RELATIVITY'){
  const rel=profile.relativity*(.08+.34*Number(u?.motionRelativity||0));x*=1+rel;y*=1-rel*.46;z+=x*rel*.16;
 }else if(mode==='FORECAST'){
  const lane=(index%3)-1,spread=(.04+.2*Phi)*profile.branch;x+=lane*spread;y+=Math.sin(phase*2+t*.12)*spread*.5;z+=lane*spread*.7;
 }else if(mode==='PROOF'){
  const gate=Math.pow(Math.max(.01,ev),1.35)*(1-.52*q);x*=.32+.78*gate;y*=.32+.78*gate;z=(ev-q)*.34+z*.22;
 }else if(mode==='SHELL'){
  const r=Math.hypot(x,y)+1e-6,a=Math.atan2(y,x),bands=12,step=.055,qr=.12+Math.round(r/step)%bands*step;x=Math.cos(a)*qr;y=Math.sin(a)*qr;z*=.52+.3*C;
 }
 return{x,y,z,weight:p.weight};
}
