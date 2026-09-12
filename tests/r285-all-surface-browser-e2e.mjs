import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const expected=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(expected.length!==44||new Set(expected).size!==44)throw new Error(`R285 expected 44 unique canonical surfaces, received ${expected.length}/${new Set(expected).size}`);

const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];

async function openNavigator(page){
  if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
  const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(!await expand.count())throw new Error('R285 global navigator expand control missing');
  await expand.first().scrollIntoViewIfNeeded();
  await expand.first().click();
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
}

async function clickRoute(page,route){
  await openNavigator(page);
  const buttons=page.locator('.r89-flat-route');
  const count=await buttons.count();
  let hit=-1;
  for(let i=0;i<count;i++){
    const label=(await buttons.nth(i).locator('b').first().textContent().catch(()=>''))?.trim();
    if(label===route){hit=i;break}
  }
  if(hit<0)throw new Error(`R285 route button missing: ${route}`);
  const button=buttons.nth(hit);
  await button.scrollIntoViewIfNeeded();
  await button.click({timeout:10000});
  await page.waitForFunction(name=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===name,route,{timeout:20000});
}

function usableSnapshot(){
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
  const main=document.querySelector('.workstation-main');
  const rect=main?.getBoundingClientRect();
  const buttons=[...document.querySelectorAll('.workstation-main button')].filter(visible);
  const unusable=buttons.filter(b=>{const r=b.getBoundingClientRect();return !b.disabled&&(r.width<8||r.height<8||getComputedStyle(b).pointerEvents==='none')}).map(b=>(b.textContent||b.getAttribute('aria-label')||'unnamed').trim().slice(0,80));
  const activePanels=[...document.querySelectorAll('.workstation-main :is(.panel,.special-app)')].filter(visible).length;
  return{width:rect?.width||0,height:rect?.height||0,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,visibleButtons:buttons.length,unusable,activePanels};
}

const browser=await chromium.launch({headless:true});
try{
  for(const [name,viewport] of viewports){
    const context=await browser.newContext({viewport,deviceScaleFactor:1});
    const page=await context.newPage();
    const pageErrors=[];
    page.on('pageerror',e=>pageErrors.push(String(e)));
    await page.goto(`${base}/?r285=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
    await openNavigator(page);
    const navLabels=(await page.locator('.r89-flat-route b').allTextContents()).map(x=>x.trim()).filter(Boolean);
    const unique=[...new Set(navLabels)];
    if(unique.length!==44)throw new Error(`${name}: expected 44 unique route controls, received ${unique.length}`);
    for(const route of expected)if(!unique.includes(route))throw new Error(`${name}: navigator omitted canonical route ${route}`);

    for(const route of expected){
      await clickRoute(page,route);
      const snap=await page.evaluate(usableSnapshot);
      if(snap.width<220||snap.height<80)throw new Error(`${name}/${route}: workstation unusable ${JSON.stringify(snap)}`);
      if(snap.overflow>24)throw new Error(`${name}/${route}: viewport overflow ${snap.overflow}px`);
      if(snap.unusable.length)throw new Error(`${name}/${route}: visible enabled controls are non-interactive ${snap.unusable.join(' | ')}`);
      if(snap.activePanels<1)throw new Error(`${name}/${route}: no visible panel/application content mounted`);
    }
    if(pageErrors.length)throw new Error(`${name}: browser page errors ${pageErrors.join(' | ').slice(0,3000)}`);
    await context.close();
  }
  console.log('R285 ALL-SURFACE BROWSER PASS · 44/44 canonical route buttons exercised with real pointer clicks on desktop + 390px mobile · each route mounted its exact data-panel · visible controls retained usable hit geometry · no material viewport overflow · no page errors.');
}finally{await browser.close()}
