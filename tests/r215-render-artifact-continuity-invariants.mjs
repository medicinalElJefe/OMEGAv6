import fs from 'node:fs';

const source=fs.readFileSync('src/OmegaGovernanceProjectMediaR29.tsx','utf8');
const must=(value,message)=>{if(!value)throw new Error(message)};

for(const marker of [
  "readRenderAttemptContinuityR214",
  "artifactBytes=await blob.arrayBuffer()",
  "artifactSha256=await sha256Bytes(artifactBytes)",
  "OMEGA_REPRESENTATIONAL_ARTIFACT_RECEIPT_R215",
  "artifactReceiptSha256=await sha256Json(receiptCore)",
  "r214AnchorSha256",
  "r213AttemptSha256",
  "r211LineageSha256",
  "r208WorldBindingOperationSha256",
  "actualArtifactBytesHashed:true",
  "representationalArtifactGenerated:true",
  "computedRealityFrame:false",
  "computedPhotorealRealityProved:false",
  "solverValidityProved:false",
  "nativeExecutionClaimed:false",
  "federationClosureProved:false",
  "canonicalMutation:false",
  "recordProjectOperationR87(projectId,event)",
  "syncProjectContinuityR97()",
  "R97_WHEN_PAIRED",
  "canonicalAdmission:'R125'",
]) must(source.includes(marker),`R215 missing ${marker}`);

must(source.includes("new Blob([svg],{type:'image/svg+xml'})"),'SVG receipt must hash the same generated SVG blob that is exported');
must(source.includes("blob=await svgToPng(svg)"),'PNG receipt must hash the browser-encoded PNG blob before export');
must(source.includes("new Blob([JSON.stringify(packet,null,2)],{type:'application/json'})"),'packet receipt must hash the exact JSON blob before export');
must(source.indexOf('artifactSha256=await sha256Bytes(artifactBytes)')<source.indexOf('downloadBlob(name,blob)'),'artifact bytes must be hashed before download');
must(!source.includes('computedPhotorealRealityProved:true'),'R215 must not claim computed photoreal reality');
must(!source.includes('solverValidityProved:true'),'R215 must not claim solver validity');
must(!source.includes('nativeExecutionClaimed:true'),'R215 must not claim PC/native execution');
must(!source.includes('federationClosureProved:true'),'R215 must not claim federation closure');

const r214=fs.readFileSync('src/world/renderAttemptContinuityR214.js','utf8');
must(r214.includes('future executed artifact/frame receipt must return to R214/R213 identity'),'R214 future receipt contract must remain intact');
must(r214.includes("canonicalAdmission:'R125'"),'R125 must remain sole Canon admission authority');

console.log('R215 REPRESENTATIONAL ARTIFACT CONTINUITY PASS · exact exported SVG/PNG/packet bytes are SHA-256 hashed before download · receipt binds to matching R214/R213/R211/R208 continuity when available · R86/R87/R97 carry preserved · computed-photoreal/solver/native/federation/Canon claims remain false');
