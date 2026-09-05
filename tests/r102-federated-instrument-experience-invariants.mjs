import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R102 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const worker=read('src/workerR102.js');
const worker101=read('src/workerR101.js');
const federation=read('src/FederationRunR97.tsx');
const experience=read('src/federation/federationExperienceR102.ts');
const css=read('src/federationRunR97.css');
const manifest=JSON.parse(read('public/omega-federation.json'));
const caps=JSON.parse(read('public/omega-capabilities.json'));
const accepted=read('src/acceptedProductionContractR95.ts');
const wrangler=read('wrangler.jsonc');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical 44-route universe must remain intact');
for(const route of ['Hybrid Link','Forecast','Relativity','Matter Traversal','Evidence & Proof','Visual Instrument'])must(surfaces.includes(route),'critical route missing '+route);

must(wrangler.includes('"main": "src/workerR102.js"'),'Cloudflare entry must promote R102 successor');
must(worker.includes("import r101,{OmegaRuntime as OmegaRuntimeR101} from './workerR101.js'"),'R102 must extend R101 rather than replace Hybrid/weave repairs');
must(worker.includes('export class OmegaRuntime extends OmegaRuntimeR101'),'Durable Object class lineage must remain compatible');
must(worker101.includes("import r34,{OmegaRuntime as OmegaRuntimeR34} from './workerR34.js'"),'R101 must still preserve R34 federation/RCWA behavior');
must(worker.includes('omega-living-light-etching-private-woven2.vercel.app')&&worker.includes('omega-optical-cloud-woven2.vercel.app'),'Optical preferred + legacy endpoint continuity missing');
must(worker.includes('probeOpticalR102')&&worker.includes('recoveredFromPreferred'),'Optical health must support bounded preferred/legacy recovery');
must(worker.includes('OMEGA_FEDERATION_RUN_STATUS_R102')&&worker.includes("'x-omega-federation-revision','R102'"),'live federation status/revision receipt missing');
must(worker.includes('omega-genesis-v1.jeffdeweyeljefe.workers.dev')&&worker.includes('omega-living-light-etching-private-woven2.vercel.app'),'current federation origins must be accepted by CORS');

must(experience.includes("FEDERATION_NODE_ORDER_R102:FederationNodeKey[]=['genesis','optical','sovereign','omegaV6']"),'four-role user handoff order must be explicit');
for(const verb of ['PROPOSE','SCREEN','SOLVE','ADMIT'])must(experience.includes(`verb:'${verb}'`),'missing federation verb '+verb);
must(experience.includes('NODE_LOCAL')||experience.includes('node-local'),'Genesis local/global authority boundary missing');
must(experience.includes('global federation CanonState mutation authority'),'OMEGAv6 global authority boundary missing');
must(federation.includes('four specialized runtimes')&&federation.includes('Genesis proposes, Optical screens, Sovereign computes, and OMEGAv6 admits'),'Federation UI must explain the role system in user terms');
must(federation.includes('FEDERATION_NODE_ORDER_R102.map'),'Federation UI must render the canonical four-node model');
must(!federation.includes("{label:'RCWA worker'"),'RCWA may not appear as a fake fifth federation node; it is a Sovereign compute sublayer');
must(federation.includes("['PROPOSE','SCREEN','SOLVE','ADMIT']"),'visible handoff trace missing');
must(federation.includes('CURRENT HANDOFF')&&federation.includes('NEXT USEFUL ACTION'),'task-first operational guidance missing');
must(css.includes('.r102-flow')&&css.includes('.r102-four-nodes')&&css.includes('@media(max-width:760px)'),'desktop/mobile federation instrument containment missing');

must(manifest.experienceRevision==='R102'&&manifest.canonicalAuthority==='OMEGAv6','federation manifest authority/revision mismatch');
must(manifest.nodes.length===4,'federation manifest must define exactly four specialized nodes');
must(manifest.nodes.find(x=>x.id==='omega-genesis')?.canonicalScope==='NODE_LOCAL_PROPOSAL_STATE_ONLY','Genesis must not compete for global CanonState');
must(manifest.nodes.find(x=>x.id==='omega-optical')?.url==='https://omega-living-light-etching-private-woven2.vercel.app','latest Optical surface must be preferred');
must(manifest.governance?.nodeLocalStateDoesNotEqualGlobalCanonState===true,'node-local/global-state distinction must be machine-readable');
must(Array.isArray(manifest.experienceContract?.sharedContext)&&manifest.experienceContract.sharedContext.includes('lineage')&&manifest.experienceContract.sharedContext.includes('scar_history'),'shared federation context must preserve lineage + history');

must(caps.experienceRevision==='R102'&&caps.interactionModel.includes('intent'),'capability manifest must be task-first');
must(caps.nodes['omega-v6'].authority==='global-canonical','capability manifest global authority mismatch');
must(caps.nodes['omega-genesis'].scope==='NODE_LOCAL_PROPOSAL_STATE_ONLY','capability manifest Genesis scope mismatch');
must(caps.nodes['omega-sovereign'].planned.includes('fdtd')&&caps.nodes['omega-sovereign'].planned.includes('fem'),'future full-wave expansion must remain declared without being falsely active');

for(const rule of ['FEDERATION_SINGLE_GLOBAL_AUTHORITY','TASK_FIRST_CAPABILITY_ROUTING','SHARED_CONTEXT_ACROSS_NODES'])must(accepted.includes("id:'"+rule+"'"),'persistent production contract missing '+rule);
must(accepted.includes("'R101 weave-derived effective resolution + Hybrid bridge-identity continuity authority'")&&accepted.includes("'R102 four-node capability fabric + task-first federation authority'"),'R102 must extend R101 preservation lineage');
must(![worker,experience,federation].join('\n').includes('Math.random'),'federation experience must not depend on fake/random state');

console.log('R102 FEDERATED INSTRUMENT EXPERIENCE PASS · four specialized runtimes · task-first handoff trace · single global CanonState authority · Optical endpoint continuity · R101/R34/44-route preservation');
