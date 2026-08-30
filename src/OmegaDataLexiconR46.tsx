import {useMemo,useState} from 'react';
import {FileJson,FileSpreadsheet,Search,ShieldCheck,Upload,Waypoints} from 'lucide-react';
import {localState} from './platformAdapter';
import './extremeRestorationR46.css';

type Imported={
 id:string;
 name:string;
 size:number;
 kind:'CSV'|'JSON'|'XLSX'|'OTHER';
 sha256:string;
 rows?:number;
 columns?:number;
 keys?:string[];
 preview?:string[][];
 boundary:string;
};

const STORE='omega.r46.data.imports';
const NAV:Record<string,string>={
 ask:'Command Center',command:'Command Center',build:'Build Out',code:'Development',create:'Create',
 render:'Visual Instrument',visual:'Visual Instrument',matter:'Matter Traversal',traverse:'Traversal',
 earth:'Earth Now',forecast:'Forecast',proof:'Evidence & Proof',evidence:'Evidence & Proof',memory:'Memory',
 archive:'Archive Census',plugin:'Plugins',adapter:'Plugins',data:'Plugins',csv:'Plugins',excel:'Plugins',
 language:'Instructions',lexicon:'Instructions',system:'System Atlas',mode:'Modes',calculus:'Modes',
 hybrid:'Hybrid Link',computer:'Hybrid Link',pc:'Hybrid Link'
};
const OPS:Record<string,string>={
 carry:'CARRY',construct:'CONSTRUCT',build:'CONSTRUCT',prune:'PRUNE',remove:'PRUNE',turn:'TURN',
 change:'TURN',escalate:'ESCALATE',scar:'SCAR',translate:'TRANSLATE',prove:'PROVE',proof:'PROVE',
 forecast:'FORECAST',ledger:'LEDGER'
};
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');

function parseCsv(text:string){
 const rows:string[][]=[];
 let row:string[]=[],cell='',quote=false;
 for(let i=0;i<text.length&&rows.length<101;i++){
  const c=text[i];
  if(c==='"'){
   if(quote&&text[i+1]==='"'){cell+='"';i++}
   else quote=!quote;
  }else if(c===','&&!quote){
   row.push(cell);cell='';
  }else if((c==='\n'||c==='\r')&&!quote){
   if(c==='\r'&&text[i+1]==='\n')i++;
   row.push(cell);
   if(row.some(Boolean))rows.push(row);
   row=[];cell='';
  }else{
   cell+=c;
  }
 }
 if((cell||row.length)&&rows.length<101){row.push(cell);rows.push(row)}
 return rows;
}

function compile(text:string){
 const tokens=text.toLowerCase().match(/[a-z0-9]+/g)||[];
 const routes=[...new Set(tokens.map(x=>NAV[x]).filter(Boolean))];
 const operators=[...new Set(tokens.map(x=>OPS[x]).filter(Boolean))];
 return {
  schema:'OMEGA_SEMANTIC_PACKET_LANGUAGE_R46',
  tokens,
  route:routes[0]||'Command Center',
  candidateRoutes:routes,
  operators:operators.length?operators:['CARRY','CONSTRUCT','PROVE','LEDGER'],
  chain:['COMMAND_REGISTRY','PRESSURE_PACKET','SCENE_AUTHORITY','IMMUTABLE_STATE_PACKET','DEWEY_TRANSITION_KERNEL','UNIFIED_RENDERER','FRAME_PACKET','EVIDENCE_LEDGER'],
  boundary:'Deterministic packet↔lexicon routing only. It is not universal translation proof, inferred intent authority, or an external language model.'
 };
}

export default function OmegaDataLexiconR46({onNavigate}:{onNavigate?:(p:string)=>void}){
 const[imports,setImports]=useState<Imported[]>(()=>localState.read(STORE,[]));
 const[prompt,setPrompt]=useState('translate this CSV into a visual field then prove and ledger the route');
 const language=useMemo(()=>compile(prompt),[prompt]);
 const route=(p:string)=>{
  if(onNavigate){onNavigate(p);return}
  localState.write('omega.v6.panel',p);
  window.location.reload();
 };
 const ingest=async(file:File)=>{
  const buffer=await file.arrayBuffer();
  const sha256=hex(await crypto.subtle.digest('SHA-256',buffer));
  const n=file.name.toLowerCase();
  const kind:Imported['kind']=n.endsWith('.csv')?'CSV':n.endsWith('.json')?'JSON':n.endsWith('.xlsx')||n.endsWith('.xls')?'XLSX':'OTHER';
  let x:Imported={
   id:sha256.slice(0,16),name:file.name,size:file.size,kind,sha256,
   boundary:'Browser-local SHA-256 intake only; imported data does not become source authority automatically.'
  };
  if(kind==='CSV'){
   const p=parseCsv(new TextDecoder().decode(buffer).slice(0,1_500_000));
   x={...x,rows:Math.max(0,p.length-1),columns:p.reduce((m,r)=>Math.max(m,r.length),0),preview:p.slice(0,8)};
  }else if(kind==='JSON'){
   try{
    const j=JSON.parse(new TextDecoder().decode(buffer));
    x={...x,rows:Array.isArray(j)?j.length:1,keys:j&&typeof j==='object'&&!Array.isArray(j)?Object.keys(j).slice(0,64):[],preview:[[JSON.stringify(j).slice(0,800)]]};
   }catch{
    x={...x,boundary:'SHA-256 identity verified locally; JSON parsing failed, so no semantic admission occurred.'};
   }
  }else if(kind==='XLSX'){
   x={...x,boundary:'Workbook bytes are SHA-256 fingerprinted locally. Formula recalculation, macros and Excel execution remain outside the browser runtime.'};
  }
  const next=[x,...imports.filter(i=>i.sha256!==sha256)].slice(0,24);
  setImports(next);
  localState.write(STORE,next);
 };
 return <section className='r46-data-language'>
  <header><div><span>S16 + S18 · LOCAL DATA / LANGUAGE EXECUTION</span><h3>Data & Semantic Packet Bridge</h3></div><ShieldCheck/></header>
  <div className='r46-two'>
   <section>
    <label className='r46-drop'><Upload/><b>Fingerprint + inspect data</b><span>CSV/JSON preview · XLS/XLSX identity only</span><input type='file' accept='.csv,.json,.xls,.xlsx' onChange={e=>{const f=e.target.files?.[0];if(f)void ingest(f);e.currentTarget.value=''}}/></label>
    <div className='r46-imports'>{imports.map(x=><article key={x.sha256}>{x.kind==='JSON'?<FileJson/>:<FileSpreadsheet/>}<div><b>{x.name}</b><small>{x.kind} · {x.size.toLocaleString()} bytes</small><code>{x.sha256}</code>{x.preview&&<pre>{x.preview.map(r=>r.slice(0,6).join(' | ')).join('\n')}</pre>}<span>{x.boundary}</span></div></article>)}</div>
   </section>
   <section className='r46-lexicon'>
    <label><Search/><textarea value={prompt} onChange={e=>setPrompt(e.target.value)}/></label>
    <article><span>DETERMINISTIC ROUTE</span><h3>{language.route}</h3><div>{language.operators.map(x=><b key={x}>{x}</b>)}</div><button onClick={()=>route(language.route)}><Waypoints/>Open route</button><ol>{language.chain.map(x=><li key={x}>{x}</li>)}</ol><small>{language.boundary}</small></article>
   </section>
  </div>
 </section>;
}
