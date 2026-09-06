import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {evaluateEmpiricalCalibrationR128,replayCapsuleR128,semanticReplayHashR128} from '../src/validation/empiricalCalibrationReplayR128.ts';

const args=process.argv.slice(2);
const arg=(name,fallback=null)=>{const i=args.indexOf(name);return i>=0&&i+1<args.length?args[i+1]:fallback};
const has=name=>args.includes(name);
const inputPath=arg('--input');
const outDir=arg('--out','artifacts/r129-experiment');
if(!inputPath){console.error('Usage: node --experimental-strip-types scripts/r129-empirical-experiment.mjs --input experiment.json [--out artifacts/dir] [--verify-replay]');process.exit(2)}
if(!fs.existsSync(inputPath)){console.error(`INPUT_NOT_FOUND ${inputPath}`);process.exit(2)}

const stable=(x)=>{if(x===null||typeof x!=='object')return JSON.stringify(x);if(Array.isArray(x))return`[${x.map(stable).join(',')}]`;return`{${Object.keys(x).sort().map(k=>`${JSON.stringify(k)}:${stable(x[k])}`).join(',')}}`};
const sha=x=>crypto.createHash('sha256').update(typeof x==='string'?x:stable(x)).digest('hex');
const read=JSON.parse(fs.readFileSync(inputPath,'utf8'));
const semanticHash=semanticReplayHashR128(read);
const validation=evaluateEmpiricalCalibrationR128(read);
const replay=replayCapsuleR128(read);

fs.mkdirSync(outDir,{recursive:true});
const normalizedInput=path.join(outDir,'experiment.normalized.json');
const validationPath=path.join(outDir,'validation.receipt.json');
const replayPath=path.join(outDir,'replay.capsule.json');
const ledgerPath=path.join(outDir,'ledger.json');
const manifestPath=path.join(outDir,'manifest.json');

const normalized={...read,examples:[...(read.examples??[])].sort((a,b)=>`${a.datasetId}|${a.id}`.localeCompare(`${b.datasetId}|${b.id}`)),reproductionReceipts:[...(read.reproductionReceipts??[])].sort((a,b)=>a.id.localeCompare(b.id)),upstreamProofHashes:[...(read.upstreamProofHashes??[])].sort(),notes:[...(read.notes??[])].sort()};
fs.writeFileSync(normalizedInput,JSON.stringify(normalized,null,2)+'\n');
fs.writeFileSync(validationPath,JSON.stringify(validation,null,2)+'\n');
fs.writeFileSync(replayPath,JSON.stringify(replay,null,2)+'\n');

const ledger={
 schema:'OMEGA_EMPIRICAL_EXPERIMENT_LEDGER_R129',
 revision:'R129',
 experimentId:read.experimentId,
 modelId:read.modelId,
 claim:read.claim,
 semanticHash,
 validationStatus:validation.status,
 validationReason:validation.reason,
 authority:'R129_EXPERIMENT_LEDGER_NOT_CANON',
 canonicalMutation:false,
 files:{
  normalizedInput:'experiment.normalized.json',
  validationReceipt:'validation.receipt.json',
  replayCapsule:'replay.capsule.json'
 },
 boundaries:{
  syntheticExternalValidationCredit:0,
  validationIsDatasetPolicyScoped:true,
  replayIsNotExecution:true,
  receiptIsNotCanon:true,
  admissionAuthority:'R125'
 }
};
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
const files=['experiment.normalized.json','validation.receipt.json','replay.capsule.json','ledger.json'].map(name=>{const p=path.join(outDir,name);return{name,sha256:sha(fs.readFileSync(p,'utf8')),bytes:fs.statSync(p).size}});
const manifest={schema:'OMEGA_EMPIRICAL_EXPERIMENT_MANIFEST_R129',revision:'R129',semanticHash,files,manifestPayloadSha256:sha(files),canonicalMutation:false,authority:'R129_REPLAY_MANIFEST_NOT_CANON'};
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');

if(has('--verify-replay')){
 const reread=JSON.parse(fs.readFileSync(normalizedInput,'utf8'));
 const replayHash=semanticReplayHashR128(reread);
 if(replayHash!==semanticHash){console.error(`REPLAY_MISMATCH expected=${semanticHash} actual=${replayHash}`);process.exit(3)}
 for(const f of files){const actual=sha(fs.readFileSync(path.join(outDir,f.name),'utf8'));if(actual!==f.sha256){console.error(`ARTIFACT_HASH_MISMATCH ${f.name}`);process.exit(4)}}
}

console.log(JSON.stringify({ok:true,revision:'R129',experimentId:read.experimentId,semanticHash,status:validation.status,reason:validation.reason,outDir,manifest:manifestPath,canonicalMutation:false},null,2));
