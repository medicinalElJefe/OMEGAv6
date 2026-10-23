/**
 * R682: bounded, source-only NOAA/CIRA catalogue recovery.
 *
 * Retry transient catalogue failures on real GET responses. Never manufacture
 * coverage rows, substitute imagery, or report pixels as observed without a
 * real decoded image. Cancellation prevents stale async responses taking over.
 */
export type NoaaCoverageR682={id:string;label:string;state:string;lastModified?:string|null;truth?:string};
export type NoaaCatalogueResultR682={
 state:'RETURNED'|'ERROR'|'CANCELLED';rows:NoaaCoverageR682[];attempts:number;lastError:string|null;
 source:'/api/earth/noaa/catalog';syntheticImagery:false;
};
const DEFAULT_DELAYS=[0,350,1100] as const;
const sleepR682=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
function validateCoverageR682(payload:unknown){
 if(!Array.isArray(payload)||!payload.length)throw new Error('NOAA catalogue returned zero coverage records');
 const seen=new Set<string>();
 return payload.map((v:any)=>{
  if(!v||typeof v!=='object'||typeof v.id!=='string'||!/^[-A-Za-z0-9_]{2,40}$/.test(v.id)
    ||typeof v.label!=='string'||!v.label.trim()||typeof v.state!=='string')
    throw new Error('Malformed NOAA source coverage entry');
  if(seen.has(v.id))throw new Error('NOAA catalogue contains duplicated source coverage '+v.id);
  seen.add(v.id);
  return v as NoaaCoverageR682;
 });
}
export async function loadNoaaCatalogR682(
  read:()=>Promise<unknown>,
  options:{delaysMs?:readonly number[];sleep?:(ms:number)=>Promise<void>;isCurrent?:()=>boolean}={}
):Promise<NoaaCatalogueResultR682>{
 const delays=options.delaysMs||DEFAULT_DELAYS;
 if(!delays.length||delays.length>5||delays.some(x=>!Number.isFinite(x)||x<0||x>5000))
  throw new Error('R682 invalid retry horizon');
 const wait=options.sleep||sleepR682,alive=options.isCurrent||(()=>true);
 let lastError:string|null=null,attempts=0;
 for(const ms of delays){
  if(!alive())return{state:'CANCELLED',rows:[],attempts,lastError,source:'/api/earth/noaa/catalog',syntheticImagery:false};
  if(ms)await wait(ms);
  if(!alive())return{state:'CANCELLED',rows:[],attempts,lastError,source:'/api/earth/noaa/catalog',syntheticImagery:false};
  attempts++;
  try{
   const payload=await read();
   if(!alive())return{state:'CANCELLED',rows:[],attempts,lastError,source:'/api/earth/noaa/catalog',syntheticImagery:false};
   const rows=validateCoverageR682(payload);
   return{state:'RETURNED',rows,attempts,lastError:null,source:'/api/earth/noaa/catalog',syntheticImagery:false};
  }catch(e){
   lastError=e instanceof Error?e.message:String(e);
  }
 }
 return{state:'ERROR',rows:[],attempts,lastError,source:'/api/earth/noaa/catalog',syntheticImagery:false};
}
