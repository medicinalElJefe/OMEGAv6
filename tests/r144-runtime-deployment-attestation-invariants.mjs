import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R144 '+msg);
const worker=read('src/workerR27.js');
const panel=read('src/GovernedBuildReceiptPanel.tsx');
const liveWorkflow=read('.github/workflows/release-evidence-live.yml');
const r143=read('src/authoritativeOperationChainR143.ts');
const r142=read('src/capabilityExecutionReceiptsR142.ts');

must(worker.includes("'/api/runtime-attestation'"),'runtime attestation endpoint missing');
must(worker.includes('OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144'),'runtime attestation schema missing');
for(const token of ["revision:'R143'","revision:'R142'","revision:'R141'","revision:'R125'","authority:'EXACT_PAYLOAD_CLOSURE'","authority:'CANONSTATE_PROOF_GATED_ADMISSION'"])must(worker.includes(token),`authority-chain token missing: ${token}`);
for(const token of ["implemented:'IMPLEMENTED'","tested:'EXTERNAL_GITHUB_EVIDENCE_REQUIRED'","merged:mergeBound?'MERGE_LINEAGE_BOUND':'EXTERNAL_RELEASE_LEDGER_REQUIRED'","deployed:metadata?'CLOUDFLARE_VERSION_RETURNED':'UNVERIFIED'","live:'CURRENT_RUNTIME_RESPONSE_RETURNED'","verified:'EXTERNAL_FIRST_HAND_PROBE_REQUIRED'"])must(worker.includes(token),`truth-separated lifecycle token missing: ${token}`);
must(worker.includes('attestationSha256'),'attestation digest missing');
must(worker.includes('publicWorkerMutationAuthority:false'),'public Worker mutation boundary regressed');
must(worker.includes('canonicalMutation:false'),'runtime attestation must remain read-only');
must(worker.includes("schema:'OMEGA_RELEASE_EVIDENCE_V1'"),'R27 release-evidence compatibility must remain intact');

must(panel.includes("fetch('/api/runtime-attestation'"),'governed build panel must read R144 runtime attestation');
must(panel.includes("data-r144-runtime-attestation"),'panel must expose attestation binding state');
must(panel.includes('Implemented ≠ tested ≠ merged ≠ deployed ≠ live ≠ verified'),'six-stage deployment truth boundary must be visible');
must(panel.includes('R143 UI operation chain → R142 capability lifecycle → R141 Hybrid exact return proof → R125 CanonState admission'),'authority chain must be operator-visible');

must(r143.includes('OMEGA_AUTHORITATIVE_UI_OPERATION_CHAIN_R143'),'R143 UI operation-chain authority missing');
must(r142.includes('OMEGA_CAPABILITY_EXECUTION_RECEIPT_R142'),'R142 execution receipt authority missing');
must(liveWorkflow.includes('/api/release-evidence'),'existing first-hand release probe must remain present');

console.log(JSON.stringify({schema:'OMEGA_R144_RUNTIME_DEPLOYMENT_ATTESTATION_INVARIANTS',status:'PASS',boundary:'implemented != tested != merged != deployed != live != verified; external first-hand verification remains required'},null,2));
