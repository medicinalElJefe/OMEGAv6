import fs from 'node:fs';
import path from 'node:path';
import {compileProofEvolutionR293} from '../src/proof/proofEvolutionRuntimeR293.js';
import {compileProofReturnR294,PROOF_RETURN_RECEIPT_SCHEMA_R294} from '../src/proof/proofReturnRuntimeR294.js';

const INPUT=process.env.OMEGA_R294_PROOF_PACKET||'';
const RETURNS=process.env.OMEGA_R294_RETURN_PACKET||'';
const OUTPUT=process.env.OMEGA_R294_RECONCILIATION||'artifacts/omega-r294-proof-return-reconciliation.json';
const APPLY=process.env.OMEGA_R294_APPLY==='1';
if(!INPUT){console.log(JSON.stringify({status:'OBSERVE',reason:'OMEGA_R294_PROOF_PACKET not supplied',boundary:'R294 never invents proof or returned evidence.'}));process.exit(0)}
if(!fs.existsSync(INPUT))throw new Error(`R294 proof packet not found: ${INPUT}`);
const raw=JSON.parse(fs.readFileSync(INPUT,'utf8'));
const candidate=raw?.proofCarry||raw;
if(candidate?.schema!=='OMEGA_PROOF_CARRY_R292')throw new Error('R294 requires an OMEGA_PROOF_CARRY_R292 packet or export containing proofCarry');
const supportScore=Number(candidate?.metrics?.supportScore??candidate?.supportScore??1),scarPressure=Number(candidate?.metrics?.scarPressure??candidate?.scarPressure??0);
const proofPacket={...candidate,bound:true,supportScore,routingSupport:.35+.65*Math.max(0,Math.min(1,supportScore)),scarPressure};
const evolution=compileProofEvolutionR293(proofPacket);
let receipts=[];
if(RETURNS){
 if(!fs.existsSync(RETURNS))throw new Error(`R294 return packet not found: ${RETURNS}`);
 const returned=JSON.parse(fs.readFileSync(RETURNS,'utf8'));
 receipts=Array.isArray(returned)?returned:Array.isArray(returned?.receipts)?returned.receipts:returned?.schema===PROOF_RETURN_RECEIPT_SCHEMA_R294?[returned]:[];
 if(!receipts.length&&returned)throw new Error('R294 return packet contains no recognized receipts');
}
const reconciliation=compileProofReturnR294({evolution,receipts});
const directive={schema:'OMEGA_PROOF_RETURN_DIRECTIVE_R294',generatedAt:new Date().toISOString(),sourcePacket:INPUT,returnPacket:RETURNS||null,proofFingerprint:reconciliation.proofFingerprint,evolutionFingerprint:reconciliation.evolutionFingerprint,reconciliationFingerprint:reconciliation.fingerprint,claimId:reconciliation.claimId,claimLabel:reconciliation.claimLabel,claimStatus:reconciliation.claimStatus,underlyingUnresolvedCount:reconciliation.underlyingUnresolvedCount,readyCount:reconciliation.readyCount,waitingCount:reconciliation.waitingCount,returnedPendingAdmission:reconciliation.returnedPendingAdmission,closureCandidates:reconciliation.closureCandidates,truthClosureCount:reconciliation.truthClosureCount,unverifiedCount:reconciliation.unverifiedCount,staleCount:reconciliation.staleCount,rejectedCount:reconciliation.rejectedCount,readyFrontier:reconciliation.readyFrontier,pendingAdmission:reconciliation.pendingAdmission,authority:reconciliation.authority,boundary:reconciliation.boundary};
if(APPLY){fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});fs.writeFileSync(OUTPUT,JSON.stringify(directive,null,2)+'\n','utf8')}
console.log(JSON.stringify({status:APPLY?'WRITTEN':'PROPOSE',output:APPLY?OUTPUT:null,directive},null,2));
