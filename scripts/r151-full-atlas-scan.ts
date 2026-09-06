import {initCorpusPack} from '../src/corpusRuntime';
import {R151_CHANNEL_COUNT,scanCanonicalModeAtlasR151} from '../src/allModesTruthFusionR151';

await initCorpusPack();
const result=scanCanonicalModeAtlasR151({stride:1,topK:12});
if(result.stateCount!==20736)throw new Error(`R151 state count ${result.stateCount} != 20736`);
if(result.sampledStates!==20736)throw new Error(`R151 full scan sampled ${result.sampledStates} != 20736`);
if(result.channelsPerState!==241||R151_CHANNEL_COUNT!==241)throw new Error(`R151 channel count ${result.channelsPerState}/${R151_CHANNEL_COUNT} != 241`);
if(result.modeStateEvaluations!==4_997_376)throw new Error(`R151 mode-state evaluations ${result.modeStateEvaluations} != 4,997,376`);
if(result.domains.length!==12||result.domainPhases.length!==144)throw new Error('R151 hierarchical atlas aggregation must preserve 12 domains and 144 domain-phase bins');
if(!Number.isFinite(result.meanTruthConfidence)||!Number.isFinite(result.meanAgreement))throw new Error('R151 census emitted non-finite global metrics');
console.log(JSON.stringify({schema:result.schema,status:'PASS',stateCount:result.stateCount,channelsPerState:result.channelsPerState,modeStateEvaluations:result.modeStateEvaluations,meanTruthConfidence:result.meanTruthConfidence,meanAgreement:result.meanAgreement,strongestStates:result.strongestStates.slice(0,3),highestResidualStates:result.highestResidualStates.slice(0,3),boundary:result.boundary},null,2));
