import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync(new URL('../src/OmegaWorkstationFullV2.tsx',import.meta.url),'utf8');
const surfaceBlock=(source.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const routes=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
if(routes.length!==44||new Set(routes).size!==44)throw new Error(`R118 expected 44 unique routes, found ${routes.length}`);

const criticalVisual=new Set(['Matter Traversal','Visual Instrument','Immersive Traversal','Extreme Traversal','Traversal','Forecast','Relativity','Earth Now','Atlas','Infinity','Scale Compiler','Reality Lab','Field','Data Motion','Convergence']);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function openRoute(page,route){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
 const found=await page.evaluate(route=>{
  const buttons=[...document.querySelectorAll('.r89-flat-route')];
  const button=buttons.find(x=>x.querySelector('b')?.textContent?.trim()===route);
  if(!button)return false;
  button.click();
  return true;
 },route);
 if(!found)throw new Error(`route button missing: ${route}`);
 await page.waitForFunction(route=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===route,route,{timeout:20000});
 await sleep(90);
}

async function inspectRoute(page,route,viewportName){
 const result=await page.evaluate(({route,visual})=>{
  const root=document.querySelector('.omega-workstation-v2');
  const main=document.querySelector('.workstation-main');
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const errors=[...document.querySelectorAll('.boot')].filter(visible).map(x=>x.textContent||'').filter(x=>/ERROR|FAILED/i.test(x));
  const canvases=[...document.querySelectorAll('canvas,svg')].filter(visible).map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height}});
  const headings=[...document.querySelectorAll('h1,h2,h3')].filter(visible).map(x=>(x.textContent||'').trim()).filter(Boolean);
  const viewportOverflow=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth;
  const mainRect=main?.getBoundingClientRect();
  return{
   panel:root?.getAttribute('data-panel')||'',
   errors,
   headings,
   canvases,
   viewportOverflow,
   mainWidth:mainRect?.width||0,
   mainLeft:mainRect?.left||0,
   visual,
   text:(root?.textContent||'').slice(0,20000)
  };
 },{route,visual:criticalVisual.has(route)});
 if(result.panel!==route)throw new Error(`${viewportName} ${route}: active panel mismatch ${result.panel}`);
 if(result.errors.length)throw new Error(`${viewportName} ${route}: visible runtime error ${result.errors.join(' | ').slice(0,700)}`);
 if(result.viewportOverflow>8)throw new Error(`${viewportName} ${route}: viewport horizontal overflow ${result.viewportOverflow}px`);
 if(result.mainWidth<220)throw new Error(`${viewportName} ${route}: working surface collapsed to ${result.mainWidth}px`);
 if(/REGISTERED · NO ACTIVE UTILITY IMPLEMENTATION/i.test(result.text))throw new Error(`${viewportName} ${route}: route fell into non-operational placeholder authority`);
 if(result.visual&&!result.canvases.some(x=>x.w>=180&&x.h>=120))throw new Error(`${viewportName} ${route}: visual-first route has no usable canvas/SVG stage`);
 if(route==='Hybrid Link'){
  if(!/OMEGA SOVEREIGN LINK · R117/.test(result.text))throw new Error(`${viewportName} Hybrid Link: R117 connection authority missing`);
  if(!/FIX CONNECTION NOW|PC ONLINE|DOWNLOAD CLEAN R117 CONNECTOR/.test(result.text))throw new Error(`${viewportName} Hybrid Link: no actionable connection control`);
 }
}

async function runViewport(browser,name,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:1});
 const page=await context.newPage();
 const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('main.r71-home, .omega-workstation-v2',{timeout:30000});
 for(const route of routes){
  await openRoute(page,route);
  await inspectRoute(page,route,name);
 }
 if(pageErrors.length)throw new Error(`${name}: uncaught browser errors: ${pageErrors.join(' | ').slice(0,1800)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 await runViewport(browser,'desktop',{width:1440,height:960});
 await runViewport(browser,'mobile',{width:390,height:844});
 console.log(`R118 BROWSER OPERATIONAL PASS · ${routes.length} routes × desktop/mobile · no startup errors · no route placeholders · no horizontal overflow · visual stages present`);
}finally{await browser.close()}
