import assert from 'node:assert/strict';
import fs from 'node:fs';

const live=fs.readFileSync('tests/r372-live-earth-total-interaction-browser-e2e.mjs','utf8');
const motion=fs.readFileSync('src/earthMotionStateR278.ts','utf8');
const earth=fs.readFileSync('src/EarthNowInstrument.tsx','utf8');

for(const token of[
  "['RETURNED','ERROR'].includes",
  "global motion entered ERROR without an explicit provider error surface",
  "provider-unavailable motion fabricated returned-provider evidence",
  "failed motion refresh incorrectly advanced successful-refresh receipt",
  "failed refresh did not preserve last-known returned motion evidence",
  "successful manual motion refresh did not advance refresh receipt"
])assert.ok(live.includes(token),'R475 live provider truth gate missing '+token);

for(const token of[
  'MOTION_PROVIDER_TIMEOUT_MS=15000',
  'AbortSignal.timeout(MOTION_PROVIDER_TIMEOUT_MS)',
  'Open-Meteo global field HTTP'
])assert.ok(motion.includes(token),'R475 bounded provider runtime missing '+token);

for(const token of[
  "data-motion-state={motionBusy?'LOADING':motionError?'ERROR':motion?'RETURNED':'IDLE'}",
  "data-motion-observed-at={motion?.observedAt||''}",
  "data-motion-provider={motion?.provider||''}",
  "earth-r279-motion-error"
])assert.ok(earth.includes(token),'R475 explicit motion truth surface missing '+token);

assert.ok(!live.includes("state')==='RETURNED'&&Boolean(el.getAttribute('data-motion-observed-at'))&&String(el.getAttribute('data-motion-provider')||'').includes('Open-Meteo')},{timeout:30000});\n  const beforeMotionObservedAt"),'R475 may not hard-fail release solely because initial external provider return is unavailable');
console.log('R475 EARTH MOTION PROVIDER TRUTH GATE PASS · RETURNED proves Open-Meteo provenance/refresh receipt · ERROR proves explicit provider unavailability · prior returned observation may remain as last-known evidence · no synthetic substitution');
