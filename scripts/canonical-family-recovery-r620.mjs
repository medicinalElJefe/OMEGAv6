import {readFile} from 'node:fs/promises';
const file=new URL('../canon/year-corpus-capability-conservation-r650.json',import.meta.url);
export async function auditCanonicalFamiliesR620(ledgerOverride=null){
 const ledger=ledgerOverride??JSON.parse(await readFile(file,'utf8'));
 if(ledger.schema!=='OMEGA_YEAR_CORPUS_CAPABILITY_CONSERVATION_R650'||!Array.isArray(ledger.families))throw Error('Unsupported capability conservation ledger');
 const ids=new Set(),duplicateIds=[],families=[];
 for(const f of ledger.families){
  if(!f.id||ids.has(f.id))duplicateIds.push(f.id||'(missing)');
  ids.add(f.id);
  const missingEvidence=Array.isArray(f.missingEvidence)?f.missingEvidence:[];
  const sourceHints=Array.isArray(f.sourceHints)?f.sourceHints:[];
  families.push({id:f.id,truthClass:f.truthClass,sourceHints,
   sourcePresent:false,sourceHintsPresent:sourceHints.length>0,
   claimedProductionProof:f.productionProved===true,missingEvidence,
   status:f.productionProved===true?'UNVERIFIED_ATTESTATION':'RECOVERY_INCOMPLETE'});
 }
 return {schema:'OMEGA_CANONICAL_FAMILY_RECOVERY_REPORT_R620',authority:ledger.schema,
  familyCount:families.length,duplicateIds,productionVerifiedByThisReport:0,
  sourceHintCount:families.filter(f=>f.sourceHintsPresent).length,
  unresolved:families.length,
  families,boundary:'Source hints do not prove file presence; in-ledger production flags are not authenticated target runtime receipts.'};
}
if(process.argv[1]?.endsWith('canonical-family-recovery-r620.mjs'))console.log(JSON.stringify(await auditCanonicalFamiliesR620(),null,2));
