import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const hash=b=>createHash('sha256').update(b).digest('hex');
const key='test_private_archive_key_'.repeat(3),dir=await mkdtemp(join(tmpdir(),'omega-archive-'));
const bundle=await build({stdin:{contents:"import {cloudArchive} from './src/archive/cloudArchive.js';export default {fetch:cloudArchive}",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'browser'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-08-28',r2Buckets:['OMEGA_ARCHIVE','OMEGA_ARCHIVE_BACKUP'],bindings:{OMEGA_ARCHIVE_TOKEN_SHA256:hash(key)},r2Persist:dir}));
const call=(path,init={})=>mf.dispatchFetch('https://archive.test/api/archive/'+path,{...init,headers:{authorization:'Bearer '+key,...init.headers}});
try{
 let r=await mf.dispatchFetch('https://archive.test/api/archive/status');assert.equal(r.status,401);assert.equal((await r.text()).includes('R2'),false);
 assert.equal((await call('status',{headers:{origin:'https://attacker.invalid'}})).status,403);
 r=await call('login',{method:'POST',body:JSON.stringify({token:key})});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie');assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);
 assert.equal((await mf.dispatchFetch('https://archive.test/api/archive/status',{headers:{cookie:cookie.split(';')[0]}})).status,200);
 assert.equal((await call('chunks/'+hash('bad'),{method:'PUT',headers:{'content-length':'3'},body:'abc'})).status,422);
 const chunks=[Buffer.from('the first chunk, '),Buffer.from('the second chunk')],bytes=Buffer.concat(chunks),id=hash('source-file-v1');
 const record={schema:'OMEGA_PRIVATE_ARCHIVE_V1',id,name:'original.txt',path:'/folder/original.txt',mime:'text/plain',size:bytes.length,sha256:hash(bytes),source:{provider:'test',libraryFileId:'source'},chunks:chunks.map(b=>({sha256:hash(b),size:b.length}))};
 const putRecord=()=>call('records/'+id,{method:'PUT',body:JSON.stringify(record)});
 assert.equal((await putRecord()).status,409);
 for(const b of chunks){r=await call('chunks/'+hash(b),{method:'PUT',headers:{'content-length':String(b.length)},body:b});assert.equal(r.status,200,await r.text())}
 // Break backup, prove commit cannot declare two-copy success, then repair it.
 const backup=await mf.getR2Bucket('OMEGA_ARCHIVE_BACKUP');await backup.delete('chunks/'+hash(chunks[0]));assert.equal((await putRecord()).status,409);
 r=await call('chunks/'+hash(chunks[0]),{method:'PUT',headers:{'content-length':String(chunks[0].length)},body:chunks[0]});assert.equal(r.status,200);
 r=await putRecord();assert.equal(r.status,201,await r.text());assert.equal((await putRecord()).status,200);
 await backup.delete('records/'+id+'.json');assert.equal((await putRecord()).status,200);assert.ok(await backup.head('records/'+id+'.json'));
 const originalPrimary=await mf.getR2Bucket('OMEGA_ARCHIVE');await originalPrimary.delete('records/'+id+'.json');assert.equal((await putRecord()).status,201);
 assert.equal((await call('records/'+id,{method:'PUT',body:JSON.stringify({...record,name:'changed.txt'})})).status,409);
 for(const replica of ['','?replica=backup']){r=await call('records/'+id+'/content'+replica);assert.equal(r.status,200);assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(bytes));assert.match(r.headers.get('content-disposition'),/^attachment/)}
 r=await call('records/'+id+'/content',{headers:{range:'bytes=8-23'}});assert.equal(r.status,206);assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes.subarray(8,24));
 r=await call('records/'+id+'/content',{headers:{range:'bytes=-5'}});assert.equal(await r.text(),bytes.subarray(-5).toString());
 assert.equal((await call('records/'+id+'/content',{headers:{range:'bytes=999-'}})).status,416);
 assert.equal((await call('records/'+id,{method:'DELETE'})).status,405);
 r=await call('records');assert.equal((await r.json()).records[0].name,record.name);
 const importRoot=join(dir,'originals');await (await import('node:fs/promises')).mkdir(importRoot);await writeFile(join(importRoot,'real-source.bin'),bytes);await writeFile(join(dir,'key'),key);
 await writeFile(join(dir,'inventory.json'),JSON.stringify({items:[{kind:'file',name:'real-source.bin',path:'/real-source.bin',size_bytes:bytes.length,mime_type:'application/octet-stream',library_file_id:'importer-source'}]}));
 await promisify(execFile)('python3',['scripts/archive-transfer.py','--base',String(await mf.ready),'--token-file',join(dir,'key'),'--inventory',join(dir,'inventory.json'),'--root',importRoot,'--receipts',join(dir,'proof.jsonl')],{timeout:30000});
 const proof=JSON.parse((await readFile(join(dir,'proof.jsonl'),'utf8')).trim());assert.equal(proof.status,'BOTH_REPLICAS_READBACK_VERIFIED');assert.equal(proof.sha256,hash(bytes));assert.equal(proof.replicas.length,2);
 console.log('PASS: real local R2 auth/cookie, checksum rejection, missing-backup veto, repair/resume, immutable commits, two-replica roundtrip, cross-chunk/suffix/invalid ranges, listing and no-delete boundary.');
}finally{await mf.dispose();await rm(dir,{recursive:true,force:true})}
