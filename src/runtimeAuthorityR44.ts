import {corpusState,decodeAddress,evaluateCorpusModes} from './corpusRuntime';
import {evaluateCanonAuthorityStack} from './allModesAuthority';
import {sourceBackedModeSummary} from './sourceBackedModeRuntimeR21';
import {sha256Hex} from './saiB059Runtime';

export const R44_TRANSITION_SEQUENCE=['CARRY','CONSTRUCT','PRUNE','TURN','ESCALATE','SCAR','TRANSLATE','PROVE','FORECAST','LEDGER'] as const;
export const R44_LEDGER_EVENT='omega-runtime-ledger-r44';
export const R44_LEDGER_KEY='omega.v6.runtime.ledger.r44';
export const R44_REVISION_KEY='omega.v6.runtime.revision.r44';

export type R44TransitionStage=typeof R44_TRANSITION_SEQUENCE[number];
export type R44MutationClass='SOURCE_ADMITTED'|'SOURCE_NAVIGATION'|'OPERATOR_SELECTED';
export type R44RuntimeReceipt={
 schema:'OMEGA_RUNTIME_TRANSACTION_R44';
 revision:number;
 at:string;
 sourceSurface:string;
 cause:string;
 mutationClass:R44MutationClass;
 fromAddress:number;
 toAddress:number;
 fromStateId:number;
 toStateId:number;
 selectedOperator:'CONSTRUCT'|'PRUNE'|'TURN'|'ESCALATE';
 rejectedOperators:string[];
 sequence:readonly R44TransitionStage[];
 edge:string;
 beforeHash:string;
 afterHash:string;
 previousLedgerHash:string;
 ledgerHash:string;
 scar:{before:number;after:number;delta:number};
 translate:{from:ReturnType<typeof decodeAddress>;to:ReturnType<typeof decodeAddress>};
 proof:{status:'PASS';internalOnly:true;externalEvidenceAdded:false;sourceVersion:string};
 forecast:{candidateAddress:number;candidateStateId:number;decision:string};
 modes:{activeProjections:number;canonLenses:number;sourceApplied:number;missingInputContracts:number};
 boundary:string;
};

const clampAddress=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
function canonical(value:any):string{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;
 return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}
function packet(r:any){return{address:r.address,stateId:r.stateId,coordinates:r.coordinates,decision:r.metrics.decision,mode188:r.metrics.mode188,continuity:r.metrics.continuity,plasticity:r.metrics.plasticity,contradiction:r.metrics.contradiction,burden:r.metrics.burden,scar:r.metrics.scar,evidence:r.metrics.evidence,pscGate:r.psc.gate,dataNext:r.autoPing.dataNext,sourceVersion:r.source.version}}
function selectedOperator(r:any):R44RuntimeReceipt['selectedOperator']{
 const mode=String(r.metrics.mode188||'').toUpperCase(),decision=String(r.metrics.decision||'').toUpperCase();
 if(mode==='PRUNE')return'PRUNE';
 if(decision==='TURN')return'TURN';
 if(decision==='ESCALATE')return'ESCALATE';
 return'CONSTRUCT';
}
function knownEdges(r:any){return new Map<number,string>([['AUTO-PING',r.autoPing.dataNext],['NEXT',r.autoPing.next],['PREVIOUS',r.autoPing.previous],['PHASE+',r.autoPing.phasePlus],['REGULATION+',r.autoPing.regulationPlus],['LAYER+',r.autoPing.layerPlus],['HOURGLASS',r.autoPing.hourglassMirror],['OPPOSITE',r.autoPing.oppositeDomain],['MODE188+',r.autoPing.mode188Plus]].map(([name,address])=>[Number(address),String(name)]))}
function readRows():R44RuntimeReceipt[]{
 try{const x=JSON.parse(localStorage.getItem(R44_LEDGER_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}
}
function nextRevision(){
 try{const n=Math.max(0,Number(localStorage.getItem(R44_REVISION_KEY)||0))+1;localStorage.setItem(R44_REVISION_KEY,String(n));return n}catch{return Date.now()}
}
function persist(receipt:R44RuntimeReceipt){
 try{localStorage.setItem(R44_LEDGER_KEY,JSON.stringify([...readRows(),receipt].slice(-256)))}catch{}
 try{window.dispatchEvent(new CustomEvent(R44_LEDGER_EVENT,{detail:receipt}))}catch{}
}

export function runtimeLedgerR44(){return readRows()}
export function latestRuntimeReceiptR44(){const rows=readRows();return rows[rows.length-1]||null}

export async function recordRuntimeMutationR44(fromInput:number,toInput:number,sourceSurface='UNKNOWN',cause='ADDRESS_COMMIT'):Promise<R44RuntimeReceipt>{
 const fromAddress=clampAddress(fromInput),toAddress=clampAddress(toInput),before=corpusState(fromAddress),after=corpusState(toAddress),edges=knownEdges(before),edge=edges.get(toAddress)||'DIRECT_ADDRESS',mutationClass:R44MutationClass=toAddress===before.autoPing.dataNext?'SOURCE_ADMITTED':edges.has(toAddress)?'SOURCE_NAVIGATION':'OPERATOR_SELECTED',operator=selectedOperator(before),sourceModes=sourceBackedModeSummary(before),catalog=evaluateCorpusModes(before),canon=evaluateCanonAuthorityStack(before),rows=readRows(),previousLedgerHash=rows.at(-1)?.ledgerHash||'GENESIS';
 const beforeHash=await sha256Hex(canonical(packet(before))),afterHash=await sha256Hex(canonical(packet(after))),revision=nextRevision(),forecast=corpusState(after.autoPing.dataNext),body={schema:'OMEGA_RUNTIME_TRANSACTION_R44',revision,at:new Date().toISOString(),sourceSurface,cause,mutationClass,fromAddress,toAddress,fromStateId:before.stateId,toStateId:after.stateId,selectedOperator:operator,rejectedOperators:['CONSTRUCT','PRUNE','TURN','ESCALATE'].filter(x=>x!==operator),sequence:R44_TRANSITION_SEQUENCE,edge,beforeHash,afterHash,previousLedgerHash,scar:{before:Number(before.metrics.scar),after:Number(after.metrics.scar),delta:Number(after.metrics.scar)-Number(before.metrics.scar)},translate:{from:decodeAddress(fromAddress),to:decodeAddress(toAddress)},proof:{status:'PASS' as const,internalOnly:true as const,externalEvidenceAdded:false as const,sourceVersion:String(before.source.version)},forecast:{candidateAddress:after.autoPing.dataNext,candidateStateId:forecast.stateId,decision:String(forecast.metrics.decision)},modes:{activeProjections:catalog.count,canonLenses:canon.length,sourceApplied:sourceModes.appliedCount,missingInputContracts:sourceModes.gatedCount},boundary:'This SHA-bound ledger proves an internal browser runtime mutation over the canonical embedded packet. Direct selection is labeled OPERATOR_SELECTED; only autoPing.dataNext is SOURCE_ADMITTED. No physical event, external evidence, provider output or native-device action is inferred.'};
 const ledgerHash=await sha256Hex(canonical(body)),receipt:R44RuntimeReceipt={...body,ledgerHash};persist(receipt);return receipt;
}
