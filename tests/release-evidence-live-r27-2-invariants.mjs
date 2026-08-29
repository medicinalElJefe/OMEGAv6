import fs from 'node:fs';
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const workflow=fs.readFileSync('.github/workflows/release-evidence-live.yml','utf8');
const worker=fs.readFileSync('src/workerR27.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
function semverAtLeast(v,min){const a=v.split('.').map(Number),b=min.split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return true;if((a[i]||0)<(b[i]||0))return false}return true}
must(workflow.includes('https://omegav6.jeffdeweyeljefe.workers.dev'),'live evidence verifier must target canonical Worker only');
must(workflow.includes("e?.source?.sha!==expected"),'live verifier must wait for the exact promoted main SHA');
must(workflow.includes("OMEGA_RELEASE_EVIDENCE_V1"),'live verifier must require release-evidence schema');
must(workflow.includes("OMEGA_GOVERNED_BUILD_RECEIPT_V1"),'live verifier must require governed build receipt schema');
must(workflow.includes("e?.packageReceipt?.receiptSha256!==b.receiptSha256"),'live verifier must compare exact receipt SHA-256');
must(workflow.includes("runtimeVersion?.id"),'live verifier must require Cloudflare runtime version metadata');
must(workflow.includes("publicWorkerMutationAuthority!==false"),'live verifier must enforce public Worker non-mutation authority');
must(workflow.includes("EXTERNAL_FIRST_HAND_PROBE_REQUIRED")&&workflow.includes("EXTERNAL_RELEASE_LEDGER_REQUIRED"),'live verifier must preserve external verification/rollback truth');
must(worker.includes("'/api/release-evidence'"),'runtime release evidence endpoint must remain active');
must(semverAtLeast(pkg.version,'27.2.0'),'successor package must retain or advance beyond R27.2');
must(!workflow.includes('@appdeploy/client')&&!workflow.includes('appdeploy.ai'),'live verifier must remain AppDeploy-free');
console.log(`OMEGA R27.2+ LIVE EVIDENCE GATE PASS · package ${pkg.version} · exact promoted SHA + receipt hash + Worker Version ID`);
