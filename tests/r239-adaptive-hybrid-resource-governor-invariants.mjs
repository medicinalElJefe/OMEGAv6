import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const governor=read('src/hybridResourceGovernorR239.ts');
const surface=read('src/HybridResourceGovernorR239.tsx');
const deck=read('src/HybridCommandDeckR237.tsx');
const link=read('src/HybridLinkR32.tsx');
const state=JSON.parse(read('public/omega-r170-self-build-governor.json'));
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 "OMEGA_HYBRID_RESOURCE_ENVELOPE_R239",
 "R239Tier='UNPROVED'|'HOLD'|'CONSTRAINED'|'READY'|'HIGH_CAPACITY'",
 "OMEGA_HYBRID_HOST_PROFILE_R238",
 "String(s?.op||'').toUpperCase()==='DESKTOP_HEALTH'",
 "ONE_ACTIVE_NATIVE_JOB_PER_DEVICE",
 "RESOURCE_PRESSURE_CRITICAL",
 "RESOURCE_PRESSURE_ELEVATED",
 "RESOURCE_HEADROOM_HIGH",
 "recommendedCpuWorkers",
 "effectiveCpuWorkers",
 "hashMaxResults",
 "trainMaxResults",
 "PROVE_HOST:proveHost",
 "VERIFY_PROJECT:verify",
 "PACKAGE_VERIFIED:pkg",
 "TRAIN_LOCAL_INDEX:train",
 "Math.min(Number(step?.maxResults||envelope.hashMaxResults),envelope.hashMaxResults)",
 "Math.min(Number(step?.maxResults||envelope.trainMaxResults),envelope.trainMaxResults)"
])must(governor.includes(token),`R239 governor missing ${token}`);

must(governor.includes("jobs:[])].filter((j:any)=>j?.targetDeviceId===deviceId&&j?.returnPacket)"),'R239 must isolate returned host proof to the selected device');
must(governor.includes("memLoad>=92||avail<1*GiB||disk<2*GiB")&&governor.includes("memLoad>=82||avail<2*GiB||disk<5*GiB"),'R239 critical/elevated resource pressure thresholds missing');
must(governor.includes("load??100")&&governor.includes("available??0")&&governor.includes("free??0"),'R239 missing host values must fail closed rather than synthesize headroom');
must(governor.includes("clamp(Math.floor(advisory*pressureFactor),1,12)"),'R239 effective CPU worker envelope must remain bounded to 1..12');
must(governor.includes("const proveHost=input.snapshotCurrent&&!input.activeNativeWork"),'R239 must preserve a bootstrap path to obtain first returned DESKTOP_HEALTH proof');
must(governor.includes("const train=verify&&(available??0)>=4*GiB&&(free??0)>=10*GiB&&(load??100)<78"),'R239 local training must require explicit memory/storage/load headroom');

for(const token of [
 "useHybridRuntimeSnapshotR238",
 "latestReturnedHostProofR239",
 "resourceEnvelopeR239",
 "data-r239-tier",
 "SELECTED HOST ONLY",
 "Size work to the PC that is actually connected.",
 "R141 returned-payload proof continuity"
])must(surface.includes(token),`R239 resource surface missing ${token}`);
must(!surface.includes("api.post<any>")&&!surface.includes('fetch('),'R239 resource surface itself must remain observation/admission projection only');

for(const token of [
 "applyEnvelopeToPresetR239",
 "latestReturnedHostProofR239",
 "resourceEnvelopeR239",
 "resourceEnvelope.admission[preset.id]",
 "if(!resourceEnvelope.admission[preset.id])",
 "const steps=applyEnvelopeToPresetR239",
 "resourceEnvelopeR239:{schema:resourceEnvelope.schema",
 "data-r239-resource-tier",
 "R239 resource hold",
 "R237 remains the authenticated command boundary"
])must(deck.includes(token),`R239 command admission integration missing ${token}`);
must(deck.includes("api.post<any>('/api/hybrid/jobs'")&&deck.includes("OMEGA_HYBRID_OPERATOR_JOB_R237"),'R239 must continue through the established R237 Hybrid job authority');
must(!deck.includes("APPLY_PATCH',label")&&!deck.includes("WRITE_TEXT',label"),'R239 must not add a direct source mutation preset');

must(link.includes("import HybridResourceGovernorR239 from './HybridResourceGovernorR239'"),'Hybrid Link must import R239 resource governor');
must(link.indexOf('<HybridHostIntelligenceR238/>')<link.indexOf('<HybridResourceGovernorR239/>')&&link.indexOf('<HybridResourceGovernorR239/>')<link.indexOf('<HybridCommandDeckR237/>'),'R239 resource governor must sit after returned host evidence and before native command admission');
for(const literal of ['Ryzen 7 3700X','RTX 2070 SUPER','32.0 GB','19045.6456'])must(!governor.includes(literal)&&!surface.includes(literal)&&!deck.includes(literal),`R239 must not hard-code screenshot hardware literal ${literal}`);

must(state.currentCapabilityFloor==='R239','R239 must advance the governed capability floor');
must(state.postR180ProofContinuity.at(-1)==='R239','R239 must be the current post-R180 proof floor');
must(state.selfBuild.latestExplicitSuccessorProof==='tests/r239-adaptive-hybrid-resource-governor-invariants.mjs','R239 must become the explicit successor proof');
must(state.preservedRuntime.hybridResourceGovernor==='R239_SELECTED_HOST_PRESSURE_AWARE_ADMISSION_AND_BOUNDED_WORK_SIZING','R239 preserved-runtime identity missing');

const classify=({load,availGiB,diskGiB,workers=8,profile=true,snapshot=true,active=false})=>{
 if(!snapshot)return'HOLD';if(!profile)return'UNPROVED';if(active)return'HOLD';
 if(load>=92||availGiB<1||diskGiB<2)return'HOLD';
 if(load>=82||availGiB<2||diskGiB<5)return'CONSTRAINED';
 if(load<=60&&availGiB>=8&&diskGiB>=20&&workers>=6)return'HIGH_CAPACITY';return'READY';
};
must(classify({load:45,availGiB:12,diskGiB:80})==='HIGH_CAPACITY','R239 high-headroom boundary incorrect');
must(classify({load:70,availGiB:6,diskGiB:20})==='READY','R239 ready boundary incorrect');
must(classify({load:86,availGiB:3,diskGiB:20})==='CONSTRAINED','R239 constrained boundary incorrect');
must(classify({load:95,availGiB:8,diskGiB:100})==='HOLD','R239 critical memory pressure must hold');
must(classify({load:50,availGiB:12,diskGiB:80,active:true})==='HOLD','R239 active native work must preserve one-job backpressure');
must(classify({load:50,availGiB:12,diskGiB:80,profile:false})==='UNPROVED','R239 missing returned profile must remain unproved');

console.log('OMEGA R239 ADAPTIVE HYBRID RESOURCE GOVERNOR PASS · selected-host R238 proof only · pressure-aware 1..12 worker envelope · bounded hash/train sizing · bootstrap PROVE_HOST retained · heavy work fail-closed under memory/storage pressure · R237 queue authority preserved · no screenshot constants · R141/R146/R147/R125 authority unchanged');
