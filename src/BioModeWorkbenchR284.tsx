import {useMemo,useState} from 'react';
import {Activity,BookOpen,Search,ShieldCheck} from 'lucide-react';
import {compareBioModesR284,compileBioModeExperienceR284} from './bioModeExperienceR284';
import './bioModeWorkbenchR284.css';

type Props={record:any;instrumentReady?:number;instrumentSupplied?:number};
type FamilyFilter='ALL'|'SOURCE_CATALOG'|'CANON_AUTHORITY';
type EvidenceFilter='ALL'|'EXECUTION_BOUND'|'IMPLEMENTED_OR_TESTED'|'CHARTED_OR_GATED'|'CATALOG_AFFINITY';
type SortMode='ACTIVATION'|'NAME'|'REALIZATION';
const pretty=(x:any)=>String(x??'—').replaceAll('_',' ');
const pct=(x:any)=>`${Math.round(Math.max(0,Math.min(1,Number(x)||0))*100)}%`;
const stageRank=(x:any)=>String(x)==='PROMOTED'?5:String(x)==='TESTED'?4:String(x)==='IMPLEMENTED'?3:String(x)==='GATED'?2:String(x)==='CHARTED'?1:0;

export default function BioModeWorkbenchR284({record,instrumentReady=0,instrumentSupplied=0}:Props){
 const experience=useMemo(()=>compileBioModeExperienceR284(record),[record]);
 const[query,setQuery]=useState(''),[family,setFamily]=useState<FamilyFilter>('ALL'),[evidence,setEvidence]=useState<EvidenceFilter>('ALL'),[group,setGroup]=useState('ALL'),[sort,setSort]=useState<SortMode>('ACTIVATION'),[selectedKey,setSelectedKey]=useState(''),[compareKey,setCompareKey]=useState('');
 const filtered=useMemo(()=>{
  const q=query.trim().toLowerCase();
  const rows=experience.channels.filter((x:any)=>{
   if(family!=='ALL'&&x.family!==family)return false;
   if(evidence!=='ALL'&&x.evidenceClass!==evidence)return false;
   if(group!=='ALL'&&x.group!==group)return false;
   if(q&&!`${x.id} ${x.name} ${x.group} ${x.operator} ${x.algebra} ${x.calculus} ${x.realization} ${x.state}`.toLowerCase().includes(q))return false;
   return true;
  });
  return [...rows].sort((a:any,b:any)=>sort==='NAME'?a.name.localeCompare(b.name):sort==='REALIZATION'?stageRank(b.realization)-stageRank(a.realization)||b.activation-a.activation:b.activation-a.activation||a.name.localeCompare(b.name));
 },[experience,query,family,evidence,group,sort]);
 const selected=(filtered.find((x:any)=>x.key===selectedKey)||filtered[0]||experience.channels[0]) as any;
 const compare=(experience.channels.find((x:any)=>x.key===compareKey)||null) as any;
 const delta=compareBioModesR284(selected,compare);
 const activation=Math.max(0,Math.min(1,Number(selected?.activation)||0));
 const ring=251.327;
 const proofSignals=[
  ['PROOF REF',Boolean(selected?.proofPresent)],
  ['EXECUTION',Boolean(selected?.provenExecution)],
  ['BOUNDARY',Boolean(selected?.boundary)],
  ['ZERO MEASUREMENT AUTHORITY',selected?.measurementAuthority===0],
  ['MODE METADATA',Boolean(selected?.operator||selected?.calculus)],
  ['R282 CLINICAL GATE',true]
 ] as const;
 return <section className='bio284' aria-label='Heavy Bio 241-channel mode workbench'>
  <header className='bio284-head'>
   <div><span>R284 · HEAVY BIO MODE EXPERIENCE</span><h3>241-Channel Mode Workbench</h3><p>Explore the real 179 source-catalog channels and 62 canon authorities by family, group, realization and evidence state. Visuals encode analytical metadata only; they do not create measurements, diagnoses, treatment recommendations or clinical authorization.</p></div>
   <div className='bio284-authority'><ShieldCheck/><span><b>MEASUREMENT AUTHORITY 0</b><small>R282 owns any scope-matched clinical weighting</small></span></div>
  </header>

  <div className='bio284-summary'>
   <article><span>ALL CHANNELS</span><b>{experience.total}</b><small>{experience.sourceCatalogCount} source + {experience.canonAuthorityCount} canon</small></article>
   <article><span>INSTRUMENT CONTEXT</span><b>{instrumentReady}/{instrumentSupplied}</b><small>instrument-ready / supplied · upstream evidence</small></article>
   <article><span>VISIBLE RESULTS</span><b>{filtered.length}</b><small>filters change display only</small></article>
   <article><span>SELECTED ACTIVATION</span><b>{pct(selected?.activation)}</b><small>model/channel activation · not physiology</small></article>
  </div>

  <div className='bio284-controls' aria-label='Mode filters'>
   <div className='bio284-family-tabs' role='group' aria-label='Mode family filter'>
    {(['ALL','SOURCE_CATALOG','CANON_AUTHORITY'] as FamilyFilter[]).map(x=><button key={x} className={family===x?'active':''} aria-pressed={family===x} onClick={()=>setFamily(x)}>{x==='ALL'?'ALL 241':x==='SOURCE_CATALOG'?'SOURCE 179':'CANON 62'}</button>)}
   </div>
   <label className='bio284-search'><Search/><input aria-label='Search Heavy Bio modes' value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search name, group, operator, calculus, state…'/></label>
   <label><span>GROUP</span><select aria-label='Filter by mode group' value={group} onChange={e=>setGroup(e.target.value)}><option value='ALL'>All groups</option>{experience.groups.map((x:string)=><option key={x} value={x}>{pretty(x)}</option>)}</select></label>
   <label><span>EVIDENCE</span><select aria-label='Filter by evidence class' value={evidence} onChange={e=>setEvidence(e.target.value as EvidenceFilter)}><option value='ALL'>All evidence states</option><option value='EXECUTION_BOUND'>Execution bound</option><option value='IMPLEMENTED_OR_TESTED'>Implemented / tested</option><option value='CHARTED_OR_GATED'>Charted / gated</option><option value='CATALOG_AFFINITY'>Catalog affinity</option></select></label>
   <label><span>SORT</span><select aria-label='Sort Heavy Bio modes' value={sort} onChange={e=>setSort(e.target.value as SortMode)}><option value='ACTIVATION'>Activation</option><option value='REALIZATION'>Realization</option><option value='NAME'>Name</option></select></label>
  </div>

  <div className='bio284-layout'>
   <nav className='bio284-mode-list' aria-label='Analytical mode list'>
    {filtered.length?filtered.map((m:any)=><button key={m.key} className={selected?.key===m.key?'selected':''} aria-current={selected?.key===m.key?'true':undefined} onClick={()=>setSelectedKey(m.key)}>
     <code>{m.family==='SOURCE_CATALOG'?'S':'C'}{String(m.ordinal).padStart(3,'0')}</code><span><b>{m.name}</b><small>{pretty(m.group)} · {pretty(m.realization)}</small></span><strong>{pct(m.activation)}<small>{pretty(m.evidenceClass)}</small></strong>
    </button>):<div className='bio284-no-results'><Search/><b>No channels match these filters.</b><span>Clear or broaden the display filters. No analytical state was changed.</span></div>}
   </nav>

   {selected&&<article className='bio284-detail'>
    <header><div><span>{selected.family==='SOURCE_CATALOG'?'SOURCE CATALOG CHANNEL':'CANON AUTHORITY'} · {selected.key}</span><h4>{selected.name}</h4><p>{pretty(selected.group)} · {pretty(selected.state)} · {pretty(selected.realization)}</p></div><div className='bio284-detail-actions'><button onClick={()=>setCompareKey(selected.key)}>{compareKey===selected.key?'COMPARE PINNED':'PIN FOR COMPARE'}</button>{compareKey&&<button className='quiet' onClick={()=>setCompareKey('')}>CLEAR COMPARE</button>}</div></header>

    <div className='bio284-visual-grid'>
     <div className='bio284-signature' aria-label={`Analytical metadata signature for ${selected.name}`}>
      <svg viewBox='0 0 120 120' role='img' aria-label={`Activation ${pct(selected.activation)}, ${pretty(selected.evidenceClass)}, measurement authority zero`}>
       <circle className='track' cx='60' cy='60' r='40'/><circle className='value' cx='60' cy='60' r='40' strokeDasharray={`${activation*ring} ${ring}`}/>
       <circle className='inner' cx='60' cy='60' r='28'/>
       {proofSignals.map(([label,on],i)=>{const a=-Math.PI/2+i*Math.PI*2/proofSignals.length,x=60+Math.cos(a)*51,y=60+Math.sin(a)*51;return <circle key={label} className={on?'signal on':'signal'} cx={x} cy={y} r='3.1'/>})}
       <text x='60' y='57' textAnchor='middle'>{Math.round(activation*100)}</text><text className='small' x='60' y='68' textAnchor='middle'>ACTIVATION</text>
      </svg>
      <div className='bio284-signal-legend'>{proofSignals.map(([label,on])=><span key={label} data-on={on?'true':'false'}><i/>{label}</span>)}</div>
     </div>
     <div className='bio284-metadata'>
      <div><span>Family</span><b>{pretty(selected.family)}</b></div><div><span>Group</span><b>{pretty(selected.group)}</b></div><div><span>Evidence class</span><b>{pretty(selected.evidenceClass)}</b></div><div><span>Realization</span><b>{pretty(selected.realization)}</b></div><div><span>State</span><b>{pretty(selected.state)}</b></div><div><span>Measurement authority</span><b>0</b></div><div><span>Proven execution</span><b>{selected.provenExecution?'YES':'NO / NOT CLAIMED'}</b></div><div><span>Proof reference</span><b>{selected.proofPresent?'PRESENT':'NOT BOUND'}</b></div>
     </div>
    </div>

    <div className='bio284-education'>
     <section><header><BookOpen/><div><b>WHAT THIS MODE MEANS HERE</b><small>Educational description constrained by source metadata</small></div></header><p>{selected.education}</p></section>
     <section><header><Activity/><div><b>VALIDATION REQUIREMENT</b><small>What would be required before clinical influence</small></div></header><p>{selected.validationNeed}</p></section>
    </div>

    <dl className='bio284-technical'>
     <div><dt>Operator</dt><dd>{selected.operator||'Not declared'}</dd></div><div><dt>Algebra</dt><dd>{selected.algebra||'Not declared'}</dd></div><div><dt>Calculus / basis</dt><dd>{selected.calculus||'Not declared'}</dd></div><div><dt>Proof binding</dt><dd>{selected.proof||'No proof reference bound to this channel'}</dd></div><div className='wide'><dt>Truth boundary</dt><dd>{selected.boundary}</dd></div>
    </dl>

    <section className='bio284-ladder' aria-label='Evidence and authority ladder'><header><ShieldCheck/><div><b>EVIDENCE → AUTHORITY LADDER</b><small>The selected mode is deliberately kept downstream of measurement</small></div></header><div>
     <article data-state='upstream'><span>1</span><b>Instrument observation</b><small>Calibrated, traceable, uncertainty-bounded measurement</small></article>
     <article data-state='upstream'><span>2</span><b>Derived biological state</b><small>Computation from preserved observations</small></article>
     <article data-state='current'><span>3</span><b>Mode hypothesis</b><small>{selected.name} · analytical/model channel</small></article>
     <article data-state='gated'><span>4</span><b>Holdout + prospective validation</b><small>Independent scope-matched evidence required</small></article>
     <article data-state='gated'><span>5</span><b>Authorized clinical influence</b><small>Only R282 may admit non-zero clinical weight</small></article>
    </div></section>

    {compare&&compare.key!==selected.key&&delta&&<section className='bio284-compare'><header><div><span>READ-ONLY COMPARISON</span><h5>{compare.name} ↔ {selected.name}</h5></div><button onClick={()=>setCompareKey('')}>CLEAR</button></header><div><article><span>Activation Δ</span><b>{delta.activationDelta>=0?'+':''}{delta.activationDelta.toFixed(3)}</b></article><article><span>Same family</span><b>{delta.sameFamily?'YES':'NO'}</b></article><article><span>Same group</span><b>{delta.sameGroup?'YES':'NO'}</b></article><article><span>Realization Δ</span><b>{delta.realizationDelta>=0?'+':''}{delta.realizationDelta}</b></article><article><span>Both proof-bound</span><b>{delta.proofPair?'YES':'NO'}</b></article><article><span>Measurement authority Δ</span><b>0</b></article></div><p>{delta.truthBoundary}</p></section>}

    <footer><ShieldCheck/><span>{experience.truthBoundary}</span></footer>
   </article>}
  </div>
 </section>;
}
