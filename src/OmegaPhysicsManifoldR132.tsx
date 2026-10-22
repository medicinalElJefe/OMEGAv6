import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,Atom,Eye,Layers3,Pause,Play,RefreshCw,Rotate3d,Satellite,ShieldCheck,Waypoints} from 'lucide-react';
import {api} from './platformAdapter';
import {corpusState,decodeAddress,sourceRGB,STATE_COUNT,type Projection,type ViewMode} from './corpusRuntime';
import OmegaEarthRelativitySphereR121 from './OmegaEarthRelativitySphereR121';
import {compilePhysicsRelativityR132,R132_SCALE_HIERARCHY,type R132Harmonic} from './physicsRelativityRuntimeR132';
import './omegaPhysicsManifoldR132.css';

type Props={address:number;onAddress?:(address:number)=>void;projection?:Projection;view?:ViewMode};
type Scene='FIELD'|'MOTION'|'SCALE'|'FORCES'|'PROOF'|'EARTH';
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const fmt=(v:any,d=3)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';
const mappedEarth=(address:number)=>{const c=decodeAddress(address);return{lat:-90+(c.d+.5)/12*180,lon:-180+(c.p*12+c.r+.5)/144*360}};

function shader(gl:WebGL2RenderingContext,type:number,source:string){const s=gl.createShader(type);if(!s)throw new Error('shader allocation failed');gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile failed');return s}
function program(gl:WebGL2RenderingContext,vs:string,fs:string){const p=gl.createProgram();if(!p)throw new Error('program allocation failed');const a=shader(gl,gl.VERTEX_SHADER,vs),b=shader(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);gl.deleteShader(a);gl.deleteShader(b);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link failed');return p}

const VS=`#version 300 es
precision highp float;
layout(location=0) in vec4 aPosition;
layout(location=1) in vec4 aMetric;
layout(location=2) in vec4 aAux;
layout(location=3) in vec3 aColor;
layout(location=4) in float aRoute;
uniform float uTime;
uniform float uYaw;
uniform float uPitch;
uniform float uZoom;
uniform float uAspect;
uniform float uSigma;
uniform int uScene;
uniform vec4 uFieldA;
uniform vec4 uFieldB;
uniform vec4 uH;
uniform vec3 uForce;
out vec4 vColor;
out float vEvidence;
out float vRoute;
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
void main(){
 vec4 p=aPosition;
 float C=aMetric.x,P=aMetric.y,q=aMetric.z,L=aMetric.w;
 float scar=aAux.x,E=aAux.y,G=aAux.z,M=aAux.w;
 float harmonic=uH.x*sin(3.14159*p.x+uTime*.08)+uH.y*cos(3.14159*p.y-uTime*.05)+uH.z*sin(3.14159*p.z+uTime*.03)+uH.w*cos(3.14159*p.w-uTime*.04);
 float radial=.74+.34*uFieldA.x+.18*(C+P-E*q)-.12*L+.10*harmonic;
 if(uScene==1)radial+=.22*M+.14*uFieldB.x*sin(uTime*.7+p.z*5.0);
 if(uScene==2)radial+=.30*abs(p.w)+.08*sin((p.w+1.0)*18.8496+uTime*.12);
 if(uScene==3)radial+=.16*uForce.x*(1.0-abs(p.x))+.12*uForce.y*(1.0-abs(p.y))+.20*uForce.z*(1.0-abs(p.z));
 if(uScene==4)radial*=.55+.75*uFieldA.w*E*(1.0-q)*(1.0-L);
 p.xyz*=radial;
 float tw=(.16+.72*uFieldA.y+.18*uFieldB.y+.14*uFieldB.z)*uSigma;
 p.xw=r2(uTime*.045+tw*.50)*p.xw;
 p.yw=r2(-uTime*.031+tw*.37+uH.x*.45)*p.yw;
 p.zw=r2(uTime*.023+tw*.29+uH.y*.35)*p.zw;
 p.xy=r2(uYaw)*p.xy;
 p.yz=r2(uPitch)*p.yz;
 float wPerspective=2.35-p.w*.58;
 vec3 q3=p.xyz/max(.75,wPerspective);
 float cam=2.55-q3.z*.36;
 vec2 xy=q3.xy*(uZoom/max(.72,cam));
 xy.x/=max(.5,uAspect);
 gl_Position=vec4(xy,clamp(q3.z*.27,-.92,.92),1.0);
 float base=1.25+2.3*C+1.4*E+5.0*aRoute;
 if(uScene==4)base*=.5+1.8*E;
 gl_PointSize=clamp(base*(1.0+.65/(max(.7,cam))),1.0,10.0);
 float alpha=.05+.26*C+.22*P+.28*E+.30*aRoute-.12*q-.08*L;
 if(uScene==4)alpha*=.2+1.4*E*(1.0-q)*(1.0-L);
 if(uScene==1)alpha*=.72+.5*M;
 vec3 col=aColor;
 col=mix(col,vec3(.80,.95,.92),clamp(aRoute*.55,0.0,.65));
 vColor=vec4(col,clamp(alpha,.025,.92));vEvidence=E;vRoute=aRoute;
}`;
const FS=`#version 300 es
precision highp float;
in vec4 vColor;
in float vEvidence;
in float vRoute;
out vec4 outColor;
void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=dot(p,p);if(r>1.0)discard;float core=1.0-smoothstep(.0,1.0,r);float glow=.35+.65*core;outColor=vec4(vColor.rgb,clamp(vColor.a*glow+.16*vRoute*core,0.0,1.0));}`;

export default function OmegaPhysicsManifoldR132({address,onAddress,projection='MANDALA',view='SOURCE_COLOR'}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null),drag=useRef<{x:number;y:number;yaw:number;pitch:number}|null>(null);
 const[scene,setScene]=useState<Scene>('FIELD'),[running,setRunning]=useState(true),[yaw,setYaw]=useState(.22),[pitch,setPitch]=useState(-.16),[zoom,setZoom]=useState(2.45),[sigma,setSigma]=useState<1|-1>(1),[scaleIndex,setScaleIndex]=useState(5),[earth,setEarth]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const mapped=useMemo(()=>mappedEarth(address),[address]);
 const record=useMemo(()=>corpusState(address),[address]);
 const packet=useMemo(()=>compilePhysicsRelativityR132(address,earth),[address,earth]);
 const routeAddresses=useMemo(()=>new Set(packet.dynamics.route.path.map((x:any)=>x.address)),[packet]);
 const scale=R132_SCALE_HIERARCHY[scaleIndex];
 const force=useMemo(()=>({strong:scale.dominantForce==='Strong interaction'?1:0,em:scale.dominantForce==='Electromagnetic interaction'?1:0,gravity:scale.dominantForce==='Gravity'?1:0}),[scale]);
 const topModes=packet.canonAuthorityField.top.slice(0,5);

 const cloud=useMemo(()=>{
  const position=new Float32Array(STATE_COUNT*4),metric=new Float32Array(STATE_COUNT*4),aux=new Float32Array(STATE_COUNT*4),color=new Float32Array(STATE_COUNT*3),route=new Float32Array(STATE_COUNT);
  for(let i=0;i<STATE_COUNT;i++){
   const c=decodeAddress(i),r=corpusState(i),j=i*4,k=i*3,[cr,cg,cb]=sourceRGB(i,view);
   position[j]=(c.d-5.5)/5.5;position[j+1]=(c.p-5.5)/5.5;position[j+2]=(c.r-5.5)/5.5;position[j+3]=(c.l-5.5)/5.5;
   metric[j]=Number(r.metrics.continuity)||0;metric[j+1]=Number(r.metrics.plasticity)||0;metric[j+2]=Number(r.metrics.contradiction)||0;metric[j+3]=Number(r.metrics.burden)||0;
   aux[j]=Number(r.metrics.scar)||0;aux[j+1]=Number(r.metrics.evidence)||0;aux[j+2]=Number(r.metrics.geometry)||0;aux[j+3]=Number(r.math.normalizedMotionRelativity)||0;
   color[k]=cr/255;color[k+1]=cg/255;color[k+2]=cb/255;
   route[i]=i===address?1:i===record.autoPing.dataNext?.8:i===record.autoPing.previous?.55:routeAddresses.has(i)?.23:0;
  }
  return{position,metric,aux,color,route};
 },[address,record.autoPing.dataNext,record.autoPing.previous,routeAddresses,view]);

 const refreshEarth=async()=>{setBusy(true);setError('');try{const r=await api.get<any>(`/api/earth/evidence?lat=${mapped.lat.toFixed(5)}&lon=${mapped.lon.toFixed(5)}`);setEarth(r.data||null)}catch(e:any){setError(e?.message||'Observed Earth evidence unavailable.')}finally{setBusy(false)}};
 useEffect(()=>{void refreshEarth()},[address]);

 useEffect(()=>{
  if(scene==='EARTH')return;
  const el=canvas.current;if(!el)return;const gl=el.getContext('webgl2',{alpha:false,antialias:true,premultipliedAlpha:false});if(!gl){setError('WebGL2 is unavailable in this browser; the Earth source view remains available.');return}
  let p:WebGLProgram;try{p=program(gl,VS,FS)}catch(e:any){setError(`GPU field compile failed: ${e?.message||String(e)}`);return}
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const bind=(loc:number,size:number,data:Float32Array)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);return b};
  const buffers=[bind(0,4,cloud.position),bind(1,4,cloud.metric),bind(2,4,cloud.aux),bind(3,3,cloud.color),bind(4,1,cloud.route)];
  gl.useProgram(p);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST);gl.clearColor(.003,.012,.018,1);
  const U=(n:string)=>gl.getUniformLocation(p,n),uTime=U('uTime'),uYaw=U('uYaw'),uPitch=U('uPitch'),uZoom=U('uZoom'),uAspect=U('uAspect'),uSigma=U('uSigma'),uScene=U('uScene'),uFieldA=U('uFieldA'),uFieldB=U('uFieldB'),uH=U('uH'),uForce=U('uForce');
  let raf=0,alive=true,start=performance.now(),last=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ids:Record<Scene,number>={FIELD:0,MOTION:1,SCALE:2,FORCES:3,PROOF:4,EARTH:5};
  const h=(packet.sourceModeField.harmonics as R132Harmonic[]).slice(0,4).map(x=>x.amplitude);while(h.length<4)h.push(0);
  const draw=(now:number)=>{if(!alive)return;if(!reduced&&now-last<20){raf=requestAnimationFrame(draw);return}last=now;const rect=el.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(320,Math.round(rect.width*dpr)),hh=Math.max(360,Math.round(rect.height*dpr));if(el.width!==w||el.height!==hh){el.width=w;el.height=hh}gl.viewport(0,0,w,hh);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(p);gl.bindVertexArray(vao);
   const t=(running&&!reduced?(now-start):0)*.001;gl.uniform1f(uTime,t);gl.uniform1f(uYaw,yaw);gl.uniform1f(uPitch,pitch);gl.uniform1f(uZoom,zoom);gl.uniform1f(uAspect,w/hh);gl.uniform1f(uSigma,sigma);gl.uniform1i(uScene,ids[scene]);gl.uniform4f(uFieldA,packet.field.radialWarp,packet.field.twist,packet.field.anisotropy,packet.field.proofDensity);gl.uniform4f(uFieldB,packet.field.phaseRate,packet.field.modeEnergy,packet.field.authorityEnergy,packet.field.modeEntropy);gl.uniform4f(uH,h[0],h[1],h[2],h[3]);gl.uniform3f(uForce,force.strong,force.em,force.gravity);gl.drawArrays(gl.POINTS,0,STATE_COUNT);if(!reduced)raf=requestAnimationFrame(draw)};
  raf=requestAnimationFrame(draw);return()=>{alive=false;if(raf)cancelAnimationFrame(raf);for(const b of buffers)if(b)gl.deleteBuffer(b);if(vao)gl.deleteVertexArray(vao);gl.deleteProgram(p)};
 },[cloud,force,packet,scene,running,yaw,pitch,zoom,sigma]);

 const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{drag.current={x:e.clientX,y:e.clientY,yaw,pitch};e.currentTarget.setPointerCapture(e.pointerId)};
 const pointerMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{const d=drag.current;if(!d)return;setYaw(d.yaw+(e.clientX-d.x)*.006);setPitch(clamp(d.pitch+(e.clientY-d.y)*.006,-1.25,1.25))};
 const pointerUp=()=>{drag.current=null};
 const wheel=(e:React.WheelEvent<HTMLCanvasElement>)=>{e.preventDefault();setZoom(z=>clamp(z-e.deltaY*.0015,1.2,4.8))};
 const sceneIcon=(s:Scene)=>s==='FIELD'?<Atom/>:s==='MOTION'?<Activity/>:s==='SCALE'?<Layers3/>:s==='FORCES'?<Waypoints/>:s==='PROOF'?<ShieldCheck/>:<Satellite/>;

 return <section className='r132-physics' data-scene={scene} data-truth='reference-observed-canonical-derived-representational-separated'>
  <header className='r132-head'><div><span>OMEGA R132 · RELATIONAL PHYSICS MANIFOLD</span><h2>Physics as transformable fields, frames, scale and evidence</h2><p>20,736 canonical packets + 179 source-mode evaluations + 62 canon authorities + route dynamics + physical reference hierarchy + returned observations. Geometry changes with the active data field instead of reducing the system to a chart.</p></div><div className='r132-state'><b>STATE {record.stateId}</b><small>D{record.coordinates.d} · P{record.coordinates.p} · R{record.coordinates.r} · L{record.coordinates.l}</small></div></header>

  <nav className='r132-scenes' aria-label='Physics manifold scene'>{(['FIELD','MOTION','SCALE','FORCES','PROOF','EARTH'] as Scene[]).map(s=><button key={s} className={scene===s?'active':''} onClick={()=>setScene(s)}>{sceneIcon(s)}<span>{s}</span></button>)}</nav>

  {scene==='EARTH'?<div className='r132-earth'><OmegaEarthRelativitySphereR121 address={address} onAddress={onAddress} projection={projection} view={view}/></div>:<div className='r132-stage'>
   <canvas ref={canvas} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={wheel} onDoubleClick={()=>onAddress?.(record.autoPing.dataNext)} aria-label='GPU projected four-coordinate OMEGA physics manifold'/>
   <div className='r132-stage-hud'><span><i className='reference'/>REFERENCE PHYSICS</span><span><i className='observed'/>OBSERVED</span><span><i className='canonical'/>CANONICAL</span><span><i className='derived'/>DERIVED</span><span><i className='projection'/>PROJECTION</span></div>
   <div className='r132-camera'><button onClick={()=>setRunning(x=>!x)}>{running?<Pause/>:<Play/>}</button><button onClick={()=>setSigma(x=>x===1?-1:1)}><Rotate3d/><span>{sigma===1?'OUTVERSE +':'INVERSE −'}</span></button><button onClick={()=>{setYaw(.22);setPitch(-.16);setZoom(2.45)}}><Eye/><span>RESET FRAME</span></button></div>
  </div>}

  <div className='r132-data-rail'>
   <article><span>ALL-MODE FIELD</span><b>{packet.sourceModeField.registryCount} source modes</b><small>{packet.sourceModeField.stay} STAY · {packet.sourceModeField.turn} TURN · {packet.sourceModeField.escalate} ESCALATE</small><em>All 179 scores are folded into 12 harmonic deformation channels; this is a visualization/computation transform, not 179 physical laws.</em></article>
   <article><span>CANON GOVERNANCE</span><b>{packet.canonAuthorityField.count} authorities</b><small>{packet.canonAuthorityField.active} active · {packet.canonAuthorityField.watch} watch · {packet.canonAuthorityField.quiet} quiet</small><div className='r132-mode-tags'>{topModes.map((m:any)=><i key={m.id}>{m.name} {Math.round(m.activation*100)}%</i>)}</div></article>
   <article><span>FIELD STATE</span><div className='r132-metrics'><b>CΩ {fmt(record.metrics.continuity)}</b><b>Φ {fmt(record.metrics.plasticity)}</b><b>q {fmt(record.metrics.contradiction)}</b><b>Λ {fmt(record.metrics.burden)}</b><b>scar {fmt(record.metrics.scar)}</b><b>E {fmt(record.metrics.evidence)}</b></div><small>mode energy {fmt(packet.field.modeEnergy)} · authority energy {fmt(packet.field.authorityEnergy)} · entropy {fmt(packet.field.modeEntropy)} · motion relativity {fmt(packet.field.motionRelativityIndex)}</small></article>
   <article><span>ROUTE DYNAMICS</span><b>v* {fmt(packet.dynamics.speed)} · a* {fmt(packet.dynamics.acceleration)} · κ* {fmt(packet.dynamics.curvature)}</b><small>canonical address-space derivatives only</small><em>{packet.dynamics.boundary}</em></article>
   <article className={scene==='FORCES'?'focus':''}><span>PHYSICAL SCALE REFERENCE</span><b>{scale.scale}</b><small>{scale.dominantForce} · {scale.role}</small><div className='r132-scale-strip'>{R132_SCALE_HIERARCHY.map((s,i)=><button key={s.scale} className={i===scaleIndex?'active':''} onClick={()=>{setScaleIndex(i);setScene('FORCES')}}>{i+1}</button>)}</div><em>Reference force hierarchy is kept separate from OMEGA representation geometry.</em></article>
   <article><span>RETURNED EARTH EVIDENCE</span><b>{packet.observed.available?'CURRENT SOURCE PACKET':'UNAVAILABLE / GATED'}</b><small>{packet.observed.available?`${fmt(packet.observed.temperatureC,1)} °C · ${fmt(packet.observed.windKph,1)} km/h wind · Kp ${fmt(packet.observed.kp,1)} · Mmax ${fmt(packet.observed.maxMagnitude,1)}`:'No observation is synthesized.'}</small><button className='r132-refresh' onClick={()=>void refreshEarth()} disabled={busy}><RefreshCw className={busy?'spin':''}/>{busy?'REFRESHING':'REFRESH EVIDENCE'}</button></article>
  </div>

  {error&&<div className='r132-error'>{error}</div>}
  <footer className='r132-boundary'><ShieldCheck/><p><b>Truth boundary.</b> Published/reference constants, returned observations, canonical packet values, derived route dynamics and representational geometry remain separate. The 12×12×12×12 atlas and the 4-coordinate GPU projection are computational frames, not claims of extra measured spacetime dimensions. Missing evidence remains missing.</p></footer>
 </section>;
}
