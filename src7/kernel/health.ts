import type {Omega7HealthState,Omega7Availability} from './types';

export function healthState(capabilityId:string,availability:Omega7Availability,message:string,options?:Partial<Pick<Omega7HealthState,'retryable'|'lastGoodAt'|'diagnostics'>>):Omega7HealthState{
 return{
  capabilityId,
  availability,
  message,
  retryable:options?.retryable??['DEGRADED','OFFLINE','FAILED'].includes(availability),
  lastGoodAt:options?.lastGoodAt??null,
  diagnostics:options?.diagnostics
 };
}

export function preserveLastGood<T>(current:T|null,next:T|null,availability:Omega7Availability):T|null{
 if(next!=null&&availability!=='FAILED'&&availability!=='OFFLINE')return next;
 return current;
}

export const OMEGA7_FAILURE_RULES=Object.freeze([
 'CAPABILITY_FAILURE_MUST_NOT_CRASH_SHELL',
 'LAST_GOOD_STATE_MUST_SURVIVE_TRANSIENT_PROVIDER_FAILURE',
 'NO_INFINITE_SPINNER',
 'NO_SILENT_CONTROL_FAILURE',
 'FAILED_CONTROL_MUST_EXPOSE_REASON_AND_RECOVERY',
 'OFFLINE_DEVICE_MUST_NOT_IMPLY_BROWSER_OR_CLOUD_FAILURE',
 'PRESENTATION_FAILURE_MUST_NOT_MUTATE_CANONICAL_STATE'
]);
