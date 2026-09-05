import {useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ShieldCheck} from 'lucide-react';
import {corpusState} from './corpusRuntime';
import {calculusVisualLaw,lawColor} from './calculusVisualLawR37';
import {localState} from './platformAdapter';
import './federationLivingFieldR112.css';

type Props={nodes:any;runtime?:any};
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const isReady=(s:any)=>['LIVE','PC_ONLINE','VERIFIED_DEVICE_ONLINE'].includes(String(s||'').toUpperCase());

export default function FederationLivingFieldR112({nodes,runtime}:Props){
 const canvas=useRef<HTMLCanvasElement|null>(null),[size,setSize]=useState({w:900,h:280});
 const address=localState.read('omega.v6.address',11498);
 const law=useMemo(()=>calculusVisualLaw(corpusState(Math.max(0,Math.min(20735,Number(address)||0)))),[address]);
 const states=useMemo(()=>[
  {id:'GENESIS',state:nodes?.genesis?.state||'UNKNOWN'},
  {id:'OPTICAL',state:nodes?.optical?.state||'UNKNOWN'},
  {id:'SOVEREIGN',state:nodes?.sovereign?.state||'UNKNOWN'},
  {id:'OMEGAv6',state:nodes?.omegaV6?.state||'UNKNOWN'}
 ],[nodes]);
 useEffect(()=>{const el=canvas.current;if(!el)return;const ro=new ResizeObserver(([entry])=>{const r=entry.contentRect;setSize({w:Math.max(320,Math.round(r.width)),h:Math.max(220,Math.round(r.height))})});ro.observe(el);return()=>ro.disconnect()},[]);
 useEffect(()=>{const el=canvas.current;if(!el)return;const dpr=Math.min(2,window.devicePixelRatio||1),w=size.w,h=size.h;el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);const ctx=el.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;let raf=0,start=performance.now();
  const pts=[{x:w*.12,y:h*.52},{x:w*.38,y:h*.28},{x:w*.64,y:h*.70},{x:w*.88,y:h*.46}];
  const draw=(now:number)=>{const t=(now-start)/1000,phase=law.phaseAngle+t*law.phaseSpeed*(reduced?0:1),pulse=t*law.pulseRate*(reduced?0:1);ctx.clearRect(0,0,w,h);
   const bg=ctx.createRadialGradient(w*.52,h*.52,0,w*.52,h*.52,Math.max(w,h)*.7);bg.addColorStop(0,lawColor(law,'primary',.065));bg.addColorStop(1,'rgba(1,7,11,0)');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
   const cx=w*.5,cy=h*.5,maxR=Math.min(w,h)*.44,shells=Math.max(6,Math.min(18,law.shellCount));for(let i=0;i<shells;i++){const u=(i+1)/shells,r=maxR*u*(.7+.3*law.depthGain),ecc=1+law.shellEccentricity*.22*Math.sin(phase+i*.37);ctx.beginPath();ctx.ellipse(cx,cy,r*ecc,r*(1-.18*law.fold),phase*.08+i*law.shellPrecession,0,Math.PI*2);ctx.strokeStyle=lawColor(law,i%3===0?'proof':'primary',law.shellOpacity*(.28+.72*(1-u)));ctx.lineWidth=.7+law.routeWidth*.08;ctx.stroke()}
   for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],ready=isReady(states[i].state)&&isReady(states[i+1].state);const bend=(law.curvature-.5)*h*.28+(i%2?1:-1)*law.branchSpread*h*.08;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(a.x+(b.x-a.x)*.34,a.y+bend,b.x-(b.x-a.x)*.34,b.y-bend,b.x,b.y);ctx.strokeStyle=ready?lawColor(law,'primary',.34+.42*law.routeStrength):lawColor(law,'scar',.20+.24*law.contradictionPressure);ctx.lineWidth=1+law.routeWidth*(ready?.32:.18);ctx.stroke();
    const p=((pulse*.12+i*.21)%1+1)%1,mt=1-p,px=mt*mt*mt*a.x+3*mt*mt*p*(a.x+(b.x-a.x)*.34)+3*mt*p*p*(b.x-(b.x-a.x)*.34)+p*p*p*b.x,py=mt*mt*mt*a.y+3*mt*mt*p*(a.y+bend)+3*mt*p*p*(b.y-bend)+p*p*p*b.y;ctx.beginPath();ctx.arc(px,py,2.1+law.pointRadius*.5,0,Math.PI*2);ctx.fillStyle=ready?lawColor(law,'proof',.85):lawColor(law,'scar',.58);ctx.fill()}
   pts.forEach((p,i)=>{const ready=isReady(states[i].state),rr=7+law.proofGlow*4+Math.sin(pulse+i)*1.4;ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fillStyle=ready?lawColor(law,'proof',.9):lawColor(law,'scar',.58);ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,rr+7+law.trailPersistence*7,0,Math.PI*2);ctx.strokeStyle=ready?lawColor(law,'primary',.18):lawColor(law,'scar',.14);ctx.lineWidth=1;ctx.stroke()});
   if(!reduced)raf=requestAnimationFrame(draw)};draw(performance.now());return()=>cancelAnimationFrame(raf)},[size,law,states]);
 const C=law.u.C,Phi=law.u.Phi,q=law.u.q,Lambda=law.u.Lambda;
 return <section className='r112-living-field' aria-label='Calculus-driven federation projection'>
  <div className='r112-field-canvas'><canvas ref={canvas}/><div className='r112-field-labels'>{states.map((x,i)=><span key={x.id} style={{left:`${[12,38,64,88][i]}%`,top:`${[52,28,70,46][i]}%`}} className={isReady(x.state)?'ready':''}><b>{x.id}</b><small>{String(x.state).replaceAll('_',' ')}</small></span>)}</div></div>
  <footer><div><Activity/><span>LIVE COMPUTATIONAL PROJECTION</span><b>address {Number(address).toLocaleString()} · {law.modeDecision}</b></div><div className='r112-field-metrics'><span>CΩ <b>{C.toFixed(3)}</b></span><span>Φ <b>{Phi.toFixed(3)}</b></span><span>q <b>{q.toFixed(3)}</b></span><span>Λ <b>{Lambda.toFixed(3)}</b></span><span>route <b>{law.routeStrength.toFixed(3)}</b></span></div><small><ShieldCheck/>Motion is derived from the current OMEGA address, executable calculus visual law, and observed node states. It is an instrument projection, not an external physical measurement.</small></footer>
 </section>;
}
