import {chromium} from 'playwright';

// R517: browser-observed address turns, not physical rotations or full-state inversion.
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
const initialAddress=12345;
const encode=({d,p,r,l})=>1728*d+144*p+12*r+l;
const decode=a=>({d:Math.floor(a/1728),p:Math.floor(a%1728/144),r:Math.floor(a%144/12),l:a%12});
const turn=(a,direction)=>{const c=decode(a);return encode({...c,p:(c.p+(direction==='011'?3:9))%12})};
if(expectedSha){
 const response=await fetch(`${base}/omega-build-receipt.json?r517=${Date.now()}`,{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw new Error(`R517 promoted receipt HTTP ${response.status}`);
 const receipt=await response.json();
 if(receipt.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt.source?.sha!==expectedSha||receipt.promotion?.promotedMergeSha!==expectedSha||receipt.promotion?.authority!=='GITHUB_MERGE_PARENTS')throw new Error('R517 exact promoted SHA / two-parent authority mismatch');
}
async function check(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1});
 await context.addInitScript(a=>localStorage.setItem('omega.v6.address',String(a)),initialAddress);
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(`${base}/?omega7=1&r517=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.locator('.o7-search-trigger').click();
  await page.locator('.o7-command input').fill('Traversal');
  await page.locator('[data-command-route="Traversal"]').click();
  await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Traversal',{timeout:20000});
  await page.locator('.r99-traversal-studio').waitFor({state:'visible',timeout:30000});
  const donor=page.locator('details.r99-donor-layer');
  await donor.locator('summary').click();
  const traversal=donor.locator('.calculus-traversal');
  await traversal.waitFor({state:'visible',timeout:20000});
  const truth=traversal.locator('.calculus-truth');
  let address=initialAddress;
  async function prove(stage){
   await page.waitForFunction(expected=>document.querySelector('details.r99-donor-layer .calculus-truth')?.getAttribute('data-r513-address')===String(expected),address,{timeout:10000});
   const observed=Number(await truth.getAttribute('data-r513-address'));
   const canonical=Number(await truth.getAttribute('data-r513-canonical'));
   const phase=Number(await truth.getAttribute('data-r513-phase'));
   if(observed!==address||canonical!==initialAddress||phase!==decode(address).p)throw new Error(`${label} ${stage}: actual component address/canonical/phase drift ${observed}/${canonical}/${phase}`);
   if(!(await truth.innerText()).includes(`PHASE ${phase+1}/12`))throw new Error(`${label} ${stage}: visible phase HUD did not update`);
   if(Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')))!==initialAddress)throw new Error(`${label} ${stage}: uncommitted turn mutated canonical state`);
  }
  await prove('initial');
  const plus=traversal.locator('button[title="Construct: exact +90 degree canonical phase-address turn"]');
  const minus=traversal.locator('button[title="Prune: exact -90 degree canonical phase-address turn"]');
  if(!(await plus.isVisible())||!(await minus.isVisible()))throw new Error(`${label}: both phase controls must be usable`);
  await plus.click();address=turn(address,'011');await prove('011');
  await minus.click();address=turn(address,'01-1');await prove('inverse');
  for(let i=0;i<4;i++){await plus.click();address=turn(address,'011');await prove(`four-cycle-${i+1}`)}
  if(address!==initialAddress)throw new Error(`${label}: four 011 turns did not return to initial address`);
  await minus.click();address=turn(address,'01-1');await prove('01-1');
  await plus.click();address=turn(address,'011');await prove('reverse inverse');
  const canvas=traversal.locator('.calculus-stage canvas');
  await canvas.waitFor({state:'visible',timeout:10000});
  const visual=await canvas.evaluate(c=>({width:c.getBoundingClientRect().width,height:c.getBoundingClientRect().height,painted:(()=>{const ctx=c.getContext('2d');if(!ctx)return false;const data=ctx.getImageData(0,0,c.width,c.height).data;for(let i=0;i<data.length;i+=1600)if(data[i]>10||data[i+1]>10||data[i+2]>10)return true;return false})()}));
  if(visual.width<200||visual.height<100||!visual.painted)throw new Error(`${label}: phase instrument canvas not materially painted ${JSON.stringify(visual)}`);
  if(errors.length)throw new Error(`${label}: unhandled browser errors ${errors.join(' | ').slice(0,1200)}`);
  console.log(`R517 ${label} phase browser PASS · 011 / 01-1 actuated · exact address / visible phase · inverse + four-cycle · canonical unchanged before Commit · canvas painted`);
 }finally{await context.close()}
}
const browser=await chromium.launch({headless:true});
try{
 await check(browser,'desktop',{width:1440,height:960});
 await check(browser,'mobile',{width:390,height:844});
 console.log(`R517 SOURCE-RELATIVE PHASE BROWSER PASS · ${expectedSha?'exact promoted '+expectedSha:'candidate local build'} · address geometry only · no inferred physical or full-state reversibility`);
}finally{await browser.close()}
