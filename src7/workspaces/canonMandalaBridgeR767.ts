/** R767: source-recomputed Canon trajectory projected through the actual R604
 * Time Mandala workbook formulas at one explicit clock position. No empirical
 * time evolution, physical dynamics, provenance or CanonState admission.
 */
import {verifyCanonReplayCheckpointR764,deriveCanonTrajectoryR764} from '../../src/proof/canonTrajectoryR764.js';
import {workbookClockR604,replayWorkbookFrameR604} from './timeMandalaFormulaReplayR604.ts';

export function computeCanonMandalaBridgeR767(raw:string,seconds:number){
 const clock=workbookClockR604(seconds);
 const checkpoint=verifyCanonReplayCheckpointR764(raw);
 const trajectory=deriveCanonTrajectoryR764(checkpoint.witness);
 const frames=trajectory.frames.map((frame,index)=>{
  const workbook=replayWorkbookFrameR604(frame.atlasAddress20736,seconds);
  if(workbook.address!==frame.atlasAddress20736)throw Error('R767 workbook address mismatch');
  return {index,address:frame.atlasAddress20736,key:frame.key,
   canonDecision:frame.decision,canonMode188:frame.mode188,
   exactScoreCarry:frame.cumulativeExactDelta,
   boundaryScars:frame.cumulativeBoundaryScars,
   workbookBaseStar:workbook.baseStar,workbookActiveStar:workbook.activeStar,
   workbookOperator:workbook.operator,workbookMode188Gate:workbook.mode188Gate,
   workbookDispatch:workbook.deweyDispatch,workbookBlend:workbook.localBlendWeight};
 });
 return {schema:'OMEGA_R767_CANON_MANDALA_BRIDGE_V1' as const,
  selectedFrame:checkpoint.frame,seconds,clockSector:clock.liveSector,
  frames,source:'R763_R764_VERIFIED_SYMBOLIC_PATH_PLUS_R604_FORMULA_REPLAY',
  physicalTimeEvolution:false,originalWorkbookAuthenticated:false,
  canonicalMutation:false,crossDeviceMemory:false};
}
