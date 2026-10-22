import type{SarObservationR280}from'./sarTruthR280';

export interface CubeAddressR280{lon:number;lat:number;time:string;band:string;polarization:string;productLevel:string;truth:string;sourceId:string}
export interface CubeTileR280{address:CubeAddressR280;observationId:string;nativeResolutionM?:[number,number];crs:string;surfaceClass:string;chunkRef:string;loaded:boolean}

export function cubeAddressR280(obs:SarObservationR280,lon:number,lat:number):CubeAddressR280{return{lon,lat,time:obs.provenance.acquiredAt,band:obs.band,polarization:obs.polarization,productLevel:obs.productLevel,truth:obs.truth,sourceId:obs.provenance.sourceId}}
export function cubeTileR280(obs:SarObservationR280,lon:number,lat:number,chunkRef:string):CubeTileR280{return{address:cubeAddressR280(obs,lon,lat),observationId:obs.id,nativeResolutionM:obs.geometry.nativeResolutionM,crs:obs.geometry.crs,surfaceClass:obs.geometry.surfaceClass,chunkRef,loaded:false}}
export function cubeCompatibilityR280(a:CubeTileR280,b:CubeTileR280){const warnings:string[]=[];if(a.crs!==b.crs)warnings.push('CRS_MISMATCH');if(a.surfaceClass!==b.surfaceClass)warnings.push('MEASUREMENT_SURFACE_MISMATCH');if(a.address.productLevel!==b.address.productLevel)warnings.push('PRODUCT_LEVEL_DIFFERS');if(a.address.truth!==b.address.truth)warnings.push('TRUTH_CLASS_DIFFERS');if(a.nativeResolutionM?.join('x')!==b.nativeResolutionM?.join('x'))warnings.push('NATIVE_RESOLUTION_DIFFERS');return{directlyComparable:warnings.length===0,warnings}}
export function dataCubeTruthBoundaryR280(){return{lazy:true,rule:'Common cube addressing never overwrites native geometry, source identity, resolution, product level, truth class or measurement-surface semantics.'}}
