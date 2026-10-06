import assert from 'node:assert/strict';
import {ARCHIVE_GENOME_ALL_ROWS_R288} from '../src/archiveGenomeLedgerR288b';
import {compileArtifactDerivedCorpusGraphR483,auditArtifactDerivedCorpusGraphR483} from '../src/system/artifactDerivedCorpusGraphR483';

const graph=compileArtifactDerivedCorpusGraphR483(),audit=auditArtifactDerivedCorpusGraphR483(graph);
assert.equal(graph.length,ARCHIVE_GENOME_ALL_ROWS_R288.length);
assert.equal(audit.pass,true);
assert.equal(audit.corpusAuthority,'R288_ARCHIVE_GENOME_PLUS_R314_BUILD_GRAPH');
assert.equal(audit.executorProjection,'R473_IS_DOWNSTREAM_PROJECTION_NOT_CAPABILITY_IDENTITY_AUTHORITY');
assert.ok(graph.every(x=>x.id.startsWith('AG-')&&x.routeIndependent===true&&x.canonicalMutation===false));
assert.ok(graph.every(x=>x.artifacts.length>0&&x.validation.length>0&&x.boundary.length>0));
assert.ok(graph.some(x=>x.currentBindings.length===0),'unbound artifact-derived families must remain visible rather than being forced into a route');
const canon=graph.find(x=>x.id==='AG-021');assert.ok(canon);assert.ok(canon!.artifacts.includes('OMEGA_20736D_IMPLEMENTATION_CANON_INDEX.xlsx'));assert.ok(canon!.missingDelta.some(x=>x.includes('675-row')));
const gpu=graph.find(x=>x.id==='AG-019');assert.ok(gpu);assert.equal(gpu!.coverage,'GATED');assert.ok(gpu!.missingDelta.some(x=>x.includes('20,736 packet GPU mirror')));
const qti=graph.find(x=>x.id==='AG-018');assert.ok(qti);assert.ok(qti!.buildStages.includes('R314-B12'));
console.log(`R483 ARTIFACT-DERIVED CORPUS GRAPH PASS · ${audit.nodes} artifact families · ${audit.artifactCount} artifacts · ${audit.unbound.length} deliberately unbound families retained`);
