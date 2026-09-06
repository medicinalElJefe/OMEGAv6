import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const runtime=read('src/hybridMissionRuntime.ts'),panel=read('src/HybridMissionControl.tsx'),r8=read('src/HybridMissionControlR8.tsx'),current=read('src/HybridLinkR32.tsx'),router=read('src/OmegaWorkstationFullV2.tsx'),loader=fs.existsSync(new URL('../src/specialistLoaderR109.tsx',import.meta.url))?read('src/specialistLoaderR109.tsx'):'',css=read('src/hybridMission.css');
assert.match(runtime,/addressSpace:61917364224/,'Hybrid donor 61,917,364,224 address space missing');
assert.match(runtime,/packetSpace:20736/,'20,736 packet space missing');
assert.match(runtime,/moduleCount:16/,'16 Hybrid modules missing');
assert.match(runtime,/componentCount:24/,'24 Hybrid components missing');
assert.match(runtime,/phaseCount:12/,'12 Hybrid phases missing');
assert.match(runtime,/gridRows:4608/,'4,608 donor grid rows missing');
for(const phase of ['Intent Lock','Source Intake','Fingerprint','Authority Score','Link Handshake','Conflict Pass','Merge/Quarantine','Return Packet','Runtime Sync','Proof Ledger','Package/Repair','Verification'])assert.match(runtime,new RegExp(phase.replace('/','\\/')),`missing Hybrid phase ${phase}`);
for(const component of ['IntentContract','SourceFingerprint','DonorRegistry','AdapterContract','Handshake','AuthorityScore','ConflictScan','QuarantineRule','MergeRule','ReturnPacket','ProofToken','Checksum','RollbackPoint','PatchDelta','OperatorDecision','RouteMap','NegativeSpaceMap','TopologyGraph','WorkbookSync','RuntimeSync','RendererSync','CLICommand','HealthCheck','SupportBundle'])assert.ok(runtime.includes(`'${component}'`),`missing donor component ${component}`);
for(const adapter of ['Filesystem Adapter','Workbook Adapter','Runtime Adapter','Renderer Adapter','Patch Adapter','WebSocket Adapter'])assert.ok(runtime.includes(adapter),`missing donor adapter ${adapter}`);
assert.match(runtime,/bridgeLoad\+contradiction\+bridgeLoad\*contradiction/,'exact donor Link Ratio denominator missing');
assert.match(runtime,/DEVICE_PROOF_REQUIRED/,'native device proof gate missing');
assert.match(runtime,/native action planned but not executed/,'native execution must remain truth-gated');
assert.match(runtime,/returnPacket/,'return packet compiler missing');

// Retained R8 mission architecture remains available as an advanced/donor layer.
assert.match(panel,/Compile mission/,'Hybrid donor mission compiler UI missing');
assert.match(panel,/ARCHITECTURE/,'Hybrid donor architecture view missing');
assert.match(panel,/TESTS/,'Hybrid donor test matrix view missing');
assert.match(r8,/import HybridMissionControl from '\.\/HybridMissionControl'/,'R8 wrapper must retain the prior donor mission application');
assert.match(r8,/\/api\/hybrid\/plan/,'R8 governed prompt-to-plan endpoint missing');
assert.match(r8,/\/api\/hybrid\/validate/,'R8 governed validation endpoint missing');
assert.match(r8,/DEVICE_PROOF_REQUIRED/,'R8 wrapper must retain native proof boundary');

// The ordinary 44-route Hybrid destination must now be the current R117 connection surface, not the old R8 wrapper.
assert.match(current,/import SovereignConnectionR117 from '\.\/SovereignConnectionR117'/,'current Hybrid surface must mount R117 Sovereign connection authority');
assert.match(current,/SOVEREIGN COMPUTE · HYBRID LINK · R117/,'current Hybrid surface R117 identity missing');
assert.match(current,/<SovereignConnectionR117\/>/,'current Hybrid surface must expose the clean connection experience first');
assert.match(current,/<details className='r112-hybrid-deep'>/,'advanced Hybrid diagnostics must remain progressively disclosed');
assert.match(current,/<HybridMissionControlR8 status=\{status\} record=\{record\}\/>/,'R8 mission/federation donor must remain reachable inside advanced diagnostics');
const deferredCurrent=/HybridMissionControlR109/.test(router)&&/case 'Hybrid Link':return withPhase\(<HybridMissionControlR109[^;]*,'hybrid'\)/.test(router)&&/HybridLinkR117:\(\)=>import\('\.\/HybridLinkR32'\)/.test(loader)&&/HybridMissionControlR109=lazy\(LOADERS\.HybridLinkR117\)/.test(loader)&&/'Hybrid Link':\[LOADERS\.HybridLinkR117\]/.test(loader);
assert.ok(deferredCurrent,'Hybrid Link route must resolve through the verified R109 deferred loader to the current R117 surface');
assert.match(loader,/HybridMissionControlR8:\(\)=>import\('\.\/HybridMissionControlR8'\)/,'R8 donor loader must remain retained for deep diagnostics');
assert.match(loader,/HybridMissionControlR8:LOADERS\.HybridMissionControlR8/,'R8 donor must remain explicitly recoverable in retained deep specialist authority');

assert.ok(css.length>1000,'Hybrid responsive instrumentation CSS unexpectedly absent');
for(const source of [runtime,panel,r8,current,router,loader])assert.doesNotMatch(source,/@appdeploy\/client|appdeploy\.ai/i,'AppDeploy runtime contract reintroduced');
console.log('hybrid mission invariants R118 PASS · R117 ordinary Hybrid route + R8 governed donor/diagnostics retained + proof-gated native execution');
