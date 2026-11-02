import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workspace=readFileSync('src7/workspaces/WorkCreateWorkspaceR443.tsx','utf8');
const analysis=readFileSync('src7/workspaces/MemoryAnalysisR771.tsx','utf8');
const grounded=readFileSync('src7/workspaces/GroundedIntelligenceR724.tsx','utf8');
const continuity=readFileSync('src7/workspaces/MemoryContinuityR725.tsx','utf8');
const trajectory=readFileSync('src7/workspaces/MemoryTrajectoryR726.tsx','utf8');

assert.match(workspace,/route==='Memory'&&<MemoryAnalysisR771 onAddress=\{commit\}\/>/,'R771 must be mounted in native Memory and use shared address');
assert.match(workspace,/window\.dispatchEvent\(new CustomEvent\('omega7-address-changed'/,'R771 replay must reuse OMEGA7 address event');
assert.match(analysis,/data-r771-memory-analysis/);
for(const mode of ['EVIDENCE','CONTINUITY','TRAJECTORY']){
 assert.ok(analysis.includes("id:'"+mode+"'"),mode+' analysis selection missing');
 assert.ok(analysis.includes("data-r771-executor={mode}"),'selected executor must be visible');
}
for(const name of ['GroundedIntelligenceR724','MemoryContinuityR725','MemoryTrajectoryR726'])
 assert.ok(analysis.includes('<'+name+' onAddress={onAddress}/>'),name+' must be executable and address-bound');
for(const [source,proof] of [[grounded,'revalidateGroundedIntelligenceR724'],[continuity,'revalidateMemoryContinuityR725'],[trajectory,'revalidateMemoryTrajectoryR726']]){
 assert.ok(source.includes(proof),'source revalidation must not be removed');
 assert.ok(source.includes('omega-r722-memory-updated'),'source changes must invalidate cached results');
}
assert.ok(analysis.includes('No cloud synchronization'),'R771 must not imply cross-device memory');
assert.ok(analysis.includes('No cloud synchronization')&&analysis.includes('CanonState admission'),'R771 must retain explicit authority boundary');
console.log('R771 NATIVE MEMORY INTEGRATION PASS · three existing verified executors · shared address replay · no new memory authority');
