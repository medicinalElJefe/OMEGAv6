// R734: source-computed atlas channels and successor gradients, never observed physical fields.
export const ATLAS_FIELD_RASTER_SCHEMA_R734='OMEGA_SOURCE_ATLAS_FIELD_RASTER_R734_V1';
export const ATLAS_FIELD_CHANNELS_R734=Object.freeze({
 C:'Continuity CΩ',Phi:'Plasticity Φ',q:'Contradiction q',Lambda:'Burden Λ',
 scar:'Scar',evidence:'Evidence',rsc:'Relational continuity',geometry:'Geometry',
 motion:'Motion relativity',symmetry:'Symmetry',forecast:'Forecast model score',
 continuityGate:'Continuity gate',motionDrive:'Successor motion drive',
 velocity:'Source-route velocity',acceleration:'Source-route acceleration',
 successorDeltaC:'Successor continuity difference ΔC'
});
const COUNT=20736,SIDE=144;
const interpolate=(a,b,t)=>Math.round(a+(b-a)*t);
function color(value,low,high,signed){
 if(signed){
  const bound=Math.max(Math.abs(low),Math.abs(high));
  const t=bound===0?0:value/bound;
  const start=[222,222,210],end=t<0?[49,95,175]:[226,135,62];
  return [0,1,2].map(i=>interpolate(start[i],end[i],Math.abs(t)));
 }
 const t=high===low?0.5:(value-low)/(high-low);
 const a=t<0.5?[18,35,66]:[40,146,158],b=t<0.5?[40,146,158]:[239,202,107],u=t<0.5?t*2:(t-0.5)*2;
 return [0,1,2].map(i=>interpolate(a[i],b[i],u));
}
export function renderAtlasFieldRasterR734(field,channel='C'){
 if(!field||field.count!==COUNT||!(field.routeNext instanceof Uint32Array)||field.routeNext.length!==COUNT||
    !Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,channel))
  throw Error('R734 complete source field or channel refused');
 const sourceKey=channel==='successorDeltaC'?'C':channel;
 const source=field[sourceKey];
 if(!(source instanceof Float32Array)||source.length!==COUNT)
  throw Error('R734 source channel missing or incomplete');
 const values=new Float32Array(COUNT);
 let minimum=Infinity,maximum=-Infinity;
 for(let address=0;address<COUNT;address++){
  const next=field.routeNext[address];
  if(!Number.isSafeInteger(next)||next<0||next>=COUNT)
   throw Error('R734 invalid source successor at '+address);
  const current=source[address],successor=source[next];
  if(!Number.isFinite(current)||!Number.isFinite(successor))
   throw Error('R734 nonfinite source metric at '+address);
  const value=channel==='successorDeltaC'?successor-current:current;
  values[address]=value;minimum=Math.min(minimum,value);maximum=Math.max(maximum,value);
 }
 const signed=channel==='velocity'||channel==='acceleration'||channel==='successorDeltaC';
 const rgba=new Uint8ClampedArray(COUNT*4);
 for(let i=0;i<COUNT;i++){
  const rgb=color(values[i],minimum,maximum,signed),j=i*4;
  rgba[j]=rgb[0];rgba[j+1]=rgb[1];rgba[j+2]=rgb[2];rgba[j+3]=255;
 }
 return {schema:ATLAS_FIELD_RASTER_SCHEMA_R734,channel,label:ATLAS_FIELD_CHANNELS_R734[channel],
  width:SIDE,height:SIDE,addressCount:COUNT,values,rgba,minimum,maximum,
  signed,sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  normalization:signed?'ZERO_CENTERED_MAX_ABSOLUTE':'OBSERVED_SOURCE_MIN_MAX',
  boundary:'Computed source-corpus metric or one declared successor difference, address ordered. No measured physical field, time derivative, empirical forecast, historical donor parity or CanonState admission.'};
}