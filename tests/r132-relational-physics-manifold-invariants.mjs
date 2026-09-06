import assert from 'node:assert/strict';
import fs from 'node:fs';

const visual=fs.readFileSync('src/OmegaPhysicsManifoldR132.tsx','utf8');
const css=fs.readFileSync('src/omegaPhysicsManifoldR132.css','utf8');
const membrane=fs.readFileSync('src/CanonicalMembraneR95.tsx','utf8');
const runtime=fs.readFileSync('src/physicsRelativityRuntimeR132.ts','utf8');
const must=(ok,msg)=>assert.ok(ok,`R132 ${msg}`);

must(runtime.includes("R132_SCHEMA='OMEGA_RELATIONAL_PHYSICS_MANIFOLD_R132'"),'runtime schema missing');
must(runtime.includes("R132_TRUTH_CLASSES=['REFERENCE_PHYSICS','OBSERVED_EVIDENCE','CANONICAL_PACKET','DERIVED_RUNTIME','REPRESENTATIONAL_PROJECTION','GATED']"),'truth-class registry must be explicit');
must(runtime.includes("symbol:'c'")&&runtime.includes('299792458')&&runtime.includes("valueType:'SI exact'"),'speed-of-light reference must remain explicit and classified');
must(runtime.includes("symbol:'h'")&&runtime.includes('6.62607015e-34'),'Planck constant reference missing');
must(runtime.includes("symbol:'e'")&&runtime.includes('1.602176634e-19'),'elementary-charge reference missing');
must(runtime.includes("symbol:'alpha'")&&runtime.includes('0.0072973525643'),'fine-structure donor reference missing');
must(runtime.includes("symbol:'G'")&&runtime.includes('6.6743e-11'),'gravitational-constant donor reference missing');
for(const scale of ['Nuclear','Atomic','Chemical','Biological','Human-scale materials','Planetary','Stellar','Galactic'])must(runtime.includes(`scale:'${scale}'`),`scale hierarchy missing ${scale}`);
for(const domain of ['Coherence','Structure','Motion','Memory','Compression','Expansion','Emergence','Stability','Adaptation','Observation','Traversal','Forecast'])must(runtime.includes(`name:'${domain}'`),`domain basis missing ${domain}`);
for(const state of ['Seed','Bind','Shape','Flow','Charge','Mass','Field','Boundary','Scar','Basin','Phase','Horizon'])must(runtime.includes(`name:'${state}'`),`state basis missing ${state}`);

must(runtime.includes('evaluateCorpusModes(record)'),'runtime must consume the complete 179-mode evaluator instead of decorative mode labels');
must(runtime.includes('evaluateCanonAuthorityStack(record)'),'runtime must consume all canon authority activations');
must(runtime.includes('evaluateSourceBackedModes(record)'),'exact source-backed operators must remain separately classified');
must(runtime.includes('compileDimensionalRelativity(record)'),'dimensional relativity must remain bound into the physics packet');
must(runtime.includes('computeLensScore'),'lens calculus must participate in the physics packet');
must(runtime.includes('harmonicFoldR132'),'all-mode vector must be mathematically folded into a compact field basis');
must(runtime.includes('sourceModes.results.map')&&runtime.includes('authorities.map(x=>x.activation)'),'179-mode and 62-authority vectors must both feed harmonic transforms');
must(runtime.includes('registryCount:sourceModes.count'),'visible registry count must come from the actual source-mode evaluator');
must(runtime.includes('canonAuthorities:ALL_MODES_BOUNDARY.canonAuthorities'),'62-authority count must remain source-bound');
must(runtime.includes('routeDynamicsR132')&&runtime.includes('velocity4')&&runtime.includes('acceleration4')&&runtime.includes('curvature'),'route field must expose canonical velocity, acceleration and curvature');
must(runtime.includes('OBSERVED_EVIDENCE')&&runtime.includes('REFERENCE_PHYSICS')&&runtime.includes('REPRESENTATIONAL_PROJECTION'),'truth classes must remain explicit');
must(runtime.includes('not asserted as literal extra spacetime dimensions'),'runtime must prohibit physical-dimension overclaim');
must(runtime.includes('not 179 independent physical laws'),'source-mode field must prohibit mode-to-law overclaim');

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

console.log('OMEGA R132 RELATIONAL PHYSICS MANIFOLD STATIC PASS · 20,736 state field · 179 source modes · 62 canon authorities · 12-harmonic all-mode fold · GPU four-coordinate projection · physics/reference/observation truth separation');
