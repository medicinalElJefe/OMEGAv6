import {BrainCircuit,Cpu,Database,GitBranch,Layers3,Route,ShieldCheck,TriangleAlert,Waypoints} from 'lucide-react';
import {compileContributionFabricR248,R248_DIMENSIONS} from './system/contributionFabricR248.js';
import './contributionFabricR248.css';

type Props={canon:any;raw:any;errors:Array<{source:string;message:string}>;observedAt:number;onNavigate:(name:string)=>void};
const cls=(state:string)=>state==='PROVED'||state==='AUTHORITY_PRESENT'?'proved':state==='AVAILABLE_UNPROVED'?'held':'gap';
const short=(value:string)=>value.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());

export default function ContributionFabricR248({canon,raw,errors,observedAt,onNavigate}:Props){
 const fabric=compileContributionFabricR248({canon,raw,errors,observedAt});
 const maxDimension=Math.max(1,...Object.values(fabric.dimensionAverages).map(Number));
 return <section className='r248-fabric' data-r248-contribution-fabric='true' data-r248-read-only='true' data-r248-admission-authority={fabric.admission.authority}>
  <header className='r248-head'>
   <div><span>R248 · RELATIVE CONTRIBUTION FABRIC · ONE R245 OBSERVATION EPOCH</span><h3>Every contributor keeps its own role, evidence, limits and authority ceiling.</h3><p>{fabric.continuityOperator}</p></div>
   <div className='r248-summary' aria-label='R248 contribution closure summary'><strong>{fabric.summary.readiness}%</strong><span>RELATIVE LIVE CLOSURE</span><small>{fabric.summary.proved} proved/authority · {fabric.summary.availableUnproved} held · {fabric.summary.unobserved} unobserved · {fabric.summary.contradictions} contradictions</small></div>
  </header>

  <section className='r248-dimension-chart' aria-label='R248 contribution dimension chart'>
   <header><Layers3/><div><span>12-DIMENSION CONTRIBUTION PROFILE</span><b>Structural weight × current evidence state</b><small>These are architectural comparison weights, not measurements of physical dimensions or fabricated provider performance.</small></div></header>
   <div className='r248-dimension-bars'>{R248_DIMENSIONS.map(d=><div key={d}><span>{short(d)}</span><div><i style={{width:`${Math.round((fabric.dimensionAverages[d]/maxDimension)*100)}%`}}/></div><strong>{fabric.dimensionAverages[d]}</strong></div>)}</div>
  </section>

  <section className='r248-contributor-grid' aria-label='R248 contributor atlas'>
   {fabric.contributors.map((c:any)=><article key={c.id} className={cls(c.state)} data-contributor={c.id} data-state={c.state}>
    <header><code>{c.class}</code><strong>{c.state}</strong></header><b>{c.label}</b><small>{c.ceiling}</small>
    <div className='r248-mini-profile'>{['CAPABILITY','PROVENANCE','FRESHNESS','RELIABILITY','EXECUTION','CONTINUITY','ADMISSION'].map(dim=><span key={dim} title={`${dim} ${c.profile[dim]}`}><i style={{height:`${Math.max(3,c.profile[dim])}%`}}/><em>{dim.slice(0,3)}</em></span>)}</div>
   </article>)}
  </section>

  <div className='r248-lower-grid'>
   <section className='r248-relations'>
    <header><Waypoints/><div><span>CONTRIBUTION RELATIONS</span><b>Specialized contributors → one governed result</b></div></header>
    <div>{fabric.relations.map((edge:any)=><article key={`${edge.from}-${edge.to}`} data-active={edge.active?'true':'false'}><code>{edge.from}</code><Route/><code>{edge.to}</code><small>{edge.kind.replaceAll('_',' ')}</small></article>)}</div>
   </section>
   <section className='r248-residuals'>
    <header><TriangleAlert/><div><span>RESIDUAL + CONTRADICTION LEDGER</span><b>{fabric.contradictions.length?`${fabric.contradictions.length} contradiction${fabric.contradictions.length===1?'':'s'} require hold`:'No detected cross-source contradiction'}</b></div></header>
    {fabric.contradictions.length?fabric.contradictions.map((x:any)=><article key={x.id} className='contradiction'><strong>{x.severity}</strong><div><b>{x.id.replaceAll('_',' ')}</b><small>{x.message}</small></div></article>):<article className='clear'><ShieldCheck/><div><b>Contradiction ledger clear for this epoch</b><small>Unobserved contributors remain residuals; they are not silently upgraded to proof.</small></div></article>}
    <details><summary>{fabric.residuals.length} contribution residuals</summary>{fabric.residuals.map((x:any)=><p key={`${x.id}-${x.reason}`}><code>{x.id}</code><span>{x.reason.replaceAll('_',' ')}</span></p>)}</details>
   </section>
  </div>

  <section className='r248-authority'>
   <ShieldCheck/><div><span>AUTHORITY FACTORIZATION</span><b>Contribution strength never overrides authority fit.</b><small>R147 dispatch/executor selection · R141 exact returned Hybrid proof · R146 durable execution history · R125 sole CanonState admission · ci.yml sole canonical production writer · R201/R203 remain retired.</small></div>
   <nav><button type='button' onClick={()=>onNavigate('Hybrid Link')}><Cpu/>Native execution</button><button type='button' onClick={()=>onNavigate('Evidence & Proof')}><Database/>Evidence + proof</button><button type='button' onClick={()=>onNavigate('Build Out')}><GitBranch/>Governed build</button><button type='button' onClick={()=>onNavigate('Modes')}><BrainCircuit/>Modes + derivation</button></nav>
  </section>

  <footer>{fabric.truthBoundary}</footer>
 </section>;
}
