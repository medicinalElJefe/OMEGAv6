import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../src/',import.meta.url);
const [field,lemma]=await Promise.all([
  readFile(new URL('omega-field-console.mjs',root),'utf8'),
  readFile(new URL('omega-lemma-translator-runtime.mjs',root),'utf8')
]);

test('R260.5 Omega field scheduling cannot be starved by repeated startup events',()=>{
  assert.match(field,/FIELD_MAX_SCHEDULE_WAIT_MS=1500/);
  assert.match(field,/deadlineTimer:null/);
  assert.match(field,/if\(!runtime\.deadlineTimer\)runtime\.deadlineTimer=setTimeout/);
  assert.match(field,/rebuild\(runtime\.pendingReason\|\|reason\)/);
  assert.match(field,/if\(runtime\.building\)\{runtime\.queued=true;runtime\.queuedReason=reason;return;\}/);
});

test('R260.5 each committed field has an explicit monotonic revision event',()=>{
  assert.match(field,/runtime\.revision\+\+/);
  assert.match(field,/runtime\.lastCommitAt=new Date\(\)\.toISOString\(\)/);
  assert.match(field,/omega-continuous-field-update/);
  assert.match(field,/revision:runtime\.revision/);
  assert.match(field,/cellCount:field\.cells\?\.length\|\|0/);
  assert.match(field,/runtime\.rebuild=rebuild;runtime\.schedule=schedule/);
});

test('R260.5 Lemma translation follows field commits and skips unchanged revisions',()=>{
  assert.match(lemma,/fieldRevision:0/);
  assert.match(lemma,/OMEGA_SAR_FIELD_RUNTIME\?\.revision/);
  assert.match(lemma,/field===state\.field&&fieldRevision===state\.fieldRevision&&state\.annotated===field\.cells\.length/);
  assert.match(lemma,/omega-continuous-field-update/);
  assert.match(lemma,/annotate\(true\)/);
  assert.match(lemma,/state\.fieldRevision=fieldRevision/);
});

test('R260.5 preserves Lemma truth boundaries',()=>{
  assert.match(lemma,/does not change measured values/);
  assert.match(lemma,/create missing SAR pixels/);
  assert.match(lemma,/promote contextual\/derived state into observation/);
  assert.match(lemma,/exactMeasured:cell\.measured===true/);
  assert.match(lemma,/sourceCoverage:sourceCoverage\(cell\)/);
});
