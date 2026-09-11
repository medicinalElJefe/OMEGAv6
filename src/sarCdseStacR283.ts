export const CDSE_STAC_R283='https://stac.dataspace.copernicus.eu/v1' as const;
export const CDSE_SENTINEL1_COLLECTIONS_R283={
 GRD:'sentinel-1-grd',
 SLC:'sentinel-1-slc',
 SLC_WV:'sentinel-1-slc-wv',
 GLOBAL_MOSAICS:'sentinel-1-global-mosaics',
 CCM_SAR:'ccm-sar'
} as const;
export type CdseSarCollectionR283=typeof CDSE_SENTINEL1_COLLECTIONS_R283[keyof typeof CDSE_SENTINEL1_COLLECTIONS_R283];
export interface CdseSarSearchR283{bbox:[number,number,number,number];datetime:string;collection:CdseSarCollectionR283;limit?:number;instrumentMode?:'IW'|'EW'|'SM'|'WV';polarization?:'HH'|'HV'|'VH'|'VV';orbitState?:'ascending'|'descending'}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function normalizeWgs84BboxR283(b:[number,number,number,number]):[number,number,number,number]{let[w,s,e,n]=b;w=clamp(w,-180,180);e=clamp(e,-180,180);s=clamp(s,-90,90);n=clamp(n,-90,90);if(w>e)[w,e]=[e,w];if(s>n)[s,n]=[n,s];return[w,s,e,n]}
export function buildCdseSarSearchR283(x:CdseSarSearchR283){
 const query:Record<string,{eq:string}>={};if(x.instrumentMode)query['sar:instrument_mode']={eq:x.instrumentMode};if(x.polarization)query['sar:polarizations']={eq:x.polarization};if(x.orbitState)query['sat:orbit_state']={eq:x.orbitState};
 return{url:`${CDSE_STAC_R283}/search`,method:'POST' as const,headers:{'content-type':'application/json','accept':'application/geo+json'},body:{collections:[x.collection],bbox:normalizeWgs84BboxR283(x.bbox),datetime:x.datetime,limit:Math.max(1,Math.min(100,x.limit||20)),...(Object.keys(query).length?{query}:{})}};
}
export interface CdseStacAssetR283{key:string;href:string;type?:string;roles:string[];title?:string;authRefs:string[]}
export interface CdseStacProductR283{
 id:string;collection:string;catalogUrl:string;acquiredAt:string|null;platform:string|null;constellation:string|null;instrumentMode:string|null;frequencyBand:string|null;centerFrequencyGHz:number|null;polarizations:string[];orbitState:string|null;relativeOrbit:number|null;incidenceAngle:number|null;geometry:any;bbox:number[]|null;assets:CdseStacAssetR283[];properties:Record<string,unknown>;catalogOnly:true;sourceEvidenceBound:false;nativeDataBound:false;complexDataBound:false;
}
const arr=(v:any)=>Array.isArray(v)?v.map(String):v==null?[]:[String(v)];
const num=(v:any)=>Number.isFinite(Number(v))?Number(v):null;
export function normalizeCdseStacItemR283(item:any):CdseStacProductR283{
 const p=item?.properties||{},assets=Object.entries(item?.assets||{}).map(([key,v]:[string,any])=>({key,href:String(v?.href||''),type:v?.type?String(v.type):undefined,roles:arr(v?.roles),title:v?.title?String(v.title):undefined,authRefs:arr(v?.['auth:refs'])})).filter(x=>x.href);
 const self=(item?.links||[]).find((x:any)=>x?.rel==='self')?.href;
 return{id:String(item?.id||''),collection:String(item?.collection||''),catalogUrl:String(self||`${CDSE_STAC_R283}/collections/${encodeURIComponent(String(item?.collection||''))}/items/${encodeURIComponent(String(item?.id||''))}`),acquiredAt:p.datetime?String(p.datetime):p.start_datetime?String(p.start_datetime):null,platform:p.platform?String(p.platform):null,constellation:p.constellation?String(p.constellation):null,instrumentMode:p['sar:instrument_mode']?String(p['sar:instrument_mode']):null,frequencyBand:p['sar:frequency_band']?String(p['sar:frequency_band']):null,centerFrequencyGHz:num(p['sar:center_frequency']),polarizations:arr(p['sar:polarizations']),orbitState:p['sat:orbit_state']?String(p['sat:orbit_state']):null,relativeOrbit:num(p['sat:relative_orbit']),incidenceAngle:num(p['view:incidence_angle']),geometry:item?.geometry||null,bbox:Array.isArray(item?.bbox)?item.bbox.map(Number):null,assets,properties:{...p},catalogOnly:true,sourceEvidenceBound:false,nativeDataBound:false,complexDataBound:false};
}
export function cdseProductCanBecomeComplexSourceR283(p:CdseStacProductR283){const slc=p.collection===CDSE_SENTINEL1_COLLECTIONS_R283.SLC||p.collection===CDSE_SENTINEL1_COLLECTIONS_R283.SLC_WV;return{candidate:slc&&p.id.length>0,reasons:[...(!slc?['SLC_COLLECTION_REQUIRED']:[]),...(p.id?[]:['PRODUCT_ID_REQUIRED'])],next:['bind exact product/asset bytes','bind SAFE/annotation/calibration/orbit metadata','verify checksums or returned asset identity','decode complex I/Q measurement','construct SarObservationR280 + SarRasterFieldR283','run proof/admission']}}
export function cdseStacTruthBoundaryR283(){return'CDSE STAC results are catalogue discovery/provenance records only. A STAC item or asset URL does not mean product bytes, complex I/Q samples, calibration, orbit metadata, or local execution have been bound or verified.'}
