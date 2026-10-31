// R738: restore an exported source exchange only against a freshly recomputed witness.
// Imported JSON is untrusted; it never becomes source authority or mutates CanonState.
import {computeSourcePhaseExchangeR737,SOURCE_PHASE_EXCHANGE_SCHEMA_R737} from './sourcePhaseExchangeR737.mjs';
import {computeSourcePhasePortraitR736} from './sourcePhasePortraitR736.mjs';
export const SOURCE_EXCHANGE_RECOVERY_SCHEMA_R738='OMEGA_SOURCE_EXCHANGE_RECOVERY_R738_V1';
export function verifySourceExchangeRecoveryR738(text,field){
 if(typeof text!=='string'||text.length>262144||text.length===0)throw Error('R738 export size refused');
 let imported;
 try{imported=JSON.parse(text)}catch{throw Error('R738 invalid JSON refused')}
 if(!imported||typeof imported!=='object'||Array.isArray(imported)||imported.schema!==SOURCE_PHASE_EXCHANGE_SCHEMA_R737)
  throw Error('R738 unknown exchange schema refused');
 const {start,xChannel,yChannel,pointCount}=imported;
 if(!Number.isSafeInteger(start)||start<0||start>=20736||!Number.isSafeInteger(pointCount)||pointCount<1||pointCount>256||
    typeof xChannel!=='string'||typeof yChannel!=='string')
  throw Error('R738 invalid source witness refused');
 const portrait=computeSourcePhasePortraitR736(field,start,xChannel,yChannel,pointCount);
 const expected=computeSourcePhaseExchangeR737(portrait);
 // Compare every source address and computed exchange, not only the summary or schema.
 // JSON stringification also rejects tampered field order as an intentional strict export contract.
 if(JSON.stringify(imported)!==JSON.stringify(expected))
  throw Error('R738 imported exchange differs from current computed source');
 return {schema:SOURCE_EXCHANGE_RECOVERY_SCHEMA_R738,verified:true,start,xChannel,yChannel,
  edgeCount:expected.edgeCount,cyclePeriod:expected.cyclePeriod,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  boundary:'Recovered export matched a fresh local source-model execution; not external provenance, historical donor parity or physical observation.'};
}
