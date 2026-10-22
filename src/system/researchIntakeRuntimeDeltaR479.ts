export const R479_RESEARCH_INTAKE_SCHEMA='OMEGA_RESEARCH_INTAKE_RUNTIME_DELTA_R479' as const;
export const R479_RESEARCH_INTAKE_REVISION='R479' as const;

const finite=(v:number)=>Number.isFinite(v);

export type R479LedgerKind='EVENT'|'SCAR'|'CANDIDATE'|'PROOF'|'METRIC';
export type R479LedgerRecord={kind:R479LedgerKind;recordId:string;parentRecordId:string|null;payloadHash:string;authorityRef:string;canonicalAdmission:false};
export function validateLedgerRecordR479(r:R479LedgerRecord){return Boolean(r.recordId.trim()&&r.payloadHash.trim()&&r.authorityRef.trim()&&r.canonicalAdmission===false)}
export function ledgerKindsR479(records:R479LedgerRecord[]){return [...new Set(records.map(r=>r.kind))].sort()}

export type R479ApprovalBinding={owningAgentId:string;resolvedToolId:string;toolSchemaHash:string;normalizedArgumentsHash:string;parentStateHash:string;approvalReceiptHash:string;expiresAt:string};
export function approvalMatchesR479(a:R479ApprovalBinding,call:{agentId:string;toolId:string;toolSchemaHash:string;normalizedArgumentsHash:string;parentStateHash:string},nowMs=Date.now()){
 return a.owningAgentId===call.agentId&&a.resolvedToolId===call.toolId&&a.toolSchemaHash===call.toolSchemaHash&&a.normalizedArgumentsHash===call.normalizedArgumentsHash&&a.parentStateHash===call.parentStateHash&&Number.isFinite(Date.parse(a.expiresAt))&&Date.parse(a.expiresAt)>nowMs;
}

export type R479EnergyCapacityEnvelope={nameplateWatts:number;firmDeliverableWatts:number;coolingWatts:number;reserveFraction:number;measuredAt:string};
export function usablePowerR479(e:R479EnergyCapacityEnvelope){
 if([e.nameplateWatts,e.firmDeliverableWatts,e.coolingWatts,e.reserveFraction].some(v=>!finite(v))||e.reserveFraction<0||e.reserveFraction>=1)return null;
 return Math.max(0,Math.min(e.nameplateWatts,e.firmDeliverableWatts,e.coolingWatts)*(1-e.reserveFraction));
}

export type R479SymmetryOperator={operatorId:string;parameter:number};
export function symmetryInteractionR479(q00:number,q10:number,q01:number,q11:number){
 if([q00,q10,q01,q11].some(v=>!finite(v)))throw new Error('R479 symmetry interaction requires finite values');
 return q11-q10-q01+q00;
}

export type R479OpticalProvenance='RAW_OBSERVATION'|'OPTICALLY_TRANSFORMED'|'DIGITALLY_PROCESSED'|'NEURAL_ENHANCED';
export type R479PixelFieldProvenance={sourceHash:string;opticalTransferHash:string|null;polarizationStateHash:string|null;digitalTransformHash:string|null;class:R479OpticalProvenance};
export function validatePixelFieldProvenanceR479(p:R479PixelFieldProvenance){
 if(!p.sourceHash.trim())return false;
 if(p.class==='RAW_OBSERVATION')return p.opticalTransferHash===null&&p.digitalTransformHash===null;
 if(p.class==='OPTICALLY_TRANSFORMED')return Boolean(p.opticalTransferHash);
 if(p.class==='DIGITALLY_PROCESSED'||p.class==='NEURAL_ENHANCED')return Boolean(p.digitalTransformHash);
 return false;
}

export type R479MetaAtomCandidate={thetaDeg:number;lengthNm:number;widthNm:number;heightNm:number;refractiveIndex:number;phaseRad:number;amplitude:number;dop:number;efficiency:number;bandwidthNm:number;fabricationPassProbability:number};
export function validateMetaAtomCandidateR479(c:R479MetaAtomCandidate){
 return [c.thetaDeg,c.lengthNm,c.widthNm,c.heightNm,c.refractiveIndex,c.phaseRad,c.amplitude,c.dop,c.efficiency,c.bandwidthNm,c.fabricationPassProbability].every(finite)&&c.lengthNm>0&&c.widthNm>0&&c.heightNm>0&&c.refractiveIndex>0&&c.amplitude>=0&&c.dop>=0&&c.dop<=1&&c.efficiency>=0&&c.efficiency<=1&&c.bandwidthNm>=0&&c.fabricationPassProbability>=0&&c.fabricationPassProbability<=1;
}

export const R479_LAWS=[
 'QUEUE_SUCCESS_IS_NOT_CANONICAL_ADMISSION',
 'LEDGER_RECORDS_DO_NOT_SELF_ADMIT',
 'APPROVAL_BINDS_AGENT_TOOL_SCHEMA_ARGUMENTS_AND_PARENT',
 'NAMEPLATE_POWER_IS_NOT_FIRM_DELIVERABLE_POWER',
 'OPTICAL_PREPROCESSING_IS_NOT_RAW_OBSERVATION',
 'SYMMETRY_INTERACTION_IS_MEASURED_NOT_ASSUMED',
 'ATLAS_LEVELS_ARE_REPRESENTATIONAL_ADDRESS_RESOLUTIONS_NOT_PHYSICAL_DIMENSIONS',
] as const;

export function buildResearchIntakeDeltaR479(){return{
 schema:R479_RESEARCH_INTAKE_SCHEMA,revision:R479_RESEARCH_INTAKE_REVISION,
 inheritedAuthorities:['R125_CANON_ADMISSION','R210_RELEASE_CONTROLLER','R314_AUTONOMOUS_REPAIR','R317_EXECUTION_CONTINUITY','R467_CANONICAL_DEVELOPMENTAL_LEDGER'] as const,
 atlasResolutions:[12,144,1728,20736,248832] as const,laws:R479_LAWS,
 truthBoundary:'R479 translates verified public research into bounded software schemas and benchmark candidates. It does not claim external queue providers, optical fabrication, measured metasurface performance, electrical capacity, or physical validation unless returned by their existing evidence authorities.',
};}
