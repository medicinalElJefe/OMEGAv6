import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../src/workerR9.js';

const source=readFileSync('src/workerR9.js','utf8');
const globe=readFileSync('src/EarthObservedGlobeR281.tsx','utf8');
for(const token of ["datePinned,setDatePinned","datePinned?`/api/earth/gibs/global?date=","'/api/earth/gibs/global?width=2048&height=1024'","[date,datePinned]","data-r780-observation-date-mode","value={datePinned?date:state==='OBSERVED'?meta.date:date}","setDatePinned(true);setDate(e.target.value)","setDatePinned(false);setDate(defaultDate())"]){
 assert.ok(globe.includes(token),'R780 live globe must expose truthful explicit/default source-date selection: '+token);
}

assert.ok(source.includes('GIBS_GLOBAL_MIN_BYTES_R780=12000'),'R780 must retain the original 12 KB source threshold');
assert.ok(source.includes('requestedDate?1:3'),'R780 must bound lookup and respect exact date');
assert.ok(source.includes("'x-omega-date':date")&&source.includes("'x-omega-lookback-days':String(lookback)"),'returned observation date must be disclosed');
const jpeg=(size)=>{const b=new Uint8Array(size);b[0]=255;b[1]=216;b[b.length-2]=255;b[b.length-1]=217;for(let i=2;i<b.length-2;i++)b[i]=i*37%256;return b};
const small=jpeg(1836),actual=jpeg(16384);
const originalFetch=globalThis.fetch;
const calls=[];
const fake=(body,contentType='image/jpeg',status=200)=>new Response(body,{status,headers:{'content-type':contentType}});
const run=(path)=>worker.fetch(new Request('https://test.invalid'+path),{});
const path='/api/earth/gibs/global?width=720&height=360';
try{
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(small)};
 let result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,502);
 assert.equal(calls.length,1,'explicit date must never silently substitute');
 let failure=await result.json();
 assert.equal(failure.code,'GIBS_GLOBAL_NO_VALID_OBSERVATION');
 assert.equal(failure.attempts[0].bytes,1836);
 assert.equal(failure.truth,'NO_SYNTHETIC_SUBSTITUTE');
 assert.equal(result.headers.get('x-omega-truth'),null);

 calls.length=0;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(calls.length===1?small:actual)};
 result=await run(path);
 assert.equal(result.status,200,'implicit-date recovery must require actual returned NASA raster');
 assert.equal(calls.length,2);
 const first=calls[0].searchParams.get('TIME'),second=calls[1].searchParams.get('TIME');
 assert.equal(Date.parse(first+'T00:00:00Z')-Date.parse(second+'T00:00:00Z'),86400000);
 assert.equal(result.headers.get('x-omega-date'),second);
 assert.equal(result.headers.get('x-omega-lookback-days'),'1');
 assert.equal(result.headers.get('x-omega-truth'),'RETURNED_GLOBAL_OBSERVATION');
 assert.equal((await result.arrayBuffer()).byteLength,actual.byteLength);

 calls.length=0;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(actual)};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,200);
 assert.equal(result.headers.get('x-omega-date'),'2026-10-31');
 assert.equal(result.headers.get('x-omega-lookback-days'),'0');
 assert.equal(calls.length,1);

 calls.length=0;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(small)};
 result=await run(path);
 assert.equal(result.status,502,'missing imagery must never produce synthetic pixels');
 failure=await result.json();
 assert.equal(calls.length,3);
 assert.equal(failure.attempts.length,3);
 assert.equal(failure.truth,'NO_SYNTHETIC_SUBSTITUTE');

 calls.length=0;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(actual,'text/html')};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,502,'HTML must never be promoted as image');

 calls.length=0;
 const missingJpegEnd=jpeg(16384);missingJpegEnd[missingJpegEnd.length-1]=0;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(missingJpegEnd)};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,502,'JPEG header alone must not certify a truncated raster');
 assert.equal(calls.length,1,'malformed explicit-day raster cannot trigger date substitution');

 calls.length=0;
 const shortPngSignature=new Uint8Array(16384);
 shortPngSignature.set([137,80,78,71],0);
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(shortPngSignature,'image/png')};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,502,'four-byte PNG signature alone is not a valid raster boundary');

 calls.length=0;
 const pngNoEnd=new Uint8Array(16384);
 pngNoEnd.set([137,80,78,71,13,10,26,10],0);
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(pngNoEnd,'image/png')};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,502,'PNG without the terminating IEND chunk must be refused');

 calls.length=0;
 const boundedPng=new Uint8Array(16384);
 boundedPng.set([137,80,78,71,13,10,26,10],0);
 boundedPng.set([0,0,0,0,73,69,78,68,174,66,96,130],boundedPng.length-12);
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(boundedPng,'image/png')};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,200,'well-delimited PNG container must retain supported MIME route');
 assert.equal(result.headers.get('x-omega-date'),'2026-10-31');
}finally{
 globalThis.fetch=originalFetch;
}
console.log('R780/R781 LIVE-EARTH SOURCE INTEGRITY PASS · 1836-byte no-data rejection · exact-date immutability · bounded real-date recovery · truthful missing-evidence failure');
