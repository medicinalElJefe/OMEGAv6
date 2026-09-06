export const FULL_LOGICAL_ANCHORS_R119=20736;
export const FULL_VIRTUAL_ADDRESSES_R119=61917364224;

export type RenderResolutionProfileR119='MOBILE'|'BALANCED'|'FULL';
export type RenderResolutionIntentR119='AUTO'|'MOBILE'|'BALANCED'|'FULL';
export type RenderResolutionR119={
 schema:'OMEGA_RENDER_RESOLUTION_R119';
 profile:RenderResolutionProfileR119;
 cssWidth:number;
 cssHeight:number;
 devicePixelRatio:number;
 dpr:number;
 backingWidth:number;
 backingHeight:number;
 backingPixels:number;
 maxBackingPixels:number;
 logicalAnchors:number;
 virtualAddresses:number;
 fullLogicalFidelity:true;
 constrained:boolean;
 boundary:string;
};

export const R119_RESOLUTION_BOUNDARY='20,736 canonical anchors and 61,917,364,224 virtual addresses are computational/address resolution. Canvas/WebGL backing pixels are display resources only and are never equated with atlas dimensions, physical dimensions, measured pixels, or external observations.';

const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));

function environmentR119(){
 const nav=(typeof navigator!=='undefined'?navigator:null) as (Navigator&{deviceMemory?:number;connection?:{saveData?:boolean;effectiveType?:string}})|null;
 const width=typeof window!=='undefined'?window.innerWidth:1280;
 const dpr=Math.max(1,typeof window!=='undefined'?Number(window.devicePixelRatio||1):1);
 const threads=Math.max(1,Number(nav?.hardwareConcurrency||4));
 const memory=Number.isFinite(Number(nav?.deviceMemory))?Number(nav?.deviceMemory):null;
 const saveData=Boolean(nav?.connection?.saveData);
 const effectiveType=String(nav?.connection?.effectiveType||'unknown').toLowerCase();
 const slowNetwork=saveData||effectiveType==='2g'||effectiveType==='slow-2g';
 const reducedMotion=typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const mobile=width<760;
 const constrained=mobile||slowNetwork||threads<=4||(memory!==null&&memory<=4);
 return{width,dpr,threads,memory,saveData,slowNetwork,reducedMotion,mobile,constrained};
}

export function resolveRenderResolutionR119(cssWidth:number,cssHeight:number,intent:RenderResolutionIntentR119='AUTO'):RenderResolutionR119{
 const env=environmentR119();
 const w=Math.max(1,Math.floor(Number(cssWidth)||1)),h=Math.max(1,Math.floor(Number(cssHeight)||1));
 let profile:RenderResolutionProfileR119;
 if(intent==='MOBILE')profile='MOBILE';
 else if(intent==='BALANCED')profile='BALANCED';
 else if(intent==='FULL')profile='FULL';
 else profile=env.mobile?'MOBILE':env.constrained?'BALANCED':'FULL';
 if(env.slowNetwork&&profile==='FULL')profile='BALANCED';
 const targetDpr=profile==='FULL'?3.5:profile==='BALANCED'?2.75:2;
 const maxBackingPixels=profile==='FULL'?16_000_000:profile==='BALANCED'?9_000_000:5_000_000;
 const pixelBound=Math.sqrt(maxBackingPixels/Math.max(1,w*h));
 const dpr=clamp(Math.min(env.dpr,targetDpr,pixelBound),1,targetDpr);
 const backingWidth=Math.max(1,Math.round(w*dpr)),backingHeight=Math.max(1,Math.round(h*dpr));
 return{
  schema:'OMEGA_RENDER_RESOLUTION_R119',profile,cssWidth:w,cssHeight:h,devicePixelRatio:env.dpr,dpr,
  backingWidth,backingHeight,backingPixels:backingWidth*backingHeight,maxBackingPixels,
  logicalAnchors:FULL_LOGICAL_ANCHORS_R119,virtualAddresses:FULL_VIRTUAL_ADDRESSES_R119,
  fullLogicalFidelity:true,constrained:env.constrained,boundary:R119_RESOLUTION_BOUNDARY
 };
}

export function applyCanvasResolutionR119(canvas:HTMLCanvasElement,cssWidth:number,cssHeight:number,intent:RenderResolutionIntentR119='AUTO'){
 const resolution=resolveRenderResolutionR119(cssWidth,cssHeight,intent);
 if(canvas.width!==resolution.backingWidth||canvas.height!==resolution.backingHeight){canvas.width=resolution.backingWidth;canvas.height=resolution.backingHeight}
 canvas.dataset.omegaResolution='R119';
 canvas.dataset.omegaResolutionProfile=resolution.profile;
 canvas.dataset.omegaLogicalAnchors=String(resolution.logicalAnchors);
 canvas.dataset.omegaVirtualAddresses=String(resolution.virtualAddresses);
 canvas.dataset.omegaBackingPixels=String(resolution.backingPixels);
 return resolution;
}

export const R119_RENDER_RESOLUTION_AUTHORITY=Object.freeze({
 schema:'OMEGA_RENDER_RESOLUTION_R119',
 logicalAnchors:FULL_LOGICAL_ANCHORS_R119,
 virtualAddresses:FULL_VIRTUAL_ADDRESSES_R119,
 fullLogicalFidelity:true,
 profiles:{MOBILE:{targetDpr:2,maxBackingPixels:5_000_000},BALANCED:{targetDpr:2.75,maxBackingPixels:9_000_000},FULL:{targetDpr:3.5,maxBackingPixels:16_000_000}},
 boundary:R119_RESOLUTION_BOUNDARY
} as const);
