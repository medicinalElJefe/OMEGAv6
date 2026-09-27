import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync('src/SARLiveTruthR285.tsx','utf8');
const instrument=fs.readFileSync('src/SARTruthInstrumentR280.tsx','utf8');
const liveCss=fs.readFileSync('src/sarLiveR285.css','utf8');
const presentation=fs.readFileSync('src/sarPresentationR3563.css','utf8');

for(const token of ['Search SAR location','Find location','Use my location','/api/earth/geocode?q=','r3564-sar-results','r3564-sar-coords'])assert.ok(live.includes(token),`R356.4 place-first SAR targeting missing ${token}`);
assert.ok(!live.includes('<label>LAT<input'),'R356.4 SAR must not require manual latitude entry as the primary control');
assert.ok(!live.includes('<label>LON<input'),'R356.4 SAR must not require manual longitude entry as the primary control');
assert.ok(!live.includes('className="r309-sar-assets" open'),'R356.4 advanced evidence stacks must be collapsed by default');
assert.ok(live.includes('contextPreviewUrl={picked?.previewUrl'),'R356.4 must carry returned preview context into the analytical instrument');

for(const token of ['contextPreviewUrl?:string','r3564-context-preview','r3564-mini-preview','r3564-lens-held','Visible backdrop = returned catalogue preview context only'])assert.ok(instrument.includes(token)||presentation.includes(token),`R356.4 truthful nonblank SAR state missing ${token}`);
assert.ok(instrument.includes("view==='SOURCE'&&contextPreviewUrl&&!coverage?.bound"),'SOURCE lens must use only returned catalogue preview when native field is unbound');
assert.ok(instrument.includes('allMissing&&!allowDemo'),'unbound analytical lenses must render held-state guidance instead of empty black grids');
assert.ok(presentation.includes('.r3564-context-preview')&&presentation.includes('opacity:.28'),'catalogue preview context must stay visually subordinate to proof state');
assert.ok(liveCss.includes('.r3564-sar-location')&&liveCss.includes('.r3564-sar-results'),'SAR location picker must have responsive presentation');

console.log('R356.4 EARTH/SAR OPERATIONAL REPAIR PASS · place-first targeting · exact coordinates retained · advanced evidence compacted · returned preview context visible · unbound lenses explain gates instead of rendering dead black boxes');
