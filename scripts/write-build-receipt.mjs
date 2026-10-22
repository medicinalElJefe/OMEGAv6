import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';

const target=resolve(process.argv[2]||'public/omega-build-receipt.json');
const sourceSha=String(process.env.GITHUB_SHA||process.env.OMEGA_SOURCE_SHA||'UNAVAILABLE');
const canonicalUrl=String(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const state=String(process.env.OMEGA_BUILD_STATE||'RECEIPT_GENERATED');
const runId=String(process.env.GITHUB_RUN_ID||'LOCAL');
const runNumber=String(process.env.GITHUB_RUN_NUMBER||'LOCAL');
const generatedAt=new Date().toISOString();
const payload={
 schema:'OMEGA_GOVERNED_BUILD_RECEIPT_V1',
 state,
 generatedAt,
 source:{repository:'medicinalElJefe/OMEGAv6',sha:sourceSha,branch:String(process.env.GITHUB_REF_NAME||'UNKNOWN')},
 qa:{required:'npm install + npm run check + vite production build + wrangler dry-run',upstreamGate:String(process.env.OMEGA_QA_GATE||'PASSED_BEFORE_RECEIPT')},
 package:{builder:'Vite',output:'dist',portable:true,appDeploy:false},
 deployment:{authority:'GitHub Actions + Cloudflare Wrangler',canonicalUrl,publicWorkerMutationAuthority:false},
 workflow:{runId,runNumber,name:String(process.env.GITHUB_WORKFLOW||'OMEGA Cloud Bridge CI')},
 truthBoundary:'This receipt proves the governed external build/package stage represented by its state. It does not grant the public Worker repository mutation authority, native-device authority, or permission to infer later deployment verification.'
};
const digest=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
const receipt={...payload,receiptSha256:digest};
await mkdir(dirname(target),{recursive:true});
await writeFile(target,JSON.stringify(receipt,null,2)+'\n','utf8');
console.log(`OMEGA build receipt ${state} -> ${target} · ${digest}`);
