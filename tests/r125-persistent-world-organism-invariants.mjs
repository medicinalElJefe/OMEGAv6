import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R125 '+msg)};
const world=read('src/world/persistentWorldR125.js');
const worker=read('src/workerR116.js');
const wrangler=read('wrangler.jsonc');
const suite=read('src/OmegaSpecialistSuite.tsx');
const ui=read('src/OmegaWorldContinuityR125.tsx');
const organism=read('src/OmegaOrganismR123.tsx');
const manifest=JSON.parse(read('public/omega-r125-world-manifest.json'));
const r124=JSON.parse(read('public/omega-r124-selfbuild-state.json'));

must(world.includes("WORLD_REVISION='R125'")&&world.includes('ONE CANONICAL WORLD / MANY LAWFUL PROJECTIONS / PERSISTENT CAUSAL PATH'),'persistent world law/revision missing');
for(const token of ['geometry','material','radiance','velocity','evidenceRefs','sourceRefs','proofRefs','scarHead','continuity','plasticity','contradiction','burden','uncertainty'])must(world.includes(token),'world packet field missing '+token);
must(world.includes('previousHash')&&world.includes("crypto.subtle.digest('SHA-256'")&&world.includes('MAX_EVENTS=256'),'scar/history ledger must be bounded and SHA-256 previous-hash chained');
must(world.includes("authority='RETURNED_NOT_ADMITTED'")&&world.includes("'SOURCE_RETURNED_NOT_ADMITTED'")&&world.includes("'CANONICAL_ADMISSION'"),'observation/proposal/admission roles must remain distinct');
must(world.includes('WORLD_ADMISSION_SECRET')&&world.includes('PROVEN_SHA256_PROOF_REQUIRED'),'internal canonical admission must require both authority secret and proven SHA-256 proof');
must(world.includes("u.pathname==='/api/world/admit'")&&world.includes('PUBLIC_ADMISSION_FORBIDDEN'),'public admission endpoint must fail closed');
must(world.includes('/api/earth/evidence')&&world.includes('EARTH_EVIDENCE_UNAVAILABLE')&&world.includes('evidence.evidenceHash'),'Earth world ingress must inherit returned-source evidence rather than fabricate a scene');
must(world.includes('syncSwarm')&&world.includes("kind:'SWARM_RETURN'")&&world.includes('Swarm output and Merkle receipts are durable returned computation, not CanonState admission.'),'swarm reconvergence must carry into world lineage without self-admission');
for(const route of ['/api/world/manifest','/api/world/snapshot','/api/world/events','/api/world/project','/api/world/organism','/api/world/propose','/api/world/observe/earth','/api/world/sync/swarm'])must(world.includes(route),'missing public world route '+route);

must(worker.includes("from './world/persistentWorldR125.js'")&&worker.includes('OmegaWorldState')&&worker.includes("path.startsWith('/api/world/')")&&worker.includes('worldApiR125'),'canonical Worker must mount the persistent world additively');
must(worker.includes("path.startsWith('/api/swarm/')")&&worker.includes('OmegaSwarmOrganismCoordinator')&&worker.includes("from './workerR115.js'"),'R125 must preserve organism swarm and inherited worker authority');
must(wrangler.includes('"main": "src/workerR116.js"')&&wrangler.includes('"OMEGA_WORLD_STATE"')&&wrangler.includes('"OmegaWorldState"')&&wrangler.includes('r125-persistent-world'),'Wrangler must preserve proven entrypoint while adding world Durable Object/migration');

must(suite.includes("import OmegaWorldContinuityR125 from './OmegaWorldContinuityR125'")&&suite.includes("<OmegaWorldContinuityR125 address={address}/><OmegaOrganismR123/>"),'Convergence must expose world continuity above organism execution rather than add another disconnected page');
for(const token of ['INGEST CURRENT EARTH','SYNC SWARM','CANONICAL WORLD','CAUSAL LEDGER','ORGANISM BODY','OBSERVER FRAME','RECENT WORLD TRACE'])must(ui.includes(token),'world continuity UI missing '+token);
must(organism.includes("api.post<any>('/api/world/propose'")&&organism.includes("kind:'SWARM_RETURN'")&&organism.includes('remain non-canonical'),'completed browser-observed organism missions must carry into world lineage without bypassing proof');

must(manifest.schema==='omega.persistent-world.r125.v1'&&manifest.canonicalAuthority==='OMEGAv6','machine-readable R125 world manifest identity mismatch');
must(manifest.addressTopology.states===20736&&String(manifest.addressTopology.meaning).includes('not literal physical dimensions'),'atlas truth boundary missing from world manifest');
must(manifest.continuity.observerProjectionMutatesCanon===false&&manifest.continuity.returnedEvidenceSelfAdmits===false&&manifest.continuity.swarmResultsSelfAdmit===false,'world continuity mutation boundaries regressed');
must(manifest.forbiddenPublicRoute==='POST /api/world/admit','public admission denial missing from manifest');
must(r124.active===true&&Array.isArray(r124.roadmap)&&r124.roadmap.some(x=>x.id==='SB007'&&String(x.objective).includes('persistent world contract')),'R125 must converge with—not erase—the active governed R124 computed-world roadmap');

console.log('R125 PASS · persistent canonical world · source/scar/proof lineage · swarm convergence · observer projection · governed self-build correlation · public admission fail-closed');
