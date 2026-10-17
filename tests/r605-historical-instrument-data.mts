import assert from 'node:assert/strict';
import {replayWorkbookFrameR604,workbookClockR604} from '../src7/workspaces/timeMandalaFormulaReplayR604.ts';
import {historicalNamedStateR603} from '../src7/workspaces/sevenStarHistoricalAuthorityR602.ts';
for(const address of [0,1,11498,20735])for(const seconds of [0,43200,86399]){
 const frame=replayWorkbookFrameR604(address,seconds),named=historicalNamedStateR603(address);
 assert.equal(frame.address,named.address);
 assert.equal(frame.liveSector,workbookClockR604(seconds).liveSector);
 assert.ok(frame.activeStar>=1&&frame.activeStar<=7);
 assert.ok(named.domain&&named.phase&&named.regulation&&named.scale);
}
console.log('R605 INSTRUMENT DATA PASS · source-derived time/state views share canonical address');
