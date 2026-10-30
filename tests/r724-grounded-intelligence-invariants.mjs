import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {digestMemoryR722} from '../src/portableMemoryRecoveryR722.mjs';
import {composeGroundedIntelligenceR724,revalidateGroundedIntelligenceR724,evidenceTermsR724,GROUNDED_INTELLIGENCE_SCHEMA_R724} from '../src/groundedIntelligenceR724.mjs';
async function row(id,address,note,decision='STAY',at=1793347200000){
 const core={address,stateId:address+1,note,metrics:{continuity:0.42,scar:0.13},decision,
  routeNext:address+1,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
 return {id,at,...core,sha256:await digestMemoryR722(JSON.stringify(core))};
}
const a=await row('r724-source-0001',42,'Sonoran continuity woven motion');
const b=await row('r724-source-0002',43,'Sonoran motion under starlight','TURN',1793347200100);
const c=await row('r724-source-0003',44,'Unrelated archive entry','STAY',1793347200200);
const rows=[a,b,c];
assert.equal(evidenceTermsR724('What did I record about Sonoran motion?'),'sonoran motion');
const packet=await composeGroundedIntelligenceR724(rows,'What did I record about Sonoran motion?');
assert.equal(packet.schema,GROUNDED_INTELLIGENCE_SCHEMA_R724);
assert.equal(packet.status,'GROUNDED_LOCAL_EVIDENCE');
assert.equal(packet.totalMatches,2);assert.equal(packet.verifiedCount,3);
assert.deepEqual(packet.sources.map(x=>x.id),[b.id,a.id]);
assert.deepEqual(packet.statements.map(x=>x.text),[b.note,a.note]);
assert.equal(packet.providerInference,false);assert.equal(packet.authenticatedSource,false);
assert.equal((await revalidateGroundedIntelligenceR724(rows,packet)).packetSha256,packet.packetSha256);
assert.equal((await composeGroundedIntelligenceR724(rows,'unknown subject')).status,'NO_MATCHING_VERIFIED_EVIDENCE');
await assert.rejects(composeGroundedIntelligenceR724(rows,'what did I do?'),/terms refused/);
await assert.rejects(composeGroundedIntelligenceR724(rows,'a'.repeat(161)),/length refused/);
const changed=structuredClone(rows);changed[2].note+=' forged';
await assert.rejects(composeGroundedIntelligenceR724(changed,'sonoran'),/digest mismatch/);
await assert.rejects(revalidateGroundedIntelligenceR724(changed,packet),/digest mismatch/);
const replaced=[...rows,await row('r724-source-0004',45,'Sonoran motion after storm','TURN',1793347200300)];
await assert.rejects(revalidateGroundedIntelligenceR724(replaced,packet),/evidence changed/);
const timestampChanged=structuredClone(rows);timestampChanged[0].at+=1;
await assert.rejects(revalidateGroundedIntelligenceR724(timestampChanged,packet),/evidence changed/);
await assert.rejects(revalidateGroundedIntelligenceR724(rows,{...packet,packetSha256:'0'.repeat(64)}),/packet digest mismatch/);
await assert.rejects(revalidateGroundedIntelligenceR724(rows,{...packet,sources:[]}),/packet digest mismatch/);
const ui=readFileSync(new URL('../src7/workspaces/GroundedIntelligenceR724.tsx',import.meta.url),'utf8');
const fabric=readFileSync(new URL('../src/IntelligenceFabricPanel.tsx',import.meta.url),'utf8');
const host=readFileSync(new URL('../src7/workspaces/DevelopmentComputeWorkspaceR444.tsx',import.meta.url),'utf8');
const browser=readFileSync(new URL('./r707-woven-topology-browser-e2e.mjs',import.meta.url),'utf8');
for(const token of ['data-r724-question','data-r724-run','data-r724-source','data-r724-replay','data-r724-export','data-r724-json','data-r724-error','data-r724-boundary'])
 assert.ok(ui.includes(token),'R724 functional UI missing '+token);
assert.ok(fabric.includes('<GroundedIntelligenceR724 onAddress={onAddress}/>'));
assert.ok(host.includes('<IntelligenceFabricPanel address={address} onAddress={commit}/>'));
assert.ok(browser.includes('R724 grounded intelligence'));
console.log('R724 source-grounded composition, stable digest, no-match, tamper/stale refusal, OMEGA7 intelligence integration PASS');
