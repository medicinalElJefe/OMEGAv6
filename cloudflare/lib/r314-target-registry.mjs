import {repairPathPolicyR314} from '../../src/system/autonomousRepairPolicyR314.js';

export const R314_CLOUD_TARGET_REGISTRY_SCHEMA='OMEGA_CLOUD_R314_TARGET_REGISTRY';

const upper=value=>String(value??'').trim().toUpperCase();
const finite=value=>Number.isFinite(Number(value))?Number(value):null;

export function classifyRepairTargetR314(residual={},accuracyPolicy={}){
  const reasons=[];
  const severity=upper(residual.severity||'LOW');
  const mode=upper(residual.mode||'OBSERVE_ONLY');
  const confidence=finite(residual.confidence);
  const minConfidence=finite(accuracyPolicy?.autoRepairMinConfidence)??0.92;
  if(['HIGH','CRITICAL'].includes(severity))reasons.push('HIGH_OR_CRITICAL_RESIDUAL_REQUIRES_REVIEW');
  if(mode!=='AUTO_REPAIR')reasons.push('RESIDUAL_NOT_AUTHORIZED_FOR_AUTO_REPAIR');
  if(residual.reproducible===false)reasons.push('RESIDUAL_NOT_REPRODUCIBLE');
  if(confidence!==null&&confidence<minConfidence)reasons.push('CONFIDENCE_BELOW_POLICY');
  const paths=[];
  for(const candidate of Array.isArray(residual.affected)?residual.affected:[]){
    const policy=repairPathPolicyR314(candidate);
    if(policy.allowed&&!paths.includes(policy.path))paths.push(policy.path);
  }
  if(!paths.length)reasons.push('NO_R314_ALLOWED_PRODUCT_SOURCE_TARGET');
  return {
    schema:R314_CLOUD_TARGET_REGISTRY_SCHEMA,
    residualId:String(residual.id||''),
    targetable:reasons.length===0,
    reasons,
    paths:paths.slice(0,2),
    severity,
    mode,
    confidence,
    minConfidence,
    canonicalAdmission:false,
  };
}

export function selectRepairTargetR314(residualState={}){
  const policy=residualState.accuracyPolicy||{};
  for(const residual of Array.isArray(residualState.residuals)?residualState.residuals:[]){
    const classification=classifyRepairTargetR314(residual,policy);
    if(classification.targetable)return{...classification,residual};
  }
  return {
    schema:R314_CLOUD_TARGET_REGISTRY_SCHEMA,
    residualId:null,
    targetable:false,
    reasons:['NO_BOUNDED_AUTO_REPAIR_TARGET'],
    paths:[],
    canonicalAdmission:false,
  };
}
