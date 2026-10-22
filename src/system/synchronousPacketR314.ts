export const R314_SYNCHRONOUS_PACKET_SCHEMA='OMEGA_SYNCHRONOUS_PACKET_R314' as const;
export const R314_SYNCHRONOUS_PACKET_REVISION='R314' as const;

export type R314UnitDimension='DIMENSIONLESS'|'LENGTH'|'TIME'|'MASS'|'TEMPERATURE'|'ANGLE'|'VELOCITY'|'ACCELERATION'|'PRESSURE'|'ENERGY'|'CUSTOM';
export type R314UnitRef={symbol:string;dimension:R314UnitDimension;scaleToSI:number;offsetToSI?:number};
export type R314FrameRef={id:string;kind:'CANONICAL'|'OBSERVER'|'WGS84'|'LOCAL'|'INSTRUMENT'|'MODEL'|'CUSTOM';parentId:string|null;revision:string};
export type R314ClockVector={
 eventTime:string;
 receiveTime:string;
 monotonicMs:number;
 logical:number;
 computeStartMs:number|null;
 computeEndMs:number|null;
 validFrom:string|null;
 validUntil:string|null;
};
export type R314ProvenanceRef={sourceId:string;sourceKind:'RETURNED'|'OBSERVED'|'IMPORTED'|'DERIVED'|'LOCAL'|'MODEL'|'UNKNOWN';sourceVersion:string|null;retrievedAt:string|null;hash:string|null};
export type R314Uncertainty={kind:'NONE'|'ABSOLUTE'|'RELATIVE'|'INTERVAL'|'CUSTOM';value:number|null;lower:number|null;upper:number|null;unit:string|null;method:string|null};
export type R314ProofBinding={proofIds:string[];state:'UNPROVEN'|'SOURCE_BOUND'|'EVIDENCE_BOUND'|'VALIDATED';canonicalAdmission:false};

export type R314SynchronousPacket<T=unknown>={
 schema:typeof R314_SYNCHRONOUS_PACKET_SCHEMA;
 packetId:string;
 stateVersion:string;
 sequence:number;
 payload:T;
 unit:R314UnitRef;
 frame:R314FrameRef;
 clocks:R314ClockVector;
 provenance:R314ProvenanceRef;
 uncertainty:R314Uncertainty;
 proof:R314ProofBinding;
 scarIds:string[];
};

export type R314PacketIssue={code:string;message:string;blocking:boolean};
export type R314PacketValidation={valid:boolean;issues:R314PacketIssue[]};

const isoMs=(value:string|null)=>value===null?null:Date.parse(value);
const finite=(value:number)=>Number.isFinite(value);
const text=(value:string)=>String(value||'').trim();

export const R314_UNIT_REGISTRY:Readonly<Record<string,R314UnitRef>>=Object.freeze({
 '1':{symbol:'1',dimension:'DIMENSIONLESS',scaleToSI:1},
 m:{symbol:'m',dimension:'LENGTH',scaleToSI:1},
 km:{symbol:'km',dimension:'LENGTH',scaleToSI:1000},
 s:{symbol:'s',dimension:'TIME',scaleToSI:1},
 ms:{symbol:'ms',dimension:'TIME',scaleToSI:.001},
 kg:{symbol:'kg',dimension:'MASS',scaleToSI:1},
 K:{symbol:'K',dimension:'TEMPERATURE',scaleToSI:1},
 rad:{symbol:'rad',dimension:'ANGLE',scaleToSI:1},
 deg:{symbol:'deg',dimension:'ANGLE',scaleToSI:Math.PI/180},
 'm/s':{symbol:'m/s',dimension:'VELOCITY',scaleToSI:1},
 'km/s':{symbol:'km/s',dimension:'VELOCITY',scaleToSI:1000},
 'm/s²':{symbol:'m/s²',dimension:'ACCELERATION',scaleToSI:1},
 Pa:{symbol:'Pa',dimension:'PRESSURE',scaleToSI:1},
 J:{symbol:'J',dimension:'ENERGY',scaleToSI:1},
});

export const R314_CANONICAL_FRAME:R314FrameRef=Object.freeze({id:'OMEGA_CANONICAL',kind:'CANONICAL',parentId:null,revision:'R314'});

export function unitR314(symbol:string):R314UnitRef{
 const hit=R314_UNIT_REGISTRY[symbol];
 if(!hit)throw new Error(`R314 unknown unit ${symbol}`);
 return hit;
}

export function convertUnitR314(value:number,from:R314UnitRef,to:R314UnitRef){
 if(!finite(value))throw new Error('R314 unit conversion requires a finite value');
 if(from.dimension!==to.dimension)throw new Error(`R314 unit dimension mismatch ${from.dimension} -> ${to.dimension}`);
 const si=value*from.scaleToSI+(from.offsetToSI||0);
 return (si-(to.offsetToSI||0))/to.scaleToSI;
}

export function emptyUncertaintyR314():R314Uncertainty{return{kind:'NONE',value:null,lower:null,upper:null,unit:null,method:null}}

export function clockVectorR314(input:Partial<R314ClockVector>&Pick<R314ClockVector,'eventTime'|'receiveTime'|'monotonicMs'|'logical'>):R314ClockVector{
 return{
  eventTime:input.eventTime,
  receiveTime:input.receiveTime,
  monotonicMs:input.monotonicMs,
  logical:input.logical,
  computeStartMs:input.computeStartMs??null,
  computeEndMs:input.computeEndMs??null,
  validFrom:input.validFrom??null,
  validUntil:input.validUntil??null,
 };
}

export function validateClockVectorR314(clocks:R314ClockVector):R314PacketIssue[]{
 const issues:R314PacketIssue[]=[];
 const event=isoMs(clocks.eventTime),receive=isoMs(clocks.receiveTime),validFrom=isoMs(clocks.validFrom),validUntil=isoMs(clocks.validUntil);
 if(event===null||!finite(event))issues.push({code:'CLOCK_EVENT_INVALID',message:'eventTime must be an ISO-parseable timestamp',blocking:true});
 if(receive===null||!finite(receive))issues.push({code:'CLOCK_RECEIVE_INVALID',message:'receiveTime must be an ISO-parseable timestamp',blocking:true});
 if(event!==null&&receive!==null&&finite(event)&&finite(receive)&&receive<event)issues.push({code:'CLOCK_RECEIVE_BEFORE_EVENT',message:'receiveTime precedes eventTime',blocking:true});
 if(!finite(clocks.monotonicMs)||clocks.monotonicMs<0)issues.push({code:'CLOCK_MONOTONIC_INVALID',message:'monotonicMs must be finite and non-negative',blocking:true});
 if(!Number.isSafeInteger(clocks.logical)||clocks.logical<0)issues.push({code:'CLOCK_LOGICAL_INVALID',message:'logical clock must be a non-negative safe integer',blocking:true});
 if(clocks.computeStartMs!==null&&(!finite(clocks.computeStartMs)||clocks.computeStartMs<0))issues.push({code:'CLOCK_COMPUTE_START_INVALID',message:'computeStartMs must be null or finite/non-negative',blocking:true});
 if(clocks.computeEndMs!==null&&(!finite(clocks.computeEndMs)||clocks.computeEndMs<0))issues.push({code:'CLOCK_COMPUTE_END_INVALID',message:'computeEndMs must be null or finite/non-negative',blocking:true});
 if(clocks.computeStartMs!==null&&clocks.computeEndMs!==null&&clocks.computeEndMs<clocks.computeStartMs)issues.push({code:'CLOCK_COMPUTE_REVERSED',message:'computeEndMs precedes computeStartMs',blocking:true});
 if(clocks.validFrom!==null&&(validFrom===null||!finite(validFrom)))issues.push({code:'CLOCK_VALID_FROM_INVALID',message:'validFrom must be null or ISO-parseable',blocking:true});
 if(clocks.validUntil!==null&&(validUntil===null||!finite(validUntil)))issues.push({code:'CLOCK_VALID_UNTIL_INVALID',message:'validUntil must be null or ISO-parseable',blocking:true});
 if(validFrom!==null&&validUntil!==null&&finite(validFrom)&&finite(validUntil)&&validUntil<validFrom)issues.push({code:'CLOCK_VALIDITY_REVERSED',message:'validUntil precedes validFrom',blocking:true});
 return issues;
}

export function validateFrameRefR314(frame:R314FrameRef):R314PacketIssue[]{
 const issues:R314PacketIssue[]=[];
 if(!text(frame.id))issues.push({code:'FRAME_ID_MISSING',message:'frame.id is required',blocking:true});
 if(!text(frame.revision))issues.push({code:'FRAME_REVISION_MISSING',message:'frame.revision is required',blocking:true});
 if(frame.kind==='CANONICAL'&&frame.parentId!==null)issues.push({code:'FRAME_CANONICAL_PARENT',message:'canonical frame cannot declare a parent',blocking:true});
 if(frame.kind!=='CANONICAL'&&!text(frame.parentId||''))issues.push({code:'FRAME_PARENT_MISSING',message:'non-canonical frame must declare a parent',blocking:true});
 if(frame.parentId===frame.id)issues.push({code:'FRAME_SELF_PARENT',message:'frame cannot parent itself',blocking:true});
 return issues;
}

export function validateUnitRefR314(unit:R314UnitRef):R314PacketIssue[]{
 const issues:R314PacketIssue[]=[];
 if(!text(unit.symbol))issues.push({code:'UNIT_SYMBOL_MISSING',message:'unit symbol is required',blocking:true});
 if(!finite(unit.scaleToSI)||unit.scaleToSI<=0)issues.push({code:'UNIT_SCALE_INVALID',message:'unit scaleToSI must be finite and positive',blocking:true});
 if(unit.offsetToSI!==undefined&&!finite(unit.offsetToSI))issues.push({code:'UNIT_OFFSET_INVALID',message:'unit offsetToSI must be finite when supplied',blocking:true});
 return issues;
}

export function validateSynchronousPacketR314(packet:R314SynchronousPacket):R314PacketValidation{
 const issues:R314PacketIssue[]=[];
 if(packet?.schema!==R314_SYNCHRONOUS_PACKET_SCHEMA)issues.push({code:'SCHEMA_MISMATCH',message:'packet schema is not R314 synchronous packet',blocking:true});
 if(!text(packet?.packetId||''))issues.push({code:'PACKET_ID_MISSING',message:'packetId is required',blocking:true});
 if(!text(packet?.stateVersion||''))issues.push({code:'STATE_VERSION_MISSING',message:'stateVersion is required',blocking:true});
 if(!Number.isSafeInteger(packet?.sequence)||packet.sequence<0)issues.push({code:'SEQUENCE_INVALID',message:'sequence must be a non-negative safe integer',blocking:true});
 issues.push(...validateUnitRefR314(packet.unit),...validateFrameRefR314(packet.frame),...validateClockVectorR314(packet.clocks));
 if(!text(packet.provenance?.sourceId||''))issues.push({code:'PROVENANCE_SOURCE_MISSING',message:'provenance.sourceId is required',blocking:true});
 if(packet.uncertainty.kind!=='NONE'&&packet.uncertainty.value===null&&packet.uncertainty.lower===null&&packet.uncertainty.upper===null)issues.push({code:'UNCERTAINTY_VALUE_MISSING',message:'non-NONE uncertainty requires a value or interval',blocking:true});
 if(packet.proof.canonicalAdmission!==false)issues.push({code:'CANON_ADMISSION_LEAK',message:'synchronous packets cannot self-assert CanonState admission',blocking:true});
 return{valid:issues.every(issue=>!issue.blocking),issues};
}

function stableSerializeR314(value:unknown):string{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return`[${value.map(stableSerializeR314).join(',')}]`;
 return`{${Object.keys(value as Record<string,unknown>).sort().map(key=>`${JSON.stringify(key)}:${stableSerializeR314((value as Record<string,unknown>)[key])}`).join(',')}}`;
}

export function packetDigestR314(packet:R314SynchronousPacket){
 const source=stableSerializeR314(packet);
 let hash=0x811c9dc5;
 for(let i=0;i<source.length;i++){hash^=source.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0}
 return`r314-${hash.toString(16).padStart(8,'0')}`;
}

export function createSynchronousPacketR314<T>(input:Omit<R314SynchronousPacket<T>,'schema'>):R314SynchronousPacket<T>{
 const packet:R314SynchronousPacket<T>={schema:R314_SYNCHRONOUS_PACKET_SCHEMA,...input};
 const checked=validateSynchronousPacketR314(packet);
 if(!checked.valid)throw new Error(`R314 synchronous packet rejected: ${checked.issues.filter(x=>x.blocking).map(x=>x.code).join(',')}`);
 return packet;
}

export function comparePacketOrderR314(a:R314SynchronousPacket,b:R314SynchronousPacket){
 if(a.stateVersion!==b.stateVersion)return a.stateVersion.localeCompare(b.stateVersion);
 if(a.clocks.logical!==b.clocks.logical)return a.clocks.logical-b.clocks.logical;
 if(a.sequence!==b.sequence)return a.sequence-b.sequence;
 return a.clocks.monotonicMs-b.clocks.monotonicMs;
}

export const R314_SYNCHRONOUS_PACKET_BOUNDARY='This is a software synchronization/provenance contract. It does not turn derived values into measurements, does not validate scientific claims, does not create physical dimensions, and does not admit CanonState.' as const;
