/** R768: finite, source-recomputed seven-sector Time Mandala sweep over one
 * verified R763/R764 Canon path. These are symbolic workbook clock sectors,
 * not measurements, forecasts, physical dimensions or autonomous actions.
 */
import {verifyCanonReplayCheckpointR764,deriveCanonTrajectoryR764} from '../../src/proof/canonTrajectoryR764.js';
import {replayWorkbookFrameR604,workbookClockR604} from './timeMandalaFormulaReplayR604.ts';

const SCHEMA='OMEGA_R768_CANON_MANDALA_SECTOR_SWEEP_V1';
const MAX_EXPORT=360000;
const secondsForSector=(sector:number)=>Math.floor((sector-0.5)*86400/7);

export function computeCanonMandalaSweepR768(raw:string){
 const checkpoint=verifyCanonReplayCheckpointR764(raw);
 const path=deriveCanonTrajectoryR764(checkpoint.witness);
 if(path.frames.length<1||path.frames.length>21)throw new RangeError('R768 path must contain 1..21 verified frames');
 const sectors=Array.from({length:7},(_,i)=>{
  const sector=i+1,seconds=secondsForSector(sector),clock=workbookClockR604(seconds);
  if(clock.liveSector!==sector)throw Error('R768 sector clock mismatch');
  const frames=path.frames.map((frame,index)=>{
   const workbook=replayWorkbookFrameR604(frame.atlasAddress20736,seconds);
   if(workbook.address!==frame.atlasAddress20736||workbook.liveSector!==sector)throw Error('R768 workbook projection mismatch');
   return {index,address:frame.atlasAddress20736,canonDecision:frame.decision,
    canonMode188:frame.mode188,exactScoreCarry:frame.cumulativeExactDelta,
    boundaryScars:frame.cumulativeBoundaryScars,
    activeStar:workbook.activeStar,operator:workbook.operator,
    mode188Gate:workbook.mode188Gate,dispatch:workbook.deweyDispatch};
  });
  return {sector,seconds,frames};
 });
 let transitions=0;
 for(let i=0;i<path.frames.length;i++){
  const first=sectors[0].frames[i];
  for(let sector=0;sector<7;sector++){
   const a=sectors[sector].frames[i],b=sectors[(sector+1)%7].frames[i];
   if(a.address!==first.address||a.canonDecision!==first.canonDecision||
      a.mode188Gate!==first.mode188Gate||
      JSON.stringify(a.exactScoreCarry)!==JSON.stringify(first.exactScoreCarry))
    throw Error('R768 path identity or workbook gate drift');
   if(b.activeStar!==(a.activeStar%7)+1)throw Error('R768 seven-star cyclic transition mismatch');
   transitions++;
  }
 }
 return {schema:SCHEMA,sourceCheckpoint:raw,selectedFrame:checkpoint.frame,
  frameCount:path.frames.length,sectors,verifiedStarTransitions:transitions,
  completeSevenSectorCycle:true,source:'R763_R764_VERIFIED_PATH_PLUS_R604_EXACT_WORKBOOK',
  originalWorkbookAuthenticated:false,physicalTimeEvolution:false,
  crossDeviceMemory:false,canonicalMutation:false};
}
export function verifyCanonMandalaSweepR768(imported:string){
 if(typeof imported!=='string'||imported.length>MAX_EXPORT)throw new TypeError('R768 bounded JSON export required');
 const received=JSON.parse(imported);
 if(!received||received.schema!==SCHEMA||typeof received.sourceCheckpoint!=='string')
  throw new TypeError('R768 sweep schema and source checkpoint required');
 const expected=computeCanonMandalaSweepR768(received.sourceCheckpoint);
 if(JSON.stringify(received)!==JSON.stringify(expected))throw Error('R768 sweep differs from independent source recomputation');
 return expected;
}
