import fs from 'node:fs';import assert from 'node:assert/strict';
const src=fs.readFileSync('src/FederationCeremonyR114.tsx','utf8');
assert.ok(src.includes('Strict federation objective'));
assert.ok(src.includes('value={strictIntent}'));
assert.ok(src.includes('onChange={e=>setStrictIntent(e.target.value)}'));
assert.ok(src.includes('disabled={!strictIntent.trim()||Boolean(busy)}'));
assert.ok(src.includes('{intent:strictIntent.trim()}'));
assert.ok(src.includes('Genesis and Optical must still return authentic service-observed receipts.'));
console.log('R648 strict federation intent invariants PASS');
