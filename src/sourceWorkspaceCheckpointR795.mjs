/** R795 workspace checkpoint: settings only; never serialize the Atlas field or claim Canon authority. */
import {ATLAS_FIELD_CHANNELS_R734} from './atlasFieldRasterR734.mjs';
import {SOURCE_TESSELLATION_SIZES_R769} from './sourceTessellationR769.mjs';
export const SOURCE_WORKSPACE_SCHEMA_R795='OMEGA_SOURCE_WORKSPACE_R795_V1';
const channel=v=>typeof v==='string'&&Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,v);
export function parseSourceWorkspaceCheckpointR795(raw){
 const saved=JSON.parse(raw);
 if(!saved||typeof saved!=='object'||Array.isArray(saved)||
  saved.schema!==SOURCE_WORKSPACE_SCHEMA_R795||
  saved.sourceAuthority!=='SETTINGS_ONLY_RECOMPUTE_ON_RESTORE'||
  !Number.isSafeInteger(saved.address)||saved.address<0||saved.address>=20736||
  !SOURCE_TESSELLATION_SIZES_R769.includes(saved.tileSize)||
  typeof saved.showEdges!=='boolean'||
  !saved.lens||typeof saved.lens!=='object'||Array.isArray(saved.lens)||
  !['single','woven'].includes(saved.lens.mode)||
  !channel(saved.lens.first)||!channel(saved.lens.second)||
  !Number.isSafeInteger(saved.lens.weightPercent)||
  saved.lens.weightPercent<0||saved.lens.weightPercent>100||
  !Object.hasOwn(saved,'channelOverride')||
  (saved.channelOverride!==null&&!channel(saved.channelOverride)))
  throw Error('R795 invalid or incompatible workspace checkpoint');
 return {address:saved.address,tileSize:saved.tileSize,showEdges:saved.showEdges,
  lens:{mode:saved.lens.mode,first:saved.lens.first,second:saved.lens.second,
   weightPercent:saved.lens.weightPercent},channelOverride:saved.channelOverride};
}
export function serializeSourceWorkspaceCheckpointR795(settings){
 const checkpoint={schema:SOURCE_WORKSPACE_SCHEMA_R795,...settings,
  sourceAuthority:'SETTINGS_ONLY_RECOMPUTE_ON_RESTORE'};
 // Apply the same validation before any checkpoint is written.
 parseSourceWorkspaceCheckpointR795(JSON.stringify(checkpoint));
 return JSON.stringify(checkpoint);
}
