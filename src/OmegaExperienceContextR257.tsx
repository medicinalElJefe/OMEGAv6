import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';

export type OmegaExperienceIdR257='EXPLORE'|'OPERATE'|'VISUALIZE'|'ANALYZE'|'BUILD'|'PROVE';
export type OmegaExperienceDepthR257='FOCUS'|'ADVANCED'|'FULL';
export type OmegaExperienceStateR257={experience:OmegaExperienceIdR257;depth:OmegaExperienceDepthR257;immersive:boolean};
type OmegaPersistedExperienceR318=Pick<OmegaExperienceStateR257,'experience'|'depth'>;

type Value=OmegaExperienceStateR257&{
 setExperience:(v:OmegaExperienceIdR257)=>void;
 setDepth:(v:OmegaExperienceDepthR257)=>void;
 setImmersive:(v:boolean)=>void;
 setExperienceProfile:(experience:OmegaExperienceIdR257,depth:OmegaExperienceDepthR257)=>void;
 reset:()=>void;
};
const KEY='omega:r257:experience';
const EXPERIENCES=new Set<OmegaExperienceIdR257>(['EXPLORE','OPERATE','VISUALIZE','ANALYZE','BUILD','PROVE']);
const DEPTHS=new Set<OmegaExperienceDepthR257>(['FOCUS','ADVANCED','FULL']);
const DEFAULT:OmegaExperienceStateR257={experience:'EXPLORE',depth:'FOCUS',immersive:false};
/* R318: immersive presentation is deliberately session-only. It changes viewport/chrome ownership,
   so restoring it from localStorage can resurrect an overlay-style state after reload. Only the
   non-occluding experience/depth preferences are durable. */
const normalize=(raw:Partial<OmegaPersistedExperienceR318>|null|undefined):OmegaExperienceStateR257=>({
 experience:EXPERIENCES.has(raw?.experience as OmegaExperienceIdR257)?raw!.experience as OmegaExperienceIdR257:DEFAULT.experience,
 depth:DEPTHS.has(raw?.depth as OmegaExperienceDepthR257)?raw!.depth as OmegaExperienceDepthR257:DEFAULT.depth,
 immersive:false
});
const same=(a:OmegaExperienceStateR257,b:OmegaExperienceStateR257)=>a.experience===b.experience&&a.depth===b.depth&&a.immersive===b.immersive;
const read=():OmegaExperienceStateR257=>{
 if(typeof window==='undefined')return DEFAULT;
 try{return normalize(JSON.parse(window.localStorage.getItem(KEY)||'null'))}catch{return DEFAULT}
};
const write=(state:OmegaExperienceStateR257)=>{
 if(typeof window==='undefined')return;
 const persisted:OmegaPersistedExperienceR318={experience:state.experience,depth:state.depth};
 try{window.localStorage.setItem(KEY,JSON.stringify(persisted))}catch{}
};
const Ctx=createContext<Value|null>(null);

export function OmegaExperienceProviderR257({children}:{children:ReactNode}){
 const[state,setState]=useState<OmegaExperienceStateR257>(read);
 useEffect(()=>{
  write(state);
  window.dispatchEvent(new CustomEvent('omega-r257-experience-change',{detail:state}));
 },[state]);
 useEffect(()=>{
  const sync=(event:StorageEvent)=>{
   if(event.key!==KEY)return;
   try{
    const next=event.newValue===null?DEFAULT:normalize(JSON.parse(event.newValue));
    setState(prev=>same(prev,next)?prev:next);
   }catch{setState(prev=>same(prev,DEFAULT)?prev:DEFAULT)}
  };
  window.addEventListener('storage',sync);
  return()=>window.removeEventListener('storage',sync);
 },[]);
 const setExperience=useCallback((experience:OmegaExperienceIdR257)=>{if(EXPERIENCES.has(experience))setState(prev=>prev.experience===experience?prev:{...prev,experience})},[]);
 const setDepth=useCallback((depth:OmegaExperienceDepthR257)=>{if(DEPTHS.has(depth))setState(prev=>prev.depth===depth?prev:{...prev,depth})},[]);
 const setImmersive=useCallback((immersive:boolean)=>setState(prev=>prev.immersive===Boolean(immersive)?prev:{...prev,immersive:Boolean(immersive)}),[]);
 const setExperienceProfile=useCallback((experience:OmegaExperienceIdR257,depth:OmegaExperienceDepthR257)=>{
  if(!EXPERIENCES.has(experience)||!DEPTHS.has(depth))return;
  setState(prev=>prev.experience===experience&&prev.depth===depth?prev:{...prev,experience,depth});
 },[]);
 const reset=useCallback(()=>setState(prev=>same(prev,DEFAULT)?prev:DEFAULT),[]);
 const value=useMemo<Value>(()=>({...state,setExperience,setDepth,setImmersive,setExperienceProfile,reset}),[state,setExperience,setDepth,setImmersive,setExperienceProfile,reset]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useOmegaExperienceR257(){const v=useContext(Ctx);if(!v)throw new Error('useOmegaExperienceR257 requires OmegaExperienceProviderR257');return v}
