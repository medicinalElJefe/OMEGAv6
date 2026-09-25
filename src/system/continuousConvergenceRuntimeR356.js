export const R356_CCR_SCHEMA='OMEGA_CONTINUOUS_CONVERGENCE_RUNTIME_R356';
export const R356_ATLAS_LEVELS=Object.freeze([12,144,1728,20736,248832]);
export const R356_STAGES=Object.freeze(['OBSERVE','NORMALIZE','RELATE','PARTITION','CARRY','CONSTRUCT','PRUNE','TEST','FALSIFY','PROVE','ADMIT','OBSERVE']);
export const R356_CONTAINMENT=Object.freeze(['EXPLORE','CANDIDATE','BUILT','TESTED','ATTESTED','CANONICAL']);
export const R356_FRAMES=Object.freeze(['GITHUB','CLOUD','SOVEREIGN','OBSERVATION']);
export const R356_LAWS=Object.freeze([
 'ONE_CANONICAL_STATE','SOURCE_GREEN_IS_NOT_PRODUCTION_GREEN','DEPLOYED_IS_NOT_VERIFIED',
 'AUTONOMOUS_GENERATION_IS_NOT_AUTONOMOUS_AUTHORITY','NO_DIRECT_PRODUCTION_MUTATION',
 'EXACT_PARENT_REQUIRED','INVARIANTS_CARRY','SCARS_CARRY','CONTRADICTIONS_ARE_EVIDENCE',
 'FAILED_CANDIDATES_NEVER_DISAPPEAR','RETURN_PROOF_REQUIRED','ROLLBACK_PARENT_RETAINED',
 'ATLAS_LEVELS_ARE_ADDRESS_RESOLUTION_NOT_PHYSICAL_DIMENSIONS'
]);
const upper=v=>String(v??'').trim().toUpperCase();
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const stable=v=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(stable).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}'};
function hash32(v){let h=2166136261,s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
export function fingerprintR356(v){return 'r356-'+hash32(stable(v))}
export function normalizeObservationR356(row={}){
 const frame=upper(row.frame||'OBSERVATION'); if(!R356_FRAMES.includes(frame))throw new Error('R356 unknown observation frame');
 return {frame,identity:String(row.identity||''),canonicalHash:String(row.canonicalHash||''),artifactHash:String(row.artifactHash||''),state:upper(row.state||'UNKNOWN'),capabilities:[...(row.capabilities||[])].map(String).sort(),observedState:row.observedState??null,lastTransition:String(row.lastTransition||''),health:upper(row.health||'UNKNOWN'),timestamp:String(row.timestamp||'')};
}
export function compileRelativeStateR356(observations=[]){
 const rows=observations.map(normalizeObservationR356).sort((a,b)=>a.frame.localeCompare(b.frame));
 const by=Object.fromEntries(rows.map(r=>[r.frame,r]));
 const canonHashes=[...new Set(rows.map(r=>r.canonicalHash).filter(Boolean))];
 const artifactHashes=[...new Set(rows.map(r=>r.artifactHash).filter(Boolean))];
 const divergences=[];
 if(canonHashes.length>1)divergences.push('CANONICAL_HASH_DIVERGENCE');
 if(artifactHashes.length>1)divergences.push('ARTIFACT_HASH_DIVERGENCE');
 for(const f of R356_FRAMES)if(!by[f])divergences.push('MISSING_'+f+'_FRAME');
 return {schema:'OMEGA_R356_RELATIVE_STATE',observations:rows,byFrame:by,canonHashes,artifactHashes,divergences,converged:divergences.length===0,fingerprint:fingerprintR356(rows)};
}
export function continuityScoreR356({continuity=0,futurePlasticity=0,contradiction=0,burden=0,epsilon=1e-9}={}){
 const C=Math.max(0,finite(continuity)),P=Math.max(0,finite(futurePlasticity)),q=Math.max(0,finite(contradiction)),L=Math.max(0,finite(burden));
 const score=(C*P)/(q+L+Math.max(1e-12,finite(epsilon,1e-9)));
 return {continuity:C,futurePlasticity:P,contradiction:q,burden:L,score};
}
export function decideMotionR356(input={}){
 const x=continuityScoreR356(input);
 const authorityConflict=input.authorityConflict===true, invariantFailure=input.invariantFailure===true, proofConflict=input.proofConflict===true;
 const motion=(authorityConflict||invariantFailure||proofConflict)?'ESCALATE':(x.contradiction>0||x.burden>x.continuity)?'TURN':'STAY';
 return {...x,motion};
}
export function mandalaGateR356({shell='EXPLORE',evidence={}}={}){
 const s=upper(shell),i=R356_CONTAINMENT.indexOf(s); if(i<0)throw new Error('R356 unknown containment shell');
 const req={
  EXPLORE:[],CANDIDATE:['exactParent','boundedAuthority'],BUILT:['buildGreen'],TESTED:['testsGreen','falsificationGreen'],
  ATTESTED:['deploymentAttested','observationAttested','returnProof'],CANONICAL:['admissionAuthorized','rollbackParentRetained']
 }[s];
 const missing=req.filter(k=>evidence[k]!==true);
 return {schema:'OMEGA_R356_MANDALA_GATE',shell:s,ordinal:i,requirements:req,missing,allow:missing.length===0};
}
export function scarR356({parent,candidate,intent,transform,failurePoint,contradiction,evidence,recovery}={}){
 const core={parent:String(parent||''),candidate:String(candidate||''),intent:String(intent||''),transform:String(transform||''),failurePoint:String(failurePoint||''),contradiction:String(contradiction||''),evidence:evidence??null,recovery:String(recovery||'')};
 return {schema:'OMEGA_R356_SCAR',...core,fingerprint:fingerprintR356(core)};
}
export function admissionR356({parentSha,candidateSha,relativeState,evidence={},scarLedger=[]}={}){
 const gate=mandalaGateR356({shell:'CANONICAL',evidence});
 const reasons=[...gate.missing];
 if(!/^[0-9a-f]{40}$/i.test(String(parentSha||'')))reasons.push('INVALID_PARENT_SHA');
 if(!/^[0-9a-f]{40}$/i.test(String(candidateSha||'')))reasons.push('INVALID_CANDIDATE_SHA');
 if(!relativeState?.converged)reasons.push('RELATIVE_FRAMES_NOT_CONVERGED');
 if(evidence.directProductionMutation===true)reasons.push('DIRECT_PRODUCTION_MUTATION_FORBIDDEN');
 if(evidence.returnProof!==true)reasons.push('RETURN_PROOF_REQUIRED');
 const allow=reasons.length===0;
 const receipt={schema:'OMEGA_R356_ADMISSION_RECEIPT',parentSha:String(parentSha||''),candidateSha:String(candidateSha||''),allow,reasons:[...new Set(reasons)].sort(),relativeFingerprint:String(relativeState?.fingerprint||''),scarCount:Array.isArray(scarLedger)?scarLedger.length:0,canonicalAdmission:allow,directProductionMutation:false};
 return {...receipt,fingerprint:fingerprintR356(receipt)};
}
export function convergeR356({observations=[],candidate={},scarLedger=[]}={}){
 const relativeState=compileRelativeStateR356(observations);
 const motion=decideMotionR356(candidate.metrics||{});
 const admissionReceipt=admissionR356({parentSha:candidate.parentSha,candidateSha:candidate.candidateSha,relativeState,evidence:candidate.evidence||{},scarLedger});
 return {schema:R356_CCR_SCHEMA,stages:R356_STAGES,relativeState,motion,admissionReceipt,next:admissionReceipt.allow?'ADMIT':motion.motion==='ESCALATE'?'ESCALATE':'ITERATE',productionWriter:'.github/workflows/ci.yml',canonAdmissionAuthority:'R125',continuous:true};
}
