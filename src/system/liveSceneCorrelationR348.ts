import{corpusState}from'../corpusRuntime';
import{calibratedState,type VisualCalibration}from'../visualCalibration';
import{admitScalarChannelR347,contextCompletenessR347,modelMappedWgs84R347,sourceClocksR347}from'../visualTraversalContextR347';
import type{PhysicalObservationR348}from'./unifiedConvergenceR348';

export const OMEGA_LIVE_SCENE_CORRELATION_R348='OMEGA_LIVE_SCENE_CORRELATION_R348';

const text=(v:any)=>typeof v==='string'&&v.trim()?v.trim():'';
const validIso=(v:any)=>text(v)&&Number.isFinite(Date.parse(String(v)));
const sha=(v:any)=>text(v)&&/^[0-9a-f]{64}$/i.test(String(v))?String(v):'';
const sourceName=(v:any)=>text(v?.source)||text(v?.provider)||text(v?.endpoint)||text(v?.id);
const received=(earth:any)=>validIso(earth?.verifiedAt)?new Date(earth.verifiedAt).toISOString():new Date().toISOString();

function observation(input:{id:string;quantity:string;value:any;unit:string;frame:string;eventTime:any;source:any;earth:any;provenance:string[]}):PhysicalObservationR348|null{
 const value=Number(input.value),eventTime=validIso(input.eventTime)?new Date(input.eventTime).toISOString():'',sourceId=sourceName(input.source),evidenceHash=sha(input.earth?.evidenceHash);
 if(!Number.isFinite(value)||!eventTime||!sourceId||!evidenceHash)return null;
 return{id:input.id,sourceId,quantity:input.quantity,value,unit:input.unit,frame:input.frame,eventTime,receivedAt:received(input.earth),provenance:input.provenance,evidenceHash,uncertainty:null};
}

export function compileLiveSceneCorrelationR348(address:number,earth:any,status:any,hybrid:any,calibration:VisualCalibration|null){
 const target=modelMappedWgs84R347(address);
 const weatherSource=earth?.sources?.openMeteo,usgsSource=earth?.sources?.usgs,swpcSource=earth?.sources?.swpc;
 const scalars=[
  admitScalarChannelR347({id:'temperature',label:'Temperature',value:earth?.localConditions?.temperatureC,unit:'°C',source:sourceName(weatherSource),observedAt:earth?.localConditions?.time,truth:'OBSERVED'}),
  admitScalarChannelR347({id:'wind',label:'Wind',value:earth?.localConditions?.windKph,unit:'km/h',source:sourceName(weatherSource),observedAt:earth?.localConditions?.time,truth:'OBSERVED'}),
  admitScalarChannelR347({id:'seismic',label:'Seismic events',value:earth?.seismic?.count,unit:'events/24h',source:sourceName(usgsSource),observedAt:usgsSource?.verifiedAt,truth:'OBSERVED'}),
  admitScalarChannelR347({id:'kp',label:'Kp index',value:earth?.spaceWeather?.kp,unit:'index',source:sourceName(swpcSource),observedAt:earth?.spaceWeather?.observationTime,truth:'OBSERVED'})
 ];
 const clocks=sourceClocksR347(earth);
 const completeness=contextCompletenessR347(scalars,clocks);
 const physicalObservations=[
  observation({id:'earth.temperature',quantity:'AIR_TEMPERATURE',value:earth?.localConditions?.temperatureC,unit:'°C',frame:'WGS84_QUERY_CONTEXT',eventTime:earth?.localConditions?.time,source:weatherSource,earth,provenance:['/api/earth/evidence','Open-Meteo returned observation','R348 source-bound scene adapter']}),
  observation({id:'earth.wind',quantity:'WIND_SPEED',value:earth?.localConditions?.windKph,unit:'km/h',frame:'WGS84_QUERY_CONTEXT',eventTime:earth?.localConditions?.time,source:weatherSource,earth,provenance:['/api/earth/evidence','Open-Meteo returned observation','R348 source-bound scene adapter']}),
  observation({id:'earth.seismic.count24h',quantity:'SEISMIC_EVENT_COUNT',value:earth?.seismic?.count,unit:'events/24h',frame:'WGS84_QUERY_CONTEXT',eventTime:usgsSource?.verifiedAt,source:usgsSource,earth,provenance:['/api/earth/evidence','USGS returned snapshot','R348 source-bound scene adapter']}),
  observation({id:'earth.spaceWeather.kp',quantity:'KP_INDEX',value:earth?.spaceWeather?.kp,unit:'index',frame:'EARTH_SPACE_WEATHER_CONTEXT',eventTime:earth?.spaceWeather?.observationTime,source:swpcSource,earth,provenance:['/api/earth/evidence','NOAA/SWPC returned observation','R348 source-bound scene adapter']})
 ].filter(Boolean)as PhysicalObservationR348[];
 const record=corpusState(address);
 const calibrated=calibration?calibratedState(record,calibration):null;
 const runtimeState=String(status?.state??status?.runtime?.state??'UNBOUND');
 const hybridState=String(hybrid?.state??hybrid?.runtime?.state??'DEVICE_PROOF_REQUIRED');
 return{
  schema:OMEGA_LIVE_SCENE_CORRELATION_R348,
  address,stateId:record.stateId,
  query:{lat:target.lat,lon:target.lon,authority:'QUERY_MAPPING_ONLY',boundary:target.boundary},
  calibration:calibration?{stateCount:calibration.stateCount,channelCount:calibration.channelCount,passed:calibration.passed,boundary:calibration.boundary}:null,
  calibrated,
  scalars,clocks,completeness,
  physicalObservations,
  evidence:{hash:sha(earth?.evidenceHash)||null,verifiedAt:validIso(earth?.verifiedAt)?new Date(earth.verifiedAt).toISOString():null},
  system:{runtimeState,hybridState,hybridPaired:Boolean(hybrid?.paired??hybrid?.bridge?.paired),deviceCount:Number(hybrid?.devices?.length??hybrid?.deviceCount??0)||0,nativeExecutionClaimed:Boolean(hybrid?.nativeExecutionClaimed)},
  truthBoundary:[
   'Address→WGS84 is a query correlation only; it does not make a canonical address a physical Earth coordinate.',
   'Live values enter World only when value, unit, source, source time and SHA-256 evidence binding are present.',
   'Source observation time and snapshot verification time remain separate from model-route time.',
   'Co-location supports inspection and correlation; it does not establish causation.',
   'Percentile calibration is source-relative across the embedded 20,736-state population and does not create physical units.'
  ]
 };
}
