import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
async function openValidation(page){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');if(await expand.count())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:12000});
 const clicked=await page.evaluate(()=>{const button=[...document.querySelectorAll('.r89-flat-route')].find(x=>x.querySelector('b')?.textContent?.trim()==='Validation');if(!button)return false;button.click();return true});
 if(!clicked)throw new Error('Validation route button missing');
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Validation',{timeout:20000});
 await page.waitForSelector('.r145-compute',{timeout:20000});
}
async function exercise(page,name){
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForSelector('main.r71-home, .omega-workstation-v2',{timeout:30000});await openValidation(page);
 const inputs=page.locator('.r145-controls input');if(await inputs.count()<8)throw new Error(`${name}: R145 controls incomplete`);
 await inputs.nth(0).fill('24');await inputs.nth(3).fill('3');await inputs.nth(4).fill('0.08');await inputs.nth(5).fill('4');
 await page.getByRole('button',{name:/Run 24-candidate sweep/}).click();
 await page.waitForFunction(()=>{const x=document.querySelector('.r145-compute');return x&&x.getAttribute('data-transport')!=='NOT_RUN'&&document.querySelectorAll('.r145-table-wrap tbody tr').length>0},{timeout:30000});
 const state=await page.evaluate(()=>{const root=document.querySelector('.r145-compute'),score=[...document.querySelectorAll('.r145-summary > div')].map(x=>({label:x.querySelector('span')?.textContent?.trim(),value:x.querySelector('b')?.textContent?.trim()})),rows=document.querySelectorAll('.r145-table-wrap tbody tr').length,text=root?.textContent||'',overflow=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth;return{transport:root?.getAttribute('data-transport'),score,rows,text,overflow}});
 if(!['LOCAL_BROWSER_SAME_KERNEL','CLOUDFLARE_MACHINE_R145'].includes(state.transport||''))throw new Error(`${name}: unexpected transport ${state.transport}`);
 if(state.score.find(x=>x.label==='Candidates')?.value!=='24')throw new Error(`${name}: computation did not return 24 candidates · ${JSON.stringify(state.score)}`);
 if(state.rows<1)throw new Error(`${name}: ranked result table empty`);
 if(!/Physics screen/.test(state.text)||!/Robustness ensemble/.test(state.text)||!/Adaptive fidelity/.test(state.text)||!/R145 receipt → R142 execution receipt → R144 deployment attestation → R125 admission/.test(state.text))throw new Error(`${name}: computation/proof chain not visible`);
 if(/RCWA VERIFIED/.test(state.text))throw new Error(`${name}: UI inflated queue readiness into RCWA verification`);
 if(state.overflow>8)throw new Error(`${name}: horizontal overflow ${state.overflow}px`);
 console.log(`R145 BROWSER ${name} PASS · ${state.transport} · rows ${state.rows}`);
}
const browser=await chromium.launch({headless:true});
try{let c=await browser.newContext({viewport:{width:1440,height:960}}),p=await c.newPage();await exercise(p,'desktop');await c.close();c=await browser.newContext({viewport:{width:390,height:844}});p=await c.newPage();await exercise(p,'mobile');await c.close();console.log('R145 BROWSER COMPUTATION PASS · Validation advanced compute executes on desktop/mobile without truth inflation')}finally{await browser.close()}
