import assert from 'node:assert/strict';
import fs from 'node:fs';
import {computeCanonPathWitnessR763} from '../src/proof/canonNavigationR763.js';
import {auditCanonInverseR765,verifyCanonInverseAuditR765,
 createCanonInverseBundleR765,verifyCanonInverseBundleR765} from '../src/proof/canonInverseAuditR765.js';

const forward=computeCanonPathWitnessR763({start:1,targetDecision:'ESCALATE',targetMode:51,
 allowedAxes:['Motion'],maxHops:1,maxVisited:20});
assert.equal(forward.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
assert.equal(forward.result.destination,13);
const any=auditCanonInverseR765(forward);
assert.equal(any.structurallyReversible,true);
assert.equal(any.reverseUnderSameEnvelope,true);
assert.deepEqual(any.reverseRefusalReasons,[]);
assert.equal(any.signedOrdinalAxisMoves.Motion,1);
assert.equal(any.signedOrdinalAxisMoves.Domain,0);
assert.equal(any.exactPerAxisRoundTrip,true);
assert.equal(any.reversePathIsShortestProof,false);
assert.equal(any.calibratedPhysicalReversibility,false);
assert.equal(any.canonicalMutation,false);
assert.equal(any.deviceActionAuthority,false);
assert.deepEqual(verifyCanonInverseAuditR765(forward,JSON.stringify(any)),any);
assert.throws(()=>verifyCanonInverseAuditR765(forward,JSON.stringify({...any,
 reverseUnderSameEnvelope:false})),/differs/);

const portable=createCanonInverseBundleR765(forward);
assert.equal(portable.audit.reverseUnderSameEnvelope,true);
assert.equal(portable.authority,'RECOMPUTED_SYMBOLIC_MODEL_ONLY');
assert.deepEqual(verifyCanonInverseBundleR765(JSON.stringify(portable)),portable);
assert.throws(()=>verifyCanonInverseBundleR765(JSON.stringify({...portable,
 audit:{...portable.audit,reverseUnderSameEnvelope:false}})),/differs/);
assert.throws(()=>verifyCanonInverseBundleR765(JSON.stringify({...portable,
 witness:{...portable.witness,query:{...portable.witness.query,start:2}}})),/differs/);
assert.throws(()=>verifyCanonInverseBundleR765('x'.repeat(240001)),/bounded/);
assert.throws(()=>verifyCanonInverseBundleR765('{}'),/schema/);

const monotone=computeCanonPathWitnessR763({start:1,targetDecision:'ESCALATE',targetMode:51,
 allowedAxes:['Motion'],scoreTrend:'NONDECREASING',maxHops:1,maxVisited:20});
assert.equal(monotone.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
const reverseMonotone=auditCanonInverseR765(monotone);
assert.equal(reverseMonotone.structurallyReversible,true);
assert.equal(reverseMonotone.reverseUnderSameEnvelope,false);
assert.deepEqual(reverseMonotone.reverseRefusalReasons,['REVERSE_NONDECREASING_COHERENCE_VIOLATION']);

const scoreGated=computeCanonPathWitnessR763({start:1,targetDecision:'ESCALATE',targetMode:51,
 allowedAxes:['Motion'],minScore:'0.065',maxHops:1,maxVisited:20});
assert.equal(scoreGated.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
assert(auditCanonInverseR765(scoreGated).reverseRefusalReasons.includes('RETURN_TARGET_SCORE_BELOW_MINIMUM'));

const burdenGated=computeCanonPathWitnessR763({start:13,targetDecision:'ESCALATE',targetMode:40,
 allowedAxes:['Motion'],maxBurden:'0.45',maxHops:1,maxVisited:20});
assert.equal(burdenGated.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
assert(auditCanonInverseR765(burdenGated).reverseRefusalReasons.includes('RETURN_TARGET_BURDEN_ABOVE_MAXIMUM'));

const qGated=computeCanonPathWitnessR763({start:2,targetDecision:'ESCALATE',targetMode:40,
 allowedAxes:['Perspective'],maxContradiction:'0.12',maxHops:1,maxVisited:20});
assert.equal(qGated.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
assert(auditCanonInverseR765(qGated).reverseRefusalReasons.includes('RETURN_TARGET_CONTRADICTION_ABOVE_MAXIMUM'));

const allNodes=computeCanonPathWitnessR763({start:1,targetDecision:'ESCALATE',targetMode:51,
 allowedAxes:['Motion'],pathConstraintScope:'ALL_NODES',minScore:'0',maxHops:1,maxVisited:20});
assert.equal(allNodes.result.status,'FOUND_IN_DECLARED_SYMBOLIC_GRAPH');
assert.equal(auditCanonInverseR765(allNodes).reverseUnderSameEnvelope,true);

const zero=computeCanonPathWitnessR763({start:1,targetDecision:'ESCALATE',targetMode:40,
 maxHops:0,maxVisited:1});
const zeroAudit=auditCanonInverseR765(zero);
assert.equal(zeroAudit.forwardHops,0);
assert.equal(zeroAudit.reverseUnderSameEnvelope,true);
assert.equal(zeroAudit.forwardExactScoreDelta.numerator,'0');
assert.equal(zeroAudit.exactPerAxisRoundTrip,true);

assert.throws(()=>auditCanonInverseR765(computeCanonPathWitnessR763({
 start:1,targetDecision:'STAY',maxHops:0,maxVisited:1})),/only completed/);
assert.throws(()=>verifyCanonInverseAuditR765(forward,'x'.repeat(65537)),/bounded/);
const ui=fs.readFileSync('src/CanonTopologyWorkbenchR763.tsx','utf8');
for(const token of ['data-r765-inverse','data-r765-directed-status','data-r765-flux','data-r765-reasons','data-r765-export','data-r765-import','data-r765-verify','data-r765-recovery-status'])
 assert(ui.includes(token),'R765 UI missing '+token);
assert(ui.includes('auditCanonInverseR765'));
console.log('R765 directed inverse/outverse audit: exact per-axis flux, reverse monotone veto, source-gated score/q/Lambda refusal, zero-hop identity, tamper controls PASS');
