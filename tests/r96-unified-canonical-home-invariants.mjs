import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R96 '+msg)};
const home=read('src/OmegaHomeR71.tsx');
const css=read('src/omegaHomeR71.css');
const membrane=read('src/CanonicalMembraneR95.tsx');
const worker32=read('src/workerR32.js');
const worker33=read('src/workerR33.js');
const hybrid=read('src/HybridMissionControlR8.tsx');
const ci=read('.github/workflows/ci.yml');
const release=read('.github/workflows/release-evidence-live.yml');
const federation=JSON.parse(read('public/omega-federation.json'));

must(home.includes("className='r96-workspaces'")&&home.includes('OMEGA_WORKSPACES_R82.map'),'one Home frame must expose six contextual workspaces');
must(home.includes("className='r96-engine-spine'")&&home.includes('ENGINE_META.map'),'federated engine truth must live in the same canonical frame');
must(home.includes('HOME_LENS')&&home.includes('projection={lens.projection}')&&home.includes('view={lens.view}'),'all Home lenses must control actual membrane geometry and data color');
for(const mapping of ["FIELD:{projection:'MANDALA',view:'SOURCE_COLOR'}","MATTER:{projection:'LATTICE',view:'SCAR'}","TRAVERSAL:{projection:'THREAD',view:'CONTINUITY'}","FORECAST:{projection:'THREAD',view:'PHI'}","RELATIVITY:{projection:'INVERSE',view:'MATH'}","INFINITY:{projection:'MANDALA',view:'INVERSE'}","SCALE:{projection:'LATTICE',view:'PSC'}","CONVERGENCE:{projection:'INVERSE',view:'DECISION'}"])must(home.includes(mapping),'missing lawful Home lens '+mapping);
must(home.includes('<OmegaSideNavigatorR88')&&home.includes('All 44 applications'),'44 historical routes must remain behind the shared tool catalog');
must(home.includes('<details open={showWorkflow}')&&home.includes('<details open={showSystemMap}'),'workflow and full lineage must remain available on demand');
must(css.includes('.r96-workbench{display:grid;grid-template-columns:minmax(0,1fr) 318px'),'canonical canvas must dominate the working frame');
must(css.includes('@media(max-width:980px)')&&css.includes('@media(max-width:720px)'),'unified Home must contain tablet and mobile layouts');

must(membrane.includes('projection?:Projection;view?:ViewMode')&&membrane.includes('controlledProjection??projectionState'),'canonical membrane must support controlled analysis lenses');
must(membrane.includes("data-motion='admitted-route-time-sync'")&&membrane.includes('requestAnimationFrame(draw)'),'motion must trace canonical admitted-route computation');
must(!membrane.includes('Math.random'),'canonical geometry may never use random filler');

must(worker32.includes("agentPath:'/api/hybrid/agent-download'"),'pairing response must point to the validated agent endpoint');
must(hybrid.includes('python omega-hybrid-agent.py --server "${CANONICAL_OMEGA_ORIGIN}" --pair'),'manual fallback must bind the canonical Worker');
must(worker33.includes("'x-omega-agent-sha256':digest"),'agent download must return an exact-byte SHA-256 receipt');
must(ci.includes('servedSha256!==expectedSha256')&&ci.includes('receiptSha256!==expectedSha256'),'post-deploy probe must reject stale or altered agent bytes');
must(release.includes('attempt<=180'),'release evidence verifier must allow the Cloudflare promotion window');

const sovereign=federation.nodes.find(node=>node.id==='omega-sovereign');
must(sovereign?.url===null&&sovereign?.endpoint==='/api/federation/rcwa/status'&&sovereign?.stateGate==='DEVICE_PROOF_REQUIRED','sovereign execution must resolve through the canonical Hybrid queue, not a stale preview host');
must(!read('public/omega-federation.json').includes('omega-sovereign-convergence.foundasound.chatgpt.site'),'obsolete sovereign preview host must be absent');
console.log('R96 UNIFIED CANONICAL HOME PASS · one frame · controlled living membrane · truthful federation · exact Hybrid bytes');
