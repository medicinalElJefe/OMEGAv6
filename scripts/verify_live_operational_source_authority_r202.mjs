import {verifyForensicContinuityLedgerR204} from './forensicContinuityR204.mjs';
const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
async function text(path){const r=await fetch(base+path,{headers:{'cache-control':'no-cache'}}),body=await r.text();if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return body}
const [html,core,client,health,forensicRaw,buildRaw]=await Promise.all([text('/omega-operational-source-authority-r202.html'),text('/omega-operational-source-authority-r202-core.js'),text('/omega-operational-source-authority-r202.js'),text('/api/core-health'),text('/omega-forensic-continuity-r204.json'),text('/omega-build-receipt.json')]);
if(!html.includes('OMEGA_OPERATIONAL_SOURCE_AUTHORITY_R202')||!html.includes('DRIVE/WORKBOOK ≠ RUNTIME TRUTH')||!html.includes('AT10 · R204'))throw new Error('R202/R204 live HTML truth surface missing');
if(!core.includes("R202_REVISION='R202'")||!core.includes('R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY')||!core.includes('reconcileForensicContinuityR204'))throw new Error('R202/R204 live core missing authority law');
if(!client.includes("get('/api/execution/runs',true)")||!client.includes("get('/omega-forensic-continuity-r204.json')")||/method:\s*['\"](?:POST|PUT|PATCH|DELETE)/.test(client))throw new Error('R202/R204 live client is not read-only');
const h=JSON.parse(health);if(h.schema!=='OMEGA_CANONICAL_CORE_HEALTH_R163'||h.state!=='LIVE'||h.ok!==true)throw new Error('R202/R204 live console is not sitting above a first-hand live canonical core');
const forensic=JSON.parse(forensicRaw),build=JSON.parse(buildRaw);verifyForensicContinuityLedgerR204(forensic);
if(forensic.state!=='PRODUCTION_BOUND_FORENSIC_CONTINUITY')throw new Error(`R204 forensic state is not production-bound: ${forensic.state}`);
if(!/^[a-f0-9]{40}$/i.test(forensic.source?.sha)||forensic.source.sha!==forensic.lineage?.promotedMergeSha)throw new Error('R204 promoted source SHA is not exact lineage-bound');
if(!/^[a-f0-9]{40}$/i.test(forensic.lineage?.candidateSha)||!/^[a-f0-9]{40}$/i.test(forensic.lineage?.rollbackSha))throw new Error('R204 candidate/rollback lineage missing');
if(build?.promotion?.promotedMergeSha!==forensic.source.sha||build?.source?.sha!==forensic.source.sha)throw new Error('R204 forensic source does not match deployed governed build receipt');
if(forensic.archiveResiduals?.AT09?.closed!==false||forensic.archiveResiduals?.AT09?.state!=='HOST_HEALTH_RECEIPT_REQUIRED')throw new Error('R204 AT09 host-health boundary regressed');
if(forensic.archiveResiduals?.AT10?.closed!==true||forensic.archiveResiduals?.AT10?.externalArchiveFullyHashed!==false)throw new Error('R204 AT10 scoped forensic closure boundary regressed');
if(forensic.driveBinding?.rawByteBoundCount!==3||forensic.driveBinding?.liveDriveAuthority!==false||forensic.driveBinding?.exhaustive!==false)throw new Error('R204 Drive byte-binding scope regressed');
console.log(`R202/R202.1/R204 LIVE PASS · ${base}/omega-operational-source-authority-r202.html · promoted ${forensic.source.sha} · ${forensic.entries.length} repository authority hashes · ${forensic.driveBinding.rawByteBoundCount} raw Drive donor hashes · AT09 open/host-gated · AT10 repository ledger production-bound · R125 preserved`);
