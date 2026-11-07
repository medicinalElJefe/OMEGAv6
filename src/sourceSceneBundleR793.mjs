/**
 * R793: a reproducible portable scene from the existing R734/R769/R770
 * 20,736-address source field. No alternate field, renderer, or Canon authority.
 *
 * Integrity is a deterministic *local recomputation check*, not an authenticated
 * receipt, a signature, measured physical space, historical parity or native proof.
 */
import {buildSourceTessellationR769,serializeSourceTessellationSvgR769,SOURCE_TESSELLATION_SIZES_R769} from './sourceTessellationR769.mjs';
import {ATLAS_FIELD_RASTER_SCHEMA_R734,ATLAS_FIELD_CHANNELS_R734,renderAtlasFieldRasterR734} from './atlasFieldRasterR734.mjs';
import {computeSourceFieldLensR770,SOURCE_LENS_SCHEMA_R770} from './sourceFieldLensR770.mjs';

export const SOURCE_SCENE_BUNDLE_SCHEMA_R793='OMEGA_SOURCE_SCENE_REPLAY_BUNDLE_R793_V1';
const N=20736;
const CHANNELS=[
 'x','y','z','phase','C','Phi','q','Lambda','scar','evidence','rsc',
 'geometry','motion','symmetry','forecast','route','continuityGate',
 'motionDrive','velocity','acceleration','routeNext','domain'
];
const enc=new TextEncoder();
async function hashBytes(bytes){
 if(!globalThis.crypto?.subtle)throw Error('R793 cryptographic digest unavailable; proof export refused');
 const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
}
const hashText=s=>hashBytes(enc.encode(s));
function bytesForChannel(name,array){
 const isFloat=name!=='routeNext'&&name!=='domain';
 if(isFloat&&!(array instanceof Float32Array))throw Error('R793 source channel type refused: '+name);
 if(name==='routeNext'&&!(array instanceof Uint32Array))throw Error('R793 successor type refused');
 if(name==='domain'&&!(array instanceof Uint8Array))throw Error('R793 domain type refused');
 if(array.length!==N)throw Error('R793 incomplete source channel: '+name);
 const width=isFloat||name==='routeNext'?4:1,bytes=new Uint8Array(N*width),v=new DataView(bytes.buffer);
 for(let i=0;i<N;i++){
  const n=array[i];
  if(!Number.isFinite(n))throw Error('R793 nonfinite source channel: '+name);
  if(isFloat)v.setFloat32(i*4,n,true);
  else if(name==='routeNext'){
   if(!Number.isSafeInteger(n)||n<0||n>=N)throw Error('R793 successor outside field');
   v.setUint32(i*4,n,true);
  }else{
   if(n>=12)throw Error('R793 domain outside declared 12-partition atlas');
   bytes[i]=n;
  }
 }
 return bytes;
}
async function fieldFingerprint(field){
 if(!field||field.count!==N)throw Error('R793 complete field required');
 const components=[];
 for(const name of CHANNELS){
  const bytes=bytesForChannel(name,field[name]);
  components.push([name,await hashBytes(bytes)]);
 }
 return hashText(JSON.stringify({count:N,channels:components}));
}
function validRaster(raster){
 return raster?.schema===ATLAS_FIELD_RASTER_SCHEMA_R734&&raster.sourceBound===true&&
 raster.addressCount===N&&raster.width===144&&raster.height===144&&
 raster.values instanceof Float32Array&&raster.values.length===N&&
 raster.rgba instanceof Uint8ClampedArray&&raster.rgba.length===N*4&&
 typeof raster.channel==='string'&&raster.channel.length>0&&raster.channel.length<=128;
}
const validAddress=a=>Number.isSafeInteger(a)&&a>=0&&a<N;
function sourceDescriptor(raster){
 if(Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,raster.channel))
  return {type:'R734_SOURCE_CHANNEL',channel:raster.channel};
 const lens=raster.lens;
 if(lens?.schema!==SOURCE_LENS_SCHEMA_R770||
    !Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,lens.first)||
    !Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,lens.second)||
    !Number.isSafeInteger(lens.secondWeightPercent)||lens.secondWeightPercent<0||lens.secondWeightPercent>100||
    raster.channel!=='r770-'+lens.first+'-'+lens.second+'-'+lens.secondWeightPercent)
   throw Error('R793 unknown or inconsistent source raster provenance');
 return {type:'R770_WOVEN_CHANNELS',first:lens.first,second:lens.second,secondWeightPercent:lens.secondWeightPercent};
}
/** Derive saved lens from the active current field, not a stale UI setting or serialized metric bytes. */
export function reconstructSceneRasterR793(field,source){
 const d=source?.rasterDescriptor;
 if(d?.type==='R734_SOURCE_CHANNEL'&&Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,d.channel))
  return renderAtlasFieldRasterR734(field,d.channel);
 if(d?.type==='R770_WOVEN_CHANNELS'&&
    Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,d.first)&&
    Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,d.second)&&
    Number.isSafeInteger(d.secondWeightPercent)&&d.secondWeightPercent>=0&&d.secondWeightPercent<=100)
  return computeSourceFieldLensR770(field,d.first,d.second,d.secondWeightPercent);
 throw Error('R793 unavailable or unsupported replay lens');
}
function requireSettings(raster,address,tileSize,showEdges){
 if(!validRaster(raster))throw Error('R793 complete source-derived raster required');
 sourceDescriptor(raster);
 if(!validAddress(address))throw Error('R793 invalid source address');
 if(!SOURCE_TESSELLATION_SIZES_R769.includes(tileSize))throw Error('R793 unsupported tessellation size');
 if(typeof showEdges!=='boolean')throw Error('R793 invalid edge visibility');
}
async function derive(field,raster,address,tileSize,showEdges){
 requireSettings(raster,address,tileSize,showEdges);
 // An exported raster must be reproduced from the current source field and declared lens.
 // A caller-supplied pixel buffer alone is not evidence of source provenance.
 const expected=reconstructSceneRasterR793(field,{rasterDescriptor:sourceDescriptor(raster)});
 if(expected.channel!==raster.channel||
    !validRaster(expected)||
    (await hashBytes(bytesForChannel('C',expected.values)))!==(await hashBytes(bytesForChannel('C',raster.values)))||
    (await hashBytes(expected.rgba))!==(await hashBytes(raster.rgba)))
  throw Error('R794 raster does not match declared live source');
 const sourceStateSha256=await fieldFingerprint(field);
 const tile=buildSourceTessellationR769(field,raster,address,tileSize);
 const svg=serializeSourceTessellationSvgR769(tile,{showEdges});
 const visualSha256=await hashBytes(raster.rgba);
 const valuesSha256=await hashBytes(bytesForChannel('C',raster.values));
 const svgSha256=await hashText(svg);
 const core={
  schema:SOURCE_SCENE_BUNDLE_SCHEMA_R793,
  source:{addressCount:N,fieldSha256:sourceStateSha256,rasterChannel:raster.channel,
   rasterDescriptor:sourceDescriptor(raster),
   rasterValuesSha256:valuesSha256,rasterRgbaSha256:visualSha256},
  scene:{address,tileSize,showEdges,svgSha256,triangles:tile.cells.length*2,
   edges:showEdges?tile.edges.length:0,originRow:tile.originRow,originCol:tile.originCol,
   relation:{
    address,successor:field.routeNext[address],domain:field.domain[address],
    continuity:field.C[address],successorContinuity:field.C[field.routeNext[address]],
    continuityDelta:field.C[field.routeNext[address]]-field.C[address],
    phase:field.phase[address],motion:field.motion[address],
    symmetry:field.symmetry[address],scar:field.scar[address],
    evidence:field.evidence[address],contradiction:field.q[address],
    forecastModelScore:field.forecast[address]
   }},
  authority:{
   source:'EXISTING_MANDALA20736_FIELD_AND_R734_R770_R769',
   state:'READ_ONLY_LOCAL_DERIVED',
   scene:'SOURCE_TESSELLATED_ADDRESS_GEOMETRY',
   proof:'DETERMINISTIC_RECOMPUTATION_ONLY',
   canonAdmission:'R125_REQUIRED',
   nativeHost:'DEVICE_PROOF_REQUIRED',
   physicalMeasurement:false,historicalRendererParity:false,canonicalMutation:false
  }
 };
 return {core,svg,sha256:await hashText(JSON.stringify(core))};
}
/** Builds a single self-contained scene-and-evidence artifact; no filesystem/Canon writes. */
export async function buildSourceSceneBundleR793(field,raster,{address,tileSize=12,showEdges=true}={}){
 const r=await derive(field,raster,address,tileSize,showEdges);
 return {...r.core,svg:r.svg,sceneFingerprintSha256:r.sha256};
}
/** Replay from a fresh current field and raster. Reject any changed source or output. */
export async function verifySourceSceneBundleR793(field,raster,bundle){
 if(bundle?.schema!==SOURCE_SCENE_BUNDLE_SCHEMA_R793||!bundle.source||!bundle.scene||
    typeof bundle.svg!=='string'||!/^[0-9a-f]{64}$/.test(bundle.sceneFingerprintSha256||''))
  return {ok:false,state:'REFUSED',reason:'MALFORMED_SCENE_BUNDLE',canonicalMutation:false};
 try{
  const activeRaster=raster||reconstructSceneRasterR793(field,bundle.source);
  const fresh=await derive(field,activeRaster,bundle.scene.address,bundle.scene.tileSize,bundle.scene.showEdges);
  const matches=fresh.sha256===bundle.sceneFingerprintSha256&&
   fresh.svg===bundle.svg&&JSON.stringify(fresh.core)===JSON.stringify({
    schema:bundle.schema,source:bundle.source,scene:bundle.scene,authority:bundle.authority
   });
  return {ok:matches,state:matches?'RECOMPUTED_MATCH':'REFUSED',
   reason:matches?null:'SOURCE_SCENE_OR_PROOF_MISMATCH',
   localRecomputationOnly:true,canonicalMutation:false};
 }catch(error){
  return {ok:false,state:'REFUSED',reason:error instanceof Error?error.message:String(error),canonicalMutation:false};
 }
}

/**
 * R794 bounded traversal of the existing source successor graph.
 * Carries continuity, motion, symmetry and evidence together without
 * inventing an alternative topology or modifying the source field.
 */
export function traceSourceContinuityR794(field,start,{maxSteps=12}={}){
 if(!field||field.count!==N||!(field.routeNext instanceof Uint32Array)||
    field.routeNext.length!==N||!validAddress(start)||
    !Number.isSafeInteger(maxSteps)||maxSteps<1||maxSteps>144)
  throw Error('R794 invalid source traversal request');
 for(const name of ['C','motion','symmetry','scar','evidence','q','forecast']){
  if(!(field[name] instanceof Float32Array)||field[name].length!==N)
   throw Error('R794 missing traversal source channel: '+name);
 }
 if(!(field.domain instanceof Uint8Array)||field.domain.length!==N)
  throw Error('R794 missing traversal domain');
 const visited=new Set(),steps=[];
 let current=start,termination='STEP_LIMIT';
 for(let i=0;i<maxSteps;i++){
  if(visited.has(current)){termination='CYCLE';break}
  visited.add(current);
  const successor=field.routeNext[current];
  if(!validAddress(successor)||field.domain[current]>=12)
   throw Error('R794 invalid source successor or domain');
  const values=[field.C[current],field.C[successor],field.motion[current],
   field.symmetry[current],field.scar[current],field.evidence[current],
   field.q[current],field.forecast[current]];
  if(values.some(v=>!Number.isFinite(v)))throw Error('R794 nonfinite traversal metric');
  steps.push({address:current,successor,domain:field.domain[current],
   continuity:values[0],continuityDelta:values[1]-values[0],
   motion:values[2],symmetry:values[3],scar:values[4],
   evidence:values[5],contradiction:values[6],forecastModelScore:values[7]});
  current=successor;
  if(visited.has(current)){termination='CYCLE';break}
 }
 return {start,maxSteps,steps,termination,nextAddress:current,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false};
}
