import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync(new URL('../src/OmegaWorkstationFullV2.tsx',import.meta.url),'utf8');
const surfaceBlock=(source.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const routes=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
if(routes.length!==44||new Set(routes).size!==44)throw new Error(`R118 expected 44 unique routes, found ${routes.length}`);

const criticalVisual=new Set(['Matter Traversal','Visual Instrument','Immersive Traversal','Extreme Traversal','Traversal','Forecast','Relativity','Earth Now','Atlas','Infinity','Scale Compiler','Reality Lab','Field','Data Motion','Convergence']);
// R118 is an inherited browser-operational gate. It must recognize additive Sovereign successors
// without pinning the live surface to an obsolete historical revision label.
const sovereignSurfacePattern=/OMEGA SOVEREIGN LINK · R(?:117|120(?: ROOT SAFE)?|127 ZERO DRIFT)/;
const sovereignActionPattern=/FIX CONNECTION NOW|PC ONLINE|DOWNLOAD CLEAN R117 CONNECTOR|DOWNLOAD ROOT-SAFE R120 CONNECTOR|DOWNLOAD R127 ZERO-DRIFT CONNECTOR/;

async function routeDiagnostics(page){
 return page.evaluate(()=>({
  panel:document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')||'',
  expanded:document.documentElement.dataset.omegaNavExpanded||'',
  visibleRoutes:[...document.querySelectorAll('.r89-flat-route')].map(x=>x.querySelector('b')?.textContent?.trim()).filter(Boolean).slice(0,60),
  boot:[...document.querySelectorAll('.boot')].map(x=>(x.textContent||'').trim()).filter(Boolean).slice(0,6)
 }));
}

async function openRoute(page,route,viewportName){
 console.log(`R118 E2E ${viewportName} → ${route}`);
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count())await expand.first().click();
 try{await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000})}
 catch{throw new Error(`${viewportName} ${route}: navigator failed to expand · ${JSON.stringify(await routeDiagnostics(page))}`)}
 const found=await page.evaluate(route=>{
  const buttons=[...document.querySelectorAll('.r89-flat-route')];
  const button=buttons.find(x=>x.querySelector('b')?.textContent?.trim()===route);
  if(!button)return false;
  button.click();
  return true;
 },route);
 if(!found)throw new Error(`${viewportName} ${route}: route button missing · ${JSON.stringify(await routeDiagnostics(page))}`);
 try{await page.waitForFunction(route=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===route,route,{timeout:20000})}
 catch{throw new Error(`${viewportName} ${route}: route click did not become active panel · ${JSON.stringify(await routeDiagnostics(page))}`)}
 try{await page.waitForFunction(route=>{
  const root=document.querySelector('.omega-workstation-v2');
  if(!root||root.getAttribute('data-panel')!==route)return false;
  const surface=root.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(route)}"]`)||root.querySelector('.omega-surface-r81');
  if(!surface)return false;
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const deferred=[...surface.querySelectorAll('.r109-specialist-loading')].some(visible);
  const bootPending=[...surface.querySelectorAll('.boot')].filter(visible).some(x=>/LOADING|PREPARING|BOOT|MATERIALIZING/i.test(x.textContent||''));
  return !deferred&&!bootPending;
 },route,{timeout:20000})}
 catch{throw new Error(`${viewportName} ${route}: specialist did not settle · ${JSON.stringify(await routeDiagnostics(page))}`)}
 if(route==='Hybrid Link'){
  try{await page.waitForFunction(()=>/OMEGA SOVEREIGN LINK · R(?:117|120(?: ROOT SAFE)?|127 ZERO DRIFT)/.test(document.querySelector('.omega-surface-r81')?.textContent||''),{timeout:12000})}
  catch{throw new Error(`${viewportName} Hybrid Link: current Sovereign connection surface never materialized · ${JSON.stringify(await routeDiagnostics(page))}`)}
 }
 if(criticalVisual.has(route)){
  try{await page.waitForFunction(()=>{
   const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>=180&&r.height>=120};
   return [...document.querySelectorAll('.omega-surface-r81 canvas,.omega-surface-r81 svg')].some(visible);
  },{timeout:12000})}
  catch{throw new Error(`${viewportName} ${route}: visual stage never materialized · ${JSON.stringify(await routeDiagnostics(page))}`)}
 }
}

async function inspectRoute(page,route,viewportName){
 const result=await page.evaluate(({route,visual})=>{
  const root=document.querySelector('.omega-workstation-v2');
  const main=document.querySelector('.workstation-main');
  const surface=root?.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(route)}"]`)||root?.querySelector('.omega-surface-r81');
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const errors=[...(surface?.querySelectorAll('.boot')||[])].filter(visible).map(x=>x.textContent||'').filter(x=>/ERROR|FAILED/i.test(x));
  const canvases=[...(surface?.querySelectorAll('canvas,svg')||[])].filter(visible).map(el=>{const r=el.getBoundingClientRect();return{w:r.width,h:r.height,tag:el.tagName,label:el.getAttribute('aria-label')||''}});
  const viewportOverflow=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth;
  const mainRect=main?.getBoundingClientRect();
  return{panel:root?.getAttribute('data-panel')||'',errors,canvases,viewportOverflow,mainWidth:mainRect?.width||0,visual,text:(surface?.textContent||'').slice(0,30000)};
 },{route,visual:criticalVisual.has(route)});
 if(result.panel!==route)throw new Error(`${viewportName} ${route}: active panel mismatch ${result.panel}`);
 if(result.errors.length)throw new Error(`${viewportName} ${route}: visible runtime error ${result.errors.join(' | ').slice(0,700)}`);
 if(result.viewportOverflow>8)throw new Error(`${viewportName} ${route}: viewport horizontal overflow ${result.viewportOverflow}px`);
 if(result.mainWidth<220)throw new Error(`${viewportName} ${route}: working surface collapsed to ${result.mainWidth}px`);
 if(/REGISTERED · NO ACTIVE UTILITY IMPLEMENTATION/i.test(result.text))throw new Error(`${viewportName} ${route}: route fell into non-operational placeholder authority`);
 if(result.visual&&!result.canvases.some(x=>x.w>=180&&x.h>=120))throw new Error(`${viewportName} ${route}: visual-first route has no usable canvas/SVG stage after deferred module settlement; observed ${JSON.stringify(result.canvases).slice(0,700)}`);
 if(route==='Hybrid Link'){
  if(!sovereignSurfacePattern.test(result.text))throw new Error(`${viewportName} Hybrid Link: current Sovereign connection authority missing`);
  if(!sovereignActionPattern.test(result.text))throw new Error(`${viewportName} Hybrid Link: no actionable connection control`);
 }
}

async function runViewport(browser,name,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:1});
 const page=await context.newPage();
 let activeRoute='BOOT';
 const pageErrors=[];
 const badResponses=[];
 page.on('pageerror',e=>pageErrors.push(`${activeRoute} :: ${String(e)}`));
 page.on('response',response=>{if(response.status()>=400)badResponses.push(`${activeRoute} :: HTTP ${response.status()} ${new URL(response.url()).pathname}`)});
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('main.r71-home, .omega-workstation-v2',{timeout:30000});
 for(const route of routes){
  activeRoute=route;
  await openRoute(page,route,name);
  await inspectRoute(page,route,name);
 }
 if(pageErrors.length)throw new Error(`${name}: uncaught browser errors: ${pageErrors.join(' | ').slice(0,2600)} · network=${badResponses.join(' | ').slice(0,1800)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 await runViewport(browser,'desktop',{width:1440,height:960});
 await runViewport(browser,'mobile',{width:390,height:844});
 console.log(`R118 BROWSER OPERATIONAL PASS · ${routes.length} routes × desktop/mobile · current Sovereign successor surface through R127 · R109 deferred specialists settled · no startup errors · no route placeholders · no horizontal overflow · visual stages present`);
}finally{await browser.close()}