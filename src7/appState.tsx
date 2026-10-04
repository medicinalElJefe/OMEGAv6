import {createContext,useContext,useEffect,useMemo,useReducer,type ReactNode} from 'react';
import type {OmegaRouteName} from '../src/navigationRegistry';
import {OMEGA7_CAPABILITY_BY_ROUTE,OMEGA7_DOMAINS,type Omega7Depth,type Omega7Domain,type Omega7Health} from './capabilityRegistry';

export const OMEGA7_APP_STATE_SCHEMA='OMEGA7_APP_STATE_V1' as const;

export type Omega7RuntimeHealth={
 shell:Omega7Health;
 capabilityRegistry:Omega7Health;
 compatibilityBridge:Omega7Health;
 canonicalState:Omega7Health;
 cloud:Omega7Health;
 device:Omega7Health;
};

export type Omega7AppState={
 schema:typeof OMEGA7_APP_STATE_SCHEMA;
 domain:Omega7Domain;
 depth:Omega7Depth;
 query:string;
 selectedRoute:OmegaRouteName|null;
 commandOpen:boolean;
 statusOpen:boolean;
 health:Omega7RuntimeHealth;
};

type Action=
 |{type:'DOMAIN';domain:Omega7Domain}
 |{type:'DEPTH';depth:Omega7Depth}
 |{type:'QUERY';query:string}
 |{type:'SELECT_ROUTE';route:OmegaRouteName|null}
 |{type:'COMMAND';open:boolean}
 |{type:'STATUS';open:boolean}
 |{type:'HEALTH';key:keyof Omega7RuntimeHealth;value:Omega7Health};

const OMEGA7_SESSION_KEY='omega7.session.v1';

const baseInitial:Omega7AppState={
 schema:OMEGA7_APP_STATE_SCHEMA,
 domain:'HOME',
 depth:'STANDARD',
 query:'',
 selectedRoute:null,
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

function initialState():Omega7AppState{
 if(typeof window==='undefined')return baseInitial;
 try{
  const raw=window.sessionStorage.getItem(OMEGA7_SESSION_KEY);
  if(!raw)return baseInitial;
  const saved=JSON.parse(raw);
  const domain=OMEGA7_DOMAINS.includes(saved?.domain)?saved.domain:'HOME';
  const depth=['STANDARD','ADVANCED','CANON'].includes(saved?.depth)?saved.depth:'STANDARD';
  const selectedRoute=typeof saved?.selectedRoute==='string'&&OMEGA7_CAPABILITY_BY_ROUTE.has(saved.selectedRoute)?saved.selectedRoute:null;
  return{...baseInitial,domain,depth,selectedRoute};
 }catch{return baseInitial}
}

function reducer(state:Omega7AppState,action:Action):Omega7AppState{
 switch(action.type){
  case'DOMAIN':return{...state,domain:action.domain,query:'',selectedRoute:null};
  case'DEPTH':return{...state,depth:action.depth};
  case'QUERY':return{...state,query:action.query};
  case'SELECT_ROUTE':return{...state,selectedRoute:action.route};
  case'COMMAND':return{...state,commandOpen:action.open};
  case'STATUS':return{...state,statusOpen:action.open};
  case'HEALTH':return{...state,health:{...state.health,[action.key]:action.value}};
  default:return state;
 }
}

const Ctx=createContext<{state:Omega7AppState;dispatch:React.Dispatch<Action>}|null>(null);

export function Omega7AppStateProvider({children}:{children:ReactNode}){
 const[state,dispatch]=useReducer(reducer,undefined,initialState);
 useEffect(()=>{
  try{window.sessionStorage.setItem(OMEGA7_SESSION_KEY,JSON.stringify({domain:state.domain,depth:state.depth,selectedRoute:state.selectedRoute}))}catch{}
 },[state.domain,state.depth,state.selectedRoute]);
 const value=useMemo(()=>({state,dispatch}),[state]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOmega7AppState(){
 const value=useContext(Ctx);
 if(!value)throw new Error('Omega7 app state must be used inside Omega7AppStateProvider');
 return value;
}
