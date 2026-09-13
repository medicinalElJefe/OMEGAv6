import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const labels=[
  'Explain this state',
  'Build and repair until proven',
  'Inspect Drive workspace',
  'Work with visible ChatGPT',
  'Review evidence',
  'CONVERSE',
  'ENACT',
  'Matter',
  'Extreme',
  'Bridge details'
];

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1});
  const page=await context.newPage();
  await page.goto(`${base}/?r313-scroll-diagnostic=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('.omega-workstation-v2',{timeout:30000});

  if(!(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))){
    const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
    await expand.first().click({timeout:10000});
    await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
  }

  const routes=page.locator('.r89-flat-route');
  const count=await routes.count();
  let commandRoute=null;
  for(let i=0;i<count;i++){
    const route=routes.nth(i);
    const name=((await route.locator('b').first().textContent().catch(()=>''))||'').trim();
    if(name==='Command Center'){commandRoute=route;break}
  }
  if(!commandRoute)throw new Error('R313 diagnostic: Command Center route missing');
  await commandRoute.scrollIntoViewIfNeeded();
  await commandRoute.click({timeout:10000});
  await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Command Center',{timeout:20000});
  await page.waitForTimeout(250);

  const diagnostic=await page.evaluate(async labels=>{
    const rect=r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height});
    const nodeName=el=>el?`${el.tagName.toLowerCase()}${el.id?`#${el.id}`:''}${el.classList?.length?'.'+[...el.classList].slice(0,4).join('.'):''}`:'none';
    const info=el=>{
      if(!el)return null;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return{name:nodeName(el),rect:rect(r),scrollTop:el.scrollTop,scrollLeft:el.scrollLeft,scrollHeight:el.scrollHeight,scrollWidth:el.scrollWidth,clientHeight:el.clientHeight,clientWidth:el.clientWidth,position:s.position,display:s.display,overflow:s.overflow,overflowX:s.overflowX,overflowY:s.overflowY,transform:s.transform,contain:s.contain,clipPath:s.clipPath};
    };
    const findControl=needle=>[...document.querySelectorAll('.workstation-main button,.workstation-main [role="button"]')].find(el=>{
      const label=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').replace(/\s+/g,' ').trim();
      return label===needle||label.startsWith(needle);
    });
    const out={viewport:{innerWidth,innerHeight,scrollX,scrollY},scrollingElement:nodeName(document.scrollingElement),root:info(document.documentElement),body:info(document.body),shells:{workstation:info(document.querySelector('.omega-workstation-v2')),main:info(document.querySelector('.workstation-main')),surface:info(document.querySelector('.omega-surface-r81')),experience:info(document.querySelector('.command-experience-r4')),deck:info(document.querySelector('.command-deck')),stage:info(document.querySelector('.command-stage')),prompt:info(document.querySelector('.command-prompt')),visual:info(document.querySelector('.command-visual'))},controls:[]};
    for(const needle of labels){
      const el=findControl(needle);
      if(!el){out.controls.push({needle,missing:true});continue}
      const before=info(el);
      el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const after=info(el);
      const chain=[];
      let p=el;
      for(let i=0;p&&i<16;i++,p=p.parentElement)chain.push(info(p));
      const r=el.getBoundingClientRect();
      const x=Math.min(innerWidth-1,Math.max(1,(Math.max(r.left,1)+Math.min(r.right,innerWidth-1))/2));
      const y=Math.min(innerHeight-1,Math.max(1,(Math.max(r.top,1)+Math.min(r.bottom,innerHeight-1))/2));
      out.controls.push({needle,before,after,viewportAfter:{scrollX,scrollY},centerSample:{x,y,hit:nodeName(document.elementFromPoint(x,y))},chain});
    }
    return out;
  },labels);

  console.log(`R313 COMMAND CENTER SCROLL DIAGNOSTIC ${JSON.stringify(diagnostic)}`);
  await context.close();
}finally{
  await browser.close();
}
