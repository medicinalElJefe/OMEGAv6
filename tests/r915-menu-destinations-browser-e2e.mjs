import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const expected=['Command Center','Hybrid Link','Workspace','Cockpit','Immersive Traversal','Matter Traversal','Extreme Traversal','Visual Instrument','Relativity','Earth Now','Forecast','Atlas','Traversal','Create','Field','Data Motion','Reality Lab','Atlas Calculator','Infinity','Convergence','Quality Compiler','Build Out','Projects','Render Queue','Assets','Modes','Kernel Intelligence','Evidence & Proof','Memory','Archive Census','Archive Operators','Development','Canon Evolution','SAI Lab','Governance','Consolidation','Instructions','Plugins','Settings','System','Validation','System Atlas','Scale Compiler','Control Matrix'];
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?omega7=1&r915='+Date.now(),{waitUntil:'domcontentloaded'});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  const domains=['HOME','WORK','EXPLORE','CREATE','DEVELOP','SYSTEM'];const seen=new Set();
  for(const domain of domains){
   const primary=page.locator('.o7-nav-r519 button[aria-label]');
   const labels={HOME:'Home',WORK:'Work',EXPLORE:'Explore',CREATE:'Create',DEVELOP:'Build',SYSTEM:'System'};
   await primary.getByRole('button',{name:labels[domain],exact:true}).click();
   const links=page.locator('[data-r912-menu-route]');
   const count=await links.count();if(!count)throw Error(label+': empty domain '+domain);
   for(let i=0;i<count;i++){
    const route=await links.nth(i).getAttribute('data-r912-menu-route');
    if(!route||!expected.includes(route))throw Error(label+': unknown menu route '+route);
    seen.add(route);
   }
  }
  for(const route of expected){
   // The global HOME directory must expose every registered destination.
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Home',exact:true}).click();
   const link=page.locator('[data-r912-menu-route]').filter({has:page.locator('span')}).locator('xpath=..');
   const destination=page.locator('[data-r912-menu-route]').filter({hasText:route});
   const exact=page.locator('[data-r912-menu-route="'+route+'"]');
   if(await exact.count()!==1)throw Error(label+': missing or duplicated '+route);
   await exact.click();
   await page.waitForTimeout(120);
   const selected=await page.locator('.o7-main').getAttribute('data-native-route');
   if(selected!==route)throw Error(label+': '+route+' did not select its native workspace: '+selected);
   if(await page.locator('.o7-native-failure').count())throw Error(label+': '+route+' native error boundary');
  }
  if(expected.some(route=>!seen.has(route)))throw Error(label+': missing menu registry destinations '+expected.filter(x=>!seen.has(x)).join(','));
  if(errors.length)throw Error(label+': uncaught page errors '+errors.join(' | '));
  console.log('R915 '+label+': '+expected.length+' menu destinations selected; domain inventory complete');
  await page.close();
 }
}finally{await browser.close();}
