// R1013: recover an existing direct R121 mission, never dispatch on restore.
import {parseCellId,capabilityProfile} from './swarm/swarmCoreR121.js';
import {verifyDeterministicReturnR1012} from './sphereResultBytesR1012.mjs';
export const R1013_MISSION_KEY='omega.r121.selected-mission.v1';
const ID=/^[A-Za-z0-9_.:-]{1,128}$/;
const STATUS=new Set(['QUEUED','RUNNING','COMPLETE','FAILED','CANCELLED','TIMED_OUT','PAUSED']);
const TERMINAL=new Set(['COMPLETE','FAILED','CANCELLED','TIMED_OUT']);
export function missionIdR1013(value){if(typeof value!=='string'||!ID.test(value)||value==='.'||value==='..')throw Error('Invalid mission identifier');return value}
export function missionPathR1013(id){return '/api/swarm/missions/'+encodeURIComponent(missionIdR1013(id))}
export function validateMissionR1013(m,id){
 if(!m||m.id!==missionIdR1013(id)||m.schema!=='OMEGA_SWARM_MISSION_R121'||m.canonicalMutation!==false||!STATUS.has(m.status)||!Number.isSafeInteger(m.total)||m.total<1||m.total>1728||!Number.isSafeInteger(m.completed)||!Number.isSafeInteger(m.failed)||m.completed<0||m.failed<0||m.completed+m.failed>m.total||!Array.isArray(m.recent)||m.recent.length>36)throw Error('Untrusted R121 mission receipt');
 return m;
}
export function reconcileMissionR1013(current,next){
 if(!current||current.id!==next.id)return next;
 if(TERMINAL.has(current.status)&&current.status!==next.status)return current;
 if(next.completed<current.completed||next.failed<current.failed)return current;
 if(current.finalSynthesis?.authority==='MODEL_SYNTHESIS_NOT_CANON'&&next.finalSynthesis?.authority!=='MODEL_SYNTHESIS_NOT_CANON')return current;
 return next;
}
export function exportMissionR1013(m){
 validateMissionR1013(m,m?.id);
 return JSON.stringify({schema:'OMEGA_DIRECT_MISSION_RETURN_R1013',authority:'COORDINATOR_REPORTED_NOT_INDEPENDENTLY_VERIFIED',canonicalMutation:false,mission:m},null,2);
}

export function resultPagePathR1014(id,offset){
 if(offset!==undefined&&(!Number.isSafeInteger(offset)||offset<0||offset>1728))throw Error('Invalid result offset');
 return missionPathR1013(id)+'/results?limit=24'+(offset===undefined?'':'&offset='+offset);
}
export function validateResultPageR1014(p,id){
 if(!p||p.ok!==true||p.schema!=='OMEGA_R121_RESULT_PAGE_R1014'||p.missionId!==missionIdR1013(id)||p.canonicalMutation!==false||p.authority!=='COORDINATOR_REPORTED_NOT_INDEPENDENTLY_VERIFIED'||![p.archiveStart,p.archivedCount,p.accounted,p.planned,p.offset].every(Number.isSafeInteger)||p.archiveStart<0||p.archivedCount<0||p.archiveStart+p.archivedCount!==p.accounted||p.accounted>p.planned||p.planned>1728||p.offset<p.archiveStart||p.offset>p.accounted||!Array.isArray(p.rows)||p.rows.length>24||p.offset+p.rows.length>p.accounted||p.rows.some((row,i)=>!row||row.ordinal!==p.offset+i||typeof row.cellId!=='string')||p.nextOffset!==(p.offset+p.rows.length<p.accounted?p.offset+p.rows.length:null)||(p.rows.length===0&&p.nextOffset!==null))throw Error('Untrusted result history page');
 return p;
}

// R1015: a bounded, read-only export at a fixed accounted prefix. No redispatch,
// no fabricated legacy rows, no independent-authentication claim.
export async function collectMissionArchiveR1015(m,readPage,{isCurrent=()=>true,onProgress=()=>{}}={}){
 validateMissionR1013(m,m?.id);
 const target=m.completed+m.failed,rows=[],seen=new Set();
 const executors=new Set(['DETERMINISTIC','WORKERS_AI','GENESIS','OPTICAL_CHAIN','UNKNOWN']);
 let start=null,offset=undefined,good=0;
 for(let pageNo=0;pageNo<73;pageNo++){
  if(!isCurrent())throw Error('Archive export cancelled');
  const page=validateResultPageR1014(await readPage(offset),m.id);
  if(!isCurrent())throw Error('Archive export cancelled');
  if(start===null){start=page.archiveStart;offset=start}
  if(page.archiveStart!==start||page.planned!==m.total||page.accounted<target||page.offset!==offset||start>target)throw Error('Archive snapshot continuity unproved');
  for(const row of page.rows){
   if(row.ordinal>=target)break;
   const address=parseCellId(row.cellId);
   if(!address||address.id!==row.cellId||address.index!==row.index||seen.has(row.cellId)||typeof row.ok!=='boolean'||!Number.isSafeInteger(row.status)||row.status<100||row.status>599||row.ok!==(row.status>=200&&row.status<300)||!executors.has(row.executor)||typeof row.summary!=='string'||row.summary.length>1200||!(row.receiptSha===null||typeof row.receiptSha==='string'&&/^[a-f0-9]{64}$/.test(row.receiptSha)))throw Error('Archive row identity or status invalid');
   const profile=capabilityProfile(address);
   if(profile.domainRole!==row.organ||profile.phaseRole!==row.phase)throw Error('Archive row roles invalid');
   if(row.resultJson!==undefined&&!(await verifyDeterministicReturnR1012(row)))throw Error('Archive payload digest mismatch');
   seen.add(row.cellId);rows.push(row);if(row.ok)good++;
  }
  if(!isCurrent())throw Error('Archive export cancelled');
  onProgress(rows.length,target-start);
  if(rows.length===target-start){
   if(start===0&&(good!==m.completed||rows.length-good!==m.failed))throw Error('Archive success/failure counts mismatch');
   const envelope={schema:'OMEGA_R121_ARCHIVE_EXPORT_R1015',missionId:m.id,authority:'COORDINATOR_REPORTED_NOT_INDEPENDENTLY_VERIFIED',canonicalMutation:false,snapshot:{status:m.status,planned:m.total,accounted:target,completed:m.completed,failed:m.failed,archiveStart:start,archivedCount:rows.length,missingEarlierReturns:start,fullMissionAccounted:target===m.total,completeArchiveOfAccountedReturns:start===0},rows};
   const serialized=JSON.stringify(envelope,null,2);
   if(new TextEncoder().encode(serialized).length>16*1024*1024)throw Error('Archive export exceeds 16 MiB bound');
   return serialized;
  }
  if(page.nextOffset===null||page.nextOffset!==start+rows.length)throw Error('Archive snapshot incomplete');
  offset=page.nextOffset;
 }
 throw Error('Archive page budget exceeded');
}
