import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];

async function openDeepVisual(page,name){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count()&&await expand.first().isVisible())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000}).catch(()=>{});
 const opened=await page.evaluate(()=>{const buttons=[...document.querySelectorAll('.r89-flat-route')];const button=buttons.find(x=>x.querySelector('b')?.textContent?.trim()==='Visual Instrument');if(!button)return false;button.click();return true});
 if(!opened)throw new Error(`${name}: Visual Instrument route control missing`);
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Visual Instrument',{timeout:30000});
 const stage=page.locator('.r36-visual .r43-workspace-stage');
 if(await stage.getAttribute('data-view')!=='LIVE')throw new Error(`${name}: Visual Instrument did not open in governed LIVE view`);
 const deep=page.locator('.r36-visual .r43-workspace-tabs button').filter({hasText:'DEEP COMPILER'});
 await deep.waitFor({state:'visible',timeout:15000});
 await deep.click();
 await page.waitForFunction(()=>document.querySelector('.r36-visual .r43-workspace-stage')?.getAttribute('data-view')==='DEEP',{timeout:15000});
 await page.waitForSelector('.visual-instrument-app',{state:'visible',timeout:30000});
 await page.waitForSelector('canvas.r241-living-topology[data-topology-authority="R241_READ_ONLY_PROJECTION"]',{state:'visible',timeout:30000});
}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[],failed=[],mutating=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('requestfailed',r=>failed.push(`${r.method()} ${r.url()} :: ${r.failure()?.errorText||'failed'}`));
  let observeMutation=false;page.on('request',r=>{if(observeMutation&&['POST','PUT','PATCH','DELETE'].includes(r.method()))mutating.push(`${r.method()} ${r.url()}`)});
  await page.goto(`${base}/?r241=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  observeMutation=true;
  await openDeepVisual(page,name);
  await page.waitForTimeout(500);
  const result=await page.evaluate(()=>{
   const canvas=document.querySelector('canvas.r241-living-topology');if(!canvas)return null;
   const rect=canvas.getBoundingClientRect(),style=getComputedStyle(canvas),ctx=canvas.getContext('2d');
   if(!ctx)return{rect:{width:rect.width,height:rect.height},pointerEvents:style.pointerEvents,authority:canvas.getAttribute('data-topology-authority'),aria:canvas.getAttribute('aria-label'),title:canvas.getAttribute('title'),unique:0};
   const image=ctx.getImageData(0,0,canvas.width,canvas.height).data,step=Math.max(4,Math.floor(Math.sqrt((canvas.width*canvas.height)/7000))),unique=new Set();
   for(let y=0;y<canvas.height&&unique.size<80;y+=step)for(let x=0;x<canvas.width&&unique.size<80;x+=step){const k=(y*canvas.width+x)*4;unique.add(`${image[k]},${image[k+1]},${image[k+2]},${image[k+3]}`)}
   return{rect:{width:rect.width,height:rect.height},width:canvas.width,height:canvas.height,pointerEvents:style.pointerEvents,authority:canvas.getAttribute('data-topology-authority'),aria:canvas.getAttribute('aria-label'),title:canvas.getAttribute('title'),unique:unique.size,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth};
  });
  if(!result)throw new Error(`${name}: R241 living topology canvas missing after deep compiler mount`);
  if(result.authority!=='R241_READ_ONLY_PROJECTION')throw new Error(`${name}: R241 topology authority identity regressed: ${result.authority}`);
  if(result.pointerEvents!=='none')throw new Error(`${name}: R241 projection intercepted pointer authority: ${result.pointerEvents}`);
  if(result.rect.width<220||result.rect.height<220||result.width<220||result.height<220)throw new Error(`${name}: R241 canvas unusable ${JSON.stringify(result.rect)} physical ${result.width}x${result.height}`);
  if(result.unique<8)throw new Error(`${name}: R241 canvas did not render a materially varied topology field; sampled colors ${result.unique}`);
  if(!String(result.aria||'').includes('living-topology')||!String(result.aria||'').includes('typed-cognition'))throw new Error(`${name}: R241 accessibility identity missing`);
  for(const token of ['20,736-state packet','not measured physical fluid quantities','R125 sole CanonState admission authority'])if(!String(result.title||'').includes(token))throw new Error(`${name}: R241 truth boundary title missing ${token}`);
  if(result.overflow>12)throw new Error(`${name}: R241 deep visual introduced viewport overflow ${result.overflow}px`);
  if(mutating.length)throw new Error(`${name}: opening R241 visual/cognition projection emitted mutating requests: ${mutating.join(' | ')}`);
  if(pageErrors.length)throw new Error(`${name}: browser page errors ${pageErrors.join(' | ')}`);
  const relevant=failed.filter(x=>!x.includes('ERR_ABORTED'));if(relevant.length)throw new Error(`${name}: browser request failures ${relevant.join(' | ')}`);
  await context.close();
 }
 console.log('OMEGA R241 BROWSER PASS · desktop/mobile Home→Visual Instrument→DEEP COMPILER · living topology canvas rendered with varied field geometry · pointer authority none · no mutating requests · packet/measurement/Canon truth boundaries exposed · no page errors');
}finally{await browser.close()}

await import('./r301-html-svg-capability-recovery-browser-e2e.mjs');
