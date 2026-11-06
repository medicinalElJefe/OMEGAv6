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
assert.ok(/setTimeout\(\(\)=>\{[^\n]*img\.onload=null;img\.onerror=null;img\.src='';reject\(/.test(lemma),'R787 must cancel timed-out image transfers, not merely reject while retaining browser network work');
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

// R787: 64-cell source-derived lemmas do not require six full-size 900x600
// remote anchor images. Smaller real imagery reduces transfer and decode load;
// unavailable/non-material imagery must still REFUSE rather than synthesize pixels.
assert.ok(lemma.includes('&span=2.5&width=256&height=256'), 'R787 source GIBS anchors must request bounded 256px real image samples');
assert.ok(lemma.includes('NASA_GIBS_ANCHOR_UNAVAILABLE:'), 'R787 failed anchor admission must retain a visible source-specific error');
const r787Browser=fs.readFileSync('tests/r284-live-earth-browser-e2e.mjs','utf8');
for(const token of ['data-r787-lemma-state','data-r787-lemma-error','data-r787-evidence-bound','data-r787-current-anchor','R284 material source-bound SAR unavailable after 45s'])
 assert.ok(r787Browser.includes(token),'R787 production SAR source diagnostic missing '+token);
for(const token of ['data-r787-lemma-state','data-r787-lemma-error','data-r787-evidence-bound'])
 assert.ok(instrument.includes(token),'R787 truth-bound SAR instrument missing '+token);
assert.ok(r787Browser.includes('return Boolean(lemma||native)},null,{timeout:45000})'),
 'R787 must never accept an unavailable/non-source-bound SAR canvas as a live proof');


for(const token of ["sourceLayer='MODIS_Terra_CorrectedReflectance_TrueColor'","Promise.allSettled([loadFirstImage(current),loadFirstImage(previous)])","currentResult.status!=='fulfilled'||previousResult.status!=='fulfilled'","src:row.src+'&layer='+sourceLayer","sourceLayer,evidenceBound:Boolean(evidenceHash)","'NASA GIBS '+sourceLayer"])
 assert.ok(lemma.includes(token),'R788 exact paired real NASA sensor fallback/provenance missing '+token);
assert.ok(lemma.includes('catch(secondaryError){throw new Error('),'R788 fail-closed when every NASA sensor is non-material');
assert.ok(lemma.includes('try{[aAnchor,bAnchor]=await paired(currentCandidates,previousCandidates)}'),'R788 must prefer existing NASA VIIRS source before switching sensor');
assert.ok(!lemma.includes('Math.random()'),'R788 must not substitute artificial observed satellite samples');

// R790: the end-user must see which *observed optical* sensor and exact dates
// underlie the derived analytical view; no anonymous proxy promoted as native SAR.
for(const token of ['data-r790-source-layer','data-r790-current-date','data-r790-previous-date','OBSERVED NASA GIBS','DERIVED OPTICAL PROXY, NOT SAR MEASUREMENT'])
 assert.ok(instrument.includes(token),'R790 source provenance disclosure missing '+token);
for(const token of ['getAttribute(\'data-r790-source-layer\')','getAttribute(\'data-r790-current-date\')','getAttribute(\'data-r790-previous-date\')','MODIS_Terra_CorrectedReflectance_TrueColor','DERIVED OPTICAL PROXY, NOT SAR MEASUREMENT'])
 assert.ok(r787Browser.includes(token),'R790 live source provenance acceptance missing '+token);

console.log('R356.5 SATELLITE CHAIN LEMMA PASS · bounded concurrent recent GIBS current/previous anchors + returned evidence triangulated under R487 latency control · 12 derived proxy fields visible before native SAR closure · explicit DERIVED_TRIANGULATED truth class · no measurement authority inflation');
