import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowLeft,ArrowRight,Boxes,Braces,ShieldCheck} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import {compileWovenContinuityR77,composeVirtualAddressR77,WOVEN_CANONICAL_COUNT,WOVEN_OUTER_SHELL_COUNT,WOVEN_VIRTUAL_COUNT,wovenBudgetR77} from './wovenContinuityRuntimeR77';
import './wovenContinuityFieldR77.css';

type Props={address:number;record:any;onAddress:(n:number)=>void};

const cl=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const fmt=(n:any,d=3)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'—';

const VERT=[
 '#version 300 es',
 'precision highp float;',
 'in vec4 aCoord;',
 'in vec4 aQuality;',
 'uniform float uTime;',
 'uniform float uAspect;',
 'uniform float uShell;',
 'uniform vec4 uActive;',
 'uniform vec4 uKernel;',
 'uniform vec4 uMode;',
 'out vec4 vData;',
 'out float vActive;',
 'void main(){',
 ' vec4 c=(aCoord-vec4(5.5))/5.5;',
 ' vec4 ac=(uActive-vec4(5.5))/5.5;',
 ' float dist4=length(c-ac);',
 ' float relation=clamp(1.0-dist4/3.2,0.0,1.0);',
 ' float shellPhase=fract(uShell/2985984.0)*6.28318530718;',
 ' float t=uTime*(0.10+0.28*uMode.x)+shellPhase;',
 ' float phase=t+dot(c,vec4(1.15,1.73,2.21,2.77));',
 ' float warp=(0.035+0.11*uKernel.y)*(0.45+0.55*relation);',
 ' float x=.68*c.x+.22*c.z+.12*sin(phase*1.7+c.w*4.0)*warp*8.0;',
 ' float y=.68*c.y+.22*c.w+.12*cos(phase*1.3+c.z*3.0)*warp*8.0;',
 ' float z=.42*c.z+.24*c.w+.18*sin(phase+c.x*2.6)*uMode.y;',
 ' float rot=.18*sin(t*.33)+.35*uMode.z;',
 ' float cs=cos(rot),sn=sin(rot);',
 ' vec2 p=vec2(cs*x-sn*y,sn*x+cs*y);',
 ' float perspective=1.0/(1.18+.24*z);',
 ' p*=perspective;',
 ' p.x/=max(.68,uAspect);',
 ' gl_Position=vec4(p,0.0,1.0);',
 ' float exact=step(dist4,.0001);',
 ' gl_PointSize=1.3+2.8*aQuality.w+2.4*relation+4.0*exact;',
 ' vData=vec4(aQuality.xyz,relation);',
 ' vActive=exact;',
 '}'
].join('\n');

const FRAG=[
 '#version 300 es',
 'precision highp float;',
 'in vec4 vData;',
 'in float vActive;',
 'uniform vec4 uKernel;',
 'out vec4 outColor;',
 'void main(){',
 ' vec2 pc=gl_PointCoord-vec2(.5);',
 ' float r=length(pc);',
 ' if(r>.5) discard;',
 ' vec3 deep=vec3(.025,.055,.065);',
 ' vec3 teal=vec3(.18,.72,.62);',
 ' vec3 gold=vec3(.91,.68,.30);',
 ' vec3 crimson=vec3(.70,.15,.22);',
 ' vec3 white=vec3(.94,.98,.98);',
 ' float C=clamp(vData.x,0.0,1.0);',
 ' float Phi=clamp(vData.y,0.0,1.0);',
 ' float q=clamp(vData.z,0.0,1.0);',
 ' float relation=clamp(vData.w,0.0,1.0);',
 ' vec3 col=mix(deep,teal,.25+.68*C);',
 ' col=mix(col,gold,.12+.45*Phi);',
 ' col=mix(col,crimson,.62*q);',
 ' col=mix(col,white,clamp(vActive*.92+relation*.08,0.0,1.0));',
 ' float edge=smoothstep(.50,.08,r);',
 ' float alpha=edge*(.10+.38*C+.24*relation+.18*uKernel.x+.26*vActive);',
 ' outColor=vec4(col,clamp(alpha,0.0,1.0));',
 '}'
].join('\n');

function shader(gl:WebGL2RenderingContext,type:number,source:string){
 const s=gl.createShader(type);if(!s)throw new Error('WebGL shader allocation failed');
 gl.shaderSource(s,source);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(s)||'shader compile failed';gl.deleteShader(s);throw new Error(msg)}
 return s;
}
function program(gl:WebGL2RenderingContext){
 const p=gl.createProgram();if(!p)throw new Error('WebGL program allocation failed');
 const vs=shader(gl,gl.VERTEX_SHADER,VERT),fs=shader(gl,gl.FRAGMENT_SHADER,FRAG);
 gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);
 if(!gl.getProgramParameter(p,gl.LINK_STATUS)){const msg=gl.getProgramInfoLog(p)||'program link failed';gl.deleteProgram(p);throw new Error(msg)}
 return p;
}
function attribute(gl:WebGL2RenderingContext,p:WebGLProgram,name:string,size:number,stride:number,offset:number){
 const loc=gl.getAttribLocation(p,name);if(loc<0)return;
 gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride,offset);
}
function uniform(gl:WebGL2RenderingContext,p:WebGLProgram,name:string){return gl.getUniformLocation(p,name)}

export default function WovenContinuityFieldR77({address,record,onAddress}:Props){
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 const liveRef=useRef({address,record});
 const shellRef=useRef(0);
 const [shell,setShell]=useState(0);
 const [refined,setRefined]=useState(false);
 const [renderer,setRenderer]=useState<'WEBGL2'|'CANVAS2D'|'UNAVAILABLE'>('WEBGL2');
 const [budget,setBudget]=useState(()=>wovenBudgetR77());
 const snapshot=useMemo(()=>compileWovenContinuityR77(record),[record]);
 const snapshotRef=useRef(snapshot);
 const virtualAddress=composeVirtualAddressR77(shell,address);
 useEffect(()=>{liveRef.current={address,record}},[address,record]);
 useEffect(()=>{snapshotRef.current=snapshot},[snapshot]);
 useEffect(()=>{shellRef.current=shell},[shell]);
 useEffect(()=>{const sync=()=>setBudget(wovenBudgetR77());window.addEventListener('resize',sync,{passive:true});return()=>window.removeEventListener('resize',sync)},[]);

 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
  if(!gl){
   setRenderer('CANVAS2D');
   const ctx=canvas.getContext('2d');if(!ctx){setRenderer('UNAVAILABLE');return}
   let raf=0,start=performance.now();
   const draw=(now:number)=>{
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,budget.dprCap);
    const w=Math.max(320,Math.floor(rect.width*dpr)),h=Math.max(260,Math.floor(rect.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#02080b';ctx.fillRect(0,0,rect.width,rect.height);
    const active=decodeAddress(liveRef.current.address),step=budget.compact?12:6,t=(now-start)/1000+shellRef.current/WOVEN_OUTER_SHELL_COUNT*Math.PI*2;
    for(let a=0;a<WOVEN_CANONICAL_COUNT;a+=step){
     const c=decodeAddress(a),rx=(c.d-5.5)/5.5,ry=(c.p-5.5)/5.5,rz=(c.r-5.5)/5.5,rw=(c.l-5.5)/5.5;
     const rel=Math.max(0,1-Math.hypot(c.d-active.d,c.p-active.p,c.r-active.r,c.l-active.l)/16);
     const x=rect.width*.5+rect.width*.34*(rx+.22*rz)+Math.sin(t*.35+a*.001)*10*rel;
     const y=rect.height*.5+rect.height*.34*(ry+.22*rw)+Math.cos(t*.29+a*.0013)*8*rel;
     const rr=a===liveRef.current.address?3.4:1.0+1.4*rel;
     ctx.beginPath();ctx.arc(x,y,rr,0,Math.PI*2);
     ctx.fillStyle=a===liveRef.current.address?'rgba(244,249,247,.96)':rel>.72?'rgba(202,166,82,.46)':'rgba(54,183,159,.28)';
     ctx.fill();
    }
    raf=requestAnimationFrame(draw);
   };
   raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf);
  }
  setRenderer('WEBGL2');
  let disposed=false,raf=0,refineCursor=0;
  const p=program(gl);gl.useProgram(p);
  const coords=new Float32Array(WOVEN_CANONICAL_COUNT*4),quality=new Float32Array(WOVEN_CANONICAL_COUNT*4);
  for(let a=0;a<WOVEN_CANONICAL_COUNT;a++){
   const c=decodeAddress(a),o=a*4;
   coords[o]=c.d;coords[o+1]=c.p;coords[o+2]=c.r;coords[o+3]=c.l;
   quality[o]=.52;quality[o+1]=.52;quality[o+2]=.28;quality[o+3]=.52;
  }
  const coordBuffer=gl.createBuffer(),qualityBuffer=gl.createBuffer();
  if(!coordBuffer||!qualityBuffer){setRenderer('UNAVAILABLE');return}
  gl.bindBuffer(gl.ARRAY_BUFFER,coordBuffer);gl.bufferData(gl.ARRAY_BUFFER,coords,gl.STATIC_DRAW);attribute(gl,p,'aCoord',4,16,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,qualityBuffer);gl.bufferData(gl.ARRAY_BUFFER,quality,gl.DYNAMIC_DRAW);attribute(gl,p,'aQuality',4,16,0);
  const U={time:uniform(gl,p,'uTime'),aspect:uniform(gl,p,'uAspect'),shell:uniform(gl,p,'uShell'),active:uniform(gl,p,'uActive'),kernel:uniform(gl,p,'uKernel'),mode:uniform(gl,p,'uMode')};
  gl.clearColor(.006,.018,.022,1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  const resize=()=>{
   const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,budget.dprCap);
   const w=Math.max(320,Math.floor(rect.width*dpr)),h=Math.max(260,Math.floor(rect.height*dpr));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
  };
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(canvas);resize();
  const started=performance.now();
  const draw=(now:number)=>{
   if(disposed)return;
   const batch=Math.min(budget.refinementBatch,WOVEN_CANONICAL_COUNT-refineCursor);
   if(batch>0){
    for(let i=0;i<batch;i++){
     const a=refineCursor+i,r=corpusState(a),o=a*4;
     quality[o]=cl(Number(r.metrics.continuity));
     quality[o+1]=cl(Number(r.metrics.plasticity));
     quality[o+2]=cl(Number(r.metrics.contradiction));
     quality[o+3]=cl(Number(r.metrics.evidence));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,qualityBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER,refineCursor*16,quality.subarray(refineCursor*4,(refineCursor+batch)*4));
    refineCursor+=batch;
    if(refineCursor>=WOVEN_CANONICAL_COUNT)setRefined(true);
   }
   const current=liveRef.current,s=snapshotRef.current,c=decodeAddress(current.address);
   gl.useProgram(p);gl.clear(gl.COLOR_BUFFER_BIT);
   gl.uniform1f(U.time,(now-started)/1000);
   gl.uniform1f(U.aspect,canvas.width/Math.max(1,canvas.height));
   gl.uniform1f(U.shell,shellRef.current);
   gl.uniform4f(U.active,c.d,c.p,c.r,c.l);
   gl.uniform4f(U.kernel,s.kernel.C,s.kernel.Phi,s.kernel.q,s.kernel.burden);
   gl.uniform4f(U.mode,s.visual.coherence,s.visual.mode188,s.visual.forecast,s.visual.prune);
   gl.drawArrays(gl.POINTS,0,WOVEN_CANONICAL_COUNT);
   raf=requestAnimationFrame(draw);
  };
  raf=requestAnimationFrame(draw);
  return()=>{disposed=true;cancelAnimationFrame(raf);ro?.disconnect();gl.deleteBuffer(coordBuffer);gl.deleteBuffer(qualityBuffer);gl.deleteProgram(p)};
 },[budget.dprCap,budget.refinementBatch,budget.compact]);

 const moveShell=(delta:number)=>setShell(v=>Math.max(0,Math.min(WOVEN_OUTER_SHELL_COUNT-1,v+delta)));
 const next=Math.max(0,Math.min(20735,Number(record?.autoPing?.dataNext??address)));
 return <section className='r77-woven' data-renderer={renderer} data-profile={budget.profile}>
  <div className='r77-stage'>
   <canvas ref={canvasRef} aria-label='Live 20,736-anchor Woven Continuity field'/>
   <div className='r77-stage-label'><span>STATE {record.stateId} · {renderer} · {budget.profile}</span><b>CΩ {fmt(snapshot.kernel.C)} · Φ {fmt(snapshot.kernel.Phi)} · q {fmt(snapshot.kernel.q)} · Λ {fmt(snapshot.kernel.burden)}</b><small>{snapshot.kernel.decision} · MODE188 {snapshot.kernel.mode188} · anchor {address.toLocaleString()} · shell {shell.toLocaleString()}</small></div>
   <div className='r77-live'><i/><b>{refined?'FULL SOURCE MAP':'REFINING SOURCE MAP'}</b><small>{WOVEN_CANONICAL_COUNT.toLocaleString()} resident anchors · {budget.targetFps} FPS target</small></div>
  </div>
  <div className='r77-controls'>
   <button onClick={()=>moveShell(-1)} disabled={shell<=0}><ArrowLeft/><span><b>Previous shell</b><small>{Math.max(0,shell-1).toLocaleString()}</small></span></button>
   <div className='r77-address'><Boxes/><span><b>{virtualAddress.toLocaleString()}</b><small>exact virtual address · shell {shell.toLocaleString()} · anchor {address.toLocaleString()}</small></span></div>
   <button onClick={()=>moveShell(1)} disabled={shell>=WOVEN_OUTER_SHELL_COUNT-1}><span><b>Next shell</b><small>{Math.min(WOVEN_OUTER_SHELL_COUNT-1,shell+1).toLocaleString()}</small></span><ArrowRight/></button>
   <button className='r77-route' onClick={()=>onAddress(next)}><Activity/><span><b>Traverse admitted state</b><small>STATE {record.stateId} → {next+1}</small></span><ArrowRight/></button>
  </div>
  <details className='r77-diagnostics'>
   <summary>Field diagnostics · computation and truth boundary</summary>
   <div className='r77-ribbon'>
    <div><span>resident lattice</span><b>{WOVEN_CANONICAL_COUNT.toLocaleString()}</b><small>12⁴ canonical anchors</small></div>
    <div><span>mode catalog pass</span><b>{snapshot.catalog.count}</b><small>{snapshot.catalog.stay} stay · {snapshot.catalog.turn} turn · {snapshot.catalog.escalate} escalate</small></div>
    <div><span>source-backed modes</span><b>{snapshot.source.applied}</b><small>{snapshot.source.exact} exact · {snapshot.source.packet} packet · {snapshot.source.gated} gated</small></div>
    <div><span>virtual field</span><b>61.917B</b><small>12⁶ shells × 12⁴ anchors</small></div>
    <div><span>source refinement</span><b>{refined?'FULL':'STREAMING'}</b><small>{budget.refinementBatch} anchors / frame budget</small></div>
   </div>
   <div className='r77-proof'><ShieldCheck/><span><b>Computational boundary.</b> The resident 20,736 lattice is rendered as one live field. Exact 12¹⁰ addressing is virtualized by shell+anchor decomposition; source refinement is time-sliced. This is a computational representation. It does not manufacture external observations or claim 20,736 physical dimensions.</span><Braces/></div>
  </details>
 </section>;
}
