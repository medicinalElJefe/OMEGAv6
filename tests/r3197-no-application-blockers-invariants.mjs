import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const files=[
  'src/App.tsx',
  'src/OmegaWorkstation.tsx',
  'src/OmegaWorkstationFull.tsx',
  'src/OmegaWorkstationFullV2.tsx'
];
for(const file of files){
  const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  assert.ok(!source.includes("className='boot'"),`${file}: application-covering .boot surface is forbidden`);
  assert.ok(!source.includes('OMEGA · LIVE BINDING INTERLOCK'),`${file}: live-binding interlock must never own the application surface`);
  assert.ok(!source.includes('VERIFYING LIVE BINDINGS'),`${file}: proof verification must remain status-only, never viewport-blocking`);
}
const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
assert.ok(app.includes('r319-bounded-surface-error'),'App route failures must remain bounded inside the canonical shell');
assert.ok(app.includes('r319-bounded-loading'),'route loading must remain bounded inside the canonical shell');
const v2=readFileSync(new URL('../src/OmegaWorkstationFullV2.tsx',import.meta.url),'utf8');
assert.ok(v2.includes('NON-BLOCKING INITIALIZATION'),'canonical workspace initialization must explicitly remain non-blocking');
for(const file of ['src/OmegaWorkstation.tsx','src/OmegaWorkstationFull.tsx']){
  const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  assert.ok(source.includes('APPLICATION REMAINS NAVIGABLE'),`${file}: degraded legacy workspace must preserve escape/navigation`);
  assert.ok(source.includes("omega-home-request"),`${file}: degraded/preparing workspace must preserve Home escape`);
}
console.log('R319.7 NO APPLICATION BLOCKERS PASS · startup, proof and degraded states remain bounded and escapable');
