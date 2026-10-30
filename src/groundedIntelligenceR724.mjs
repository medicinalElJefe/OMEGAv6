// R724: executable, bounded, source-grounded evidence composition for OMEGA7 SAI Lab.
// Evidence is browser-local R28 memory, not authenticated authorship or LLM inference.
import {queryVerifiedMemoryR723,inspectVerifiedMemoryR723} from './verifiedMemoryRecallR723.mjs';
import {digestMemoryR722} from './portableMemoryRecoveryR722.mjs';

export const GROUNDED_INTELLIGENCE_SCHEMA_R724='OMEGA_LOCAL_GROUNDED_INTELLIGENCE_R724_V1';
const STOP=new Set(['a','an','and','are','about','can','did','do','does','for','from','how','i','in','is','me','my','of','on','or','our','please','record','recorded','remember','recall','saved','show','tell','the','to','was','we','were','what','when','where','which','who','why','with','you']);
export function evidenceTermsR724(question){
 if(typeof question!=='string'||question.length>160)throw Error('R724 question length refused');
 const terms=[...new Set((question.normalize('NFKC').toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]+/gu)||[]).filter(x=>!STOP.has(x)))];
 if(!terms.length||terms.length>12)throw Error('R724 bounded evidence terms refused');
 return terms.join(' ');
}

export async function composeGroundedIntelligenceR724(rows,question){
 const query=evidenceTermsR724(question);
 const matches=await queryVerifiedMemoryR723(rows,query,3); // Verifies ALL rows, including nonmatches.
 const sources=[];
 for(const hit of matches.results){
  const source=await inspectVerifiedMemoryR723(rows,hit.id,hit.sha256,hit.at);
  sources.push({id:source.id,at:source.at,sha256:source.sha256,address:source.address,
   stateId:source.stateId,decision:source.decision,note:source.note,metrics:source.metrics,
   matchedFields:hit.matchedFields,score:hit.score});
 }
 const status=sources.length?'GROUNDED_LOCAL_EVIDENCE':'NO_MATCHING_VERIFIED_EVIDENCE';
 // Only source notes may appear as asserted statements. No generated facts or model claims.
 const statements=sources.map(source=>({sourceId:source.id,sourceDigest:source.sha256,
  text:source.note||'No source note was recorded for this snapshot.'}));
 const packet={schema:GROUNDED_INTELLIGENCE_SCHEMA_R724,question:question.trim(),query,
  status,totalMatches:matches.total,verifiedCount:matches.verifiedCount,
  sources,statements,truthClass:'DETERMINISTIC_BROWSER_LOCAL_EVIDENCE_NOT_MODEL_INFERENCE',
  canonicalMutation:false,providerInference:false,authenticatedSource:false};
 return {...packet,packetSha256:await digestMemoryR722(JSON.stringify(packet))};
}

export async function revalidateGroundedIntelligenceR724(rows,packet){
 if(!packet||packet.schema!==GROUNDED_INTELLIGENCE_SCHEMA_R724||typeof packet.packetSha256!=='string')
  throw Error('R724 evidence packet schema refused');
 const {packetSha256,...unsigned}=packet;
 if(await digestMemoryR722(JSON.stringify(unsigned))!==packetSha256)
  throw Error('R724 evidence packet digest mismatch');
 const fresh=await composeGroundedIntelligenceR724(rows,packet.question);
 if(fresh.packetSha256!==packet.packetSha256)throw Error('R724 memory evidence changed; recompute before use');
 return fresh;
}
