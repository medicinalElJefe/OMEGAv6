import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=path.resolve(process.cwd());
const MANIFEST=path.join(ROOT,'data','implementation-canon-r291.manifest.json');
const EXPECTED_ROWS=675;
const EXPECTED_CHUNKS=10;
const EXPECTED_MANIFEST_SHA256='9f05f12b66ea618b13b9f9275b28dc183c91c7ba44747b969583f568a54639b2';
const EXPECTED_LOGICAL_ROWS_SHA256='af271c6c32420eb0e30c4315faebfcfbe01b32e1df527554ea6bea04818accfc';
const EXPECTED_SOURCE_WORKBOOK_SHA256='fdda75804ffb67136e6c547f5549bf2b2a26fd2e30ddfd86cd38dfc28f556e4e';
const EXPECTED_TYPES={API_ROUTE:22,BUILD_GATE:25,CONFIG_KEY:26,DATABASE_TABLE:12,EVENT:22,HARD_INVARIANT:12,MODULE:94,SHADER_BINDING:31,SYMBOL:408,TEST:23};
const EXPECTED_ARCHIVE_STATUS={LOCKED:12,PLANNED:663};
const STATES=['IMPLEMENTED','PARTIAL','SUPERSEDED','DONOR','PLANNED','REJECTED'];
const ACTIVE_ROOTS=['src','tests','scripts','public','docs','.github/workflows'];
const EXCLUDED_PREFIXES=['.github/workflows-archive/','node_modules/','dist/','.git/','.wrangler/','artifacts/','data/'];
const TEXT_EXT=new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.md','.json','.css','.scss','.wgsl','.glsl','.yml','.yaml','.toml','.ini','.cfg','.txt','.ps1','.bat','.sh','.html']);
const PROOF_PREFIXES=['tests/','.github/workflows/','scripts/'];
const REQUIRED_ROW_FIELDS=['id','type','phase','component','artifact','symbol','purpose','archiveStatus','priority','sequence'];
export const R291_IMPLEMENTATION_CLASSIFICATION_SCOPE='SOURCE_AND_PROOF_EVIDENCE_ONLY_NOT_LIVE_EXECUTION_DEVICE_DEPLOYMENT_SCIENCE_OR_CANON_ADMISSION';
export const R291_PUBLIC_SOURCE_PROVENANCE='OPAQUE_ARCHIVE_PROVENANCE_CONNECTED_STORAGE_LOCATOR_OMITTED';
export const R291_SOURCE_SNAPSHOT_ENCODING='UTF-8_JSON_CHUNKS';

const norm=p=>String(p||'').replaceAll('\\','/').replace(/^\.\//,'');
const exists=p=>fs.existsSync(path.join(ROOT,norm(p)));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const safeRead=p=>{try{return fs.readFileSync(path.join(ROOT,p),'utf8')}catch{return''}};
const excluded=p=>EXCLUDED_PREFIXES.some(x=>p.startsWith(x));
const active=p=>ACTIVE_ROOTS.some(x=>p===x||p.startsWith(x+'/'))&&!excluded(p);
const proofPath=p=>PROOF_PREFIXES.some(x=>p.startsWith(x))&&!p.startsWith('.github/workflows-archive/');
const sortedObject=o=>Object.fromEntries(Object.entries(o||{}).sort(([a],[b])=>a.localeCompare(b)));
const sameObject=(a,b)=>JSON.stringify(sortedObject(a))===JSON.stringify(sortedObject(b));
const countsBy=(rows,key)=>rows.reduce((acc,row)=>{const value=String(row?.[key]??'');acc[value]=(acc[value]||0)+1;return acc},{});

function walk(dir=''){
 const abs=path.join(ROOT,dir);if(!fs.existsSync(abs))return[];
 const out=[];
 for(const ent of fs.readdirSync(abs,{withFileTypes:true})){
  const rel=norm(path.join(dir,ent.name));
  if(excluded(rel+(ent.isDirectory()?'/':'')))continue;
  if(ent.isDirectory())out.push(...walk(rel));
  else if(active(rel)&&TEXT_EXT.has(path.extname(rel).toLowerCase()))out.push(rel);
 }
 return out;
}

function validateManifest(manifest){
 if(manifest?.schema!=='OMEGA_IMPLEMENTATION_CANON_SOURCE_MANIFEST_R291')throw new Error(`R291 canon manifest schema drift ${manifest?.schema||'NONE'}`);
 if(manifest.publicProvenanceKey!=='ARCHIVE-IMPLEMENTATION-CANON-R291')throw new Error('R291 canon manifest public provenance drift');
 if(manifest.source?.file!=='OMEGA_20736D_IMPLEMENTATION_CANON_INDEX.xlsx'||manifest.source?.workbookSha256!==EXPECTED_SOURCE_WORKBOOK_SHA256)throw new Error('R291 canon authoritative workbook identity drift');
 if(manifest.source?.sheet!=='Implementation_Index'||manifest.source?.range!=='A1:J676')throw new Error('R291 canon authoritative workbook sheet/range drift');
 if(manifest.source?.rowsIncludingHeader!==676||manifest.source?.dataRows!==EXPECTED_ROWS)throw new Error('R291 canon authoritative workbook row-count drift');
 if(manifest.source?.storageLocator!=='OMITTED_FROM_PUBLIC_REPOSITORY')throw new Error('R291 canon public source locator boundary drift');
 if(manifest.snapshot?.encoding!==R291_SOURCE_SNAPSHOT_ENCODING||manifest.snapshot?.logicalRowsSha256!==EXPECTED_LOGICAL_ROWS_SHA256||manifest.snapshot?.rows!==EXPECTED_ROWS)throw new Error('R291 canon source-derived snapshot identity drift');
 if(!Array.isArray(manifest.snapshot?.chunks)||manifest.snapshot.chunks.length!==EXPECTED_CHUNKS)throw new Error(`R291 canon expected ${EXPECTED_CHUNKS} source chunks`);
 if(!sameObject(manifest.conservation?.typeCounts,EXPECTED_TYPES)||!sameObject(manifest.conservation?.statusCounts,EXPECTED_ARCHIVE_STATUS))throw new Error('R291 canon manifest conservation drift');
 const chunkRows=manifest.snapshot.chunks.reduce((n,c)=>n+Number(c?.rows||0),0);
 if(chunkRows!==EXPECTED_ROWS)throw new Error(`R291 canon chunk row conservation drift ${chunkRows}`);
 const paths=manifest.snapshot.chunks.map(c=>String(c?.path||''));
 if(paths.some(p=>!/^data\/implementation-canon-r291\/chunk-\d{3}\.json$/.test(p))||new Set(paths).size!==paths.length)throw new Error('R291 canon chunk path identity drift');
 return manifest;
}

function loadSourceSnapshot(){
 const manifestText=fs.readFileSync(MANIFEST,'utf8');
 if(sha(manifestText)!==EXPECTED_MANIFEST_SHA256)throw new Error('R291 canon source manifest SHA-256 mismatch');
 const manifest=validateManifest(JSON.parse(manifestText));
 const rows=[];
 manifest.snapshot.chunks.forEach((entry,index)=>{
  const text=fs.readFileSync(path.join(ROOT,entry.path),'utf8');
  if(sha(text)!==entry.sha256)throw new Error(`R291 canon chunk ${index+1} SHA-256 mismatch`);
  const chunk=JSON.parse(text);
  if(chunk?.schema!=='OMEGA_IMPLEMENTATION_CANON_SOURCE_CHUNK_R291'||chunk?.chunk!==index+1||!Array.isArray(chunk?.rows))throw new Error(`R291 canon chunk ${index+1} schema/index drift`);
  if(chunk.rows.length!==entry.rows)throw new Error(`R291 canon chunk ${index+1} row-count drift`);
  if(chunk.rows[0]?.id!==entry.firstId||chunk.rows.at(-1)?.id!==entry.lastId)throw new Error(`R291 canon chunk ${index+1} boundary ID drift`);
  rows.push(...chunk.rows);
 });
 if(rows.length!==EXPECTED_ROWS)throw new Error(`R291 canon expected ${EXPECTED_ROWS} rows, got ${rows.length}`);
 if(sha(JSON.stringify(rows))!==EXPECTED_LOGICAL_ROWS_SHA256)throw new Error('R291 canon logical row SHA-256 mismatch');
 return{manifest,rows};
}

function validateRows(rows){
 const ids=rows.map(r=>String(r?.id||''));
 if(ids.some(id=>!id))throw new Error('R291 canon row missing id');
 if(new Set(ids).size!==ids.length)throw new Error('R291 canon snapshot contains duplicate row ids');
 for(let i=0;i<rows.length;i++){
  const row=rows[i],expected=`CANON-${String(i+1).padStart(6,'0')}`;
  if(row.id!==expected)throw new Error(`R291 canon row identity/order drift at ${i+1}: expected ${expected}, got ${row.id||'NONE'}`);
  for(const field of REQUIRED_ROW_FIELDS)if(row?.[field]===undefined||row?.[field]===null||String(row[field]).trim()==='')throw new Error(`R291 ${row.id||'UNKNOWN'} missing required field ${field}`);
 }
 const typeCounts=countsBy(rows,'type'),statusCounts=countsBy(rows,'archiveStatus');
 if(!sameObject(typeCounts,EXPECTED_TYPES))throw new Error(`R291 canon type conservation drift ${JSON.stringify(typeCounts)}`);
 if(!sameObject(statusCounts,EXPECTED_ARCHIVE_STATUS))throw new Error(`R291 canon archive-status conservation drift ${JSON.stringify(statusCounts)}`);
 return rows;
}

function buildIndex(files){
 const content=new Map();const basename=new Map();
 for(const p of files){const txt=safeRead(p);content.set(p,txt);const base=path.basename(p).toLowerCase();if(!basename.has(base))basename.set(base,[]);basename.get(base).push(p)}
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
 for(const [p,txt] of index.content){if(!filter(p))continue;if(txt.includes(t)||txt.toLowerCase().includes(fold))exact.push(p);if(exact.length>=max)break}
 return exact;
}

function claimsForClassification(){return{liveRuntimeProof:false,deviceProof:false,deploymentProof:false,empiricalScientificProof:false,canonAdmission:false,classificationScope:R291_IMPLEMENTATION_CLASSIFICATION_SCOPE}}
function hasExternalAuthorityClaim(claims){return claims.liveRuntimeProof!==false||claims.deviceProof!==false||claims.deploymentProof!==false||claims.empiricalScientificProof!==false||claims.canonAdmission!==false}

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
 const sourceEvidence=sourceHits.length>0;const proofEvidence=proofHits.length>0;
 let state='PLANNED',reason='NO_CURRENT_SOURCE_EVIDENCE';
 const override=overrides[row.id];
 if(override){if(!STATES.includes(override.state))throw new Error(`invalid override state ${override.state} for ${row.id}`);state=override.state;reason=`MANUAL_OVERRIDE:${override.reason||'UNSPECIFIED'}`}
 else if(artifactExists&&(symbolInArtifact||!symbol)&&proofEvidence){state='IMPLEMENTED';reason='EXACT_CURRENT_ARTIFACT_PLUS_PROOF'}
 else if(artifactExists&&(symbolInArtifact||!symbol)){state='PARTIAL';reason='EXACT_CURRENT_ARTIFACT_WITHOUT_CURRENT_PROOF'}
 else if(!artifactExists&&sourceEvidence&&proofEvidence){state='SUPERSEDED';reason='CURRENT_SUCCESSOR_SOURCE_AND_PROOF_AT_DIFFERENT_PATH'}
 else if(sourceEvidence){state='PARTIAL';reason='CURRENT_SOURCE_SIGNAL_WITHOUT_SUFFICIENT_PROOF'}
 else if(row.archiveStatus==='LOCKED'){state='PLANNED';reason='ARCHIVE_LOCKED_REQUIREMENT_WITHOUT_CURRENT_IMPLEMENTATION_PROOF'}
 return{...row,currentState:state,currentReason:reason,evidence:{method:'BOUNDED_CURRENT_SOURCE_TEXT_AND_PATH_RECONCILIATION',artifactExists,symbolInArtifact,sourceEvidence,proofEvidence,sourceHits,proofHits,basenameHits:baseHits.slice(0,4)},claims:claimsForClassification()};
}

export function reconcileImplementationCanonR291(){
 const {manifest,rows:sourceRows}=loadSourceSnapshot();const rows0=validateRows(sourceRows);
 const files=walk();const index=buildIndex(files);
 const overridePath=path.join(ROOT,'data','implementation-canon-r291-overrides.json');
 const overrides=fs.existsSync(overridePath)?JSON.parse(fs.readFileSync(overridePath,'utf8')):{};
 const rows=rows0.map(r=>classify(r,index,overrides));
 for(const r of rows){
  if(!STATES.includes(r.currentState))throw new Error(`unknown state ${r.currentState}`);
  if(r.currentState==='IMPLEMENTED'&&(!r.evidence.sourceEvidence||!r.evidence.proofEvidence))throw new Error(`${r.id} IMPLEMENTED without source+proof`);
  if(r.currentState==='SUPERSEDED'&&(!r.evidence.sourceEvidence||!r.evidence.proofEvidence))throw new Error(`${r.id} SUPERSEDED without successor source+proof`);
  if(hasExternalAuthorityClaim(r.claims))throw new Error(`${r.id} classification illegally asserted external authority`);
 }
 const counts=Object.fromEntries(STATES.map(s=>[s,rows.filter(r=>r.currentState===s).length]));
 const byType=Object.fromEntries([...new Set(rows.map(r=>r.type))].sort().map(t=>[t,Object.fromEntries(STATES.map(s=>[s,rows.filter(r=>r.type===t&&r.currentState===s).length]))]));
 const byPhase=Object.fromEntries([...new Set(rows.map(r=>r.phase))].sort().map(t=>[t,Object.fromEntries(STATES.map(s=>[s,rows.filter(r=>r.phase===t&&r.currentState===s).length]))]));
 const implemented=counts.IMPLEMENTED||0,superseded=counts.SUPERSEDED||0;
 const evidencedCoverage=Number(((implemented+superseded)/rows.length).toFixed(6));
 const result={
  schema:'OMEGA_IMPLEMENTATION_CANON_RECONCILIATION_R291',generatedAt:new Date().toISOString(),
  source:{file:manifest.source.file,provenanceKey:manifest.publicProvenanceKey,publicProvenance:R291_PUBLIC_SOURCE_PROVENANCE,modified:manifest.source.modified,sourceWorkbookSha256:EXPECTED_SOURCE_WORKBOOK_SHA256,manifestSha256:EXPECTED_MANIFEST_SHA256,logicalRowsSha256:EXPECTED_LOGICAL_ROWS_SHA256,encoding:R291_SOURCE_SNAPSHOT_ENCODING,chunks:EXPECTED_CHUNKS,rows:rows.length,archiveLocked:EXPECTED_ARCHIVE_STATUS.LOCKED,archivePlanned:EXPECTED_ARCHIVE_STATUS.PLANNED,sourceSheet:manifest.source.sheet,sourceRange:manifest.source.range},
  classification:{scope:R291_IMPLEMENTATION_CLASSIFICATION_SCOPE,implementedMeaning:'CURRENT SOURCE PLUS CURRENT PROOF SIGNAL IN REPOSITORY; NOT A LIVE EXECUTION CLAIM',supersededMeaning:'CURRENT SUCCESSOR SOURCE PLUS PROOF SIGNAL AT ANOTHER PATH',method:'BOUNDED_PATH_AND_TEXT_RECONCILIATION_REQUIRING_EXACT_HEAD_CI'},
  truthBoundary:'Archive PLANNED/LOCKED status is specification evidence only. IMPLEMENTED is repository source+proof classification, not live runtime/device/deployment/scientific/Canon proof. Live truth remains owned by the existing runtime, device, deployment and Canon admission authorities.',
  counts,byType,byPhase,evidencedCoverage,rows
 };
 return result;
}

if(import.meta.url===`file://${process.argv[1]}`){
 const result=reconcileImplementationCanonR291();
 const arg=process.argv.find(x=>x.startsWith('--out='));
 if(arg){const out=path.resolve(arg.slice(6));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2));console.log(`R291 CANON RECONCILIATION PASS · ${result.source.rows} rows · ${result.source.chunks} source-derived chunks · source=${result.source.sourceSheet}!${result.source.sourceRange} · logical=${result.source.logicalRowsSha256.slice(0,12)} · source/proof coverage=${(result.evidencedCoverage*100).toFixed(2)}% · ${JSON.stringify(result.counts)} · ${out}`)}
 else console.log(JSON.stringify({schema:result.schema,source:result.source,classification:result.classification,counts:result.counts,evidencedCoverage:result.evidencedCoverage},null,2));
}
