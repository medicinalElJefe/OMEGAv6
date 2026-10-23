// Invoked only by the existing exact-main production release authority.
import {readFile,writeFile} from 'node:fs/promises';
import {provisionArchive,archiveRuntimeConfig} from '../src/archive/archiveProvisioning.js';
const result=await provisionArchive({token:process.env.CLOUDFLARE_API_TOKEN,account:process.env.CLOUDFLARE_ACCOUNT_ID});
const base=JSON.parse((await readFile('wrangler.jsonc','utf8')).replace(/^\s*\/\/.*$/gm,''));
await writeFile('wrangler.archive-runtime.generated.json',JSON.stringify(archiveRuntimeConfig(base,result),null,2)+'\n');
console.log(JSON.stringify({schema:'OMEGA_ARCHIVE_PROVISIONING_V1',...result,coreDeploymentBlocked:false}));
if(result.state!=='READY')console.log('::notice title=ARCHIVE ACCOUNT ACTIVATION REQUIRED::Cloudflare R2 returned 10042. Core OMEGA remains deployable; private archive upload/download stays unavailable until account activation and a fresh deployment.');
