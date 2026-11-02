/** R770: two-channel source-derived field lens. It is not a measured physical field or historical renderer. */
import {renderAtlasFieldRasterR734,ATLAS_FIELD_CHANNELS_R734,ATLAS_FIELD_RASTER_SCHEMA_R734} from './atlasFieldRasterR734.mjs';
export const SOURCE_LENS_SCHEMA_R770='OMEGA_SOURCE_FIELD_LENS_R770_V1';
export const SOURCE_LENS_STORAGE_KEY_R770='omega.r770.source-lens.v1';
export const DEFAULT_SOURCE_LENS_R770=Object.freeze({mode:'single',first:'C',second:'q',weightPercent:50});
const COUNT=20736,SIDE=144;
const channelOK=x=>typeof x==='string'&&Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,x);
const weightOK=x=>Number.isSafeInteger(x)&&x>=0&&x<=100;
export function validateSourceLensSettingsR770(value){
 if(!value||typeof value!=='object'||!['single','woven'].includes(value.mode)||
    !channelOK(value.first)||!channelOK(value.second)||!weightOK(value.weightPercent))
  throw TypeError('R770 source lens settings refused');
 return {mode:value.mode,first:value.first,second:value.second,weightPercent:value.weightPercent};
}
export function serializeSourceLensSettingsR770(value){
 return JSON.stringify({schema:SOURCE_LENS_SCHEMA_R770,...validateSourceLensSettingsR770(value)});
}
export function parseSourceLensSettingsR770(raw){
 if(typeof raw!=='string'||raw.length>512)throw TypeError('R770 saved lens refused');
 let value;try{value=JSON.parse(raw)}catch{throw TypeError('R770 saved lens refused')}
 if(value?.schema!==SOURCE_LENS_SCHEMA_R770)throw TypeError('R770 saved lens refused');
 return validateSourceLensSettingsR770(value);
}
const clamp01=x=>Math.max(0,Math.min(1,x));
function normalize(raster,value){
 if(!Number.isFinite(value))throw TypeError('R770 nonfinite source metric refused');
 if(raster.signed){
  const bound=Math.max(Math.abs(raster.minimum),Math.abs(raster.maximum));
  return bound===0?.5:clamp01(.5+.5*value/bound);
 }
 const span=raster.maximum-raster.minimum;
 return span===0?.5:clamp01((value-raster.minimum)/span);
}
function rgb(t){
 const left=t<.5?[23,39,74]:[40,154,167],right=t<.5?[40,154,167]:[246,206,114];
 const f=t<.5?t*2:(t-.5)*2;
 return left.map((v,i)=>Math.round(v+(right[i]-v)*f));
}
/** Recompute from the live immutable input field; saved settings never carry authority or metric bytes. */
export function computeSourceFieldLensR770(field,first='C',second='q',weightPercent=50){
 if(!channelOK(first)||!channelOK(second)||!weightOK(weightPercent))
  throw RangeError('R770 channels or integer weight refused');
 const a=renderAtlasFieldRasterR734(field,first),b=renderAtlasFieldRasterR734(field,second);
 const values=new Float32Array(COUNT),rgba=new Uint8ClampedArray(COUNT*4);
 let minimum=Infinity,maximum=-Infinity;
 for(let i=0;i<COUNT;i++){
  const x=normalize(a,a.values[i]),y=normalize(b,b.values[i]);
  const v=clamp01((x*(100-weightPercent)+y*weightPercent)/100);
  values[i]=v;minimum=Math.min(minimum,v);maximum=Math.max(maximum,v);
  const [r,g,blue]=rgb(v),j=i*4;
  rgba[j]=r;rgba[j+1]=g;rgba[j+2]=blue;rgba[j+3]=255;
 }
 return {schema:ATLAS_FIELD_RASTER_SCHEMA_R734,channel:'r770-'+first+'-'+second+'-'+weightPercent,
  label:'Woven '+ATLAS_FIELD_CHANNELS_R734[first]+' / '+ATLAS_FIELD_CHANNELS_R734[second],
  width:SIDE,height:SIDE,addressCount:COUNT,values,rgba,minimum,maximum,signed:false,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false,historicalRendererParity:false,
  normalization:'PER_CHANNEL_SOURCE_RANGE_THEN_CONVEX_MIX',
  lens:{schema:SOURCE_LENS_SCHEMA_R770,first,second,firstWeightPercent:100-weightPercent,secondWeightPercent:weightPercent},
  boundary:'Two existing source-derived metric channels, independently normalized then convexly mixed. This is a model-space projection, not an empirical field, physical dimension, forecast, donor renderer, or CanonState change.'};
}
