import {useEffect,useMemo,useRef,useState} from 'react';
import {Pause,Play,StepBack,StepForward} from 'lucide-react';
import {corpusState,projectionPoint} from './corpusRuntime';
import {compileSourceTraversal} from './sourceBackedModeRuntimeR21';
import {unifiedFromRecord,visualFieldPoint} from './unifiedCalculus';
import {TRAVERSAL_MODE_DESIGN_R99,traversalVisualProfileR99,warpTraversalPointR99,type TraversalDesignModeR99} from './traversalModeDesignR99';
import {ATLAS_RESOLUTION_LEVELS_R101,WOVEN_CONTINUITY_OPERATOR_R100,applyWovenContinuityR100,deriveWeaveStateR100,weaveChannelR100} from './weaveStateR100';
import './weaveGeometryR100.css';

const MODES:TraversalDesignModeR99[]=['UNIFIED','SHELL','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF'];
const LABEL:Record<TraversalDesignModeR99,string>={UNIFIED:'Unified',SHELL:'Shell',WATER:'Water',LIGHT:'Light',SCAR:'Scar',RELATIVITY:'Relativity',FORECAST:'Forecast',PROOF:'Proof'};
const fmt=(n:any)=>Number.isFinite(Number(n))?Number(n).toFixed(3):'—';
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
type Props={variant:string;address:number;onAddress:(n:number)=>void};

export default function TraversalModeStageR100({variant,address,onAddress}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null);
 const routeHit=useRef<{x:number;y:number;address:number}[]>([]);
 const clock=useRef({last:0,elapsed:0});
 const[mode,setMode]=useState<TraversalDesignModeR99>('UNIFIED');
 const[animated,setAnimated]=useState(true);
 const[detail,setDetail]=useState(1);
 const[routeDepth,setRouteDepth]=useState(36);
 const[timeScale,setTimeScale]=useState(1);
 const[weaveReadout,setWeaveReadout]=useState({phaseBand:0,pulse:.5});
 const record=useMemo(()=>corpusState(address),[address]);
 const u=useMemo(()=>unifiedFromRecord(record),[record]);
 const profile=useMemo(()=>traversalVisualProfileR99(mode,u),[mode,u]);
 const route=useMemo(()=>compileSourceTraversal(address,routeDepth),[address,routeDepth]);
 const weaveStatic=useMemo(()=>deriveWeaveStateR100(address,u,0,1),[address,u]);
 const routeWeaves=useMemo(()=>route.path.map((step:any)=>deriveWeaveStateR100(step.address,unifiedFromRecord(corpusState(step.address)),0,1)),[route]);
 useEffect(()=>{clock.current={last:0,elapsed:0}},[address]);

 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  let raf=0,alive=true,lastBand=-1;
  const render=(ms:number)=>{
   if(!alive)return;
   const rect=el.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(420,rect.width),h=Math.max(420,rect.height);
   if(el.width!==Math.floor(w*dpr)||el.height!==Math.floor(h*dpr)){el.width=Math.floor(w*dpr);el.height=Math.floor(h*dpr)}
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const dt=clock.current.last?Math.min(.05,Math.max(0,(ms-clock.current.last)/1000)):0;clock.current.last=ms;if(animated)clock.current.elapsed+=dt*timeScale;
   const t=clock.current.elapsed,weave=deriveWeaveStateR100(address,u,t,1);
   if(weave.phaseBand!==lastBand){lastBand=weave.phaseBand;setWeaveReadout({phaseBand:weave.phaseBand,pulse:weave.pulse})}
   ctx.fillStyle='#020709';ctx.fillRect(0,0,w,h);
   const cx=w*.5,cy=h*.5,scale=Math.min(w,h)*.315*profile.radial;
   const glow=ctx.createRadialGradient(cx,cy,10,cx,cy,Math.min(w,h)*.64);glow.addColorStop(0,`rgba(42,116,111,${.075+.12*clamp(u.C)})`);glow.addColorStop(.42,`rgba(15,45,48,${.055+.055*weave.continuityFlux})`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);

   ctx.save();ctx.translate(cx,cy);ctx.rotate(weave.torsion*.08);
   for(let i=0;i<weave.ringCount;i++){
    const f=(i+1)/weave.ringCount,r=scale*(.12+.96*f),ell=1-.12*u.shape.anisotropy+Math.sin(weave.phase+i*.33)*.018*weave.pulse;
    const major=i===0||i===weave.ringCount-1||i%Math.max(1,Math.round(weave.ringCount/4))===0,ch=weaveChannelR100(i%4,weave,u);
    const alpha=major?(.12+.12*ch.strength):(.018+.055*ch.strength);
    ctx.beginPath();ctx.ellipse(0,0,r,r*ell,weave.torsion*f*.12,0,Math.PI*2);ctx.strokeStyle=`rgba(${ch.r},${ch.g},${ch.b},${alpha})`;ctx.lineWidth=major?1.05:.42;ctx.stroke();
   }
   for(let l=0;l<weave.lobeCount;l++){
    const offset=l/weave.lobeCount*Math.PI*2;ctx.beginPath();
    for(let j=0;j<=180;j++){const a=j/180*Math.PI*2,r=scale*(.22+.61*(.5+.5*Math.sin(a*weave.lobeCount+offset+weave.phase))*(.38+.62*weave.aperture)),tw=a+offset+weave.torsion*Math.sin(a+weave.phase)*.18,x=Math.cos(tw)*r,y=Math.sin(tw)*r*(.78+.16*weave.depth);j?ctx.lineTo(x,y):ctx.moveTo(x,y)}
    const ch=weaveChannelR100(l,weave,u);ctx.strokeStyle=`rgba(${ch.r},${ch.g},${ch.b},${.018+.075*ch.strength})`;ctx.lineWidth=.45+.5*weave.invariantCarry;ctx.stroke();
   }
   ATLAS_RESOLUTION_LEVELS_R101.forEach((_,i)=>{const active=i===weave.resolutionIndex,r=scale*(.16+i*.18);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.setLineDash(active?[]:[2+i*2,8+i*2]);ctx.strokeStyle=active?`rgba(226,190,112,${.23+.24*weave.resolutionDemand})`:`rgba(220,190,128,${.018+.014*i+.02*weave.invariantCarry})`;ctx.lineWidth=active?1.7:.55;ctx.stroke()});ctx.setLineDash([]);

   if(mode==='SHELL'||mode==='UNIFIED'){for(let i=1;i<=12;i++){ctx.beginPath();ctx.ellipse(0,0,scale*(.16+i*.055),scale*(.13+i*.049),0,0,Math.PI*2);ctx.strokeStyle=`rgba(91,194,180,${.018+.045*u.C})`;ctx.lineWidth=i%3===0?1.1:.45;ctx.stroke()}}
   if(mode==='WATER'){for(let k=-7;k<=7;k++){ctx.beginPath();for(let x=-scale*1.5;x<=scale*1.5;x+=12){const y=k*25+Math.sin(x*.012+t*.75+k+weave.phase)*24*(.3+.7*u.Phi);x===-scale*1.5?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.strokeStyle=`rgba(65,207,194,${.06+.08*weave.continuityFlux})`;ctx.lineWidth=.7;ctx.stroke()}}
   if(mode==='LIGHT'){for(let i=0;i<18;i++){const a=i/18*Math.PI*2+t*.025,len=scale*(.55+u.evidence*.85);ctx.beginPath();ctx.moveTo(Math.cos(a)*scale*.12,Math.sin(a)*scale*.12);ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);ctx.strokeStyle=`rgba(232,238,216,${.035+.12*u.evidence})`;ctx.lineWidth=.65+1.3*u.evidence;ctx.stroke()}}
   if(mode==='RELATIVITY'){for(const s of [-1,1]){ctx.save();ctx.rotate(s*(.12+.26*u.motionRelativity));ctx.scale(1+s*.16*u.motionRelativity,1-s*.08*u.motionRelativity);ctx.strokeStyle=s>0?'rgba(99,176,212,.2)':'rgba(216,178,103,.13)';ctx.lineWidth=1;ctx.strokeRect(-scale,-scale*.62,scale*2,scale*1.24);ctx.restore()}}
   if(mode==='FORECAST'){for(const lane of [-1,0,1]){ctx.beginPath();ctx.moveTo(-scale*.75,0);ctx.bezierCurveTo(-scale*.25,lane*scale*.18,scale*.12,lane*scale*.42,scale*.86,lane*scale*.28);ctx.strokeStyle=lane===0?'rgba(222,187,112,.28)':'rgba(136,180,209,.13)';ctx.setLineDash(lane===0?[]:[5,8]);ctx.lineWidth=lane===0?1.8:1;ctx.stroke()}ctx.setLineDash([])}
   if(mode==='SCAR'){ctx.beginPath();for(let i=0;i<120;i++){const a=i/119*Math.PI*4,r=scale*(.12+i/119*.78),x=Math.cos(a)*r,y=Math.sin(a)*r*.6+Math.sin(a*3+t*.08)*scale*.06*u.scar;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=`rgba(205,77,96,${.12+.25*u.scar})`;ctx.lineWidth=1.2+2.2*u.scar;ctx.stroke()}
   ctx.restore();

   const resolutionDensity=.82+.28*(weave.resolutionIndex/Math.max(1,ATLAS_RESOLUTION_LEVELS_R101.length-1));
   const count=Math.max(700,Math.round((1500+1200*detail)*profile.density*resolutionDensity));ctx.save();ctx.globalCompositeOperation='lighter';
   for(let i=0;i<count;i++){
    const base=visualFieldPoint(i,count,u,t),modePoint=warpTraversalPointR99(mode,base,i,count,u,t,profile),p=applyWovenContinuityR100(modePoint,i,count,u,weave,t);
    const rot=t*(.015+.035*u.motionRelativity)*(weave.orientation||1),cr=Math.cos(rot),sr=Math.sin(rot),x=(p.x*cr-p.z*sr)*scale+cx,y=(p.y*.76+p.z*.1)*scale+cy,z=p.x*sr+p.z*cr,depth=clamp((z+1.4)/2.8),proof=mode==='PROOF'?(.08+.92*u.evidence)*(1-.55*u.q):1,alpha=(.021+.22*p.weight)*profile.alpha*proof*(.46+.54*depth),rad=.42+2.35*profile.particleScale*(.3+.7*depth),channel=weaveChannelR100(i,weave,u);
    ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fillStyle=mode==='SCAR'?`rgba(207,74,94,${alpha})`:mode==='LIGHT'||mode==='PROOF'?`rgba(231,211,150,${alpha})`:mode==='WATER'?`rgba(61,204,191,${alpha})`:mode==='RELATIVITY'?`rgba(95,167,205,${alpha})`:mode==='FORECAST'?`rgba(154,190,214,${alpha})`:`rgba(${channel.r},${channel.g},${channel.b},${alpha*(.72+.28*channel.strength)})`;ctx.fill();
   }
   ctx.restore();

   const hits:{x:number;y:number;address:number}[]=[];ctx.save();ctx.lineJoin='round';
   route.path.forEach((step:any,i:number)=>{const p=projectionPoint(step.address,'MANDALA',1000),x=(p.x/1000-.5)*Math.min(w,h)*.92+cx,y=(p.y/1000-.5)*Math.min(w,h)*.92+cy,rw=routeWeaves[i]||weave;hits.push({x,y,address:step.address});if(i){const prev=hits[i-1],strength=clamp((rw.continuityFlux+rw.invariantCarry)/2);ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(x,y);ctx.strokeStyle=mode==='FORECAST'?`rgba(218,182,106,${.32+.35*strength})`:`rgba(99,210,194,${.2+.32*strength})`;ctx.lineWidth=(mode==='FORECAST'?1.7:1)+1.2*strength;ctx.stroke()}if(i%Math.max(1,Math.floor(route.path.length/10))===0||i===0){ctx.beginPath();ctx.arc(x,y,i===0?5.5:2.2+2*rw.invariantCarry,0,Math.PI*2);ctx.fillStyle=i===0?'#f0cf84':rw.orientation<0?'#7d9fd1':'#65d0bf';ctx.fill()}});
   ctx.restore();routeHit.current=hits;
   if(mode==='PROOF'){hits.forEach((hit,i)=>{if(i%4)return;ctx.beginPath();ctx.arc(hit.x,hit.y,8+u.evidence*14,0,Math.PI*2);ctx.strokeStyle=`rgba(226,190,112,${.08+.22*u.evidence})`;ctx.stroke()})}
   raf=requestAnimationFrame(render);
  };
  raf=requestAnimationFrame(render);return()=>{alive=false;cancelAnimationFrame(raf)};
 },[address,animated,detail,mode,profile,route,routeWeaves,timeScale,u]);

 const choose=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best:{d:number;address:number}|null=null;for(const p of routeHit.current){const d=Math.hypot(x-p.x,y-p.y);if(!best||d<best.d)best={d,address:p.address}}if(best&&best.d<28)onAddress(best.address)};
 return <section className='r99-mode-stage r100-weave-stage' data-mode={mode} data-orientation={weaveStatic.orientation} data-resolution={weaveStatic.effectiveResolution}>
  <header><div><span>R101 WOVEN CONTINUITY · WEAVE-DERIVED RESOLUTION</span><b>{variant} · {LABEL[mode]}</b><small>{profile.geometryMap} · weave {weaveStatic.weaveId}</small></div><code>STATE {record.stateId} · {record.metrics.decision}</code></header>
  <nav className='r99-mode-nav r100-mode-nav' aria-label='Traversal depiction mode'>{MODES.map(x=><button key={x} className={mode===x?'active':''} aria-pressed={mode===x} onClick={()=>setMode(x)}><b>{LABEL[x]}</b><small>{TRAVERSAL_MODE_DESIGN_R99[x].id}</small></button>)}</nav>
  <div className='r99-stage r100-weave-canvas'><canvas ref={canvas} onPointerDown={choose} aria-label={`${variant} ${mode} source-driven woven continuity traversal depiction`}/></div>
  <div className='r100-weave-output' aria-label='Woven continuity dimensional output'>
   <div><span>WEAVE STATE</span><b>{weaveStatic.weaveId}</b><small>derived from canonical state {record.stateId}</small></div>
   <div><span>EFFECTIVE RESOLUTION</span><b>{weaveStatic.effectiveResolution.toLocaleString('en-US')}</b><small>demand {fmt(weaveStatic.resolutionDemand)} · address {weaveStatic.atlasPath}</small></div>
   <div><span>ORIENTATION σ</span><b>{weaveStatic.orientation>0?'+1 OUTVERSE':weaveStatic.orientation<0?'−1 INVERSE':'0 NEUTRAL'}</b><small>phase band {weaveReadout.phaseBand+1}/12 · pulse {fmt(weaveReadout.pulse)}</small></div>
   <div><span>CONTINUITY FLUX</span><b>{fmt(weaveStatic.continuityFlux)}</b><small>recoverability {fmt(weaveStatic.recoverability)}</small></div>
   <div><span>INVARIANT CARRY</span><b>{fmt(weaveStatic.invariantCarry)}</b><small>residual/scar {fmt(weaveStatic.residualCarry)}</small></div>
   <div><span>WEAVE FORM</span><b>{weaveStatic.ringCount}R · {weaveStatic.lobeCount}L</b><small>torsion {fmt(weaveStatic.torsion)} · aperture {fmt(weaveStatic.aperture)}</small></div>
   <div><span>FIELD / WEAVE / PROJECTION</span><b>{fmt(weaveStatic.strata.field)} · {fmt(weaveStatic.strata.weave)} · {fmt(weaveStatic.strata.projection)}</b><small>three computational visual strata · one canonical packet</small></div>
  </div>
  <div className='r99-stage-actions r100-stage-actions'><button onClick={()=>onAddress(record.autoPing.previous)}><StepBack/>Previous</button><button className='primary-action' onClick={()=>setAnimated(v=>!v)}>{animated?<Pause/>:<Play/>}{animated?'Pause motion':'Animate'}</button><button onClick={()=>onAddress(record.autoPing.dataNext)}><StepForward/>Admitted next</button><label>DETAIL<input type='range' min='.5' max='1.75' step='.25' value={detail} onChange={e=>setDetail(Number(e.target.value))}/><b>{detail.toFixed(2)}×</b></label><label>ROUTE<input type='range' min='12' max='72' step='6' value={routeDepth} onChange={e=>setRouteDepth(Number(e.target.value))}/><b>{routeDepth}</b></label><label>TIME<input type='range' min='.25' max='2' step='.25' value={timeScale} onChange={e=>setTimeScale(Number(e.target.value))}/><b>{timeScale.toFixed(2)}×</b></label></div>
  <details className='r99-mode-data r100-mode-data'><summary>MODE + WEAVE MAP · {LABEL[mode]} · source/geometry correlation</summary><div><span>SOURCE</span><b>{profile.sourceMap}</b></div><div><span>GEOMETRY</span><b>{profile.geometryMap}</b></div><div><span>WEAVE</span><b>{WOVEN_CONTINUITY_OPERATOR_R100}</b></div><div><span>ATLAS ADDRESS</span><b>{weaveStatic.boundary}</b></div><div><span>RESOLUTION OUTPUT</span><b>{weaveStatic.resolutionPath}</b></div><div><span>RESOLUTION BOUNDARY</span><b>{weaveStatic.resolutionBoundary}</b></div><div><span>BOUNDARY</span><b>Representational geometry is derived from the canonical packet and admitted route. It is not an external physical observation.</b></div></details>
 </section>;
}
