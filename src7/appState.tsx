import {createContext,useContext,useMemo,useReducer,type ReactNode} from 'react';
import type {OmegaRouteName} from '../src/navigationRegistry';
import type {Omega7Depth,Omega7Domain,Omega7Health} from './capabilityRegistry';

export const OMEGA7_APP_STATE_SCHEMA='OMEGA7_APP_STATE_V1' as const;

export type Omega7RuntimeHealth={
 shell:Omega7Health;
 capabilityRegistry:Omega7Health;
 compatibilityBridge:Omega7Health;
 canonicalState:Omega7Health;
 cloud:Omega7Health;
 device:Omega7Health;
};

export type Omega7SoftwareLaunchContext={
 bindingId:string;
 name:string;
 route:OmegaRouteName;
 operation:string;
 state:'EXECUTES_NOW'|'EXECUTES_AS_ADAPTER'|'TRUTH_GATED'|'ARCHIVE_ONLY';
 launchState:'LIVE'|'ADAPTER'|'GATED'|'ARCHIVE';
 aliases:readonly string[];
 truth:string;
 capabilityReality:string;
 receiptAuthority:string;
 admissionAuthority:string;
};

export type Omega7AppState={
 schema:typeof OMEGA7_APP_STATE_SCHEMA;
 domain:Omega7Domain;
 depth:Omega7Depth;
 query:string;
 selectedRoute:OmegaRouteName|null;
 softwareLaunch:Omega7SoftwareLaunchContext|null;
 commandOpen:boolean;
 statusOpen:boolean;
 health:Omega7RuntimeHealth;
};

type Action=
 |{type:'DOMAIN';domain:Omega7Domain}
 |{type:'DEPTH';depth:Omega7Depth}
 |{type:'QUERY';query:string}
 |{type:'SELECT_ROUTE';route:OmegaRouteName|null}
 |{type:'LAUNCH_SOFTWARE';launch:Omega7SoftwareLaunchContext}
 |{type:'COMMAND';open:boolean}
 |{type:'STATUS';open:boolean}
 |{type:'HEALTH';key:keyof Omega7RuntimeHealth;value:Omega7Health};

const initial:Omega7AppState={
 schema:OMEGA7_APP_STATE_SCHEMA,
 domain:'HOME',
 depth:'STANDARD',
 query:'',
 selectedRoute:null,
 softwareLaunch:null,
 commandOpen:false,
 statusOpen:false,
 health:{
  shell:'READY',
  capabilityRegistry:'READY',
  compatibilityBridge:'READY',
  canonicalState:'READY',
  cloud:'UNKNOWN',
  device:'UNKNOWN'
 }
};

function reducer(state:Omega7AppState,action:Action):Omega7AppState{
 switch(action.type){
  case'DOMAIN':return{...state,domain:action.domain,query:'',selectedRoute:null,softwareLaunch:null};
  case'DEPTH':return{...state,depth:action.depth};
  case'QUERY':return{...state,query:action.query};
  case'SELECT_ROUTE':return{...state,selectedRoute:action.route,softwareLaunch:null};
  case'LAUNCH_SOFTWARE':return{...state,selectedRoute:action.launch.route,softwareLaunch:action.launch,commandOpen:false,query:''};
  case'COMMAND':return{...state,commandOpen:action.open};
  case'STATUS':return{...state,statusOpen:action.open};
  case'HEALTH':return{...state,health:{...state.health,[action.key]:action.value}};
  default:return state;
 }
}

const Ctx=createContext<{state:Omega7AppState;dispatch:React.Dispatch<Action>}|null>(null);

export function Omega7AppStateProvider({children}:{children:ReactNode}){
 const[state,dispatch]=useReducer(reducer,initial);
 const value=useMemo(()=>({state,dispatch}),[state]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOmega7AppState(){
 const value=useContext(Ctx);
 if(!value)throw new Error('Omega7 app state must be used inside Omega7AppStateProvider');
 return value;
}
