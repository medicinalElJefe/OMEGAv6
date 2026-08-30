import {useMemo} from 'react';
import {ArrowLeftRight,ShieldCheck} from 'lucide-react';
import {corpusState,decodeAddress} from './corpusRuntime';
import './omegaMotionSkinMapR35.css';

type Props={address:number;onSelectAddress?:(address:number)=>void;compact?:boolean};
type Step={address:number;stateId:number;dir:'PAST'|'NOW'|'FUTURE';offset:number;coords:{d:number;p:number;r:number;l:number};decision:string;continuity:number;plasticity:number;contradiction:number;burden:number;evidence:number};
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number.isFinite(n)?n:0)));
const metric=(x:any)=>Number.isFinite(Number(x))?Number(x):0;
function step(address:number,dir:Step['dir'],offset:number):Step{const a=clamp(address),r=corpusState(a),c=decodeAddress(a);return{address:a,stateId:r.stateId,dir,offset,coords:c,decision:r.metrics.decision,continuity:metric(r.metrics.continuity),plasticity:metric(r.metrics.plasticity),contradiction:metric(r.metrics.contradiction),burden:metric(r.metrics.burden),evidence:metric(r.metrics.evidence)}}
function changed(a:Step,b:Step,key:'d'|'p'|'r'|'l'){return a.coords[key]!==b.coords[key]}

export default function OmegaMotionSkinMapR35({address,onSelectAddress,compact=false}:Props){
 const path=useMemo(()=>{const past:Step[]=[];let cursor=clamp(address);for(let i=3;i>=1;i--){const prev=corpusState(cursor).autoPing?.previous;cursor=Number.isFinite(prev)?clamp(prev):cursor;past.unshift(step(cursor,'PAST',-i))}const now=step(address,'NOW',0),future:Step[]=[];cursor=clamp(address);for(let i=1;i<=6;i++){const next=corpusState(cursor).autoPing?.dataNext;cursor=Number.isFinite(next)?clamp(next):cursor;future.push(step(cursor,'FUTURE',i))}return[...past,now,...future]},[address]);
 const currentIndex=path.findIndex(x=>x.dir==='NOW');
 const W=1000,H=compact?250:320,pad=46,usable=W-pad*2,x=(i:number)=>pad+i/(path.length-1)*usable;
 const laneY={d:70,p:125,r:180,l:235};
 const laneLabel={d:'DOMAIN',p:'PHASE',r:'RELATION',l:'LAYER'} as const;
 return <section className={compact?'omega-motion-skins compact':'omega-motion-skins'} aria-label='Forward and reverse dimensional skin traversal'>
  <header><div><span><ArrowLeftRight/> FORWARD ⇄ REVERSE COMPUTATION</span><h3>Motion through the four 12-state skins</h3></div><small>Every point is a canonical packet address. Lines show route transitions; skin changes are highlighted instead of implied by decorative motion.</small></header>
  <div className='oms-stage'>
   <svg viewBox={`0 0 ${W} ${H}`} role='img' aria-label='Past, current and admitted future state path across domain, phase, relation and layer skins'>
    {(['d','p','r','l'] as const).map(key=><g key={key}><line className='oms-lane' x1={pad} x2={W-pad} y1={laneY[key]} y2={laneY[key]}/><text className='oms-lane-label' x='8' y={laneY[key]+4}>{laneLabel[key]}</text>{path.map((s,i)=>{const prev=i?path[i-1]:s,isChange=i>0&&changed(prev,s,key),active=s.dir==='NOW';return <g key={`${key}-${s.offset}-${s.address}`} className={active?'oms-node active':isChange?'oms-node changed':'oms-node'} onClick={()=>onSelectAddress?.(s.address)}><circle cx={x(i)} cy={laneY[key]} r={active?8:isChange?6:4}/><text x={x(i)} y={laneY[key]-12} textAnchor='middle'>{s.coords[key]+1}</text></g>})}</g>)}
    <path className='oms-route past' d={`M ${x(0)} 286 L ${x(currentIndex)} 286`}/><path className='oms-route future' d={`M ${x(currentIndex)} 286 L ${x(path.length-1)} 286`}/>
    {path.map((s,i)=><g key={`route-${s.offset}-${s.address}`} className={s.dir==='NOW'?'oms-route-node current':`oms-route-node ${s.dir.toLowerCase()}`} onClick={()=>onSelectAddress?.(s.address)}><circle cx={x(i)} cy='286' r={s.dir==='NOW'?8:5}/><text x={x(i)} y='308' textAnchor='middle'>{s.dir==='NOW'?'NOW':s.offset>0?`+${s.offset}`:`${s.offset}`}</text></g>)}
   </svg>
  </div>
  <div className='oms-steps'>{path.map((s,i)=>{const prev=i?path[i-1]:s;const skins=i?(['d','p','r','l'] as const).filter(k=>changed(prev,s,k)).map(k=>laneLabel[k]).join(' · '):'ENTRY';return <button key={`${s.dir}-${s.offset}-${s.address}`} className={s.dir==='NOW'?'current':''} onClick={()=>onSelectAddress?.(s.address)}><span>{s.dir==='NOW'?'NOW':s.offset>0?`+${s.offset}`:`${s.offset}`}</span><b>{s.stateId.toLocaleString()}</b><small>{skins||'same skins'} · {s.decision}</small><i>CΩ {s.continuity.toFixed(2)} · Φ {s.plasticity.toFixed(2)} · q {s.contradiction.toFixed(2)} · Λ {s.burden.toFixed(2)} · E {s.evidence.toFixed(2)}</i></button>})}</div>
  <footer><ShieldCheck/><span>Reverse uses each packet's recorded previous edge; forward uses the admitted dataNext edge. This is computation-space motion across the canonical 12×12×12×12 representation, not a claim of extra physical dimensions.</span></footer>
 </section>
}
