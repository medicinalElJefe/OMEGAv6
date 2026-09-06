import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,Atom,Boxes,Eye,GitBranch,Layers3,Pause,Play,RefreshCw,Rotate3d,Satellite,ShieldCheck,Waypoints,Zap} from 'lucide-react';
import {api} from './platformAdapter';
import {corpusState,sourceRGB,type Projection,type ViewMode} from './corpusRuntime';
import OmegaEarthRelativitySphereR121 from './OmegaEarthRelativitySphereR121';
import {R132_SCALE_HIERARCHY} from './physicsRelativityRuntimeR132';
import {compileWovenRelativityR134,projectedPositionR134,R134_LODS,selectAdaptiveLodR134,type R134LodId,type R134ObserverFrame} from './wovenRelativityRuntimeR134';
import './omegaWovenRelativityContinuumR134.css';

type Props={address:number;onAddress?:(address:number)=>void;projection?:Projection;view?:ViewMode};
type Scene='FIELD'|'TOPOLOGY'|'FLOW'|'CAUSAL'|'SCALE'|'FORCES'|'PROOF'|'HYBRID'|'EARTH';
type RequestedLod='AUTO'|R134LodId;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const fmt=(v:any,d=3)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';

function compileShader(gl:WebGL2RenderingContext,type:number,source:string){const s=gl.createShader(type);if(!s)throw new Error('shader allocation failed');gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile failed');return s}
function compileProgram(gl:WebGL2RenderingContext,vs:string,fs:string){const p=gl.createProgram();if(!p)throw new Error('program allocation failed');const a=compileShader(gl,gl.VERTEX_SHADER,vs),b=compileShader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);gl.deleteShader(a);gl.deleteShader(b);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link failed');return p}
const TRANSFORM=`
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec3 project4(vec4 p,float t,float warp,float flow){
 float radial=.72+.42*warp+.10*sin((p.x+p.y-p.z+p.w)*3.14159+t*.11);
 p.xyz*=radial;
 float tw=(.13+.55*flow)*uSigma;
 p.xw=r2(t*.031+tw*.53)*p.xw;
 p.yw=r2(-t*.023+tw*.37)*p.yw;
 p.zw=r2(t*.017+tw*.29)*p.zw;
 p.xy=r2(uYaw)*p.xy;p.yz=r2(uPitch)*p.yz;
 float wp=2.45-p.w*.60;vec3 q=p.xyz/max(.72,wp);return q;
}`;
const POINT_VS=`#version 300 es
precision highp float;
layout(location=0)in vec4 aPosition;layout(location=1)in vec4 aMetric;layout(location=2)in vec4 aAux;layout(location=3)in vec3 aColor;layout(location=4)in float aRoute;
uniform float uTime,uYaw,uPitch,uZoom,uAspect,uSigma,uHybrid;uniform int uScene;
out vec4 vColor;out float vProof;out float vRoute;
${TRANSFORM}
void main(){float C=aMetric.x,P=aMetric.y,q=aMetric.z,L=aMetric.w,scar=aAux.x,E=aAux.y,M=aAux.z,mode=aAux.w;float warp=clamp(.28+.32*C+.18*P+.16*mode-.12*q-.10*L,0.,1.);float flow=clamp(.28*M+.28*P+.24*mode+.20*C,0.,1.);if(uScene==2)warp+=.12*sin(uTime*.8+powl(max(.01,M),.5)*6.283);if(uScene==4)warp+=.12*abs(aPosition.w);if(uScene==5)warp+=.08*mode;if(uScene==6)warp*=.48+.75*E*(1.-q)*(1.-L);if(uScene==7)warp+=.10*uHybrid*aRoute*sin(uTime*1.7);vec3 q3=project4(aPosition,uTime,warp,flow);float cam=2.65-q3.z*.38;vec2 xy=q3.xy*(uZoom/max(.72,cam));xy.x/=max(.5,uAspect);gl_Position=vec4(xy,clamp(q3.z*.28,-.95,.95),1.);float size=1.1+2.2*C+1.4*E+4.8*aRoute;if(uScene==6)size*=.45+1.75*E;gl_PointSize=clamp(size*(1.+.6/max(.8,cam)),1.,10.);float alpha=.045+.20*C+.15*P+.22*E+.20*mode+.28*aRoute-.10*q-.07*L;if(uScene==1)alpha*=.78;if(uScene==3)alpha*=.18+.95*aRoute;if(uScene==6)alpha*=.18+1.45*E*(1.-q)*(1.-L);vec3 col=mix(aColor,vec3(.76,.96,.91),clamp(aRoute*.62,0.,.7));if(uScene==7)col=mix(col,vec3(.40,.88,1.),uHybrid*aRoute*.65);vColor=vec4(col,clamp(alpha,.018,.94));vProof=E*(1.-q)*(1.-L);vRoute=aRoute;}`;
const POINT_FS=`#version 300 es
precision highp float;in vec4 vColor;in float vProof;in float vRoute;out vec4 outColor;void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;float core=1.-smoothstep(0.,1.,r);outColor=vec4(vColor.rgb,clamp(vColor.a*(.28+.72*core)+.13*vRoute*core,0.,1.));}`;
const LINE_VS=`#version 300 es
precision highp float;layout(location=0)in vec4 aPosition;layout(location=1)in vec4 aMeta;uniform float uTime,uYaw,uPitch,uZoom,uAspect,uSigma,uHybrid;uniform int uScene;out vec4 vColor;
${TRANSFORM}
void main(){float transport=aMeta.x,scar=aMeta.y,proof=aMeta.z,route=aMeta.w;float warp=.26+.32*transport+.12*scar;vec3 q3=project4(aPosition,uTime,warp,transport);float cam=2.65-q3.z*.38;vec2 xy=q3.xy*(uZoom/max(.72,cam));xy.x/=max(.5,uAspect);gl_Position=vec4(xy,clamp(q3.z*.28,-.95,.95),1.);float a=.025+.12*transport+.08*proof;if(uScene==1)a=.055+.27*transport;if(uScene==2)a=.035+.30*transport+.16*scar;if(uScene==3)a=route*(.18+.62*proof);if(uScene==6)a*=.15+1.35*proof;if(uScene==7)a=route*(.12+.58*uHybrid);vec3 c=route>0.?vec3(.86,.68,.32):mix(vec3(.08,.32,.35),vec3(.30,.88,.76),transport);if(uScene==2)c=mix(c,vec3(.76,.27,.35),scar*.55);if(uScene==6)c=mix(vec3(.13,.18,.20),vec3(.58,.94,.84),proof);if(uScene==7)c=mix(c,vec3(.34,.80,1.),uHybrid);vColor=vec4(c,clamp(a,0.,.88));}`;
const LINE_FS=`#version 300 es
precision highp float;in vec4 vColor;out vec4 outColor;void main(){outColor=vColor;}`;

const ICON:Record<Scene,typeof Atom>={FIELD:Atom,TOPOLOGY:GitBranch,FLOW:Activity,CAUSAL:Waypoints,SCALE:Layers3,FORCES:Zap,PROOF:ShieldCheck,HYBRID:Boxes,EARTH:Satellite};

export default function OmegaWovenRelativityContinuumR134({address,onAddress,projection='MANDALA',view='SOURCE_COLOR'}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null),drag=useRef<{x:number;y:number;yaw:number;pitch:number}|null>(null);
 const[scene,setScene]=useState<Scene>('FIELD'),[running,setRunning]=useState(true),[yaw,setYaw]=useState(.24),[pitch,setPitch]=useState(-.18),[zoom,setZoom]=useState(2.35),[sigma,setSigma]=useState<1|-1>(1),[frame,setFrame]=useState<R134ObserverFrame>('GLOBAL'),[requestedLod,setRequestedLod]=useState<RequestedLod>('AUTO'),[effectiveLod,setEffectiveLod]=useState<R134LodId>('VOLUME_1728'),[scaleIndex,setScaleIndex]=useState(5),[hybrid,setHybrid]=useState<any>(null),[error,setError]=useState('');
 const record=useMemo(()=>corpusState(address),[address]);
 const field=useMemo(()=>compileWovenRelativityR134(address,effectiveLod,projection,frame),[address,effectiveLod,projection,frame]);
 const scale=R132_SCALE_HIERARCHY[scaleIndex];
 const pcOnline=Boolean(hybrid?.nativeExecutionClaimed===true&&(hybrid?.authenticatedHeartbeat===true||hybrid?.heartbeatAuthenticated===true||String(hybrid?.connectionState||hybrid?.state||'').toUpperCase()==='PC ONLINE'||String(hybrid?.state||'').toUpperCase()==='VERIFIED_DEVICE_ONLINE'));

 useEffect(()=>{let live=true;const read=async()=>{try{const r=await api.get<any>('/api/hybrid/status');if(live)setHybrid(r.data||null)}catch{if(live)setHybrid(null)}};void read();const id=window.setInterval(read,15000);return()=>{live=false;window.clearInterval(id)}},[]);
 useEffect(()=>{const el=canvas.current;if(!el||scene==='EARTH')return;const obs=new ResizeObserver(()=>{const r=el.getBoundingClientRect(),next=selectAdaptiveLodR134(r.width,window.devicePixelRatio||1,zoom,requestedLod);setEffectiveLod(x=>x===next?x:next)});obs.observe(el);const r=el.getBoundingClientRect();setEffectiveLod(selectAdaptiveLodR134(r.width,window.devicePixelRatio||1,zoom,requestedLod));return()=>obs.disconnect()},[requestedLod,zoom,scene]);

 const gpu=useMemo(()=>{
  const n=field.points.length,pos=new Float32Array(n*4),metric=new Float32Array(n*4),aux=new Float32Array(n*4),color=new Float32Array(n*3),route=new Float32Array(n);
  field.points.forEach((p,i)=>{const j=i*4,k=i*3,[r,g,b]=sourceRGB(p.address,view);pos.set(p.position,j);metric.set([p.C,p.Phi,p.q,p.Lambda],j);aux.set([p.scarCarry,p.evidence,p.motion,p.modeResponse],j);color.set([r/255,g/255,b/255],k);route[i]=p.routeWeight});
  const allEdges=[...field.edges,...field.routeEdges],epos=new Float32Array(allEdges.length*8),emeta=new Float32Array(allEdges.length*8),pointMap=new Map(field.points.map(p=>[p.address,p.position]));
  allEdges.forEach((e,i)=>{const a=pointMap.get(e.from)||projectedPositionR134(e.from,address,frame,projection),b=pointMap.get(e.to)||projectedPositionR134(e.to,address,frame,projection),j=i*8,routeFlag=e.truth==='DERIVED_ROUTE_CANDIDATE'?1:0;epos.set(a,j);epos.set(b,j+4);const meta=[e.transport,e.scarGradient,e.proofWeight,routeFlag];emeta.set(meta,j);emeta.set(meta,j+4)});
  return{pos,metric,aux,color,route,epos,emeta,edgeVertices:allEdges.length*2};
 },[field,view,address,frame,projection]);

 useEffect(()=>{
  if(scene==='EARTH')return;const el=canvas.current;if(!el)return;const gl=el.getContext('webgl2',{alpha:false,antialias:true,premultipliedAlpha:false});if(!gl){setError('WebGL2 unavailable. Earth evidence view remains available.');return}setError('');
  let pp:WebGLProgram,lp:WebGLProgram;try{pp=compileProgram(gl,POINT_VS,POINT_FS);lp=compileProgram(gl,LINE_VS,LINE_FS)}catch(e:any){setError(`GPU continuum compile failed: ${e?.message||String(e)}`);return}
  const makeVao=(program:WebGLProgram,defs:Array<[number,number,Float32Array]>)=>{const vao=gl.createVertexArray()!;gl.bindVertexArray(vao);const bs:WebGLBuffer[]=[];for(const[loc,size,data]of defs){const b=gl.createBuffer()!;bs.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0)}return{vao,bs,program}};
  const points=makeVao(pp,[[0,4,gpu.pos],[1,4,gpu.metric],[2,4,gpu.aux],[3,3,gpu.color],[4,1,gpu.route]]),lines=makeVao(lp,[[0,4,gpu.epos],[1,4,gpu.emeta]]);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST);gl.clearColor(.002,.009,.013,1);
  const ids:Record<Scene,number>={FIELD:0,TOPOLOGY:1,FLOW:2,CAUSAL:3,SCALE:4,FORCES:5,PROOF:6,HYBRID:7,EARTH:8};
  const uniforms=(p:WebGLProgram,n:string)=>gl.getUniformLocation(p,n),setCommon=(p:WebGLProgram,t:number,aspect:number)=>{gl.useProgram(p);gl.uniform1f(uniforms(p,'uTime'),t);gl.uniform1f(uniforms(p,'uYaw'),yaw);gl.uniform1f(uniforms(p,'uPitch'),pitch);gl.uniform1f(uniforms(p,'uZoom'),zoom);gl.uniform1f(uniforms(p,'uAspect'),aspect);gl.uniform1f(uniforms(p,'uSigma'),sigma);gl.uniform1f(uniforms(p,'uHybrid'),pcOnline?1:0);gl.uniform1i(uniforms(p,'uScene'),ids[scene])};
  let alive=true,raf=0,start=performance.now(),pausedAt=0,last=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw=(now:number)=>{if(!alive)return;if(!reduced&&now-last<20){raf=requestAnimationFrame(draw);return}last=now;const rect=el.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1),w=Math.max(320,Math.round(rect.width*dpr)),h=Math.max(420,Math.round(rect.height*dpr));if(el.width!==w||el.height!==h){el.width=w;el.height=h}gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT);const t=(running&&!reduced?(now-start):pausedAt)*.001,aspect=w/h;
   if(running)pausedAt=now-start;
   setCommon(lp,t,aspect);gl.bindVertexArray(lines.vao);gl.drawArrays(gl.LINES,0,gpu.edgeVertices);
   setCommon(pp,t,aspect);gl.bindVertexArray(points.vao);gl.drawArrays(gl.POINTS,0,field.points.length);
   if(!reduced)raf=requestAnimationFrame(draw)};
  raf=requestAnimationFrame(draw);return()=>{alive=false;if(raf)cancelAnimationFrame(raf);for(const b of [...points.bs,...lines.bs])gl.deleteBuffer(b);gl.deleteVertexArray(points.vao);gl.deleteVertexArray(lines.vao);gl.deleteProgram(pp);gl.deleteProgram(lp)};
 },[gpu,field.points.length,scene,running,yaw,pitch,zoom,sigma,pcOnline]);

 const down=(e:React.PointerEvent<HTMLCanvasElement>)=>{drag.current={x:e.clientX,y:e.clientY,yaw,pitch};e.currentTarget.setPointerCapture(e.pointerId)};
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{const d=drag.current;if(!d)return;setYaw(d.yaw+(e.clientX-d.x)*.006);setPitch(clamp(d.pitch+(e.clientY-d.y)*.006,-1.28,1.28))};
 const up=()=>{drag.current=null};
 const wheel=(e:React.WheelEvent<HTMLCanvasElement>)=>{e.preventDefault();setZoom(z=>clamp(z-e.deltaY*.0015,1.05,5.2))};
 const reset=()=>{setYaw(.24);setPitch(-.18);setZoom(2.35);setSigma(1);setFrame('GLOBAL');setRequestedLod('AUTO')};

 return <section className='r134-continuum' data-scene={scene} data-lod={effectiveLod} data-frame={frame} data-truth='structural-route-observed-execution-operational-separated'>
  <header className='r134-head'><div><span>OMEGA R134 · WOVEN RELATIVITY CONTINUUM</span><h2>One field. Relational topology. Motion, history, evidence and observer-relative scale.</h2><p>The visual is no longer an unconnected packet cloud: canonical D/P/R/L adjacency is woven into a weighted topology; continuity transports across edges, scar changes remain visible, all-mode harmonics deform local response, and route candidates remain explicitly separate from empirical causation.</p></div><div className='r134-now'><b>STATE {record.stateId}</b><small>D{record.coordinates.d+1} · P{record.coordinates.p+1} · R{record.coordinates.r+1} · L{record.coordinates.l+1}</small><em>{pcOnline?'PC ONLINE · HEARTBEAT PROVEN':'PC EXECUTION NOT CURRENTLY PROVEN'}</em></div></header>
  <div className='r134-toolbars'>
   <nav className='r134-scenes' aria-label='Relational continuum scene'>{(['FIELD','TOPOLOGY','FLOW','CAUSAL','SCALE','FORCES','PROOF','HYBRID','EARTH'] as Scene[]).map(s=>{const I=ICON[s];return <button key={s} className={scene===s?'active':''} onClick={()=>setScene(s)}><I/><span>{s}</span></button>})}</nav>
   <div className='r134-view-controls'><label>LOD<select value={requestedLod} onChange={e=>setRequestedLod(e.target.value as RequestedLod)}><option value='AUTO'>AUTO</option>{R134_LODS.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label><button className={frame==='GLOBAL'?'active':''} onClick={()=>setFrame('GLOBAL')}>GLOBAL</button><button className={frame==='LOCAL'?'active':''} onClick={()=>setFrame('LOCAL')}>LOCAL</button><button onClick={()=>setSigma(s=>s===1?-1:1)}><Rotate3d/>{sigma===1?'OUTVERSE +':'INVERSE −'}</button><button onClick={()=>setRunning(x=>!x)}>{running?<Pause/>:<Play/>}{running?'PAUSE':'PLAY'}</button><button onClick={reset}><RefreshCw/>RESET</button></div>
  </div>
  {scene==='EARTH'?<div className='r134-earth'><OmegaEarthRelativitySphereR121 address={address} onAddress={onAddress} projection={projection} view={view}/></div>:<div className='r134-stage'>
   <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel} onDoubleClick={()=>onAddress?.(record.autoPing.dataNext)} aria-label='GPU woven 4-coordinate relational continuum'/>
   <div className='r134-truth-hud'><span><i className='topology'/>CANONICAL ADJACENCY</span><span><i className='route'/>ROUTE CANDIDATE</span><span><i className='proof'/>EVIDENCE WEIGHT</span><span><i className='hybrid'/>HYBRID HEARTBEAT</span></div>
   <div className='r134-camera'><button onClick={()=>setZoom(z=>clamp(z+.22,1.05,5.2))}>＋</button><span>{zoom.toFixed(2)}×</span><button onClick={()=>setZoom(z=>clamp(z-.22,1.05,5.2))}>−</button></div>
   <div className='r134-stage-note'>DRAG · ROTATE · WHEEL/PINCH ZOOM · DOUBLE-CLICK ADMITTED NEXT · {effectiveLod.replaceAll('_',' ')}</div>
  </div>}
  <section className='r134-metrics'>
   <article><span>FIELD</span><b>{field.counts.points.toLocaleString()} packets</b><small>{field.counts.canonicalEdges.toLocaleString()} canonical edges · {field.counts.routeCandidateEdges} route candidates</small></article>
   <article><span>ALL-MODE RESPONSE</span><b>{field.counts.sourceModes} + {field.counts.canonAuthorities}</b><small>source evaluations + canon authorities · folded through local D/P/R/L response</small></article>
   <article><span>CONTINUITY / SCAR</span><b>CΩ {fmt(record.metrics.continuity)} · scar {fmt(record.metrics.scar)}</b><small>Φ {fmt(record.metrics.plasticity)} · q {fmt(record.metrics.contradiction)} · Λ {fmt(record.metrics.burden)}</small></article>
   <article><span>OBSERVER FRAME</span><b>{frame} · {projection}</b><small>whole/part and inner/outer are view roles; CanonState is unchanged</small></article>
  </section>
  {(scene==='SCALE'||scene==='FORCES')&&<section className='r134-scale'><header><Layers3/><span><b>{scale.scale}</b><small>{scale.dominantForce} · reference hierarchy, not OMEGA geometry</small></span></header><input type='range' min='0' max={R132_SCALE_HIERARCHY.length-1} value={scaleIndex} onChange={e=>setScaleIndex(Number(e.target.value))}/><p>{scale.role}</p></section>}
  <section className='r134-development'><Eye/><span><b>SIMULTANEOUS SYSTEM DEVELOPMENT CONTEXT</b><small>{field.development.map(x=>`${x.lane.replaceAll('_',' ')} ${x.count}`).join(' · ')} · operational status is not execution proof or physics evidence</small></span></section>
  <footer className='r134-boundary'><ShieldCheck/><div><b>{field.dimensionBoundary}</b><span>{scene==='CAUSAL'?field.causalityBoundary:field.authorityBoundary}</span></div>{error&&<strong>{error}</strong>}</footer>
 </section>;
}
