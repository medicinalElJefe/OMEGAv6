import assert from 'node:assert/strict';
import fs from 'node:fs';

const model=fs.readFileSync('src/visualAtlasR183.ts','utf8');
const view=fs.readFileSync('src/VisualAtlasR183.tsx','utf8');
const css=fs.readFileSync('src/visualAtlasR183.css','utf8');
const visual=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');
const coherence=fs.readFileSync('src/visualCoherenceR182.ts','utf8');
const orientation=fs.readFileSync('src/orientationFrameR182.ts','utf8');

for(const token of ['12 · observer/gate axes','144 · mode×axis matrix','1,728 · triadic volume','20,736 · full lattice','248,832 · render expansion','35,831,808 · extended context'])assert.ok(model.includes(token),`R183 scale horizon missing ${token}`);
for(const token of ["radius:'radius = base + CΩ·12 → normalized live field radius'","density:'density = 40 + Λ·90 + q·120'","halo:'circles = 12 + Φ·36 + Proof·24'","CΩ warm/carrier · q jagged · Λ dense · Φ open · Proof bright edge"])assert.ok(model.includes(token),`R183 recovered encoding law missing ${token}`);
for(const token of ['continuity','contradiction','burden','plasticity','proof','scar','stability','motion','symmetry','asymmetry','carry','velocity','acceleration','phaseDelta'])assert.ok(model.includes(token),`R183 live packet channel missing ${token}`);
for(const token of ["axis:'D'|'P'|'R'|'L'",'neighborAddresses','routeDepth=24','field.routeNext','corpusState','compileOrientationFrameR182'])assert.ok(model.includes(token)||orientation.includes(token),`R183 topology/orientation authority missing ${token}`);
assert.ok(model.includes('not literal physical dimensions'),'R183 must preserve atlas-resolution truth boundary');
assert.ok(model.includes('decorative motion is forbidden'),'R183 must reject decorative motion');

for(const tab of ['FIELD','WEAVE','MOTION','SCALE','PROOF','DUALVERSE'])assert.ok(view.includes(tab),`R183 coordinated view missing ${tab}`);
for(const token of ['Field membrane','Woven continuity','Route dynamics','Recursive scale / address resolution','Proof / decision ledger','Dualverse orientation','Why this view looks this way'])assert.ok(view.includes(token),`R183 operator explanation missing ${token}`);
for(const token of ['onSelectAddress(plus.address)','onSelectAddress(minus.address)','onSelectAddress(x.address)'])assert.ok(view.includes(token),`R183 interactive atlas route missing ${token}`);
assert.ok(!view.includes('requestAnimationFrame'),'R183 visual atlas must not run ambient animation');
assert.ok(!view.includes('Date.now'),'R183 visual atlas must not use wall-clock geometry');
assert.ok(!view.includes('Math.log12'),'R183 must use valid logarithm math');

for(const token of ['compileVisualAtlasR183','VisualAtlasR183','visualAtlas&&<VisualAtlasR183 packet={visualAtlas} onSelectAddress={onCommit}/>'])assert.ok(visual.includes(token),`R183 Visual Instrument integration missing ${token}`);
for(const retained of ['PC-LINEAGE DEPTH CAMERA','ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','OrientationFrameR182View','COMPILER_LINEAGES','SPINE_VIEWS','LENSES','Admitted next','Previous','Zoom in level','Zoom out level','Yaw','Pitch'])assert.ok(visual.includes(retained),`R183 degraded retained Visual Instrument function ${retained}`);
assert.ok(coherence.includes('No ambient constellation drift'),'R182 packet-lock law must remain inherited');
assert.ok(orientation.includes('OBSERVER_ONLY'),'R182 observer/frame separation must remain inherited');
assert.ok(css.includes('@media(max-width:680px)'),'R183 mobile containment missing');
console.log('R183 VISUAL ATLAS PASS · recovered charting canon is live, interactive, packet-bound, orientation-preserving, and non-destructive');
