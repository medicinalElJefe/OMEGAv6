import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const ROOT=path.resolve(process.cwd());
const DATA=path.join(ROOT,'data','implementation-canon-r291.json.gz.b64');
const EXPECTED_ROWS=675;
const EXPECTED_PAYLOAD_SHA256='8eb1d334cf1a1cbb6e7633b0f90e37893e1d95560de2cfe334e6a076cdbeb904';
const STATES=['IMPLEMENTED','PARTIAL','SUPERSEDED','DONOR','PLANNED','REJECTED'];
const ACTIVE_ROOTS=['src','tests','scripts','public','docs','.github/workflows'];
const EXCLUDED_PREFIXES=['.github/workflows-archive/','node_modules/','dist/','.git/','.wrangler/','artifacts/','data/'];
const TEXT_EXT=new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.md','.json','.css','.scss','.wgsl','.glsl','.yml','.yaml','.toml','.ini','.cfg','.txt','.ps1','.bat','.sh','.html']);
const PROOF_PREFIXES=['tests/','.github/workflows/','scripts/'];
const REQUIRED_ROW_FIELDS=['id','type','phase','component','archiveStatus'];
export const R291_IMPLEMENTATION_CLASSIFICATION_SCOPE='SOURCE_AND_PROOF_EVIDENCE_ONLY_NOT_LIVE_EXECUTION_DEVICE_DEPLOYMENT_SCIENCE_OR_CANON_ADMISSION';
export const R291_PUBLIC_SOURCE_PROVENANCE='OPAQUE_ARCHIVE_PROVENANCE_CONNECTED_STORAGE_LOCATOR_OMITTED';

const norm=p=>String(p||'').replaceAll('\\','/').replace(/^\.\//,'');
const exists=p=>fs.existsSync(path.join(ROOT,norm(p)));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const safeRead=p=>{try{return fs.readFileSync(path.join(ROOT,p),'utf8')}catch{return''}};
const excluded=p=>EXCLUDED_PREFIXES.some(x=>p.startsWith(x));
const active=p=>ACTIVE_ROOTS.some(x=>p===x||p.startsWith(x+'/'))&&!excluded(p);
const proofPath=p=>PROOF_PREFIXES.some(x=>p.startsWith(x))&&!p.startsWith('.github/workflows-archive/');

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

function validateDataset(data){
 if(!data||typeof data!=='object'||!Array.isArray(data.rows))throw new Error('R291 canon dataset must contain rows[]');
 if(data.rows.length!==EXPECTED_ROWS)throw new Error(`R291 expected ${EXPECTED_ROWS} canon rows, got ${data.rows.length}`);
 const ids=data.rows.map(r=>String(r?.id||''));
 if(ids.some(id=>!id))throw new Error('R291 canon row missing id');
 if(new Set(ids).size!==ids.length)throw new Error('R291 canon dataset contains duplicate row ids');
 for(const row of data.rows){for(const field of REQUIRED_ROW_FIELDS)if(row?.[field]===undefined||row?.[field]===null||String(row[field]).trim()==='')throw new Error(`R291 ${row.id||'UNKNOWN'} missing required field ${field}`)}
 if(!data.summary||!Number.isFinite(Number(data.summary.locked))||!Number.isFinite(Number(data.summary.planned)))throw new Error('R291 canon dataset summary must provide numeric locked/planned counts');
 return data;
}

function decodePayloadByPinnedIntegrity(encoded){
 const bytes=Buffer.from(encoded,'base64');
 if(!bytes.length)throw new Error('R291 canon payload decoded to zero bytes');
 const attempts=[
  ['GZIP',()=>zlib.gunzipSync(bytes)],
  ['BROTLI',()=>zlib.brotliDecompressSync(bytes)],
  ['ZLIB_DEFLATE',()=>zlib.inflateSync(bytes)],
  ['RAW_DEFLATE',()=>zlib.inflateRawSync(bytes)],
  ['PLAIN_BASE64',()=>bytes]
 ];
 const diagnostics=[];
 for(const [codec,decode] of attempts){
  try{
   const json=decode().toString('utf8');
   const digest=sha(json);
   diagnostics.push(`${codec}:${digest.slice(0,12)}`);
   if(digest===EXPECTED_PAYLOAD_SHA256)return{codec,json};
  }catch(error){diagnostics.push(`${codec}:ERR:${error?.code||error?.name||'DECODE'}`)}
 }
 throw new Error(`R291 canon payload codec/integrity mismatch; no bounded decoder reproduced pinned SHA-256; attempts=${diagnostics.join(',')}`);
}

function loadDataset(){
 const b64=fs.readFileSync(DATA,'utf8').trim();
 if(!/^[A-Za-z0-9+/=]+$/.test(b64))throw new Error('R291 canon payload is not canonical base64 text');
 const decoded=decodePayloadByPinnedIntegrity(b64);
 const data=validateDataset(JSON.parse(decoded.json));
 Object.defineProperty(data,'_payloadCodec',{value:decoded.codec,enumerable:false,writable:false});
 return data;
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
 const data=loadDataset();const files=walk();const index=buildIndex(files);
 const overridePath=path.join(ROOT,'data','implementation-canon-r291-overrides.json');
 const overrides=fs.existsSync(overridePath)?JSON.parse(fs.readFileSync(overridePath,'utf8')):{};
 const rows=data.rows.map(r=>classify(r,index,overrides));
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
  source:{file:data.sourceFile||'IMPLEMENTATION_CANON_ARCHIVE_DATASET',provenanceKey:'ARCHIVE-IMPLEMENTATION-CANON-R291',publicProvenance:R291_PUBLIC_SOURCE_PROVENANCE,modified:data.sourceModified||null,payloadSha256:EXPECTED_PAYLOAD_SHA256,payloadCodec:data._payloadCodec,rows:rows.length,archiveLocked:Number(data.summary.locked),archivePlanned:Number(data.summary.planned)},
  classification:{scope:R291_IMPLEMENTATION_CLASSIFICATION_SCOPE,implementedMeaning:'CURRENT SOURCE PLUS CURRENT PROOF SIGNAL IN REPOSITORY; NOT A LIVE EXECUTION CLAIM',supersededMeaning:'CURRENT SUCCESSOR SOURCE PLUS PROOF SIGNAL AT ANOTHER PATH',method:'BOUNDED_PATH_AND_TEXT_RECONCILIATION_REQUIRING_EXACT_HEAD_CI'},
  truthBoundary:'Archive PLANNED/LOCKED status is specification evidence only. IMPLEMENTED is repository source+proof classification, not live runtime/device/deployment/scientific/Canon proof. Live truth remains owned by the existing runtime, device, deployment and Canon admission authorities.',
  counts,byType,byPhase,evidencedCoverage,rows
 };
 return result;
}

if(import.meta.url===`file://${process.argv[1]}`){
 const result=reconcileImplementationCanonR291();
 const arg=process.argv.find(x=>x.startsWith('--out='));
 if(arg){const out=path.resolve(arg.slice(6));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2));console.log(`R291 CANON RECONCILIATION PASS · ${result.source.rows} rows · codec=${result.source.payloadCodec} · source/proof coverage=${(result.evidencedCoverage*100).toFixed(2)}% · ${JSON.stringify(result.counts)} · ${out}`)}
 else console.log(JSON.stringify({schema:result.schema,source:result.source,classification:result.classification,counts:result.counts,evidencedCoverage:result.evidencedCoverage},null,2));
}
