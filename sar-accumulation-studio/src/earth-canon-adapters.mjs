import { canonPacket, EARTH_SOURCE_FAMILIES } from './earth-canon-cube.mjs';

const adapters=new Map(),packets=new Map();
const DOCUMENTED=['GNSS','STRAIN','SEISMIC','TILT','PORE_PRESSURE','ENVIRONMENT'];

function assertFamily(family){const key=String(family||'').toUpperCase();if(!EARTH_SOURCE_FAMILIES[key])throw new Error(`Unknown Earth evidence family: ${key}`);return key;}
function safePacket(family,input={}){
  const key=assertFamily(family),measured=String(input.evidenceClass||'').toUpperCase().includes('MEASURED');
  if(measured&&input.sourceProven!==true)throw new Error(`${key} cannot enter Canon as measured until the adapter explicitly proves source lineage`);
  return canonPacket({...input,sourceFamily:key,sourceProven:input.sourceProven===true});
}
export function registerEarthEvidenceAdapter(family,adapter){
  const key=assertFamily(family);if(!adapter||typeof adapter.snapshot!=='function')throw new Error('Earth evidence adapter requires snapshot()');adapters.set(key,adapter);return ()=>adapters.delete(key);
}
export async function refreshEarthEvidenceAdapters(){
  const errors=[];
  for(const [family,adapter] of adapters){
    try{const values=await adapter.snapshot(),list=Array.isArray(values)?values:[values];packets.set(family,list.filter(Boolean).map(v=>safePacket(family,v)));}
    catch(error){errors.push({family,error:error.message});packets.set(family,[]);}
  }
  const all=[...packets.values()].flat();globalThis.OMEGA_EARTH_ADAPTER_PACKETS=all;window.dispatchEvent(new CustomEvent('omega-earth-adapter-update',{detail:{packets:all.length,errors}}));return {packets:all,errors};
}
export function currentEarthAdapterPackets(){return [...packets.values()].flat();}

const state={state:'READY',documentedFamilies:DOCUMENTED.map(family=>({family,...EARTH_SOURCE_FAMILIES[family]})),registered:adapters,packets,boundary:'This registry defines compatible geodesy/environment evidence contracts. A documented family is not live data. Only a registered adapter that returns sourceProven=true may create a measured Canon packet.'};
globalThis.OMEGA_EARTH_SOURCE_ADAPTERS=state;
globalThis.OMEGA_REGISTER_EARTH_EVIDENCE_ADAPTER=registerEarthEvidenceAdapter;
globalThis.OMEGA_REFRESH_EARTH_EVIDENCE_ADAPTERS=refreshEarthEvidenceAdapters;
