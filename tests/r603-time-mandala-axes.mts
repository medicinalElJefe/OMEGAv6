import assert from 'node:assert/strict';
import {TIME_MANDALA_AXES_R603,historicalNamedStateR603,SEVEN_STAR_HISTORICAL_SOURCES} from '../src7/workspaces/sevenStarHistoricalAuthorityR602.ts';
for(const values of Object.values(TIME_MANDALA_AXES_R603)){assert.equal(values.length,12);assert.equal(new Set(values).size,12)}
assert.deepEqual(historicalNamedStateR603(0),{address:0,domain:'Cosmology',phase:'Seed',regulation:'Stable',scale:'Quantum',digits:[1,1,1,1]});
assert.deepEqual(historicalNamedStateR603(20735),{address:20735,domain:'Symbolic / Spiritual',phase:'Return',regulation:'Transcending',scale:'Abstract / Informational',digits:[12,12,12,12]});
assert.equal(SEVEN_STAR_HISTORICAL_SOURCES.find(x=>x.id==='TIME_MANDALA_WORKBOOK')?.driveFileId,'1L4yQ8einYFoUsbNniz_JI0tNnt-ngKD6');
for(let i=0;i<20736;i++)assert.equal(historicalNamedStateR603(i).address,i);
console.log('R603 HISTORICAL AXES PASS · four exact 12-label vocabularies · boundary states · source Drive ID · 20736 named addresses');
