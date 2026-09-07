import {useEffect,useMemo,useState} from 'react';
import {api} from './platformAdapter';
import type {NavigationLiveContext} from './adaptiveNavigationR156';

export const LIVE_NAVIGATION_SCHEMA='OMEGA_LIVE_NAVIGATION_CONTEXT_R156' as const;
export type LiveNavigationR156=NavigationLiveContext&{
 schema:typeof LIVE_NAVIGATION_SCHEMA;
 observedAt:number;
 deviceName:string;
 missionId:string;
 missionLabel:string;
 missionProgress:string;
 currentJobId:string;
 currentJobOp:string;
 error:string;
};

const upper=(v:any)=>String(v||'').trim().toUpperCase();
const normalizeProofStateR156=(value:any)=>{
 const state=upper(value);
 if(['RETURNED','VERIFIED','COMPLETE','COMPLETED','PROOF_RETURNED','PROOF_VERIFIED','PROOF_COMPLETE'].includes(state))return state;
 if(/FAILED|ERROR|INVALID/.test(state))return'FAILED';
 if(/REJECTED|DENIED/.test(state))return'REJECTED';
 if(/STALE|EXPIRED/.test(state))return'STALE';
 if(/CANCEL/.test(state))return'CANCELLED';
 if(!state||/NO[_ -]?RETURN|NOT[_ -]?RETURN|WAIT|PENDING|HELD|REQUIRED|UNAVAILABLE|UNKNOWN|NONE|MISSING|UNSELECTED|NO_RETURN_SELECTED/.test(state))return'WAITING';
 // Proof state is navigation telemetry, not raw backend prose. Unknown states are held so
 // a substring such as RETURN can never manufacture a positive proof badge.
 return'WAITING';
};
const empty=():LiveNavigationR156=>({schema:LIVE_NAVIGATION_SCHEMA,observedAt:0,pcOnline:false,deviceName:'',missionStatus:'UNKNOWN',missionId:'',missionLabel:'',missionProgress:'',jobStatus:'UNKNOWN',currentJobId:'',currentJobOp:'',rcwaState:'UNKNOWN',rcwaOnline:false,proofState:'WAITING',error:''});
const activeMission=(items:any[])=>items.find(x=>['ACTIVE','PAUSED'].includes(upper(x?.status)))||items[0]||null;

export function deriveLiveNavigationR156(hybrid:any,missionData:any,federation:any):LiveNavigationR156{
 const devices=Array.isArray(hybrid?.devices)?hybrid.devices:[],current=devices.filter((d:any)=>d?.online===true&&d?.revoked!==true),device=current[0]||null,pcOnline=hybrid?.nativeExecutionClaimed===true&&current.length>0;
 const missions=Array.isArray(missionData?.missions)?missionData.missions:[],mission=activeMission(missions),job=mission?.currentJob||(mission?.currentJobId&&Array.isArray(hybrid?.jobs)?hybrid.jobs.find((j:any)=>j?.id===mission.currentJobId):null)||null;
 const rcwaState=String(federation?.nodes?.sovereign?.rcwaState||federation?.runtime?.rcwa?.state||'UNKNOWN'),rcwaOnline=/LIVE|ONLINE/.test(rcwaState.toUpperCase());
 const proofState=normalizeProofStateR156(job?.proofClosure?.state||job?.returnPacket?.state||job?.proofState||mission?.proofState||'WAITING');
 const completed=Number(mission?.completedCycles||mission?.completed||0),max=Number(mission?.maxCycles||mission?.cycleLimit||0),progress=max>0?`${Math.max(0,completed)}/${max}`:mission?.cycle?`cycle ${mission.cycle}`:'';
 return{schema:LIVE_NAVIGATION_SCHEMA,observedAt:Date.now(),pcOnline,deviceName:String(device?.name||device?.id||''),missionStatus:upper(mission?.status)||'IDLE',missionId:String(mission?.id||''),missionLabel:String(mission?.objective||mission?.label||mission?.title||''),missionProgress:progress,jobStatus:upper(job?.status)||'IDLE',currentJobId:String(job?.id||mission?.currentJobId||''),currentJobOp:String(job?.op||job?.action||job?.profile||''),rcwaState,rcwaOnline,proofState,error:''};
}

export function useLiveNavigationR156(){
 const[state,setState]=useState<LiveNavigationR156>(()=>empty());
 useEffect(()=>{let disposed=false;const load=async()=>{try{const[h,m,f]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions').catch(()=>null),api.get<any>('/api/federation/run/status').catch(()=>null)]);if(!disposed)setState(deriveLiveNavigationR156(h.data,m?.data||{},f?.data||{}))}catch(error:any){if(!disposed)setState(prev=>({...prev,observedAt:Date.now(),error:error?.message||String(error)}))}};void load();const id=window.setInterval(()=>void load(),5000);return()=>{disposed=true;window.clearInterval(id)}},[]);
 return useMemo(()=>state,[state]);
}
