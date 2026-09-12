import fs from 'node:fs';
import path from 'node:path';
import {compileProofEvolutionR293} from '../src/proof/proofEvolutionRuntimeR293.js';

const INPUT=process.env.OMEGA_R293_PROOF_PACKET||'';
const OUTPUT=process.env.OMEGA_R293_PROOF_DIRECTIVE||'artifacts/omega-r293-proof-evolution.json';
const APPLY=process.env.OMEGA_R293_APPLY==='1';
if(!INPUT){console.log(JSON.stringify({status:'OBSERVE',reason:'OMEGA_R293_PROOF_PACKET not supplied',boundary:'R293 never invents a proof context.'}));process.exit(0)}
if(!fs.existsSync(INPUT))throw new Error(`R293 proof packet not found: ${INPUT}`);
const raw=JSON.parse(fs.readFileSync(INPUT,'utf8'));
const candidate=raw?.proofCarry||raw;
if(candidate?.schema!=='OMEGA_PROOF_CARRY_R292')throw new Error('R293 requires an OMEGA_PROOF_CARRY_R292 packet or an export containing proofCarry');
const supportScore=Number(candidate?.metrics?.supportScore??candidate?.supportScore??1);
const scarPressure=Number(candidate?.metrics?.scarPressure??candidate?.scarPressure??0);
const packet={...candidate,bound:true,supportScore,routingSupport:.35+.65*Math.max(0,Math.min(1,supportScore)),scarPressure};
const evolution=compileProofEvolutionR293(packet);
const directive={schema:'OMEGA_PROOF_EVOLUTION_DIRECTIVE_R293',generatedAt:new Date().toISOString(),sourcePacket:INPUT,proofFingerprint:evolution.proofFingerprint,evolutionFingerprint:evolution.fingerprint,claimId:evolution.claimId,claimLabel:evolution.claimLabel,claimStatus:evolution.claimStatus,promotionEligible:evolution.promotionEligible,supportScore:evolution.supportScore,scarPressure:evolution.scarPressure,operationCounts:evolution.operationCounts,frontier:evolution.frontier,authority:evolution.authority,boundary:evolution.boundary};
if(APPLY){fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});fs.writeFileSync(OUTPUT,JSON.stringify(directive,null,2)+'\n','utf8')}
console.log(JSON.stringify({status:APPLY?'WRITTEN':'PROPOSE',output:APPLY?OUTPUT:null,directive},null,2));
