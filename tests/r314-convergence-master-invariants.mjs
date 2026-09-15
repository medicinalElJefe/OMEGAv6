import fs from 'node:fs';

const master=fs.readFileSync('src/convergenceMasterR314.ts','utf8');
const ui=fs.readFileSync('src/OmegaConvergenceMasterR314.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const capability=fs.readFileSync('src/capabilityAuthority.ts','utf8');
const archiveA=fs.readFileSync('src/archiveGenomeLedgerR288.ts','utf8');
const archiveB=fs.readFileSync('src/archiveGenomeLedgerR288b.ts','utf8');

const capabilityBlock=(capability.match(/OMEGA_CAPABILITY_AUTHORITY:[^=]*=\[(.*?)\] as const;/s)||[])[1]||'';
const capabilityCount=(capabilityBlock.match(/\{name:'/g)||[]).length;
if(capabilityCount!==44)throw new Error(`R314 requires exactly 44 current canonical capability rows, found ${capabilityCount}`);
if(!master.includes("import {OMEGA_CAPABILITY_AUTHORITY,capabilityReality"))throw new Error('R314 current chart is not derived from capability authority');
if(!master.includes("ARCHIVE_GENOME_ALL_ROWS_R288"))throw new Error('R314 incomplete chart is not derived from complete archive genome authority');

const archiveIds=[...`${archiveA}\n${archiveB}`.matchAll(/id:'(AG-\d+)'/g)].map(match=>match[1]);
const uniqueArchive=[...new Set(archiveIds)];
for(let n=1;n<=22;n++){
 const id=`AG-${String(n).padStart(3,'0')}`;
 if(!uniqueArchive.includes(id))throw new Error(`R314 archive genome missing ${id}`);
}
if(uniqueArchive.length<22)throw new Error(`R314 requires at least 22 archive genome families, found ${uniqueArchive.length}`);

const stageIds=[...master.matchAll(/id:'(R314-B\d+)'/g)].map(match=>match[1]);
const uniqueStages=[...new Set(stageIds)];
if(uniqueStages.length!==18)throw new Error(`R314 requires 18 unique convergence stages, found ${uniqueStages.length}`);
for(let n=1;n<=18;n++){
 const id=`R314-B${String(n).padStart(2,'0')}`;
 if(!uniqueStages.includes(id))throw new Error(`R314 build graph missing ${id}`);
}

for(const law of [
 'BUILD_PROGRESS_REQUIRES_EVIDENCED_RESIDUAL_REDUCTION',
 'NO_REVISION_ONLY_PROGRESS',
 'NO_REPEAT_WITHOUT_NEW_EVIDENCE_OR_A_CHANGED_REPAIR_HYPOTHESIS',
 'AUTONOMOUS_SOURCE_MUTATION_IS_BRANCH_ISOLATED_ALLOWLISTED_AND_PROOF_GATED',
 'GENERATED_DOES_NOT_EQUAL_PROVED_DOES_NOT_EQUAL_DEPLOYED_DOES_NOT_EQUAL_CANON_ADMITTED',
 'SYNCHRONOUS_DATA_REQUIRES_EXPLICIT_CLOCK_FRAME_UNIT_AND_PROVENANCE_BINDING',
])if(!master.includes(law))throw new Error(`R314 convergence law missing: ${law}`);

if(!master.includes("'R314-B03'"))throw new Error('R314 lacks autonomous-loop scope repair stage');
if(!master.includes('675-row Implementation Canon reconciliation'))throw new Error('R314 lacks exact Implementation Canon reconciliation stage');
if(!master.includes('GPU hierarchical renderer and host runtime'))throw new Error('R314 lacks GPU/host convergence stage');
if(!master.includes('SAI / PSC / AGI-QTI governed intelligence'))throw new Error('R314 lacks governed intelligence convergence stage');
if(!master.includes('Full-system acceptance and continuous advancement'))throw new Error('R314 lacks terminal acceptance/continuous advancement stage');

for(const token of ['Chart 1 · What OMEGAv6 has now','Chart 2 · What remains incomplete','Chart 3 · Exact build sequence','data-r314-convergence-master'])if(!ui.includes(token))throw new Error(`R314 operator chart surface missing ${token}`);
if(!suite.includes("panel==='Consolidation'" )||!suite.includes('<OmegaConvergenceMasterR314/>'))throw new Error('R314 convergence master is not wired into Consolidation');

console.log(`R314 CONVERGENCE MASTER PASS · ${capabilityCount} capabilities · ${uniqueArchive.length} archive families · ${uniqueStages.length} build stages`);
