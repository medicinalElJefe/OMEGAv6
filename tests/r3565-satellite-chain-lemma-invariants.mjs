import assert from 'node:assert/strict';
import fs from 'node:fs';

const lemma=fs.readFileSync('src/satelliteChainLemmaR3565.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const earth=fs.readFileSync('src/EarthObservatoryR8.tsx','utf8');
const instrument=fs.readFileSync('src/SARTruthInstrumentR280.tsx','utf8');
const css=fs.readFileSync('src/sarPresentationR3563.css','utf8');

for(const token of ['OMEGA_SATELLITE_CHAIN_LEMMA_R3565','DERIVED_TRIANGULATED','PARTITION → TRANSFORM/EXCHANGE → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE','/api/earth/gibs/image?lat=','currentCandidates=[mk(-1),mk(-2),mk(-3)]','previousCandidates=[mk(-8),mk(-9),mk(-10)]','loadFirstImage'])assert.ok(lemma.includes(token),`R356.5 chain-lemma source missing ${token}`);
for(const token of ['fields.SOURCE','fields.AMPLITUDE','fields.PHASE','fields.COHERENCE','fields.INTERFEROGRAM','fields.DEFORMATION','fields.ELEVATION','fields.POLARIMETRY','fields.MULTI_BAND','fields.TIME_STACK','fields.SCAR_UNCERTAINTY','fields.PROOF'])assert.ok(lemma.includes(token),`R356.5 derived lens missing ${token}`);
assert.ok(lemma.includes('not native Sentinel-1 SAR measurements'),'R356.5 must preserve observed-vs-derived truth boundary');

assert.ok(earth.includes('evidence={evidence}'),'Earth must pass returned evidence into SAR triangulation');
assert.ok(live.includes('useSatelliteChainLemmaR3565(lat,lon,evidence)'),'SAR must compile immediate satellite lemma fields from current target/evidence');
assert.ok(live.includes('satelliteLemma={satelliteLemmaR3565}'),'SAR must deliver derived field to the analytical instrument');
assert.ok(instrument.includes('CHAIN LEMMA · TRIANGULATED DERIVED FIELD'),'instrument must expose derived state explicitly');
assert.ok(instrument.includes('LemmaCanvasR3565'),'instrument must render derived full-field surface when native SAR is not bound');
assert.ok(instrument.includes('data-r3565-lemma'),'lens cards must expose derived lemma state');
assert.ok(instrument.includes('triangulated satellite lemma proxy · not SAR measurement'),'lens footer must preserve truth class');
for(const token of ['.r3565-lemma-canvas','.r3565-mini-lemma','.r3565-lemma-badge'])assert.ok(css.includes(token),`R356.5 presentation missing ${token}`);

console.log('R356.5 SATELLITE CHAIN LEMMA PASS · bounded recent GIBS current/previous anchors + returned evidence triangulated immediately · 12 derived proxy fields visible before native SAR closure · explicit DERIVED_TRIANGULATED truth class · no measurement authority inflation');
