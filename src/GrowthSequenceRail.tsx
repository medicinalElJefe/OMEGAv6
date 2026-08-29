import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {decodeAddress} from './corpusRuntime';
import './GrowthSequenceRail.css';

const PHASES=['Seed Intake','Normalize','Bind Authority','Admit','Construct','Prune','Route','Render','Persist','Replay','Package','Escalate'] as const;
const DOMAINS=['Owns live state','Truth / admissibility','Move through manifold','Render field','Host inputs','AI / control','Data / atlas','World / bio / forecast','Recovery / packaging'] as const;

export default function GrowthSequenceRail({home=false}:{home?:boolean}){
  const[address,setAddress]=useState(()=>Math.max(0,Math.min(20735,Number(localStorage.getItem('omega.v6.address')||11498)||11498)));
  useEffect(()=>{const id=window.setInterval(()=>{const n=Number(localStorage.getItem('omega.v6.address')||11498);if(Number.isFinite(n))setAddress(Math.max(0,Math.min(20735,Math.floor(n))))},850);return()=>clearInterval(id)},[]);
  const c=useMemo(()=>decodeAddress(address),[address]);
  const activePhase=c.p,activeDomain=Math.min(DOMAINS.length-1,Math.floor(c.d*DOMAINS.length/12));
  const progress=(activePhase+1)/12;
  const style={'--gsr-progress':String(progress),'--gsr-phase':String(activePhase),'--gsr-domain':String(activeDomain)} as CSSProperties;
  return <div className={'growth-sequence-rail '+(home?'is-home':'is-workstation')} style={style} aria-label='OMEGA archive growth sequence'>
    <div className='gsr-domain'><span>144-SEQUENCE GROWTH</span><b>{DOMAINS[activeDomain]}</b><small>D{c.d+1} · P{c.p+1} · R{c.r+1} · L{c.l+1}</small></div>
    <div className='gsr-track'>
      <i className='gsr-progress'/>
      {PHASES.map((phase,i)=><div key={phase} className={'gsr-step '+(i===activePhase?'active':i<activePhase?'passed':'future')}><em>{String(i+1).padStart(2,'0')}</em><span>{phase}</span></div>)}
    </div>
    <div className='gsr-law'><b>install → authority → state → proof → traversal → render → host → AI → data → domain → packaging → expansion</b><span>current state is carried through the same archive progression</span></div>
  </div>
}
