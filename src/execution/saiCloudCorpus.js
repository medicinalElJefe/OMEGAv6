import {inspectionSHA} from './saiHostInspectionR209.js';
import {validateDatasetR995} from '../saiRelationalLearningR992.mjs';
const HEX=/^[a-f0-9]{64}$/;
const ROOT='https://omega-assets.internal/omega-sai-source/';
const validAddress=x=>Number.isSafeInteger(x)&&x>=0&&x<20736;
const featureNames=['continuity','plasticity','contradiction','burden','evidence','geometry','rsc','motion'];
const metricsKeys=['continuity','plasticity','contradiction','burden','scar','evidence','rsc','geometry','stability'];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
function validateRow(row,address){
 if(!row||row.address!==address||row.stateId!==address+1||!Array.isArray(row.coordinates)||row.coordinates.length!==4||row.coordinates.some(x=>!Number.isInteger(x)||x<0||x>11)||row.coordinates.reduce((a,b)=>a*12+b,0)!==address||!row.metrics||!metricsKeys.every(k=>finite(row.metrics[k]))||!['STAY','TURN','ESCALATE'].includes(row.metrics.decision)||typeof row.metrics.mode188!=='string'||!row.autoPing||!['dataNext','previous','hourglassMirror','mode188Plus'].every(k=>validAddress(row.autoPing[k]))||!finite(row.motion)||!Array.isArray(row.modes)||row.modes.length!==20||new Set(row.modes.map(x=>x[0])).size!==20||row.modes.some(x=>!Array.isArray(x)||x.length!==4||!/^M0(?:0[1-9]|1[0-9]|20)$/.test(x[0])||!['EXECUTED_EXACT','SOURCE_PACKET','DERIVED_RUNTIME','GATED_MISSING_INPUTS'].includes(x[1])||!(x[2]===null||finite(x[2])||typeof x[2]==='string')||!Array.isArray(x[3])||x[3].some(v=>typeof v!=='string')))throw Error('SAI_SOURCE_ROW_INVALID');
 return row;
}
async function shaBytes(bytes){const d=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function readAsset(assets,file,max){
 if(!assets?.fetch||!(/^(manifest|region-\d{3})\.json$/).test(file))throw Error('SAI_SOURCE_ASSETS_UNAVAILABLE');
 const r=await assets.fetch(new Request(ROOT+file,{method:'GET',redirect:'error'}));
 if(!r.ok||!r.body)throw Error('SAI_SOURCE_ASSET_UNAVAILABLE');
 const declared=Number(r.headers.get('content-length'));if(declared>max)throw Error('SAI_SOURCE_ASSET_TOO_LARGE');
 const reader=r.body.getReader(),chunks=[];let length=0;
 try{for(;;){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;if(length>max){await reader.cancel();throw Error('SAI_SOURCE_ASSET_TOO_LARGE')}chunks.push(part.value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));return{value,bytes:length,sha256:await shaBytes(bytes)};
}
async function sourceReader(assets){
 const loaded=await readAsset(assets,'manifest.json',262144),m=loaded.value;
 if(m?.schema!=='OMEGA_SAI_PROJECTED_SOURCE_V1'||m.stateCount!==20736||m.regionCount!==144||m.lanesPerRegion!==144||m.catalogCount!==179||!Array.isArray(m.modeContracts)||m.modeContracts.length!==20||!Array.isArray(m.regions)||m.regions.length!==144||m.regions.some((r,i)=>r.region!==i||r.file!=='region-'+String(i).padStart(3,'0')+'.json'||!HEX.test(r.sha256)||!Number.isSafeInteger(r.bytes)||r.bytes<1||r.bytes>524288)||!m.sources||!finite(m.coreR2Min)||!finite(m.medianR2)||typeof m.boundary!=='string')throw Error('SAI_SOURCE_MANIFEST_INVALID');
 const cached=new Map();
 const region=async i=>{
  if(!Number.isInteger(i)||i<0||i>=144)throw Error('SAI_SOURCE_REGION_INVALID');
  if(!cached.has(i)){const expected=m.regions[i],part=await readAsset(assets,expected.file,524288),v=part.value;
   if(part.sha256!==expected.sha256||part.bytes!==expected.bytes||v?.schema!=='OMEGA_SAI_PROJECTED_REGION_V1'||v.region!==i||!Array.isArray(v.rows)||v.rows.length!==144)throw Error('SAI_SOURCE_REGION_DIGEST_MISMATCH');
   v.rows.forEach((row,j)=>validateRow(row,i*144+j));cached.set(i,v.rows);
  }
  return cached.get(i);
 };
 const row=async address=>{if(!validAddress(address))throw Error('SAI_SOURCE_ADDRESS_INVALID');return(await region(Math.floor(address/144)))[address%144]};
 return {manifest:m,manifestSha256:loaded.sha256,region,row};
}
function safeQuery(query){if(typeof query!=='string'||!query.trim()||query.trim().length>1200)throw Error('SAI_QUERY_BOUND');return query.trim()}
export async function compileSaiCloudSource(assets,request){
 if(!request||!validAddress(request.address)||!['SYNTHESIS','TRAIN_REGIONAL'].includes(request.kind))throw Error('SAI_SOURCE_REQUEST_INVALID');
 const source=await sourceReader(assets),center=await source.row(request.address),m=source.manifest,region=Math.floor(request.address/144);
 const base={schema:'OMEGA_SAI_SERVER_SOURCE_V1',address:request.address,stateId:center.stateId,manifestSha256:source.manifestSha256,sourceKind:'RELEASE_PACKAGED_SOURCE_DERIVED_PROJECTION',catalogCount:179,coreR2Min:m.coreR2Min,medianR2:m.medianR2,canonicalMutation:false,empirical:false};
 if(request.kind==='TRAIN_REGIONAL'){
  if(request.epochs!==24)throw Error('SAI_TRAINING_BUDGET_REFUSED');
  const rows=await source.region(region);
  const dataset=validateDatasetR995({schema:'OMEGA_SAI_USER_DATASET_R995',source:'SOURCE_PROJECTED_SCAR_REGION_'+region+'_'+m.regions[region].sha256,rows:rows.map(r=>({address:r.address,features:featureNames.map(k=>k==='motion'?r.motion:r.metrics[k]),target:r.metrics.scar}))});
  const packet={...base,kind:'TRAIN_REGIONAL',region,regionSha256:m.regions[region].sha256,epochs:24,featureNames,target:'scar',dataset,evidenceClass:'SOURCE_PROJECTION_SUPERVISED_REGRESSION_NOT_EMPIRICAL'};
  return {...packet,packetSha256:await inspectionSHA(packet)};
 }
 const query=safeQuery(request.query),witnesses=[];
 const relations=[['NEXT',center.autoPing.dataNext],['PREVIOUS',center.autoPing.previous],['MIRROR',center.autoPing.hourglassMirror],['MODE188',center.autoPing.mode188Plus]];
 for(const [relation,address] of relations){const r=await source.row(address);witnesses.push({relation,address,stateId:r.stateId,coordinates:r.coordinates,metrics:r.metrics,regionSha256:m.regions[Math.floor(address/144)].sha256})}
 const packet={...base,kind:'SYNTHESIS',query,center,regionSha256:m.regions[region].sha256,witnesses,modeContracts:m.modeContracts,boundary:m.boundary};
 const packetSha256=await inspectionSHA(packet);
 const prompt=JSON.stringify({task:query,sourcePacket:{...packet,packetSha256},limitations:['Numeric channels are retained fitted source projections; formula evaluation is exact only over those inputs. Original donor documents are not retrieved.','Preserve evidence boundaries, disagreements and missing inputs. Model output cannot authorize native or canonical changes.']});
 if(prompt.length>12000)throw Error('SAI_SOURCE_PROMPT_TOO_LARGE');
 return {...packet,packetSha256,prompt};
}
export async function validateSaiCloudPacket(packet){
 if(!packet||packet.schema!=='OMEGA_SAI_SERVER_SOURCE_V1'||!HEX.test(packet.packetSha256)||!HEX.test(packet.manifestSha256)||packet.canonicalMutation!==false||packet.empirical!==false)return false;
 const {packetSha256,prompt,...body}=packet;
 return await inspectionSHA(body)===packetSha256;
}
