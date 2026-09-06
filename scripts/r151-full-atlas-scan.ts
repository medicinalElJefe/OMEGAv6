import {initCorpusPack} from '../src/corpusRuntime';
import {R151_CHANNEL_COUNT,scanCanonicalModeAtlasR151} from '../src/allModesTruthFusionR151';
import {compileAllModesSwarmPlanR151,evaluateAllModesSwarmCellR151,R151_SWARM_HIERARCHY} from '../src/allModesSwarmPartitionR151';

await initCorpusPack();
const swarm=compileAllModesSwarmPlanR151();
if(!swarm.complete)throw new Error(`R151 swarm partition incomplete: ${swarm.uniqueAddresses}/${swarm.totalAddresses}`);
if(swarm.cells.length!==1728)throw new Error(`R151 swarm cells ${swarm.cells.length} != 1728`);
if(swarm.totalAddresses!==20736||swarm.uniqueAddresses!==20736)throw new Error(`R151 swarm address coverage ${swarm.totalAddresses}/${swarm.uniqueAddresses} != 20736/20736`);
if(R151_SWARM_HIERARCHY.statesPerCell!==12||R151_SWARM_HIERARCHY.readingsPerCell!==2892)throw new Error(`R151 cell contract ${R151_SWARM_HIERARCHY.statesPerCell}/${R151_SWARM_HIERARCHY.readingsPerCell} != 12/2892`);
if(R151_SWARM_HIERARCHY.totalReadings!==4_997_376)throw new Error(`R151 swarm reading total ${R151_SWARM_HIERARCHY.totalReadings} != 4,997,376`);
for(const cell of [0,143,144,1727]){const result=evaluateAllModesSwarmCellR151(cell);if(result.addresses.length!==12||result.readings!==2892)throw new Error(`R151 cell ${cell} did not evaluate exactly 12 states / 2892 readings`);if(!Number.isFinite(result.meanTruthConfidence)||!Number.isFinite(result.meanAgreement)||!Number.isFinite(result.residualRisk))throw new Error(`R151 cell ${cell} emitted non-finite metrics`)}

const result=scanCanonicalModeAtlasR151({stride:1,topK:12});
if(result.stateCount!==20736)throw new Error(`R151 state count ${result.stateCount} != 20736`);
if(result.sampledStates!==20736)throw new Error(`R151 full scan sampled ${result.sampledStates} != 20736`);
if(result.channelsPerState!==241||R151_CHANNEL_COUNT!==241)throw new Error(`R151 channel count ${result.channelsPerState}/${R151_CHANNEL_COUNT} != 241`);
if(result.modeStateEvaluations!==4_997_376)throw new Error(`R151 mode-state evaluations ${result.modeStateEvaluations} != 4,997,376`);
if(result.domains.length!==12||result.domainPhases.length!==144)throw new Error('R151 hierarchical atlas aggregation must preserve 12 domains and 144 domain-phase bins');
if(!Number.isFinite(result.meanTruthConfidence)||!Number.isFinite(result.meanAgreement))throw new Error('R151 census emitted non-finite global metrics');
console.log(JSON.stringify({schema:result.schema,status:'PASS',swarm:{cells:swarm.cells.length,statesPerCell:R151_SWARM_HIERARCHY.statesPerCell,readingsPerCell:R151_SWARM_HIERARCHY.readingsPerCell,uniqueAddresses:swarm.uniqueAddresses,totalReadings:R151_SWARM_HIERARCHY.totalReadings},stateCount:result.stateCount,channelsPerState:result.channelsPerState,modeStateEvaluations:result.modeStateEvaluations,meanTruthConfidence:result.meanTruthConfidence,meanAgreement:result.meanAgreement,strongestStates:result.strongestStates.slice(0,3),highestResidualStates:result.highestResidualStates.slice(0,3),boundary:result.boundary},null,2));
