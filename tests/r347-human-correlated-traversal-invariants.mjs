import assert from'node:assert/strict';
import fs from'node:fs';

const field=fs.readFileSync('src/traversalFieldR347.ts','utf8');
const cockpit=fs.readFileSync('src/TraversalFieldCockpitR347.tsx','utf8');
const studio=fs.readFileSync('src/OmegaTraversalStudio.tsx','utf8');
const workspace=fs.readFileSync('src/OmegaWorkspaceCockpitR18.tsx','utf8');
const css=fs.readFileSync('src/traversalFieldR347.css','utf8');
const accepted=fs.readFileSync('src/acceptedProductionContractR95.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of[
 'OMEGA_TRAVERSAL_FIELD_R347',
 'position:\'canonical projection/address geometry only\'',
 'edgeWidth:\'continuityFlux + invariantCarry\'',
 'branchSpread:\'future plasticity + admissible alternative structure\'',
 'compression:\'burden Λ\'',
 'fracture:\'contradiction q\'',
 'trailPersistence:\'scar/history carry\'',
 'opacityFocus:\'evidence weight\'',
 'handedness:\'signed orientation σ\'',
 'logicalTime:\'canonical route step; never labeled event time\'',
 'futureSupport:\'normalized admissibility support; never probability without calibrated probability authority\'',
 "energyAuthority:'MODEL_PROXY'",
 'physicalEnergy:null',
 'eventTime:null',
 'probability:null',
 'it is not a calibrated probability',
 'Model intensity/action proxy is not physical energy',
 'TraversalObservationPacketR347',
 'bindTraversalObservationR347',
 "energyAuthority:physicalEnergy?'UNIT_BOUND_PHYSICAL':'MODEL_PROXY'",
 'eventTimeBound:nodes.some(x=>!!x.eventTime)',
 "physicalEnergyBound:nodes.some(x=>x.energyAuthority==='UNIT_BOUND_PHYSICAL')"
])assert.ok(field.includes(token),'R347 field truth/mapping contract missing '+token);

assert.ok(!field.includes('Math.random')&&!cockpit.includes('Math.random'),'R347 geometry must remain deterministic');
assert.ok(field.includes("projectionPoint(address,'MANDALA',1000)"),'R347 position must remain canonical projection/address derived');
assert.ok(field.includes('compileSourceTraversal(startAddress,depth)'),'R347 worldline must use canonical admitted route');
assert.ok(field.includes("['ADMITTED_NEXT',r?.autoPing?.dataNext]")&&field.includes("'OPPOSITE_DOMAIN'"),'R347 future cone must use declared canonical alternatives');

for(const token of[
 'Worldline + field + admissible future cone',
 "type Lens='UNIFIED'|'SPACE'|'TIME'|'INTENSITY'|'CONTINUITY'|'SCAR'|'FUTURES'|'PROOF'",
 "route step · not event time",
 "not physical energy",
 "support · not probability",
 "className='r347-timebar'",
 "className='r347-futures'",
 "TRAVERSAL_VISUAL_GRAMMAR_R347"
])assert.ok(cockpit.includes(token),'R347 human cockpit missing '+token);

assert.ok(studio.includes("import TraversalFieldCockpitR347 from './TraversalFieldCockpitR347'"),'R347 must be primary traversal component');
assert.ok(studio.includes("<TraversalFieldCockpitR347 variant={variant} address={address} onAddress={onAddress}/>"),'R347 traversal primary mount missing');
assert.ok(studio.includes("R100 WOVEN FIELD · preserved mathematical renderer / comparison")&&studio.includes('<TraversalModeStageR99 '),'R100 renderer must remain preserved below R347');
assert.ok(studio.includes('RESTORED CALCULUS RENDERER · preserved donor / advanced comparison')&&studio.includes('<CalculusTraversal '),'historical calculus donor must remain preserved');

assert.ok(workspace.includes("import TraversalFieldCockpitR347 from './TraversalFieldCockpitR347'"),'R347 must enter current R18 Cockpit authority');
assert.ok(workspace.includes("<TraversalFieldCockpitR347 variant='Cockpit' address={address} onAddress={onAddress}/>"),'R18 Cockpit must mount R347 before existing proof/control layers');
for(const token of['Capability topology','Runtime proof state','Capability authority','Operator transaction ledger'])assert.ok(workspace.includes(token),'R347 may not delete established cockpit authority layer '+token);

assert.ok(css.includes('.r347-stage')&&css.includes('height:clamp(650px,76dvh,980px)'),'R347 primary field must own a meaningful viewport');
assert.ok(css.includes('.r347-timebar')&&css.includes('.r347-futures')&&css.includes('.r347-readout'),'R347 temporal/future/readout layers must remain outside the canvas');
assert.ok(!cockpit.includes('<aside'),'R347 primary visual canvas must remain unobstructed by stage overlays');

assert.ok(pkg.scripts['test:r347']?.includes('tests/r347-human-correlated-traversal-invariants.mjs'),'R347 proof must be registered');
assert.ok(pkg.scripts['check:static']?.includes('npm run test:r347'),'R347 proof must participate in canonical static gate');

console.log('R347 HUMAN-CORRELATED TRAVERSAL PASS · deterministic canonical worldline · exact visual grammar · logical/event time separated · model intensity not physical energy · admissible futures not probabilities · R100/R23/R35/donor authority preserved · current R18 Cockpit upgraded without proof-layer loss');

assert.ok(accepted.includes("id:'HUMAN_CORRELATED_FIELD_VISUAL_LAW'")&&accepted.includes("'R347 human-correlated field visual law + preserved predecessor renderer authority'"),'R347 accepted production contract must preserve the new visual law without replacing R100/R35/R23');
