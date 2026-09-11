import type{SarBandR280,SarPolarizationR280,SarProductLevelR280}from'./sarTruthR280';
export interface SarAcquisitionModeR280{missionId:string;modeId:string;band:SarBandR280;polarizations:SarPolarizationR280[];productLevels:SarProductLevelR280[];resolutionM?:[number,number];swathKm?:number;incidenceDeg?:[number,number];notes:string[]}
export const SAR_MODE_REGISTRY_R280:SarAcquisitionModeR280[]=[
 {missionId:'sentinel-1',modeId:'IW',band:'C',polarizations:['VV','VH','DUAL'],productLevels:['SLC','GRD'],resolutionM:[5,20],swathKm:250,notes:['Nominal mode envelope only; exact product metadata is authoritative.']},
 {missionId:'sentinel-1',modeId:'EW',band:'C',polarizations:['HH','HV','VV','VH','DUAL'],productLevels:['SLC','GRD'],resolutionM:[20,40],swathKm:400,notes:['Nominal mode envelope only; exact product metadata is authoritative.']},
 {missionId:'nisar',modeId:'L-SAR',band:'L',polarizations:['HH','VV','HV','VH','DUAL','QUAD'],productLevels:['SLC','GRD','L2','DERIVED'],swathKm:240,notes:['Registry is capability guidance; live mission product specs govern actual mode/product.']},
 {missionId:'nisar',modeId:'S-SAR',band:'S',polarizations:['HH','VV','HV','VH','DUAL','QUAD'],productLevels:['SLC','GRD','L2','DERIVED'],swathKm:240,notes:['Registry is capability guidance; live mission product specs govern actual mode/product.']}
];
export function findSarModesR280(missionId:string){return SAR_MODE_REGISTRY_R280.filter(x=>x.missionId===missionId)}
