// R887 logical agent fabric: canonical 12^4 indexes are computational, not physical dimensions.
// Every shell/address owns a unique 20,736-component logical state, lazily evaluated.
export const AXES=12, SIZE=20736, SHELLS=12, AGENTS=SIZE*SHELLS, NESTED=AGENTS*SIZE;
const MAX_ACTIVE=512, MAX_QUEUE=1024;
export const MAX_PERSISTABLE_VALUES_R974=12*SIZE;
// Preflight exact new coordinates before mutating the queue or any agent.
export function taskStateCapacityR974(fabric,task){
 const {agent,kind,inner=0,target=null,phase=null}=task;
 const writes=kind==='OBSERVE'?[]:kind==='EXCHANGE'?[[agent,inner],[target,inner]]:kind==='PHASE_EXCHANGE'?[[agent,inner],[agent,phaseNeighborR919(inner,phase)]]:[[agent,inner]];
 let additional=0;for(const [id,index] of writes)if(!fabric.active.get(id)?.values.has(index))additional++;
 let current=0;for(const entry of fabric.active.values())current+=entry.values.size;
 return {current,additional,allowed:current+additional<=MAX_PERSISTABLE_VALUES_R974};
}
function integer(n,max,label){if(!Number.isSafeInteger(n)||n<0||n>=max)throw new RangeError(label+' out of range');return n}
function unit(n){if(!Number.isFinite(n)||n<0||n>1)throw new RangeError('value must be in [0,1]');return n}
export function agentId(shell,outer){return integer(shell,SHELLS,'shell')*SIZE+integer(outer,SIZE,'outer')}
export function agentAddress(id){integer(id,AGENTS,'agent');return{shell:Math.floor(id/SIZE),outer:id%SIZE}}
export function nestedId(id,inner){return integer(id,AGENTS,'agent')*SIZE+integer(inner,SIZE,'inner')}
export function nestedAddress(id){integer(id,NESTED,'nested');return{agent:Math.floor(id/SIZE),inner:id%SIZE}}
export function axes4(index){integer(index,SIZE,'index');return[Math.floor(index/1728),Math.floor(index%1728/144),Math.floor(index%144/12),index%12]}
export function fromAxes4(c){if(!Array.isArray(c)||c.length!==4)throw new RangeError('four axes required');return c.reduce((s,x)=>s*12+integer(x,12,'axis'),0)}
export function neighbors(id){const{shell,outer}=agentAddress(id),axes=axes4(outer),result=[];for(let k=0;k<4;k++)for(const dir of [-1,1]){const a=axes.slice();a[k]=(a[k]+dir+12)%12;result.push(agentId(shell,fromAxes4(a)))}if(shell>0)result.push(agentId(shell-1,outer));if(shell<11)result.push(agentId(shell+1,outer));return result}
function hash(n){n=(n^0x9e3779b9)>>>0;n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return(n^(n>>>16))>>>0}
export function baseline(agent,inner){nestedId(agent,inner);return hash((Math.imul(agent+1,16777619)^(inner+1))>>>0)/4294967295}
export function createFabric(){return{active:new Map(),queue:[],receipts:[],tick:0,sequence:0}}
export function getAgent(fabric,id){agentAddress(id);let a=fabric.active.get(id);if(a)return a;if(fabric.active.size>=MAX_ACTIVE)throw new Error('Agent activation budget exceeded');a={id,values:new Map(),memory:[],epoch:0,inbox:[],mode:'IDLE'};fabric.active.set(id,a);return a}
export function stateValue(fabric,id,inner){integer(inner,SIZE,'inner');return fabric.active.get(id)?.values.get(inner)??baseline(id,inner)}
function setValue(a,inner,value){a.values.set(inner,unit(value));a.epoch++}
export function submitTask(fabric,task){const{agent,kind,inner=0,target=null,weight=.25,phase=null}=task;agentAddress(agent);integer(inner,SIZE,'inner');unit(weight);if(!['OBSERVE','RELAX','EXCHANGE','PHASE_EXCHANGE'].includes(kind))throw new Error('Unknown task kind');if(kind==='EXCHANGE'&&(target===agent||!neighbors(agent).includes(target)))throw new Error('Peer is not adjacent');if(kind==='PHASE_EXCHANGE'&&(!Number.isSafeInteger(phase)||phase<0||phase>=AXES||Math.floor(phase/4)===1||target!==null))throw new Error('Phase exchange requires nonzero local-axis step with no external target');if(fabric.queue.length>=MAX_QUEUE)throw new Error('Task queue full');if(!Number.isSafeInteger(fabric.sequence)||fabric.sequence<0||fabric.sequence>=Number.MAX_SAFE_INTEGER)throw new RangeError('Task sequence exhausted');const queued={id:++fabric.sequence,agent,kind,inner,target,weight,...(kind==='PHASE_EXCHANGE'?{phase}:{})};fabric.queue.push(queued);return queued.id}
export function decide(fabric,id,inner=0){agentAddress(id);integer(inner,SIZE,'inner');const own=stateValue(fabric,id,inner);let peer=null,error=0;for(const other of neighbors(id)){const e=Math.abs(own-stateValue(fabric,other,inner));if(e>error){peer=other;error=e}}return error>.15?{agent:id,kind:'EXCHANGE',target:peer,inner,weight:.25}:{agent:id,kind:'OBSERVE',inner,weight:0}}
export function stepFabric(fabric,budget=16){if(!Number.isSafeInteger(budget)||budget<1||budget>256)throw new RangeError('Invalid step budget');const receipts=[];for(let i=0;i<budget&&fabric.queue.length;i++){const t=fabric.queue[0];const required=new Set([t.agent,...(t.kind==='EXCHANGE'?[t.target]:[])]);let newCount=0;for(const id of required)if(!fabric.active.has(id))newCount++;if(fabric.active.size+newCount>MAX_ACTIVE)throw new Error('Agent activation budget exceeded; queued task retained without mutation');if(!taskStateCapacityR974(fabric,t).allowed)throw new Error('Durable state budget exceeded; queued task retained without mutation');if(!Number.isSafeInteger(fabric.tick)||fabric.tick<0||fabric.tick>=Number.MAX_SAFE_INTEGER)throw new RangeError('Execution tick exhausted; queued task retained');const epochWrites=t.kind==='PHASE_EXCHANGE'?2:t.kind==='OBSERVE'?0:1;for(const id of required){const epoch=fabric.active.get(id)?.epoch??0;if(!Number.isSafeInteger(epoch)||epoch<0||epoch>Number.MAX_SAFE_INTEGER-epochWrites)throw new RangeError('Agent epoch exhausted; queued task retained')}fabric.queue.shift();const a=getAgent(fabric,t.agent);const before=stateValue(fabric,a.id,t.inner);let after=before,peerBefore=null,peerAfter=null;a.mode='RUNNING';if(t.kind==='RELAX'){const list=neighbors(a.id);const avg=list.reduce((sum,id)=>sum+stateValue(fabric,id,t.inner),before)/(list.length+1);after=before+t.weight*(avg-before);setValue(a,t.inner,after)}let localNeighbor=null,localBefore=null,localAfter=null;if(t.kind==='EXCHANGE'){const b=getAgent(fabric,t.target);peerBefore=stateValue(fabric,b.id,t.inner);const delta=t.weight*(peerBefore-before)/2;after=before+delta;peerAfter=peerBefore-delta;setValue(a,t.inner,after);setValue(b,t.inner,peerAfter);const msg={from:a.id,to:b.id,inner:t.inner,delta,epoch:fabric.tick+1};b.inbox.push(msg);if(b.inbox.length>32)b.inbox.shift()}if(t.kind==='PHASE_EXCHANGE'){localNeighbor=phaseSampleR918(fabric,a.id,t.inner,t.phase).neighbor;localBefore=stateValue(fabric,a.id,localNeighbor);const delta=t.weight*(localBefore-before)/2;after=before+delta;localAfter=localBefore-delta;setValue(a,t.inner,after);setValue(a,localNeighbor,localAfter)}a.mode='IDLE';const receipt={taskId:t.id,agent:a.id,kind:t.kind,inner:t.inner,peer:t.target,before,after,peerBefore,peerAfter,...(t.kind==='PHASE_EXCHANGE'?{phase:t.phase,neighborInner:localNeighbor,neighborBefore:localBefore,neighborAfter:localAfter}:{}),conservationResidual:t.kind==='PHASE_EXCHANGE'?(after+localAfter)-(before+localBefore):peerBefore===null?null:(after+peerAfter)-(before+peerBefore),tick:++fabric.tick,proof:'INTERNALLY_TESTED_DETERMINISTIC_MODEL'};a.memory.push(receipt);if(a.memory.length>32)a.memory.shift();fabric.receipts.push(receipt);if(fabric.receipts.length>512)fabric.receipts.shift();receipts.push(receipt)}return receipts}
export function releaseAgent(fabric,id){const a=fabric.active.get(id);if(!a||a.mode!=='IDLE'||a.values.size||a.memory.length||a.inbox.length||fabric.queue.some(t=>t.agent===id||t.target===id))return false;return fabric.active.delete(id)}
export function agentSnapshot(fabric,id,offset=0,count=144){agentAddress(id);integer(offset,SIZE,'offset');if(!Number.isSafeInteger(count)||count<1||count>1024)throw new RangeError('Invalid page size');const a=fabric.active.get(id);return{schema:'OMEGA_SPHERE_AGENT_R887',address:agentAddress(id),id,epoch:a?.epoch??0,innerCount:SIZE,offset,values:Array.from({length:Math.min(count,SIZE-offset)},(_,i)=>stateValue(fabric,id,offset+i)),memory:a?.memory.slice()??[],evidence:'SYNTHETIC_LOGICAL_AI_POLICY_NOT_EXTERNAL_MODEL'}}
export function agentCSV(fabric,id){agentAddress(id);const{shell,outer}=agentAddress(id);let csv='shell,outer,agent_id,inner,nested_id,value,evidence\n';for(let i=0;i<SIZE;i++)csv+=shell+','+outer+','+id+','+i+','+nestedId(id,i)+','+stateValue(fabric,id,i)+',SYNTHETIC_MODEL\n';return csv}

/** R888 bounded, exact, user-controlled checkpoint. Checksum detects accidental drift, NOT adversarial tampering. */
export const CHECKPOINT_SCHEMA_R888='OMEGA_SPHERE_AGENT_CHECKPOINT_R888';
const CHECKPOINT_LIMIT_R888=4*1024*1024;
function checksumR888(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
function validReceipt(r){return r&&typeof r==='object'&&!Array.isArray(r)&&Number.isSafeInteger(r.taskId)&&r.taskId>0&&Number.isSafeInteger(r.tick)&&r.tick>=0&&['OBSERVE','RELAX','EXCHANGE','PHASE_EXCHANGE'].includes(r.kind)&&Number.isSafeInteger(r.agent)&&r.agent>=0&&r.agent<AGENTS&&Number.isSafeInteger(r.inner)&&r.inner>=0&&r.inner<SIZE&&Number.isFinite(r.before)&&r.before>=0&&r.before<=1&&Number.isFinite(r.after)&&r.after>=0&&r.after<=1&&(r.kind!=='PHASE_EXCHANGE'||(Number.isSafeInteger(r.phase)&&r.phase>=0&&r.phase<AXES&&Math.floor(r.phase/4)!==1&&Number.isSafeInteger(r.neighborInner)&&r.neighborInner===phaseNeighborR919(r.inner,r.phase)&&Number.isFinite(r.neighborBefore)&&r.neighborBefore>=0&&r.neighborBefore<=1&&Number.isFinite(r.neighborAfter)&&r.neighborAfter>=0&&r.neighborAfter<=1&&Number.isFinite(r.conservationResidual)&&Math.abs(r.conservationResidual)<=1e-9&&Math.abs((r.after+r.neighborAfter)-(r.before+r.neighborBefore)-r.conservationResidual)<=1e-9))}
export function serializeFabricR888(fabric){
 if(fabric.active.size>MAX_ACTIVE||fabric.queue.length>MAX_QUEUE||fabric.receipts.length>512)throw Error('Checkpoint budget violation');
 const agents=[...fabric.active.values()].sort((a,b)=>a.id-b.id).map(a=>({id:a.id,epoch:a.epoch,mode:a.mode,values:[...a.values.entries()].sort((a,b)=>a[0]-b[0]),memory:a.memory,inbox:a.inbox}));
 validateRecursiveStoreR991(fabric);
 const state={tick:fabric.tick,sequence:fabric.sequence,agents,queue:fabric.queue,receipts:fabric.receipts,...(fabric.recursive?{recursive:fabric.recursive}:{})};
 const canonical=JSON.stringify(state);
 if(canonical.length>CHECKPOINT_LIMIT_R888)throw Error('Checkpoint exceeds 4 MiB browser budget; no data discarded');
 return JSON.stringify({schema:CHECKPOINT_SCHEMA_R888,checksum:checksumR888(canonical),state});
}
export function restoreFabricR888(serialized){
 if(typeof serialized!=='string'||serialized.length>CHECKPOINT_LIMIT_R888+256)throw new Error('Checkpoint size/type invalid');
 let envelope;try{envelope=JSON.parse(serialized)}catch{throw new Error('Malformed checkpoint JSON')}
 if(!envelope||envelope.schema!==CHECKPOINT_SCHEMA_R888||typeof envelope.checksum!=='string'||!envelope.state)throw new Error('Checkpoint schema invalid');
 const state=envelope.state;const canonical=JSON.stringify(state);
 if(checksumR888(canonical)!==envelope.checksum)throw new Error('Checkpoint checksum mismatch');
 if(!Number.isSafeInteger(state.tick)||state.tick<0||!Number.isSafeInteger(state.sequence)||state.sequence<state.tick||!Array.isArray(state.agents)||state.agents.length>MAX_ACTIVE||!Array.isArray(state.queue)||state.queue.length>MAX_QUEUE||!Array.isArray(state.receipts)||state.receipts.length>512)throw new Error('Checkpoint invariants invalid');
 const restored=createFabric();restored.tick=state.tick;restored.sequence=state.sequence;
 const seen=new Set(),taskIds=new Set();
 for(const raw of state.agents){
  if(!raw||!Number.isSafeInteger(raw.id)||raw.id<0||raw.id>=AGENTS||seen.has(raw.id)||!Number.isSafeInteger(raw.epoch)||raw.epoch<0||raw.mode!=='IDLE'||!Array.isArray(raw.values)||raw.values.length>SIZE||!Array.isArray(raw.memory)||raw.memory.length>32||!Array.isArray(raw.inbox)||raw.inbox.length>32)throw new Error('Invalid agent checkpoint');
  seen.add(raw.id);const a={id:raw.id,values:new Map(),memory:raw.memory,inbox:raw.inbox,epoch:raw.epoch,mode:'IDLE'};
  for(const row of raw.values){if(!Array.isArray(row)||row.length!==2||!Number.isSafeInteger(row[0])||row[0]<0||row[0]>=SIZE||a.values.has(row[0])||!Number.isFinite(row[1])||row[1]<0||row[1]>1)throw new Error('Invalid inner-state checkpoint');a.values.set(row[0],row[1])}
  if(!a.memory.every(validReceipt))throw new Error('Invalid agent memory receipt');
  for(const msg of a.inbox){if(!msg||!Number.isSafeInteger(msg.from)||msg.from<0||msg.from>=AGENTS||msg.to!==a.id||!Number.isSafeInteger(msg.inner)||msg.inner<0||msg.inner>=SIZE||!Number.isFinite(msg.delta)||!Number.isSafeInteger(msg.epoch)||msg.epoch<0||msg.epoch>state.tick)throw new Error('Invalid agent inbox')}
  restored.active.set(raw.id,a);
 }
 for(const t of state.queue){
  if(!t||!Number.isSafeInteger(t.id)||t.id<1||t.id>state.sequence||taskIds.has(t.id)||!Number.isSafeInteger(t.agent)||t.agent<0||t.agent>=AGENTS||!Number.isSafeInteger(t.inner)||t.inner<0||t.inner>=SIZE||!Number.isFinite(t.weight)||t.weight<0||t.weight>1||!['OBSERVE','RELAX','EXCHANGE','PHASE_EXCHANGE'].includes(t.kind)||(t.kind==='EXCHANGE'&&(t.target===t.agent||!neighbors(t.agent).includes(t.target)))||(t.kind==='PHASE_EXCHANGE'&&(!Number.isSafeInteger(t.phase)||t.phase<0||t.phase>=AXES||Math.floor(t.phase/4)===1||t.target!==null)))throw new Error('Invalid queued task');
  taskIds.add(t.id);restored.queue.push({...t});
 }
 if(!state.receipts.every(validReceipt))throw new Error('Invalid checkpoint receipt');
 restored.receipts=state.receipts;
 if(Object.hasOwn(state,'recursive'))restored.recursive=state.recursive;
 validateRecursiveStoreR991(restored);
 return restored;
}


/**
 * R918: exact 12^10 hierarchical address over shell / outer / inner / phase.
 * The last radix-12 coordinate is a projection/phase slot, not a newly
 * allocated neuron, physical dimension, or independently stored state.
 * All integers remain below Number.MAX_SAFE_INTEGER and round-trip exactly.
 */
export const R918_CAPACITY=NESTED*AXES; // 61,917,364,224 = 12^10
export const R918_SCHEMA='OMEGA_SPHERE_PHASE_FIELD_R918';
export function expandedAddressR918(shell,outer,inner,phase){
 return nestedId(agentId(shell,outer),inner)*AXES+integer(phase,AXES,'phase');
}
export function expandedCoordinatesR918(address){
 integer(address,R918_CAPACITY,'expanded address');
 const phase=address%AXES,nested=Math.floor(address/AXES);
 const {agent,inner}=nestedAddress(nested),{shell,outer}=agentAddress(agent);
 return Object.freeze({schema:R918_SCHEMA,address,shell,outer,agent,inner,phase,nested});
}
/**
 * One of twelve exact axis/turn samples: four canonical inner axes crossed
 * with negative, neutral and positive one-step displacement. This samples
 * the existing inner state and its neighbors without allocating shadow state.
 */
export function phaseNeighborR919(inner,phase){
 integer(inner,SIZE,'inner');integer(phase,AXES,'phase');
 const axis=phase%4,turn=Math.floor(phase/4)-1,digits=axes4(inner);
 digits[axis]=(digits[axis]+turn+AXES)%AXES;
 return fromAxes4(digits);
}
export function phaseSampleR918(fabric,agent,inner,phase){
 agentAddress(agent);integer(inner,SIZE,'inner');integer(phase,AXES,'phase');
 const axis=phase%4,turn=Math.floor(phase/4)-1;
 const neighbor=phaseNeighborR919(inner,phase),value=stateValue(fabric,agent,inner);
 const neighborValue=stateValue(fabric,agent,neighbor);
 const delta=neighborValue-value;
 return Object.freeze({
  schema:R918_SCHEMA,expandedAddress:nestedId(agent,inner)*AXES+phase,
  agent,inner,phase,axis,turn,neighbor,originalValue:value,
  sampledValue:neighborValue,delta,gradientMagnitude:Math.abs(delta),
  angularPhase:phase*Math.PI/6,
  authority:'SYNTHETIC_INTERNAL_FIELD_PROJECTION',
  createsIndependentPhaseState:false,canonicalWrites:0
 });
}

// R990: exact recursive identity over the existing SPHERE fabric. Shell is
// a separate context; canonical path digits always use the original radix.
// Depth bound controls resource consumption, not a mathematical dimension.
export const RECURSIVE_PATH_MAX_DEPTH_R990=64;
const ROOT_R990='omega://atlas/root';
const RADIX_R990=BigInt(SIZE);
function pathDigitsR990(parts){
 if(!Array.isArray(parts)||parts.length>RECURSIVE_PATH_MAX_DEPTH_R990)throw new RangeError('Invalid recursive atlas path depth');
 return Array.from(parts,n=>integer(n,SIZE,'recursive atlas component'));
}
export function encodePathR990(parts){
 const digits=pathDigitsR990(parts);
 return ROOT_R990+digits.map(n=>'/'+String(n).padStart(6,'0')).join('');
}
export function decodePathR990(path){
 if(typeof path!=='string'||path.length>ROOT_R990.length+7*RECURSIVE_PATH_MAX_DEPTH_R990)throw new RangeError('Invalid recursive atlas path length');
 if(path===ROOT_R990)return Object.freeze([]);
 if(!path.startsWith(ROOT_R990+'/'))throw new Error('Invalid recursive atlas root');
 const components=path.slice(ROOT_R990.length+1).split('/');
 if(components.some(c=>!/^\d{6}$/.test(c)))throw new Error('Path components require six decimal digits');
 return Object.freeze(pathDigitsR990(components.map(Number)));
}
export function flattenPathR990(parts){
 const digits=pathDigitsR990(parts);
 return Object.freeze({depth:digits.length,index:digits.reduce((sum,n)=>sum*RADIX_R990+BigInt(n),0n)});
}
export function expandIndexR990(index,depth){
 if(!Number.isSafeInteger(depth)||depth<0||depth>RECURSIVE_PATH_MAX_DEPTH_R990||typeof index!=='bigint'||index<0n||index>=RADIX_R990**BigInt(depth))throw new RangeError('Recursive flattened address outside depth');
 const digits=Array(depth).fill(0);let n=index;
 for(let i=depth-1;i>=0;i--){digits[i]=Number(n%RADIX_R990);n/=RADIX_R990}
 return Object.freeze(digits);
}
export function parentPathR990(path){const parts=decodePathR990(path);return parts.length?encodePathR990(parts.slice(0,-1)):null}
export function childPathR990(path,child){return encodePathR990([...decodePathR990(path),child])}
export function commonAncestorR990(a,b){
 const left=decodePathR990(a),right=decodePathR990(b);let i=0;
 while(i<Math.min(left.length,right.length)&&left[i]===right[i])i++;
 return encodePathR990(left.slice(0,i));
}
export function ancestorsR990(path){
 const digits=decodePathR990(path);
 return Object.freeze(Array.from({length:digits.length},(_,i)=>encodePathR990(digits.slice(0,i))));
}
// Versioned generated scalar only; identity is the full path, never a hash.
// The first two components resolve directly to R887 instead of a shadow store.
export function resolveRecursiveStateR990(fabric,shell,path){
 integer(shell,SHELLS,'shell');
 if(!fabric||!(fabric.active instanceof Map))throw new Error('Existing SPHERE fabric required');
 const digits=decodePathR990(path),flat=flattenPathR990(digits);
 const base={schema:'OMEGA_RECURSIVE_PATH_R990',path,depth:digits.length,flatIndex:flat.index.toString(),shell,parent:parentPathR990(path),childCount:digits.length<RECURSIVE_PATH_MAX_DEPTH_R990?SIZE:0,revision:0,canonicalMutation:false};
 if(digits.length===0)return Object.freeze({...base,state:'LOGICAL_ATLAS_ROOT',value:null,materialized:false});
 const id=agentId(shell,digits[0]),active=fabric.active.get(id);
 if(digits.length===1)return Object.freeze({...base,agent:id,state:'LOGICAL_AGENT',value:null,materialized:Boolean(active),epoch:active?.epoch??0});
 if(digits.length===2){
  const inner=digits[1],materialized=Boolean(active?.values.has(inner));
  return Object.freeze({...base,agent:id,inner,value:stateValue(fabric,id,inner),materialized,state:materialized?'STORED_R887_OVERRIDE':'GENERATED_R887_BASELINE',epoch:active?.epoch??0,globalAddress:nestedId(id,inner)});
 }
 const saved=fabric.recursive?.entries[recursiveKeyR991(shell,path)];
 if(saved)return Object.freeze({...base,value:saved.value,revision:saved.revision,materialized:true,state:'STORED_RECURSIVE_OVERRIDE_R991',execution:'BOUNDED_LOCAL_OPERATOR',learned:false,observed:false});
 let seed=0x52393930;
 seed=hash(seed^shell);
 for(let i=0;i<digits.length;i++)seed=hash(seed^Math.imul(digits[i]+1,16777619)^i);
 return Object.freeze({...base,value:seed/4294967295,materialized:false,state:'GENERATED_RECURSIVE_SCALAR_R990',generator:'R990_PATH_HASH32_V1',execution:'BOUNDED_LOCAL_OPERATOR_AVAILABLE',learned:false,observed:false});
}
export function queryRecursiveRegionR990(fabric,shell,parent,start,count){
 decodePathR990(parent);integer(start,SIZE,'region offset');
 if(!Number.isSafeInteger(count)||count<1||count>144||start+count>SIZE)throw new RangeError('Recursive region page must contain 1–144 valid children');
 return Object.freeze(Array.from({length:count},(_,i)=>resolveRecursiveStateR990(fabric,shell,childPathR990(parent,start+i))));
}

// R991: deeper states are sparse extensions of the same SPHERE fabric.
// Legacy depth-two values remain owned exclusively by R887. Separate
// recursive revision clock is not a second CanonState authority.
export const R991_MAX_OVERRIDES=4096;
const R991_MAX_RECEIPTS=512;
const recursiveKeyR991=(shell,path)=>shell+':'+path;
const validUnitR991=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1;
const validRevisionR991=x=>Number.isSafeInteger(x)&&x>=0;
function deepPathR991(path){const digits=decodePathR990(path);if(digits.length<3)throw new Error('Depth three or greater required for recursive operator');return digits}
function siblingR991(path,phase){
 const digits=deepPathR991(path);
 integer(phase,12,'phase');if(Math.floor(phase/4)===1)throw new Error('Nonzero sibling phase required');
 return encodePathR990([...digits.slice(0,-1),phaseNeighborR919(digits.at(-1),phase)]);
}
export function validateRecursiveStoreR991(fabric){
 if(!Object.hasOwn(fabric,'recursive'))return 0;
 const store=fabric.recursive;
 if(!store||!validRevisionR991(store.revision)||!store.entries||Object.getPrototypeOf(store.entries)!==Object.prototype||!Array.isArray(store.receipts)||store.receipts.length!==Math.min(store.revision,R991_MAX_RECEIPTS))throw new Error('Invalid recursive store');
 const keys=Object.keys(store.entries);
 if(keys.length>R991_MAX_OVERRIDES)throw new Error('Recursive override budget exceeded');
 for(const key of keys){
  const split=key.indexOf(':'),shell=Number(key.slice(0,split)),path=key.slice(split+1),entry=store.entries[key];
  integer(shell,SHELLS,'shell');deepPathR991(path);
  if(key!==recursiveKeyR991(shell,path)||!entry||!validUnitR991(entry.value)||!validRevisionR991(entry.revision)||entry.revision<1||entry.revision>store.revision)throw new Error('Invalid recursive override');
 }
 const latest=new Map();let expected=store.revision-store.receipts.length;
 for(const receipt of store.receipts){
  if(!receipt||receipt.revision!==++expected||!['RELAX_PARENT','EXCHANGE_SIBLING'].includes(receipt.kind)||!validUnitR991(receipt.weight)||!Array.isArray(receipt.changes)||receipt.changes.length!==(receipt.kind==='RELAX_PARENT'?1:2))throw new Error('Invalid recursive receipt');
  integer(receipt.shell,SHELLS,'shell');deepPathR991(receipt.path);
  const a=receipt.changes[0],b=receipt.changes[1];
  if(a?.path!==receipt.path)throw new Error('Invalid recursive receipt source');
  if(receipt.kind==='EXCHANGE_SIBLING'){
   if(b?.path!==siblingR991(receipt.path,receipt.phase))throw new Error('Invalid recursive sibling identity');
   const delta=receipt.weight*(b.before-a.before)/2;
   if(a.after!==a.before+delta||b.after!==b.before-delta||receipt.residual!==(a.after+b.after)-(a.before+b.before)||Math.abs(receipt.residual)>1e-12)throw new Error('Invalid recursive exchange arithmetic');
  }else{
   if(receipt.parent!==parentPathR990(receipt.path)||!validUnitR991(receipt.parentValue)||a.after!==a.before+receipt.weight*(receipt.parentValue-a.before)||receipt.residual!==null)throw new Error('Invalid recursive parent arithmetic');
  }
  for(const change of receipt.changes){
   deepPathR991(change.path);
   if(!validUnitR991(change.before)||!validUnitR991(change.after)||!validRevisionR991(change.beforeRevision)||change.beforeRevision>=receipt.revision)throw new Error('Invalid recursive receipt values');
   const key=recursiveKeyR991(receipt.shell,change.path),prior=latest.get(key);
   if(prior&&(prior.value!==change.before||prior.revision!==change.beforeRevision))throw new Error('Recursive receipt continuity mismatch');
   latest.set(key,{value:change.after,revision:receipt.revision});
  }
 }
 for(const [key,entry] of latest){
  const stored=store.entries[key];
  if(!stored||stored.value!==entry.value||stored.revision!==entry.revision)throw new Error('Recursive receipt return mismatch');
 }
 const earliest=store.revision-store.receipts.length+1;
 for(const key of keys)if(store.entries[key].revision>=earliest&&!latest.has(key))throw new Error('Recursive override missing receipt');
 return keys.length;
}
export function executeRecursiveR991(fabric,{shell,path,kind,weight,expectedRevision,phase,expectedPeerRevision}){
 integer(shell,SHELLS,'shell');deepPathR991(path);unit(weight);
 if(!['RELAX_PARENT','EXCHANGE_SIBLING'].includes(kind))throw new Error('Unknown recursive operator');
 const current=resolveRecursiveStateR990(fabric,shell,path);
 if(!validRevisionR991(expectedRevision)||current.revision!==expectedRevision)throw new Error('Stale recursive source revision');
 const existing=fabric.recursive??{revision:0,entries:{},receipts:[]};
 if(!validRevisionR991(existing.revision)||existing.revision>=Number.MAX_SAFE_INTEGER)throw new Error('Recursive revision exhausted');
 const revision=existing.revision+1,changes=[];let parent=null,parentValue=null,residual=null;
 if(kind==='RELAX_PARENT'){
  parent=parentPathR990(path);parentValue=resolveRecursiveStateR990(fabric,shell,parent).value;unit(parentValue);
  changes.push({path,before:current.value,beforeRevision:current.revision,after:current.value+weight*(parentValue-current.value)});
 }else{
  const peerPath=siblingR991(path,phase),peer=resolveRecursiveStateR990(fabric,shell,peerPath);
  if(!validRevisionR991(expectedPeerRevision)||peer.revision!==expectedPeerRevision)throw new Error('Stale recursive peer revision');
  const delta=weight*(peer.value-current.value)/2;
  changes.push({path,before:current.value,beforeRevision:current.revision,after:current.value+delta},{path:peerPath,before:peer.value,beforeRevision:peer.revision,after:peer.value-delta});
  residual=(changes[0].after+changes[1].after)-(current.value+peer.value);
  if(Math.abs(residual)>1e-12)throw new Error('Recursive exchange residual exceeds tolerance');
 }
 const additional=changes.filter(change=>!Object.hasOwn(existing.entries,recursiveKeyR991(shell,change.path))).length;
 if(Object.keys(existing.entries).length+additional>R991_MAX_OVERRIDES)throw new Error('Recursive override budget exceeded; no mutation');
 for(const change of changes)unit(change.after);
 const receipt=Object.freeze({revision,kind,shell,path,weight,...(kind==='RELAX_PARENT'?{parent,parentValue}:{phase}),changes:Object.freeze(changes.map(change=>Object.freeze(change))),residual,authority:'SYNTHETIC_LOCAL_COMPUTATION',canonicalMutation:false});
 const entries={...existing.entries};
 for(const change of changes)entries[recursiveKeyR991(shell,change.path)]=Object.freeze({value:change.after,revision});
 fabric.recursive={revision,entries,receipts:[...existing.receipts,receipt].slice(-R991_MAX_RECEIPTS)};
 return receipt;
}
export function recursiveSiblingR991(path,phase){return siblingR991(path,phase)}
