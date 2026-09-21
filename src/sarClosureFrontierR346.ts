import type{SarEstablishmentLayerR342,SarR342LayerId}from'./sarEstablishmentR342';
import type{SarHostClosureReceiptR344,SarClosureValidationR344}from'./sarHostClosureR344';

export const SAR_CLOSURE_FRONTIER_SCHEMA_R346='OMEGA_SAR_CLOSURE_FRONTIER_R346';
export type SarClosureActionKindR346='BIND_SOURCE'|'DECODE'|'CALIBRATE'|'COREGISTER'|'VALIDATE_PHASE'|'TERRAIN'|'UNWRAP'|'LOS'|'CORRECT'|'ADD_GEOMETRY'|'VERIFY';
export type SarClosureFrontierItemR346={
 rank:number;layer:SarR342LayerId;kind:SarClosureActionKindR346;gate:string;reason:string;
 requires:string[];command:string|null;produces:string[];blockedBy:string[];informationGain:number;
 admissible:boolean;physicalAuthority:string;modeSequence:string;
};
const PRIORITY:Record<SarR342LayerId,number>={
 EXACT_ACQUISITION:100,NATIVE_GRD_SAMPLES:95,NATIVE_SLC_IQ:95,COMPATIBLE_PAIR_METADATA:94,SAME_POLARIZATION_ASSET:93,
 SAMPLED_GRID_IDENTITY:92,COMPLEX_CROSS_PRODUCT:90,LOCAL_NORMALIZED_CORRELATION:89,TOPS_SUBPIXEL_COREGISTRATION:100,
 PHYSICALLY_VALID_INTERFEROMETRIC_PHASE:99,RADIOMETRIC_BACKSCATTER:96,TERRAIN_FLATTENED_GAMMA0:84,UNWRAPPED_PHASE:98,
 LOS_DISPLACEMENT:97,CORRECTED_LOS:96,FULL_3D_DEFORMATION:88
};
function kind(id:SarR342LayerId):SarClosureActionKindR346{
 if(id==='EXACT_ACQUISITION'||id==='COMPATIBLE_PAIR_METADATA'||id==='SAME_POLARIZATION_ASSET')return'BIND_SOURCE';
 if(id==='NATIVE_GRD_SAMPLES'||id==='NATIVE_SLC_IQ'||id==='SAMPLED_GRID_IDENTITY'||id==='COMPLEX_CROSS_PRODUCT'||id==='LOCAL_NORMALIZED_CORRELATION')return'DECODE';
 if(id==='RADIOMETRIC_BACKSCATTER')return'CALIBRATE';
 if(id==='TOPS_SUBPIXEL_COREGISTRATION')return'COREGISTER';
 if(id==='PHYSICALLY_VALID_INTERFEROMETRIC_PHASE')return'VALIDATE_PHASE';
 if(id==='TERRAIN_FLATTENED_GAMMA0')return'TERRAIN';
 if(id==='UNWRAPPED_PHASE')return'UNWRAP';
 if(id==='LOS_DISPLACEMENT')return'LOS';
 if(id==='CORRECTED_LOS')return'CORRECT';
 if(id==='FULL_3D_DEFORMATION')return'ADD_GEOMETRY';
 return'VERIFY';
}
function commandFor(id:SarR342LayerId,r?:SarHostClosureReceiptR344|null){
 if(id==='TOPS_SUBPIXEL_COREGISTRATION')return'python scripts/sar_r344_host_closure.py --execute --coreg-proof <coreg.json> ...';
 if(id==='RADIOMETRIC_BACKSCATTER')return'Bind exact calibration/noise XML or R344 beta0/sigma0/gamma0 artifacts';
 if(id==='TERRAIN_FLATTENED_GAMMA0')return'Run DEM/radar-geometry scattering-area normalization and bind terrainFlattenedGamma0 artifact';
 if(id==='UNWRAPPED_PHASE')return'Run masked phase unwrapping; emit unwrap raster, mask, closure RMS and residue proof';
 if(id==='LOS_DISPLACEMENT')return'Bind wavelength + explicit sign convention; materialize metric LOS artifact';
 if(id==='CORRECTED_LOS')return'Bind atmospheric + ETAD/system correction artifacts and corrected LOS';
 if(id==='FULL_3D_DEFORMATION')return'Add >=3 rank-independent LOS/GNSS constraints and run weighted d=G·u inversion';
 if(id==='PHYSICALLY_VALID_INTERFEROMETRIC_PHASE')return'Bind full-resolution coreg receipt + interferogram/coherence artifacts';
 return r?'Use bound R344 receipt evidence to satisfy this gate':'Satisfy the exact R342 evidence gate';
}
export function buildSarClosureFrontierR346(layers:SarEstablishmentLayerR342[],validation?:SarClosureValidationR344|null,receipt?:SarHostClosureReceiptR344|null){
 const established=new Set(layers.filter(x=>x.state==='ESTABLISHED'||x.state==='COMPUTATIONALLY_ESTABLISHED').map(x=>x.id));
 const held=layers.filter(x=>x.state==='HELD'||x.state==='NOT_DERIVABLE_SINGLE_LOS'||x.state==='COMPUTABLE');
 const out:SarClosureFrontierItemR346[]=held.map(layer=>{
  const blockedBy=layer.requires.filter(req=>!Array.from(established).some(id=>req.toLowerCase().includes(id.toLowerCase().replaceAll('_',' '))));
  const admissible=layer.id==='FULL_3D_DEFORMATION'?Number(receipt?.independentLos?.length||0)>=3||layer.state==='COMPUTABLE':true;
  const informationGain=(PRIORITY[layer.id]||50)+(layer.id==='TOPS_SUBPIXEL_COREGISTRATION'||layer.id==='UNWRAPPED_PHASE'?20:0)-(blockedBy.length*2);
  return{rank:0,layer:layer.id,kind:kind(layer.id),gate:layer.gate,reason:layer.next,requires:layer.requires,command:commandFor(layer.id,receipt),produces:[layer.id],blockedBy,informationGain,admissible,physicalAuthority:layer.physicalAuthority,modeSequence:'PRUNE → TRANSLATE → PROVE → INVARIANT_CARRY → SCAR_CARRY → RECONTEXTUALIZE'};
 }).sort((a,b)=>Number(b.admissible)-Number(a.admissible)||b.informationGain-a.informationGain||a.layer.localeCompare(b.layer));
 out.forEach((x,i)=>x.rank=i+1);
 return{schema:SAR_CLOSURE_FRONTIER_SCHEMA_R346,state:out.length?'OPEN_FRONTIER':'PHYSICAL_CLOSURE_COMPLETE',next:out.find(x=>x.admissible)??null,items:out,validationScars:validation?.scars||[],truthBoundary:'R346 chooses the next admissible evidence-producing action. It may order work, but it cannot manufacture Sentinel-1 measurements, DEM/orbit/correction evidence, unwrap closure, or independent viewing geometry.'};
}
