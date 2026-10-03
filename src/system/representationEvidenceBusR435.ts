import type {UniversalEvidencePacketR152} from '../universalTruthEnvelopeR152';

export const R435_EVIDENCE_EVENT='omega-r435-runtime-evidence';
export const R435_EVIDENCE_SCHEMA='OMEGA_RUNTIME_REPRESENTATION_EVIDENCE_R435' as const;
export const R435_EVIDENCE_BOUNDARY='R435 browser evidence is populated only from data actually returned to the current browser runtime. It is volatile, source-labelled and non-canonical. A returned runtime receipt may prove that a runtime/release artifact was returned; it does not become empirical scientific evidence, physical measurement or CanonState admission.';

let current:UniversalEvidencePacketR152[]=[];

const unique=(rows:UniversalEvidencePacketR152[])=>{
 const by=new Map<string,UniversalEvidencePacketR152>();
 for(const row of rows)if(row?.id)by.set(String(row.id),row);
 return[...by.values()].slice(-128);
};

export function publishRuntimeEvidenceR435(rows:UniversalEvidencePacketR152[]){
 current=unique(rows.filter(Boolean));
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(R435_EVIDENCE_EVENT,{detail:{schema:R435_EVIDENCE_SCHEMA,packets:current,boundary:R435_EVIDENCE_BOUNDARY}}));
 return readRuntimeEvidenceR435();
}
export function mergeRuntimeEvidenceR435(rows:UniversalEvidencePacketR152[]){
 return publishRuntimeEvidenceR435([...current,...rows]);
}
export function readRuntimeEvidenceR435(){return current.slice()}
export function clearRuntimeEvidenceR435(){return publishRuntimeEvidenceR435([])}

export function runtimeReceiptEvidenceR435(args:{
 id:string;source:string;sourceFamily:string;claim:string;observedAt?:string;verified:boolean;hash?:string|null;datasetId?:string;field?:string;
}):UniversalEvidencePacketR152{
 return{
  id:String(args.id),kind:'SOURCE',source:String(args.source),sourceFamily:String(args.sourceFamily),
  observedAt:String(args.observedAt||new Date().toISOString()),frame:{space:'OMEGAV6_HOSTED_RUNTIME',time:'RETURNED_RUNTIME_RECEIPT'},
  claim:String(args.claim),verified:args.verified===true,authority:'RUNTIME_RECEIPT',hash:args.hash||undefined,
  datasetId:args.datasetId,field:args.field
 };
}
