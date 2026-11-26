import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const repoSource=readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const block=repoSource.match(/OMEGA7_NATIVE_ROUTES=Object\.freeze\(\[([\s\S]*?)\] as const/);
if(!block)throw Error('R884 cannot prove source registered routes; registry parse failed');
const routes=[...block[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(routes.length!==44||new Set(routes).size!==44)throw Error('R884 route census is not exact 44 unique routes');
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));
page.setDefaultTimeout(15000);
try{
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
 for(let i=0;i<routes.length;i++){
  const route=routes[i];
  await page.locator('.o7-search-trigger').click();
  await page.locator('.o7-command input').fill(route);
  const exact=page.locator('.o7-command button[data-command-route="'+route+'"]');
  await exact.first().waitFor({state:'visible',timeout:15000});
  await exact.first().click();
  await page.waitForFunction(expected=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===expected,route,{timeout:15000});
  await page.locator('.o7-native-host').waitFor({state:'visible',timeout:15000});
  await page.waitForFunction(()=>{
   return Boolean(document.querySelector('.o7-native-workspace,[data-omega7-native],.o7-native-failure'));
  },null,{timeout:20000});
  if(await page.locator('.o7-native-failure').count())throw Error('Route '+route+' opened a native failure surface.');
  if(await page.locator('.r319-bounded-surface-error').count())throw Error('Route '+route+' opened an uncaught application boundary.');
  const uri=new URL(page.url());
  if(uri.searchParams.get('omega7route')!==route||uri.searchParams.get('omega7')!=='1')
   throw Error('Route '+route+' opened but lost exact browser URL');
  const link=page.locator('.o7-native-toolbar a[data-r778-native-link]');
  const href=await link.getAttribute('href');
  const url=new URL(href||'',base+'/');
  if(url.searchParams.get('omega7route')!==route)throw Error('Route '+route+' has broken direct-link destination');
  if(errors.length)throw Error('Uncaught route '+route+' browser exception: '+errors.slice(-3).join(' | '));
  if((i+1)%11===0)console.log('R884 44-route navigation checkpoint '+(i+1)+'/44: source navigation, native surface, deep-link identity PASS');
 }
 console.log('R884 44/44 menu destinations open a source native workspace with exact browser URL. UI route proof only, not backend executor or PC acceptance.');
 // OMEGA's important new operator surfaces must be reachable from existing menus.
 await page.locator('.o7-search-trigger').click();
 await page.locator('.o7-command input').fill('Create');
 await page.locator('.o7-command button[data-command-route="Create"]').first().click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Create');
 const openStudio=page.getByRole('button',{name:'Open Creation Studio'});
 await openStudio.waitFor({state:'visible',timeout:30000});
 await openStudio.click();
 const studio=page.locator('[data-r881-creation-studio="REAL_COMPUTED_20736"]');
 await studio.waitFor({state:'visible',timeout:30000});
 await studio.locator('canvas').waitFor({state:'visible',timeout:10000});
 const controls=await studio.getByRole('button').allTextContents();
 for(const format of ['SVG','PNG','CSV','JSON','XLSX','Proof manifest'])
  if(!controls.some(text=>text.includes(format)))throw Error('Creation Studio export control missing: '+format);
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>({scrollWidth:document.body.scrollWidth,width:innerWidth}));
 if(overflow.scrollWidth>overflow.width+12)throw Error('Mobile Create Studio overflow: '+JSON.stringify(overflow));
 console.log('R884 Creation Studio local mobile source UI and six export actions PASS; pixel/host/source execution separate.');
 await page.locator('.o7-search-trigger').click();
 await page.locator('.o7-command input').fill('Hybrid Link');
 await page.locator('.o7-command button[data-command-route="Hybrid Link"]').first().click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Hybrid Link',null,{timeout:15000});
 const hub=page.locator('[data-r884-local-hub="LOOPBACK_INTEGRATION_ONLY"]');
 await hub.waitFor({state:'visible',timeout:30000});
 const fullHybrid=page.getByRole('button',{name:'Open full Hybrid Link workspace'});
 if(await fullHybrid.count())await fullHybrid.click();
 await page.locator('[data-r264-operational-surfaces="FULL"]').waitFor({state:'visible',timeout:30000});
 await page.locator('[data-r209-lineage-review]').waitFor({state:'visible',timeout:30000});
 const state=await hub.locator('[data-r884-loopback-state]').getAttribute('data-r884-loopback-state');
 if(state!=='UNCONNECTED')throw Error('Local hub claimed connection without physical/loopback evidence');
 if(await hub.locator('#r884-token[type=password]').count()!==1)throw Error('R881 hub private token input missing');
 const bridge=hub.getByRole('region',{name:'Recoverable operational workspace'});
 if(await bridge.locator('input[type=password]').count()!==1)throw Error('Operational bridge private token input missing');
 if(await hub.locator('input[type=password]').count()!==2)throw Error('Unexpected credential field census');
 if(!await bridge.getByRole('button',{name:'Audit workspace'}).isDisabled())throw Error('Bridge audit enabled without a session token');
 if(await bridge.getByRole('button',{name:'Run certified forward / inverse batch'}).count()!==0)throw Error('Bridge execution exposed without verified status');
 if(await bridge.getByRole('button',{name:'Load source catalogue'}).count()!==0)throw Error('Catalogue exposed without verified status');
 if(await bridge.getByRole('button',{name:'Commit scoped receipt'}).count()!==0)throw Error('Mode write exposed without verified status');

 // Fixture-only UI proof. The real mathematical/host execution is verified by the local runtime.
 if(await bridge.getByRole('button',{name:'Plan and evaluate'}).count()!==0)throw Error('Relational controls exposed without local audit');
 const pointer={version:1,workspace:'a'.repeat(64),checkpoint:{count:58,head:'b'.repeat(64)}};
 const flags={schema:'OMEGA_EVENT_WORKSPACE_BRIDGE_V1',scope:'LOCAL_OPERATIONAL_ONLY',physicalPcAccepted:false,gpuAccepted:false,canonPromoted:false};
 let enabled=false,commits=0;
 await page.route('http://127.0.0.1:8766/**',async route=>{
  const rq=route.request(),url=new URL(rq.url());
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'Content-Type, X-Omega-Local-Token','access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-private-network':'true'};
  if(rq.method()==='OPTIONS'){await route.fulfill({status:204,headers});return}
  const respond=data=>route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify(data)});
  if(url.pathname==='/v1/status')return respond({...flags,pointer,cells:20759,channels:[373030,18155335,17782306],queue:{jobs:10,statuses:{DONE:10},queue_sha256:'c'.repeat(64),checkpoint:pointer.checkpoint},evidence:{nodes:453,live:430},operatorReady:true,executionEnabled:enabled,descendants:[]});
  if(url.pathname==='/v1/workbench/mission-preview'){const body=rq.postDataJSON();if(body.pointer.workspace!==pointer.workspace||!Array.isArray(body.paths))throw Error('Mission fixture request mismatch');return respond({...flags,pointer,data:{pointer,ready:true,intent_sha256:'d'.repeat(64),task_count:44,statuses:{COMPUTED:44},expected:{count:59,head:'e'.repeat(64)}}})}
  if(url.pathname==='/v1/workbench/mission-commit'){commits++;const body=rq.postDataJSON();if(!enabled||body.intent_sha256!=='d'.repeat(64)||body.pointer.workspace!==pointer.workspace)throw Error('Unapproved mission fixture commit');const next={version:1,workspace:'f'.repeat(64),checkpoint:{count:59,head:'e'.repeat(64)}};return respond({...flags,pointer:next,data:{pointer:next,status:'DONE'}})}
  await route.fulfill({status:404,headers,body:'{}'});
 });
 await bridge.locator('input[type=password]').fill('fixture-session-token-not-real');
 await bridge.getByRole('button',{name:'Audit workspace'}).click();
 const planButton=bridge.getByRole('button',{name:'Plan and evaluate'}),executeButton=bridge.getByRole('button',{name:'Execute verified plan'});
 await planButton.waitFor({state:'visible'});await planButton.click();
 await bridge.getByText('Plan ready: true · 44 tasks.').waitFor();
 if(!await executeButton.isDisabled())throw Error('Read-only mission exposed a write');
 enabled=true;await bridge.getByRole('button',{name:'Audit workspace'}).click();await planButton.waitFor({state:'visible'});await planButton.click();
 await bridge.getByText('Plan ready: true · 44 tasks.').waitFor();
 await bridge.getByLabel('Optional audit addresses').fill('188');
 if(!await executeButton.isDisabled())throw Error('Edited mission kept stale write permission');
 await planButton.click();await bridge.getByText('Plan ready: true · 44 tasks.').waitFor();await executeButton.click();
 await bridge.getByText('Relational operation completed at event 59. Audit to inspect the new state.').waitFor();
 if(commits!==1)throw Error('Unexpected number of mission fixture writes');
 await page.unroute('http://127.0.0.1:8766/**');
 console.log('Relational mission fixture: read-only, stale edit invalidation, explicit write and checkpoint verification PASS; not host acceptance.');

 console.log('R884 Hybrid Link local hub available, token memory-only, default unconnected and no PC acceptance PASS');
}finally{
 await context.close();
 await browser.close();
}
