import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compilePhysicsRelativityR132,harmonicFoldR132,R132_REFERENCE_CONSTANTS,R132_SCALE_HIERARCHY,R132_TRUTH_CLASSES} from '../src/physicsRelativityRuntimeR132.ts';

const visual=fs.readFileSync('src/OmegaPhysicsManifoldR132.tsx','utf8');
const css=fs.readFileSync('src/omegaPhysicsManifoldR132.css','utf8');
const membrane=fs.readFileSync('src/CanonicalMembraneR95.tsx','utf8');
const runtime=fs.readFileSync('src/physicsRelativityRuntimeR132.ts','utf8');
const must=(ok,msg)=>assert.ok(ok,`R132 ${msg}`);

const packet=compilePhysicsRelativityR132(11498);
assert.equal(packet.schema,'OMEGA_RELATIONAL_PHYSICS_MANIFOLD_R132');
assert.equal(packet.sourceModeField.registryCount,179,'all 179 source mode evaluations must feed the R132 field');
assert.equal(packet.sourceModeField.harmonics.length,12,'source-mode field must fold to 12 deterministic harmonics');
assert.equal(packet.canonAuthorityField.count,62,'all 62 canon authorities must feed the governance field');
assert.equal(packet.canonAuthorityField.harmonics.length,12,'authority field must fold to 12 deterministic harmonics');
assert.equal(packet.hierarchy.canonicalStates,20736,'canonical state authority must remain 20,736');
assert.equal(R132_SCALE_HIERARCHY.length,8,'physics scale reference must retain Nuclear→Galactic hierarchy');
assert.equal(R132_REFERENCE_CONSTANTS.length,5,'reference constants set must be explicit and bounded');
for(const x of Object.values(packet.field))assert.ok(Number.isFinite(x)&&x>=0&&x<=1,'field scalar outside normalized range');
for(const x of harmonicFoldR132([0,.25,.5,.75,1],12))assert.ok(Number.isFinite(x.amplitude)&&x.amplitude>=0&&x.amplitude<=1,'harmonic fold must stay bounded');
for(const label of ['REFERENCE_PHYSICS','OBSERVED_EVIDENCE','CANONICAL_PACKET','DERIVED_RUNTIME','REPRESENTATIONAL_PROJECTION','GATED'])assert.ok(R132_TRUTH_CLASSES.includes(label),'truth class missing '+label);

must(runtime.includes('evaluateCorpusModes(record)'),'runtime must consume the complete 179-mode evaluator instead of decorative mode labels');
must(runtime.includes('evaluateCanonAuthorityStack(record)'),'runtime must consume all canon authority activations');
must(runtime.includes('compileDimensionalRelativity(record)'),'dimensional relativity must remain bound into the physics packet');
must(runtime.includes('computeLensScore'),'lens calculus must participate in the physics packet');
must(runtime.includes('harmonicFoldR132'),'all-mode vector must be mathematically folded into a compact field basis');
must(runtime.includes('OBSERVED_EVIDENCE')&&runtime.includes('REFERENCE_PHYSICS')&&runtime.includes('REPRESENTATIONAL_PROJECTION'),'truth classes must remain explicit');
must(runtime.includes('not asserted as literal extra spacetime dimensions'),'runtime must prohibit physical-dimension overclaim');

must(visual.includes("getContext('webgl2'"),'primary manifold must use a GPU WebGL2 field rather than a static chart');
must(visual.includes('p.xw=r2')&&visual.includes('p.yw=r2')&&visual.includes('p.zw=r2'),'GPU projection must perform four-coordinate plane rotations before 3D projection');
must(visual.includes("'FIELD'|'MOTION'|'SCALE'|'FORCES'|'PROOF'|'EARTH'"),'physics scene deck must preserve distinct field/motion/scale/force/proof/Earth views');
must(visual.includes('routeAddresses.has(i)'),'admitted route must be expressed inside the volume rather than as an unrelated chart');
must(visual.includes("sigma===1?'OUTVERSE +':'INVERSE −'"),'signed orientation must be factored from structure');
must(visual.includes('No observation is synthesized.'),'missing observation must stay missing');
must(visual.includes('Reference force hierarchy is kept separate from OMEGA representation geometry.'),'reference force data must not silently become canonical geometry');
must(visual.includes('All 179 scores are folded into 12 harmonic deformation channels'),'visible mode-field statement must match runtime behavior');

must(css.includes('grid-template-areas')&&css.includes('@media(max-width:720px)'),'manifold must have responsive desktop/mobile layout');
must(css.includes('.r132-camera')&&css.includes('.r132-stage-hud'),'controls and truth HUD must remain edge-mounted rather than covering the central volume');
must(membrane.includes("import OmegaPhysicsManifoldR132 from './OmegaPhysicsManifoldR132'"),'Home source membrane must mount R132');
must(membrane.includes('homeComposite&&<OmegaPhysicsManifoldR132'),'R132 must be the primary compact Home visual');
must(membrane.includes('CANONICAL SOURCE MEMBRANE · OPEN 20,736-CELL INSPECTION SURFACE'),'canonical membrane source-truth inspection must remain reachable');

console.log('OMEGA R132 RELATIONAL PHYSICS MANIFOLD PASS · 20,736 state field · 179 source modes · 62 canon authorities · 12-harmonic all-mode fold · GPU four-coordinate projection · physics/reference/observation truth separation');
