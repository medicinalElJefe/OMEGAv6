import assert from 'node:assert/strict';
import worker from '../src/workerR116.js';
import {manifestR130} from '../src/system/operationalControlPlaneR130.js';
import {R156_SCHEMA,R156_SCAR_SCHEMA,R156_LAWS,compileOrganismReflexR156,organismReflexManifestR156} from '../src/system/organismReflexR156.js';

const manifest=organismReflexManifestR156();
assert.equal(manifest.ok,true);
assert.equal(manifest.schema,R156_SCHEMA);
assert.equal(manifest.inherits.capability_families,15);
assert.equal(manifest.inherits.canonical_admission,'R125');
assert.ok(R156_LAWS.includes('CONTRADICTION_BECOMES_SCAR_AND_FUTURE_ROUTING_INPUT'));
assert.ok(R156_LAWS.includes('R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'));

const control=manifestR130();
assert.equal(control.entrypoint,'src/workerR116.js');
assert.equal(control.organization.canonicalAdmission,'R125');
assert.deepEqual(control.organization.reflex,['R156']);
assert.equal(control.organismReflex.schema,R156_SCHEMA);
assert.equal(control.modules.at(-1).id,'CONTROL_PLANE');
assert.ok(control.modules.some(x=>x.id==='ORGANISM_REFLEX'&&x.revision==='R156'&&x.authority==='CROSS_FAMILY_ROUTING_AND_SCAR_CARRY_NOT_EXECUTION_NOT_CANON'));

const publicManifestResponse=await worker.fetch(new Request('https://omegav6.jeffdeweyeljefe.workers.dev/api/system/manifest'),{});
assert.equal(publicManifestResponse.status,200);
const publicManifest=await publicManifestResponse.json();
assert.equal(publicManifest.entrypoint,'src/workerR116.js');
assert.equal(publicManifest.organismReflex.schema,R156_SCHEMA);
assert.equal(publicManifest.organismReflex.inherits.canonical_admission,'R125');

const optical=compileOrganismReflexR156({
 source_family:'OPTICAL_OPERATION',
 returned_state:'RETURNED',
 packet_id:'optical-r1532-live',
 canonical_address:1698,
 residuals:[{id:'geometry-domain','kind':'DOMAIN_MISMATCH',severity:'HIGH',summary:'Reduced-order winner lies outside stronger full-wave geometry manifold',evidence_id:'omega_tool_2755fde0b64b542c727decc9'}]
});
assert.equal(optical.ok,true);
assert.equal(optical.action,'TURN');
assert.equal(optical.scar.schema,R156_SCAR_SCHEMA);
assert.equal(optical.scar.authority,'HISTORY_CARRY_NOT_CANONSTATE');
assert.equal(optical.bounded_route.canonical_mutation,false);
assert.deepEqual(optical.bounded_route.targets.slice(0,2),['FULLWAVE_COMPUTATION','UNIVERSAL_EVIDENCE']);
assert.equal(optical.invariant_carry.canonical_address,1698);
assert.equal(optical.invariant_carry.canonstate_admission_authority,'R125');
assert.match(optical.recontextualization,/not erased/i);

const pc=compileOrganismReflexR156({
 source_family:'SOVEREIGN_BUILD',
 residuals:[{kind:'EXECUTION_UNPROVEN',severity:'HIGH',summary:'Native execution has no authenticated return receipt'}]
});
assert.equal(pc.action,'HOLD');
assert.ok(pc.bounded_route.targets.includes('FEDERATION_MACHINE'));
assert.ok(pc.bounded_route.targets.includes('CANONICAL_RUNTIME'));

const ui=compileOrganismReflexR156({
 source_family:'LIVING_VISUAL_MOTION',
 residuals:[{kind:'INTERFACE_OBSTRUCTION',severity:'MEDIUM',summary:'Navigation obscures specialist visual workspace'}]
});
assert.equal(ui.action,'TURN');
assert.ok(ui.bounded_route.targets.includes('INTERFACE_PRESERVATION'));
assert.ok(ui.bounded_route.targets.includes('LIVING_VISUAL_MOTION'));

const capacity=compileOrganismReflexR156({
 source_family:'SWARM_ORGANISM',
 residuals:[{kind:'CAPACITY_PRESSURE',severity:'CRITICAL',summary:'Mission fanout exceeds current proven executor budget'}]
});
assert.equal(capacity.action,'ESCALATE');
assert.ok(capacity.bounded_route.targets.includes('RELATIVE_CAPACITY'));
assert.equal(capacity.bounded_route.requires_execution_receipts,true);

const cycle=compileOrganismReflexR156({
 source_family:'OPTICAL_OPERATION',
 path:['FULLWAVE_COMPUTATION','UNIVERSAL_EVIDENCE'],
 residuals:[{kind:'DOMAIN_MISMATCH',severity:'HIGH'}]
});
assert.deepEqual(cycle.bounded_route.cycle_hits,['FULLWAVE_COMPUTATION','UNIVERSAL_EVIDENCE']);
assert.equal(cycle.bounded_route.targets.length,0);
assert.equal(cycle.next,'HOLD_FOR_CYCLE_REVIEW');

const unknown=compileOrganismReflexR156({source_family:'NOT_A_REAL_FAMILY',residuals:[]});
assert.equal(unknown.ok,false);
assert.equal(unknown.code,'UNKNOWN_SOURCE_FAMILY');

const noResidual=compileOrganismReflexR156({source_family:'CANONICAL_RUNTIME',residuals:[]});
assert.equal(noResidual.action,'STAY');
assert.equal(noResidual.next,'NO_CROSS_FAMILY_ACTION');

console.log(JSON.stringify({schema:R156_SCHEMA,status:'PASS',publicManifest:{entrypoint:publicManifest.entrypoint,reflex:publicManifest.organismReflex.revision,canonicalAdmission:publicManifest.organization.canonicalAdmission},optical:{action:optical.action,targets:optical.bounded_route.targets,scar:optical.scar.scar_id},pc:{action:pc.action,targets:pc.bounded_route.targets},capacity:{action:capacity.action,targets:capacity.bounded_route.targets},cycle:{state:cycle.next,hits:cycle.bounded_route.cycle_hits},boundary:manifest.truth_boundary},null,2));
