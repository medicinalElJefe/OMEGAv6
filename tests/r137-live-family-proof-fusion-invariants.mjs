import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R137 '+msg)};
const proof=read('src/familyOperationalProofR137.ts');
const surface=read('src/OmegaBuildPotentialR133.tsx');
const css=read('src/liveFamilyProofR137.css');
const control=read('src/system/operationalControlPlaneR130.js');
const adapter=read('src/platformAdapter.ts');
const families=read('src/systemAtlasRuntime.ts');
const world=read('src/world/canonicalWorldContinuityR134.js');
const woven=read('src/wovenRelativityRuntimeR134.ts');
const living=read('src/world/livingWorldFrameR136.js');

for(const state of ['CURRENT_EXECUTION_PROOF','CURRENT_SERVICE_OBSERVATION','DECLARED_BOUNDARY_ONLY','GATE_CURRENTLY_HELD','STATIC_LINEAGE_ONLY','UNKNOWN'])must(proof.includes(state),'missing proof state '+state);
for(const law of ['DECLARED_FAMILY_STATUS_AND_CURRENT_OPERATIONAL_PROOF_ARE_SEPARATE_AXES','HYBRID_DEVICE_GATE_OPENS_ONLY_FROM_CURRENT_AUTHENTICATED_HEARTBEAT','HTTP_OR_CONTROL_PLANE_REACHABILITY_IS_SERVICE_OBSERVATION_NOT_NATIVE_EXECUTION','GENERIC_HEALTH_CANNOT_SATISFY_DOMAIN_SPECIFIC_EVIDENCE_GATES','R134_CANONICAL_WORLD_SCAR_PROOF_CHAIN_REMAINS_APPEND_ONLY_AUTHORITY_CONTEXT','R134_WOVEN_RELATIVITY_CONTINUUM_REMAINS_STRUCTURAL_REFERENCE_AND_ROUTE_CONTEXT','R136_LIVING_WORLD_FRAME_REMAINS_CURRENT_EVIDENCE_MISSION_PROJECTION_CONTEXT','CURRENT_PROOF_MAY_ADVANCE_NEXT_ACTION_WITHOUT_REWRITING_DECLARED_STATUS','CURRENT_OPERATIONAL_PROOF_NEVER_AUTO_PROMOTES_CANONSTATE'])must(proof.includes(law),'missing law '+law);
must(proof.includes("family.id==='S03'")&&proof.includes("state:'CURRENT_EXECUTION_PROOF'")&&proof.includes('pcProved(operational,hybrid)'),'Hybrid execution proof must be heartbeat resolved');
must(proof.includes("operational?.proofBoundaries?.pcOnlineProved===true")&&proof.includes("hybrid?.nativeExecutionClaimed===true&&onlineDevices(hybrid).length>0"),'PC proof predicate must use authenticated operational/Hybrid evidence');
must(proof.includes("family.status==='EVIDENCE_GATED'||family.status==='DEVICE_GATED'")&&proof.includes('Generic runtime health cannot satisfy this family'),'generic health must not unlock gated families');
must(proof.includes('currentNextActionR137')&&proof.includes('bounded authenticated PC workload')&&proof.includes('R136 living-world evidence frame'),'proved Hybrid must advance into bounded workload + receipt/replay evidence');
const statusAssignments=[...proof.matchAll(/family\.status\s*=(?!=)/g)];must(statusAssignments.length===0,'overlay must never mutate declared family status');

must(surface.includes("api.get<any>('/api/system/operational')")&&surface.includes("api.get<any>('/api/hybrid/status')")&&surface.includes('window.setInterval(()=>void loadProof(),15000)'),'surface must refresh operational + Hybrid proof');
must(surface.includes('BUILD POTENTIAL / RESTORATION MAP')&&surface.includes('CURRENT TRUTH')&&surface.includes('CURRENT OPERATIONAL PROOF')&&surface.includes('CURRENT NEXT DEVELOPMENT ACTION'),'R133 language and R137 separation must coexist');
must(proof.includes('PC EXECUTION GATE CURRENTLY SATISFIED')&&surface.includes('proof.label')&&surface.includes('CURRENT AUTHENTICATED HEARTBEAT'),'resolver/UI must jointly identify authenticated PC proof');
must(surface.includes('missing runtime evidence remains unknown; declared family status is unchanged.'),'runtime failures must fail unknown');
must(surface.includes("import './liveFamilyProofR137.css'")&&css.includes('.r137-live-proof')&&css.includes('.r137-family-live'),'R137 additive presentation layer must be mounted');
must(!css.includes('position:fixed')&&css.includes('@media(max-width:620px)'),'R137 proof UI must be non-covering and mobile responsive');

must(control.includes('PC_ONLINE_REQUIRES_AUTHENTICATED_HEARTBEAT')&&control.includes('pcOnlineProved:summary.sovereign.authenticatedHeartbeat'),'R130 heartbeat proof authority must remain intact');
must(adapter.includes("headers['x-omega-bridge-id']=bridge.bridgeId")&&adapter.includes("headers['x-omega-bridge-secret']=bridge.secret"),'paired browser requests must preserve bridge credentials');
must(families.includes("S03','Hybrid Link Software'")&&families.includes("'DEVICE_GATED'"),'S03 declared boundary must remain DEVICE_GATED');
must(world.includes('APPEND_ONLY_SCAR_AND_PROOF_CHAIN')&&world.includes('R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'),'R134 world chain must remain intact');
must(woven.includes('DERIVED_ROUTE_CANDIDATE')&&woven.includes('144 -> 1,728 -> 20,736 are adaptive atlas/address resolution levels, not literal spacetime dimensions.'),'R134 woven truth/dimension boundary must remain intact');
must(living.includes('CURRENT_EVIDENCE_PRECEDES_CURRENT_TRUTH')&&living.includes('HYBRID_ONLINE_REQUIRES_CURRENT_AUTHENTICATED_HEARTBEAT')&&living.includes('R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'),'R136 living world evidence/heartbeat/admission laws must remain intact');
console.log('R137 LIVE FAMILY PROOF PASS · R136 living world + both R134 continuities + R133 build potential + authenticated Hybrid proof separation preserved');
