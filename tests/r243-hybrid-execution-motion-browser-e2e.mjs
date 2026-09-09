import {chromium} from 'playwright';

const base=process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
const now=Date.now();
const caps=['DESKTOP_HEALTH','HASH_TREE','FORENSIC_HASH_LEDGER','INDEX','BUILD','TEST','PACKAGE','TRAIN_LOCAL'];
// R243 is the product/integration successor. The existing R242 lease wire protocol is intentionally preserved underneath it.
const running={id:'job-r243-live',targetDeviceId:'dev-r243',projectPath:'OMEGAv6',status:'RUNNING',startedAt:now-12500,lastProgressAt:now-800,leaseUntil:now+19000,steps:[{id:'S01',op:'INDEX'},{id:'S02',op:'HASH_TREE'},{id:'S03',op:'BUILD'}],progress:{schema:'OMEGA_HYBRID_EXECUTION_PROGRESS_R242',revision:'R242',at:now-800,seq:5,state:'STEP_RUNNING',stepId:'S02',stepOp:'HASH_TREE',stepIndex:2,totalSteps:3,completedSteps:1,elapsedMs:11700,message:'Fingerprint selected OMEGAv6 project'}};
const status={state:'VERIFIED_DEVICE_ONLINE',nativeExecutionClaimed:true,executionMotionRevision:'R242',runningLeaseMs:20000,devices:[{id:'dev-r243',name:'OMEGA R243 MOTION PC',online:true,revoked:false,lastSeen:now-500,rootLabel:'J:/',capabilities:caps,proofExtensions:['R205','R238','R240','R242','R243']}],jobs:[running]};
const missions={ok:true,state:'VERIFIED_DEVICE_ONLINE',missions:[{id:'mission-r243',schema:'OMEGA_SOVEREIGN_FULL_BUILD_MISSION_R153',targetDeviceId:'dev-r243',status:'ACTIVE',stage:'BUILD_VERIFY',cycle:3,maxCycles:12,currentJobId:running.id,currentJob:running}]};
await page.route('**/api/hybrid/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(status)}));
await page.route('**/api/missions',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(missions)}));
await page.addInitScript(()=>localStorage.setItem('omega:hybrid:selectedDeviceId','dev-r243'));
await page.goto(base,{waitUntil:'networkidle'});
await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const hybridEntry=page.locator('.r96-quick-card button').filter({hasText:'Hybrid'}).first();await hybridEntry.waitFor({state:'visible'});await hybridEntry.click();
const motion=page.locator('[data-r243-motion]');await motion.waitFor({state:'visible'});
await page.waitForFunction(()=>document.querySelector('[data-r243-motion]')?.getAttribute('data-r243-motion')==='MOTION_PROVED');
const text=await motion.innerText();
for(const token of ['MOTION PROVED','HASH_TREE','S02','step 2/3','1 / 3','transport R242','R141 returned proof'])if(!text.includes(token))throw new Error(`R243 motion convergence surface missing ${token}: ${text.slice(0,1800)}`);
if(await motion.getAttribute('data-r243-job')!==running.id)throw new Error('R243 motion surface lost exact selected-host job identity');
if(await motion.getAttribute('data-r243-transport')!=='R242')throw new Error('R243 convergence must expose inherited R242 wire protocol identity rather than silently renumber it');
const progress=motion.getByRole('progressbar');if(await progress.getAttribute('aria-valuenow')!=='1')throw new Error('R243 progressbar did not bind returned-step count');
if(pageErrors.length)throw new Error(`R243 browser page errors: ${pageErrors.join(' | ')}`);
console.log('OMEGA R243 BUILT BROWSER PASS · selected authenticated host exposes R243 convergence over inherited R242 renewable lease transport · exact HASH_TREE S02 motion · 1/3 returned-step boundary · selected-host identity retained · no protocol renumbering or prose-only INVOKED ambiguity');
await browser.close();
