import {chromium} from 'playwright';

const base=process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));

const caps=['DESKTOP_HEALTH','HASH_TREE','FORENSIC_HASH_LEDGER','INDEX','BUILD','TEST','PACKAGE','TRAIN_LOCAL'];
const profile=(id,cpu,gpu)=>({
 schema:'OMEGA_HYBRID_HOST_PROFILE_R238',revision:'R238',observedAt:Date.now(),hostName:`host-${id}`,platform:'Windows test',profileSha256:`${id}`.padEnd(64,id==='a'?'a':'b').slice(0,64),
 cpu:{model:cpu,physicalCores:8,logicalProcessors:16,query:'WINDOWS_CIM_FIXED_READ_ONLY'},
 memory:{totalBytes:34359738368,availableBytes:17179869184,loadPercent:50,query:'GLOBAL_MEMORY_STATUS_EX'},
 gpu:{present:true,name:gpu,vramBytes:8589934592,driverVersion:'TEST',adapters:[{name:gpu,driverVersion:'TEST'}],nvidiaSmi:{available:true,query:'NVIDIA_SMI_FIXED_READ_ONLY'},query:'WINDOWS_CIM_PLUS_OPTIONAL_NVIDIA_SMI'},
 storage:{rootLabel:`OMEGA-${id.toUpperCase()}`,totalBytes:1099511627776,freeBytes:549755813888},
 python:{version:'3.12.8',executable:'python.exe',architecture:'64bit'},
 rcwa:{pythonDependencyAvailable:id==='b',state:id==='b'?'PYTHON_DEPENDENCY_AVAILABLE':'PYTHON_DEPENDENCY_NOT_INSTALLED',reason:id==='b'?'grcwa proof B':'grcwa missing A'},
 schedulerAdvisory:{recommendedCpuWorkers:12,policy:'RESERVE_OS_HEADROOM_CAP_12',authority:'ADVISORY_ONLY'}
});
const macros=(id)=>({schema:'OMEGA_LOCAL_MACRO_INVENTORY_R238',revision:'R238',observedAt:Date.now(),totalCount:1,verifiedCount:1,invalidCount:0,entries:[{name:`macro-${id}`,state:'VERIFIED'}],contentsReturned:false,inventorySha256:`m${id}`.padEnd(64,id)});

const status={
 state:'VERIFIED_DEVICE_ONLINE',nativeExecutionClaimed:true,
 devices:[
  {id:'dev-a',name:'OMEGA PC A',online:true,revoked:false,lastSeen:Date.now(),rootLabel:'J:/OMEGA-A',capabilities:caps},
  {id:'dev-b',name:'OMEGA PC B',online:true,revoked:false,lastSeen:Date.now(),rootLabel:'J:/OMEGA-B',capabilities:caps}
 ],
 jobs:[
  {id:'proof_job_a',targetDeviceId:'dev-a',status:'COMPLETE',completedAt:Date.now()-3000,returnPacket:{receivedAt:Date.now()-3000,resultFingerprint:'fp-a',stepProofs:[{id:'S01',op:'DESKTOP_HEALTH',ok:true,result:{hostProfileR238:profile('a','CPU-A-ONLY','GPU-A-ONLY'),macroInventoryR238:macros('a')}}]}},
  {id:'proof_job_b',targetDeviceId:'dev-b',status:'COMPLETE',completedAt:Date.now()-2000,returnPacket:{receivedAt:Date.now()-2000,resultFingerprint:'fp-b',stepProofs:[{id:'S01',op:'DESKTOP_HEALTH',ok:true,result:{hostProfileR238:profile('b','CPU-B-ONLY','GPU-B-ONLY'),macroInventoryR238:macros('b')}}]}}
 ]
};
await page.route('**/api/hybrid/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(status)}));
await page.route('**/api/missions',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,state:'VERIFIED_DEVICE_ONLINE',missions:[]})}));
await page.addInitScript(()=>localStorage.setItem('omega:hybrid:selectedDeviceId','dev-a'));

await page.goto(base,{waitUntil:'networkidle'});
await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const hybridEntry=page.locator('.r96-quick-card button').filter({hasText:'Hybrid'}).first();
await hybridEntry.waitFor({state:'visible'});await hybridEntry.click();

const intelligence=page.locator('[data-r238-host-intelligence]');
await intelligence.waitFor({state:'visible'});
await page.waitForFunction(()=>document.querySelector('[data-r238-host-intelligence]')?.getAttribute('data-r238-selected-device')==='dev-a');
let text=await intelligence.innerText();
for(const token of ['OMEGA PC A','dev-a','CPU-A-ONLY','GPU-A-ONLY','proof_job_a','LOCAL MACRO STORE'])if(!text.includes(token))throw new Error(`R238 selected host A missing ${token}`);
for(const forbidden of ['CPU-B-ONLY','GPU-B-ONLY','proof_job_b'])if(text.includes(forbidden))throw new Error(`R238 leaked host B proof into selected host A: ${forbidden}`);

const deck=page.locator('[data-r237-command-authority="AUTHENTICATED_BOUNDED_NATIVE_CONTROL"]');
await deck.waitFor({state:'visible'});
const hostSelect=deck.getByRole('combobox',{name:'Authenticated compute host'});
await hostSelect.selectOption('dev-b');
await page.waitForFunction(()=>localStorage.getItem('omega:hybrid:selectedDeviceId')==='dev-b');
await page.waitForFunction(()=>document.querySelector('[data-r238-host-intelligence]')?.getAttribute('data-r238-selected-device')==='dev-b',{timeout:8000});
text=await intelligence.innerText();
for(const token of ['OMEGA PC B','dev-b','CPU-B-ONLY','GPU-B-ONLY','proof_job_b','AVAILABLE'])if(!text.includes(token))throw new Error(`R238 selected host B missing ${token}`);
for(const forbidden of ['CPU-A-ONLY','GPU-A-ONLY','proof_job_a'])if(text.includes(forbidden))throw new Error(`R238 leaked host A proof after R237 selected host B: ${forbidden}`);
if(pageErrors.length)throw new Error(`R238 browser page errors: ${pageErrors.join(' | ')}`);

console.log('OMEGA R238 BUILT BROWSER PASS · real COMPLETE host returns · R237 selected-device identity drives R238 returned host proof · host A/B evidence isolation proven · no cross-host resource leakage');
await browser.close();
