import {useMemo,useState} from 'react';
import {Activity,ArrowDownUp,GitBranch,Layers3,ShieldCheck,Split,Waypoints} from 'lucide-react';
import {compileDimensionalRelativityEvolutionR155,R155_RESOLUTION_LADDER,type R155Orientation} from './dimensionalRelativityEvolutionR155';
import './dimensionalRelativityEvolutionR155.css';

type OrientationChoice='AUTO'|R155Orientation;
const fmt=(v:any,d=4)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';
const nfmt=(v:number)=>Number(v).toLocaleString('en-US');
export default function DimensionalRelativityEvolutionR155({record}:{record:any}){
 const[selectedPower,setSelectedPower]=useState(4),[orientationChoice,setOrientationChoice]=useState<OrientationChoice>('AUTO');
 const evolution=useMemo(()=>compileDimensionalRelativityEvolutionR155(Number(record?.address||0),selectedPower,orientationChoice==='AUTO'?undefined:orientationChoice),[record?.address,selectedPower,orientationChoice]);
 const selected=evolution.resolution.selected,recommended=evolution.resolution.recommended,fields=evolution.fields,dual=evolution.dualOperator,ref=evolution.referenceKernel;
 const ringRows=R155_RESOLUTION_LADDER.map((r,i)=>({r,power:r.power,radius:24+i*12,selected:r.power===selected.power,recommended:r.power===recommended.power}));
 return <section className='dr155'>
  <header><div><span>R155 · ALL-MODE DIMENSIONAL RELATIVITY EVOLUTION</span><h3>Frame-relative evolution without dimensional inflation</h3><p>R155 composes the exact R24 dimensional workbook, the R132 179-mode/62-authority field, Woven Continuity carry, signed inverse/outverse orientation and the existing canonical route into one bounded evolution instrument.</p></div><Layers3/></header>
  <div className='dr155-controls'>
   <label><span>Observer resolution</span><input type='range' min='1' max='10' step='1' value={selectedPower} onChange={e=>setSelectedPower(Number(e.target.value))}/><b>{selected.label}</b></label>
   <label><span>Orientation σ</span><select value={String(orientationChoice)} onChange={e=>setOrientationChoice(e.target.value==='AUTO'?'AUTO':Number(e.target.value) as R155Orientation)}><option value='AUTO'>AUTO · packet orientation</option><option value='1'>+1 · OUTVERSE</option><option value='0'>0 · NEUTRAL</option><option value='-1'>−1 · INVERSE</option></select><b>{evolution.orientation>0?'OUTVERSE +':evolution.orientation<0?'INVERSE −':'NEUTRAL 0'}</b></label>
  </div>
  <div className='dr155-kpis'>
   <article><span>CANONICAL</span><b>STATE {evolution.stateId}</b><small>→ {evolution.canonicalNextStateId} · {dual.dispatch}</small></article>
   <article><span>FRAME ROLE</span><b>{evolution.frameRoles.selected}</b><small>{evolution.frameRoles.relation}</small></article>
   <article><span>SELECTED</span><b>{nfmt(selected.count)}</b><small>{selected.kind} · {selected.bound?'BOUND':'UNBOUND CHILD DIGITS'}</small></article>
   <article><span>ADAPTIVE DEMAND</span><b>{nfmt(recommended.count)}</b><small>{evolution.resolution.action} · complexity {fmt(evolution.resolution.complexity,3)}</small></article>
   <article><span>ALL MODES</span><b>{evolution.allModes.sourceModes} + {evolution.allModes.canonAuthorities}</b><small>{evolution.allModes.exactExecuted} exact · {evolution.allModes.gated} gated</small></article>
   <article><span>CARRY</span><b>{fmt(evolution.carry.invariant,3)}</b><small>residual {fmt(evolution.carry.residual,3)} · recovery {fmt(evolution.carry.recoverability,3)}</small></article>
  </div>
  <div className='dr155-main'>
   <section className='dr155-frame-map'>
    <header><GitBranch/><div><span>NESTED FRAME MAP</span><b>12¹ → 12¹⁰ · resident 12⁴</b></div></header>
    <svg viewBox='0 0 420 310' role='img' aria-label='Nested dimensional relativity address frames'><g transform='translate(210 155)'>{[...ringRows].reverse().map(x=><circle key={x.power} r={x.radius} className={`${x.selected?'selected ':''}${x.recommended?'recommended ':''}`.trim()}/>) }<line x1='0' y1='0' x2={92*evolution.orientation} y2={-58*dual.construct.pressure} className='construct'/><line x1='0' y1='0' x2={-92*evolution.orientation} y2={-58*dual.prune.pressure} className='prune'/><circle r='5' className='anchor'/><text x='0' y='5' textAnchor='middle' className='state'>{evolution.stateId}</text></g><text x='12' y='20' className='legend'>selected {selected.label}</text><text x='12' y='38' className='legend'>recommended {recommended.label}</text><text x='12' y='56' className='legend'>σ {evolution.orientation} · 011 / 01-1 orthogonal</text></svg>
    <div className='dr155-ladder'>{R155_RESOLUTION_LADDER.map(x=><button key={x.power} className={`${x.power===selected.power?'selected ':''}${x.power===recommended.power?'recommended ':''}`.trim()} onClick={()=>setSelectedPower(x.power)}><code>12^{x.power}</code><b>{nfmt(x.count)}</b><small>{x.execution.replaceAll('_',' ')}</small></button>)}</div>
   </section>
   <section className='dr155-fields'>
    <header><Split/><div><span>INDEPENDENT RELATIONAL FIELDS</span><b>symmetry ≠ 1 − asymmetry</b></div></header>
    <article><span>Source symmetry</span><b>{fmt(fields.sourceSymmetry,5)}</b><small>source geometry channel</small></article>
    <article><span>Invariant symmetry</span><b>{fmt(fields.invariantSymmetry,5)}</b><small>preserved structure under current transform</small></article>
    <article><span>Contextual asymmetry</span><b>{fmt(fields.contextualAsymmetry,5)}</b><small>direction + phase + path/history + local offset + emergence</small></article>
    <article><span>Non-complement residual</span><b>{fmt(fields.complementResidual,5)}</b><small>measures how far the two independent fields are from an assumed complement</small></article>
    <details><summary>Asymmetry components</summary><div>{Object.entries(fields.components).map(([k,v])=><span key={k}><i>{k.replaceAll(/([A-Z])/g,' $1')}</i><b>{fmt(v,4)}</b></span>)}</div></details>
    <p>{fields.boundary}</p>
   </section>
  </div>
  <section className='dr155-dual'>
   <header><ArrowDownUp/><div><span>DUAL SIGNED OPERATOR</span><b>01-1 prune before 011 construct</b></div></header>
   <article><code>[0, 1, −1]</code><div><b>PRUNE_01-1</b><small>contradiction / burden / scar / uncertainty / escalation pressure</small></div><strong>{fmt(dual.prune.pressure,5)}</strong></article>
   <article><code>[0, 1, +1]</code><div><b>CONSTRUCT_011</b><small>continuity / plasticity / evidence / recovery / invariant carry pressure</small></div><strong>{fmt(dual.construct.pressure,5)}</strong></article>
   <div className='dr155-sequence'>{dual.sequence.map((x,i)=><span key={x}><code>{i+1}</code>{x}</span>)}</div>
   <footer><Waypoints/><span>dot {dual.orthogonality.dot} · angle {(dual.orthogonality.angleRadians/Math.PI*180).toFixed(0)}° · signed net {fmt(dual.signedNet,5)} · dispatch {dual.dispatch}</span></footer>
  </section>
  <section className='dr155-reference'>
   <header><Activity/><div><span>37 / 73 REFERENCE KERNEL</span><b>bias reference, never hard-coded symmetry/asymmetry</b></div></header>
   <div><span>base <b>{ref.a} / {ref.b}</b></span><span>normalized <b>{fmt(ref.normalizedA,6)} / {fmt(ref.normalizedB,6)}</b></span><span>ratio <b>{fmt(ref.ratio,8)}</b></span><span>signed <b>({ref.signedA}, {ref.signedB})</b></span><span>ratio preserved <b>{ref.ratioPreserved===null?'neutral':fmt(ref.ratioPreserved,8)}</b></span></div><p>{ref.boundary}</p>
  </section>
  <section className='dr155-mode-field'>
   <header><Waypoints/><div><span>ALL-MODE PRESSURE FIELD</span><b>179 source modes + {evolution.allModes.canonAuthorities} canon authorities</b></div></header>
   <div><article><span>STAY</span><b>{evolution.allModes.stay}</b></article><article><span>TURN</span><b>{evolution.allModes.turn}</b></article><article><span>ESCALATE</span><b>{evolution.allModes.escalate}</b></article><article><span>MODE ENERGY</span><b>{fmt(evolution.allModes.energy,4)}</b></article><article><span>MODE ENTROPY</span><b>{fmt(evolution.allModes.entropy,4)}</b></article><article><span>ACTIVE AUTHORITIES</span><b>{evolution.allModes.activeAuthorities}</b></article></div>
   <details><summary>Strongest / weakest / top authorities</summary><pre>{JSON.stringify({strongest:evolution.allModes.strongest,weakest:evolution.allModes.weakest,topAuthorities:evolution.allModes.topAuthorities},null,2)}</pre></details>
  </section>
  <section className='dr155-candidate'><ShieldCheck/><div><span>{evolution.evolutionCandidate.state}</span><b>{evolution.evolutionCandidate.fromStateId} → {evolution.evolutionCandidate.toStateId} · {evolution.evolutionCandidate.resolutionAction} · {nfmt(evolution.evolutionCandidate.requestedResolution)} → {nfmt(evolution.evolutionCandidate.recommendedResolution)}</b><small>{evolution.continuityLaw}</small></div></section>
  <footer><ShieldCheck/><div><b>{evolution.dimensionBoundary}</b><span>{evolution.truthBoundary}</span></div></footer>
 </section>;
}
