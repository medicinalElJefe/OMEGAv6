import {spawnSync} from 'node:child_process';

const phase=String(process.argv[2]||'').trim().toLowerCase();
if(!['staged','promoted'].includes(phase))throw new Error('R491 phase must be staged or promoted');
const base=String(process.env.OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
const sha=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const version=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim();
const worker=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
if(!base)throw new Error('R491 requires OMEGA_PUBLIC_URL');
if(!/^[0-9a-f]{40}$/i.test(sha))throw new Error('R491 requires exact 40-character source/promoted SHA');
if(phase==='staged'&&!version)throw new Error('R491 staged proof requires OMEGA_WORKER_VERSION_ID');

const env={
 ...process.env,
 OMEGA_E2E_URL:base,
 OMEGA_EXPECTED_SHA:sha,
 OMEGA_WORKER_NAME:worker,
 OMEGA_VERSION_AFFINITY_KEY:`omega-r491-${sha.slice(0,16)}-${phase}`
};
if(phase==='staged')env.OMEGA_WORKER_VERSION_ID=version;
else delete env.OMEGA_WORKER_VERSION_ID;

const result=spawnSync(process.execPath,['tests/r489-live-visible-capability-browser-e2e.mjs'],{
 cwd:process.cwd(),env,stdio:'inherit'
});
if(result.error)throw result.error;
if(result.status!==0)throw new Error(`R491 ${phase} OMEGA7 lazy-asset/executor proof failed with exit ${result.status}`);
console.log(`R491 ${phase.toUpperCase()} OMEGA7 ASSET COHERENCE PASS · exact SHA ${sha}${phase==='staged'?` · candidate Worker ${version}`:''} · stable version-affinity key · recovered fabric + representative native executors ready`);
