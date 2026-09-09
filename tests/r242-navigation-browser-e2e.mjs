import {chromium} from 'playwright';

const base=process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const pageErrors=[];
const mutatingRequests=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
page.on('request',request=>{if(['POST','PUT','PATCH','DELETE'].includes(request.method()))mutatingRequests.push(`${request.method()} ${request.url()}`)});

await page.route('**/api/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'OK'})}));
await page.route('**/api/hybrid/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,paired:false,devices:[],jobs:[],missions:[]})}));
await page.route('**/omega-federation.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schema:'OMEGA_TEST',nodes:[]})}));

await page.goto(base,{waitUntil:'networkidle'});
const nav=page.locator('#omega-global-navigator');
await page.getByLabel('Browse all registered OMEGA tools').click();
await nav.waitFor({state:'visible'});
const all=nav.getByRole('button',{name:/^ALL\s+\d+$/});
if(await all.count()!==1)throw new Error('R242.1 ALL partition control missing');
await all.click();

if(await nav.getAttribute('data-navigation-lemma-revision')!=='R242')throw new Error('R242.1 lemma revision not bound to rendered navigator');
if(await nav.getAttribute('data-lemma-pass')!=='true')throw new Error('R242.1 structural lemma did not pass in browser');
const operator=await nav.getAttribute('data-lemma-operator')||'';
for(const token of ['PARTITION','EXCHANGE/TRANSFORM','INVARIANT CARRY','SCAR/RESIDUAL CARRY','RE-CONTEXTUALIZE/REPARTITION'])if(!operator.includes(token))throw new Error(`R242.1 continuity operator missing ${token}`);

const declared=Number((await all.innerText()).match(/\d+/)?.[0]||0);
const rows=nav.locator('.r89-flat-route');
if(declared<1||await rows.count()!==declared)throw new Error(`R242.1 route conservation mismatch declared=${declared} rendered=${await rows.count()}`);
const identities=await rows.evaluateAll(nodes=>nodes.map(node=>({name:node.getAttribute('data-route-name')||'',id:node.getAttribute('data-route-id')||''})));
if(identities.some(x=>!x.name||!x.id))throw new Error('R242.1 route rows must retain both exact presentation identity and R143 machine identity');
if(new Set(identities.map(x=>x.name)).size!==declared)throw new Error('R242.1 duplicate/missing exact route names');
if(new Set(identities.map(x=>x.id)).size!==declared)throw new Error('R242.1 duplicate/missing R143 machine route identities');

const search=nav.getByLabel('Search all registered OMEGA applications');
const expectFirst=async(query,expected)=>{
 await search.fill(query);
 const visible=nav.locator('.r89-flat-route');
 if(await visible.count()<1)throw new Error(`R242.1 search ${query} returned no route`);
 const first=await visible.first().getAttribute('data-route-name');
 if(first!==expected)throw new Error(`R242.1 exact/token precedence failed for ${query}: expected ${expected}, saw ${first}`);
};
await expectFirst('Governance','Governance');
await expectFirst('System','System');
await expectFirst('Hybrid','Hybrid Link');
await search.fill('definitely-not-a-real-route');
if(await nav.locator('.r89-flat-route').count()!==0)throw new Error('R242.1 nonexistent query fabricated a destination');
if(!(await nav.locator('.r88-empty').innerText()).includes('no destination is fabricated'))throw new Error('R242.1 residual truth text missing');
if(Number(await nav.getAttribute('data-lemma-residual-count')||0)<1)throw new Error('R242.1 missing-query residual was not carried');
await search.fill('');
if(await nav.getAttribute('data-lemma-pass')!=='true'||await rows.count()!==declared)throw new Error('R242.1 route set did not recover after residual query');

const technical=nav.getByRole('button',{name:'Technical',exact:true});
await technical.click();
const footer=await nav.locator('.r88-navigator-foot').innerText();
if(!footer.includes('R242 lemma navigation PASS')||!footer.includes('R143 operation-chain PASS'))throw new Error('R242.1 technical proof footer did not expose lemma + machine authority truth');

for(const routeName of ['Governance','System','Hybrid Link']){
 if(await nav.getAttribute('aria-hidden')==='true'){
  await page.getByLabel('Browse all registered OMEGA tools').click();
  await nav.waitFor({state:'visible'});
  const global=nav.getByRole('button',{name:/^ALL\s+\d+$/});
  if(await global.count())await global.click();
 }
 const row=nav.locator('.r89-flat-route').filter({has:nav.locator(`b:text-is("${routeName}")`)});
 if(await row.count()!==1)throw new Error(`R242.1 exact route row ambiguous/missing: ${routeName}`);
 const machineId=await row.getAttribute('data-route-id');
 if(!machineId)throw new Error(`R242.1 missing R143 machine route identity for ${routeName}`);
 await row.click();
 await page.waitForFunction(name=>document.querySelector('.r94-rail-current')?.getAttribute('title')===name,routeName);
 if(await page.locator('.omega-workstation-v2').getAttribute('data-panel')!==routeName)throw new Error(`R242.1 active workstation drifted after exact navigation: ${routeName}`);
}

if(mutatingRequests.length)throw new Error(`R242.1 navigation emitted mutating requests: ${mutatingRequests.join(' | ')}`);
if(pageErrors.length)throw new Error(`R242.1 page errors: ${pageErrors.join(' | ')}`);

await page.setViewportSize({width:390,height:844});
await page.getByLabel('Browse all registered OMEGA tools').click();
await nav.waitFor({state:'visible'});
const box=await nav.boundingBox();
if(!box||box.width>365)throw new Error(`R242.1 mobile navigator too wide: ${box?.width}`);
if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))throw new Error('R242.1 mobile product introduces horizontal viewport overflow');

console.log(`R242.1 BROWSER PASS · ${declared} exact route identities + unique R143 machine ids · exact Governance/System precedence · Hybrid token resolution · residual fail-close · no mutating navigation requests · desktop/mobile containment`);
await browser.close();
