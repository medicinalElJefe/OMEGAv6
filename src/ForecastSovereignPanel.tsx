import {useMemo,useState} from 'react';
import {Activity,GitBranch,Save,ShieldCheck} from 'lucide-react';
import {buildForecastPlan} from './forecastRuntime';
import {corpusState,decodeAddress} from './corpusRuntime';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import './forecastR36.css';

const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const fmt=(x:any,d=3)=>typeof x==='number'&&Number.isFinite(x)?x.toFixed(d):'—';
const score=(p:any)=>{const C=Number(p?.C||0),P=Number(p?.Phi||0),q=Number(p?.q||0),L=Number(p?.Lambda||0),proof=Number(p?.proof||p?.evidence||0),S=C*P/(q+L+.001);return cl(.65*(S/(1+S))+.35*proof)};
type Props={address:number};

function ForecastMap({plan,address,selected,onSelect}:{plan:any;address:number;selected:string;onSelect:(id:string)=>void}){
 const W=1120,H=520,cx=120,cy=260,usable=W-190,maxH=Math.max(1,plan.summary.steps.length),corridors=plan.corridors||[];
 const x=(h:number)=>cx+(h/maxH)*usable;
 const yFor=(c:any,i:number,h:number)=>{const p=c.points[Math.min(c.points.length-1,Math.max(0,h-1))],base=72+i*(370/Math.max(1,corridors.length-1||1)),s=score(p),turn=c.turningPoint?.h===h;return base+(0.5-s)*72+(turn?Math.sin(h*2.1)*18:0)};
 return <div className='fr36-map'><svg viewBox={`0 0 ${W} ${H}`} role='img' aria-label='Interactive competing future corridors'><defs><filter id='fr36glow'><feGaussianBlur stdDeviation='3' result='b'/><feMerge><feMergeNode in='b'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs><line x1={cx} y1='35' x2={cx} y2={H-35} className='fr36-now-line'/><text x={cx} y='24' textAnchor='middle' className='fr36-label'>NOW · {address+1}</text>{corridors.map((c:any,i:number)=>{const pts=[{x:cx,y:cy},...c.points.slice(0,maxH).map((p:any,j:number)=>({x:x(j+1),y:yFor(c,i,j+1)}))],d=pts.map((p:any,j:number)=>(j?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' '),active=selected===c.id;return <g key={c.id} className={active?'fr36-corridor active':'fr36-corridor'} onClick={()=>onSelect(c.id)}><path d={d}/>{pts.slice(1).map((p:any,j:number)=><circle key={j} cx={p.x} cy={p.y} r={j===pts.length-2?5:2.4}/>) }<text x={pts[Math.max(1,Math.floor(pts.length*.56))].x} y={pts[Math.max(1,Math.floor(pts.length*.56))].y-10} className='fr36-label'>{c.mode}</text></g>})}<circle cx={cx} cy={cy} r='8' className='fr36-origin' filter='url(#fr36glow)'/></svg></div>
}

export default function ForecastSovereignPanel({address}:Props){
 const[horizon,setHorizon]=useState(12),[selected,setSelected]=useState(''),[frozen,setFrozen]=useState<any>(()=>{try{return JSON.parse(localStorage.getItem('omega.forecast.prior.v2')||'null')}catch{return null}}),plan=useMemo(()=>buildForecastPlan(address,horizon,'CANON_PHASE'),[address,horizon]),source=useMemo(()=>corpusState(address),[address]);
 const chosen=plan.corridors.find((c:any)=>c.id===(selected||plan.summary.dominantCorridor))||plan.corridors[0],end=chosen?.points[chosen.points.length-1],currentScore=score({C:source.metrics.continuity,Phi:source.metrics.plasticity,q:source.metrics.contradiction,Lambda:source.metrics.burden,proof:source.metrics.evidence}),endScore=end?score(end):currentScore,delta=endScore-currentScore;
 const freeze=()=>{const packet={id:`PRIOR-${Date.now().toString(36)}`,frozenAt:new Date().toISOString(),sourceAddress:address,sourceStateId:address+1,horizon,plan,futureObservationUsed:false};localStorage.setItem('omega.forecast.prior.v2',JSON.stringify(packet));setFrozen(packet)};
 const firstTurn=chosen?.turningPoint,finalPoint=chosen?.points?.[chosen.points.length-1],finalCoords=finalPoint?decodeAddress(finalPoint.address):null;
 return <section className='panel forecast-r36'><header className='fr36-head'><div><p className='overline'>FORECAST · COMPETING ADMISSIBLE ROUTES</p><h2>What could happen next, and why?</h2><p>OMEGA does not claim to see the future. It compares legal transitions from the current packet, keeps alternatives visible, and shows where the branches begin to disagree.</p></div><span className='fr36-count'>{plan.corridors.length} scenarios</span></header>
 <div className='fr36-controls'><label><span>Look ahead</span><input type='range' min='1' max='36' value={horizon} onChange={e=>setHorizon(Number(e.target.value))}/><b>{horizon} transitions</b></label><button className='gold' onClick={freeze}><Save size={15}/>Freeze this baseline</button></div>
 <ForecastMap plan={plan} address={address} selected={chosen?.id||''} onSelect={setSelected}/>
 <div className='fr36-summary'><article><span>Most supported route</span><b>{chosen?.mode||'—'}</b><small>{chosen?.variant||'primary'} · weight {fmt(chosen?.weight)}</small></article><article><span>Outcome movement</span><b>{delta>=0?'+':''}{fmt(delta)}</b><small>{fmt(currentScore)} → {fmt(endScore)} normalized</small></article><article><span>First meaningful turn</span><b>{firstTurn?`+${firstTurn.h}`:'none in horizon'}</b><small>{firstTurn?.reason||'route remains locally consistent'}</small></article><article><span>Where it lands</span><b>{finalPoint?`STATE ${finalPoint.address+1}`:'—'}</b><small>{finalCoords?`D${finalCoords.d+1} P${finalCoords.p+1} R${finalCoords.r+1} L${finalCoords.l+1}`:'—'}</small></article></div>
 <div className='fr36-scenarios'>{plan.corridors.map((c:any)=><button key={c.id} className={chosen?.id===c.id?'active':''} onClick={()=>setSelected(c.id)}><GitBranch/><span><b>{c.mode}</b><small>{c.variant}</small></span><strong>{fmt(c.weight)}</strong><i style={{width:`${Math.round(cl(c.weight/(plan.summary.dominantWeight||1))*100)}%`}}/></button>)}</div>
 <OmegaMotionSkinMapR35 address={address} compact/>
 {frozen&&<div className='fr36-frozen'><Activity/><div><b>Baseline frozen · {frozen.id}</b><span>source state {frozen.sourceStateId} · future observation used: NO</span></div></div>}
 <details className='fr36-advanced'><summary>Advanced route diagnostics</summary><div className='fr36-diagnostics'>{plan.corridors.map((c:any)=><article key={c.id}><b>{c.mode}</b><span>utility {fmt(c.avgUtility)} · proof {fmt(c.avgProof)} · future {fmt(c.avgFuture)} · temporal {fmt(c.avgTemporal)} · jerk {fmt(c.avgJerk)}</span><small>{c.points.slice(0,12).map((p:any)=>p.address+1).join(' → ')}{c.points.length>12?' → …':''}</small></article>)}</div></details>
 <div className='boundary'><ShieldCheck size={15}/>{plan.boundary}</div></section>;
}
