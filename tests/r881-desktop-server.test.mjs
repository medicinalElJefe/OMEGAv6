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
  // Backend namespace must never fall through to the SPA, even at its root
  // or under unknown capability paths.
  for(const path of ['api','api/','api/native/gpu','api/models/generate','api/hybrid/execute']){
   const refused=await fetch(started.url+path);
   assert.equal(refused.status,503,path);
   assert.equal((await refused.json()).state,'REMOTE_BACKEND_UNAVAILABLE',path);
  }
  assert.equal((await fetch(started.url,{method:'POST'})).status,405);
  const head=await fetch(started.url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
 }finally{if(server)await new Promise(ok=>server.close(ok));await rm(dir,{recursive:true,force:true});}
});
test('R881 missing build rejects startup',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'omega-r881-'));
 try{await assert.rejects(startDesktopServer({root:dir}),/index\.html/);}finally{await rm(dir,{recursive:true,force:true});}
});

test('R887 local artifact survives host restart with exact content and rejects invalid input',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'omega-r887-'));
 const dist=join(dir,'dist'),stateRoot=join(dir,'private-state');
 await mkdir(dist);await writeFile(join(dist,'index.html'),'<html>OMEGA</html>');
 let server;
 try{
  let started=await startDesktopServer({root:dist,stateRoot});server=started.server;
  const created=await fetch(started.url+'__omega_local/artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'atlas_trace',content:'source-derived trace 20736'})});
  assert.equal(created.status,201);const receipt=await created.json();
  assert.match(receipt.contentSha256,/^[a-f0-9]{64}$/);
  const indexResponse=await fetch(started.url+'__omega_local/artifacts');
  assert.equal(indexResponse.status,200);
  const index=await indexResponse.json();
  assert.equal(index.schema,'OMEGA_LOCAL_ARTIFACT_INDEX_R891');
  assert.equal(index.items.length,1);
  assert.equal(index.items[0].id,receipt.id);
  assert.equal(index.items[0].contentSha256,receipt.contentSha256);
  assert.equal(Object.hasOwn(index.items[0],'content'),false);
  assert.equal((await fetch(started.url+'__omega_local/artifacts',{method:'HEAD'})).status,200);
  const loaded=await fetch(started.url+'__omega_local/artifacts/'+receipt.id).then(r=>r.json());
  assert.equal(loaded.content,'source-derived trace 20736');
  assert.equal(loaded.canonicalMutation,false);
  assert.equal((await fetch(started.url+'__omega_local/artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'../../bad',content:'x'})})).status,422);
  assert.equal((await fetch(started.url+'__omega_local/artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'trace',content:'x'.repeat(70000)})})).status,413);
  const csv='address,continuity\n0,0.5\n1,0.7';
  const csvCreate=await fetch(started.url+'__omega_local/artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'atlas_csv',content:csv})});
  assert.equal(csvCreate.status,201);
  const csvReceipt=await csvCreate.json();
  const csvLoaded=await fetch(started.url+'__omega_local/artifacts/'+csvReceipt.id).then(r=>r.json());
  assert.equal(csvLoaded.kind,'atlas_csv');assert.equal(csvLoaded.content,csv);
  assert.equal(csvLoaded.contentSha256,csvReceipt.contentSha256);
  assert.equal((await fetch(started.url+'__omega_local/artifacts/not-an-id')).status,400);
  await new Promise(ok=>server.close(ok));server=null;
  started=await startDesktopServer({root:dist,stateRoot});server=started.server;
  const restartedIndex=await fetch(started.url+'__omega_local/artifacts').then(r=>r.json());
  assert.deepEqual(new Set(restartedIndex.items.map(item=>item.id)),new Set([receipt.id,csvReceipt.id]));
  assert.equal(restartedIndex.items.find(item=>item.id===csvReceipt.id)?.kind,'atlas_csv');
  const recovered=await fetch(started.url+'__omega_local/artifacts/'+receipt.id);
  assert.equal(recovered.status,200);
  assert.equal((await recovered.json()).contentSha256,receipt.contentSha256);
 }finally{if(server)await new Promise(ok=>server.close(ok));await rm(dir,{recursive:true,force:true});}
});

test('R910 actual offline Atlas address execution persists and recovers exact trace',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'omega-r910-')),dist=join(dir,'dist'),stateRoot=join(dir,'state');
 await mkdir(dist);await writeFile(join(dist,'index.html'),'<html>OMEGA</html>');
 let server;
 try{
  let started=await startDesktopServer({root:dist,stateRoot});server=started.server;
  const endpoint=started.url+'__omega_local/execute/atlas';
  const run=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({D:1,P:1,R:1,L:12,turns:2})});
  assert.equal(run.status,201);const result=await run.json();
  assert.equal(result.executor,'LOCAL_DEFINITIONAL_ADDRESS_TURN');
  assert.equal(result.proofTier,'DER');assert.equal(result.physicalClaim,false);
  assert.deepEqual(result.trace.map(x=>x.address),[11,0,1]);
  assert.deepEqual(result.trace.map(x=>x.coordinates[3]),[12,1,2]);
  assert.match(result.artifact.contentSha256,/^[a-f0-9]{64}$/);
  assert.equal((await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({D:13,P:1,R:1,L:1,turns:1})})).status,422);
  assert.equal((await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({D:1,P:1,R:1,L:1,turns:257})})).status,422);
  assert.equal((await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({D:1,P:1,R:1,L:1,turns:1,authority:'native'})})).status,422);
  const recovered=await fetch(started.url+'__omega_local/artifacts/'+result.artifact.id).then(x=>x.json());
  assert.deepEqual(JSON.parse(recovered.content).trace,result.trace);
  assert.equal(recovered.contentSha256,result.artifact.contentSha256);
  await new Promise(ok=>server.close(ok));server=null;
  started=await startDesktopServer({root:dist,stateRoot});server=started.server;
  const again=await fetch(started.url+'__omega_local/artifacts/'+result.artifact.id).then(x=>x.json());
  assert.equal(again.contentSha256,result.artifact.contentSha256);
 }finally{if(server)await new Promise(ok=>server.close(ok));await rm(dir,{recursive:true,force:true});}
});
