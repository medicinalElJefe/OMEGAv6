import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {request} from 'node:http';
import {startDesktopServer} from '../scripts/omega-desktop-server.mjs';
test('R881 loopback actual HTTP, assets, offline backend refusal, and traversal defense',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'omega-r881-'));await mkdir(join(dir,'assets'));
 await writeFile(join(dir,'index.html'),'<html><body>OMEGA7 test</body></html>');
 await writeFile(join(dir,'assets','entry.js'),'console.log("omega");');
 await writeFile(join(dir,'omega-desktop-package.json'),JSON.stringify({schema:'OMEGA_DESKTOP_PORTABLE_R881',sourceSha:'test-sha'}));
 let server;
 try{
  const started=await startDesktopServer({root:dir,port:0});server=started.server;
  assert.match(started.url,/^http:\/\/127\.0\.0\.1:\d+\/$/);
  const health=await fetch(started.url+'__omega_local_health').then(r=>r.json());
  assert.equal(health.state,'LOCAL_HTTP_READY');assert.equal(health.sourceSha,'test-sha');assert.equal(health.remoteDeviceProven,false);
  // A hostile website can resolve to loopback (DNS rebinding); the
  // server must refuse its Host header even though the TCP bind is local.
  // Node fetch/undici can silently replace Host on Windows. Use raw HTTP
  // to prove the authority actually reaches the server unchanged.
  const reboundStatus=await new Promise((resolve,reject)=>{
   const req=request(started.url+'__omega_local_health',{headers:{Host:'attacker.example'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});
   req.on('error',reject);req.end();
  });
  assert.equal(reboundStatus,403);
  const foreignOrigin=await fetch(started.url+'__omega_local_health',{headers:{Origin:'https://attacker.example'}});
  assert.equal(foreignOrigin.status,403);
  const localOrigin=await fetch(started.url+'__omega_local_health',{headers:{Origin:new URL(started.url).origin}});
  assert.equal(localOrigin.status,200);
  const html=await fetch(started.url+'some/client/route');assert.equal(html.status,200);assert.match(await html.text(),/OMEGA7 test/);
  const asset=await fetch(started.url+'assets/entry.js');assert.equal(asset.status,200);assert.match(asset.headers.get('content-type'),/javascript/);
  assert.equal((await fetch(started.url+'assets/missing.js')).status,404);
  assert.equal((await fetch(started.url+'secret.map')).status,404);
  assert.equal((await fetch(started.url+'%2e%2e%2fserver.mjs')).status,400);
  const api=await fetch(started.url+'api/hybrid/status');assert.equal(api.status,503);assert.equal((await api.json()).state,'REMOTE_BACKEND_UNAVAILABLE');
  assert.equal((await fetch(started.url,{method:'POST'})).status,405);
  const head=await fetch(started.url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
 }finally{if(server)await new Promise(ok=>server.close(ok));await rm(dir,{recursive:true,force:true});}
});
test('R881 missing build rejects startup',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'omega-r881-'));
 try{await assert.rejects(startDesktopServer({root:dir}),/index\.html/);}finally{await rm(dir,{recursive:true,force:true});}
});
