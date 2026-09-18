#!/usr/bin/env node
const base=String(process.argv[2]||'').replace(/\/$/,'');
const nonce=String(process.argv[3]||Date.now());
if(!/^https:\/\//i.test(base)) throw new Error('canonical https origin required');

const blockerPatterns=[
  /OMEGA\s*[·-]?\s*LIVE BINDING INTERLOCK/i,
  /VERIFYING LIVE BINDINGS/i,
  /R211 provenance\s*\+\s*R205 whole-system health/i,
  /exact deployment identity/i
];

const visited=new Set();
const queue=[new URL('/?omega_release_probe='+encodeURIComponent(nonce),base).href];
const failures=[];
const hits=[];
let rootOk=false;
let fetchedScripts=0;

function discover(body,sourceUrl){
  const found=new Set();
  for(const m of body.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) found.add(m[1]);
  for(const m of body.matchAll(/["'(`]((?:https?:\/\/[^"'()\s`]+|(?:\.\.?\/|\/)?assets\/[^"'()\s`]+)\.js(?:\?[^"'()\s`]*)?)["')`]/gi)) found.add(m[1]);
  for(const raw of found){
    try{
      const u=new URL(raw,sourceUrl);
      if(u.origin!==new URL(base).origin) continue;
      if(!/\.js(?:$|\?)/i.test(u.href)) continue;
      if(!visited.has(u.href)&&queue.length+visited.size<160) queue.push(u.href);
    }catch{}
  }
}

while(queue.length){
  const url=queue.shift();
  if(visited.has(url)) continue;
  visited.add(url);
  try{
    const r=await fetch(url,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
    const text=await r.text();
    if(!r.ok) throw new Error('HTTP '+r.status);
    if(url.includes('omega_release_probe=')) rootOk=true;
    else fetchedScripts++;
    for(const pattern of blockerPatterns){
      const m=text.match(pattern);
      if(m) hits.push({url,match:m[0]});
    }
    discover(text,url);
  }catch(error){
    failures.push({url,error:error instanceof Error?error.message:String(error)});
  }
}

const result={
  schema:'OMEGA_LIVE_USABILITY_PROBE_R3199',
  origin:base,
  rootOk,
  fetchedScripts,
  scannedResources:visited.size,
  blockerDetected:hits.length>0,
  hits:hits.slice(0,8),
  failures:failures.slice(0,12)
};

if(hits.length){
  result.state='BLOCKED_BY_APPLICATION_WITHHOLDING_INTERLOCK';
  console.log(JSON.stringify(result));
  process.exit(42);
}
if(!rootOk||fetchedScripts<1||failures.length){
  result.state='ROLLBACK_USABILITY_NOT_PROVED';
  console.log(JSON.stringify(result));
  process.exit(3);
}
result.state='ROLLBACK_SURFACE_PROVISIONALLY_USABLE';
console.log(JSON.stringify(result));
