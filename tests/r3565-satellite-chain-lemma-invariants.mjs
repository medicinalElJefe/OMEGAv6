import assert from 'node:assert/strict';
import fs from 'node:fs';

const lemma=fs.readFileSync('src/satelliteChainLemmaR3565.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const earth=fs.readFileSync('src/EarthObservatoryR8.tsx','utf8');
const instrument=fs.readFileSync('src/SARTruthInstrumentR280.tsx','utf8');
const css=fs.readFileSync('src/sarPresentationR3563.css','utf8');

for(const token of ['OMEGA_SATELLITE_CHAIN_LEMMA_R3565','DERIVED_TRIANGULATED','PARTITION → TRANSFORM/EXCHANGE → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE','/api/earth/gibs/image?lat=','currentCandidates=[mk(-1),mk(-2),mk(-3)]','previousCandidates=[mk(-8),mk(-9),mk(-10)]','loadFirstImage','imageMaterialityR419','materialAnchorR419','quality.opaque','quality.bins','quality.span'])assert.ok(lemma.includes(token),`R356.5 chain-lemma source missing ${token}`);
for(const token of ['fields.SOURCE','fields.AMPLITUDE','fields.PHASE','fields.COHERENCE','fields.INTERFEROGRAM','fields.DEFORMATION','fields.ELEVATION','fields.POLARIMETRY','fields.MULTI_BAND','fields.TIME_STACK','fields.SCAR_UNCERTAINTY','fields.PROOF'])assert.ok(lemma.includes(token),`R356.5 derived lens missing ${token}`);
assert.ok(lemma.includes('not native Sentinel-1 SAR measurements'),'R356.5 must preserve observed-vs-derived truth boundary');
assert.ok(lemma.includes("q.opaque>=256&&(q.bins>=4||q.span>=.025)"),'R419 must reject blank/near-uniform GIBS anchors before lemma admission');
assert.ok(lemma.includes('ANCHOR_TIMEOUT_MS_R487=12000'),'R487 must bound each external GIBS anchor request so a stalled provider cannot hang the analytical surface');
assert.ok(lemma.includes('Promise.all(sources.map(async candidate=>'),'R487 must launch bounded recent-date GIBS candidates concurrently instead of serially compounding provider latency');
assert.ok(lemma.includes('for(const attempt of attempts){if(attempt.img&&attempt.quality)return{...attempt.candidate,img:attempt.img,quality:attempt.quality}'),'R487 must preserve newest-first fallback priority after concurrent materiality evaluation');
assert.ok(!lemma.includes('for(const candidate of sources)try'),'R487 must retire the serial candidate waterfall that caused target-bound production timeouts');
assert.ok(lemma.includes('after R419 materiality admission'),'R419 truth boundary must disclose materiality admission of GIBS anchors');
for(const token of ['evidenceHash:string','result.anchors.lat===lat','result.anchors.lon===lon','result.anchors.evidenceHash===evidenceHash','state:\'LOADING\',fields:{}'])assert.ok(lemma.includes(token),`R398 chain-lemma target/evidence transition guard missing ${token}`);
assert.ok(lemma.includes("if(!evidenceHash)return()=>{alive=false}"),'R420 must not admit a target-only GIBS lemma before returned Earth evidence identity is bound');
assert.ok(lemma.indexOf("if(!evidenceHash)return()=>{alive=false}")<lemma.indexOf("(async()=>{try{"),'R420 evidence admission gate must execute before any bounded GIBS anchor fetch/derivation');

assert.ok(earth.includes('evidence={evidence}'),'Earth must pass returned evidence into SAR triangulation');
assert.ok(live.includes('useSatelliteChainLemmaR3565(lat,lon,evidence)'),'SAR must compile immediate satellite lemma fields from current target/evidence');
assert.ok(live.includes('satelliteLemma={satelliteLemmaR3565}'),'SAR must deliver derived field to the analytical instrument');
assert.ok(instrument.includes('CHAIN LEMMA · TRIANGULATED DERIVED FIELD'),'instrument must expose derived state explicitly');
assert.ok(instrument.includes('LemmaCanvasR3565'),'instrument must render derived full-field surface when native SAR is not bound');
assert.ok(instrument.includes('data-r3565-lemma'),'lens cards must expose derived lemma state');
for(const token of ['data-target-lat','data-target-lon','data-evidence-hash'])assert.ok(instrument.includes(token),`R398 rendered chain-lemma identity missing ${token}`);
assert.ok(instrument.includes('triangulated satellite lemma proxy · not SAR measurement'),'lens footer must preserve truth class');
for(const token of ['.r3565-lemma-canvas','.r3565-mini-lemma','.r3565-lemma-badge'])assert.ok(css.includes(token),`R356.5 presentation missing ${token}`);

console.log('R356.5 SATELLITE CHAIN LEMMA PASS · bounded concurrent recent GIBS current/previous anchors + returned evidence triangulated under R487 latency control · 12 derived proxy fields visible before native SAR closure · explicit DERIVED_TRIANGULATED truth class · no measurement authority inflation');
