export const OMEGA7_SCHEMA='OMEGA7_FOUNDATION_V1' as const;

export type Omega7HumanDomain='HOME'|'WORK'|'EXPLORE'|'CREATE'|'DEVELOP'|'SYSTEM';
export type Omega7Availability='READY'|'BUSY'|'DEGRADED'|'HELD'|'OFFLINE'|'FAILED';
export type Omega7Layout='DOCUMENT'|'CANVAS'|'ANALYSIS'|'CONTROL';
export type Omega7Execution='BROWSER'|'CLOUD'|'DEVICE'|'EXTERNAL'|'MIXED';

export type Omega7CapabilityContract={
  id:string;
  legacyRoute:string;
  label:string;
  description:string;
  humanDomain:Omega7HumanDomain;
  layout:Omega7Layout;
  execution:Omega7Execution;
  effect:string;
  authority:string;
  source:'OMEGAV6_INHERITED';
  inheritanceRequired:true;
  presentation:'STANDARD'|'ADVANCED'|'CANON';
};

export type Omega7HealthState={
  capabilityId:string;
  availability:Omega7Availability;
  message:string;
  retryable:boolean;
  lastGoodAt:string|null;
  diagnostics?:Record<string,unknown>;
};

export type Omega7TaskState={
  id:string;
  title:string;
  status:'IDLE'|'LOADING'|'RUNNING'|'SUCCESS'|'DEGRADED'|'FAILED'|'HELD';
  capabilityId:string|null;
  startedAt:string|null;
  completedAt:string|null;
  error:string|null;
};

export type Omega7AppState={
  schema:typeof OMEGA7_SCHEMA;
  activeDomain:Omega7HumanDomain;
  activeCapabilityId:string|null;
  activeLegacyRoute:string|null;
  projectId:string|null;
  task:Omega7TaskState;
  health:Record<string,Omega7HealthState>;
  commandOpen:boolean;
  inspectorOpen:boolean;
  diagnosticsOpen:boolean;
  presentation:'STANDARD'|'ADVANCED'|'CANON';
  canonicalMutation:false;
};

export type Omega7Action=
 | {type:'NAVIGATE_DOMAIN';domain:Omega7HumanDomain}
 | {type:'OPEN_CAPABILITY';capabilityId:string;legacyRoute:string}
 | {type:'SET_PRESENTATION';presentation:Omega7AppState['presentation']}
 | {type:'COMMAND_OPEN';open:boolean}
 | {type:'INSPECTOR_OPEN';open:boolean}
 | {type:'DIAGNOSTICS_OPEN';open:boolean}
 | {type:'TASK_START';taskId:string;title:string;capabilityId:string}
 | {type:'TASK_SUCCESS'}
 | {type:'TASK_FAIL';message:string}
 | {type:'HEALTH_UPDATE';health:Omega7HealthState};
