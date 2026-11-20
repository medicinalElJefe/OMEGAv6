// Invoked only by the existing exact-main production release authority.
import {readFile,writeFile} from 'node:fs/promises';
import {provisionArchive,archiveRuntimeConfig} from '../src/archive/archiveProvisioning.js';
const result=await provisionArchive({token:process.env.CLOUDFLARE_API_TOKEN,account:process.env.CLOUDFLARE_ACCOUNT_ID});
const base=JSON.parse((await readFile('wrangler.jsonc','utf8')).replace(/^\s*\/\/.*$/gm,''));
await writeFile('wrangler.archive-runtime.generated.json',JSON.stringify(archiveRuntimeConfig(base,result),null,2)+'\n');
console.log(JSON.stringify({schema:'OMEGA_ARCHIVE_PROVISIONING_V1',...result,coreDeploymentBlocked:false}));
if(result.state==='ACCOUNT_ACTIVATION_REQUIRED')console.log('::notice title=ARCHIVE ACCOUNT ACTIVATION REQUIRED::Cloudflare R2 returned 10042. Core OMEGA remains deployable; private archive upload/download stays unavailable until account activation and a fresh deployment.');
if(result.state==='PROVIDER_UNAVAILABLE_HELD')console.log('::warning title=R886 OPTIONAL ARCHIVE PROVIDER UNAVAILABLE::Cloudflare R2 returned HTTP '+result.providerHttpStatus+'/10001 despite bounded GET retries. Archive bindings are omitted; privacy and availability remain UNVERIFIED. Core OMEGA may proceed only through the original R170/R210/R237 staged release proofs.');
