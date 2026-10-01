import assert from 'node:assert/strict';
import fs from 'node:fs';

const lemma=fs.readFileSync('src/satelliteChainLemmaR3565.ts','utf8');
const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const earth=fs.readFileSync('src/EarthObservatoryR8.tsx','utf8');
const instrument=fs.readFileSync('src/SARTruthInstrumentR280.tsx','utf8');
const css=fs.readFileSync('src/sarPresentationR3563.css','utf8');

for(const token of ['OMEGA_SATELLITE_CHAIN_LEMMA_R3565','DERIVED_TRIANGULATED','PARTITION → TRANSFORM/EXCHANGE → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE','/api/earth/gibs/image?lat=','currentCandidates=[-1,-2,-3,-4,-5,-6].map(mk)','previousCandidates=[-8,-9,-10,-11,-12,-13].map(mk)','loadFirstImage','anchorSignalR419','signal.unique<8||signal.range<.04','Satellite anchor lacks material spatial signal'])assert.ok(lemma.includes(token),`R356.5/R419 chain-lemma source admission missing ${token}`);
for(const token of ['fields.SOURCE','fields.AMPLITUDE','fields.PHASE','fields.COHERENCE','fields.INTERFEROGRAM','fields.DEFORMATION','fields.ELEVATION','fields.POLARIMETRY','fields.MULTI_BAND','fields.TIME_STACK','fields.SCAR_UNCERTAINTY','fields.PROOF'])assert.ok(lemma.includes(token),`R356.5 derived lens missing ${token}`);
assert.ok(lemma.includes('not native Sentinel-1 SAR measurements'),'R356.5 must preserve observed-vs-derived truth boundary');
assert.ok(lemma.includes('visually degenerate source frames are rejected rather than promoted into a false analytical field'),'R419 must fail closed on low-signal GIBS anchors rather than synthesize analytical texture');
assert.ok(!lemma.includes('syntheticTexture')&&!lemma.includes('fabricatedTexture'),'R419 may not replace missing source signal with synthetic detail');
for(const token of ['evidenceHash:string','result.anchors.lat===lat','result.anchors.lon===lon','result.anchors.evidenceHash===evidenceHash','state:\'LOADING\',fields:{}'])assert.ok(lemma.includes(token),`R398 chain-lemma target/evidence transition guard missing ${token}`);

assert.ok(earth.includes('evidence={evidence}'),'Earth must pass returned evidence into SAR triangulation');
assert.ok(live.includes('useSatelliteChainLemmaR3565(lat,lon,evidence)'),'SAR must compile immediate satellite lemma fields from current target/evidence');
assert.ok(live.includes('satelliteLemma={satelliteLemmaR3565}'),'SAR must deliver derived field to the analytical instrument');
assert.ok(instrument.includes('CHAIN LEMMA · TRIANGULATED DERIVED FIELD'),'instrument must expose derived state explicitly');
assert.ok(instrument.includes('LemmaCanvasR3565'),'instrument must render derived full-field surface when native SAR is not bound');
assert.ok(instrument.includes('data-r3565-lemma'),'lens cards must expose derived lemma state');
for(const token of ['data-target-lat','data-target-lon','data-evidence-hash'])assert.ok(instrument.includes(token),`R398 rendered chain-lemma identity missing ${token}`);
assert.ok(instrument.includes('triangulated satellite lemma proxy · not SAR measurement'),'lens footer must preserve truth class');
for(const token of ['.r3565-lemma-canvas','.r3565-mini-lemma','.r3565-lemma-badge'])assert.ok(css.includes(token),`R356.5 presentation missing ${token}`);

console.log('R356.5/R419 SATELLITE CHAIN LEMMA PASS · bounded recent GIBS current/previous anchors admitted only with material spatial signal + returned evidence triangulated · weak/blank frames rotate through real-date fallback or fail unavailable · 12 derived proxy fields · explicit DERIVED_TRIANGULATED truth class · no synthetic detail · no measurement authority inflation');
