// R1013: recover an existing direct R121 mission, never dispatch on restore.
export const R1013_MISSION_KEY='omega.r121.selected-mission.v1';
const ID=/^[A-Za-z0-9_.:-]{1,128}$/;
const STATUS=new Set(['QUEUED','RUNNING','COMPLETE','FAILED','CANCELLED','TIMED_OUT','PAUSED']);
const TERMINAL=new Set(['COMPLETE','FAILED','CANCELLED','TIMED_OUT']);
export function missionIdR1013(value){if(typeof value!=='string'||!ID.test(value))throw Error('Invalid mission identifier');return value}
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
