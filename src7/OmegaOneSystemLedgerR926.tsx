import {useMemo,useState,type CSSProperties} from 'react';
import original from '../audit/omega-full-historical-software-ledger-r926.json';

type Software=typeof original.software[number];
type Menu=typeof original.menus[number];
type Tab='SOFTWARE'|'MENUS'|'CONTROLS'|'CAPABILITIES'|'SEQUENCE'|'GATES';

const frame:CSSProperties={border:'1px solid #567489',borderRadius:12,background:'#102435',padding:16,color:'#e6f1f8',margin:'14px 0'};
const input:CSSProperties={border:'1px solid #7894a6',borderRadius:7,padding:'9px 11px',color:'#f3fbff',background:'#17384a',minWidth:0,maxWidth:'100%',boxSizing:'border-box'};
const click:CSSProperties={padding:'8px 11px',background:'#225568',color:'#fff',border:'1px solid #7296a3',borderRadius:7,cursor:'pointer'};
const all=original.software;
const menuList=original.menus;
const searchable=(...parts:string[])=>parts.join(' ').toLowerCase();
const dispositionColors:Record<string,string>={KEEP:'#66c4b0',MERGE:'#d6b36e',DONOR:'#b0abc4'};
export default function OmegaOneSystemLedgerR926({onNavigate}:{onNavigate:(route:string)=>void}){
 const [tab,setTab]=useState<Tab>('SOFTWARE');
 const [menu,setMenu]=useState('ALL');
 const [disposition,setDisposition]=useState('ALL');
 const [search,setSearch]=useState('');
 const [stageQuery,setStageQuery]=useState('');
 const [controlQuery,setControlQuery]=useState('');
 const [picked,setPicked]=useState<string>('SYS-001');
 const term=search.trim().toLowerCase();
 const chosen=all.find((s:Software)=>s.ID===picked);
 const filtered=useMemo(()=>all.filter((s:Software)=>
   (menu==='ALL'||s['Menu ID']===menu)&&
   (disposition==='ALL'||s.Disposition===disposition)&&
   (!term||searchable(s.ID,s.Family,s['Software / Artifact'],s['One-System Role'],s['Menu Setting'],s['Primary Capability'],s.Disposition,s['Upgrade Sequence']).includes(term))
 ),[menu,disposition,term]);
 const familyRoute=(menuName:string)=>menuList.find((m:Menu)=>m.name===menuName)?.route;
 const stageOwners=(sequence:string,primaryFamily:string)=>all.filter((s:Software)=>s['Software / Artifact']===primaryFamily||s['Upgrade Sequence']===sequence);
 const stageResults=original.sequences.filter(s=>!stageQuery.trim()||searchable(s.SEQ,s['Phase Name'],s['Domain / Menu'],s['Primary Software Family'],s['Growth Upgrade'],s['Proof Gate']).includes(stageQuery.trim().toLowerCase()));
 const controlResults=original.settings.filter(s=>!controlQuery.trim()||searchable(s['Option ID'],s['Option / Toggle'],s['Top Menu'],s['Capability Output'],s['Requires Proof Gate']).includes(controlQuery.trim().toLowerCase()));
 const focusStage=(sequence:string)=>{setStageQuery(sequence);setTab('SEQUENCE');};
 const nextStage=(sequence:string)=>sequence==='LOOP-TO-SEQ-001'?'SEQ-001':sequence;
 const tabs:Tab[]=['SOFTWARE','MENUS','CONTROLS','CAPABILITIES','SEQUENCE','GATES'];
 const evidence='SOURCE CHARTED · no independent runtime acceptance inferred from menu membership';
 const nav=(route:string)=>onNavigate(route);
 return <section data-r926-one-system-ledger='SOURCE_AND_ROUTE_BOUND_NOT_COMPLETE_ACCEPTANCE' style={frame}>
  <header>
   <p style={{color:'#a9d5e4',margin:0,letterSpacing:'0.07em'}}>ONE SYSTEM · CANONICAL HISTORICAL INVENTORY</p>
   <h2 style={{margin:'7px 0'}}>100 software families · 12 master menus · 24-bin historical lineage</h2>
   <p style={{color:'#b5cbd7',marginTop:0}}>The original software ledger is correlated with current OMEGA7 route ownership, controls, upgrade sequence and proof gates. This inventory does not falsely certify executors merely because they are listed or reachable.</p>
  </header>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(135px,1fr))',gap:9,marginBottom:16}}>
   {([['SOFTWARE',100],['MENUS',12],['CONTROLS',36],['CAPABILITIES',18],['SEQUENCE',144],['GATES',12]] as const).map(([key,value])=>
    <button type='button' key={key} aria-pressed={tab===key} onClick={()=>setTab(key)} style={{...click,background:tab===key?'#276982':'#143348',textAlign:'left'}}>
     <strong style={{display:'block',fontSize:22}}>{value}</strong><span style={{fontSize:12}}>{key==='SEQUENCE'?'Upgrade stages':key.toLowerCase()}</span>
    </button>)}
  </div>
  <small style={{color:'#b9cfd9'}}>{evidence} · 63 KEEP / 26 MERGE / 11 DONOR · 44 native routes exist elsewhere in OMEGA7.</small>
  {tab==='SOFTWARE'&&<>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:9,margin:'13px 0'}}>
    <label>Find software or capability<input style={{...input,width:'100%'}} value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search all 100 families' aria-label='Search all 100 software families'/></label>
    <label>Master menu<select style={{...input,width:'100%'}} value={menu} onChange={e=>setMenu(e.target.value)}><option value='ALL'>All 12 menus</option>{menuList.map((m:Menu)=><option key={m.id} value={m.name}>{m.name}</option>)}</select></label>
    <label>Disposition<select style={{...input,width:'100%'}} value={disposition} onChange={e=>setDisposition(e.target.value)}><option value='ALL'>All dispositions</option>{['KEEP','MERGE','DONOR'].map(d=><option key={d}>{d}</option>)}</select></label>
   </div>
   <p role='status'>{filtered.length} / 100 charted families match · selecting an item shows its exact original role and mapped OMEGA7 workspace.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(275px,1fr))',gap:12}}>
    <div style={{maxHeight:460,overflowY:'auto',display:'grid',alignContent:'start',gap:6}}>
     {filtered.length===0&&<p role='status'>No matching software families. Adjust the search or filters.</p>}
     {filtered.map((s:Software)=><button key={s.ID} type='button' onClick={()=>setPicked(s.ID)} aria-pressed={picked===s.ID} style={{...click,textAlign:'left',background:picked===s.ID?'#276982':'#142f40'}}>
      <span style={{display:'flex',justifyContent:'space-between',gap:8}}><strong>{s.ID} · {s['Software / Artifact']}</strong><small style={{color:dispositionColors[s.Disposition]||'#bbb'}}>{s.Disposition}</small></span>
      <small>{s['One-System Role']} · {s['Menu ID']}</small>
     </button>)}
    </div>
    <aside style={{padding:13,borderRadius:9,background:'#172f40'}}>
     {chosen&&filtered.some((s:Software)=>s.ID===chosen.ID)&&<><p style={{color:'#c9d9e6',marginTop:0}}>{chosen.ID} · {chosen.Disposition} · {chosen['Upgrade Sequence']}</p>
      <h3>{chosen['Software / Artifact']}</h3><p>{chosen['Primary Capability']}</p>
      <p><strong>Original role:</strong> {chosen['One-System Role']}<br/><strong>Family:</strong> {chosen.Family}<br/><strong>Control:</strong> {chosen['Menu Setting']}<br/><strong>Growth:</strong> {chosen['Growth Tier']}</p>
      <p><strong>Input:</strong> {chosen['Input Contract']}<br/><strong>Output:</strong> {chosen['Output Contract']}</p>
      <p><strong>Historical wiring:</strong> {chosen['Wiring Notes']}</p>
      <p><strong>OMEGA7 route:</strong> {chosen.navigationRoute}</p>
      <small style={{display:'block',marginBottom:10}}>Source-registered workspace relation. This does not establish that this individual historical executable was ported or invoked.</small>
      <button type='button' style={click} onClick={()=>nav(chosen.navigationRoute)}>Open mapped OMEGA7 workspace</button>
      {chosen['Menu ID']==='11 Archive Merge'&&<button type='button' style={{...click,marginLeft:8,marginTop:6}} onClick={()=>nav('Archive Operators')}>Open authenticated archive execution</button>}
      <button type='button' style={{...click,marginLeft:8,marginTop:6}} onClick={()=>focusStage(chosen['Upgrade Sequence'])}>Inspect {chosen['Upgrade Sequence']} stage</button>
     </>}
     {(!chosen||!filtered.some((s:Software)=>s.ID===chosen.ID))&&<p role='status'>Select a family from the current results to inspect its source contract and route.</p>}
    </aside>
   </div>
  </>}
  {tab==='MENUS'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10,marginTop:15}}>
   {menuList.map((m:Menu)=><div key={m.id} style={{background:'#173447',padding:12,borderRadius:8}}>
    <h3>{m.name}</h3><p>{all.filter(s=>s['Menu ID']===m.name).length} software families · {original.settings.filter(s=>s['Top Menu']===m.name).length} controls · route: {m.route}</p>
    <button type='button' style={click} onClick={()=>nav(m.route)}>Open {m.route}</button>
    <button type='button' style={{...click,marginLeft:6}} onClick={()=>{setMenu(m.name);setTab('SOFTWARE')}}>Inspect families</button>
   </div>)}
  </div>}
  {tab==='CONTROLS'&&<div style={{marginTop:12}}>
   <label>Find a control<input style={{...input,width:'100%',marginTop:5}} value={controlQuery} onChange={e=>setControlQuery(e.target.value)} placeholder='Filter 36 controls by owner, name or proof gate'/></label>
   <p role='status'>{controlResults.length} / 36 controls match</p>
   <div style={{display:'grid',gap:9}}>
   {controlResults.length===0&&<p>No controls match this search.</p>}
   {controlResults.map(s=><article key={s['Option ID']} style={{background:'#173447',padding:12,borderRadius:8}}>
    <strong>{s['Option ID']} · {s['Option / Toggle']}</strong> <small>({s['Top Menu']})</small>
    <p>{s['Capability Output']} · State: {s['State Space Used']}</p>
    <small>Default {s.Default}; gate {s['Requires Proof Gate']}; acceptance: {s['Acceptance Check']}</small>
    <p style={{marginBottom:8,color:'#d6b36e'}}>Charted intended control; actual safe mutation must be exercised through the governing executor.</p>
    {familyRoute(s['Top Menu'])&&<button type='button' style={click} onClick={()=>nav(familyRoute(s['Top Menu'])!)}>Open governing {s['Top Menu']} workspace</button>}
   </article>)}
   </div>
  </div>}
  {tab==='CAPABILITIES'&&<div style={{display:'grid',gap:9,marginTop:12}}>
   {original.capabilities.map(c=><article key={c['Capability ID']} style={{background:'#173447',padding:12,borderRadius:8}}>
    <strong>{c['Capability ID']} · {c.Capability}</strong><p>{c['Processing Law']} → {c.Output}</p>
    <small>Gate: {c['Proof Gate']} · State: {c['State Tier']} · Completion: {c['Completion Definition']}</small>
    {familyRoute(c.Menu)&&<button type='button' style={{...click,display:'block',marginTop:9}} onClick={()=>nav(familyRoute(c.Menu)!)}>Open governing {c.Menu} workspace</button>}
   </article>)}
  </div>}
  {tab==='SEQUENCE'&&<div style={{marginTop:12}}>
   <label>Find upgrade stage<input style={{...input,width:'100%',marginTop:5}} value={stageQuery} onChange={e=>setStageQuery(e.target.value)} placeholder='Search sequence number, phase, family, domain or proof gate'/></label>
   <p role='status'>{stageResults.length} / 144 upgrade stages match <button type='button' style={{...click,marginLeft:10}} onClick={()=>setStageQuery('')}>Show all stages</button></p>
   {stageResults.length===0&&<p>No upgrade stages match this search.</p>}
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:8}}>
   {stageResults.map(s=><article key={s.SEQ} style={{background:'#173447',padding:10,borderRadius:8}}>
    <strong>{s.SEQ} · {s['Phase Name']}</strong><p>{s['Growth Upgrade']}</p><small>Primary family: {s['Primary Software Family']} · Tier: {s['State Tier']}</small><p><small>Dependency: {s.Dependency} · Completion: {s['Completion Test']} · Proof: {s['Proof Gate']} · Next: {s['Next Sequence']}</small></p>
    {s['Next Sequence']&&original.sequences.some(n=>n.SEQ===nextStage(s['Next Sequence']))&&<button type='button' style={{...click,display:'block',marginTop:8}} onClick={()=>setStageQuery(nextStage(s['Next Sequence']))}>{s['Next Sequence']==='LOOP-TO-SEQ-001'?'Review cycle from SEQ-001':'Continue to '+s['Next Sequence']}</button>}
    {stageOwners(s.SEQ,s['Primary Software Family']).map((owner:Software)=><button type='button' key={owner.ID} style={{...click,display:'block',marginTop:8}} onClick={()=>nav(owner.navigationRoute)}>Open {owner.ID} · {owner.navigationRoute}</button>)}
   </article>)}
   </div>
  </div>}
  {tab==='GATES'&&<div style={{display:'grid',gap:9,marginTop:12}}>
   {original.gates.map(g=><article key={g['Gate ID']} style={{background:'#173447',padding:12,borderRadius:8}}>
    <strong>{g['Gate ID']} · {g.Gate}</strong> <small>Packaging block: {g['Blocks Packaging?']}</small>
    <p>Required: {g['Required Evidence']} · PASS when: {g['Pass Rule']}</p>
    <small>Source acceptance contract, not independent current runtime proof. Recovery: {g['Recovery Action']}</small>
    {familyRoute(g['Menu Binding'])&&<button type='button' style={{...click,display:'block',marginTop:9}} onClick={()=>nav(familyRoute(g['Menu Binding'])!)}>Open governing {g['Menu Binding']} workspace</button>}
   </article>)}
  </div>}
  <footer style={{marginTop:16,borderTop:'1px solid #547184',paddingTop:9}}>
   <small>Original source: OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx · 100/12/36/18/144/12 original rows · design authority only. A live executor/host/deployment proof must be linked individually before promotion.</small>
  </footer>
 </section>;
}
