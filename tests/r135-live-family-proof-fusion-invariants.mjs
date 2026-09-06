import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R135 '+msg)};
const proof=read('src/familyOperationalProofR135.ts');
const surface=read('src/OmegaBuildPotentialR133.tsx');
const css=read('src/buildPotentialR133.css');
const control=read('src/system/operationalControlPlaneR130.js');
const adapter=read('src/platformAdapter.ts');
const families=read('src/systemAtlasRuntime.ts');
const world=read('src/world/canonicalWorldContinuityR134.js');

for(const state of ['CURRENT_EXECUTION_PROOF','CURRENT_SERVICE_OBSERVATION','DECLARED_BOUNDARY_ONLY','GATE_CURRENTLY_HELD','STATIC_LINEAGE_ONLY','UNKNOWN'])must(proof.includes(state),'missing operational proof state '+state);
for(const law of ['DECLARED_FAMILY_STATUS_AND_CURRENT_OPERATIONAL_PROOF_ARE_SEPARATE_AXES','HYBRID_DEVICE_GATE_OPENS_ONLY_FROM_CURRENT_AUTHENTICATED_HEARTBEAT','HTTP_OR_CONTROL_PLANE_REACHABILITY_IS_SERVICE_OBSERVATION_NOT_NATIVE_EXECUTION','GENERIC_HEALTH_CANNOT_SATISFY_DOMAIN_SPECIFIC_EVIDENCE_GATES','R134_CANONICAL_WORLD_SCAR_PROOF_CHAIN_REMAINS_APPEND_ONLY_AUTHORITY_CONTEXT','CURRENT_OPERATIONAL_PROOF_NEVER_AUTO_PROMOTES_CANONSTATE'])must(proof.includes(law),'missing proof-fusion law '+law);
must(proof.includes("family.id==='S03'")&&proof.includes("state:'CURRENT_EXECUTION_PROOF'")&&proof.includes('pcProved(operational,hybrid)'),'Hybrid family must resolve current execution proof only through the explicit PC proof predicate');
must(proof.includes("operational?.proofBoundaries?.pcOnlineProved===true")&&proof.includes("hybrid?.nativeExecutionClaimed===true&&onlineDevices(hybrid).length>0"),'PC proof predicate must consume authenticated operational/Hybrid evidence');
must(proof.includes("family.status==='EVIDENCE_GATED'||family.status==='DEVICE_GATED'")&&proof.includes('Generic runtime health cannot satisfy this family'),'generic health must not unlock domain evidence/device gates');
must(proof.includes("family.id==='S00'")&&proof.includes("family.id==='S23'"),'canonical runtime and HTTP transport families must expose service observation without being called native execution');
must(!proof.includes('family.status=')&&!proof.includes('family.status ='),'proof overlay must never mutate declared family status');

must(surface.includes("api.get<any>('/api/system/operational')")&&surface.includes("api.get<any>('/api/hybrid/status')"),'surface must retrieve current operational and Hybrid evidence');
must(surface.includes('window.setInterval(()=>void loadProof(),15000)'),'current proof must refresh instead of becoming stale UI state');
must(surface.includes('DECLARED FAMILY STATUS')&&surface.includes('CURRENT OPERATIONAL PROOF'),'surface must display declared status and current proof as separate axes');
must(surface.includes('PC EXECUTION GATE CURRENTLY SATISFIED')&&surface.includes('CURRENT AUTHENTICATED HEARTBEAT'),'operator surface must explicitly identify authenticated PC proof');
must(surface.includes('missing runtime evidence remains unknown; declared family status is unchanged.'),'runtime errors must fail unknown instead of fabricating proof');
must(surface.includes('familyOperationalProofR135(row.family,operational,hybrid)'),'each family card must use the shared proof resolver');
must(surface.includes('R134 WORLD CONTINUITY'),'R135 UI must declare its placement on top of the admitted R134 world continuity chain');

must(control.includes('PC_ONLINE_REQUIRES_AUTHENTICATED_HEARTBEAT')&&control.includes('pcOnlineProved:summary.sovereign.authenticatedHeartbeat'),'R130 operational authority must retain heartbeat-gated PC proof');
must(adapter.includes("headers['x-omega-bridge-id']=bridge.bridgeId")&&adapter.includes("headers['x-omega-bridge-secret']=bridge.secret"),'browser operational calls must retain paired bridge proof headers');
must(families.includes("S03','Hybrid Link Software'")&&families.includes("'DEVICE_GATED'"),'declared Hybrid family boundary must remain DEVICE_GATED in the authoritative registry');
must(world.includes('APPEND_ONLY_SCAR_AND_PROOF_CHAIN')&&world.includes('PC_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT')&&world.includes('R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'),'R134 world continuity laws must remain intact beneath R135');
must(css.includes('.r135-live-proof')&&css.includes('.r135-family-live')&&css.includes('@media(max-width:620px)'),'live proof overlay must be visible and mobile responsive');
must(!css.includes('.r135-live-proof{position:fixed')&&!css.includes('.r135-family-live{position:fixed'),'proof overlay may not become a covering fixed panel');
console.log('R135 LIVE FAMILY PROOF PASS · declared family status separated from current operational proof · authenticated heartbeat exclusively unlocks current PC execution proof · R134 append-only world continuity and R125 canonical admission preserved');
