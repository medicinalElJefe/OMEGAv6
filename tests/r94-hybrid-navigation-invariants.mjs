import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R94 '+msg)};
const worker=read('src/workerR33.js');
const hybrid=read('src/HybridMissionControlR8.tsx');
const hybridLink=read('src/HybridLinkR32.tsx');
const agent=read('public/omega-hybrid-agent.py');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const css=read('src/omegaSideNavigatorR88.css');
const workstation=read('src/OmegaWorkstationFullV2.tsx');

const canonical='https://omegav6.jeffdeweyeljefe.workers.dev';

must(worker.includes("path==='/api/hybrid/agent-download'&&request.method==='GET'"),'Worker must expose canonical Hybrid agent download route');
must(worker.includes("source.length>1000")&&worker.includes("source.startsWith('#!/usr/bin/env python3')"),'Worker must validate agent asset before serving it');
must(worker.includes("source.includes(\"DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'\")"),'Worker must reject agent assets that do not target canonical runtime');
must(worker.includes("'cache-control':'no-store, max-age=0'"),'agent download must not be served from stale cache');
must(worker.includes("'x-omega-canonical-origin':CANONICAL_ORIGIN_R94"),'agent response must expose canonical origin receipt');

must(hybrid.includes("const CANONICAL_OMEGA_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev'"),'Windows launcher must hard-bind canonical origin');
must(!hybrid.includes('const origin=window.location.origin'),'Windows launcher must never inherit browser/preview origin');
must(hybrid.includes("%OMEGA_ORIGIN%/api/hybrid/agent-download?r94=1"),'launcher must use validated Worker download endpoint');
must(hybrid.includes('--server "%OMEGA_ORIGIN%" --pair'),'launcher must explicitly bind Python agent back to canonical runtime');
must(hybrid.includes("$src.StartsWith('#!/usr/bin/env python3')")&&hybrid.includes("$src.Contains('OMEGA Hybrid Link agent')"),'launcher must validate downloaded Python before execution');
must(hybrid.includes('Check HTTP/firewall access to %OMEGA_ORIGIN%/api/hybrid/agent-download.'),'launcher error must point to the repaired canonical endpoint');
must(hybridLink.includes(`${CANONICAL_OMEGA_ORIGIN}/api/hybrid/agent-download?r94=1`),'manual agent download must use same canonical validated endpoint');
must(hybridLink.includes('--server "${CANONICAL_OMEGA_ORIGIN}"'),'manual command must explicitly bind canonical runtime');
must(agent.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'"),'agent default server must remain canonical');
must(agent.includes('probe_server(server)')&&agent.includes('/api/hybrid/agent/register'),'agent must still require canonical reachability and authenticated registration');
must(![hybrid,hybridLink,agent,worker].join('\n').includes('omega-sovereign-convergence.foundasound.chatgpt.site'),'obsolete Hybrid host must not exist in active Hybrid path');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical 44-route universe must remain intact');

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

for(const selector of ['.r43-workspace-tabs','.r65-lens-nav','.rel-tabs','.r46-tabs','.depth-ribbon','.atlas-r36-toolbar','.hybrid-r32-buttons','.r28-route-strip'])
 must(css.includes(selector),'shared control language missing '+selector);
must(css.includes('--r94-control-bg:#071217')&&css.includes('--r94-control-line-active:rgba(101,208,191,.52)'),'unified control design tokens missing');
must(css.includes("button:is(.active,[aria-pressed='true'])"),'active navigation state must share one design grammar');
must(css.includes("button.primary-action,.primary-action"),'primary action hierarchy must remain visually distinct');
must(!css.includes('@appdeploy/client')&&!nav.includes('@appdeploy/client'),'R94 navigation must remain provider portable');

console.log('R94 HYBRID + NAVIGATION PASS · canonical agent route repaired · stale origin inheritance removed · persistent non-covering side toolbar · unified destination controls · 44 routes preserved');
