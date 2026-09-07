import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const live=/^https:\/\//i.test(base);
const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];

async function openVisualInstrument(page){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count()&&await expand.first().isVisible())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000}).catch(()=>{});
 const opened=await page.evaluate(()=>{
  const buttons=[...document.querySelectorAll('.r89-flat-route')];
  const button=buttons.find(x=>x.querySelector('b')?.textContent?.trim()==='Visual Instrument');
  if(!button)return false;button.click();return true;
 });
 if(!opened)throw new Error('R191 Visual Instrument route control missing');
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Visual Instrument',{timeout:30000});
 await page.waitForSelector('.visual-instrument-app',{state:'visible',timeout:30000});
 await page.waitForSelector('.r182-motion-truth',{state:'visible',timeout:30000});
 await page.waitForSelector('.global-workbench-r188',{state:'visible',timeout:30000});
}

function assertNoViewportOverflow(result,name){
 if(result.overflow>8)throw new Error(`${name}: viewport overflow ${result.overflow}px`);
 if(result.workbench.width<240||result.workbench.height<80)throw new Error(`${name}: R188 workbench unusable ${JSON.stringify(result.workbench)}`);
 if(result.button.width<120||result.button.height<28)throw new Error(`${name}: Compile full field control unusable ${JSON.stringify(result.button)}`);
}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  const failed=[];page.on('requestfailed',r=>failed.push(`${r.method()} ${r.url()} :: ${r.failure()?.errorText||'failed'}`));
  await page.goto(`${base}/?r191=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  await openVisualInstrument(page);

  const compile=page.getByRole('button',{name:'Compile full field'});
  await compile.scrollIntoViewIfNeeded();
  await compile.waitFor({state:'visible',timeout:20000});
  if(await page.locator('.global-r188').count())throw new Error(`${name}: R188 full-field scan ran before explicit operator invocation`);
  const operatorLabel=await page.locator('.global-workbench-r188').innerText();
  if(!operatorLabel.includes('FULL-FIELD ANALYSIS · OPERATOR INVOKED · R190 ALIGNED'))throw new Error(`${name}: R190 operator-invoked boundary missing`);
  if(!operatorLabel.includes('The scan is never automatic'))throw new Error(`${name}: R188 non-automatic truth boundary missing`);

  const geometry=await page.evaluate(()=>{
   const rect=el=>{const r=el.getBoundingClientRect();return{width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
   const workbench=document.querySelector('.global-workbench-r188');
   const button=[...document.querySelectorAll('.global-workbench-r188 button')].find(x=>/Compile full field/.test(x.textContent||''));
   return{overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,workbench:rect(workbench),button:rect(button)};
  });
  assertNoViewportOverflow(geometry,name);

  if(name==='desktop'){
   const mutatingRequests=[];let scanStarted=false;
   page.on('request',r=>{if(scanStarted&&['POST','PUT','PATCH','DELETE'].includes(r.method()))mutatingRequests.push(`${r.method()} ${r.url()}`)});
   scanStarted=true;
   await compile.click();
   await page.locator('.global-r188').waitFor({state:'visible',timeout:120000});
   const atlasText=await page.locator('.global-r188').innerText();
   if(!atlasText.includes('20,736 actual states scanned'))throw new Error(`desktop: R188 did not prove the complete 20,736-state scan`);
   if(!atlasText.includes('GLOBAL INTERFERENCE ATLAS · R188'))throw new Error('desktop: R188 global atlas identity missing');
   const matrixCells=await page.locator('.global-r188-matrix > div > div').count();
   if(matrixCells!==144)throw new Error(`desktop: expected 144 D×P projection cells, received ${matrixCells}`);
   const resultButtons=await page.locator('.global-r188-columns button').count();
   if(resultButtons<2)throw new Error(`desktop: R188 returned no inspectable hotspot/basin states (${resultButtons})`);
   const recompile=page.getByRole('button',{name:'Recompile full field'});await recompile.waitFor({state:'visible',timeout:10000});
   if(mutatingRequests.length)throw new Error(`desktop: browser-local R188 scan emitted mutating network requests: ${mutatingRequests.join(' | ')}`);
  }

  if(pageErrors.length)throw new Error(`${name}: browser errors ${pageErrors.join(' | ').slice(0,2400)}`);
  const relevantFailures=failed.filter(x=>!x.includes('ERR_ABORTED'));
  if(relevantFailures.length)throw new Error(`${name}: browser request failures ${relevantFailures.join(' | ').slice(0,2400)}`);
  await context.close();
 }
 console.log(`R191 LIVE R190 BROWSER PASS · ${live?'deployed HTTPS runtime':'exact local build'} · desktop/mobile Visual Instrument rendered · R188 remained inert until explicit operator click · desktop completed all 20,736 states + 144 D×P cells · no mutating scan requests · no page errors`);
}finally{await browser.close()}
