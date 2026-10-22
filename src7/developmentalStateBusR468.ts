import {
  verifyCanonicalDevelopmentR467,
  type R467DevelopmentalRecord
} from './canonicalDevelopmentalLedgerR467';

export const R468_SCHEMA='OMEGA7_DEVELOPMENTAL_STATE_BUS_R468' as const;
export const R468_REVISION='R468' as const;
export const R468_STORAGE_KEY='omega7.developmental-ledger.r468';
export const R468_EVENT='omega7-developmental-state-changed';

export type R468Snapshot={
  schema:typeof R468_SCHEMA;
  revision:typeof R468_REVISION;
  status:'EMPTY'|'VALID'|'INVALID';
  recordCount:number;
  headHash:string|null;
  headState:string|null;
  headDecision:'STAY'|'TURN'|'ESCALATE'|null;
  promotionAllowed:boolean;
  hardVetoes:readonly string[];
  failures:readonly string[];
  canonicalAdmissionAuthority:'R125';
  canonicalMutation:false;
};

const memory:{records:R467DevelopmentalRecord[]}={records:[]};

function storage(){
  try{return typeof globalThis!=='undefined'&&'localStorage'in globalThis?(globalThis as any).localStorage:null}catch{return null}
}

function parseStored():R467DevelopmentalRecord[]{
  const s=storage();
  if(!s)return [...memory.records];
  try{
    const raw=s.getItem(R468_STORAGE_KEY);
    if(!raw)return [];
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[];
  }catch{return []}
}

function writeStored(records:readonly R467DevelopmentalRecord[]){
  memory.records=[...records];
  const s=storage();
  if(s)s.setItem(R468_STORAGE_KEY,JSON.stringify(records));
}

function emit(snapshot:R468Snapshot){
  try{
    if(typeof globalThis!=='undefined'&&'dispatchEvent'in globalThis&&typeof CustomEvent!=='undefined'){
      globalThis.dispatchEvent(new CustomEvent(R468_EVENT,{detail:snapshot}));
    }
  }catch{}
}

export async function developmentalStateBusSnapshotR468():Promise<R468Snapshot>{
  const records=parseStored();
  if(!records.length)return Object.freeze({
    schema:R468_SCHEMA,revision:R468_REVISION,status:'EMPTY',recordCount:0,headHash:null,headState:null,
    headDecision:null,promotionAllowed:false,hardVetoes:Object.freeze([]),failures:Object.freeze([]),
    canonicalAdmissionAuthority:'R125',canonicalMutation:false
  });
  const verified=await verifyCanonicalDevelopmentR467(records);
  const head=records.at(-1)!;
  return Object.freeze({
    schema:R468_SCHEMA,revision:R468_REVISION,status:verified.valid?'VALID':'INVALID',
    recordCount:records.length,headHash:verified.headHash,headState:verified.headState,
    headDecision:verified.valid?head.decision:null,
    promotionAllowed:verified.valid&&head.promotionAllowed===true,
    hardVetoes:Object.freeze(verified.valid?[...head.hardVetoes]:[]),
    failures:Object.freeze([...verified.failures]),
    canonicalAdmissionAuthority:'R125',canonicalMutation:false
  });
}

export async function publishDevelopmentalRecordR468(record:R467DevelopmentalRecord):Promise<R468Snapshot>{
  const records=parseStored();
  const next=[...records,record];
  const verified=await verifyCanonicalDevelopmentR467(next);
  if(!verified.valid)throw new Error('R468 rejected invalid developmental lineage: '+verified.failures.join(','));
  writeStored(next);
  const snapshot=await developmentalStateBusSnapshotR468();
  emit(snapshot);
  return snapshot;
}

export async function replaceDevelopmentalHistoryR468(records:readonly R467DevelopmentalRecord[]):Promise<R468Snapshot>{
  const verified=await verifyCanonicalDevelopmentR467(records);
  if(!verified.valid)throw new Error('R468 rejected invalid developmental history: '+verified.failures.join(','));
  writeStored(records);
  const snapshot=await developmentalStateBusSnapshotR468();
  emit(snapshot);
  return snapshot;
}

export async function clearDevelopmentalHistoryR468():Promise<R468Snapshot>{
  writeStored([]);
  const snapshot=await developmentalStateBusSnapshotR468();
  emit(snapshot);
  return snapshot;
}

export const R468_AUTHORITY=Object.freeze({
  role:'READ_WRITE_DERIVED_DEVELOPMENTAL_HISTORY',
  source:'R467_VERIFIED_RECORDS_ONLY',
  canonicalAdmission:'R125',
  sourcePromotion:'UNCHANGED',
  deploymentAuthority:'NONE',
  executionAuthority:'NONE',
  physicalPrimitiveClaim:false,
  canonicalMutation:false
});
