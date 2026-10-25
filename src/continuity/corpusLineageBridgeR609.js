// R609: connect historical conservation inventory to the R608 executable proof substrate.
// Report is a read-only lineage reconciliation, not a recovered executor or production attestation.
import {sha256R654} from './provenFrameR654.js';
const allowed=new Set(['SOURCE_PRESENT','SOURCE_PRESENT_DONOR_REQUIRED','HISTORICAL_RECONCILIATION_REQUIRED','HOST_PROOF_REQUIRED','VISUAL_FIDELITY_PROOF_REQUIRED','LIVE_SOURCE_PROOF_REQUIRED','END_TO_END_PROOF_REQUIRED','HOST_ACTION_PROOF_REQUIRED','SOURCE_REQUIRED','UNVERIFIED','STRICT_RECEIPTS_REQUIRED','DEPLOYMENT_PROOF_REQUIRED','APPLICATION_PARITY_PROOF_REQUIRED']);
const fingerprint=v=>sha256R654(v);
export function reconcileCorpusLineageR609(ledger,{sourceMap={}}={}){
 if(!ledger||ledger.schema!=='OMEGA_YEAR_CORPUS_CAPABILITY_CONSERVATION_R650'||ledger.policy?.admission!=='SOURCE_AND_RUNTIME_AND_PRODUCTION_PROOF'||ledger.policy?.no_synthetic_legacy_recovery!==true||!Array.isArray(ledger.families))throw Error('invalid conservation authority');
 if(!sourceMap||typeof sourceMap!=='object'||Array.isArray(sourceMap))throw Error('invalid source map');
 const seen=new Set(),families=[];
 for(const family of ledger.families){
  if(!family||typeof family.id!=='string'||!family.id||seen.has(family.id))throw Error('duplicate or missing family id');
  seen.add(family.id);
  if(!allowed.has(family.truthClass)||!Array.isArray(family.sourceHints)||!Array.isArray(family.missingEvidence)||typeof family.productionProved!=='boolean')throw Error('invalid truth classification');
  if(family.productionProved&&!family.productionProof?.deploymentSha)throw Error('unproven production claim');
  const evidence=family.sourceHints.map(path=>{
   if(typeof path!=='string'||!path||path.startsWith('/')||path.includes('..'))throw Error('invalid source hint');
   const record=Object.hasOwn(sourceMap,path)?sourceMap[path]:null;
   if(record!==null&&(!record||typeof record.sha256!=='string'||!/^[a-f0-9]{64}$/i.test(record.sha256)))throw Error('source proof requires full sha256');
   return {path,sourceStatus:record?'DECLARED_HASH_NOT_BYTE_VERIFIED':'NOT_VERIFIED',sha256:record?.sha256??null};
  });
  families.push({id:family.id,description:String(family.description??''),truthClass:family.truthClass,sourceEvidence:evidence,productionProved:family.productionProved,missingEvidence:[...family.missingEvidence],execution:'NOT_EVALUATED',admission:'HELD_SOURCE_IS_NOT_EXECUTION'});
 }
 const record={schema:'OMEGA_CORPUS_LINEAGE_BRIDGE_R609',truthClass:'HISTORICAL_CONSERVATION_INVENTORY_NOT_EXECUTION',authority:'READ_ONLY_NO_CANON_MUTATION',ledgerSha256:fingerprint(ledger),families,summary:{families:families.length,productionProved:families.filter(f=>f.productionProved).length,held:families.filter(f=>!f.productionProved).length},limitations:['SOURCE_HINT_NOT_FILE_BYTES','NO_HISTORICAL_PARITY_ASSERTED','NO_EXECUTION_OR_PRODUCTION_AUTHORITY']};
 return {...record,fingerprint:fingerprint(record)};
}
export function verifyCorpusLineageR609(ledger,report,options={}){
 try{const replay=reconcileCorpusLineageR609(ledger,options);return {valid:fingerprint(replay)===fingerprint(report)&&report.fingerprint===replay.fingerprint,truthClass:'LOCAL_DETERMINISTIC_REPLAY'}}catch{return {valid:false}}
}
