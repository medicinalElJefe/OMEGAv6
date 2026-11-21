/** R924 portable Atlas trace: self-contained, SHA-256 integrity only.
 * No claim of original-host authenticity, provider execution or Canon admission. */
export type AtlasTraceStepR924={step:number;address:number;coordinates:number[]};
export type PortableAtlasR924={schema:'OMEGA_PORTABLE_ATLAS_R924_V1';authority:'MODEL_DERIVED_UNATTESTED';trace:AtlasTraceStepR924[];sha256:string};
export function validatePortableTraceR924(trace:unknown):asserts trace is AtlasTraceStepR924[]{
 if(!Array.isArray(trace)||trace.length<1||trace.length>257)throw Error('Portable trace length invalid');
 for(let i=0;i<trace.length;i++){
  const x=trace[i];
  if(!x||typeof x!=='object'||Object.keys(x).sort().join(',')!=='address,coordinates,step'||x.step!==i||
   !Number.isInteger(x.address)||x.address<0||x.address>=20736||!Array.isArray(x.coordinates)||
   x.coordinates.length!==4||x.coordinates.some((n:unknown)=>!Number.isInteger(n)||(n as number)<1||(n as number)>12)||
   x.address!==1728*(x.coordinates[0]-1)+144*(x.coordinates[1]-1)+12*(x.coordinates[2]-1)+x.coordinates[3]-1)
   throw Error('Portable trace step invalid at '+i);
 }
}
export async function sha256PortableR924(value:string):Promise<string>{
 const bytes=new TextEncoder().encode(value);
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function makePortableAtlasR924(trace:unknown):Promise<PortableAtlasR924>{
 validatePortableTraceR924(trace);
 const canonical=JSON.stringify(trace);
 return {schema:'OMEGA_PORTABLE_ATLAS_R924_V1',authority:'MODEL_DERIVED_UNATTESTED',trace:JSON.parse(canonical),sha256:await sha256PortableR924(canonical)};
}
export async function readPortableAtlasR924(input:unknown):Promise<PortableAtlasR924>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid portable payload');
 const p=input as Record<string,unknown>;
 if(Object.keys(p).sort().join(',')!=='authority,schema,sha256,trace'||p.schema!=='OMEGA_PORTABLE_ATLAS_R924_V1'||p.authority!=='MODEL_DERIVED_UNATTESTED'||typeof p.sha256!=='string'||!/^[a-f0-9]{64}$/.test(p.sha256))throw Error('Invalid portable metadata');
 validatePortableTraceR924(p.trace);
 const actual=await sha256PortableR924(JSON.stringify(p.trace));
 if(actual!==p.sha256)throw Error('Portable trace SHA-256 mismatch');
 return p as PortableAtlasR924;
}
