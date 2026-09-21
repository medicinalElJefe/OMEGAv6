import{useEffect,useMemo,useRef,useState}from'react';
import{Pause,Play,RotateCcw,StepBack,StepForward}from'lucide-react';
import{compileTraversalFieldR347,TRAVERSAL_VISUAL_GRAMMAR_R347,type TraversalFieldNodeR347,type TraversalObservationPacketR347}from'./traversalFieldR347';
import'./traversalFieldR347.css';

type Lens='UNIFIED'|'SPACE'|'TIME'|'INTENSITY'|'CONTINUITY'|'SCAR'|'FUTURES'|'PROOF';
type Props={variant:string;address:number;onAddress:(n:number)=>void;observations?:TraversalObservationPacketR347[];initialDepth?:number};
const LENSES:Lens[]=['UNIFIED','SPACE','TIME','INTENSITY','CONTINUITY','SCAR','FUTURES','PROOF'];
const RESOLUTIONS=[12,144,1728,20736,248832] as const;
const EMPTY_OBSERVATIONS:TraversalObservationPacketR347[]=[];
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const fmt=(n:number,d=3)=>Number.isFinite(n)?n.toFixed(d):'—';

function lensAlpha(lens:Lens,n:TraversalFieldNodeR347){
 if(lens==='PROOF')return .12+.88*n.evidence;
 if(lens==='SCAR')return .16+.84*n.scar;
 if(lens==='INTENSITY')return .15+.85*n.modelIntensity;
 if(lens==='CONTINUITY')return .15+.85*n.continuityFlux;
 if(lens==='TIME')return .72;
 return .32+.58*n.evidence;
}
function lensRadius(lens:Lens,n:TraversalFieldNodeR347){
 if(lens==='INTENSITY')return 3+8*n.modelIntensity;
 if(lens==='SCAR')return 3+8*n.scar;
 if(lens==='CONTINUITY')return 3+8*n.continuityFlux;
 if(lens==='PROOF')return 2+8*n.evidence;
 return 3+5*n.support;
}

export default function TraversalFieldCockpitR347({variant,address,onAddress,observations=EMPTY_OBSERVATIONS,initialDepth=48}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null),clock=useRef({last:0,t:0}),camera=useRef({yaw:0,pitch:0,drag:false,lastX:0,lastY:0});
 const[lens,setLens]=useState<Lens>('UNIFIED'),[playing,setPlaying]=useState(false),[depth,setDepth]=useState(()=>Math.max(12,Math.min(144,initialDepth))),[speed,setSpeed]=useState(1),[cursor,setCursor]=useState(0),[zoom,setZoom]=useState(1);
 const field=useMemo(()=>compileTraversalFieldR347(address,depth,observations),[address,depth,observations]);
 useEffect(()=>{setCursor(0);clock.current={last:0,t:0}},[address,depth]);
 useEffect(()=>setDepth(Math.max(12,Math.min(144,initialDepth))),[initialDepth]);
 useEffect(()=>{if(!playing)return;const n=field.nodes[Math.min(cursor,field.nodes.length-1)],rate=.35+1.65*(n?.motionRate??0),id=window.setTimeout(()=>setCursor(i=>Math.min(field.nodes.length-1,i+1)),Math.max(100,900/(speed*rate)));return()=>clearTimeout(id)},[playing,speed,cursor,field.nodes]);
 useEffect(()=>{if(cursor>=field.nodes.length-1)setPlaying(false)},[cursor,field.nodes.length]);

 useEffect(()=>{const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;let raf=0,alive=true;
  const render=(ms:number)=>{if(!alive)return;const rect=el.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(420,rect.width),h=Math.max(420,rect.height);
   if(el.width!==Math.floor(w*dpr)||el.height!==Math.floor(h*dpr)){el.width=Math.floor(w*dpr);el.height=Math.floor(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);
   const dt=clock.current.last?Math.min(.05,(ms-clock.current.last)/1000):0;clock.current.last=ms;if(playing)clock.current.t+=dt*speed;
   ctx.fillStyle='#020608';ctx.fillRect(0,0,w,h);
   const cx=w*.52,cy=h*.46,scale=Math.min(w,h)*.33;
   const horizon=ctx.createRadialGradient(cx,cy,8,cx,cy,scale*1.5);horizon.addColorStop(0,'rgba(32,89,88,.12)');horizon.addColorStop(.55,'rgba(7,22,27,.08)');horizon.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=horizon;ctx.fillRect(0,0,w,h);

   const activeNode=field.nodes[Math.min(cursor,field.nodes.length-1)],activeResolutionIndex=Math.max(0,RESOLUTIONS.indexOf((activeNode?.effectiveResolution??12) as any));
   for(let i=0;i<5;i++){const rr=scale*(.26+i*.19),active=i===activeResolutionIndex;ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.strokeStyle=active?'rgba(222,186,111,.58)':'rgba(180,201,195,'+(0.035+i*.008)+')';ctx.lineWidth=active?1.8:.7;ctx.setLineDash(active?[]:[2+i,9+i*2]);ctx.stroke();ctx.setLineDash([])}
   const physicalSpace=lens==='SPACE'&&field.space.authority==='UNIT_BOUND_PHYSICAL_SPACE',pp=physicalSpace?field.nodes.map(n=>n.physicalPosition!):[],xs=pp.map(p=>p.x),ys=pp.map(p=>p.y),zs=pp.map(p=>p.z),mid=(v:number[])=>v.length?(Math.min(...v)+Math.max(...v))/2:0,span=(v:number[])=>v.length?Math.max(1e-12,Math.max(...v)-Math.min(...v)):1,pxMid=mid(xs),pyMid=mid(ys),pzMid=mid(zs),pScale=Math.max(span(xs),span(ys),span(zs));
   const pts=field.nodes.map((n,i)=>{const phase=(i/Math.max(1,field.nodes.length-1)-.5)*.9,physical=n.physicalPosition,x0=physicalSpace&&physical?(physical.x-pxMid)/pScale:n.x*.72+Math.sin(phase)*.28,y0=physicalSpace&&physical?(physical.y-pyMid)/pScale:n.y*.58-phase*.38,z0=physicalSpace&&physical?(physical.z-pzMid)/pScale:n.z,cyaw=Math.cos(camera.current.yaw),syaw=Math.sin(camera.current.yaw),cp=Math.cos(camera.current.pitch),sp=Math.sin(camera.current.pitch),x1=x0*cyaw+z0*syaw,z1=-x0*syaw+z0*cyaw,y1=y0*cp-z1*sp,z2=y0*sp+z1*cp,persp=1/(1.7-.45*z2),s=scale*zoom*persp;return{x:cx+x1*s,y:cy+y1*s,z:z2,n}});

   for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=b.n,active=i<=cursor,persistence=.18+.82*n.scar;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=active?'rgba(78,205,187,'+(.10+.44*n.evidence+.18*persistence)+')':'rgba(91,122,126,.09)';ctx.lineWidth=active?1+4*(.55*n.continuityFlux+.45*n.invariantCarry):.7;ctx.stroke();if(active&&n.scar>.08){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='rgba(207,78,100,'+(.02+.12*n.scar)+')';ctx.lineWidth=.5+2.2*n.residualCarry;ctx.stroke()}}
   for(let i=0;i<pts.length;i++){const p=pts[i],n=p.n,active=i<=cursor,uncertainty=clamp(.55*n.contradiction+.45*n.burden);
    if(active&&n.scar>.05){ctx.beginPath();ctx.arc(p.x,p.y,8+28*n.scar,0,Math.PI*2);ctx.strokeStyle='rgba(207,78,100,'+(.025+.16*n.scar)+')';ctx.lineWidth=1+2*n.residualCarry;ctx.stroke()}
    const rad=lensRadius(lens,n)*(active?1:.62),alpha=lensAlpha(lens,n)*(active?1:.28),compression=1-.48*n.burden;ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,compression);ctx.beginPath();ctx.arc(0,0,rad,0,Math.PI*2);ctx.fillStyle=lens==='SCAR'?'rgba(208,78,101,'+alpha+')':lens==='INTENSITY'?'rgba(229,207,142,'+alpha+')':lens==='PROOF'?'rgba(219,181,106,'+alpha+')':'rgba(83,205,190,'+alpha+')';ctx.fill();ctx.restore();
    if(active&&n.contradiction>.08){const cuts=Math.max(1,Math.round(1+n.contradiction*5));for(let k=0;k<cuts;k++){const a=(k/cuts)*Math.PI*2+n.orientation*.24,len=rad*(.8+1.2*n.contradiction);ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*rad*.45,p.y+Math.sin(a)*rad*.45*compression);ctx.lineTo(p.x+Math.cos(a)*len,p.y+Math.sin(a)*len*compression);ctx.strokeStyle='rgba(221,113,126,'+(.10+.38*n.contradiction)+')';ctx.lineWidth=.6+1.5*n.contradiction;ctx.stroke()}}
    if(active&&uncertainty>.12){ctx.beginPath();ctx.arc(p.x,p.y,10+30*uncertainty,0,Math.PI*2);ctx.strokeStyle='rgba(151,178,186,'+(.025+.11*(1-n.evidence))+')';ctx.setLineDash([2,5]);ctx.stroke();ctx.setLineDash([])}
   }

   const current=pts[Math.min(cursor,pts.length-1)];
   if(current){const spread=.22+.72*current.n.plasticity;field.futures.forEach((f,i)=>{const a=(i-(field.futures.length-1)/2)*.34*spread,tx=current.x+Math.cos(a)*scale*(.34+.40*f.support),ty=current.y+Math.sin(a)*scale*(.18+.30*f.support)-(i%2?1:-1)*scale*.08*f.support;ctx.beginPath();ctx.moveTo(current.x,current.y);ctx.quadraticCurveTo((current.x+tx)/2,current.y-scale*.08*(i%2?1:-1),tx,ty);const admitted=f.relation==='ADMITTED_NEXT';ctx.strokeStyle=admitted?'rgba(93,215,194,'+(lens==='FUTURES'?.30+.58*f.support:.12+.24*f.support)+')':'rgba(219,184,111,'+(lens==='FUTURES'?.16+.44*f.support:.05+.15*f.support)+')';ctx.lineWidth=admitted?(lens==='FUTURES'?2+3.4*f.support:1.2+1.5*f.support):(lens==='FUTURES'?1+2.2*f.support:.6+1*f.support);ctx.stroke();ctx.beginPath();ctx.arc(tx,ty,2.5+4*f.support,0,Math.PI*2);ctx.fillStyle='rgba(219,184,111,'+(.2+.55*f.support)+')';ctx.fill()})}

   if(lens==='TIME'){const y=h*.90;ctx.beginPath();ctx.moveTo(w*.08,y);ctx.lineTo(w*.92,y);ctx.strokeStyle='rgba(174,197,198,.24)';ctx.stroke();pts.forEach((p,i)=>{if(i%Math.max(1,Math.floor(pts.length/12))===0||i===cursor){const x=w*.08+(w*.84)*(i/Math.max(1,pts.length-1));ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x,y+7);ctx.strokeStyle=i===cursor?'rgba(226,188,111,.9)':'rgba(148,173,177,.26)';ctx.stroke()}})}
   raf=requestAnimationFrame(render)};
  raf=requestAnimationFrame(render);return()=>{alive=false;cancelAnimationFrame(raf)}
 },[field,lens,cursor,playing,speed,zoom]);

 const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{camera.current.drag=true;camera.current.lastX=e.clientX;camera.current.lastY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)};
 const pointerMove=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!camera.current.drag)return;const dx=e.clientX-camera.current.lastX,dy=e.clientY-camera.current.lastY;camera.current.lastX=e.clientX;camera.current.lastY=e.clientY;camera.current.yaw+=dx*.006;camera.current.pitch=Math.max(-1.2,Math.min(1.2,camera.current.pitch+dy*.006))};
 const pointerUp=(e:React.PointerEvent<HTMLCanvasElement>)=>{camera.current.drag=false;try{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}catch{}};
 const wheel=(e:React.WheelEvent<HTMLCanvasElement>)=>{e.preventDefault();setZoom(v=>Math.max(.55,Math.min(2.2,v*(e.deltaY>0 ? .92 : 1.08))))};
 const current=field.nodes[Math.min(cursor,field.nodes.length-1)]||field.nodes[0];
 return <section className='r347-cockpit' data-lens={lens} data-energy-authority={field.energy.authority}>
  <header><div><span>R347 HUMAN-CORRELATED FIELD · ONE VISUAL LAW</span><b>{variant} · {lens}</b><small>Worldline + field + admissible future cone · source state preserved</small></div><code>STATE {current?.stateId??'—'} · t+{current?.step??0}</code></header>
  <nav aria-label='R347 traversal lens'>{LENSES.map(x=><button key={x} className={lens===x?'active':''} onClick={()=>setLens(x)}>{x}</button>)}</nav>
  <div className='r347-stage'><canvas ref={canvas} aria-label='Human-correlated OMEGA traversal field' onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onWheel={wheel}/></div>
  <div className='r347-timebar'><span>PAST / SCAR</span><input type='range' min='0' max={Math.max(0,field.nodes.length-1)} value={Math.min(cursor,Math.max(0,field.nodes.length-1))} onChange={e=>{setPlaying(false);setCursor(Number(e.target.value))}}/><b>t+{current?.step??0} / {Math.max(0,field.nodes.length-1)}</b><span>ADMISSIBLE FUTURES</span></div>
  <div className='r347-futures'>{field.futures.slice(0,6).map(f=><button key={f.relation+f.address} onClick={()=>onAddress(f.address)} title={f.truthBoundary}><span>{f.relation.replaceAll('_',' ')}{f.relation==='ADMITTED_NEXT'?' · CANON':''}</span><b>{fmt(f.support)}</b><small>unified coherence · not probability · state {f.stateId}</small></button>)}</div>
  <div className='r347-readout'>
   <div><span>LOGICAL TIME</span><b>t+{current?.step??0}</b><small>{current?.eventTime?('event '+new Date(current.eventTime).toLocaleString()):'route step · event time unbound'}</small></div>
   <div><span>CONTINUITY FLUX</span><b>{fmt(current?.continuityFlux??0)}</b><small>edge thickness</small></div>
   <div><span>EVIDENCE</span><b>{fmt(current?.evidence??0)}</b><small>focus / opacity</small></div>
   <div><span>UNCERTAINTY PRESSURE</span><b>{fmt(.55*(current?.contradiction??0)+.45*(current?.burden??0))}</b><small>q + Λ halo</small></div>
   <div><span>SCAR CARRY</span><b>{fmt(current?.scar??0)}</b><small>trail persistence</small></div>
   <div><span>ORIENTATION σ</span><b>{(current?.orientation??0)>0?'+1':(current?.orientation??0)<0?'−1':'0'}</b><small>handedness</small></div>
   <div><span>SPACE FRAME</span><b>{lens==='SPACE'&&field.space.authority==='UNIT_BOUND_PHYSICAL_SPACE'?'PHYSICAL':'ATLAS'}</b><small>{field.space.authority==='UNIT_BOUND_PHYSICAL_SPACE'?(field.space.frame+' · '+field.space.unit):(field.space.mixedFrameHold?'physical packets held · incomplete/mixed frame':'representational address geometry')}</small></div><div><span>RESOLUTION</span><b>{(current?.effectiveResolution??0).toLocaleString()}</b><small>representational address level</small></div>
   <div><span>{field.energy.label}</span><b>{current?.physicalEnergy?(fmt(current.physicalEnergy.value)+' '+current.physicalEnergy.unit):fmt(current?.modelIntensity??0)}</b><small>{current?.physicalEnergy?'unit-bound returned channel':'model proxy · not physical energy'}</small></div>
  </div>
  <div className='r347-controls'><button onClick={()=>{setPlaying(false);const i=Math.max(0,cursor-1);setCursor(i);onAddress(field.nodes[i]?.address??address)}}><StepBack/>Previous</button><button className='primary' onClick={()=>setPlaying(v=>!v)}>{playing?<Pause/>:<Play/>}{playing?'Pause':'Traverse'}</button><button onClick={()=>{setPlaying(false);const i=Math.min(field.nodes.length-1,cursor+1);setCursor(i);onAddress(field.nodes[i]?.address??address)}}><StepForward/>Next</button><button onClick={()=>{setPlaying(false);setCursor(0);onAddress(address)}}><RotateCcw/>Origin</button><label>DEPTH<input type='range' min='12' max='144' step='12' value={depth} onChange={e=>setDepth(Number(e.target.value))}/><b>{depth}</b></label><label>RATE<input type='range' min='.25' max='3' step='.25' value={speed} onChange={e=>setSpeed(Number(e.target.value))}/><b>{speed.toFixed(2)}×</b></label><label>VIEW<input type='range' min='.55' max='2.2' step='.05' value={zoom} onChange={e=>setZoom(Number(e.target.value))}/><b>{zoom.toFixed(2)}×</b></label></div>
  <details><summary>VISUAL GRAMMAR · exact mapping</summary><div className='r347-grammar'>{Object.entries(TRAVERSAL_VISUAL_GRAMMAR_R347).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div><p>{field.truthBoundary}</p></details>
 </section>
}
