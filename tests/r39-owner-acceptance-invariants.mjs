import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const law=read('src/calculusVisualLawR37.ts'),field=read('src/CalculusFieldR37.tsx'),hybrid=read('src/HybridMissionControlR8.tsx'),deck=read('src/OmegaCommandDeck.tsx'),earth=read('src/EarthNowInstrument.tsx'),observatory=read('src/EarthObservatoryR8.tsx'),nav=read('src/deepInteractionR39_2.css');
for(const role of ['ALPHA','BASE','CONSTRUCT','PRUNE','OMEGA']){assert.match(law,new RegExp(role));assert.match(field,new RegExp(role));}
assert.match(law,/operatorWeights/);assert.match(field,/operatorColor/);assert.doesNotMatch(field,/data-color-authority=['"]purple green/i);
for(const state of ['PAIRING REQUIRED','HEARTBEAT STALE','PC ONLINE','BRIDGE ERROR'])assert.match(hybrid,new RegExp(state));
assert.match(hybrid,/AGENT NOT CONNECTED|AGENT NOT RUNNING \/ UNREACHABLE/);
assert.match(hybrid,/START_OMEGA_PC_LINK\.cmd/);assert.match(hybrid,/DEVICE_PROOF_REQUIRED/);assert.match(hybrid,/authenticated heartbeat/i);
assert.match(deck,/OmegaRichText/);assert.doesNotMatch(deck,/<p>\{response\.answer\}<\/p>/);
assert.match(earth,/EXTERNAL_DEGRADED/);assert.match(earth,/drawEvidence/);assert.match(earth,/windKph/);assert.match(earth,/cloudPct/);assert.match(earth,/spaceWeather/);assert.match(earth,/seismic/);assert.match(observatory,/<EarthNowInstrument address=\{address\} evidence=\{evidence\}/);
assert.match(nav,/visibility:hidden/);assert.match(nav,/grid-template-columns:repeat\(2/);assert.match(nav,/font-size:11px/);
console.log('R39 owner acceptance invariants PASS');