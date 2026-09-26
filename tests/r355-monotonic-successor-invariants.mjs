import assert from'node:assert/strict';
import fs from'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const navigation=fs.readFileSync('src/navigationRegistry.ts','utf8');
const capability=fs.readFileSync('src/capabilityAuthority.ts','utf8');
const app=fs.readFileSync('src/App.tsx','utf8');
const core=fs.readFileSync('src/system/proofBoundTemporalTraversalR355.ts','utf8');

const surfaceBlock=navigation.slice(navigation.indexOf('export const OMEGA_NAVIGATION=['),navigation.indexOf('export const OMEGA_NAV_GROUPS'));
const surfaces=[...surfaceBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
const capabilityBlock=(capability.match(/OMEGA_CAPABILITY_AUTHORITY:readonly CapabilityContract\[]=\[(.*?)\] as const;/s)||[])[1]||'';
const capabilities=[...capabilityBlock.matchAll(/\{name:'([^']+)'/g)].map(x=>x[1]);

assert.equal(surfaces.length,44,'R355 successor may not reduce the 44-route R354 product surface');
assert.equal(new Set(surfaces).size,44,'R355 route surface must remain unique');
assert.equal(capabilities.length,44,'R355 successor may not reduce the 44 capability-authority rows');
assert.deepEqual(new Set(capabilities),new Set(surfaces),'R355 route and capability authorities must still cover the same complete product surface');

const revisions=[347,348,349,350,351,352,353,354,355];
for(const r of revisions){
 const script=`test:r${r}`;
 assert.ok(pkg.scripts[script],`R355 successor missing inherited proof script ${script}`);
 assert.ok(pkg.scripts['check:static']?.includes(`npm run ${script}`),`R355 canonical static gate dropped ${script}`);
}
let last=-1;
for(const r of revisions){
 const pos=pkg.scripts['check:static'].indexOf(`npm run test:r${r}`);
 assert.ok(pos>last,`R355 proof ordering regressed at R${r}`);
 last=pos;
}

for(const file of[
 'tests/r347-human-correlated-traversal-invariants.mjs',
 'tests/r348-unified-convergence-invariants.mjs',
 'tests/r349-hardware-woven-field-invariants.mts',
 'tests/r350-temporal-checkpoint-replay-invariants.mts',
 'tests/r351-gpu-packet-mirror-invariants.mts',
 'tests/r352-webgpu-compute-render-state-invariants.mts',
 'tests/r353-release-lineage-provenance-invariants.mts',
 'tests/r354-proof-bound-scene-convergence-invariants.mts',
 'tests/r355-proof-bound-temporal-scene-traversal-invariants.mts'
])assert.ok(fs.existsSync(file),`R355 successor lost inherited proof asset ${file}`);

for(const token of[
 "import OmegaUnifiedConvergenceR348 from './OmegaUnifiedConvergenceR348'",
 "import OmegaHardwareFieldR349 from './OmegaHardwareFieldR349'",
 "import OmegaTemporalCheckpointR350 from './OmegaTemporalCheckpointR350'",
 "import OmegaGpuPacketMirrorR351 from './OmegaGpuPacketMirrorR351'",
 "import OmegaGpuComputeR352 from './OmegaGpuComputeR352'",
 "import OmegaReleaseLineageR353 from './OmegaReleaseLineageR353'",
 "import OmegaProofBoundSceneR354 from './OmegaProofBoundSceneR354'",
 "import OmegaProofBoundTemporalTraversalR355 from './OmegaProofBoundTemporalTraversalR355'",
 '<OmegaUnifiedConvergenceR348 record={record} status={status}/>',
 '<OmegaHardwareFieldR349 address={address}/>',
 '<OmegaTemporalCheckpointR350/>',
 '<OmegaGpuPacketMirrorR351/>',
 '<OmegaGpuComputeR352/>',
 '<OmegaProofBoundSceneR354/>',
 '<OmegaProofBoundTemporalTraversalR355/>',
 '<FullRestorationConvergenceR168',
 '<OmegaMaximumCockpitR126',
 '<ReflexAutonomicR164/>',
 '<OmegaAutonomicR125/>',
 '<OmegaOrganismR123/>',
 '<OmegaSwarmR121'
])assert.ok(suite.includes(token),`R355 successor lost predecessor convergence layer: ${token}`);

assert.ok(suite.includes("if(panel==='Evidence & Proof')")&&suite.includes('<OmegaReleaseLineageR353/>'),'R353 provenance must remain directly reachable after R355');
for(const token of['installLivingWorldOperationBridgeR140','installRuntimeAttestationWorldScarR145','installDurableWorldHeadContinuityR149','installReflexOperationIngressR160','installMissionWorldHeadBindingR208','installFederationLedgerWorldObserverR173','installLivingWorldProofMembraneR1901','installLivingWorldIntelligenceProofR196','installEvidenceBoundSceneIngressR2022'])assert.ok(app.includes(token),`R355 successor lost runtime bridge ${token}`);

for(const law of['SUCCESSOR_MUST_PRESERVE_R354_CAPABILITY_FLOOR','SUCCESSOR_MUST_RETAIN_ALL_R347_THROUGH_R354_PROOF_GATES','SUCCESSOR_MUST_RETAIN_CURRENT_ROUTE_AND_CAPABILITY_AUTHORITY','SUCCESSOR_FEATURES_ARE_ADDITIVE_NOT_REPLACEMENT'])assert.ok(core.includes(law),`R355 missing monotonic successor law ${law}`);

console.log('R355 MONOTONIC SUCCESSOR PASS · 44/44 routes + capability authorities preserved · R347→R354 proof chain retained in canonical static gate · R348→R354 convergence layers remain mounted · legacy convergence/runtime bridges retained · R355 is additive, not a lesser replacement');
