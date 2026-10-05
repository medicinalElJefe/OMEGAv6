import assert from 'node:assert/strict';
import {YEAR_CORPUS_CAPABILITY_GRAPH_R474} from '../src/yearCorpusCapabilityGraphR474';
import {compileWholeCorpusResidualsR479,evaluateWholeCorpusMissionR479} from '../src/system/wholeCorpusConvergenceMissionR479';

const mission=evaluateWholeCorpusMissionR479(YEAR_CORPUS_CAPABILITY_GRAPH_R474);
assert.equal(mission.scope,'WHOLE_YEAR_CORPUS_NOT_LATEST_REVISION');
assert.equal(mission.convergenceUnit,'CAPABILITY_LINEAGE_NOT_ROUTE');
assert.equal(mission.conservation.pass,true);
assert.equal(mission.blockingResiduals.length,0);
assert.equal(mission.promotionEligible,true);
assert.equal(mission.completionEligible,mission.residuals.length===0);
assert.equal(mission.residualSummary.total,mission.residuals.length);
assert.equal(mission.residualSummary.truthGated,YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>x.strongestImplementation.state==='TRUTH_GATED').length);
assert.equal(mission.residualSummary.adapterGaps,YEAR_CORPUS_CAPABILITY_GRAPH_R474.filter(x=>x.strongestImplementation.state==='EXECUTES_AS_ADAPTER').length);
assert.ok(mission.nextResiduals.length<=12);
assert.equal(mission.canonicalAdmissionAuthority,'R125');
assert.equal(mission.canonicalMutation,false);

const lost=YEAR_CORPUS_CAPABILITY_GRAPH_R474.slice(1);
const regression=evaluateWholeCorpusMissionR479(lost);
assert.equal(regression.conservation.pass,false);
assert.equal(regression.promotionEligible,false);
assert.equal(regression.completionEligible,false);

const residuals=compileWholeCorpusResidualsR479();
assert.ok(residuals.every(x=>x.capabilityId&&x.pillar&&x.gap));
console.log('R479 WHOLE-CORPUS CONVERGENCE MISSION PASS · capability conservation + residual closure govern completion');
