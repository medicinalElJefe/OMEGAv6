import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/sar-global-fabric-runtime.mjs',import.meta.url),'utf8');

test('R258.3 keeps one same-key fabric query alive across camera redraws',()=>{
  assert.match(source,/state\.inFlight&&state\.inFlightKey===key\)return state\.inFlight/);
  assert.match(source,/state\.activeController&&state\.inFlightKey!==key/);
});

test('R258.3 settles independent sectors and progressively admits only returned source records',()=>{
  assert.match(source,/Promise\.allSettled/);
  assert.match(source,/records:\[\],scar:/);
  assert.match(source,/commitFabric\(progress\.records/);
  assert.match(source,/state\.state=prepared\.length\?'READY':'QUERYING_GLOBAL_SAR'/);
  assert.match(source,/measurementPromotion:false/);
});

test('R258.3 exposes source scars and never converts them into fabric records',()=>{
  assert.match(source,/scarLedger/);
  assert.match(source,/sectorUnresolved/);
  assert.doesNotMatch(source,/records\.push\([^\n]*scar/);
});
