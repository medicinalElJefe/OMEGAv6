export const R353_SCHEMA='OMEGA_RELEASE_LINEAGE_PROVENANCE_R353' as const;
export const R353_REVISION='R353' as const;
export const R353_BOUNDARY='R353 normalizes release/proof lineage as read-only provenance. Historical build, test, acceptance, deployment, correspondence, or archive receipts prove only the bounded event they originally recorded. Only matching first-hand current release evidence + R144 runtime attestation + package receipt may be marked CURRENT_LIVE_RETURNED. External post-deploy verification remains separate. R125 remains sole CanonState admission authority; R141 exact returns, R146 durable history, R147 dispatch, and ci.yml production authority are unchanged.' as const;

export type ReleaseAuthorityR353='CURRENT_LIVE_RETURNED'|'HISTORICAL_PROVED_AT_RELEASE'|'HISTORICAL_RECORDED'|'SUPERSEDED'|'HOLD';
export type ReleaseClassR353='CANONICAL_RELEASE'|'DYNAMIC_CURRENT_RUNTIME'|'HISTORICAL_RECEIPT'|'HISTORICAL_DECISION'|'ARCHIVE_DONOR';
export type ReleaseSeedR353={
 revision:string;sha:string;date:string;title:string;parents:string[];productionRunId?:number|null;scar:string;evidenceClass:ReleaseClassR353;
};
export type CurrentRuntimeEvidenceR353={releaseEvidence?:any;runtimeAttestation?:any;buildReceipt?:any};
export type ReleaseNodeR353=ReleaseSeedR353&{
 authority:ReleaseAuthorityR353;currentLive:boolean;historicalAcceptanceOnly:boolean;supersededBy:string|null;receiptBound:boolean;workerVersion:string|null;
};
export type ReleaseEdgeR353={from:string;to:string;kind:'GIT_PARENT'|'CANONICAL_SUPERSESSION'|'RUNTIME_ROLLBACK_PARENT'};
export type ProvenanceScarR353={at:string;revision:string;sourceSha:string;kind:'AUTHORITY_CHANGE'|'RECOVERY'|'COMPUTE'|'RENDER'|'TEMPORAL'|'PROOF';summary:string;currentAuthority:boolean};
export type HistoricalDecisionR353={source:string;section:string;decision:string;authority:'HISTORICAL_ONLY';currentAuthority:false};
export type ReleaseLineageR353={
 schema:typeof R353_SCHEMA;revision:typeof R353_REVISION;state:'CURRENT_BOUND'|'HOLD';currentSha:string|null;currentWorkerVersion:string|null;
 nodes:ReleaseNodeR353[];edges:ReleaseEdgeR353[];scars:ProvenanceScarR353[];historicalDecisions:HistoricalDecisionR353[];donors:typeof HISTORICAL_PROVENANCE_DONORS_R353;
 receiptBinding:{releaseSha:string|null;attestationSha:string|null;receiptSha256:string|null;workerVersion:string|null;sourceMatch:boolean;workerMatch:boolean;receiptMatch:boolean;externalPostDeployVerificationClaimed:false};
 boundary:typeof R353_BOUNDARY;
};

const SHA=/^[0-9a-f]{40}$/i,HEX64=/^[0-9a-f]{64}$/i,UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text=(x:any)=>typeof x==='string'?x.trim():'';
const sha=(...xs:any[])=>xs.map(text).find(x=>SHA.test(x))||null;
const hex64=(...xs:any[])=>xs.map(text).find(x=>HEX64.test(x))||null;
const uuid=(...xs:any[])=>xs.map(text).find(x=>UUID.test(x))||null;

export const CANONICAL_RELEASES_R353:readonly ReleaseSeedR353[]=Object.freeze([
 {revision:'R347',sha:'422507a08622e67af80e98d78dab7fef795b0e00',date:'2026-09-21T05:37:01Z',title:'Human-correlated real-time traversal cockpit',parents:['6ac0be21dc4309a9553fc00088889d1ce9a9a67e','ee884ddbf2b2f4b5c9c2840199bfc452bb6f7dc9'],productionRunId:35565203727,scar:'Human-correlated traversal and first-hand cockpit proof entered canonical main.',evidenceClass:'CANONICAL_RELEASE'},
 {revision:'R348',sha:'a7719e604970078329b90e442d68fa00d20ae245',date:'2026-09-21T14:14:38Z',title:'Unified convergence + bounded browser-proof repair',parents:['422507a08622e67af80e98d78dab7fef795b0e00','bec9b00d97dc10f726e82024d4d3b2c2d6b4dfc0'],productionRunId:35610843113,scar:'One convergence authority plus deterministic browser-proof readiness replaced timeout-prone proof behavior.',evidenceClass:'CANONICAL_RELEASE'},
 {revision:'R349',sha:'5b420e54f41c01961f1f7710fe1e18d82e471d8c',date:'2026-09-21T21:11:56Z',title:'Hardware-aware Woven field + exact-address raster',parents:['a7719e604970078329b90e442d68fa00d20ae245','f7ce7d00cf5a924cf3b1af4da755a8bbcd23463f'],productionRunId:35655744693,scar:'20,736 typed state, bounded hardware scheduling, conservative carry and exact 144×144 address rendering became executable.',evidenceClass:'CANONICAL_RELEASE'},
 {revision:'R350',sha:'c469133fbceb12eca6d35e632d3b52fb920693bb',date:'2026-09-22T00:45:11Z',title:'Deterministic temporal checkpoint seek/replay',parents:['5b420e54f41c01961f1f7710fe1e18d82e471d8c','9fccb77512e503b6b76659e9fdfa82f7c8d3b386'],productionRunId:35673238967,scar:'Integer model-time checkpoints, history/NOW/scenario separation and deterministic seek/replay were bound to the typed field.',evidenceClass:'CANONICAL_RELEASE'},
 {revision:'R351',sha:'adfa3dd8df337365adbdcd4d7eefff27428da72a',date:'2026-09-22T02:50:40Z',title:'GPU packet mirror + deterministic frame receipts',parents:['c469133fbceb12eca6d35e632d3b52fb920693bb','6da23819919a547b4c23b4977fc033b914839206'],productionRunId:35680954493,scar:'Canonical CPU state gained a 20,736-packet GPU mirror, 20,735 transition edges and frame receipts without moving state authority to the GPU.',evidenceClass:'CANONICAL_RELEASE'},
 {revision:'R350.1',sha:'fe2e2fdb5b9c2fda69c099862cd24332bc19a00c',date:'2026-09-22T04:37:43Z',title:'SHA-256 temporal replay hardening',parents:['adfa3dd8df337365adbdcd4d7eefff27428da72a','4cc73a41a886c6aed78fbf91cd62dcbc6eca8704'],productionRunId:35687602402,scar:'Temporal state fingerprints were strengthened to SHA-256 and replay budget compilation was bound to the actual R193 multi-axis engine.',evidenceClass:'CANONICAL_RELEASE'},
 {revision:'R352',sha:'3aafd7d0aacbcc08dc9a53925435b0e84229d2b7',date:'2026-09-23T00:26:04Z',title:'Proof-bound WebGPU compute/render state',parents:['fe2e2fdb5b9c2fda69c099862cd24332bc19a00c','241339fd011551cfa6f2fa44d65c3edbc2139e45'],productionRunId:35802041605,scar:'WebGPU compute upload/dispatch/readback gained CPU correspondence proof while canonical state remained CPU/R349/R350 authoritative.',evidenceClass:'CANONICAL_RELEASE'}
]);

export function parseHistoricalDecisionRecordsR353(markdown:string,source='Historical correspondence'):HistoricalDecisionR353[]{
 const out:HistoricalDecisionR353[]=[];let section='UNSECTIONED';
 for(const raw of String(markdown||'').split(/\\r?\\n/)){const line=raw.trim();const heading=line.match(/^#{2,4}\\s+(.+)$/);if(heading){section=heading[1].trim();continue}const bullet=line.match(/^[-*]\\s+(.+)$/);if(!bullet)continue;const decision=bullet[1].replace(/\\s+/g,' ').trim();if(decision)out.push({source,section,decision,authority:'HISTORICAL_ONLY',currentAuthority:false})}
 return out;
}
export const B058_DECISION_EXCERPT_R353=`## One renderer packet
- Bind rendering to one packet phase and remove duplicate phase re-scaling.
## One canonical Field authority
- Remove editable shadow metrics so Field and traversal resolve from the same source address.
## Exact NOAA frame evidence
- Bind observation timestamps to immutable timestamped frames rather than mutable latest aliases.
## Remaining authenticated boundary
- Do not claim account-bound canonical execution until an authenticated return receipt exists.`;
export const HISTORICAL_DECISIONS_R353=Object.freeze(parseHistoricalDecisionRecordsR353(B058_DECISION_EXCERPT_R353,'OMEGA B058 Correspondence Ledger (AG-012)'));

export const HISTORICAL_PROVENANCE_DONORS_R353=Object.freeze([
 {source:'Sovereign build proof history (AG-011)',class:'HISTORICAL_RECEIPT',role:'manifest / continuity / test-receipt normalization',authority:'HISTORICAL_ONLY'},
 {source:'OMEGA B058 Correspondence Ledger (AG-012)',class:'HISTORICAL_DECISION',role:'decision reason / evidence / supersession scar donor',authority:'HISTORICAL_ONLY'},
 {source:'FULL_SYSTEM_BUILD_LEDGER.md',class:'ARCHIVE_DONOR',role:'historical software-family and closure-status donor',authority:'HISTORICAL_ONLY'},
 {source:'SHA256SUMS_OMEGA.txt',class:'ARCHIVE_DONOR',role:'historical artifact checksum donor',authority:'HISTORICAL_ONLY'},
 {source:'OMEGA Temporal Field — Master Architecture + Build Ledger',class:'ARCHIVE_DONOR',role:'checkpoint / field-hash / scar-ledger contract donor',authority:'HISTORICAL_ONLY'}
] as const);

function currentBinding(e:CurrentRuntimeEvidenceR353){
 const r=e.releaseEvidence||{},a=e.runtimeAttestation||{},b=e.buildReceipt||{};
 const releaseSha=sha(r?.source?.sha,r?.promotionLineage?.promotedMergeSha);
 const attestationSha=sha(a?.source?.sha,a?.bindings?.sourceSha,a?.promotionLineage?.promotedMergeSha);
 const releaseWorker=uuid(r?.runtimeVersion?.id,r?.workerVersion);
 const attestationWorker=uuid(a?.runtimeVersion?.id,a?.bindings?.cloudflareVersionId,a?.workerVersion);
 const buildReceiptSha=hex64(b?.receiptSha256);
 const releaseReceiptSha=hex64(r?.packageReceipt?.receiptSha256);
 const attestationReceiptSha=hex64(a?.packageReceipt?.receiptSha256,a?.bindings?.packageReceiptSha256);
 const sourceMatch=Boolean(releaseSha&&releaseSha===attestationSha);
 const workerMatch=Boolean(releaseWorker&&releaseWorker===attestationWorker);
 const receiptCandidates=[buildReceiptSha,releaseReceiptSha,attestationReceiptSha].filter(Boolean) as string[];
 const receiptMatch=receiptCandidates.length>=2&&new Set(receiptCandidates).size===1;
 return{releaseSha,attestationSha,buildReceiptSha,releaseReceiptSha,attestationReceiptSha,workerVersion:releaseWorker&&releaseWorker===attestationWorker?releaseWorker:null,sourceMatch,workerMatch,receiptMatch,
  rollbackSha:sha(r?.promotionLineage?.rollbackSha,a?.promotionLineage?.rollbackSha),candidateSha:sha(r?.promotionLineage?.candidateSha,a?.promotionLineage?.candidateSha)};
}

function scarKind(revision:string):ProvenanceScarR353['kind']{
 if(revision==='R347')return'RECOVERY';if(revision==='R348')return'PROOF';if(revision==='R349')return'RENDER';if(revision.startsWith('R350'))return'TEMPORAL';if(revision==='R351'||revision==='R352')return'COMPUTE';return'AUTHORITY_CHANGE';
}
export function compileReleaseLineageR353(evidence:CurrentRuntimeEvidenceR353={}):ReleaseLineageR353{
 const binding=currentBinding(evidence),currentSha=binding.sourceMatch&&binding.workerMatch&&binding.receiptMatch?binding.releaseSha:null;
 const ordered=CANONICAL_RELEASES_R353.map(x=>({...x}));
 const bySha=new Map(ordered.map(x=>[x.sha,x]));
 if(currentSha&&!bySha.has(currentSha)){
  ordered.push({revision:'CURRENT',sha:currentSha,date:text(evidence.runtimeAttestation?.returnedAt)||text(evidence.releaseEvidence?.returnedAt)||new Date(0).toISOString(),title:'Current packaged runtime outside the static R353 historical seed',parents:[],productionRunId:null,scar:'Current first-hand runtime entered after the static historical seed; retained dynamically so lineage never freezes stale live authority.',evidenceClass:'DYNAMIC_CURRENT_RUNTIME'});
 }
 const nodes:ReleaseNodeR353[]=ordered.map((x,i)=>{
  const isCurrent=currentSha===x.sha;
  const later=ordered[i+1]?.sha||null;
  return{...x,authority:isCurrent?'CURRENT_LIVE_RETURNED':later?'SUPERSEDED':'HISTORICAL_PROVED_AT_RELEASE',currentLive:isCurrent,historicalAcceptanceOnly:!isCurrent,supersededBy:isCurrent?null:later,receiptBound:isCurrent,workerVersion:isCurrent?binding.workerVersion:null};
 });
 const edges:ReleaseEdgeR353[]=[];
 for(const node of ordered)for(const parent of node.parents)if(SHA.test(parent))edges.push({from:parent,to:node.sha,kind:'GIT_PARENT'});
 for(let i=1;i<ordered.length;i++)edges.push({from:ordered[i-1].sha,to:ordered[i].sha,kind:'CANONICAL_SUPERSESSION'});
 if(currentSha&&binding.rollbackSha&&binding.rollbackSha!==currentSha&&!edges.some(e=>e.from===binding.rollbackSha&&e.to===currentSha&&e.kind==='RUNTIME_ROLLBACK_PARENT'))edges.push({from:binding.rollbackSha,to:currentSha,kind:'RUNTIME_ROLLBACK_PARENT'});
 const scars:ProvenanceScarR353[]=nodes.map(n=>({at:n.date,revision:n.revision,sourceSha:n.sha,kind:scarKind(n.revision),summary:n.scar,currentAuthority:n.currentLive}));
 return{schema:R353_SCHEMA,revision:R353_REVISION,state:currentSha?'CURRENT_BOUND':'HOLD',currentSha,currentWorkerVersion:binding.workerVersion,nodes,edges,scars,historicalDecisions:[...HISTORICAL_DECISIONS_R353],donors:HISTORICAL_PROVENANCE_DONORS_R353,
  receiptBinding:{releaseSha:binding.releaseSha,attestationSha:binding.attestationSha,receiptSha256:binding.buildReceiptSha||binding.releaseReceiptSha||binding.attestationReceiptSha,workerVersion:binding.workerVersion,sourceMatch:binding.sourceMatch,workerMatch:binding.workerMatch,receiptMatch:binding.receiptMatch,externalPostDeployVerificationClaimed:false},boundary:R353_BOUNDARY};
}

function stable(value:any):string{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return'['+value.map(stable).join(',')+']';
 return'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
}
export async function releaseLineageSha256R353(lineage:ReleaseLineageR353){
 const payload={schema:lineage.schema,revision:lineage.revision,state:lineage.state,currentSha:lineage.currentSha,currentWorkerVersion:lineage.currentWorkerVersion,
  nodes:lineage.nodes.map(n=>({revision:n.revision,sha:n.sha,date:n.date,parents:n.parents,productionRunId:n.productionRunId,authority:n.authority,supersededBy:n.supersededBy,currentLive:n.currentLive})),
  edges:lineage.edges,scars:lineage.scars,historicalDecisions:lineage.historicalDecisions,donors:lineage.donors,receiptBinding:lineage.receiptBinding,boundary:lineage.boundary};
 const bytes=new TextEncoder().encode(stable(payload));
 if(!globalThis.crypto?.subtle)throw new Error('R353 SHA-256 requires Web Crypto');
 const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
 return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
