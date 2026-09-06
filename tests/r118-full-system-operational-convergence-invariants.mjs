import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R118 ${msg}`)};

const app=read('src/App.tsx');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const navigator=read('src/OmegaSideNavigatorR88.tsx');
const loader=read('src/specialistLoaderR109.tsx');
const suite=read('src/OmegaSpecialistSuite.tsx');
const worker=read('src/workerR117.js');
const worker116=read('src/workerR116.js');
const hybrid=read('src/SovereignConnectionR117.tsx');
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

must(wrangler.includes('"main": "src/workerR117.js"'),'Cloudflare must execute the current R117 Worker wrapper');
must(worker.includes("from './workerR116.js'")&&worker116.includes("from './workerR115.js'"),'R117 must extend the accepted runtime chain instead of replacing it');
must(worker.includes("path==='/api/hybrid/bootstrap'")&&worker.includes('OMEGA_SOVEREIGN_BOOTSTRAP_R117'),'fresh server-backed Hybrid bootstrap endpoint missing');
must(adapter.includes('bootstrapHybridBridgeR117')&&adapter.includes("'/api/hybrid/bootstrap'"),'browser transport must expose the server-backed R117 bootstrap');
must(hybrid.includes('bootstrapSovereignR117')&&hybrid.includes('DOWNLOAD CLEAN R117 CONNECTOR'),'ordinary Hybrid surface must expose fresh credential rotation plus explicit download');
must(!hybrid.includes("document.createElement('a')")&&!hybrid.includes('.click()'),'R117 connection UI must not use a synthetic async download click');
must(launcher.includes('https://omegav6.jeffdeweyeljefe.workers.dev')&&!launcher.includes('omega-sovereign-convergence.foundasound.chatgpt.site'),'active R117 launcher must target only canonical OMEGAv6');
must(worker.includes('nativeExecutionClaimed:false')||worker.includes('nativeExecutionClaimed: false'),'fresh pairing must never claim PC ONLINE before a real host heartbeat');

console.log('R118 FULL SYSTEM STATIC PASS · 44 route authority · concrete specialist ownership · current Worker lineage · fresh Hybrid bootstrap · explicit browser-safe connector download');
