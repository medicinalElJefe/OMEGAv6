import {OMEGA7_SCHEMA,type Omega7Action,type Omega7AppState} from './types';

export const initialOmega7State:Omega7AppState={
 schema:OMEGA7_SCHEMA,
 activeDomain:'HOME',
 activeCapabilityId:null,
 activeLegacyRoute:null,
 projectId:null,
 task:{id:'idle',title:'',status:'IDLE',capabilityId:null,startedAt:null,completedAt:null,error:null},
 health:{},
 commandOpen:false,
 inspectorOpen:false,
 diagnosticsOpen:false,
 presentation:'STANDARD',
 canonicalMutation:false
};

export function omega7Reducer(state:Omega7AppState,action:Omega7Action):Omega7AppState{
 switch(action.type){
  case'NAVIGATE_DOMAIN':return{...state,activeDomain:action.domain};
  case'OPEN_CAPABILITY':return{...state,activeCapabilityId:action.capabilityId,activeLegacyRoute:action.legacyRoute};
  case'SET_PRESENTATION':return{...state,presentation:action.presentation};
  case'COMMAND_OPEN':return{...state,commandOpen:action.open};
  case'INSPECTOR_OPEN':return{...state,inspectorOpen:action.open};
  case'DIAGNOSTICS_OPEN':return{...state,diagnosticsOpen:action.open};
  case'TASK_START':return{...state,task:{id:action.taskId,title:action.title,status:'RUNNING',capabilityId:action.capabilityId,startedAt:new Date().toISOString(),completedAt:null,error:null}};
  case'TASK_SUCCESS':return{...state,task:{...state.task,status:'SUCCESS',completedAt:new Date().toISOString(),error:null}};
  case'TASK_FAIL':return{...state,task:{...state.task,status:'FAILED',completedAt:new Date().toISOString(),error:action.message}};
  case'HEALTH_UPDATE':return{...state,health:{...state.health,[action.health.capabilityId]:action.health}};
  default:return state;
 }
}
