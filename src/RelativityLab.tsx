import {useMemo,useState} from 'react';
import {Activity,BookOpen,GitBranch,Orbit,ShieldCheck,Waypoints} from 'lucide-react';
import {corpusState} from './corpusRuntime';
import {unifiedFromRecord} from './unifiedCalculus';
import {calculusVisualLaw} from './calculusVisualLawR37';
import CalculusFieldR37 from './CalculusFieldR37';
import {VIOLET_AXES,VIOLET_MATH_REGISTRY,VIOLET_RELEASE,futureCoherenceProjection,pefProjection,violetProjection} from './violetCanon';
import {deriveHostProjection} from './hostProjection';
import DimensionalRelativityPanelR24 from './DimensionalRelativityPanelR24';
import DimensionalRelativityEvolutionR156 from './DimensionalRelativityEvolutionR156';
import CapabilityUniverseR158 from './CapabilityUniverseR158';
import OrganismReflexFabricR158 from './OrganismReflexFabricR158';
import OmegaMotionSkinMapR35 from './OmegaMotionSkinMapR35';
import {TransitionTruthPlotR93} from './TruthVisualsR93';
import {BLADE_GEOMETRY_R306_OPERATOR,BLADE_GEOMETRY_R306_TRUTH,bladeGeometryDemoR306} from './bladeGeometryR306.js';
import './relativityR36.css';
import './interactionViewGuardR158.css';

type Props={record:any;state:any;onNavigate?:(panel:string)=>void};
type Tab='FIELD'|'DIMENSIONAL'|'MOTION'|'CONTROLLER'|'VIOLET'|'BLADE'|'EQUATIONS';
const fmt=(x:any,d=4)=>typeof x==='number'&&Number.isFinite(x)?x.toFixed(d):'—';

export default function RelativityLab({record,state,onNavigate}:Props){
 const[tab,setTab]=useState<Tab>('DIMENSIONAL');
 const[perspective,setPerspective]=useState(11);
 const[alpha,setAlpha]=useState(1);
 const[epsilon,setEpsilon]=useState(.05);
 const[observerBeta,setObserverBeta]=useState(.32);
 const host=useMemo(()=>deriveHostProjection(record,state),[record,state]);
 const next=useMemo(()=>corpusState(record.autoPing.dataNext),[record.autoPing.dataNext]);
 const u=useMemo(()=>unifiedFromRecord(record),[record]);
 const v=useMemo(()=>unifiedFromRecord(next),[next]);
 const law=useMemo(()=>calculusVisualLaw(record),[record]);
 const violet=useMemo(()=>violetProjection(record,perspective),[record,perspective]);
 const pef=useMemo(()=>pefProjection(record,alpha),[record,alpha]);
 const future=useMemo(()=>futureCoherenceProjection(record,next,epsilon),[record,next,epsilon]);
 const blade=useMemo(()=>bladeGeometryDemoR306(),[]);
 const gamma=1/Math.sqrt(Math.max(.0001,1-observerBeta*observerBeta));
 const doppler=Math.sqrt((1+observerBeta)/(1-observerBeta));
 const projectedDepth=law.depthGain*gamma;
 const projectedRate=law.phaseSpeed*doppler;
 return <section className='panel relativity-lab rel36' data-omega-view-guard='R158'>
  <div className='section-head'><div><p className='overline'>RELATIVITY · OBSERVER / MOTION / CALCULUS PROJECTION</p><h2>See the operating fabric, then inspect what changes with frame</h2><p className='muted'>R158 exposes the current 20,736-state atlas, 241 provenance-separated mode/lens channels, R155 capability-family graph, promoted cross-family organism reflex, relative capacity, causal NOW, Woven carry and dimensional-relativity shells as source-bound instruments. The exact Drive-backed R24 workbook remains the detailed dimensional authority below them. R306 adds the recovered Blade Geometry state-reduction law as a finite software operator without declaring a new physical geometry.</p></div><div className='pill-row'><span className='pill'>STATE {record.stateId}</span><span className='pill'>FRAME {record.identity.frame}</span><span className='pill ok'>{record.metrics.decision}</span></div></div>
  <div className='r158-universe-host' data-omega-view-guard='R158' onWheelCapture={e=>{if(!(e.ctrlKey||e.metaKey))e.stopPropagation()}}><CapabilityUniverseR158 record={record} onNavigate={onNavigate}/></div>
  <OrganismReflexFabricR158/>
  <div className='rel36-observer' data-omega-control-plane='reserved'><label><span>Observer speed β</span><input type='range' min='0' max='.94' step='.01' value={observerBeta} onChange={e=>setObserverBeta(Number(e.target.value))}/><b>{observerBeta.toFixed(2)} c</b></label><div><span>Lorentz γ</span><b>{gamma.toFixed(3)}</b></div><div><span>Doppler factor</span><b>{doppler.toFixed(3)}</b></div><div><span>projected depth</span><b>{projectedDepth.toFixed(3)}</b></div><div><span>projected phase rate</span><b>{projectedRate.toFixed(3)}</b></div></div>
  <div className='rel-tabs' data-omega-control-plane='reserved'>{(['DIMENSIONAL','MOTION','FIELD','CONTROLLER','VIOLET','BLADE','EQUATIONS'] as Tab[]).map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</div>
  {tab==='DIMENSIONAL'&&<div className='rel36-reference'><DimensionalRelativityEvolutionR156 record={record}/><DimensionalRelativityPanelR24 record={record}/><p>Workbook-defined 0D–12D skins are representation stages; R156 extends their observer/address-resolution relationships but does not create new physical dimensions. β changes only the apparent field projection—longitudinal compression, angular aberration, apparent depth and phase rate. CanonState, route admission and donor provenance remain unchanged.</p><details className='r93-legacy-renderer'><summary>Optional observer-field rendering</summary><CalculusFieldR37 address={record.address} mode='RELATIVITY' steps={30} observerBeta={observerBeta} label={`DERIVED OBSERVER RENDER · β ${observerBeta.toFixed(2)} · γ ${gamma.toFixed(2)}`}/></details></div>}
  {tab==='MOTION'&&<><TransitionTruthPlotR93 record={record} nextRecord={next} title={`Relativity packet transition · β ${observerBeta.toFixed(2)} projection controls separate`}/><div className='rel-compare'><div><span>CURRENT</span><b>{record.stateId}</b><small>CΩ {fmt(u.C)} · Φ {fmt(u.Phi)} · q {fmt(u.q)} · Λ {fmt(u.Lambda)}</small></div><i>→</i><div><span>ADMITTED NEXT</span><b>{next.stateId}</b><small>CΩ {fmt(v.C)} · Φ {fmt(v.Phi)} · q {fmt(v.q)} · Λ {fmt(v.Lambda)}</small></div></div><OmegaMotionSkinMapR35 address={record.address} compact/><div className='boundary'><ShieldCheck/>β, γ and Doppler alter only the observer projection shown by this surface. They do not rewrite the canonical packet, change route admission, or assert a measured physical velocity for OMEGA address-space motion.</div></>}
  {tab==='FIELD'&&<div className='rel36-field'>{[['PARENT',record.psc.parentScore],['ACCUMULATION',record.psc.accumulationScore],['SCAR',record.psc.scarScore],['CONSTRAINT',record.psc.constraintScore],['PHASE',record.psc.phaseScore],['CONTINUITY',record.psc.continuityScore],['CARRY',record.predict.carry],['NEXT',next.stateId],['CURVATURE',law.curvature],['FOLD',law.fold],['TRAIL',law.trailPersistence],['ROUTE',law.routeStrength]].map(([name,val],i)=><article key={String(name)}><span>{String(i+1).padStart(2,'0')}</span><b>{name}</b><strong>{typeof val==='number'?fmt(val):String(val)}</strong></article>)}</div>}
  {tab==='CONTROLLER'&&<div className='controller-grid'><article><div className='controller-head'><div><span>PHASE ELASTICITY</span><h3>PEF runtime projection</h3></div><b>{fmt(pef.value,6)}</b></div><label>α sensitivity <input type='range' min='.25' max='4' step='.05' value={alpha} onChange={e=>setAlpha(Number(e.target.value))}/><strong>{alpha.toFixed(2)}</strong></label><code>{pef.formula}</code><p>{pef.boundary}</p></article><article><div className='controller-head'><div><span>FUTURE COHERENCE</span><h3>Admissibility controller</h3></div><b>{future.admissible?'ADMISSIBLE':'HOLD'}</b></div><label>ε loss budget <input type='range' min='0' max='.25' step='.005' value={epsilon} onChange={e=>setEpsilon(Number(e.target.value))}/><strong>{epsilon.toFixed(3)}</strong></label><code>{future.formula}</code><p>{future.boundary}</p></article></div>}
  {tab==='VIOLET'&&<><div className='violet-banner'><div><span>VALIDATED RELEASE</span><h3>Violet Transfiguration Canon</h3><p>{VIOLET_RELEASE.decision}</p></div><div><b>{VIOLET_RELEASE.atlas.rows.toLocaleString()}</b><span>12⁵ atlas rows</span></div><div><b>{VIOLET_RELEASE.psc.r2.toFixed(4)}</b><span>held-out PSC R²</span></div></div><label className='violet-perspective'>Perspective <input type='range' min='1' max='12' value={perspective} onChange={e=>setPerspective(Number(e.target.value))}/><b>{perspective} · {VIOLET_AXES.perspectives[perspective-1]}</b></label><div className='violet-axis-grid'>{Object.entries(violet.labels).map(([k,val])=><div key={k}><span>{k}</span><b>{val}</b></div>)}</div><div className='boundary'><ShieldCheck/> {violet.boundary}</div></>}
  {tab==='BLADE'&&<div className='blade-r306'><div className='violet-banner'><div><span>R306 · SOURCE-RECOVERED OPERATOR</span><h3>Blade Geometry</h3><p>{BLADE_GEOMETRY_R306_TRUTH.sourceLaw}</p></div><div><b>{blade.counts.states} → {blade.counts.reducedStates}</b><span>finite demo states → orbit representatives</span></div><div><b>{blade.exact?'EXACT':'HOLD'}</b><span>declared-domain quotient/lift gate</span></div></div><div className='math-registry'>{BLADE_GEOMETRY_R306_OPERATOR.map((name,i)=><article key={name}><div><span>B{i+1}</span><b>{i<5?'REDUCE':'LIFT'}</b></div><h3>{name}</h3><p>{i===0?'Declare the finite state space and generator identity.':i===1?'Admit only declared legal transitions.':i===2?'Partition by properties preserved across every legal transition.':i===3?'Collapse only equivalence/orbit classes that stay inside one invariant class.':i===4?'Evaluate a representative only when the objective is constant over its orbit.':'Lift accepted representatives back to every member of the exact orbit.'}</p></article>)}</div><div className='rel-compare'><div><span>DECLARED DOMAIN</span><b>{blade.counts.states} states</b><small>{blade.counts.invariantClasses} invariant classes · {blade.counts.orbits} orbits</small></div><i>→</i><div><span>REDUCED SEARCH</span><b>{blade.counts.reducedStates} representatives</b><small>{(blade.counts.reduction*100).toFixed(1)}% state reduction · lifted solution {blade.liftedSolutions.join(', ')||'none'}</small></div></div><div className='boundary'><ShieldCheck/> {BLADE_GEOMETRY_R306_TRUTH.boundary}</div><div className='boundary'><Waypoints/> Woven relation: {BLADE_GEOMETRY_R306_TRUTH.continuity}</div></div>}
  {tab==='EQUATIONS'&&<div className='math-registry'>{VIOLET_MATH_REGISTRY.map(x=><article key={x.id}><div><span>{x.id}</span><b>{x.status}</b></div><h3>{x.name}</h3><code>{x.formula}</code><p>{x.scope}</p></article>)}</div>}
  <div className='rel-footer'><ShieldCheck/><span>HostState {host.key}</span><Waypoints/><span>{record.stateId} → {next.stateId}</span><GitBranch/><span>{state.timeAuthority}</span><Orbit/><span>observer changes projection, not canonical existence</span></div>
  <div className='action-row'><button onClick={()=>onNavigate?.('Forecast')}><Activity/>Forecast</button><button onClick={()=>onNavigate?.('Instructions')}><BookOpen/>Guide</button></div>
 </section>;
}
