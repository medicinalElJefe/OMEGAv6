// R887 logical agent fabric: canonical 12^4 indexes are computational, not physical dimensions.
// Every shell/address owns a unique 20,736-component logical state, lazily evaluated.
export const AXES=12, SIZE=20736, SHELLS=12, AGENTS=SIZE*SHELLS, NESTED=AGENTS*SIZE;
const MAX_ACTIVE=512, MAX_QUEUE=1024;
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
export function submitTask(fabric,task){const{agent,kind,inner=0,target=null,weight=.25}=task;agentAddress(agent);integer(inner,SIZE,'inner');unit(weight);if(!['OBSERVE','RELAX','EXCHANGE'].includes(kind))throw new Error('Unknown task kind');if(kind==='EXCHANGE'&&(target===agent||!neighbors(agent).includes(target)))throw new Error('Peer is not adjacent');if(fabric.queue.length>=MAX_QUEUE)throw new Error('Task queue full');const queued={id:++fabric.sequence,agent,kind,inner,target,weight};fabric.queue.push(queued);return queued.id}
export function decide(fabric,id,inner=0){agentAddress(id);integer(inner,SIZE,'inner');const own=stateValue(fabric,id,inner);let peer=null,error=0;for(const other of neighbors(id)){const e=Math.abs(own-stateValue(fabric,other,inner));if(e>error){peer=other;error=e}}return error>.15?{agent:id,kind:'EXCHANGE',target:peer,inner,weight:.25}:{agent:id,kind:'OBSERVE',inner,weight:0}}
export function stepFabric(fabric,budget=16){if(!Number.isSafeInteger(budget)||budget<1||budget>256)throw new RangeError('Invalid step budget');const receipts=[];for(let i=0;i<budget&&fabric.queue.length;i++){const t=fabric.queue[0];const required=new Set([t.agent,...(t.kind==='EXCHANGE'?[t.target]:[])]);let newCount=0;for(const id of required)if(!fabric.active.has(id))newCount++;if(fabric.active.size+newCount>MAX_ACTIVE)throw new Error('Agent activation budget exceeded; queued task retained without mutation');fabric.queue.shift();const a=getAgent(fabric,t.agent);const before=stateValue(fabric,a.id,t.inner);let after=before,peerBefore=null,peerAfter=null;a.mode='RUNNING';if(t.kind==='RELAX'){const list=neighbors(a.id);const avg=list.reduce((sum,id)=>sum+stateValue(fabric,id,t.inner),before)/(list.length+1);after=before+t.weight*(avg-before);setValue(a,t.inner,after)}if(t.kind==='EXCHANGE'){const b=getAgent(fabric,t.target);peerBefore=stateValue(fabric,b.id,t.inner);const delta=t.weight*(peerBefore-before)/2;after=before+delta;peerAfter=peerBefore-delta;setValue(a,t.inner,after);setValue(b,t.inner,peerAfter);const msg={from:a.id,to:b.id,inner:t.inner,delta,epoch:fabric.tick+1};b.inbox.push(msg);if(b.inbox.length>32)b.inbox.shift()}a.mode='IDLE';const receipt={taskId:t.id,agent:a.id,kind:t.kind,inner:t.inner,peer:t.target,before,after,peerBefore,peerAfter,conservationResidual:peerBefore===null?null:(after+peerAfter)-(before+peerBefore),tick:++fabric.tick,proof:'INTERNALLY_TESTED_DETERMINISTIC_MODEL'};a.memory.push(receipt);if(a.memory.length>32)a.memory.shift();fabric.receipts.push(receipt);if(fabric.receipts.length>512)fabric.receipts.shift();receipts.push(receipt)}return receipts}
export function releaseAgent(fabric,id){const a=fabric.active.get(id);if(!a||a.mode!=='IDLE'||a.values.size||a.memory.length||a.inbox.length||fabric.queue.some(t=>t.agent===id||t.target===id))return false;return fabric.active.delete(id)}
export function agentSnapshot(fabric,id,offset=0,count=144){agentAddress(id);integer(offset,SIZE,'offset');if(!Number.isSafeInteger(count)||count<1||count>1024)throw new RangeError('Invalid page size');const a=fabric.active.get(id);return{schema:'OMEGA_SPHERE_AGENT_R887',address:agentAddress(id),id,epoch:a?.epoch??0,innerCount:SIZE,offset,values:Array.from({length:Math.min(count,SIZE-offset)},(_,i)=>stateValue(fabric,id,offset+i)),memory:a?.memory.slice()??[],evidence:'SYNTHETIC_LOGICAL_AI_POLICY_NOT_EXTERNAL_MODEL'}}
export function agentCSV(fabric,id){agentAddress(id);const{shell,outer}=agentAddress(id);let csv='shell,outer,agent_id,inner,nested_id,value,evidence\n';for(let i=0;i<SIZE;i++)csv+=shell+','+outer+','+id+','+i+','+nestedId(id,i)+','+stateValue(fabric,id,i)+',SYNTHETIC_MODEL\n';return csv}

/** R888 bounded, exact, user-controlled checkpoint. Checksum detects accidental drift, NOT adversarial tampering. */
export const CHECKPOINT_SCHEMA_R888='OMEGA_SPHERE_AGENT_CHECKPOINT_R888';
const CHECKPOINT_LIMIT_R888=4*1024*1024;
function checksumR888(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
function validReceipt(r){return r&&typeof r==='object'&&!Array.isArray(r)&&Number.isSafeInteger(r.taskId)&&r.taskId>0&&Number.isSafeInteger(r.tick)&&r.tick>=0&&['OBSERVE','RELAX','EXCHANGE'].includes(r.kind)&&Number.isSafeInteger(r.agent)&&r.agent>=0&&r.agent<AGENTS&&Number.isSafeInteger(r.inner)&&r.inner>=0&&r.inner<SIZE&&Number.isFinite(r.before)&&r.before>=0&&r.before<=1&&Number.isFinite(r.after)&&r.after>=0&&r.after<=1}
export function serializeFabricR888(fabric){
 if(fabric.active.size>MAX_ACTIVE||fabric.queue.length>MAX_QUEUE||fabric.receipts.length>512)throw Error('Checkpoint budget violation');
 const agents=[...fabric.active.values()].sort((a,b)=>a.id-b.id).map(a=>({id:a.id,epoch:a.epoch,mode:a.mode,values:[...a.values.entries()].sort((a,b)=>a[0]-b[0]),memory:a.memory,inbox:a.inbox}));
 const state={tick:fabric.tick,sequence:fabric.sequence,agents,queue:fabric.queue,receipts:fabric.receipts};
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
  if(!t||!Number.isSafeInteger(t.id)||t.id<1||t.id>state.sequence||taskIds.has(t.id)||!Number.isSafeInteger(t.agent)||t.agent<0||t.agent>=AGENTS||!Number.isSafeInteger(t.inner)||t.inner<0||t.inner>=SIZE||!Number.isFinite(t.weight)||t.weight<0||t.weight>1||!['OBSERVE','RELAX','EXCHANGE'].includes(t.kind)||(t.kind==='EXCHANGE'&&(t.target===t.agent||!neighbors(t.agent).includes(t.target))))throw new Error('Invalid queued task');
  taskIds.add(t.id);restored.queue.push({...t});
 }
 if(!state.receipts.every(validReceipt))throw new Error('Invalid checkpoint receipt');
 restored.receipts=state.receipts;
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
export function phaseSampleR918(fabric,agent,inner,phase){
 agentAddress(agent);integer(inner,SIZE,'inner');integer(phase,AXES,'phase');
 const axis=phase%4,turn=Math.floor(phase/4)-1;
 const digits=axes4(inner),neighborDigits=digits.slice();
 neighborDigits[axis]=(neighborDigits[axis]+turn+AXES)%AXES;
 const neighbor=fromAxes4(neighborDigits),value=stateValue(fabric,agent,inner);
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
