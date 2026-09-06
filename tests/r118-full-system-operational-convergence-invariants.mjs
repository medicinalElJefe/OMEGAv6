import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R118 ${msg}`)};

const app=read('src/App.tsx');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const navigator=read('src/OmegaSideNavigatorR88.tsx');
const loader=read('src/specialistLoaderR109.tsx');
const suite=read('src/OmegaSpecialistSuite.tsx');
const hybridRoute=read('src/HybridLinkR32.tsx');
const realityLab=read('src/AppliedRealityLab.tsx');
const worker117=read('src/workerR117.js');
const worker116=read('src/workerR116.js');
const hybrid=read('src/SovereignConnectionR117.tsx');
const bootstrap=read('src/hybridBootstrapR117.ts');
const launcher=read('src/sovereignLauncherR117.ts');
const adapter=read('src/platformAdapter.ts');
const wrangler=read('wrangler.jsonc');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical route registry must contain 44 unique current destinations');
for(const route of surfaces)must(navigator.includes('OMEGA_ALL_ROUTES_R82')||workstation.includes(route),`route registry authority missing ${route}`);
must(workstation.includes('SPECIALIST_EXISTING')&&workstation.includes('SPECIALIST_SUITE'),'workstation must preserve explicit specialist/suite ownership');
must(loader.includes('specialistLoadersForPanelR109')&&loader.includes('SUITE_ROUTES'),'route-deferred specialist loader registry missing');
must(suite.includes("panel==='Field'")&&suite.includes("panel==='Evidence & Proof'")&&suite.includes("panel==='Projects'")&&suite.includes("panel==='System'"),'specialist suite must retain concrete functional owners rather than one generic placeholder');
must(!workstation.includes('REGISTERED · NO ACTIVE UTILITY IMPLEMENTATION'),'workstation may not expose the legacy non-operational placeholder');

must(app.includes("lazy(()=>import('./OmegaWorkstationFullV2'))")&&app.includes('omega-home-request'),'home/workstation transition authority must remain wired');
must(navigator.includes("rows.map(route=>")&&navigator.includes("onClick={()=>go(route)}"),'all destination buttons must share one deterministic navigation handler');
must(navigator.includes("aria-current={currentPanel===route?'page':undefined}"),'active route must remain exposed accessibly');

// Reality Lab must have a real empty state. It may not crash while trying to parse a fabricated/header-only seed merely to look populated.
must(realityLab.includes("const emptyDataset=():ParsedDataset=>({headers:[],rows:[],delimiter:','})"),'Reality Lab requires an explicit zero-observation empty dataset');
must(realityLab.includes('useState<ParsedDataset>(emptyDataset)'),'Reality Lab must boot from the explicit empty dataset without invoking the CSV parser');
must(!/useState<ParsedDataset>\(\(\)=>parseDelimited\(/.test(realityLab),'Reality Lab may not parse a header-only or synthetic seed during first render');
must(realityLab.includes('No synthetic dataset is inserted to make the surface look active.'),'Reality Lab empty-state truth boundary missing');
must(realityLab.includes("label='REALITY LAB · CANONICAL REFERENCE · NO OBSERVATION LOADED'")&&realityLab.includes('Current canonical model reference only · no observation loaded'),'Reality Lab must remain visual-first by rendering the current canonical model state while explicitly separating it from measurement');
must(realityLab.includes("<CalculusFieldR37 address={canonicalAddress} mode='FIELD' steps={18}"),'Reality Lab zero-observation reference must be source-backed by the current canonical address, not fabricated observations');

// The actual registered Hybrid destination must point at the current R117 human connection surface.
must(loader.includes("HybridLinkR117:()=>import('./HybridLinkR32')"),'current deferred HybridLinkR117 loader missing');
must(loader.includes('HybridMissionControlR109=lazy(LOADERS.HybridLinkR117)'),'registered Hybrid mount must resolve to current R117 surface rather than old R8 wrapper');
must(loader.includes("'Hybrid Link':[LOADERS.HybridLinkR117]"),'route-demand prefetch must resolve the same R117 Hybrid surface');
must(loader.includes("HybridMissionControlR8:()=>import('./HybridMissionControlR8')")&&loader.includes('HybridMissionControlR8:LOADERS.HybridMissionControlR8'),'R8 mission donor must stay recoverable as an advanced layer');
must(hybridRoute.includes("import SovereignConnectionR117 from './SovereignConnectionR117'")&&hybridRoute.includes('<SovereignConnectionR117/>'),'current Hybrid route must put R117 connection authority first');
must(hybridRoute.includes("<details className='r112-hybrid-deep'")&&hybridRoute.includes('onToggle={e=>setDeepOpen')&&hybridRoute.includes('{deepOpen&&<HybridMissionControlR8'),'old mission/federation controls must remain progressively disclosed and unmounted until explicitly opened');

// R117 intentionally repairs connector issuance on the already-proven R116 runtime spine.
must(wrangler.includes('"main": "src/workerR116.js"'),'Cloudflare must execute the proven R116 runtime spine');
must(worker116.includes("from './workerR115.js'")&&worker116.includes("const CONNECTOR_REVISION='R117'"),'deployed R116 spine must retain R115 lineage and promote the R117 connector revision');
must(worker116.includes("path==='/api/hybrid/bootstrap'")&&worker116.includes('OMEGA_SOVEREIGN_BOOTSTRAP_R117'),'deployed runtime must expose the fresh server-backed R117 Hybrid bootstrap');
must(worker116.includes('bootstrapOriginAllowedR117')&&worker116.includes("omegav6.jeffdeweyeljefe.workers.dev"),'fresh pairing must be origin-bounded to canonical OMEGAv6');
must(worker117.includes("from './workerR116.js'"),'standalone R117 wrapper must remain an additive compatibility successor rather than a fork');

// Clean bootstrap is deliberately a dedicated fetch path so stale bridge headers from the general adapter cannot poison credential rotation.
must(bootstrap.includes("fetch('/api/hybrid/bootstrap'")&&bootstrap.includes("'x-omega-session-id':runtimeSessionId()"),'dedicated browser bootstrap must call the server endpoint with session identity');
must(bootstrap.includes("credentials:'same-origin'")&&bootstrap.includes("cache:'no-store'"),'fresh bootstrap must remain same-origin and non-cached');
must(bootstrap.includes('saveHybridBridge({bridgeId:payload.bridgeId,secret:payload.secret,pairingCode:payload.pairingCode})'),'fresh server credential must become the exact current browser bridge only after successful response');
must(adapter.includes('saveHybridBridge')&&adapter.includes('getHybridBridge'),'shared bridge storage adapter must remain available to the dedicated bootstrap transport');
must(hybrid.includes('bootstrapSovereignR117')&&hybrid.includes('DOWNLOAD CLEAN R117 CONNECTOR'),'ordinary Hybrid surface must expose fresh credential rotation plus explicit download');
must(!hybrid.includes("document.createElement('a')")&&!hybrid.includes('.click()'),'R117 connection UI must not use a synthetic async download click');

// The retired host is intentionally printed as a warning; it must never be assigned as OMEGA_ORIGIN or used by curl/Invoke-WebRequest.
must(launcher.includes("const ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev'"),'R117 launcher canonical origin constant missing');
must(launcher.includes('This connector will never call the retired preview host.')&&launcher.includes('No fallback host was attempted.'),'launcher must explicitly prohibit fallback execution');
must(!launcher.includes('set "OMEGA_ORIGIN=https://omega-sovereign-convergence.foundasound.chatgpt.site')&&!launcher.includes('curl.exe --fail --silent --show-error --location --max-time 20 "https://omega-sovereign-convergence.foundasound.chatgpt.site'),'retired host must never be executable launcher target');
must(worker116.includes('nativeExecutionClaimed:false')||worker116.includes('nativeExecutionClaimed: false'),'fresh pairing must never claim PC ONLINE before a real host heartbeat');

console.log('R118 FULL SYSTEM STATIC PASS · 44 route authority · concrete specialist ownership · Reality Lab true empty state + canonical no-observation visual · ordinary Hybrid route promoted to R117 clean surface · advanced R8 diagnostics unmounted until opened · proven R116 runtime spine + R117 connector repair · dedicated stale-header-safe bootstrap · explicit browser-safe connector download');
