import {chromium} from 'playwright';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const parse=async response=>{const raw=await response.text();let body=null;try{body=JSON.parse(raw)}catch{}return{response,raw,body}};
if(!expected)throw new Error('R239 live proof requires OMEGA_PROMOTED_SHA or GITHUB_SHA');

let receipt=null,lastReceipt='';
for(let attempt=1;attempt<=36;attempt++){
 try{
  const row=await parse(await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}));
  if(row.response.ok){
   const served=row.body?.promotion?.promotedMergeSha||row.body?.source?.sha||'';
   if(served===expected){receipt=row.body;break}
   lastReceipt=`served ${served||'NONE'}`;
  }else lastReceipt=`HTTP ${row.response.status}`;
 }catch(error){lastReceipt=error instanceof Error?error.message:String(error)}
 await sleep(5000);
}
if(!receipt)throw new Error(`R239 exact promoted SHA did not become live: expected ${expected}; ${lastReceipt}`);

const statusRow=await parse(await fetch(base+'/api/hybrid/status',{headers:{'cache-control':'no-cache'}}));
if(!statusRow.response.ok)throw new Error(`R239 public Hybrid status HTTP ${statusRow.response.status}`);
const status=statusRow.body||{};
const current=Array.isArray(status.devices)?status.devices.filter(d=>d?.online&&!d?.revoked):[];
if(status.state==='VERIFIED_DEVICE_ONLINE'){
 if(status.nativeExecutionClaimed!==true||current.length<1)throw new Error('R239 live Hybrid claims verified device without current authenticated heartbeat');
}else if(status.state==='DEVICE_PROOF_REQUIRED'||status.state==='PAIRING_REQUIRED'){
 if(status.nativeExecutionClaimed===true||current.length!==0)throw new Error('R239 live Hybrid proof-required state conflicts with current device projection');
}else throw new Error(`R239 unsupported Hybrid truth state ${status.state}`);

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1150}});
const pageErrors=[];page.on('pageerror',error=>pageErrors.push(String(error)));
await page.goto(base+'/',{waitUntil:'domcontentloaded'});
const toolsTab=page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true});
await toolsTab.waitFor({state:'visible'});await toolsTab.click();
const hybridEntry=page.locator('.r96-quick-card button').filter({hasText:'Hybrid'}).first();
await hybridEntry.waitFor({state:'visible'});await hybridEntry.click();
const governor=page.locator('[data-r239-tier]');
await governor.waitFor({state:'visible'});
const tier=String(await governor.getAttribute('data-r239-tier')||'');
const selected=String(await governor.getAttribute('data-r239-device')||'NONE');
const profileState=String(await governor.getAttribute('data-r239-profile')||'');
const text=await governor.innerText();
for(const token of ['R239 · ADAPTIVE HYBRID RESOURCE GOVERNOR','SELECTED HOST ONLY','Size work to the PC that is actually connected.','CPU BUDGET','MEMORY HEADROOM','APPROVED ROOT FREE','BOUNDED INDEX / TRAIN','fresh returned R238 selected-host sample','R141 returned-payload proof continuity'])if(!text.includes(token))throw new Error(`R239 live browser missing ${token}`);
if(!['UNPROVED','HOLD','CONSTRAINED','READY','HIGH_CAPACITY'].includes(tier))throw new Error(`R239 live browser returned unsupported resource tier ${tier}`);
if(current.length===0){
 if(selected!=='NONE')throw new Error(`R239 selected device ${selected} without a current authenticated public device`);
 if(!['UNPROVED','HOLD'].includes(tier))throw new Error(`R239 cannot be ${tier} without a current authenticated device`);
}else if(selected!=='NONE'&&!current.some(d=>d.id===selected))throw new Error(`R239 selected device ${selected} is not a current authenticated public device`);
if(['CONSTRAINED','READY','HIGH_CAPACITY'].includes(tier)&&profileState!=='RETURNED_PROOF')throw new Error(`R239 admitted resource tier ${tier} without returned host proof`);
if(pageErrors.length)throw new Error(`R239 live browser page errors: ${pageErrors.join(' | ')}`);
await browser.close();
console.log(`R239 LIVE RESOURCE GOVERNOR PASS · exact SHA ${expected} · Hybrid ${status.state} · current devices ${current.length} · selected ${selected} · tier ${tier} · profile ${profileState} · Home→TOOLS→Hybrid read-only surface · no synthetic host proof or command mutation`);
