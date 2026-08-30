import {compilePacketProofR52} from './workerPacketProofR52.js';
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value}
function hex(bytes){return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function sha256(value){const bytes=new TextEncoder().encode(JSON.stringify(canonical(value))),digest=await crypto.subtle.digest('SHA-256',bytes);return hex(digest)}
function same(a,b){return JSON.stringify(canonical(a))===JSON.stringify(canonical(b))}
function pathHead(path){const p=String(path||'').replace(/^\//,'').split('/')[0];return p||'root'}
function walk(before,after,path='',out=[]){if(out.length>=256)return out;if(same(before,after))return out;const bo=before&&typeof before==='object',ao=after&&typeof after==='object';if(bo&&ao&&!Array.isArray(before)&&!Array.isArray(after)){
  const keys=[...new Set([...Object.keys(before),...Object.keys(after)])].sort();
  for(const k of keys){walk(before[k],after[k],`${path}/${k}`,out);if(out.length>=256)break}
  return out;
 }
 out.push({path:path||'/',before:before===undefined?null:before,after:after===undefined?null:after});return out;
}
function validHash(v){return /^[a-f0-9]{64}$/i.test(String(v||''))}
export async function compileDeltaMeshR53(input){
 const body=input&&typeof input==='object'?input:{};
 const raw=JSON.stringify(body);if(raw.length>131072)return{ok:false,status:413,code:'DELTA_INPUT_TOO_LARGE',message:'R53 proof transport is bounded to 128 KiB per comparison.'};
 const currentInput={packet:body.current?.packet??body.packet,projection:body.current?.projection??body.projection};
 const currentProof=await compilePacketProofR52(currentInput);
 if(!currentProof.ok)return{ok:false,status:422,code:'CURRENT_PACKET_INVALID',validation:currentProof.validation};
 const previousPacket=body.previous?.packet??null,previousProjection=body.previous?.projection??null,previousCheckpointHash=body.previousCheckpointHash??null;
 if(previousCheckpointHash!=null&&!validHash(previousCheckpointHash))return{ok:false,status:422,code:'CHECKPOINT_HASH_INVALID',message:'previousCheckpointHash must be a 64-hex SHA-256 value when supplied.'};
 if(!previousPacket){
  const snapshotHash=await sha256({packetHash:currentProof.packetHash,projectionHash:currentProof.projectionHash});
  const checkpointHash=await sha256({previousCheckpointHash:null,snapshotHash,currentPacketHash:currentProof.packetHash});
  return{ok:true,status:200,schema:'OMEGA_DELTA_MESH_R53',mode:'FULL_SNAPSHOT',baseHash:null,currentHash:currentProof.packetHash,snapshotHash,deltaHash:null,checkpointHash,changedComponents:['FULL_SNAPSHOT'],patches:[],truncated:false,proof:{algorithm:'SHA-256',transport:'full snapshot then bounded semantic deltas',authority:'NON_AUTHORITATIVE_DELTA_PROOF_COMPILER',receivedNotObserved:true},boundary:'R53 proves the supplied snapshot/delta relation and checkpoint chain. It does not own canonical state, persist cloud state, infer missing state, certify external observations, or prove native device execution.'};
 }
 const previousProof=await compilePacketProofR52({packet:previousPacket,projection:previousProjection});
 if(!previousProof.ok)return{ok:false,status:422,code:'PREVIOUS_PACKET_INVALID',validation:previousProof.validation};
 const packetPatches=walk(previousPacket,currentInput.packet,'/packet',[]),projectionPatches=walk(previousProjection,currentInput.projection,'/projection',[]),all=[...packetPatches,...projectionPatches].slice(0,256),truncated=packetPatches.length+projectionPatches.length>256;
 const patches=[];for(const p of all)patches.push({...p,beforeHash:await sha256(p.before),afterHash:await sha256(p.after)});
 const changedComponents=[...new Set(patches.map(p=>{const parts=p.path.split('/').filter(Boolean);return parts[0]==='packet'?(parts[1]||'packet'):(parts[0]||'projection')}))].sort();
 const deltaHash=await sha256({baseHash:previousProof.packetHash,currentHash:currentProof.packetHash,previousProjectionHash:previousProof.projectionHash,currentProjectionHash:currentProof.projectionHash,patches});
 const checkpointHash=await sha256({previousCheckpointHash:previousCheckpointHash||null,deltaHash,currentPacketHash:currentProof.packetHash});
 return{ok:true,status:200,schema:'OMEGA_DELTA_MESH_R53',mode:'DELTA',baseHash:previousProof.packetHash,currentHash:currentProof.packetHash,previousProjectionHash:previousProof.projectionHash,currentProjectionHash:currentProof.projectionHash,deltaHash,checkpointHash,changedComponents,patches,truncated,proof:{algorithm:'SHA-256',transport:'bounded semantic change journal + changed-component transport',maxPatches:256,authority:'NON_AUTHORITATIVE_DELTA_PROOF_COMPILER',receivedNotObserved:true},boundary:'R53 proves only the relationship between packets supplied by the canonical runtime. Browser/local persistence remains the journal owner unless a governed durable binding is explicitly added.'};
}
