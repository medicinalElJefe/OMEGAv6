// R636: execute an existing browser test and write a reproducible evidence artifact.
// The wrapper does not grant trust: CI run identity and artifact digest must be verified externally.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const permitted=new Map([
 ['historical-rh-traversal','tests/r622-historical-rh-graph-browser-e2e.mjs'],
 ['hybrid-resource-governor','scripts/verify_live_hybrid_resource_governor_r239.mjs']
]);
const id=process.argv[2],script=permitted.get(id);
if(!script)throw Error('R636 unknown browser executor');
const expected=process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'';
if(!/^[a-f0-9]{40}$/.test(expected))throw Error('R636 exact 40-character promoted SHA required');
const base=process.env.OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL||'';
if(!/^https:\/\//.test(base))throw Error('R636 production HTTPS origin required');
const startedAt=new Date().toISOString();
const run=spawnSync(process.execPath,[script],{encoding:'utf8',timeout:240000,maxBuffer:2*1024*1024,env:{...process.env,OMEGA_E2E_URL:base,OMEGA_PUBLIC_URL:base,OMEGA_EXPECTED_SHA:expected,OMEGA_PROMOTED_SHA:expected}});
const finishedAt=new Date().toISOString();
const output=(run.stdout||'')+'\n'+(run.stderr||'');
const outputDigest=createHash('sha256').update(output).digest('hex');
const artifact={schema:'OMEGA_BROWSER_EXECUTION_R636_V1',targetId:id,script,environment:'production',expectedSha:expected,exitCode:run.status??1,signal:run.signal||null,startedAt,finishedAt,outputDigest,workflowRunId:process.env.GITHUB_RUN_ID||null,workflowSha:process.env.GITHUB_SHA||null,runnerTrust:'UNVERIFIED_EXTERNAL_ATTESTATION_REQUIRED',output};
const dir=resolve('artifacts','genesis-browser');mkdirSync(dir,{recursive:true});
const path=resolve(dir,id+'.json');writeFileSync(path,JSON.stringify(artifact,null,2)+'\n');
const stored=readFileSync(path);console.log('R636 evidence artifact: '+path+' sha256='+createHash('sha256').update(stored).digest('hex'));
if(run.error)console.error(run.error);
if(artifact.exitCode!==0)process.exitCode=1;
