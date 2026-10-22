import {
 comparePacketOrderR314,
 packetDigestR314,
 validateSynchronousPacketR314,
 type R314SynchronousPacket,
} from './synchronousPacketR314';

export const R329_STATE_SPINE_SCHEMA='OMEGA_AUTHORITATIVE_STATE_SPINE_R329' as const;
export const R329_STATE_SPINE_REVISION='R329' as const;
export const R329_STATE_WRITER_AUTHORITY='OMEGA_SINGLE_AUTHORITATIVE_STATE_WRITER' as const;

export type R329StateCommit<T=unknown>={
 schema:typeof R329_STATE_SPINE_SCHEMA;
 writerId:string;
 commitIndex:number;
 packet:R314SynchronousPacket<T>;
 packetDigest:string;
 previousPacketDigest:string|null;
 canonicalAdmission:false;
};

export type R329CommitRequest<T=unknown>={
 writerId:string;
 expectedPreviousDigest:string|null;
 packet:R314SynchronousPacket<T>;
};

const clean=(value:unknown)=>String(value??'').trim();

function canonicalJsonValueR329(value:unknown,path='root'):unknown{
 if(value===null)return null;
 const type=typeof value;
 if(type==='string'||type==='boolean')return value;
 if(type==='number'){
  if(!Number.isFinite(value as number))throw new Error('R329 non-finite number at '+path);
  return value;
 }
 if(type==='undefined'||type==='function'||type==='symbol'||type==='bigint')throw new Error('R329 non-JSON value at '+path);
 if(Array.isArray(value))return value.map((item,index)=>canonicalJsonValueR329(item,path+'['+index+']'));
 const input=value as Record<string,unknown>;
 const out:Record<string,unknown>={};
 for(const key of Object.keys(input).sort())out[key]=canonicalJsonValueR329(input[key],path+'.'+key);
 return out;
}

function deepFreezeR329<T>(value:T):T{
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  Object.freeze(value);
  for(const child of Object.values(value as Record<string,unknown>))deepFreezeR329(child);
 }
 return value;
}

export function serializeSynchronousPacketR329<T>(packet:R314SynchronousPacket<T>){
 const checked=validateSynchronousPacketR314(packet);
 if(!checked.valid)throw new Error('R329 packet rejected before serialization: '+checked.issues.filter(x=>x.blocking).map(x=>x.code).join(','));
 return JSON.stringify(canonicalJsonValueR329(packet));
}

export function deserializeSynchronousPacketR329<T=unknown>(serialized:string):R314SynchronousPacket<T>{
 let parsed:unknown;
 try{parsed=JSON.parse(serialized)}catch{throw new Error('R329 packet JSON parse failed')}
 const packet=parsed as R314SynchronousPacket<T>;
 const checked=validateSynchronousPacketR314(packet);
 if(!checked.valid)throw new Error('R329 packet rejected after serialization: '+checked.issues.filter(x=>x.blocking).map(x=>x.code).join(','));
 return deepFreezeR329(packet);
}

export function roundTripPacketR329<T>(packet:R314SynchronousPacket<T>){
 const before=packetDigestR314(packet);
 const restored=deserializeSynchronousPacketR329<T>(serializeSynchronousPacketR329(packet));
 const after=packetDigestR314(restored);
 if(before!==after)throw new Error('R329 packet digest changed across canonical round trip');
 return{packet:restored,digest:after};
}

export class R329AuthoritativeStateSpine<T=unknown>{
 private readonly writerId:string;
 private current:R329StateCommit<T>|null=null;
 private readonly packetIds=new Set<string>();
 private readonly packetDigests=new Set<string>();

 constructor(writerId:string){
  const id=clean(writerId);
  if(!id)throw new Error('R329 writerId is required');
  this.writerId=id;
 }

 authority(){
  return Object.freeze({schema:R329_STATE_SPINE_SCHEMA,revision:R329_STATE_SPINE_REVISION,writerId:this.writerId,authority:R329_STATE_WRITER_AUTHORITY,canonicalAdmission:false as const});
 }

 read(){
  return this.current;
 }

 commit(request:R329CommitRequest<T>):R329StateCommit<T>{
  if(clean(request.writerId)!==this.writerId)throw new Error('R329 WRITER_NOT_AUTHORIZED');
  const checked=validateSynchronousPacketR314(request.packet);
  if(!checked.valid)throw new Error('R329 PACKET_INVALID '+checked.issues.filter(x=>x.blocking).map(x=>x.code).join(','));

  const roundTrip=roundTripPacketR329(request.packet);
  const nextPacket=roundTrip.packet;
  const nextDigest=roundTrip.digest;

  if(this.packetIds.has(nextPacket.packetId))throw new Error('R329 DUPLICATE_PACKET_ID');
  if(this.packetDigests.has(nextDigest))throw new Error('R329 DUPLICATE_PACKET_DIGEST');

  if(this.current===null){
   if(request.expectedPreviousDigest!==null)throw new Error('R329 GENESIS_PREVIOUS_DIGEST_MUST_BE_NULL');
  }else{
   if(request.expectedPreviousDigest!==this.current.packetDigest)throw new Error('R329 STALE_PREVIOUS_DIGEST');
   if(comparePacketOrderR314(this.current.packet,nextPacket)>=0)throw new Error('R329 NON_CAUSAL_PACKET_ORDER');
  }

  const committed=deepFreezeR329({
   schema:R329_STATE_SPINE_SCHEMA,
   writerId:this.writerId,
   commitIndex:(this.current?.commitIndex??0)+1,
   packet:nextPacket,
   packetDigest:nextDigest,
   previousPacketDigest:this.current?.packetDigest??null,
   canonicalAdmission:false as const,
  });
  this.current=committed;
  this.packetIds.add(nextPacket.packetId);
  this.packetDigests.add(nextDigest);
  return committed;
 }
}

export const R329_B05_PROMOTION_RECEIPT=Object.freeze({
 revision:R329_STATE_SPINE_REVISION,
 stage:'R314-B05',
 state:'PROVED',
 authority:R329_STATE_WRITER_AUTHORITY,
 deliverables:Object.freeze(['typed packet base','unit registry','frame graph','multi-clock temporal packet','proof/provenance binding','single authoritative state writer']),
 proofs:Object.freeze(['tests/r314-runtime-executable-invariants.mjs','tests/r329-authoritative-state-spine-invariants.mjs']),
 canonicalAdmission:false,
 directProductionMutation:false,
 boundary:'R329 closes the B05 single-writer execution gap over validated R314 packets. It serializes, round-trips, causally orders and commits one immutable packet chain under one configured writer without creating a second CanonState authority.',
} as const);
