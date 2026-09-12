import fs from 'node:fs';
const a=fs.readFileSync('src/archiveGenomeLedgerR288.ts','utf8');
const b=fs.readFileSync('src/archiveGenomeLedgerR288b.ts','utf8');
const s=a+'\n'+b;
const must=(ok,msg)=>{if(!ok)throw new Error(`R288B invariant failed: ${msg}`)};
for(const token of [
 "id:'AG-018'","id:'AG-019'","id:'AG-020'","id:'AG-021'","id:'AG-022'",
 'AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS','working/episodic/semantic/procedural memory services','QTI G1-G10 gate engine',
 'PROPOSE→SIMULATE→VERIFY→AUTHORIZE→EXECUTE→OBSERVE→AUDIT','Privileges(Reasoner)',
 'README_GPU_V12.md','20,736 packet GPU mirror','20,735 transition-edge buffer','five scale projection laws',
 'gpu_harness/runtime_core/action_executor.py','gpu_harness/storage/db.py','gpu_harness/kernel_transport/websocket_server.py',
 'OMEGA_20736D_IMPLEMENTATION_CANON_INDEX.xlsx','675-row current-status compiler','thread/density/SDF/marching-cubes/splat/visibility/material/PBR shader delta',
 'Dynamic_Evolution_Engine_734_Spec.pdf','MORPH_TENSOR','historical model parameters'
])must(s.includes(token),`missing ${token}`);
must(s.includes('The cognitive/reasoning layer must never self-authorize'),'cognition self-authorization boundary missing');
must(s.includes('not yet a physically based path tracer, neural diffusion renderer or production CAD kernel'),'GPU capability boundary missing');
must(s.includes('Archived state/action/commit modules are donors only and may not establish a second runtime authority'),'native host donor authority boundary missing');
must(s.includes('The workbook is an implementation specification, not proof that its PLANNED modules currently exist'),'implementation canon truth boundary missing');
must(s.includes('Historical 188/666/734 shell language is not current physical or canonical dimension authority'),'historical evolution semantic boundary missing');
const ids=[...s.matchAll(/id:'AG-(\d{3})'/g)].map(x=>x[1]);
must(ids.length>=22,`expected >=22 archive genome rows, got ${ids.length}`);
must(new Set(ids).size===ids.length,'extended archive genome IDs must be unique');
console.log(`R288B ARCHIVE GENOME PASS · ${ids.length} total typed upgrade rows · cognition/GPU/native-host/canon/evolution boundaries preserved`);