import fs from 'node:fs';
import path from 'node:path';
import {compileProofAdmissionR295,PROOF_ADMISSION_BOUNDARY_R295} from '../src/proof/proofAdmissionRuntimeR295.js';

const INPUT=process.env.OMEGA_R295_RETURN_RECONCILIATION||'';
const BASE_SHA=process.env.OMEGA_R295_BASE_SHA||'';
const OUTPUT=process.env.OMEGA_R295_ADMISSION_PACKET||'artifacts/omega-r295-proof-admission-proposals.json';
const APPLY=process.env.OMEGA_R295_APPLY==='1';
if(!INPUT){console.log(JSON.stringify({status:'OBSERVE',reason:'OMEGA_R295_RETURN_RECONCILIATION not supplied',boundary:PROOF_ADMISSION_BOUNDARY_R295}));process.exit(0)}
if(!fs.existsSync(INPUT))throw new Error(`R295 return reconciliation not found: ${INPUT}`);
const raw=JSON.parse(fs.readFileSync(INPUT,'utf8'));
const candidate=raw?.proofReturn||raw?.directive||raw;
if(!candidate||!Array.isArray(candidate.pendingAdmission))throw new Error('R295 requires an R294 proofReturn/reconciliation packet containing pendingAdmission');
const proofReturn={...candidate,bound:candidate.bound!==false,domainId:String(candidate.domainId||'UNBOUND'),claimId:String(candidate.claimId||'UNBOUND'),proofFingerprint:String(candidate.proofFingerprint||'R292-UNBOUND'),evolutionFingerprint:String(candidate.evolutionFingerprint||'R293-UNBOUND'),fingerprint:String(candidate.fingerprint||candidate.reconciliationFingerprint||'R294-UNBOUND')};
const admission=compileProofAdmissionR295({proofReturn,baseSha:BASE_SHA});
const packet={schema:'OMEGA_PROOF_ADMISSION_DIRECTIVE_R295',generatedAt:new Date().toISOString(),sourcePacket:INPUT,requestedBaseSha:BASE_SHA||null,admission};
if(APPLY){fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});fs.writeFileSync(OUTPUT,JSON.stringify(packet,null,2)+'\n','utf8')}
console.log(JSON.stringify({status:APPLY?'WRITTEN':'PROPOSE',output:APPLY?OUTPUT:null,packet},null,2));
