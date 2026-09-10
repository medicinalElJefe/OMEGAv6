import {createContext,useContext,useMemo,useState,type ReactNode} from 'react';

export type OmegaExperienceIdR257='EXPLORE'|'OPERATE'|'VISUALIZE'|'ANALYZE'|'BUILD'|'PROVE';
export type OmegaExperienceDepthR257='FOCUS'|'ADVANCED'|'FULL';
export type OmegaExperienceStateR257={experience:OmegaExperienceIdR257;depth:OmegaExperienceDepthR257;immersive:boolean};

type Value=OmegaExperienceStateR257&{setExperience:(v:OmegaExperienceIdR257)=>void;setDepth:(v:OmegaExperienceDepthR257)=>void;setImmersive:(v:boolean)=>void;reset:()=>void};
const KEY='omega:r257:experience';
const EXPERIENCES=new Set<OmegaExperienceIdR257>(['EXPLORE','OPERATE','VISUALIZE','ANALYZE','BUILD','PROVE']);
const DEPTHS=new Set<OmegaExperienceDepthR257>(['FOCUS','ADVANCED','FULL']);
const DEFAULT:OmegaExperienceStateR257={experience:'EXPLORE',depth:'FOCUS',immersive:false};
const read=():OmegaExperienceStateR257=>{try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');return{experience:EXPERIENCES.has(raw?.experience)?raw.experience:DEFAULT.experience,depth:DEPTHS.has(raw?.depth)?raw.depth:DEFAULT.depth,immersive:raw?.immersive===true}}catch{return DEFAULT}};
const write=(state:OmegaExperienceStateR257)=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const Ctx=createContext<Value|null>(null);

export function OmegaExperienceProviderR257({children}:{children:ReactNode}){
 const[experience,setExperienceState]=useState<OmegaExperienceIdR257>(()=>read().experience);
 const[depth,setDepthState]=useState<OmegaExperienceDepthR257>(()=>read().depth);
 const[immersive,setImmersiveState]=useState(()=>read().immersive);
 const commit=(next:OmegaExperienceStateR257)=>{write(next);window.dispatchEvent(new CustomEvent('omega-r257-experience-change',{detail:next}))};
 const setExperience=(v:OmegaExperienceIdR257)=>{if(!EXPERIENCES.has(v))return;setExperienceState(v);commit({experience:v,depth,immersive})};
 const setDepth=(v:OmegaExperienceDepthR257)=>{if(!DEPTHS.has(v))return;setDepthState(v);commit({experience,depth:v,immersive})};
 const setImmersive=(v:boolean)=>{setImmersiveState(Boolean(v));commit({experience,depth,immersive:Boolean(v)})};
 const reset=()=>{setExperienceState(DEFAULT.experience);setDepthState(DEFAULT.depth);setImmersiveState(false);commit(DEFAULT)};
 const value=useMemo<Value>(()=>({experience,depth,immersive,setExperience,setDepth,setImmersive,reset}),[experience,depth,immersive]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useOmegaExperienceR257(){const v=useContext(Ctx);if(!v)throw new Error('useOmegaExperienceR257 requires OmegaExperienceProviderR257');return v}
