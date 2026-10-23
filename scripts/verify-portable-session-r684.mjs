#!/usr/bin/env node
/**
 * R684 self-contained CLI verification of exported OMEGA source-session proof.
 * Uses the exact same JS source executors as the OMEGA7 browser; no network,
 * no device connection and no CanonState mutation. Requires Node.js >= 22.
 *
 * node scripts/verify-portable-session-r684.mjs <omega-r684-portable-proof.json>
 */
import {readFile,stat} from 'node:fs/promises';
import {basename} from 'node:path';
import {
 R684_MAX_BUNDLE_BYTES,
 parsePortableSessionBundleR684,
 verifyPortableSessionBundleR684
} from '../src7/workspaces/portableSessionBundleR684.js';

const filename=process.argv[2];
if(!filename||process.argv.length!==3){
 console.error('Usage: node scripts/verify-portable-session-r684.mjs <portable-proof.json>');
 process.exit(2);
}
try{
 const info=await stat(filename);
 if(!info.isFile()||info.size>R684_MAX_BUNDLE_BYTES)throw Error('R684 input must be one bounded local file');
 const raw=await readFile(filename,'utf8');
 const bundle=parsePortableSessionBundleR684(raw);
 const proof=await verifyPortableSessionBundleR684(bundle);
 console.log(JSON.stringify({
  schema:'OMEGA_PORTABLE_SESSION_OFFLINE_VERIFICATION_R684',
  file:basename(filename),
  ...proof,
  offline:true,
  liveSourceAttested:false,
  provenanceAuthenticated:false
 },null,2));
 if(!proof.valid||!proof.archivedSourceReplayed)process.exitCode=1;
}catch(err){
 console.error(JSON.stringify({schema:'OMEGA_PORTABLE_SESSION_OFFLINE_VERIFICATION_R684',
  status:'HELD',file:basename(filename),reason:String(err),
  productionVerified:false,liveSourceAttested:false,provenanceAuthenticated:false},null,2));
 process.exitCode=1;
}
