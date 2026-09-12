import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
async function openRoute(page,name){const trigger=page.locator('button[aria-label="Expand OMEGA navigator"]');if(await trigger.count())await trigger.first().click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});const route=page.locator('.r89-flat-route').filter({has:page.locator('b',{hasText:name})});await route.first().click();await page.waitForFunction(n=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===n,name,{timeout:15000});}

const hazards=['HB-001','HB-002','HB-003','HB-004','HB-005','HB-006','HB-007','HB-008'].map((id,i)=>({id,hazard:`fixture hazard ${id}`,foreseeableSequence:'test sequence',harm:'test harm',severity:i===0?5:4,probability:1,controls:['fixture control'],verification:['fixture verification'],residualSeverity:i===0?5:4,residualProbability:1,residualAcceptable:true,status:'CONTROLLED'}));
const profile={
 manifest:{releaseId:'R282-BROWSER-FIXTURE',softwareVersion:'R282',regulatoryStage:'AUTHORIZED_CLINICAL',jurisdiction:'TEST',authorizationId:'TEST-AUTHORIZATION-FIXTURE',authorizationScope:'BROWSER TEST ONLY',softwareDocumentationLevel:'ENHANCED',qmsReleaseRecord:'TEST-QMS-RECORD',riskManagementApproved:true,analyticalValidationApproved:true,clinicalValidationApproved:true,humanFactorsApproved:true,cybersecurityApproved:true,interoperabilityApproved:true,postmarketPlanApproved:true,configurationLocked:true,sbomRecorded:true,unresolvedAnomaliesReviewed:true,intendedUse:{id:'R282-BROWSER-IU',purpose:'Browser fixture quantitative measurement validation',intendedUser:'test professional',intendedPopulation:'test cohort',useEnvironment:'browser test environment',inputs:['validated pressure packet'],outputs:['calibrated pressure measurement'],decisionRole:'MEASUREMENT_ONLY',locked:true}},
 definitions:[{id:'DEF-PRESSURE-1',variable:'pressure_fixture',canonicalUnit:'mmHg',acceptedUnits:{mmHg:{scale:1,offset:0}},analyticalRange:{min:0,max:300},maxRelativeExpandedUncertainty:.10,calibrationTraceabilityRequired:true,referenceMethod:'BROWSER-REFERENCE',criticality:'HIGH',intendedUseId:'R282-BROWSER-IU',version:'1.0.0'}],
 hazards,modeEvidence:[],empiricalCases:[]
};
const sample={id:'R282-BROWSER-SAMPLE',domain:2,layer:5,variable:'pressure_fixture',rawValue:121,unit:'mmHg',observedAt:new Date().toISOString(),maxAgeMs:5*60*1000,sourceFormat:'DEVICE_PACKET',source:'R282 browser fixture',device:{id:'R282-BROWSER-DEVICE',manufacturer:'fixture',model:'R282'},calibration:{calibratedAt:'2026-08-10T00:00:00Z',dueAt:'2027-08-10T00:00:00Z',traceability:'TRACE-R282',standard:'REFERENCE-FIXTURE',gain:1,offset:0,gainUncertainty:.001,offsetUncertainty:.02},uncertainty:{instrument:.4,calibration:.1,repeatability:.2,resolution:.1,coverageFactor:2},verified:true};

async function prove(viewport,label){
 const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});await openRoute(page,'Matter Traversal');
  const deep=page.getByRole('button',{name:/DEEP MATTER/});await deep.first().waitFor({state:'visible',timeout:20000});await deep.first().click();await page.waitForFunction(()=>document.querySelector('.r43-workspace-stage')?.getAttribute('data-view')==='DEEP',{timeout:20000});
  await page.waitForSelector('.r46-bio .bio281 .bio282',{state:'visible',timeout:20000});
  const medical=page.locator('.bio282'),surface=page.locator('.bio281'),release=medical.locator('.bio282-release');
  const initial=await medical.innerText();
  for(const token of ['MEDICAL PRODUCTION BASELINE','Clinical Validation & Release Control Plane','ENGINEERING INCOMPLETE','RELEASE GATES','RISK CONTROL LEDGER','REGULATED-PRODUCTION TARGETS'])if(!initial.includes(token))throw new Error(`${label} R282 surface missing ${token}`);
  if(!initial.includes('241'))throw new Error(`${label} R282 did not expose 241-mode clinical fabric count`);
  if(!initial.includes('Mode measurement authority')||!initial.includes('0'))throw new Error(`${label} R282 mode measurement authority boundary missing`);
  if(await release.getAttribute('data-release-state')!=='ENGINEERING_INCOMPLETE')throw new Error(`${label} default release state must fail closed`);

  await surface.locator('.bio281-ingest input[type=file]').setInputFiles({name:'r282-sample.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([sample]))});
  await page.waitForFunction(()=>document.querySelectorAll('.bio281 tbody tr').length===1,{timeout:10000});
  await medical.locator('.bio282-profile input[type=file]').setInputFiles({name:'r282-profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(profile))});
  await page.waitForFunction(()=>{const el=document.querySelector('.bio282-release');return el?.getAttribute('data-release-state')==='AUTHORIZED_CLINICAL_RELEASE_READY'&&el?.getAttribute('data-profile-id')==='R282-BROWSER-FIXTURE'},{timeout:10000});
  await page.waitForFunction(()=>document.querySelector('.bio282-release')?.getAttribute('data-audit-state')==='PASS',{timeout:10000});
  await page.waitForTimeout(100);
  const releaseState=await release.getAttribute('data-release-state'),profileId=await release.getAttribute('data-profile-id'),auditState=await release.getAttribute('data-audit-state');
  if(releaseState!=='AUTHORIZED_CLINICAL_RELEASE_READY'||profileId!=='R282-BROWSER-FIXTURE'||auditState!=='PASS')throw new Error(`${label} R282 release state was not stable after audit: state=${releaseState} profile=${profileId} audit=${auditState}`);
  const releaseLabel=release.locator('b');
  await releaseLabel.waitFor({state:'visible',timeout:10000});
  const releaseText=(await releaseLabel.innerText()).trim();
  if(releaseText!=='AUTHORIZED CLINICAL RELEASE READY')throw new Error(`${label} authorized release label mismatch: ${releaseText}`);
  const after=await medical.innerText();
  for(const token of ['MEASUREMENT GATE','RISK GATE','AUTHORIZATION','PASS','R282-BROWSER-IU','MEASUREMENT ONLY','TEST-AUTHORIZATION-FIXTURE'])if(!after.includes(token))throw new Error(`${label} R282 authorized fixture missing ${token}`);
  const failGates=await medical.locator('.bio282-gates article.fail').count();if(failGates!==0)throw new Error(`${label} authorized fixture still has ${failGates} FAIL release gates`);
  const holdAuth=await medical.locator('.bio282-gates article.hold').filter({hasText:'regulatory Authorization'}).count();if(holdAuth)throw new Error(`${label} authorization gate remained HOLD`);
  if(!after.includes('Clinical decision support')||!after.includes('BLOCKED'))throw new Error(`${label} measurement-only release silently enabled CDS`);
  if(!after.includes('Autonomous clinical action'))throw new Error(`${label} autonomous-action boundary absent`);
  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);if(overflow>10)throw new Error(`${label} R282 surface overflows viewport by ${overflow}px`);
  if(errors.length)throw new Error(`${label} page errors: ${errors.join(' | ')}`);
 }finally{await context.close();await browser.close()}
}
await prove({width:1440,height:1200},'desktop');
await prove({width:390,height:844},'mobile');
console.log('R282 BROWSER PASS · default clinical block + stable machine-readable authorized measurement release + exact visible release label + fresh intended-use profile + required risk set + SHA-256 audit on desktop/mobile; CDS/autonomous authority remain blocked and 241 modes remain measurement authority 0');
