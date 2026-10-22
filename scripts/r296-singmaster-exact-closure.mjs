import fs from 'node:fs';
import crypto from 'node:crypto';
import {compileSingmasterExactClosureR296,compileSingmasterNoGoAtlasR296,SINGMASTER_EXACT_BASELINE_R296} from '../src/proof/singmasterExactClosureR296.js';

const intEnv=(name,fallback)=>{const raw=process.env[name];if(raw==null||raw==='')return fallback;const value=Number(raw);if(!Number.isSafeInteger(value))throw new Error(`${name} must be a safe integer`);return value};
const maxN=intEnv('OMEGA_R296_MAX_N',SINGMASTER_EXACT_BASELINE_R296.maxN);
const maxK=intEnv('OMEGA_R296_MAX_K',SINGMASTER_EXACT_BASELINE_R296.maxK);
const maxCells=intEnv('OMEGA_R296_MAX_CELLS',SINGMASTER_EXACT_BASELINE_R296.maxCells);
const output=String(process.env.OMEGA_R296_OUTPUT||'').trim();

const certificate=compileSingmasterExactClosureR296({maxN,maxK,maxCells});
const noGoAtlas=compileSingmasterNoGoAtlasR296(certificate);
const canonical=JSON.stringify({certificate,noGoAtlas});
const evidenceDigest=`sha256:${crypto.createHash('sha256').update(canonical).digest('hex')}`;
const artifact={
 schema:'OMEGA_SINGMASTER_EXACT_CLOSURE_ARTIFACT_R296',
 revision:'R296',
 generatedFrom:'deterministic exact arithmetic; timestamp intentionally omitted from hashed evidence',
 evidenceClass:'EXACT_COMPUTATION',
 verifierState:'EXACT_REPLAY_PASS',
 reproducible:true,
 evidenceDigest,
 globalClaimStatus:certificate.globalClaimStatus,
 boundedStatementPass:certificate.boundedStatementPass,
 fourfoldCandidateCount:certificate.fourfoldCandidateCount,
 certificate,
 noGoAtlas
};

if(output){fs.writeFileSync(output,JSON.stringify(artifact,null,2)+'\n','utf8')}
const summary={
 schema:artifact.schema,
 revision:artifact.revision,
 scope:certificate.scope,
 distinctValues:certificate.distinctValues,
 collisionFiberCount:certificate.collisionFiberCount,
 maxNontrivialMultiplicity:certificate.maxNontrivialMultiplicity,
 fourfoldCandidateCount:certificate.fourfoldCandidateCount,
 boundedStatementPass:certificate.boundedStatementPass,
 globalClaimStatus:certificate.globalClaimStatus,
 evidenceDigest,
 evidenceLocator:output?`file://${output}`:'STDOUT_ONLY',
 r294SuggestedOutcome:certificate.fourfoldCandidateCount>0?'COUNTEREXAMPLE':'NO_CLOSURE',
 truthMutationAuthority:false,
 sourceMutationAuthority:false,
 productionAuthority:false
};
console.log('OMEGA R296 SINGMASTER EXACT CLOSURE');
console.log(JSON.stringify(summary,null,2));
if(!output)console.log(JSON.stringify(artifact));
if(certificate.fourfoldCandidateCount>0){
 console.error('R296 EXACT COUNTEREXAMPLE CANDIDATE FOUND INSIDE DECLARED BOUNDS; independent replication and R294/R295 escalation are required.');
 process.exitCode=2;
}
