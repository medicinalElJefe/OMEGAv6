import {chromium} from 'playwright';

const base=String(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('R496 local candidate proof requires exact OMEGA_EXPECTED_SHA');

const receiptResponse=await fetch(`${base}/omega-build-receipt.json?r496=${Date.now()}`,{headers:{'cache-control':'no-cache','pragma':'no-cache'}});
const receiptRaw=await receiptResponse.text();
if(!receiptResponse.ok)throw new Error(`R496 local build receipt HTTP ${receiptResponse.status}: ${receiptRaw.slice(0,300)}`);
const receipt=JSON.parse(receiptRaw);
if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1')throw new Error(`R496 local receipt schema mismatch ${receipt?.schema}`);
if(receipt?.source?.sha!==expected)throw new Error(`R496 local source SHA mismatch ${receipt?.source?.sha} != ${expected}`);
if(receipt?.promotion?.promotedMergeSha!==expected)throw new Error(`R496 local promoted SHA mismatch ${receipt?.promotion?.promotedMergeSha} != ${expected}`);
if(receipt?.promotion?.authority!=='GITHUB_MERGE_PARENTS')throw new Error(`R496 local receipt authority mismatch ${receipt?.promotion?.authority}`);

const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  await page.goto(`${base}/?r496=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  const truth=page.locator('.o7-operational-truth[data-r495-operational-truth="true"]');
  await truth.waitFor({state:'visible',timeout:20000});
  await page.waitForFunction(()=>{
   const el=document.querySelector('.o7-operational-truth[data-r495-operational-truth="true"]');
   return Boolean(el&&['ready','partial'].includes(el.getAttribute('data-r495-state')||''));
  },{timeout:20000});
  const text=(await truth.innerText()).toLowerCase();
  for(const token of ['live operational truth','what is actually running right now','production','source','worker','device'])if(!text.includes(token))throw new Error(`${label}: R496 exact packaged OMEGA7 Home missing ${token}`);
  const refresh=truth.getByRole('button',{name:'Refresh',exact:true});
  await refresh.click();
  await page.waitForFunction(()=>{
   const button=[...document.querySelectorAll('.o7-operational-truth button')].find(x=>x.textContent?.trim()==='Refresh');
   return Boolean(button&&!button.hasAttribute('disabled'));
  },{timeout:20000});
  const geometry=await page.evaluate(()=>({
   overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
   panelWidth:document.querySelector('.o7-operational-truth')?.getBoundingClientRect().width||0
  }));
  if(geometry.overflow>8||geometry.panelWidth<240)throw new Error(`${label}: R496 operational truth geometry failed ${JSON.stringify(geometry)}`);
  if(pageErrors.length)throw new Error(`${label}: R496 packaged OMEGA7 page errors ${pageErrors.join(' | ').slice(0,1800)}`);
  await context.close();
 }
 console.log(`R496 LOCAL OMEGA7 CANDIDATE BROWSER PASS · exact packaged SHA ${expected} · desktop/mobile canonical OMEGA7 Home · R495 operational truth visible and refreshable · bounded READY/PARTIAL local source state · no page errors/overflow`);
}finally{
 await browser.close();
}
