import {useMemo,useState} from 'react';
import original from '../audit/omega-full-historical-software-ledger-r926.json';

type Software=typeof original.software[number];
type Menu=typeof original.menus[number];
type Tab='SOFTWARE'|'MENUS'|'CONTROLS'|'CAPABILITIES'|'SEQUENCE'|'GATES';

const frame:React.CSSProperties={border:'1px solid #567489',borderRadius:12,background:'#102435',padding:16,color:'#e6f1f8',margin:'14px 0'};
const input:React.CSSProperties={border:'1px solid #7894a6',borderRadius:7,padding:'9px 11px',color:'#f3fbff',background:'#17384a',minWidth:0,maxWidth:'100%',boxSizing:'border-box'};
const click:React.CSSProperties={padding:'8px 11px',background:'#225568',color:'#fff',border:'1px solid #7296a3',borderRadius:7,cursor:'pointer'};
const all=original.software;
const menuList=original.menus;
const searchable=(...parts:string[])=>parts.join(' ').toLowerCase();
const dispositionColors:Record<string,string>={KEEP:'#66c4b0',MERGE:'#d6b36e',DONOR:'#b0abc4'};
export default function OmegaOneSystemLedgerR926({onNavigate}:{onNavigate:(route:string)=>void}){
 const [tab,setTab]=useState<Tab>('SOFTWARE');
 const [menu,setMenu]=useState('ALL');
 const [disposition,setDisposition]=useState('ALL');
 const [search,setSearch]=useState('');
 const [picked,setPicked]=useState<string>('SYS-001');
 const term=search.trim().toLowerCase();
 const chosen=all.find((s:Software)=>s.ID===picked);
 const filtered=useMemo(()=>all.filter((s:Software)=>
   (menu==='ALL'||s['Menu ID']===menu)&&
   (disposition==='ALL'||s.Disposition===disposition)&&
   (!term||searchable(s.ID,s.Family,s['Software / Artifact'],s['One-System Role'],s['Menu Setting'],s['Primary Capability'],s.Disposition,s['Upgrade Sequence']).includes(term))
 ),[menu,disposition,term]);
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
     {filtered.map((s:Software)=><button key={s.ID} type='button' onClick={()=>setPicked(s.ID)} aria-pressed={picked===s.ID} style={{...click,textAlign:'left',background:picked===s.ID?'#276982':'#142f40'}}>
      <span style={{display:'flex',justifyContent:'space-between',gap:8}}><strong>{s.ID} · {s['Software / Artifact']}</strong><small style={{color:dispositionColors[s.Disposition]||'#bbb'}}>{s.Disposition}</small></span>
      <small>{s['One-System Role']} · {s['Menu ID']}</small>
     </button>)}
    </div>
    <aside style={{padding:13,borderRadius:9,background:'#172f40'}}>
     {chosen&&<><p style={{color:'#c9d9e6',marginTop:0}}>{chosen.ID} · {chosen.Disposition} · {chosen['Upgrade Sequence']}</p>
      <h3>{chosen['Software / Artifact']}</h3><p>{chosen['Primary Capability']}</p>
      <p><strong>Original role:</strong> {chosen['One-System Role']}<br/><strong>Family:</strong> {chosen.Family}<br/><strong>Control:</strong> {chosen['Menu Setting']}<br/><strong>Growth:</strong> {chosen['Growth Tier']}</p>
      <p><strong>Input:</strong> {chosen['Input Contract']}<br/><strong>Output:</strong> {chosen['Output Contract']}</p>
      <p><strong>Historical wiring:</strong> {chosen['Wiring Notes']}</p>
      <p><strong>OMEGA7 route:</strong> {chosen.navigationRoute}</p>
      <small style={{display:'block',marginBottom:10}}>Source-registered workspace relation. This does not establish that this individual historical executable was ported or invoked.</small>
      <button type='button' style={click} onClick={()=>nav(chosen.navigationRoute)}>Open mapped OMEGA7 workspace</button>
     </>}
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
  {tab==='CONTROLS'&&<div style={{display:'grid',gap:9,marginTop:12}}>
   {original.settings.map(s=><article key={s['Option ID']} style={{background:'#173447',padding:12,borderRadius:8}}>
    <strong>{s['Option ID']} · {s['Option / Toggle']}</strong> <small>({s['Top Menu']})</small>
    <p>{s['Capability Output']} · State: {s['State Space Used']}</p>
    <small>Default {s.Default}; gate {s['Requires Proof Gate']}; acceptance: {s['Acceptance Check']}</small>
    <p style={{marginBottom:0,color:'#d6b36e'}}>Charted intended control; actual safe mutation must be exercised through the governing executor.</p>
   </article>)}
  </div>}
  {tab==='CAPABILITIES'&&<div style={{display:'grid',gap:9,marginTop:12}}>
   {original.capabilities.map(c=><article key={c['Capability ID']} style={{background:'#173447',padding:12,borderRadius:8}}>
    <strong>{c['Capability ID']} · {c.Capability}</strong><p>{c['Processing Law']} → {c.Output}</p>
    <small>Gate: {c['Proof Gate']} · State: {c['State Tier']} · Completion: {c['Completion Definition']}</small>
   </article>)}
  </div>}
  {tab==='SEQUENCE'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:8,marginTop:12}}>
   {original.sequences.map(s=><article key={s.SEQ} style={{background:'#173447',padding:10,borderRadius:8}}>
    <strong>{s.SEQ} · {s['Phase Name']}</strong><p>{s['Growth Upgrade']}</p><small>Input: {s.Input} · Proof: {s['Proof Gate']} · Next: {s['Next Sequence']}</small>
   </article>)}
  </div>}
  {tab==='GATES'&&<div style={{display:'grid',gap:9,marginTop:12}}>
   {original.gates.map(g=><article key={g['Gate ID']} style={{background:'#173447',padding:12,borderRadius:8}}>
    <strong>{g['Gate ID']} · {g.Gate}</strong> <small>Packaging block: {g['Blocks Packaging?']}</small>
    <p>Required: {g['Required Evidence']} · PASS when: {g['Pass Rule']}</p>
    <small>Source acceptance contract, not independent current runtime proof. Recovery: {g['Recovery Action']}</small>
   </article>)}
  </div>}
  <footer style={{marginTop:16,borderTop:'1px solid #547184',paddingTop:9}}>
   <small>Original source: OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx · 100/12/36/18/144/12 original rows · design authority only. A live executor/host/deployment proof must be linked individually before promotion.</small>
  </footer>
 </section>;
}
