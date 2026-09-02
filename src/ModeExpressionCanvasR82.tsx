import {useEffect,useRef} from 'react';
import type {ModeExpressionR82} from './modeExpressionRuntimeR82';
import './modeExpressionR82.css';

type Props={expression:ModeExpressionR82;address:number;value?:unknown};

const TAU=Math.PI*2,R82_SKEW=.12;
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const rng=(seed:number,n:number)=>{const x=Math.sin((seed+n*374761393)*.000001)*43758.5453;return Math.abs(x-Math.floor(x))};
const rgba=(hex:string,a:number)=>{const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`};

export default function ModeExpressionCanvasR82({expression,address,value}:Props){
 const ref=useRef<HTMLCanvasElement|null>(null);
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;let raf=0,alive=true;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const seed=hash(expression.id+'|'+expression.name);
  const draw=(now:number)=>{if(!alive)return;const box=canvas.getBoundingClientRect(),dpr=Math.min(1.6,window.devicePixelRatio||1),W=Math.max(300,Math.round(box.width)),H=Math.max(280,Math.round(box.height));if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);
   const modePhase=rng(seed,1)*TAU,variant=.88+.24*rng(seed,2),skew=(rng(seed,3)-.5)*R82_SKEW;const t=(reduced?0:now*.001*(.22+.62*expression.intensity))+modePhase,cx=W*(.5+skew),cy=H*(.5-skew*.55),R=Math.min(W,H)*.34*variant,I=expression.intensity;
   ctx.fillStyle='#02070a';ctx.fillRect(0,0,W,H);
   const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.7);bg.addColorStop(0,rgba(expression.accent,.12+.08*I));bg.addColorStop(.55,'rgba(6,15,19,.4)');bg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
   ctx.lineCap='round';ctx.lineJoin='round';
   const ring=(r:number,a=.4,rot=0,ecc=1)=>{ctx.beginPath();ctx.ellipse(cx,cy,r*ecc,r,rot,0,TAU);ctx.strokeStyle=rgba(expression.accent,a);ctx.lineWidth=1;ctx.stroke()};
   const dot=(x:number,y:number,r:number,a=.7,secondary=false)=>{ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=rgba(secondary?expression.secondary:expression.accent,a);ctx.fill()};
   switch(expression.family){
    case'COHERENCE':{
     for(let i=0;i<10;i++){const q=(i+1)/10,breath=1+.035*Math.sin(t*1.7+i*.8);ring(R*q*breath,.08+.34*(1-q)+.22*I,t*.018*(i%2?1:-1),1+.12*Math.sin(i*.9))}
     for(let i=0;i<18;i++){const a=i*TAU/18+t*.08,r=R*(.2+.72*(i%5)/5);dot(cx+Math.cos(a)*r,cy+Math.sin(a)*r,1.3+(i%3),.32+.45*I,i%4===0)}
     break;
    }
    case'FORECAST':{
     const branches=9;for(let b=0;b<branches;b++){const y0=cy+(b-(branches-1)/2)*R*.13,phase=(b-4)*.08;ctx.beginPath();ctx.moveTo(cx-R*.78,cy);for(let j=0;j<=28;j++){const u=j/28,x=cx-R*.78+u*R*1.58,y=cy+(y0-cy)*Math.pow(u,1.35)+Math.sin(u*7+b+t*.7)*R*.025*(.3+I);j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=rgba(b===4?expression.secondary:expression.accent,.08+.34*(1-Math.abs(b-4)/5));ctx.lineWidth=b===4?2.2:1;ctx.stroke();dot(cx+R*.8,y0,2+.8*I,.45,b===4)}
     break;
    }
    case'PRUNE':{
     for(let i=0;i<12;i++){const a=i*TAU/12+t*.025,r=R*(.18+.7*((i%6)+1)/6);ring(r,.06+.16*I,a*.12,1+.18*Math.cos(a))}
     ctx.save();ctx.translate(cx,cy);ctx.rotate(-.42+.12*Math.sin(t*.4));for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(-R*1.05,i*R*.16);ctx.lineTo(R*1.05,i*R*.16);ctx.strokeStyle=rgba(expression.secondary,i===0?.72:.13);ctx.lineWidth=i===0?3:1;ctx.stroke()}ctx.restore();
     break;
    }
    case'RELATIVITY':{
     for(let i=0;i<7;i++){const q=(i+1)/7,shift=Math.sin(t*.35+i*.7)*R*.08;ctx.beginPath();ctx.ellipse(cx-shift,cy,R*q*(1.2+.25*I),R*q*.62,t*.08,0,TAU);ctx.strokeStyle=rgba(expression.accent,.08+.26*(1-q));ctx.stroke();ctx.beginPath();ctx.ellipse(cx+shift,cy,R*q*.8,R*q*(.8+.2*I),-t*.06,0,TAU);ctx.strokeStyle=rgba(expression.secondary,.05+.19*(1-q));ctx.stroke()}
     ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.strokeStyle=rgba(expression.secondary,.5);ctx.setLineDash([5,7]);ctx.stroke();ctx.setLineDash([]);
     break;
    }
    case'FLOW':{
     for(let k=-7;k<=7;k++){ctx.beginPath();for(let j=0;j<=70;j++){const u=j/70,x=cx-R*1.2+u*R*2.4,y=cy+k*R*.105+Math.sin(u*TAU*1.35+k*.45+t*.55)*R*.07*(.4+I);j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=rgba(k===0?expression.secondary:expression.accent,.06+.25*(1-Math.abs(k)/8));ctx.lineWidth=k===0?2:1;ctx.stroke()}
     break;
    }
    case'MEMORY':{
     for(let trail=0;trail<9;trail++){ctx.beginPath();for(let j=0;j<55;j++){const u=j/54,a=u*TAU*(1.2+trail*.04)+trail*.55+t*.11,r=R*(.15+.72*u)*(1-.018*trail),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.72;j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=rgba(trail%3===0?expression.secondary:expression.accent,.04+.28*(1-trail/10));ctx.lineWidth=1+.4*(1-trail/9);ctx.stroke()}
     break;
    }
    case'PROOF':{
     const step=Math.max(24,Math.min(46,R*.16));for(let x=cx-R;x<=cx+R;x+=step){ctx.beginPath();ctx.moveTo(x,cy-R*.8);ctx.lineTo(x,cy+R*.8);ctx.strokeStyle=rgba(expression.accent,.09);ctx.stroke()}for(let y=cy-R*.8;y<=cy+R*.8;y+=step){ctx.beginPath();ctx.moveTo(cx-R,y);ctx.lineTo(cx+R,y);ctx.strokeStyle=rgba(expression.accent,.09);ctx.stroke()}
     const pulse=.5+.5*Math.sin(t*1.8);ring(R*.7,.25+.35*pulse,0,1);ring(R*.46,.18+.32*I,0,1);dot(cx,cy,8+5*I,.85,true);
     break;
    }
    case'TOPOLOGY':{
     const nodes=22,pts=Array.from({length:nodes},(_,i)=>{const a=i*TAU/nodes+(.2*rng(seed,i)),r=R*(.22+.72*rng(seed,i+40));return{x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r*.78}});
     for(let i=0;i<nodes;i++){for(let j=i+1;j<nodes;j++){if(((i*17+j*13+seed)%11)<2){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=rgba(expression.accent,.08+.08*I);ctx.stroke()}}}pts.forEach((p,i)=>dot(p.x,p.y,1.7+(i%4===0?2:0),.4+.35*I,i%5===0));
     break;
    }
    case'COMPRESSION':{
     for(let i=0;i<13;i++){const q=(i+1)/13,squeeze=.72+.22*Math.sin(t*.55+i*.36),r=R*q*squeeze;ring(r,.05+.24*(1-q),t*.018*(i%2?1:-1),.62+.3*q)}ctx.beginPath();ctx.moveTo(cx-R*.95,cy);ctx.lineTo(cx+R*.95,cy);ctx.strokeStyle=rgba(expression.secondary,.5);ctx.lineWidth=2.4;ctx.stroke();break;
    }
    case'TRAVERSAL':{
     const pts=[] as {x:number;y:number}[];for(let i=0;i<28;i++){const u=i/27,x=cx-R+u*R*2,y=cy+Math.sin(u*TAU*1.6+t*.35)*R*.18+Math.sin(u*TAU*4.2)*R*.035;pts.push({x,y})}ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=rgba(expression.accent,.62);ctx.lineWidth=3;ctx.stroke();const travel=((t*.22)%1)*27,p=pts[Math.min(27,Math.floor(travel))];if(p)dot(p.x,p.y,6+.8*I,.95,true);pts.filter((_,i)=>i%4===0).forEach(p=>dot(p.x,p.y,2.4,.48));
     break;
    }
    case'RECURSION':{
     for(let i=0;i<12;i++){const q=(i+1)/12,a=t*.035*(i%2?1:-1)+i*.31,r=R*(.12+.7*q);ctx.beginPath();ctx.arc(cx+Math.cos(a)*R*.08*q,cy+Math.sin(a)*R*.05*q,r,0,TAU*(.72+.02*i));ctx.strokeStyle=rgba(i%3===0?expression.secondary:expression.accent,.06+.25*(1-q));ctx.stroke()}break;
    }
    case'GOVERNANCE':{
     for(let i=0;i<8;i++){const a0=i*TAU/8-.09,a1=(i+1)*TAU/8-.18,open=(i%3===0?.32:.12)+.08*Math.sin(t*.5+i);ctx.beginPath();ctx.arc(cx,cy,R*(.45+.06*(i%2)),a0,a1);ctx.strokeStyle=rgba(i%2?expression.secondary:expression.accent,.22+.28*I);ctx.lineWidth=8+8*open;ctx.stroke()}ring(R*.72,.18);dot(cx,cy,7,.8,true);break;
    }
    case'SCALE':{
     for(let i=0;i<8;i++){const q=(i+1)/8,w=R*1.55*q,h=R*1.02*q,rot=(i-4)*.035+t*.01*(i%2?1:-1);ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.strokeStyle=rgba(i%2?expression.secondary:expression.accent,.05+.23*(1-q));ctx.strokeRect(-w/2,-h/2,w,h);ctx.restore()}break;
    }
    case'LIGHT':{
     for(let k=-5;k<=5;k++){ctx.beginPath();for(let j=0;j<=90;j++){const u=j/90,x=cx-R*1.15+u*R*2.3,y=cy+k*R*.11+Math.sin(u*TAU*2.4+t*1.1+k*.55)*R*.045;j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=rgba(k===0?expression.secondary:expression.accent,.05+.25*(1-Math.abs(k)/6));ctx.stroke()}break;
    }
    default:{
     for(let i=0;i<28;i++){const a=i*TAU/28+t*.025*(i%2?1:-1),r=R*(.2+.72*rng(seed,i)),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.78;dot(x,y,1.2+3*rng(seed,i+80),.2+.5*rng(seed,i+120),i%7===0)}ring(R*.62,.22);break;
    }
   }
   ctx.font='700 10px ui-monospace,monospace';ctx.fillStyle='rgba(236,242,240,.92)';ctx.fillText(`${expression.id} · ${expression.family} · ${expression.signature.toUpperCase()}`,14,22);
   ctx.font='8px ui-monospace,monospace';ctx.fillStyle='rgba(157,178,176,.72)';ctx.fillText(`STATE ${address+1} · ${expression.executed?'SOURCE-BACKED OUTPUT':expression.gated?'GATED FORMULA':'METADATA EXPRESSION'} · value ${String(value??'—')}`,14,39);
   raf=requestAnimationFrame(draw);
  };
  raf=requestAnimationFrame(draw);return()=>{alive=false;cancelAnimationFrame(raf)}
 },[expression.id,expression.name,expression.family,expression.signature,expression.motion,expression.accent,expression.secondary,expression.intensity,expression.executed,expression.gated,address,value]);
 return <section className='mode-expression-r82' data-family={expression.family} data-mode-id={expression.id}>
  <div className='mer82-stage'><canvas ref={ref} aria-label={`Visual expression of ${expression.id} ${expression.name}`}/><div className='mer82-badge'><span>{expression.executed?'EXECUTED / SOURCE-BOUND':expression.gated?'GATED / INPUTS MISSING':'CATALOG / METADATA ONLY'}</span><b>{expression.name}</b><small>{expression.detail}</small></div></div>
  <footer><span><b>VISUAL LAW</b> {expression.signature}</span><span><b>MOTION</b> {expression.motion}</span><span className='boundary'>{expression.boundary}</span></footer>
 </section>;
}
