// R1008: retain R121 coordinator-reported cell receipts, NOT SPHERE agent outputs.
import {parseCellId,capabilityProfile} from './swarm/swarmCoreR121.js';
const AUTHORITY='COORDINATOR_REPORTED_CELL_PREVIEW_NOT_INDEPENDENTLY_VERIFIED';
const SHA=/^[a-f0-9]{64}$/;
const EXECUTORS=new Set(['DETERMINISTIC','WORKERS_AI','GENESIS','OPTICAL_CHAIN','UNKNOWN']);
export function validateCellReturnsR1008(envelope,missionId,maxCells){
 if(!Number.isSafeInteger(maxCells)||maxCells<1||maxCells>12||!envelope||envelope.schema!=='OMEGA_R121_CELL_RETURNS_R1008'||envelope.missionId!==missionId||envelope.authority!==AUTHORITY||envelope.canonicalMutation!==false||!Array.isArray(envelope.rows)||envelope.rows.length>maxCells)throw Error('Untrusted cell return envelope');
 const seen=new Set();
 const rows=envelope.rows.map(row=>{
  const address=typeof row?.cellId==='string'?parseCellId(row.cellId):null;
  if(!address||address.id!==row.cellId||address.index!==row.index||seen.has(row.cellId)||typeof row.ok!=='boolean'||!Number.isSafeInteger(row.status)||row.status<100||row.status>599||row.ok!==(row.status>=200&&row.status<300)||!EXECUTORS.has(row.executor)||typeof row.summary!=='string'||row.summary.length>1200||!(row.receiptSha===null||typeof row.receiptSha==='string'&&SHA.test(row.receiptSha)))throw Error('Untrusted cell return row');
  const p=capabilityProfile(address);
  if(row.organ!==p.domainRole||row.phase!==p.phaseRole)throw Error('Untrusted cell return address roles');
  seen.add(row.cellId);
  return Object.freeze({cellId:row.cellId,index:row.index,organ:row.organ,phase:row.phase,executor:row.executor,ok:row.ok,status:row.status,summary:row.summary,receiptSha:row.receiptSha});
 });
 return Object.freeze({schema:'OMEGA_R121_CELL_RETURNS_R1008',missionId,authority:AUTHORITY,canonicalMutation:false,rows:Object.freeze(rows)});
}
export function captureCellReturnsR1008(mission,original,maxCells){
 if(mission.id!==original.missionId)throw Error('Cell mission identifier mismatch');
 if(!Object.prototype.hasOwnProperty.call(mission,'recent'))return {};
 if(mission.schema!=='OMEGA_SWARM_MISSION_R121'||mission.canonicalMutation!==false||!Number.isSafeInteger(mission.total)||mission.total<1||mission.total>maxCells||!Number.isSafeInteger(mission.completed)||!Number.isSafeInteger(mission.failed)||mission.completed<0||mission.failed<0||mission.completed+mission.failed>mission.total)throw Error('Untrusted coordinator mission');
 const cellReturns=validateCellReturnsR1008({schema:'OMEGA_R121_CELL_RETURNS_R1008',missionId:mission.id,authority:AUTHORITY,canonicalMutation:false,rows:mission.recent},mission.id,maxCells);
 if(cellReturns.rows.length!==mission.completed+mission.failed||cellReturns.rows.filter(row=>row.ok).length!==mission.completed)throw Error('Untrusted coordinator cell counts');
 return {cellReturns};
}
// Only apply a response to its original current mission; do not regress progress on overlapping GETs.
export function reconcileMissionReturnR1008(current,next){
 if(!current||current.missionId!==next.missionId)return current;
 const terminal=new Set(['COMPLETE','FAILED','CANCELLED','TIMED_OUT']);
 if(terminal.has(current.status)&&next.status!==current.status)return current;
 if((next.completed??0)<(current.completed??0)||(next.failed??0)<(current.failed??0))return current;
 if(current.cellReturns&&(!next.cellReturns||next.cellReturns.rows.length<current.cellReturns.rows.length))return current;
 return next;
}
