import fs from 'node:fs';import assert from 'node:assert/strict';
const source=fs.readFileSync('src/workerR114.js','utf8');const config=fs.readFileSync('wrangler.jsonc','utf8');
for(const binding of ['OMEGA_GENESIS_MACHINE','OMEGA_OPTICAL_MACHINE']){assert.ok(config.includes('"binding":"'+binding+'"'));assert.ok(source.includes('env.'+binding+'?.fetch'))}
assert.ok(source.includes("transport:opticalMachine?'CLOUDFLARE_SERVICE_BINDING':'HTTPS_SERVER_TO_SERVER'"));
assert.ok(source.includes("genesis.ok||!genesis.valid"));
assert.ok(source.includes("optical.ok||!optical.valid"));
assert.ok(source.includes("GENESIS_PROPOSAL_ENDPOINT_REQUIRED"));
assert.ok(source.includes("OPTICAL_SCREEN_ENDPOINT_REQUIRED"));
console.log('R649 strict machine binding invariants PASS');
