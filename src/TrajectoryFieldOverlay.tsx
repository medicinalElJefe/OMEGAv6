import {useMemo} from 'react';
import type {Mandala20736Field} from './mandala20736Runtime';
import {lineagePoint,type CompilerLineageId} from './compilerLineageRuntime';
import {groupForAddress,type DepthLevelIndex} from './semanticDepthRuntime';
import type {TrajectoryStep} from './pcExecutionSpineRuntime';
import './trajectoryHumanR14.css';

const W=1000,H=1000;
const decisionClass=(decision:string)=>String(decision||'').toLowerCase().replace(/[^a-z]+/g,'-');
export default function TrajectoryFieldOverlay({field,path,lineage,level,yaw,pitch,zoom}:{field:Mandala20736Field;path:TrajectoryStep[];lineage:CompilerLineageId;level:DepthLevelIndex;yaw:number;pitch:number;zoom:number}){
 const points=useMemo(()=>{const cs=Math.cos(yaw),sn=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),scale=Math.min(W,H)*.68*zoom,seen=new Set<number>();return path.flatMap(s=>{const key=level<3?groupForAddress(s.address,level).index:s.address;if(seen.has(key))return[];seen.add(key);const source=level<3?groupForAddress(s.address,level).start:s.address,p=lineagePoint(field,source,lineage),xr=p.x*cs-p.z*sn,zr=p.x*sn+p.z*cs,yr=p.y*cp-zr*sp,z=zr*cp+p.y*sp,px=W/2+xr*scale/(1.72-z*.48),py=H/2-yr*scale/(1.72-z*.48);return[{...s,x:px,y:py,key}]})},[field,path,lineage,level,yaw,pitch,zoom]);
 if(points.length<2)return null;
 const d=points.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '),first=points[0],last=points[points.length-1],best=points.reduce((a,b)=>b.closure>a.closure?b:a,points[0]),delta=last.closure-first.closure;
 return <svg className='trajectory-field-overlay trajectory-human-r14' viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' aria-label='Human-readable source trajectory steering'>
  <defs><marker id='trajectoryArrowR14' markerWidth='8' markerHeight='8' refX='7' refY='4' orient='auto' markerUnits='strokeWidth'><path d='M0,0 L8,4 L0,8 z'/></marker></defs>
  <path className='trajectory-corridor-r14' d={d}/>
  {points.slice(1).map((p,i)=>{const a=points[i],seg=`M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`;return <path key={`seg-${p.key}-${i}`} className={`trajectory-segment-r14 ${decisionClass(p.decision)}`} d={seg} data-decision={p.decision} data-closure={p.closure.toFixed(3)} data-drive={p.drive.toFixed(3)} markerEnd='url(#trajectoryArrowR14)'/>})}
  {points.map((p,i)=>{const milestone=i===0||i===points.length-1||p.key===best.key||i%Math.max(1,Math.floor(points.length/5))===0;return <g key={`${p.key}-${i}`} className={`trajectory-node trajectory-node-r14 ${i===0?'origin':''} ${i===points.length-1?'terminal':''} ${p.key===best.key?'best':''}`} data-state={p.stateId} data-decision={p.decision}><circle cx={p.x} cy={p.y} r={i===0?10:p.key===best.key?9:i===points.length-1?8:Math.max(3,4+p.closure*3)}/>{milestone&&<><text className='trajectory-state-label-r14' x={p.x+13} y={p.y-10}>{i===0?'NOW':p.key===best.key?`BEST · S${p.stateId}`:i===points.length-1?`CLOSURE · S${p.stateId}`:`S${p.stateId}`}</text><text className='trajectory-metric-label-r14' x={p.x+13} y={p.y+5}>{p.decision} · closure {p.closure.toFixed(2)}</text></>}</g>})}
  <g className='trajectory-legend-r14' transform='translate(28 28)'><rect width='330' height='86' rx='12'/><text className='trajectory-legend-title-r14' x='16' y='23'>COMPUTATIONAL STATE ROUTE</text><text x='16' y='43'>{points.length} visible states · closure {first.closure.toFixed(2)} → {last.closure.toFixed(2)} ({delta>=0?'+':''}{delta.toFixed(2)})</text><text x='16' y='61'>best S{best.stateId} · {best.decision} · evidence {best.evidence.toFixed(2)}</text><text className='trajectory-truth-r14' x='16' y='77'>direction is route order — not measured clock time</text></g>
 </svg>
}
