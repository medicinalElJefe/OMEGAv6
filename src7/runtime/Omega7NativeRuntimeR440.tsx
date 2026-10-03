import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {api,localState} from '../../src/platformAdapter';
import {corpusState,decodeAddress,initCorpusPack} from '../../src/corpusRuntime';

export const OMEGA7_NATIVE_RUNTIME_SCHEMA='OMEGA7_NATIVE_RUNTIME_R440' as const;
const clamp=(n:number)=>Math.max(0,Math.min(20735,Math.floor(Number(n)||0)));
const readAddress=()=>clamp(Number(localState.read('omega.v6.address',11498)));

export type Omega7NativeRuntimeR440={
 schema:typeof OMEGA7_NATIVE_RUNTIME_SCHEMA;
 ready:boolean;
 bootError:string;
 address:number;
 record:any|null;
 coords:{d:number;p:number;r:number;l:number};
 state:any;
 status:any;
 restore:any;
 statusError:string;
 commitAddress:(address:number)=>void;
 retry:()=>Promise<void>;
 refreshStatus:()=>Promise<void>;
 canonicalMutation:false;
};

const Ctx=createContext<Omega7NativeRuntimeR440|null>(null);

export function Omega7NativeRuntimeProviderR440({children}:{children:ReactNode}){
 const[address,setAddress]=useState(readAddress);
 const[ready,setReady]=useState(false);
 const[bootError,setBootError]=useState('');
 const[status,setStatus]=useState<any>(null);
 const[restore,setRestore]=useState<any>(null);
 const[statusError,setStatusError]=useState('');

 const boot=async()=>{
  setBootError('');
  try{
   await initCorpusPack();
   setAddress(readAddress());
   setReady(true);
  }catch(error:any){
   setReady(false);
   setBootError(error?.message||String(error));
  }
 };

 const refreshStatus=async()=>{
  try{
   const[s,r]=await Promise.all([api.get<any>('/api/status'),api.get<any>('/api/restoration')]);
   setStatus(s.data||null);
   setRestore(r.data||null);
   setStatusError('');
  }catch(error:any){
   setStatusError(error?.message||String(error));
  }
 };

 useEffect(()=>{void boot();void refreshStatus()},[]);
 useEffect(()=>{
  const sync=()=>setAddress(current=>{const next=readAddress();return next===current?current:next});
  const id=window.setInterval(sync,850);
  window.addEventListener('storage',sync);
  return()=>{window.clearInterval(id);window.removeEventListener('storage',sync)};
 },[]);
 useEffect(()=>{
  const id=window.setInterval(()=>void refreshStatus(),30000);
  return()=>window.clearInterval(id);
 },[]);

 const commitAddress=(next:number)=>{
  const value=clamp(next);
  localState.write('omega.v6.address',value);
  setAddress(value);
 };

 const coords=useMemo(()=>decodeAddress(address),[address]);
 const record=useMemo(()=>ready?corpusState(address):null,[ready,address]);
 const state=useMemo(()=>({
  atlas:{address},
  modePolicy:'SOURCE_BACKED_ALL_AVAILABLE',
  frozen:false,
  d:coords.d,p:coords.p,r:coords.r,l:coords.l,
  workflow:'LAW',
  preset:'SOVEREIGN',
  timeAuthority:'NOW',
  viewportMode:'CANON_FIELD',
  instrumentView:'LIVE',
  workspace:'OMEGA7'
 }),[address,coords]);

 const value=useMemo<Omega7NativeRuntimeR440>(()=>({
  schema:OMEGA7_NATIVE_RUNTIME_SCHEMA,
  ready,bootError,address,record,coords,state,status,restore,statusError,
  commitAddress,retry:boot,refreshStatus,canonicalMutation:false
 }),[ready,bootError,address,record,coords,state,status,restore,statusError]);

 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOmega7NativeRuntimeR440(){
 const value=useContext(Ctx);
 if(!value)throw new Error('OMEGA7 native runtime must be used inside Omega7NativeRuntimeProviderR440');
 return value;
}
