import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {corpusState,initCorpusPack} from './corpusRuntime';
import './ArchiveContinuityAura.css';

const SECTORS=[
  ['COMMAND','Command Deck','atlas_runtime_test_bundle'],
  ['WORLD','World Cockpit','Mode188_Atlas_Camera_Shell_v11'],
  ['1728','1728 Navigator','runtime_data.json'],
  ['20736','20736 Geometry','cross-coupled packet field'],
  ['PROOF','Governance / Proof','CanonConsoleOmega v24/v31r1'],
  ['CONTROL','Assistant / Control','Dewey_Full_PC_Runtime_188'],
  ['AUTO','Automation','canon learning / policy line'],
  ['TOOLS','Tools','Hybrid + renderer donors'],
  ['ARCHIVE','Canon / Archives','Drive B015 R1 authority']
] as const;

const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));

export default function ArchiveContinuityAura({home=false}:{home?:boolean}){
  const[ready,setReady]=useState(false),[address,setAddress]=useState(()=>Math.max(0,Math.min(20735,Number(localStorage.getItem('omega.v6.address')||11498)||11498)));
  useEffect(()=>{let live=true;initCorpusPack().then(()=>live&&setReady(true)).catch(()=>live&&setReady(false));const id=window.setInterval(()=>{const n=Number(localStorage.getItem('omega.v6.address')||11498);if(Number.isFinite(n))setAddress(Math.max(0,Math.min(20735,Math.floor(n))))},900);return()=>{live=false;clearInterval(id)}},[]);
  const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
  const m=record?.metrics;
  const weights=[m?.stability??.35,m?.geometry??.35,record?.math.normalizedMotionRelativity??.35,m?.continuity??.35,m?.evidence??.35,m?.rsc??.35,m?.plasticity??.35,1-(m?.burden??.5),1-(m?.contradiction??.5)];
  const style={'--aca-c':String(clamp(m?.continuity??.35)),'--aca-phi':String(clamp(m?.plasticity??.35)),'--aca-q':String(clamp(m?.contradiction??.5)),'--aca-motion':String(clamp(record?.math.normalizedMotionRelativity??.35)),'--aca-proof':String(clamp(m?.evidence??.35))} as CSSProperties;
  return <div className={'archive-continuity-aura '+(home?'is-home':'is-workstation')} style={style} aria-hidden='true'>
    <svg viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'>
      <defs>
        <radialGradient id='acaCore'><stop offset='0%' stopColor='rgba(104,210,189,.28)'/><stop offset='58%' stopColor='rgba(8,25,26,.08)'/><stop offset='100%' stopColor='rgba(0,0,0,0)'/></radialGradient>
        <linearGradient id='acaThread'><stop offset='0%' stopColor='rgba(104,210,189,.05)'/><stop offset='50%' stopColor='rgba(104,210,189,.42)'/><stop offset='100%' stopColor='rgba(215,182,109,.04)'/></linearGradient>
      </defs>
      <circle className='aca-halo h1' cx='500' cy='500' r='355'/><circle className='aca-halo h2' cx='500' cy='500' r='270'/><circle className='aca-halo h3' cx='500' cy='500' r='188'/>
      <path className='aca-thread t1' d='M120 545 C310 250 690 250 880 545 C680 820 320 820 120 545Z'/>
      <path className='aca-thread t2' d='M500 95 C770 260 820 670 500 905 C180 670 230 260 500 95Z'/>
      <path className='aca-thread t3' d='M180 260 C430 410 570 410 820 260 M180 740 C430 590 570 590 820 740'/>
      <circle className='aca-core' cx='500' cy='500' r='118'/>
      {SECTORS.map(([code,label,source],i)=>{const a=-Math.PI/2+i*Math.PI*2/SECTORS.length,r=340,x=500+Math.cos(a)*r,y=500+Math.sin(a)*r,w=clamp(weights[i]);return <g className='aca-node' key={code} transform={`translate(${x} ${y})`} style={{'--w':String(w)} as CSSProperties}><circle r={8+10*w}/><circle className='pulse' r={18+18*w}/><text className='code' y='-24' textAnchor='middle'>{code}</text><text className='label' y='34' textAnchor='middle'>{label}</text><title>{label} · donor trace: {source}</title></g>})}
    </svg>
    <div className='aca-caption'><span>ARCHIVE CONTINUITY FIELD</span><b>{ready?`STATE ${address+1} · ${m?.decision||'SOURCE'}`:'SOURCE MATERIALIZING'}</b><small>runtime → field → canon → proof → continuity</small></div>
  </div>
}
