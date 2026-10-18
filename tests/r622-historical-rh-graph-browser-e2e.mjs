import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=process.env.OMEGA_EXPECTED_SHA?.trim()||'';
if(expectedSha){
 if(!/^[a-f0-9]{40}$/.test(expectedSha))throw Error('R622 expected SHA must be 40 lowercase hex chars');
 const response=await fetch(base+'/omega-build-receipt.json?r622='+Date.now(),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('R622 production receipt HTTP '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)
  throw Error('R622 exact deployed SHA not proven');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?omega7=1&r622='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.locator('.o7-nav-r519').getByRole('button',{name:'Create'}).click();
  await page.locator('.o7-r519-portal[data-r519-visual-navigation="CREATE"] button[data-r519-direct="Visual Instrument"]').click();
  const workspace=page.locator('[data-omega7-native="forecast.visual"][data-route="Visual Instrument"]');
  await workspace.waitFor({state:'visible',timeout:30000});
  const entry=workspace.locator('[data-r621-historical-rh-entry="true"]');
  await entry.getByRole('button',{name:'Open Historical RH Graph'}).click();
  const instrument=workspace.locator('[data-r621-historical-rh-graph="true"]');
  await instrument.waitFor({state:'visible',timeout:10000});
  if(!(await instrument.innerText()).includes('complete historical graph is not deployed'))throw Error(label+': source-completeness disclosure missing');
  // Exercise actual canonical address propagation through the same handler used by the rest of OMEGA.
  const setAddress=async(value)=>{
   await page.evaluate(n=>{
    localStorage.setItem('omega.v6.address',String(n));
    window.dispatchEvent(new CustomEvent('omega7-address-changed',{detail:{address:n}}));
   },value);
   await page.waitForFunction(n=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')===String(n),value,{timeout:10000});
  };
  for(const [source,target,id] of [[5990,16472,'E00001'],[18086,7832,'E00002']]){
   await setAddress(source);
   const edge=instrument.locator('[data-r621-edge="'+id+'"]');
   await edge.waitFor({state:'visible',timeout:10000});
   const description=await edge.innerText();
   if(!description.includes('antipode_state')||!description.includes('weight 0.2')||!description.includes(String(target)))
    throw Error(label+': '+id+' historical source fields mismatch');
   await edge.getByRole('button',{name:'Traverse '+id+' to address '+target}).click();
   await page.waitForFunction(n=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')===String(n),target,{timeout:10000});
   const persisted=await page.evaluate(()=>localStorage.getItem('omega.v6.address'));
   if(persisted!==String(target))throw Error(label+': '+id+' target not persisted');
   await instrument.locator('[data-r621-empty="true"]').waitFor({state:'visible',timeout:10000});
  }
  await entry.getByRole('button',{name:'Close Historical RH Graph'}).click();
  if(await instrument.count())throw Error(label+': close did not unmount instrument');
  if(errors.length)throw Error(label+': page errors: '+errors.join(' | '));
  await page.close();
 }
 console.log('R622 HISTORICAL RH GRAPH BROWSER PASS · desktop/mobile · E00001/E00002 exact address traversal and persistence');
}finally{await browser.close()}
