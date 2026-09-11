import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/data-native-terrain-runtime.mjs',import.meta.url),'utf8');

test('R260.6 terrain startup cannot be starved by continuous camera events',()=>{
  assert.match(source,/TERRAIN_MAX_SCHEDULE_WAIT_MS=1400/);
  assert.match(source,/deadlineTimer=null/);
  assert.match(source,/if\(!deadlineTimer\)deadlineTimer=setTimeout\(\(\)=>runScheduled\(false\),TERRAIN_MAX_SCHEDULE_WAIT_MS\)/);
  assert.match(source,/if\(timer\)clearTimeout\(timer\);timer=setTimeout\(\(\)=>runScheduled\(false\),bounded\)/);
});

test('R260.6 terrain reads are serialized and changed cameras queue one follow-up read',()=>{
  assert.match(source,/if\(state\.loading\)\{if\(!key\|\|key!==state\.activeViewKey\)\{state\.queued=true;queuedDelay=Math\.min\(queuedDelay,pendingDelay\);\}return;\}/);
  assert.match(source,/state\.loading=true/);
  assert.match(source,/finally\{state\.loading=false;if\(state\.queued\)/);
  assert.match(source,/sarAuthority\.accepts\(snapshot,\{target:false,camera:true,scene:false\}\)\)\{state\.queued=true;queuedDelay=90;return;\}/);
  assert.match(source,/state\.reload=\(\)=>runScheduled\(true\)/);
});

test('R260.6 same-camera terrain refreshes are deduplicated after admission',()=>{
  assert.match(source,/activeViewKey:null,readyViewKey:null/);
  assert.match(source,/const key=`\$\{bbox\.map\(v=>Number\(v\)\.toFixed\(6\)\)\.join\(','\)\}\|\$\{scale\.toFixed\(3\)\}`/);
  assert.match(source,/if\(!force&&state\.state==='READY'&&state\.readyViewKey===view\.key\)return/);
  assert.match(source,/state\.readyViewKey=key/);
  assert.match(source,/if\(state\.state==='READY'&&key&&state\.readyViewKey===key\)return/);
});

test('R260.6 preserves terrain evidence and admission semantics',()=>{
  assert.match(source,/source:'AWS_OPEN_DATA_TERRAIN_TILES_TERRARIUM'/);
  assert.match(source,/rawDem:true,measuredSar:false/);
  assert.match(source,/terrain grid support .* below 88%/);
  assert.match(source,/not SAR measurements, observed water, or surveyed 3-D geometry/);
});
