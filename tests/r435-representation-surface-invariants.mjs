import assert from'node:assert/strict';
import fs from'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const runtime=read('src/system/runtimeDerivedRepresentationR435.ts');
const bus=read('src/system/representationEvidenceBusR435.ts');
const atlas=read('src/OmegaAtlas360R356.tsx');
const ui=read('src/OmegaRuntimeDerivedRepresentationR435.tsx');
const convergence=read('src/OmegaConvergenceSurfaceR416.tsx');
const suite=read('src/OmegaSpecialistSuite.tsx');
const evidence=read('src/OmegaEvidenceMemoryR28.tsx');
const pcwd=read('src/OmegaProofCarryingWovenDynamics.tsx');
const pkg=JSON.parse(read('package.json'));

for(const token of['REPRESENTATION_MUST_DESCEND_FROM_CURRENT_RUNTIME_STATE','MISSING_EVIDENCE_HOLDS_THE_CLAIM_INSTEAD_OF_SYNTHESIZING_COMPLETION','renderForecastAsObserved:false','renderUnsupportedCompletion:false','compileUniversalTruthEnvelopeR152','compileAllModesTruthFusionR151','sampleR349FieldAtBearingR356','compareAntipodalFieldR356'])assert.ok(runtime.includes(token),'R435 runtime contract missing '+token);
for(const token of['R435_EVIDENCE_EVENT','publishRuntimeEvidenceR435','runtimeReceiptEvidenceR435','publishProofReceiptR435'])assert.ok(bus.includes(token),'R435 evidence/proof bus missing '+token);
assert.ok(!bus.includes('localStorage')&&!bus.includes('sessionStorage'),'R435 returned evidence bus must remain volatile rather than silently persisting stale authority');

for(const token of['compileRuntimeDerivedRepresentationR435','data-r435-representation','data-r435-receipt','Runtime state','Evidence gate','Triangle closure'])assert.ok(atlas.includes(token),'Atlas360 did not become runtime-derived: '+token);
assert.ok(!atlas.includes('addressBearingSampleR356('),'Atlas surface may not independently reconstruct a presentation path outside R435');
assert.ok(ui.includes('R435 · RUNTIME-DERIVED REPRESENTATION'));
assert.ok(ui.includes('forecast as observation FORBIDDEN'));
assert.ok(ui.includes('proofLineage'));

assert.ok(convergence.includes("<OmegaRuntimeDerivedRepresentationR435 address={address} record={record} surface='Convergence'/>") ,'Convergence missing R435 representation authority');
for(const panel of["panel==='Field'||panel==='Data Motion'","panel==='Evidence & Proof'"])assert.ok(suite.includes(panel),'specialist R435 target missing '+panel);
assert.ok((suite.match(/OmegaRuntimeDerivedRepresentationR435/g)||[]).length>=3,'Field/Data Motion/Evidence surfaces must carry R435 receipt');

for(const token of["fetch('/api/status'","fetch('/omega-build-receipt.json'","fetch('/api/release-evidence'","publishRuntimeEvidenceR435([","publishRuntimeEvidenceR435([])"])assert.ok(evidence.includes(token),'returned proof evidence is not bound fail-closed: '+token);
assert.ok(pcwd.includes("proofClass:'MODEL_PROOF'"),'PCWD proof must enter R435 as model proof');
assert.ok(pcwd.includes('publishProofReceiptR435'),'PCWD proof receipt is not connected to R435');
assert.ok(pkg.scripts['test:r435'],'package test:r435 missing');
assert.ok(pkg.scripts.check.includes('test:r435'),'R435 is not part of canonical npm check');

console.log('R435 REPRESENTATION SURFACE PASS · Atlas/Field/Data Motion/Evidence/Convergence descend from one runtime evidence/proof contract');