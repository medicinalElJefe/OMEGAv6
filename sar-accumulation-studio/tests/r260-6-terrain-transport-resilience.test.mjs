import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source=await readFile(new URL('../src/sar-browser-transport-resilience.mjs',import.meta.url),'utf8');

test('R260.6 terrain transport is explicitly inside the bounded retry contract',()=>{
  assert.match(source,/TRANSIENT=new Set\(\[429,500,502,503,504\]\)/);
  assert.match(source,/DELAYS=\[0,180,520,1250\]/);
  assert.match(source,/terrain\|stac\\\/item/);
  assert.match(source,/source terrain tile transport/);
  assert.match(source,/never converts failed evidence into measurement/);
  assert.match(source,/substitutes terrain/);
  assert.match(source,/!\['GET','HEAD'\]\.includes\(method\)/);
});

test('R260.6 same-origin terrain 502 recovers, while semantic 404 does not retry',async()=>{
  const originalFetch=globalThis.fetch,hadLocation=Object.prototype.hasOwnProperty.call(globalThis,'location'),originalLocation=globalThis.location;
  let transientAttempts=0,semanticAttempts=0;
  try{
    Object.defineProperty(globalThis,'location',{value:{href:'https://omega.test/'},configurable:true,writable:true});
    globalThis.fetch=async input=>{
      const u=new URL(String(input),'https://omega.test/');
      if(u.pathname==='/api/terrain'){
        transientAttempts++;
        return transientAttempts<3?new Response('temporary',{status:502}):new Response('terrain',{status:200});
      }
      if(u.pathname==='/api/source'){
        semanticAttempts++;
        return new Response('missing',{status:404});
      }
      return new Response('ok',{status:200});
    };
    await import(`../src/sar-browser-transport-resilience.mjs?terrain-retry=${Date.now()}`);
    const terrain=await globalThis.fetch('/api/terrain?z=9&x=100&y=100');
    assert.equal(terrain.status,200);
    assert.equal(transientAttempts,3);
    assert.equal(globalThis.OMEGA_SAR_BROWSER_TRANSPORT.retries,2);
    assert.equal(globalThis.OMEGA_SAR_BROWSER_TRANSPORT.recovered,1);
    assert.equal(globalThis.OMEGA_SAR_BROWSER_TRANSPORT.last?.url,'/api/terrain');
    const missing=await globalThis.fetch('/api/source?url=missing');
    assert.equal(missing.status,404);
    assert.equal(semanticAttempts,1);
  }finally{
    globalThis.fetch=originalFetch;
    if(hadLocation)Object.defineProperty(globalThis,'location',{value:originalLocation,configurable:true,writable:true});else delete globalThis.location;
    delete globalThis.OMEGA_SAR_BROWSER_TRANSPORT;
  }
});
