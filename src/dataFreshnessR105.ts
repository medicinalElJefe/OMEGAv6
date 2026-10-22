export type OmegaDataAuthorityR105=
 |'LIVE_RUNTIME'
 |'CANONICAL_DERIVED'
 |'CURRENT_SESSION_HISTORY'
 |'RETAINED_EVIDENCE_HISTORY'
 |'RECOVERED_SOURCE_SNAPSHOT'
 |'FORECAST'
 |'GATED';

const finite=(v:any)=>Number.isFinite(Number(v));
export const R105_SESSION_START_MS=typeof performance!=='undefined'&&finite(performance.timeOrigin)?Math.floor(performance.timeOrigin):Date.now();

export function currentSessionRowsR105<T extends {at:number}>(rows:T[],start=R105_SESSION_START_MS){
 return (Array.isArray(rows)?rows:[]).filter(row=>finite(row?.at)&&Number(row.at)>=start);
}

export function retainedRowsR106<T extends {at:number}>(rows:T[],start=R105_SESSION_START_MS){
 return (Array.isArray(rows)?rows:[]).filter(row=>finite(row?.at)&&Number(row.at)<start);
}

export function ageMsR105(at:number,now=Date.now()){
 return finite(at)?Math.max(0,now-Number(at)):Number.POSITIVE_INFINITY;
}

export function freshnessLabelR105(at:number,now=Date.now()){
 const age=ageMsR105(at,now);
 if(!Number.isFinite(age))return 'timestamp unavailable';
 if(age<60_000)return `${Math.max(0,Math.round(age/1000))}s ago`;
 if(age<3_600_000)return `${Math.round(age/60_000)}m ago`;
 if(age<86_400_000)return `${Math.round(age/3_600_000)}h ago`;
 return `${Math.round(age/86_400_000)}d ago`;
}

export function temporalAuthorityR106(at:number):OmegaDataAuthorityR105{
 return finite(at)&&Number(at)>=R105_SESSION_START_MS?'CURRENT_SESSION_HISTORY':'RETAINED_EVIDENCE_HISTORY';
}

export const R105_DATA_TRUTH_BOUNDARY='Archived, recovered, workbook SAMPLE, donor, and retained browser-history rows may never be presented as NOW/live/current. Live graphs derive from the current canonical packet, returned runtime evidence, or current-session measurements. Historical rows remain inspectable without becoming current authority.';
export const R106_LEDGER_TRUTH_BOUNDARY='Retained proof/delta journals remain valid evidence inputs and recovery context, but current-session changes, current reconciliation, and present provider/runtime state are reported separately. A newly verified chain may span retained evidence without making every receipt a current observation.';
