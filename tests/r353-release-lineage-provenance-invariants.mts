import assert from'node:assert/strict';
import fs from'node:fs';
import{B058_DECISION_EXCERPT_R353,CANONICAL_RELEASES_R353,HISTORICAL_DECISIONS_R353,HISTORICAL_PROVENANCE_DONORS_R353,compileReleaseLineageR353,parseHistoricalDecisionRecordsR353,releaseLineageSha256R353,R353_BOUNDARY,R353_SCHEMA}from'../src/system/releaseLineageR353';

const currentSha='3aafd7d0aacbcc08dc9a53925435b0e84229d2b7',worker='5d4ebb43-ca0c-4349-994a-c5d5f20a6cd3',receipt='a'.repeat(64);
const evidence={releaseEvidence:{schema:'OMEGA_RELEASE_EVIDENCE_V1',source:{sha:currentSha},promotionLineage:{promotedMergeSha:currentSha,rollbackSha:'fe2e2fdb5b9c2fda69c099862cd24332bc19a00c'},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},runtimeAttestation:{schema:'OMEGA_RUNTIME_DEPLOYMENT_ATTESTATION_R144',source:{sha:currentSha},bindings:{sourceSha:currentSha,packageReceiptSha256:receipt,cloudflareVersionId:worker},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},buildReceipt:{receiptSha256:receipt}};
const lineage=compileReleaseLineageR353(evidence);
assert.equal(lineage.schema,R353_SCHEMA);assert.equal(lineage.state,'CURRENT_BOUND');assert.equal(lineage.currentSha,currentSha);assert.equal(lineage.currentWorkerVersion,worker);
assert.equal(lineage.receiptBinding.sourceMatch,true);assert.equal(lineage.receiptBinding.workerMatch,true);assert.equal(lineage.receiptBinding.receiptMatch,true);assert.equal(lineage.receiptBinding.externalPostDeployVerificationClaimed,false);
const current=lineage.nodes.filter(x=>x.currentLive);assert.equal(current.length,1);assert.equal(current[0].sha,currentSha);assert.equal(current[0].authority,'CURRENT_LIVE_RETURNED');assert.equal(current[0].historicalAcceptanceOnly,false);
for(const n of lineage.nodes.filter(x=>!x.currentLive)){assert.equal(n.historicalAcceptanceOnly,true);assert.notEqual(n.authority,'CURRENT_LIVE_RETURNED')}
assert.equal(lineage.nodes[0].authority,'SUPERSEDED');assert.ok(lineage.edges.some(e=>e.kind==='CANONICAL_SUPERSESSION'&&e.to===currentSha));assert.equal(lineage.scars.length,lineage.nodes.length);
assert.equal(lineage.historicalDecisions.length,4);assert.ok(lineage.historicalDecisions.every(x=>x.authority==='HISTORICAL_ONLY'&&x.currentAuthority===false));
const parsed=parseHistoricalDecisionRecordsR353(B058_DECISION_EXCERPT_R353,'B058');assert.equal(parsed.length,4);assert.deepEqual(parsed.map(x=>x.section),['One renderer packet','One canonical Field authority','Exact NOAA frame evidence','Remaining authenticated boundary']);assert.ok(parsed.every(x=>x.source==='B058'&&x.authority==='HISTORICAL_ONLY'));

const mismatch=compileReleaseLineageR353({releaseEvidence:{source:{sha:currentSha},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},runtimeAttestation:{source:{sha:'fe2e2fdb5b9c2fda69c099862cd24332bc19a00c'},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},buildReceipt:{receiptSha256:receipt}});
assert.equal(mismatch.state,'HOLD');assert.equal(mismatch.currentSha,null);assert.equal(mismatch.nodes.filter(x=>x.currentLive).length,0);

const workerMismatch=compileReleaseLineageR353({releaseEvidence:{source:{sha:currentSha},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},runtimeAttestation:{source:{sha:currentSha},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:'11111111-1111-4111-8111-111111111111'}},buildReceipt:{receiptSha256:receipt}});
assert.equal(workerMismatch.state,'HOLD');assert.equal(workerMismatch.currentSha,null);

const receiptMismatch=compileReleaseLineageR353({releaseEvidence:{source:{sha:currentSha},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},runtimeAttestation:{source:{sha:currentSha},packageReceipt:{receiptSha256:'b'.repeat(64)},runtimeVersion:{id:worker}},buildReceipt:{receiptSha256:receipt}});
assert.equal(receiptMismatch.state,'HOLD');assert.equal(receiptMismatch.currentSha,null);

const futureSha='1111111111111111111111111111111111111111';
const dynamic=compileReleaseLineageR353({releaseEvidence:{source:{sha:futureSha},promotionLineage:{rollbackSha:currentSha},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},runtimeAttestation:{source:{sha:futureSha},packageReceipt:{receiptSha256:receipt},runtimeVersion:{id:worker}},buildReceipt:{receiptSha256:receipt}});
assert.equal(dynamic.state,'CURRENT_BOUND');assert.equal(dynamic.nodes.at(-1)?.sha,futureSha);assert.equal(dynamic.nodes.at(-1)?.evidenceClass,'DYNAMIC_CURRENT_RUNTIME');assert.ok(dynamic.edges.some(e=>e.kind==='RUNTIME_ROLLBACK_PARENT'&&e.from===currentSha&&e.to===futureSha));

const h1=await releaseLineageSha256R353(lineage),h2=await releaseLineageSha256R353(compileReleaseLineageR353(evidence));assert.match(h1,/^[0-9a-f]{64}$/);assert.equal(h1,h2);
const changed=compileReleaseLineageR353(evidence);changed.scars=[...changed.scars,{...changed.scars[0],summary:'changed'}];assert.notEqual(await releaseLineageSha256R353(changed),h1);

assert.equal(CANONICAL_RELEASES_R353.length,7);assert.equal(new Set(CANONICAL_RELEASES_R353.map(x=>x.sha)).size,7);assert.ok(CANONICAL_RELEASES_R353.every(x=>/^[0-9a-f]{40}$/.test(x.sha)&&x.productionRunId));
for(let i=1;i<CANONICAL_RELEASES_R353.length;i++)assert.ok(new Date(CANONICAL_RELEASES_R353[i].date)>=new Date(CANONICAL_RELEASES_R353[i-1].date));
assert.ok(R353_BOUNDARY.includes('Historical')&&R353_BOUNDARY.includes('R125'));

const core=fs.readFileSync('src/system/releaseLineageR353.ts','utf8'),surface=fs.readFileSync('src/OmegaReleaseLineageR353.tsx','utf8'),suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8'),doc=fs.readFileSync('R353_RELEASE_LINEAGE_PROVENANCE_SCARS.md','utf8');
for(const token of['/api/release-evidence','/api/runtime-attestation','/omega-build-receipt.json','CURRENT PROOF HOLD','Historical decision scars','Historical provenance donors'])assert.ok(surface.includes(token),`R353 surface missing ${token}`);
for(const token of['OmegaReleaseLineageR353','Evidence & Proof'])assert.ok(suite.includes(token),`R353 suite integration missing ${token}`);
for(const forbidden of['canonicalMutation:true','externalPostDeployVerificationClaimed:true','1mzBI7bTvXchYoG5VV7Wi8GfpTxgac4kL','1VEa4525VYM-hK-hqcvewUSsaJnSORgPk','1jnek3yb7jN9eoVWZQMXe0UA5JnGehEh0WS13AeiSSso'])assert.ok(!(core+surface+doc).includes(forbidden),`R353 leaked or claimed forbidden token ${forbidden}`);
assert.ok(HISTORICAL_PROVENANCE_DONORS_R353.every(x=>x.authority==='HISTORICAL_ONLY'));assert.equal(HISTORICAL_DECISIONS_R353.length,4);
console.log('R353 RELEASE LINEAGE PASS · canonical merge spine normalized · exact production run bindings retained · supersession graph + parsed B058 decision scars · deterministic SHA-256 lineage digest · current live slot requires source/Worker/package agreement · historical receipts never promoted to present authority · Drive donor IDs excluded · R125/R141/R146/R147/ci authorities unchanged');
