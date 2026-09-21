import{invertIndependentLosTo3DR342,type LosObservationR342}from'./sarEstablishmentR342';
import type{SarRasterFieldR283}from'./sarRasterR283';

export const SAR_HOST_CLOSURE_SCHEMA_R344='OMEGA_SAR_HOST_CLOSURE_R344';
export const SHA256_RE_R344=/^[a-f0-9]{64}$/i;

export type SarArtifactRefR344={path:string;sha256:string;bytes?:number;format?:string;units?:string};
export type SarSourceRefR344={productId:string;assetKey:string;sha256:string;polarization:string;productLevel:'SLC';acquiredAt:string};
export type SarClosurePreviewR344={
 width:number;height:number;validMask:number[];
 beta0?:number[];sigma0?:number[];gamma0?:number[];terrainFlattenedGamma0?:number[];
 interferogramPhaseRad?:number[];correctedInterferometricPhaseRad?:number[];coherence?:number[];
 unwrappedPhaseRad?:number[];losDisplacementM?:number[];correctedLosDisplacementM?:number[];
 deformationEastM?:number[];deformationNorthM?:number[];deformationUpM?:number[];
 sourceArtifactSha256:{[field:string]:string};
};

export type SarHostClosureReceiptR344={
 schema:string;revision:string;createdAt:string;processor:string;processorVersion:string;
 master:SarSourceRefR344;slave:SarSourceRefR344;
 annotations:{master:string[];slave:string[]};
 orbit:{master:SarArtifactRefR344;slave:SarArtifactRefR344;precise:boolean};
 dem?:SarArtifactRefR344;
 coregistration:{fullResolution:boolean;burstGeometryBound:boolean;method:string;resampler:string;azimuthResidualSamples:number;rangeResidualSamples:number;rangeThresholdSamples:number;proofArtifact:SarArtifactRefR344};
 radiometry?:{beta0?:SarArtifactRefR344;sigma0?:SarArtifactRefR344;gamma0?:SarArtifactRefR344;terrainFlattenedGamma0?:SarArtifactRefR344};
 interferogram?:SarArtifactRefR344;coherence?:SarArtifactRefR344;
 geometricPhase?:{flatEarthRemoved:boolean;topographicRemoved:boolean;correctedInterferogram:SarArtifactRefR344;proofArtifact:SarArtifactRefR344};
 unwrap?:{artifact:SarArtifactRefR344;mask:SarArtifactRefR344;closureRmsRad:number;residueCount:number;largestComponentPixels:number;validPixels:number};
 corrections?:{atmosphere?:SarArtifactRefR344;etad?:SarArtifactRefR344;other?:SarArtifactRefR344};
 los?:{artifact:SarArtifactRefR344;wavelengthM:number;signConvention:string;sign:1|-1;validPixels:number};
 correctedLos?:SarArtifactRefR344;
 independentLos?:Array<LosObservationR342&{source:string;artifactSha256:string}>;
 deformation3d?:{east:SarArtifactRefR344;north:SarArtifactRefR344;up:SarArtifactRefR344;rank:number;conditionNumber:number;weightedRmsResidualM:number};
 preview?:SarClosurePreviewR344;
 truthBoundary:string;
};

export type SarClosureGateR344={id:string;state:'ESTABLISHED'|'HELD';reason:string;requires:string[]};
export type SarClosureValidationR344={
 ok:boolean;schema:string;gates:SarClosureGateR344[];scars:string[];established:string[];threeD?:ReturnType<typeof invertIndependentLosTo3DR342>;truthBoundary:string;
};

const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const hash=(v:unknown)=>typeof v==='string'&&SHA256_RE_R344.test(v);
const pol=(v:unknown)=>/^(VV|VH|HH|HV)$/i.test(String(v||''));
const artifact=(a:unknown)=>{const x=a as SarArtifactRefR344|undefined;return!!x&&typeof x.path==='string'&&x.path.length>0&&hash(x.sha256)&&(!finite(x.bytes)||Number(x.bytes)>=0)};
const source=(s:unknown)=>{const x=s as SarSourceRefR344|undefined;return!!x&&typeof x.productId==='string'&&x.productId.length>0&&typeof x.assetKey==='string'&&x.assetKey.length>0&&hash(x.sha256)&&pol(x.polarization)&&x.productLevel==='SLC'&&Number.isFinite(Date.parse(x.acquiredAt))};
const gate=(id:string,ok:boolean,reason:string,requires:string[]):SarClosureGateR344=>({id,state:ok?'ESTABLISHED':'HELD',reason:ok?'PROVED':reason,requires:ok?[]:requires});

function matrixRank3(rows:LosObservationR342[]){
 const a=rows.map(r=>r.look.map(Number)).filter(r=>r.length===3&&r.every(finite));if(a.length<3)return 0;
 const m=a.map(r=>[...r]),cols=3;let rank=0,row=0;
 for(let col=0;col<cols&&row<m.length;col++){let p=row;for(let i=row+1;i<m.length;i++)if(Math.abs(m[i][col])>Math.abs(m[p][col]))p=i;if(Math.abs(m[p][col])<1e-10)continue;[m[row],m[p]]=[m[p],m[row]];const q=m[row][col];for(let j=col;j<cols;j++)m[row][j]/=q;for(let i=0;i<m.length;i++)if(i!==row){const f=m[i][col];for(let j=col;j<cols;j++)m[i][j]-=f*m[row][j]}rank++;row++}
 return rank;
}

export function validateSarHostClosureR344(r:SarHostClosureReceiptR344):SarClosureValidationR344{
 const gates:SarClosureGateR344[]=[];
 const schemaOk=r?.schema===SAR_HOST_CLOSURE_SCHEMA_R344&&typeof r.revision==='string'&&!!r.revision;
 gates.push(gate('RECEIPT_SCHEMA',schemaOk,'R344_RECEIPT_SCHEMA_REQUIRED',['OMEGA_SAR_HOST_CLOSURE_R344','revision']));
 const sourcesOk=source(r?.master)&&source(r?.slave)&&r.master.productId!==r.slave.productId&&r.master.polarization.toUpperCase()===r.slave.polarization.toUpperCase();
 gates.push(gate('EXACT_PAIR_SOURCES',sourcesOk,'EXACT_DISTINCT_SAME_POLARIZATION_SOURCES_REQUIRED',['master/slave SLC product IDs','asset keys','full SHA-256','same polarization','acquisition times']));
 const annOk=Array.isArray(r?.annotations?.master)&&r.annotations.master.length>0&&r.annotations.master.every(hash)&&Array.isArray(r?.annotations?.slave)&&r.annotations.slave.length>0&&r.annotations.slave.every(hash);
 gates.push(gate('ANNOTATION_HASHES',annOk,'ANNOTATION_HASH_PROVENANCE_REQUIRED',['master annotation hashes','slave annotation hashes']));
 const orbitOk=artifact(r?.orbit?.master)&&artifact(r?.orbit?.slave);
 gates.push(gate('ORBIT_EVIDENCE',orbitOk,'ORBIT_EVIDENCE_REQUIRED',['master orbit artifact','slave orbit artifact']));
 const rad=r?.radiometry,radOk=annOk&&!!rad&&[rad.beta0,rad.sigma0,rad.gamma0].some(artifact);
 gates.push(gate('RADIOMETRIC_BACKSCATTER',radOk,'CALIBRATED_BACKSCATTER_ARTIFACT_REQUIRED',['annotation hashes','beta0 and/or sigma0 and/or gamma0 full-resolution artifact']));
 const rtcOk=radOk&&artifact(rad?.terrainFlattenedGamma0)&&artifact(r?.dem);
 gates.push(gate('TERRAIN_RADIOMETRY',rtcOk,'DEM_TERRAIN_RADIOMETRY_ARTIFACT_REQUIRED',['calibrated backscatter','DEM artifact','terrain-flattened gamma0 artifact']));
 const c=r?.coregistration,coregOk=!!c&&c.fullResolution===true&&c.burstGeometryBound===true&&finite(c.azimuthResidualSamples)&&Math.abs(c.azimuthResidualSamples)<=.001&&finite(c.rangeResidualSamples)&&finite(c.rangeThresholdSamples)&&c.rangeThresholdSamples>0&&Math.abs(c.rangeResidualSamples)<=c.rangeThresholdSamples&&artifact(c.proofArtifact);
 gates.push(gate('TOPS_SUBPIXEL_COREGISTRATION',coregOk,'SUBPIXEL_COREGISTRATION_NOT_PROVEN',['full-resolution processor','burst geometry','azimuth residual <=0.001 sample','range residual <= declared threshold','proof artifact hash']));
 const ifgOk=coregOk&&artifact(r?.interferogram)&&artifact(r?.coherence);
 gates.push(gate('PHYSICAL_INTERFEROGRAM',ifgOk,'INTERFEROGRAM_ARTIFACTS_REQUIRED',['proved TOPS coregistration','interferogram artifact','coherence artifact']));
 const topoOk=ifgOk&&r?.geometricPhase?.flatEarthRemoved===true&&r?.geometricPhase?.topographicRemoved===true&&artifact(r?.geometricPhase?.correctedInterferogram)&&artifact(r?.geometricPhase?.proofArtifact)&&artifact(r?.dem);
 gates.push(gate('GEOMETRIC_PHASE_REMOVAL',topoOk,'DEM_TOPOGRAPHIC_PHASE_PROOF_REQUIRED',['DEM artifact','flat-earth removal','topographic phase removal','corrected interferogram artifact','phase-removal proof artifact']));
 const u=r?.unwrap,unwrapOk=topoOk&&!!u&&artifact(u.artifact)&&artifact(u.mask)&&finite(u.closureRmsRad)&&u.closureRmsRad<=.25&&finite(u.validPixels)&&u.validPixels>0&&finite(u.largestComponentPixels)&&u.largestComponentPixels>0;
 gates.push(gate('UNWRAP_CLOSURE',unwrapOk,'UNWRAP_CLOSURE_NOT_PROVEN',['unwrapped artifact','mask artifact','closure RMS <=0.25 rad','valid connected component']));
 const l=r?.los,losOk=unwrapOk&&!!l&&artifact(l.artifact)&&finite(l.wavelengthM)&&l.wavelengthM>0&&(l.sign===1||l.sign===-1)&&typeof l.signConvention==='string'&&l.signConvention.length>0&&finite(l.validPixels)&&l.validPixels>0;
 gates.push(gate('METRIC_LOS',losOk,'LOS_UNIT_SIGN_CHAIN_REQUIRED',['unwrapped phase','wavelength','explicit sign convention','metric LOS artifact']));
 const correctionsPresent=!!(r?.corrections?.atmosphere||r?.corrections?.etad||r?.corrections?.other),correctionsOk=losOk&&correctionsPresent&&artifact(r?.correctedLos)&&(!r.corrections?.atmosphere||artifact(r.corrections.atmosphere))&&(!r.corrections?.etad||artifact(r.corrections.etad))&&(!r.corrections?.other||artifact(r.corrections.other));
 gates.push(gate('CORRECTION_LEDGER',correctionsOk,'ATMOSPHERE_ETAD_CORRECTION_REQUIRED',['metric LOS','atmosphere and/or ETAD/system correction artifact hashes','corrected LOS artifact']));
 const independent=(r?.independentLos||[]).filter(x=>finite(x.losM)&&x.look?.length===3&&x.look.every(finite)&&hash(x.artifactSha256)),rank=matrixRank3(independent),threeD=rank>=3?invertIndependentLosTo3DR342(independent):undefined,threeDOk=rank>=3&&threeD?.ok===true&&!!r?.deformation3d&&r.deformation3d.rank>=3&&finite(r.deformation3d.conditionNumber)&&r.deformation3d.conditionNumber>0&&artifact(r.deformation3d.east)&&artifact(r.deformation3d.north)&&artifact(r.deformation3d.up);
 gates.push(gate('FULL_3D_DEFORMATION',threeDOk,'ADDITIONAL_VIEWING_GEOMETRY_REQUIRED',['>=3 rank-independent look vectors or equivalent constraints','3-D inversion artifacts','rank/conditioning/residual proof']));
 const scars=gates.filter(g=>g.state==='HELD').map(g=>g.reason),established=gates.filter(g=>g.state==='ESTABLISHED').map(g=>g.id);
 return{ok:schemaOk&&sourcesOk&&annOk&&orbitOk&&coregOk,gates,scars:[...new Set(scars)],established,threeD,truthBoundary:'R344 validates a full-resolution host processing receipt; it does not infer missing artifacts from a successful process exit. Each promoted physical layer requires hashes plus its own numerical/provenance gate. Full 3-D remains held unless the look-geometry matrix has rank 3 and the returned inversion artifacts are independently identified.'};
}

function previewArrayValid(a:number[]|undefined,n:number){return!!a&&a.length===n&&a.some(Number.isFinite)}
export function applySarHostClosurePreviewR344(base:SarRasterFieldR283,r:SarHostClosureReceiptR344,v=validateSarHostClosureR344(r)):SarRasterFieldR283{
 const p=r.preview;if(!p||!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<1||p.height<1||p.width*p.height!==p.validMask?.length)return base;
 const n=p.width*p.height,state=(id:string)=>v.gates.find(g=>g.id===id)?.state==='ESTABLISHED',linked=(field:string,expectedHash?:string)=>hash(p.sourceArtifactSha256?.[field])&&!!expectedHash&&p.sourceArtifactSha256[field].toLowerCase()===expectedHash.toLowerCase();
 const out:SarRasterFieldR283={...base,width:p.width,height:p.height,validMask:p.validMask.map(x=>Number(x)>0?1:0),native:false,sourceId:base.sourceId+'::R344_PREVIEW'};
 if(state('RADIOMETRIC_BACKSCATTER')){if(previewArrayValid(p.beta0,n)&&linked('beta0',r.radiometry?.beta0?.sha256))out.beta0=p.beta0;if(previewArrayValid(p.sigma0,n)&&linked('sigma0',r.radiometry?.sigma0?.sha256))out.sigma0=p.sigma0;if(previewArrayValid(p.gamma0,n)&&linked('gamma0',r.radiometry?.gamma0?.sha256))out.gamma0=p.gamma0}
 if(state('TERRAIN_RADIOMETRY')&&previewArrayValid(p.terrainFlattenedGamma0,n)&&linked('terrainFlattenedGamma0',r.radiometry?.terrainFlattenedGamma0?.sha256))out.terrainFlattenedGamma0=p.terrainFlattenedGamma0;
 if(state('PHYSICAL_INTERFEROGRAM')){if(previewArrayValid(p.interferogramPhaseRad,n)&&linked('interferogramPhaseRad',r.interferogram?.sha256))out.interferogramPhaseRad=p.interferogramPhaseRad;if(previewArrayValid(p.coherence,n)&&linked('coherence',r.coherence?.sha256))out.coherence=p.coherence}
 if(state('GEOMETRIC_PHASE_REMOVAL')&&previewArrayValid(p.correctedInterferometricPhaseRad,n)&&linked('correctedInterferometricPhaseRad',r.geometricPhase?.correctedInterferogram.sha256))out.correctedInterferometricPhaseRad=p.correctedInterferometricPhaseRad;
 if(state('UNWRAP_CLOSURE')&&previewArrayValid(p.unwrappedPhaseRad,n)&&linked('unwrappedPhaseRad',r.unwrap?.artifact.sha256))out.unwrappedPhaseRad=p.unwrappedPhaseRad;
 if(state('METRIC_LOS')&&previewArrayValid(p.losDisplacementM,n)&&linked('losDisplacementM',r.los?.artifact.sha256))out.losDisplacementM=p.losDisplacementM;
 if(state('CORRECTION_LEDGER')&&previewArrayValid(p.correctedLosDisplacementM,n)&&linked('correctedLosDisplacementM',r.correctedLos?.sha256))out.correctedLosDisplacementM=p.correctedLosDisplacementM;
 if(state('FULL_3D_DEFORMATION')){if(previewArrayValid(p.deformationEastM,n)&&linked('deformationEastM',r.deformation3d?.east.sha256))out.deformationEastM=p.deformationEastM;if(previewArrayValid(p.deformationNorthM,n)&&linked('deformationNorthM',r.deformation3d?.north.sha256))out.deformationNorthM=p.deformationNorthM;if(previewArrayValid(p.deformationUpM,n)&&linked('deformationUpM',r.deformation3d?.up.sha256))out.deformationUpM=p.deformationUpM}
 out.physicalClosureR343={schema:SAR_HOST_CLOSURE_SCHEMA_R344,coregistrationBound:state('TOPS_SUBPIXEL_COREGISTRATION'),interferometricPhaseValidated:state('PHYSICAL_INTERFEROGRAM'),calibrationBound:state('RADIOMETRIC_BACKSCATTER')&&(!!out.beta0||!!out.sigma0||!!out.gamma0),terrainFlattenedBound:state('TERRAIN_RADIOMETRY')&&!!out.terrainFlattenedGamma0,unwrappedPhaseBound:state('UNWRAP_CLOSURE')&&!!out.unwrappedPhaseRad,correctionLedgerBound:state('CORRECTION_LEDGER'),losDisplacementBound:state('METRIC_LOS')&&!!out.losDisplacementM,correctedLosBound:state('CORRECTION_LEDGER')&&!!out.correctedLosDisplacementM,proof:v.established,scars:v.scars};
 return out;
}

export function sarClosurePromotionStateR344(v:SarClosureValidationR344){
 const state=(id:string)=>v.gates.find(g=>g.id===id)?.state==='ESTABLISHED';
 return{
  pairSourcesBound:state('EXACT_PAIR_SOURCES'),
  annotationsBound:state('ANNOTATION_HASHES'),
  radiometricBackscatterBound:state('RADIOMETRIC_BACKSCATTER'),
  terrainRadiometryBound:state('TERRAIN_RADIOMETRY'),
  orbitBound:state('ORBIT_EVIDENCE'),
  subpixelCoregistrationBound:state('TOPS_SUBPIXEL_COREGISTRATION'),
  interferometricPhaseValidated:state('PHYSICAL_INTERFEROGRAM'),
  topographyHandled:state('GEOMETRIC_PHASE_REMOVAL'),
  unwrappedPhaseBound:state('UNWRAP_CLOSURE'),
  losDisplacementBound:state('METRIC_LOS'),
  atmosphereEtadCorrectionBound:state('CORRECTION_LEDGER'),
  full3dDeformationBound:state('FULL_3D_DEFORMATION')
 };
}

export const R344_MODE_BOUNDARY='Dewey calculus routes evidence and retains scars; the host receipt remains subordinate to exact Sentinel-1/DEM/orbit/correction artifact evidence and cannot self-certify a missing physical stage.';
