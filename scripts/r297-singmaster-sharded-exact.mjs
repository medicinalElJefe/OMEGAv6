import fs from 'node:fs';
import crypto from 'node:crypto';
import {compileShardedNoGoAtlasR297,compileSingmasterShardedExactR297,SINGMASTER_SHARDED_BASELINE_R297} from '../src/proof/singmasterShardedExactR297.js';

const intEnv=(name,fallback)=>{const raw=process.env[name];if(raw==null||raw==='')return fallback;const value=Number(raw);if(!Number.isSafeInteger(value))throw new Error(`${name} must be a safe integer`);return value};
const maxN=intEnv('OMEGA_R297_MAX_N',SINGMASTER_SHARDED_BASELINE_R297.maxN);
const maxK=intEnv('OMEGA_R297_MAX_K',SINGMASTER_SHARDED_BASELINE_R297.maxK);
const shardWidth=intEnv('OMEGA_R297_SHARD_WIDTH',SINGMASTER_SHARDED_BASELINE_R297.shardWidth);
const bucketCount=intEnv('OMEGA_R297_BUCKET_COUNT',SINGMASTER_SHARDED_BASELINE_R297.bucketCount);
const maxCells=intEnv('OMEGA_R297_MAX_CELLS',SINGMASTER_SHARDED_BASELINE_R297.maxCells);
const output=String(process.env.OMEGA_R297_OUTPUT||'').trim();

const certificate=compileSingmasterShardedExactR297({maxN,maxK,shardWidth,bucketCount,maxCells});
const noGoAtlas=compileShardedNoGoAtlasR297(certificate);
const canonical=JSON.stringify({certificate,noGoAtlas});
const evidenceDigest=`sha256:${crypto.createHash('sha256').update(canonical).digest('hex')}`;
const artifact={schema:'OMEGA_SINGMASTER_SHARDED_EXACT_ARTIFACT_R297',revision:'R297',generatedFrom:'deterministic sharded exact arithmetic; timestamp intentionally omitted from hashed evidence',evidenceClass:'EXACT_COMPUTATION',verifierState:'EXACT_REPLAY_PASS',reproducible:true,evidenceDigest,globalClaimStatus:certificate.globalClaimStatus,boundedStatementPass:certificate.boundedStatementPass,fourfoldCandidateCount:certificate.fourfoldCandidateCount,certificate,noGoAtlas};
if(output)fs.writeFileSync(output,JSON.stringify(artifact,null,2)+'\n','utf8');
const summary={schema:artifact.schema,revision:artifact.revision,scope:certificate.scope,composition:certificate.composition,distinctValues:certificate.distinctValues,collisionFiberCount:certificate.collisionFiberCount,crossShardCollisionCount:certificate.crossShardCollisionCount,maxNontrivialMultiplicity:certificate.maxNontrivialMultiplicity,fourfoldCandidateCount:certificate.fourfoldCandidateCount,boundedStatementPass:certificate.boundedStatementPass,globalClaimStatus:certificate.globalClaimStatus,evidenceDigest,evidenceLocator:output?`file://${output}`:'STDOUT_ONLY',r294SuggestedOutcome:certificate.fourfoldCandidateCount>0?'COUNTEREXAMPLE':'NO_CLOSURE',truthMutationAuthority:false,sourceMutationAuthority:false,productionAuthority:false};
console.log('OMEGA R297 SINGMASTER SHARDED EXACT FABRIC');
console.log(JSON.stringify(summary,null,2));
if(!output)console.log(JSON.stringify(artifact));
if(certificate.fourfoldCandidateCount>0){console.error('R297 EXACT FOURFOLD CANDIDATE FOUND INSIDE DECLARED BOUNDS; preserve artifact and require independent replication plus R294/R295 escalation.');process.exitCode=2}
