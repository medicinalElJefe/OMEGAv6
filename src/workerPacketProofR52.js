function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value}
function finite(v){return Number.isFinite(Number(v))}
function hex(bytes){return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function sha256(value){const bytes=new TextEncoder().encode(JSON.stringify(canonical(value))),digest=await crypto.subtle.digest('SHA-256',bytes);return hex(digest)}
const METRICS=['continuity','plasticity','contradiction','burden'];
export async function compilePacketProofR52(input){
 const packet=input&&typeof input==='object'?input.packet:null;
 if(!packet||typeof packet!=='object')return{ok:false,status:400,code:'PACKET_REQUIRED',message:'A canonical packet must be supplied for proof compilation.'};
 const address=Number(packet.address),stateId=Number(packet.stateId),metrics=packet.metrics||{},errors=[];
 if(!Number.isInteger(address)||address<0||address>=20736)errors.push('address must be an integer in [0,20735]');
 if(!Number.isInteger(stateId)||stateId!==address+1)errors.push('stateId must equal address + 1');
 for(const k of METRICS)if(!finite(metrics[k]))errors.push(`metrics.${k} must be finite`);
 if(packet.metrics?.decision!=null&&!['STAY','TURN','ESCALATE'].includes(String(packet.metrics.decision)))errors.push('metrics.decision must be STAY, TURN or ESCALATE when supplied');
 const core={address,stateId,identity:packet.identity??null,metrics:packet.metrics??null,psc:packet.psc??null,predict:packet.predict??null,autoPing:packet.autoPing??null};
 const packetHash=await sha256(core),projection=input.projection&&typeof input.projection==='object'?input.projection:null,projectionHash=projection?await sha256({packetHash,projection}):null;
 return{ok:errors.length===0,status:errors.length?422:200,schema:'OMEGA_PACKET_PROOF_R52',packetHash,projectionHash,validation:{valid:errors.length===0,errors,address,stateId,metricCount:METRICS.filter(k=>finite(metrics[k])).length},proof:{algorithm:'SHA-256',canonicalization:'recursive sorted object keys',authority:'NON_AUTHORITATIVE_PROOF_COMPILER',receivedNotObserved:true},boundary:'R52 hashes and validates the packet supplied by the canonical runtime. It does not own state, mutate state, infer missing values, certify external facts, or prove native device execution.'};
}
