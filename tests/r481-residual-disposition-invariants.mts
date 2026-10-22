import assert from 'node:assert/strict';
import {compileWholeCorpusResidualsR479} from '../src/system/wholeCorpusConvergenceMissionR479';
import {evaluateResidualDispositionR481,evaluateWholeCorpusResidualDispositionR481} from '../src/system/residualDispositionR481';

const residuals=compileWholeCorpusResidualsR479();
const adapter=residuals.find(x=>x.class==='ADAPTER_GAP');
const truth=residuals.find(x=>x.class==='TRUTH_GATE');
assert.ok(adapter,'expected recovered adapter gap');
assert.ok(truth,'expected truth gate');

assert.equal(evaluateResidualDispositionR481(adapter).resolved,false);
assert.equal(evaluateResidualDispositionR481(adapter,{capabilityId:adapter.capabilityId,disposition:'INTENTIONAL_ADAPTER_ACCEPTED',evidenceIds:[],rationale:'intentional semantic adapter',authority:'R481'}).resolved,false);
assert.equal(evaluateResidualDispositionR481(adapter,{capabilityId:adapter.capabilityId,disposition:'INTENTIONAL_ADAPTER_ACCEPTED',evidenceIds:['CAPABILITY_ROLE_EVIDENCE'],rationale:'adapter is the strongest semantically valid endpoint for this capability role',authority:'R481'}).resolved,true);

const illegal=evaluateResidualDispositionR481(truth,{capabilityId:truth.capabilityId,disposition:'INTENTIONAL_ADAPTER_ACCEPTED',evidenceIds:['CLAIM'],rationale:'attempted waiver',authority:'R481'});
assert.equal(illegal.resolved,false);
assert.equal(illegal.nonWaivable,true);

const overall=evaluateWholeCorpusResidualDispositionR481([]);
assert.equal(overall.completionEligible,false);
assert.equal(overall.unresolvedCount,residuals.length);
assert.equal(overall.canonicalAdmission,false);
assert.equal(overall.admissionAuthority,'R125');
console.log('R481 RESIDUAL DISPOSITION PASS · adapters require evidence-backed disposition; truth gates and missing executors remain non-waivable');
