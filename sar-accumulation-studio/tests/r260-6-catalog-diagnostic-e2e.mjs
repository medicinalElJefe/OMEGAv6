import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1649,height:927},deviceScaleFactor:1});
  const responses=[],failures=[],pageErrors=[];
  page.on('response',r=>{if(/\/api\/(?:stac|source|raster)/.test(r.url()))responses.push({url:r.url(),status:r.status()});});
  page.on('requestfailed',r=>{if(/\/api\/(?:stac|source|raster)/.test(r.url()))failures.push({url:r.url(),failure:r.failure()?.errorText||'unknown'});});
  page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCATION?.jump&&globalThis.OMEGA_SAR_INTERACTION&&globalThis.OMEGA_SAR_R4_RUNTIME,null,{timeout:30000});
  await page.evaluate(()=>globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'}));
  const start=Date.now();let snapshot=null;
  while(Date.now()-start<100000){
    snapshot=await page.evaluate(()=>({
      obs:Number(document.querySelector('#obsCount')?.textContent||0),
      statusKind:document.querySelector('#status')?.dataset?.kind||'',
      statusText:(document.querySelector('#status')?.textContent||'').trim(),
      scene:(document.querySelector('#currentScene')?.textContent||'').trim(),
      frameMax:document.querySelector('#timeline')?.max||null,
      interaction:globalThis.OMEGA_SAR_INTERACTION?{activating:globalThis.OMEGA_SAR_INTERACTION.activating,activation:globalThis.OMEGA_SAR_INTERACTION.activation,targetKey:globalThis.OMEGA_SAR_INTERACTION.targetKey,lastStage:globalThis.OMEGA_SAR_INTERACTION.lastStage,sourceSequence:globalThis.OMEGA_SAR_INTERACTION.sourceSequence,lastSourceScene:globalThis.OMEGA_SAR_INTERACTION.lastSourceScene}:null,
      nav:globalThis.OMEGA_SAR_NAVIGATION?{target:globalThis.OMEGA_SAR_NAVIGATION.target,view:globalThis.OMEGA_SAR_NAVIGATION.view}:null,
      hud:{title:document.querySelector('#omegaActionHud b')?.textContent||'',detail:document.querySelector('#omegaActionHud span')?.textContent||'',phase:document.querySelector('#omegaActionHud')?.dataset?.phase||''}
    }));
    if(snapshot.obs>0&&snapshot.interaction?.activating===false)break;
    await page.waitForTimeout(500);
  }
  console.log('SAR_R2606_CATALOG_DIAGNOSIS',JSON.stringify({elapsedMs:Date.now()-start,snapshot,responses,failures,pageErrors},null,2));
  assert.ok(snapshot?.obs>0,'target activation produced no catalog observations');
  assert.equal(snapshot?.interaction?.activating,false,'target activation did not settle');
  assert.deepEqual(pageErrors,[],'page errors occurred');
}finally{await browser.close();}
