import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R94/R305 '+msg)};
const worker=read('src/workerR33.js');
const hybrid=read('src/HybridMissionControlR8.tsx');
const hybridLink=read('src/HybridLinkR32.tsx');
const launcher=fs.existsSync('src/sovereignLauncherR117.ts')?read('src/sovereignLauncherR117.ts'):hybridLink;
const agent=read('public/omega-hybrid-agent.py');
const baseAgent=fs.existsSync('public/omega-hybrid-agent-base-r205.py')?read('public/omega-hybrid-agent-base-r205.py'):agent;
const nav=read('src/OmegaSideNavigatorR88.tsx');
const css=read('src/omegaSideNavigatorR88.css');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const registry=read('src/omegaExperienceRegistryR82.ts');
const ci=read('.github/workflows/ci.yml');

const canonical='https://omegav6.jeffdeweyeljefe.workers.dev';
void canonical;

must(worker.includes("path==='/api/hybrid/agent-download'&&request.method==='GET'"),'Worker must expose canonical Hybrid agent download route');
must(worker.includes("source.length>1000")&&worker.includes("source.startsWith('#!/usr/bin/env python3')"),'Worker must validate agent asset before serving it');
must(worker.includes("source.includes(\"DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'\")"),'Worker must reject agent assets that do not target canonical runtime');
must(worker.includes("'cache-control':'no-store, max-age=0'"),'agent download must not be served from stale cache');
must(worker.includes("'x-omega-canonical-origin':CANONICAL_ORIGIN_R94"),'agent response must expose canonical origin receipt');
must(worker.includes("'x-omega-agent-sha256':digest")&&worker.includes('sha256TextR96(source)'),'agent response must expose a SHA-256 receipt for exact source bytes');

must(hybrid.includes("const CANONICAL_OMEGA_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev'"),'Windows manual fallback path must remain hard-bound to canonical origin');
must(!hybrid.includes('const origin=window.location.origin'),'Windows launcher must never inherit browser/preview origin');
must(hybrid.includes('buildSovereignLauncherR117')&&hybrid.includes('SOVEREIGN_LAUNCHER_FILENAME_R127'),'Hybrid mission surface must delegate launcher generation to the current zero-drift connector');
must(!hybrid.includes('/api/hybrid/agent-download?r94=1')&&!hybrid.includes('Invoke-WebRequest'),'legacy browser-generated R94 downloader must remain retired');
must(launcher.includes('/api/hybrid/agent-download?r117=1&r120=1&r127=1&validator=zero-drift')&&launcher.includes('--server "!OMEGA_ORIGIN!" --pair'),'current shared launcher must use the canonical validated transport contract');
must(launcher.includes('x-omega-agent-sha256')&&launcher.includes('hashlib.sha256(b).hexdigest()')&&launcher.includes('-m py_compile "!OMEGA_AGENT_PART!"'),'current shared launcher must verify exact server-declared SHA-256 and parser-preflight quarantined bytes before execution');
must(launcher.includes("needle='DEFAULT_SERVER='+chr(39)+'https://omegav6.jeffdeweyeljefe.workers.dev'+chr(39)"),'current launcher identity validator must remain cmd-quote safe');
must(agent.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'"),'canonical agent wrapper default server must remain canonical');
must(baseAgent.includes('probe_server(server)')&&baseAgent.includes('/api/hybrid/agent/register'),'frozen executor must still require canonical reachability and authenticated registration');
must(agent.includes("VERSION='R207'")&&agent.includes("BASE_PATH='/omega-hybrid-agent-base-r205.py'")&&agent.includes("FINGERPRINT_SCHEMA='OMEGA_AGENT_RETURN_FINGERPRINT_R141'"),'canonical R207 wrapper must bind frozen executor and exact R141 return proof');
must(![hybrid,hybridLink,agent,baseAgent,worker].join('\n').includes('omega-sovereign-convergence.foundasound.chatgpt.site')&&!launcher.includes('https://omega-sovereign-convergence.foundasound.chatgpt.site'),'obsolete Hybrid host must not exist as an active Hybrid transport path');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const routes=[...registry.matchAll(/routes:\[(.*?)\]/gs)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
must(surfaces.length>0&&surfaces.length===routes.length&&new Set(surfaces).size===surfaces.length&&new Set(routes).size===routes.length,'canonical current route universe must remain non-empty, unique and registry-aligned');
for(const route of surfaces)must(routes.includes(route),`Hybrid navigation workstation route absent from registry ${route}`);
for(const route of routes)must(surfaces.includes(route),`Hybrid navigation registry route absent from workstation ${route}`);

must(nav.includes("className={'r94-side-toolbar '")&&nav.includes("className='r94-nav-rail'"),'global navigator must expose persistent slim side rail');
must(nav.includes("const[expanded,setExpanded]=useState(false)"),'navigator must be collapsible');
must(nav.includes("dataset.omegaNavExpanded=expanded?'true':'false'"),'navigator must expose layout reservation state');
must(nav.includes("setExpanded(false);setQuery('')"),'route selection must collapse back to slim toolbar');
must(!nav.includes('r88-navigator-backdrop'),'navigator must no longer use modal backdrop');
must(!nav.includes("document.body.style.overflow='hidden'"),'navigator must not lock the active application under an overlay');

must(css.includes('.r94-side-toolbar{')&&css.includes('.r94-nav-rail{'),'persistent toolbar CSS missing');
must(css.includes("html[data-omega-nav-present='true'] :where(.omega-workstation-v2,.r71-home)")&&css.includes("margin-left:var(--r94-nav-rail)!important"),'collapsed toolbar width must be reserved in layout');
must(css.includes("html[data-omega-nav-expanded='true'] :where(.omega-workstation-v2,.r71-home)")&&css.includes("margin-left:calc(var(--r94-nav-rail) + var(--r94-nav-panel))!important"),'expanded panel width must be reserved instead of covering active view');
must(css.includes('--r94-nav-panel:min(42vw,220px)'),'mobile expanded navigation must remain deliberately narrow');
must(css.includes('--r94-nav-panel:min(40vw,190px)'),'small-phone navigation must remain even slimmer');

for(const selector of ['.r43-workspace-tabs','.r65-lens-nav','.rel-tabs','.r46-tabs','.depth-ribbon','.atlas-r36-toolbar','.hybrid-r32-buttons','.r28-route-strip'])must(css.includes(selector),'shared control language missing '+selector);
must(css.includes('--r94-control-bg:#071217')&&css.includes('--r94-control-line-active:rgba(101,208,191,.52)'),'unified control design tokens missing');
must(css.includes("button:is(.active,[aria-pressed='true'])"),'active navigation state must share one design grammar');
must(css.includes("button.primary-action,.primary-action"),'primary action hierarchy must remain visually distinct');
must(ci.includes('Verify canonical Hybrid agent download'),'production workflow must directly probe the Hybrid agent endpoint after deploy');
must(ci.includes("fetch(base+'/api/hybrid/agent-download'")&&ci.includes("OMEGA HYBRID AGENT LIVE PASS"),'live Hybrid agent probe must fetch and validate the canonical endpoint');
must(ci.includes("readFileSync('public/omega-hybrid-agent.py')")&&ci.includes('servedSha256!==expectedSha256')&&ci.includes('receiptSha256!==expectedSha256'),'live Hybrid probe must compare the response body and receipt to the repository source SHA-256');
must(!css.includes('@appdeploy/client')&&!nav.includes('@appdeploy/client'),'R94 navigation must remain provider portable');

console.log(`R94/R207/R305 HYBRID + NAVIGATION PASS · canonical R207 proof wrapper over frozen R205 executor · R127 zero-drift launcher · persistent non-covering side toolbar · ${surfaces.length} current routes exactly aligned · no historical route-count ceiling`);
