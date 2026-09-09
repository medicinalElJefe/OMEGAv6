import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const parse=async response=>{const raw=await response.text();let body=null;try{body=JSON.parse(raw)}catch{}return{response,raw,body}};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const R141_WRAPPER_ROUTE='/api/hybrid/agent-download?r117=1&r120=1&r127=1&validator=zero-drift';
const R205_BASE_ROUTE='/omega-hybrid-agent-base-r205.py';
const R205_BASE_SHA256='49a3be453b1e67e5eb7e8e29411e82f07d30d2fd45fa52fa0bf28ef57774a046';

if(!expected)throw new Error('R238 live proof requires OMEGA_PROMOTED_SHA or GITHUB_SHA');
const receipt=await parse(await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}));
if(!receipt.response.ok)throw new Error(`R238 build receipt HTTP ${receipt.response.status}`);
const servedSha=receipt.body?.promotion?.promotedMergeSha||receipt.body?.source?.sha||'';
if(servedSha!==expected)throw new Error(`R238 exact promoted SHA mismatch expected ${expected} served ${servedSha||'NONE'}`);

const expectedWrapper=readFileSync('public/omega-hybrid-agent-r141.py','utf8');
const expectedWrapperSha=sha(expectedWrapper);
const wrapperResponse=await fetch(base+R141_WRAPPER_ROUTE,{headers:{'cache-control':'no-cache'}});
const wrapper=await wrapperResponse.text();
if(!wrapperResponse.ok)throw new Error(`R238 R141 Hybrid wrapper HTTP ${wrapperResponse.status}`);
const servedWrapperSha=sha(wrapper);
const wrapperReceipt=wrapperResponse.headers.get('x-omega-agent-sha256');
if(servedWrapperSha!==expectedWrapperSha||wrapper!==expectedWrapper)throw new Error(`R238 R141 wrapper bytes drifted expected ${expectedWrapperSha} served ${servedWrapperSha}`);
if(wrapperReceipt!==expectedWrapperSha)throw new Error(`R238 R141 wrapper receipt SHA mismatch expected ${expectedWrapperSha} received ${wrapperReceipt||'NONE'}`);
if(wrapperResponse.headers.get('x-omega-proof-closure')!=='R141')throw new Error(`R238 R141 proof-closure header missing: ${wrapperResponse.headers.get('x-omega-proof-closure')||'NONE'}`);
if(wrapperResponse.headers.get('x-omega-canonical-origin')!==base)throw new Error(`R238 R141 canonical-origin header mismatch: ${wrapperResponse.headers.get('x-omega-canonical-origin')||'NONE'}`);
for(const token of ["HOST_INTELLIGENCE_EXTENSION='R238'","HOST_PROFILE_SCHEMA='OMEGA_HYBRID_HOST_PROFILE_R238'","MACRO_PREFLIGHT_SCHEMA='OMEGA_MACRO_PREFLIGHT_R238'",`EXPECTED_BASE_SHA256='${R205_BASE_SHA256}'`,'Get-CimInstance Win32_VideoController','MAX_MACRO_SECONDS_R238=300','MAX_MACRO_COORD_ABS_R238=100000'])if(!wrapper.includes(token))throw new Error(`R238 live R141 wrapper missing ${token}`);
for(const forbidden of ['Ryzen 7 3700X','RTX 2070 SUPER','32.0 GB','19045.6456','shell=True','pip install','python -m pip'])if(wrapper.includes(forbidden))throw new Error(`R238 live wrapper contains forbidden overclaim/unsafe token ${forbidden}`);

const expectedBase=readFileSync('public/omega-hybrid-agent-base-r205.py','utf8');
const baseAgentResponse=await fetch(base+R205_BASE_ROUTE,{headers:{'cache-control':'no-cache'}});
const baseAgent=await baseAgentResponse.text();
if(!baseAgentResponse.ok)throw new Error(`R238 immutable base agent HTTP ${baseAgentResponse.status}`);
const baseSha=sha(baseAgent);
if(sha(expectedBase)!==R205_BASE_SHA256)throw new Error(`R238 repository immutable R205 base drifted: ${sha(expectedBase)}`);
if(baseSha!==R205_BASE_SHA256||baseAgent!==expectedBase)throw new Error(`R238 immutable live R205 base drifted: ${baseSha}`);

const status=await parse(await fetch(base+'/api/hybrid/status',{headers:{'cache-control':'no-cache'}}));
if(!status.response.ok)throw new Error(`R238 public Hybrid status HTTP ${status.response.status}`);
const current=Array.isArray(status.body?.devices)?status.body.devices.filter(d=>d?.online&&!d?.revoked):[];
if(status.body?.state==='VERIFIED_DEVICE_ONLINE'){
  if(status.body?.nativeExecutionClaimed!==true||current.length<1)throw new Error('R238 live Hybrid claims device online without a current authenticated device');
}else if(status.body?.state==='DEVICE_PROOF_REQUIRED'||status.body?.state==='PAIRING_REQUIRED'){
  if(status.body?.nativeExecutionClaimed===true||current.length!==0)throw new Error('R238 live Hybrid proof-required state conflicts with current device projection');
}else throw new Error(`R238 unsupported live Hybrid truth state ${status.body?.state}`);

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
await page.goto(base+'/',{waitUntil:'networkidle'});
await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const hybridEntry=page.locator('.r96-quick-card button').filter({hasText:'Hybrid'}).first();
await hybridEntry.waitFor({state:'visible'});await hybridEntry.click();
const intelligence=page.locator('[data-r238-host-intelligence]');
await intelligence.waitFor({state:'visible'});
const text=await intelligence.innerText();
for(const token of ['R238 · HYBRID HOST INTELLIGENCE','Use the machine you actually have.','RCWA PYTHON DEPENDENCY','LOCAL MACRO STORE','R141 exact return closure'])if(!text.includes(token))throw new Error(`R238 live browser missing ${token}`);
const selected=await intelligence.getAttribute('data-r238-selected-device');
if(current.length===0){
  if(selected!=='NONE'||!text.includes('DEVICE PROOF REQUIRED'))throw new Error(`R238 live browser should truthfully hold with no current device; selected=${selected}`);
}else if(!current.some(d=>d.id===selected))throw new Error(`R238 live browser selected device ${selected} is not a current authenticated device`);
if(pageErrors.length)throw new Error(`R238 live browser page errors: ${pageErrors.join(' | ')}`);
await browser.close();

console.log(`R238 LIVE HOST INTELLIGENCE PASS · exact SHA ${expected} · R141 wrapper ${servedWrapperSha} via governed wrapper route · immutable R205 base ${baseSha} · Hybrid ${status.body.state} · current public devices ${current.length} · live Home→TOOLS→Hybrid host-intelligence surface rendered without cross-authority claims`);
