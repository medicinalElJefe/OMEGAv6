import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const visual='.o7-app[data-omega7="true"] .o7-home-established[data-r510-visual-restoration="CURRENT_R71_CANONICAL_HOME"] main.r71-home[data-r510-embedded="true"]';
const delay=4500;
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1});
  const page=await context.newPage();let delayed=0;const failures=[];
  page.on('pageerror',e=>failures.push(String(e)));
  page.on('response',r=>{if(r.status()>=400&&/\/assets\/.+\.js/.test(r.url()))failures.push(r.status()+' '+r.url())});
  await page.route(/\/assets\/OmegaHomeR71-[^/]+\.js(?:\?.*)?$/,async route=>{
   delayed++;
   await new Promise(resolve=>setTimeout(resolve,delay));
   await route.continue();
  });
  try{
   await page.goto(base+'/?omega7=1&r524-delayed='+label,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:15000});
   await page.locator('.o7-home-established').waitFor({state:'attached',timeout:10000});
   await page.locator(visual).waitFor({state:'attached',timeout:25000});
   if(delayed!==1)throw new Error(label+': expected exactly one delayed R71 script load, got '+delayed);
   if(await page.locator('main.r71-home').evaluateAll(nodes=>nodes.filter(el=>!el.closest('.o7-app[data-omega7="true"]')).length))throw new Error(label+': standalone OMEGA6 fallback shown');
   if(!(await page.locator('.o7-operational-truth[data-r495-operational-truth="true"]').count()))throw new Error(label+': R495 truth missing');
   await page.locator('.o7-brand').click({timeout:8000});
   if(!(await page.locator(visual).count()))throw new Error(label+': R71 visual lost after real Home click');
   if(failures.length)throw new Error(label+': lazy asset/browser failure '+failures.join(' | ').slice(0,800));
   console.log('R524 '+label+' DELAYED VISUAL PASS · '+delay+'ms real OmegaHomeR71 asset delay · embedded home preserved · Home clickable · no fallback/errors');
  }finally{await context.close()}
 }
 console.log('R524 DELAYED MODULE CONTINUITY PASS · desktop/mobile must actually render historical R71, not just OMEGA7 shell');
}finally{await browser.close()}
