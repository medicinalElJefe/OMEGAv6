import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const ROOT=path.resolve(process.cwd());
const DATA=path.join(ROOT,'data','implementation-canon-r291.json.gz.b64');
const EXPECTED_ROWS=675;
const EXPECTED_PAYLOAD_SHA256='d39ca1793694678516f6b5669ac60a651bcd68892164bb54082db9cfc0c26748';
const STATES=['IMPLEMENTED','PARTIAL','SUPERSEDED','DONOR','PLANNED','REJECTED'];
const ACTIVE_ROOTS=['src','tests','scripts','public','docs','.github/workflows'];
const EXCLUDED_PREFIXES=['.github/workflows-archive/','node_modules/','dist/','.git/','.wrangler/','artifacts/','data/'];
const TEXT_EXT=new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.md','.json','.css','.scss','.wgsl','.glsl','.yml','.yaml','.toml','.ini','.cfg','.txt','.ps1','.bat','.sh','.html']);
const PROOF_PREFIXES=['tests/','.github/workflows/','scripts/'];

const norm=p=>String(p||'').replaceAll('\\','/').replace(/^\.\//,'');
const exists=p=>fs.existsSync(path.join(ROOT,norm(p)));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const safeRead=p=>{try{return fs.readFileSync(path.join(ROOT,p),'utf8')}catch{return''}};
const excluded=p=>EXCLUDED_PREFIXES.some(x=>p.startsWith(x));
const active=p=>ACTIVE_ROOTS.some(x=>p===x||p.startsWith(x+'/'))&&!excluded(p);
const proofPath=p=>PROOF_PREFIXES.some(x=>p.startsWith(x))&&!p.startsWith('.github/workflows-archive/');

function walk(dir=''){
 const abs=path.join(ROOT,dir); if(!fs.existsSync(abs))return[];
 const out=[];
 for(const ent of fs.readdirSync(abs,{withFileTypes:true})){
  const rel=norm(path.join(dir,ent.name));
  if(excluded(rel+(ent.isDirectory()?'/':'')))continue;
  if(ent.isDirectory())out.push(...walk(rel));
  else if(active(rel)&&TEXT_EXT.has(path.extname(rel).toLowerCase()))out.push(rel);
 }
 return out;
}

function loadDataset(){
 const b64=fs.readFileSync(DATA,'utf8').trim();
 const json=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');
 if(sha(json)!==EXPECTED_PAYLOAD_SHA256)throw new Error('R291 canon dataset SHA-256 mismatch');
 const data=JSON.parse(json);
 if(data?.rows?.length!==EXPECTED_ROWS)throw new Error(`R291 expected ${EXPECTED_ROWS} canon rows, got ${data?.rows?.length}`);
 return data;
}

function buildIndex(files){
 const content=new Map();
 const basename=new Map();
 for(const p of files){
  const txt=safeRead(p);content.set(p,txt);
  const base=path.basename(p).toLowerCase();if(!basename.has(base))basename.set(base,[]);basename.get(base).push(p);
 }
 return{files,content,basename};
}

function meaningfulToken(value){
 const s=String(value||'').trim();
 if(s.length<4)return'';
 if(['true','false','none','null','pass','test','build','event','route'].includes(s.toLowerCase()))return'';
 return s;
}

function hitsFor(token,index,filter=()=>true,max=4){
 const t=meaningfulToken(token);if(!t)return[];
 const exact=[];const fold=t.toLowerCase();
 for(const [p,txt] of index.content){if(!filter(p))continue;if(txt.includes(t)||txt.toLowerCase().includes(fold))exact.push(p);if(exact.length>=max)break;}
 return exact;
}

function classify(row,index,overrides){
 const artifact=norm(row.artifact),symbol=meaningfulToken(row.symbol),component=meaningfulToken(row.component);
 const artifactExists=artifact&&exists(artifact)&&active(artifact);
 const artifactText=artifactExists?safeRead(artifact):'';
 const symbolInArtifact=!!(artifactExists&&symbol&&(artifactText.includes(symbol)||artifactText.toLowerCase().includes(symbol.toLowerCase())));
 const baseHits=artifact?index.basename.get(path.basename(artifact).toLowerCase())||[]:[];
 const symbolHits=hitsFor(symbol,index,p=>!proofPath(p));
 const componentHits=hitsFor(component,index,p=>!proofPath(p),3);
 const proofNeedle=symbol||component||path.basename(artifact||'');
 const proofHits=hitsFor(proofNeedle,index,proofPath,5);
 const sourceHits=[...new Set([...(artifactExists?[artifact]:[]),...symbolHits,...componentHits,...baseHits.filter(active)])].slice(0,8);
 const sourceEvidence=sourceHits.length>0;
 const proofEvidence=proofHits.length>0;
 let state='PLANNED',reason='NO_CURRENT_SOURCE_EVIDENCE';
 const override=overrides[row.id];
 if(override){
  if(!STATES.includes(override.state))throw new Error(`invalid override state ${override.state} for ${row.id}`);
  state=override.state;reason=`MANUAL_OVERRIDE:${override.reason||'UNSPECIFIED'}`;
 }else if(artifactExists&&(symbolInArtifact||!symbol)&&proofEvidence){state='IMPLEMENTED';reason='EXACT_CURRENT_ARTIFACT_PLUS_PROOF';}
 else if(artifactExists&&(symbolInArtifact||!symbol)){state='PARTIAL';reason='EXACT_CURRENT_ARTIFACT_WITHOUT_CURRENT_PROOF';}
 else if(!artifactExists&&sourceEvidence&&proofEvidence){state='SUPERSEDED';reason='CURRENT_SUCCESSOR_SOURCE_AND_PROOF_AT_DIFFERENT_PATH';}
 else if(sourceEvidence){state='PARTIAL';reason='CURRENT_SOURCE_SIGNAL_WITHOUT_SUFFICIENT_PROOF';}
 else if(row.archiveStatus==='LOCKED'){state='PLANNED';reason='ARCHIVE_LOCKED_REQUIREMENT_WITHOUT_CURRENT_IMPLEMENTATION_PROOF';}
 return{...row,currentState:state,currentReason:reason,evidence:{artifactExists,symbolInArtifact,sourceEvidence,proofEvidence,sourceHits,proofHits,basenameHits:baseHits.slice(0,4)}};
}

export function reconcileImplementationCanonR291(){
 const data=loadDataset();
 const files=walk();
 const index=buildIndex(files);
 const overridePath=path.join(ROOT,'data','implementation-canon-r291-overrides.json');
 const overrides=fs.existsSync(overridePath)?JSON.parse(fs.readFileSync(overridePath,'utf8')):{};
 const rows=data.rows.map(r=>classify(r,index,overrides));
 for(const r of rows){
  if(!STATES.includes(r.currentState))throw new Error(`unknown state ${r.currentState}`);
  if(r.currentState==='IMPLEMENTED'&&(!r.evidence.sourceEvidence||!r.evidence.proofEvidence))throw new Error(`${r.id} IMPLEMENTED without source+proof`);
 }
 const counts=Object.fromEntries(STATES.map(s=>[s,rows.filter(r=>r.currentState===s).length]));
 const byType=Object.fromEntries([...new Set(rows.map(r=>r.type))].sort().map(t=>[t,Object.fromEntries(STATES.map(s=>[s,rows.filter(r=>r.type===t&&r.currentState===s).length]))]));
 const byPhase=Object.fromEntries([...new Set(rows.map(r=>r.phase))].sort().map(t=>[t,Object.fromEntries(STATES.map(s=>[s,rows.filter(r=>r.phase===t&&r.currentState===s).length]))]));
 const implemented=counts.IMPLEMENTED||0, superseded=counts.SUPERSEDED||0;
 const evidencedCoverage=Number(((implemented+superseded)/rows.length).toFixed(6));
 const result={schema:'OMEGA_IMPLEMENTATION_CANON_RECONCILIATION_R291',generatedAt:new Date().toISOString(),source:{file:data.sourceFile,driveId:data.driveId,modified:data.sourceModified,payloadSha256:EXPECTED_PAYLOAD_SHA256,rows:rows.length,archiveLocked:data.summary.locked,archivePlanned:data.summary.planned},truthBoundary:'Archive PLANNED/LOCKED status is specification evidence only. IMPLEMENTED requires current exact artifact plus current proof. SUPERSEDED requires current successor source plus current proof at another path.',counts,byType,byPhase,evidencedCoverage,rows};
 return result;
}

if(import.meta.url===`file://${process.argv[1]}`){
 const result=reconcileImplementationCanonR291();
 const arg=process.argv.find(x=>x.startsWith('--out='));
 if(arg){const out=path.resolve(arg.slice(6));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2));console.log(`R291 CANON RECONCILIATION PASS · ${result.source.rows} rows · coverage=${(result.evidencedCoverage*100).toFixed(2)}% · ${JSON.stringify(result.counts)} · ${out}`)}
 else console.log(JSON.stringify({schema:result.schema,source:result.source,counts:result.counts,evidencedCoverage:result.evidencedCoverage},null,2));
}
