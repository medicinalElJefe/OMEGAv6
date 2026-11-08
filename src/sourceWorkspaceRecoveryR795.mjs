/** R795 browser-local workspace settings; no source arrays, Canon authority or native proof. */
export const SOURCE_WORKSPACE_SCHEMA_R795='OMEGA_SOURCE_WORKSPACE_R795_V1';
export function parseSourceWorkspaceR795(raw,channels,sizes){
 if(typeof raw!=='string'||raw.length>8192)throw Error('R795 invalid checkpoint payload');
 let saved;
 try{saved=JSON.parse(raw)}catch{throw Error('R795 invalid checkpoint JSON')}
 const has=x=>typeof x==='string'&&Object.hasOwn(channels,x);
 if(!saved||typeof saved!=='object'||Array.isArray(saved)||
  saved.schema!==SOURCE_WORKSPACE_SCHEMA_R795||
  !Number.isSafeInteger(saved.address)||saved.address<0||saved.address>=20736||
  !sizes.includes(saved.tileSize)||typeof saved.showEdges!=='boolean'||
  !saved.lens||typeof saved.lens!=='object'||Array.isArray(saved.lens)||
  !['single','woven'].includes(saved.lens.mode)||
  !has(saved.lens.first)||!has(saved.lens.second)||
  !Number.isSafeInteger(saved.lens.weightPercent)||
  saved.lens.weightPercent<0||saved.lens.weightPercent>100||
  !Object.hasOwn(saved,'channelOverride')||
  (saved.channelOverride!==null&&!has(saved.channelOverride))||
  saved.sourceAuthority!=='SETTINGS_ONLY_RECOMPUTE_ON_RESTORE')
  throw Error('R795 invalid or incompatible workspace checkpoint');
 return {address:saved.address,tileSize:saved.tileSize,showEdges:saved.showEdges,
  lens:{mode:saved.lens.mode,first:saved.lens.first,second:saved.lens.second,
   weightPercent:saved.lens.weightPercent},channelOverride:saved.channelOverride};
}
