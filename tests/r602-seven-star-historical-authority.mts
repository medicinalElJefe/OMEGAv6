import assert from 'node:assert/strict';
import {HISTORICAL_ATLAS_SIZE,HISTORICAL_SEVEN_SECTOR_ADDRESS_COUNT,HISTORICAL_SEVEN_STAR_OPERATORS,SEVEN_STAR_HISTORICAL_SOURCES,SEVEN_STAR_RECOVERY_GATE,historicalAddressDigits,historicalAddressFromDigits,historicalLiveSector,historicalActiveStar} from '../src7/workspaces/sevenStarHistoricalAuthorityR602.ts';
assert.equal(HISTORICAL_ATLAS_SIZE,20736);
assert.equal(HISTORICAL_SEVEN_SECTOR_ADDRESS_COUNT,145152);
assert.equal(HISTORICAL_SEVEN_STAR_OPERATORS.length,7);
assert.equal(new Set(HISTORICAL_SEVEN_STAR_OPERATORS.map(x=>x.operator)).size,7);
assert.deepEqual(HISTORICAL_SEVEN_STAR_OPERATORS.map(x=>x.color),['Purple','Red','Orange','Yellow','Green','Blue','Cyan']);
for(let address=0;address<20736;address++)assert.equal(historicalAddressFromDigits(historicalAddressDigits(address)),address);
for(let i=0;i<7;i++){
 const seconds=(i+.5)*86400/7;
 assert.equal(historicalLiveSector(seconds),i+1);
 for(let base=1;base<=7;base++)assert.equal(historicalActiveStar(base,i+1),((base+i-1)%7)+1);
}
assert.throws(()=>historicalAddressDigits(20736));
assert.throws(()=>historicalLiveSector(86400));
assert.ok(SEVEN_STAR_HISTORICAL_SOURCES.every(x=>x.execution==='UNVERIFIED'));
assert.equal(SEVEN_STAR_RECOVERY_GATE.status,'NOT_ADMITTED');
assert.ok(HISTORICAL_SEVEN_STAR_OPERATORS.every(x=>x.truth==='SYMBOLIC_MAPPING'));
console.log('R602 HISTORICAL CONTRACT PASS · exact 20736 address bijection · 145152 seven-sector product · 7 operator identities · modular time sequencing · no fabricated execution or physical claims');
