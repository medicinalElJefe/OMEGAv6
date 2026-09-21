import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:980},deviceScaleFactor:1});
const page=await context.newPage();
const pageErrors=[];const mutations=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))mutations.push({method:r.method(),url:r.url()})});

const evidence={
 schema:'OMEGA_EARTH_EVIDENCE_V1',
 target:{lat:32.2,lon:-110.9,crs:'WGS84 / EPSG:4326'},
 verifiedAt:'2026-09-21T02:40:00.000Z',
 evidenceHash:'r347-browser-proof',
 localConditions:{time:'2026-09-21T02:30:00.000Z',temperatureC:31.4,windKph:18.7,cloudPct:21},
 seismic:{count:14,maxMagnitude:4.2,nearest:null},
 naturalEvents:{count:3,categories:['Wildfires'],nearest:null},
 spaceWeather:{kp:3.7,observationTime:'2026-09-21T02:00:00.000Z'},
 sources:{
  usgs:{ok:true,verifiedAt:'2026-09-21T02:39:00.000Z',source:'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'},
  swpc:{ok:true,verifiedAt:'2026-09-21T02:39:00.000Z',source:'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'},
  openMeteo:{ok:true,verifiedAt:'2026-09-21T02:39:00.000Z',source:'https://api.open-meteo.com/v1/forecast'},
  eonet:{ok:true,verifiedAt:'2026-09-21T02:39:00.000Z',source:'https://eonet.gsfc.nasa.gov/api/v3/events'}
 },
 derivedContext:{index:.22,truth:'DERIVED_DISPLAY_CONTEXT_ONLY'}
};

await page.route('**/api/earth/evidence?**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(evidence)}));
await page.route('**/api/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,state:'LIVE',runtime:{state:'LIVE'}})}));
await page.route('**/api/hybrid/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,paired:false,devices:[],jobs:[],missions:[]})}));
await page.route('**/api/restoration',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,state:'SOURCE_BOUND'})}));
await page.route('**/omega-federation.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schema:'OMEGA_TEST',nodes:[]})}));

async function openNavigator(){
 if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
 const b=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(!await b.count())throw new Error('R347 global navigator expand control missing');
 await b.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
}
async function openCockpit(){
 await openNavigator();
 const all=page.getByRole('button',{name:/^ALL\s+44$/});if(await all.count())await all.first().click();
 const rows=page.locator('.r89-flat-route');
 const count=await rows.count();let hit=-1;
 for(let i=0;i<count;i++){const label=((await rows.nth(i).locator('b').first().textContent().catch(()=>''))||'').trim();if(label==='Cockpit'){hit=i;break}}
 if(hit<0)throw new Error('R347 Cockpit route missing from current navigator');
 await rows.nth(hit).scrollIntoViewIfNeeded();
 await rows.nth(hit).click();
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Cockpit',{timeout:20000});
 await page.locator('.r347-cockpit').waitFor({state:'visible',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded!=='true',{timeout:10000});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

await page.goto(base+'/?r347-browser='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
await openCockpit();
mutations.length=0;

if(await page.locator('.r347-cockpit').count()!==1)throw new Error('R347 current Cockpit route did not mount exactly one visual cockpit');
for(const text of['OBSERVED','COMPUTED','FORECAST','PHYSICAL ENERGY HELD','TIME CORRELATION','WHY IT LOOKS THIS WAY','Visual encoding registry · exact channel authority'])if(!(await page.getByText(text,{exact:true}).count()))throw new Error('R347 cockpit missing '+text);

const taskButtons=page.locator('.r347-controls nav button');
if(await taskButtons.count()!==5)throw new Error(`R347 expected 5 task views, saw ${await taskButtons.count()}`);
for(const text of['Now','Route','Proof','Scar','Forecast'])if(!(await taskButtons.filter({hasText:text}).count()))throw new Error('R347 task view missing '+text);

const canvas=page.locator('.r347-stage canvas');
await canvas.waitFor({state:'visible'});
const box=await canvas.boundingBox();
if(!box||box.width<600||box.height<420)throw new Error(`R347 desktop stage too small ${JSON.stringify(box)}`);
const aria=await canvas.getAttribute('aria-label');
for(const token of['drag to orbit','wheel to semantic zoom','click to select'])if(!aria?.includes(token))throw new Error('R347 canvas interaction contract missing '+token);

const liveText=await page.locator('.r347-live').innerText();
for(const token of['Temperature','31.4 °C','Wind','18.7 km/h','Seismic events','14.0 events/24h','Kp index','3.7 index'])if(!liveText.includes(token))throw new Error('R347 admitted live scalar missing '+token);
if(liveText.includes('Temperature\n31.4 °C · HELD')||liveText.includes('Wind\n18.7 km/h · HELD')||liveText.includes('Kp index\n3.7 index · HELD'))throw new Error('R347 source-complete mocked scalar was incorrectly held');
if(!liveText.includes('does not infer causation'))throw new Error('R347 non-causal correlation boundary missing');

const correlation=page.locator('.r347-correlation-frame');
if(await correlation.count()!==1)throw new Error('R347 correlation frame missing');
const correlationText=await correlation.innerText();
for(const token of['HUMAN CORRELATION FRAME','STATE','SPACE','TIME','ROUTE','CONTEXT','MODEL ACTIVITY','100%'])if(!correlationText.includes(token))throw new Error('R347 human correlation frame missing '+token);
if(!correlationText.includes('not joules, watts or physical flux'))throw new Error('R347 model activity was not explicitly separated from physical energy');

const clocks=page.locator('.r347-source-clocks article');
if(await clocks.count()!==4)throw new Error(`R347 expected 4 independent source clocks, saw ${await clocks.count()}`);
const clocksText=await page.locator('.r347-source-clocks').innerText();
for(const token of['Weather observation','Kp observation','USGS seismic snapshot','EONET event snapshot','OBSERVATION','SNAPSHOT VERIFICATION'])if(!clocksText.includes(token))throw new Error('R347 source-clock rail missing '+token);

const quantities=page.locator('.r347-quantity-registry');
if(await quantities.count()!==1)throw new Error('R347 physical-quantity registry missing');
const quantityText=await quantities.innerText();
for(const token of['MODEL ACTIVITY','ENERGY','POWER','FLUX','VELOCITY','FIELD_STRENGTH','HELD UNTIL BOUND'])if(!quantityText.includes(token))throw new Error('R347 quantity authority missing '+token);


const proofButton=taskButtons.filter({hasText:'Proof'}).first();
await proofButton.click();
if(!(await proofButton.getAttribute('class')||'').includes('active'))throw new Error('R347 Proof task view did not activate');

const beforeState=(await page.locator('.r347-inspector>header b').innerText()).trim();
const cx=box.x+box.width/2,cy=box.y+box.height/2;
await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.move(cx+130,cy+70,{steps:8});await page.mouse.up();
const afterDrag=(await page.locator('.r347-inspector>header b').innerText()).trim();
if(afterDrag!==beforeState)throw new Error('R347 camera drag mutated selected canonical state');

for(let i=0;i<8;i++)await page.mouse.wheel(0,-220);
await page.waitForFunction(()=>document.querySelector('.r347-stage-hud')?.textContent?.includes('DETAIL'),{timeout:5000});
if(!(await page.locator('.r347-stage-hud').innerText()).includes('DETAIL'))throw new Error('R347 wheel semantic zoom did not enter DETAIL band');

const routeButtons=page.locator('.r347-route-time button');
if(await routeButtons.count()<2)throw new Error('R347 model-route timeline has insufficient selectable states');
const stateBeforeRoute=(await page.locator('.r347-inspector>header b').innerText()).trim();
await routeButtons.nth(1).click();
await page.waitForFunction(before=>document.querySelector('.r347-inspector>header b')?.textContent?.trim()!==before,stateBeforeRoute,{timeout:10000});
const stateAfterRoute=(await page.locator('.r347-inspector>header b').innerText()).trim();
if(stateAfterRoute===stateBeforeRoute)throw new Error('R347 model-route selection did not advance selected state');

const routePlay=page.getByRole('button',{name:/Traverse route/});
await routePlay.click();
if(!(await page.getByRole('button',{name:/Pause route/}).count()))throw new Error('R347 route playback did not enter active state');
await page.waitForTimeout(1300);
await page.getByRole('button',{name:/Pause route/}).click();

const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+24);
if(!noOverflow)throw new Error('R347 desktop cockpit introduced material horizontal viewport overflow');

await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const mobileBox=await canvas.boundingBox();
if(!mobileBox||mobileBox.width<340||mobileBox.height<450)throw new Error(`R347 mobile stage too small ${JSON.stringify(mobileBox)}`);
const mobileNoOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+16);
if(!mobileNoOverflow)throw new Error('R347 mobile cockpit introduced horizontal viewport overflow');
if(await page.locator('.r347-correlation-frame').count()!==1||await page.locator('.r347-quantity-registry').count()!==1)throw new Error('R347 mobile reflow lost correlation/quantity surfaces');

if(mutations.length)throw new Error('R347 read-only cockpit emitted mutating network requests '+JSON.stringify(mutations));
if(pageErrors.length)throw new Error('R347 browser page errors '+pageErrors.join(' | '));

console.log('R347 BROWSER PASS · current R307 Cockpit route mounts deferred R347 specialist · 20,736 calibrated canvas visible · task views operable · drag camera does not mutate state · wheel semantic zoom reaches DETAIL · model-route state selection/playback works · unit/source/time admitted live scalars visible · source-specific clocks + correlation frame + physical quantity authority visible · desktop/mobile stage usable without overflow · non-causal correlation boundary present · no mutating requests · no page errors');
await context.close();
await browser.close();
