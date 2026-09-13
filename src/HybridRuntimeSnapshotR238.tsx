import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {api} from './platformAdapter';

const SELECTED_DEVICE_KEY='omega:hybrid:selectedDeviceId';
const POLL_MS=2500;
const ACTIVE_MISSION=new Set(['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']);

type SnapshotState={hybrid:any;missions:any[];observedAt:number;epoch:number;loading:boolean};
type MissionEntry={mission:any;job:any};
type SnapshotContextValue={
 hybrid:any;
 missions:any[];
 jobs:any[];
 knownDevices:any[];
 onlineDevices:any[];
 selectedDeviceId:string;
 device:any;
 selectedDeviceJobs:any[];
 missionEntries:MissionEntry[];
 currentMission:any;
 currentMissionJob:any;
 observedAt:number;
 epoch:number;
 loading:boolean;
 stale:boolean;
 error:string;
 refresh:()=>Promise<void>;
 selectDevice:(deviceId:string)=>void;
 targetForMission:(mission:any,job:any)=>string;
};

const HybridRuntimeSnapshotContext=createContext<SnapshotContextValue|null>(null);
const readSelectedDevice=()=>{try{return window.localStorage.getItem(SELECTED_DEVICE_KEY)||''}catch{return''}};
const targetForMission=(mission:any,job:any)=>String(mission?.targetDeviceId||job?.targetDeviceId||'');

export function HybridRuntimeSnapshotProviderR238({children}:{children:ReactNode}){
 const[snapshot,setSnapshot]=useState<SnapshotState>({hybrid:null,missions:[],observedAt:0,epoch:0,loading:true});
 const[selectedDeviceId,setSelectedDeviceId]=useState(readSelectedDevice);
 const[error,setError]=useState('');
 const inFlight=useRef<Promise<void>|null>(null);

 const refresh=useCallback(()=>{
  if(inFlight.current)return inFlight.current;
  const request=(async()=>{
   try{
    const[h,m]=await Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')]);
    const hybrid=h.data||{};
    const missions=Array.isArray(m.data?.missions)?m.data.missions:[];
    const observedAt=Date.now();
    setSnapshot(previous=>({hybrid,missions,observedAt,epoch:previous.epoch+1,loading:false}));
    setError('');
   }catch(e:any){
    setError(e?.message||String(e));
    setSnapshot(previous=>({...previous,loading:false}));
   }finally{inFlight.current=null}
  })();
  inFlight.current=request;
  return request;
 },[]);

 useEffect(()=>{
  void refresh();
  let timer:number|undefined;
  const arm=()=>{if(timer!==undefined)window.clearInterval(timer);timer=undefined;if(document.visibilityState==='visible')timer=window.setInterval(()=>void refresh(),POLL_MS)};
  const onVisibility=()=>{if(document.visibilityState==='visible')void refresh();arm()};
  const onResume=()=>{if(document.visibilityState==='visible')void refresh()};
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('focus',onResume);
  window.addEventListener('online',onResume);
  arm();
  return()=>{
   if(timer!==undefined)window.clearInterval(timer);
   document.removeEventListener('visibilitychange',onVisibility);
   window.removeEventListener('focus',onResume);
   window.removeEventListener('online',onResume);
  };
 },[refresh]);

 const jobs=useMemo(()=>Array.isArray(snapshot.hybrid?.jobs)?snapshot.hybrid.jobs:[],[snapshot.hybrid]);
 const knownDevices=useMemo(()=>Array.isArray(snapshot.hybrid?.devices)?snapshot.hybrid.devices.filter((row:any)=>!row?.revoked):[],[snapshot.hybrid]);
 const onlineDevices=useMemo(()=>knownDevices.filter((row:any)=>row?.online),[knownDevices]);
 const device=useMemo(()=>onlineDevices.find((row:any)=>row?.id===selectedDeviceId)||onlineDevices[0]||(onlineDevices.length===0?knownDevices.find((row:any)=>row?.id===selectedDeviceId)||knownDevices[0]:null)||null,[knownDevices,onlineDevices,selectedDeviceId]);

 useEffect(()=>{
  const next=String(device?.id||'');
  if(next===selectedDeviceId)return;
  setSelectedDeviceId(next);
  try{if(next)window.localStorage.setItem(SELECTED_DEVICE_KEY,next);else window.localStorage.removeItem(SELECTED_DEVICE_KEY)}catch{}
 },[device?.id,selectedDeviceId]);

 const selectDevice=useCallback((deviceId:string)=>{
  const id=String(deviceId||'');
  if(id&&!knownDevices.some((row:any)=>row?.id===id))return;
  setSelectedDeviceId(id);
  try{if(id)window.localStorage.setItem(SELECTED_DEVICE_KEY,id);else window.localStorage.removeItem(SELECTED_DEVICE_KEY)}catch{}
 },[knownDevices]);

 const selectedDeviceJobs=useMemo(()=>device?jobs.filter((job:any)=>job?.targetDeviceId===device.id):[],[jobs,device]);
 const jobById=useMemo(()=>new Map(jobs.map((job:any)=>[job?.id,job])),[jobs]);
 const missionEntries=useMemo(()=>snapshot.missions.map((mission:any)=>({mission,job:jobById.get(mission.currentJobId)||mission.currentJob||null})),[snapshot.missions,jobById]);
 const currentMissionEntry=useMemo(()=>{if(!device)return null;return[...missionEntries].reverse().find(({mission,job})=>ACTIVE_MISSION.has(String(mission?.status||'').toUpperCase())&&targetForMission(mission,job)===device.id)||null},[missionEntries,device]);
 const stale=Boolean(snapshot.observedAt&&Date.now()-snapshot.observedAt>POLL_MS*4);

 const value=useMemo<SnapshotContextValue>(()=>({
  hybrid:snapshot.hybrid,
  missions:snapshot.missions,
  jobs,
  knownDevices,
  onlineDevices,
  selectedDeviceId:String(device?.id||selectedDeviceId||''),
  device,
  selectedDeviceJobs,
  missionEntries,
  currentMission:currentMissionEntry?.mission||null,
  currentMissionJob:currentMissionEntry?.job||null,
  observedAt:snapshot.observedAt,
  epoch:snapshot.epoch,
  loading:snapshot.loading,
  stale,
  error,
  refresh,
  selectDevice,
  targetForMission
 }),[snapshot,jobs,knownDevices,onlineDevices,device,selectedDeviceId,selectedDeviceJobs,missionEntries,currentMissionEntry,stale,error,refresh,selectDevice]);

 return <HybridRuntimeSnapshotContext.Provider value={value}>{children}</HybridRuntimeSnapshotContext.Provider>;
}

export function useHybridRuntimeSnapshotR238(){
 const value=useContext(HybridRuntimeSnapshotContext);
 if(!value)throw new Error('useHybridRuntimeSnapshotR238 must be used inside HybridRuntimeSnapshotProviderR238');
 return value;
}