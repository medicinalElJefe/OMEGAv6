import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync(new URL('../src/OmegaWorkstationFullV2.tsx',import.meta.url),'utf8');
const surfaceBlock=(source.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const routes=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
if(routes.length!==44)throw new Error(`R146 requires 44 preserved routes, found ${routes.length}`);

const waitApp=page=>page.waitForSelector('.r146-interface-convergence',{timeout:30000});
async function assertNoOverflow(page,label){const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth);if(overflow>8)throw new Error(`${label}: horizontal overflow ${overflow}px`)}
async function assertAccessibleNavButtons(page,label){const bad=await page.locator('.r146-interface-convergence button').evaluateAll(buttons=>buttons.filter(b=>{const aria=b.getAttribute('aria-label')?.trim(),text=(b.textContent||'').trim();return !aria&&!text}).map(b=>b.className));if(bad.length)throw new Error(`${label}: unlabeled navigator button(s) ${bad.join(', ')}`)}
async function expand(page){const button=page.locator('button[aria-label="Expand OMEGA navigator"]');if(await button.count())await button.first().click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000})}
async function closeWithEscape(page){await page.keyboard.press('Escape');await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='false',{timeout:8000})}

async function desktop(browser){
 const context=await browser.newContext({viewport:{width:1440,height:960}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await waitApp(page);await assertNoOverflow(page,'desktop boot');await assertAccessibleNavButtons(page,'desktop');
 await expand(page);
 const routeCount=await page.locator('.r89-flat-route').count();if(routeCount!==44)throw new Error(`desktop: navigator exposes ${routeCount}/44 routes`);
 const health=await page.locator('.r146-nav-health').innerText();if(!/R146 PRESERVED/i.test(health)||!/44 ROUTES/i.test(health))throw new Error(`desktop: R146 preservation health missing: ${health}`);
 const wide=page.locator('button[aria-label="Widen side toolbar to show full labels"]');if(await wide.count()){await wide.click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavWide==='true');const narrow=page.locator('button[aria-label="Narrow side toolbar"]');if(!await narrow.count())throw new Error('desktop: rail width toggle did not change accessible state')}
 await closeWithEscape(page);
 await page.keyboard.press('Control+K');await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true');
 const search=page.getByLabel('Search all registered OMEGA applications');await search.fill('Validation');await page.waitForTimeout(50);if(await page.locator('.r89-flat-route').count()!==1)throw new Error('desktop: route search did not narrow to one Validation destination');
 await page.getByRole('button',{name:'Open Validation'}).click();await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Validation',{timeout:15000});
 await expand(page);await page.getByRole('button',{name:'Browse software and capability map'}).click();if(!await page.locator('.r88-software-layer').count())throw new Error('desktop: Software map control failed');
 await page.getByRole('button',{name:'Browse everywhere'}).click();if(await page.locator('.r89-flat-route').count()!==44)throw new Error('desktop: Everywhere control did not restore all routes');
 const workspaceNames=['Command','Explore','Intelligence','Evidence','Build','System'];for(const name of workspaceNames){await page.getByRole('button',{name:`Show ${name} workspace`}).click();const count=await page.locator('.r89-flat-route').count();if(count<1)throw new Error(`desktop: ${name} workspace submenu is empty`)}
 await page.getByRole('button',{name:'Show all workspaces'}).click();await page.getByRole('button',{name:'Collapse navigator'}).click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='false');
 await assertNoOverflow(page,'desktop final');if(errors.length)throw new Error(`desktop page errors: ${errors.join(' | ')}`);await context.close();
}

async function mobile(browser){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await waitApp(page);await assertNoOverflow(page,'mobile boot');await assertAccessibleNavButtons(page,'mobile');
 await expand(page);const backdrop=page.getByRole('button',{name:'Close OMEGA navigator backdrop'});if(!await backdrop.count())throw new Error('mobile: touch backdrop missing');const box=await backdrop.boundingBox();if(!box||box.width<300||box.height<600)throw new Error(`mobile: backdrop is not a usable touch target ${JSON.stringify(box)}`);await backdrop.click({position:{x:box.width-10,y:box.height-10}});await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='false');
 await expand(page);await page.getByRole('button',{name:'Show Explore workspace'}).click();const exploreCount=await page.locator('.r89-flat-route').count();if(exploreCount!==16)throw new Error(`mobile: Explore submenu expected 16 routes, found ${exploreCount}`);
 const routeButtons=page.locator('.r89-flat-route');for(let i=0;i<Math.min(6,await routeButtons.count());i++){const r=await routeButtons.nth(i).boundingBox();if(!r||r.height<44)throw new Error(`mobile: route touch target ${i} is ${r?.height||0}px`)}
 await page.getByRole('button',{name:'Open Matter Traversal'}).click();await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Matter Traversal',{timeout:18000});
 await page.keyboard.press('Control+K');await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true');await page.getByLabel('Search all registered OMEGA applications').fill('Evidence & Proof');if(await page.locator('.r89-flat-route').count()!==1)throw new Error('mobile: search failed');await page.getByRole('button',{name:'Open Evidence & Proof'}).click();await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Evidence & Proof',{timeout:18000});
 await expand(page);await closeWithEscape(page);await assertNoOverflow(page,'mobile final');if(errors.length)throw new Error(`mobile page errors: ${errors.join(' | ')}`);await context.close();
}

const browser=await chromium.launch({headless:true});
try{await desktop(browser);await mobile(browser);console.log('R146 NAVIGATION CONTROLS PASS · 44-route exposure · desktop wide/compact rail · Everywhere/Software map · six workspace submenus · route search · explicit close · Escape · Ctrl/Cmd+K · mobile touch backdrop · 44px+ touch targets · no horizontal overflow · no browser exceptions')}finally{await browser.close()}
