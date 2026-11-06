import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import worker from '../src/workerR9.js';

const source=readFileSync('src/workerR9.js','utf8');
const globe=readFileSync('src/EarthObservedGlobeR281.tsx','utf8');
for(const token of ["datePinned,setDatePinned","datePinned?`/api/earth/gibs/global?date=","'/api/earth/gibs/global?width=2048&height=1024'","[date,datePinned]","data-r780-observation-date-mode","value={datePinned?date:state==='OBSERVED'?meta.date:date}","setDatePinned(true);setDate(e.target.value)","setDatePinned(false);setDate(defaultDate())"]){
 assert.ok(globe.includes(token),'R780 live globe must expose truthful explicit/default source-date selection: '+token);
}

assert.ok(source.includes('GIBS_GLOBAL_MIN_BYTES_R780=12000'),'R780 must retain the original 12 KB source threshold');
assert.ok(source.includes('requestedDate?1:3'),'R780 must bound lookup and respect exact date');
assert.ok(source.includes("'x-omega-date':date")&&source.includes("'x-omega-lookback-days':String(lookback)"),'returned observation date must be disclosed');
// A real, decodable 16x16 JPEG plus a legal APP2 segment to exercise the
// existing 12,000-byte policy without pretending that random bytes are pixels.
const jpegSeed=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAACAAIBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AP7//2Q==','base64');
assert.equal(jpegSeed.length,160,'source JPEG fixture must have exact original bytes');
const jpeg=(size)=>{
 if(size<12000){const b=new Uint8Array(size);b.set([255,216],0);b.set([255,217],size-2);return b;}
 const pad=size-jpegSeed.length-4;
 assert.ok(pad>=0&&pad<=65531);
 return Buffer.concat([jpegSeed.subarray(0,2),Buffer.from([255,226,(pad+2)>>8,(pad+2)&255]),Buffer.alloc(pad,73),jpegSeed.subarray(2)]);
};
const pngCrc=bytes=>{let crc=0xffffffff;for(const v of bytes){crc^=v;for(let j=0;j<8;j++)crc=(crc>>>1)^(crc&1?0xedb88320:0);}return (crc^0xffffffff)>>>0};
const chunk=(type,data)=>{const name=Buffer.from(type),out=Buffer.alloc(12+data.length);out.writeUInt32BE(data.length,0);name.copy(out,4);data.copy(out,8);out.writeUInt32BE(pngCrc(out.subarray(4,8+data.length)),8+data.length);return out};
const png=()=>{
 const w=128,h=128,raw=Buffer.alloc(h*(1+w*3));let seed=13;
 for(let y=0;y<h;y++)for(let x=0;x<w*3;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;raw[y*(1+w*3)+1+x]=seed>>>24;}
 const header=Buffer.alloc(13);header.writeUInt32BE(w,0);header.writeUInt32BE(h,4);header[8]=8;header[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
};
const small=jpeg(1836),actual=jpeg(16384);
assert.equal(actual.length,16384);
const validPng=png();assert.ok(validPng.length>12000&&validPng.length<8*1024*1024);
const originalFetch=globalThis.fetch;
const calls=[];
const fake=(body,contentType='image/jpeg',status=200)=>new Response(body,{status,headers:{'content-type':contentType}});
const run=(path)=>worker.fetch(new Request('https://test.invalid'+path),{});
const path='/api/earth/gibs/global?width=720&height=360';

const localPath='/api/earth/gibs/image?lat=32.222876&lon=-110.974847&date=2026-10-20&span=2.5&width=256&height=256';
const testR788=async()=>{
 calls.length=0;globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(actual)};
 let row=await run(localPath+'&layer=MODIS_Terra_CorrectedReflectance_TrueColor');
 assert.equal(row.status,200,'explicit NASA MODIS must return the real upstream bytes');
 assert.equal(calls.length,1,'R788 source must not fabricate alternate fetches');
 assert.equal(calls[0].searchParams.get('LAYERS'),'MODIS_Terra_CorrectedReflectance_TrueColor');
 assert.equal(calls[0].searchParams.get('TIME'),'2026-10-20');
 assert.equal(row.headers.get('x-omega-layer'),'MODIS_Terra_CorrectedReflectance_TrueColor');
 assert.equal(row.headers.get('x-omega-source'),'NASA-GIBS-MODIS_Terra_CorrectedReflectance_TrueColor');
 calls.length=0;
 row=await run(localPath+'&layer=UNTRUSTED_LAYER');
 assert.equal(row.status,400,'unrecognized source must fail closed before upstream access');
 assert.equal((await row.json()).code,'GIBS_UNSUPPORTED_LAYER');
 assert.equal(calls.length,0);
 calls.length=0;
 row=await run(localPath);
 assert.equal(row.headers.get('x-omega-layer'),'VIIRS_SNPP_CorrectedReflectance_TrueColor','default NASA VIIRS identity retained');
 assert.equal(calls[0].searchParams.get('LAYERS'),'VIIRS_SNPP_CorrectedReflectance_TrueColor');
};

try{
 await testR788();
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
 const corruptedPng=Buffer.from(validPng);
 corruptedPng[80]^=1;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(corruptedPng,'image/png')};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,502,'corrupt PNG IDAT CRC must be refused');

 calls.length=0;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(validPng,'image/png')};
 result=await run(path+'&date=2026-10-31');
 assert.equal(result.status,200,'CRC-validated PNG raster must retain supported MIME route');
 assert.equal(result.headers.get('x-omega-date'),'2026-10-31');
 // R782: invalid explicitly requested calendar days are not silently replaced,
 // including empty, malformed, nonexistent and non-leap-year dates.
 for(const invalid of ['', 'not-a-date', '2026-02-29', '2026-02-30', '2026-13-01', '2026-1-2']){
  for(const endpoint of ['/api/earth/gibs/global?width=720&height=360',
                          '/api/earth/gibs/image?lat=32&lon=-110']){
   calls.length=0;
   globalThis.fetch=async url=>{calls.push(new URL(String(url)));throw Error('INVALID_DATE_MUST_NOT_FETCH_UPSTREAM')};
   const separator=endpoint.includes('?')?'&':'?';
   result=await run(endpoint+separator+'date='+encodeURIComponent(invalid));
   assert.equal(result.status,400,'invalid explicit Earth date must be rejected: '+invalid);
   const rejection=await result.json();
   assert.equal(rejection.code,'GIBS_INVALID_EXPLICIT_DATE');
   assert.equal(rejection.truth,'NO_DATE_SUBSTITUTION');
   assert.equal(calls.length,0,'invalid explicit date must not invoke NASA upstream');
  }
 }
 calls.length=0;
 globalThis.fetch=async url=>{calls.push(new URL(String(url)));return fake(small)};
 result=await run(path+'&date=2024-02-29');
 assert.equal(result.status,502,'valid leap day remains an exact attempted observation');
 const leap=await result.json();
 assert.equal(leap.attempts.length,1);
 assert.equal(leap.attempts[0].date,'2024-02-29');
 assert.equal(calls.length,1,'valid explicit leap day must make exactly one provider request');

}finally{
 globalThis.fetch=originalFetch;
}
console.log('R780/R781/R782 LIVE-EARTH SOURCE INTEGRITY PASS · 1836-byte no-data rejection · exact-date immutability · bounded real-date recovery · truthful missing-evidence failure');
