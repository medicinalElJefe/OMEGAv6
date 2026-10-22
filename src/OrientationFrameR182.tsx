import {Compass,Move3d,Rotate3d,ShieldCheck} from 'lucide-react';
import type {OrientationFrameR182} from './orientationFrameR182';
import './orientationFrameR182.css';

const f=(n:number,d=3)=>Number.isFinite(n)?n.toFixed(d):'—';
export default function OrientationFrameR182View({frame}:{frame:OrientationFrameR182}){
 const tx=50+frame.tangent.x*30,ty=50-frame.tangent.y*30,turnX=50+frame.turn.x*22,turnY=50-frame.turn.y*22;
 return <section className='orientation-r182' aria-label='OMEGA stable orientation frame'>
  <header><div><span>ORIENTATION FRAME · R182</span><b>{frame.labels.forward}</b><small>{frame.labels.orientation} · {frame.labels.phase}</small></div><strong className={frame.sigma<0?'inverse':frame.sigma>0?'outverse':'zero'}>{frame.labels.turn}</strong></header>
  <div className='orientation-r182-body'>
   <svg viewBox='0 0 100 100' role='img' aria-label='Canonical forward tangent, signed turn vector and fixed field reference axis'>
    <defs><marker id='r182arrow' markerWidth='6' markerHeight='6' refX='5' refY='3' orient='auto'><path d='M0,0 L6,3 L0,6 z'/></marker></defs>
    <circle cx='50' cy='50' r='35' className='orientation-ring'/><line x1='15' y1='50' x2='85' y2='50' className='orientation-axis'/><line x1='50' y1='15' x2='50' y2='85' className='orientation-axis minor'/><line x1='50' y1='50' x2={tx} y2={ty} className='orientation-forward' markerEnd='url(#r182arrow)'/><line x1='50' y1='50' x2={turnX} y2={turnY} className='orientation-turn' markerEnd='url(#r182arrow)'/><circle cx='50' cy='50' r='3.2' className='orientation-origin'/><text x='78' y='46'>+X</text><text x='53' y='18'>+Y</text><text x='7' y='92'>FIELD</text>
   </svg>
   <div className='orientation-r182-ledger'>
    <div><Compass/><span>Forward tangent</span><b>{f(frame.tangent.x)}, {f(frame.tangent.y)}, {f(frame.tangent.z)}</b></div>
    <div><Rotate3d/><span>Signed turn</span><b>{f(frame.turn.x)}, {f(frame.turn.y)}, {f(frame.turn.z)}</b></div>
    <div><Move3d/><span>Motion / v / a</span><b>{f(frame.motion)} · {f(frame.velocity)} · {f(frame.acceleration)}</b></div>
    <div><ShieldCheck/><span>Observer camera</span><b>{frame.labels.observer}</b></div>
   </div>
  </div>
  <footer><ShieldCheck/><span>{frame.boundary}</span></footer>
 </section>
}
