import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const ingress=read('src/world/verifiedReturnWorldIngressR186.ts');
const client=read('src/livingWorldExecutionClientR180.ts');
const bus=read('src/omegaOperationBusR86.ts');
const bridge=read('src/world/operationWorldBridgeR140.ts');
const r134=read('src/world/canonicalWorldContinuityR134.js');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
for(const token of [
 "R186_SCHEMA='OMEGA_VERIFIED_RETURN_WORLD_INGRESS_R186'",
 "x?.verified===true&&x?.returned===true&&x?.executionInvoked===true&&x?.state==='VERIFIED'",
 "r180?.schema==='OMEGA_LIVING_WORLD_EXECUTION_DISPATCH_R180'",
 "r180?.canonicalAdmissionAuthority==='R125'",
 "type:'PROOF_REFRESHED'",
 "proofIds:[`r146-head:${head}`]",
 "scarIds:[`verified-run:${runId}`]",
 "DUPLICATE_VERIFIED_HEADS_DO_NOT_MANUFACTURE_DUPLICATE_WORLD_SCARS",
 "solverValidityProved:false",
 "computedPhotorealRealityProved:false",
 "canonicalMutation:false",
 "canonicalAdmissionAuthority:'R125'"
])must(ingress.includes(token),`R186 ingress missing ${token}`);
must(client.includes("import {emitVerifiedReturnWorldIngressR186} from './world/verifiedReturnWorldIngressR186'"),'R180 client must bind R186 ingress');
must(client.includes('headSha256:run?.headSha256||null'),'R180 must carry the current durable R146 head into the verified dispatch result');
must(client.includes('if(packet.verified)await emitVerifiedReturnWorldIngressR186(packet)'),'R180 must emit only a packet containing VERIFIED operation returns');
must(bus.includes("window.dispatchEvent(new CustomEvent('omega-r86-operation'"),'R86 operation bus must remain the live ingress authority');
must(bridge.includes("window.addEventListener('omega-r86-operation'"),'R140 must remain the existing operation-to-world listener');
must(bridge.includes("window.dispatchEvent(new CustomEvent('omega-r140-world-frame'"),'R140 must continue publishing recomputed living-world frames');
must(r134.includes('APPEND_ONLY_SCAR_AND_PROOF_CHAIN'),'R134 append-only scar/proof authority must remain intact');
must(r134.includes("canonicalAdmissionAuthority:'R125'"),'R125-only CanonState admission boundary must remain intact');
console.log('R186 verified-return live-world ingress invariants PASS');
