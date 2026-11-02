import assert from 'node:assert/strict';
import {auditFullCanonTopologyR763} from '../src/proof/canonTopologyCensusR763.js';
const a=auditFullCanonTopologyR763();
assert.equal(a.nodes,248832);assert.equal(a.modes,188);
assert.deepEqual(a.classCounts,{ESCALATE:63832,TURN:111786,STAY:73214});
assert.equal(a.edges,1140480);assert.equal(a.changes,348172);
assert.equal(a.boundaryNodes,207204);
assert.deepEqual(Object.values(a.byAxis).map(x=>x.edges),Array(5).fill(228096));
assert.deepEqual(Object.values(a.byAxis).map(x=>x.changes),[105131,105234,62052,37304,38451]);
assert.deepEqual(a.components,{ESCALATE:181,TURN:209,STAY:481});
assert.deepEqual(a.largest,{ESCALATE:63488,TURN:111428,STAY:72106});
assert.equal(a.nearestStayMaximum,12);
assert.equal(a.fullGraphVisited,248832);
assert.deepEqual(a.nearestStayHistogram,{'0':73214,'1':92773,'2':41876,'3':19146,'4':9924,
 '5':5698,'6':3204,'7':1615,'8':787,'9':372,'10':154,'11':57,'12':12});
assert.equal(a.physicalActionAuthority,false);
assert.equal(a.canonicalMutation,false);
console.log('R763 248832-state topology FULL EXACT PASS · 1140480 edges · 348172 decision changes · 871 basins · all 188 modes · max STAY distance 12');
