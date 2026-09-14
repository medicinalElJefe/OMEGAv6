import {buildDevelopmentResidualGraphR164} from '../../src/system/developmentResidualGraphR164.js';
import {residualVectorR314} from '../../src/system/autonomousConvergenceR314.js';

export const R314_CLOUD_RESIDUAL_ADAPTER_SCHEMA='OMEGA_CLOUD_R314_RESIDUAL_ADAPTER';

const text=value=>String(value??'').trim();

function evidenceId(row={}){
  const verified=(Array.isArray(row.evidence)?row.evidence:[]).find(item=>item?.verified===true);
  return text(verified?.id||verified?.source||row.evidenceId||'');
}

function canonicalRow(row={},source='R164'){
  return {
    ...row,
    id:text(row.id),
    severity:text(row.severity||'LOW').toUpperCase(),
    mode:text(row.mode||'OBSERVE_ONLY').toUpperCase(),
    summary:text(row.summary||row.reason||''),
    evidenceId:evidenceId(row),
    source:text(row.source||row.sourceAuthority||source),
    affected:Array.isArray(row.affected)?row.affected.map(text).filter(Boolean):[],
  };
}

function dedupeRows(rows=[]){
  const map=new Map();
  for(const row of rows){
    const normalized=canonicalRow(row);
    if(!normalized.id)continue;
    if(!map.has(normalized.id))map.set(normalized.id,normalized);
  }
  return [...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
}

export function buildCloudResidualStateR314({accuracyState={},runtimeEvidence={},workflowEvidence=[]}={}){
  const runtimeGraph=buildDevelopmentResidualGraphR164({runtimeEvidence,workflowEvidence});
  const accuracyRows=(Array.isArray(accuracyState?.residuals)?accuracyState.residuals:[]).map(row=>canonicalRow(row,'R125'));
  const runtimeRows=(runtimeGraph.residuals||[]).map(row=>canonicalRow(row,'R164'));
  const residuals=dedupeRows([...accuracyRows,...runtimeRows]);
  const state=runtimeGraph.state==='BLOCKED'?'BLOCKED':residuals.length?'RESIDUALS_PRESENT':'HEALTHY';
  const vector=residualVectorR314({state,residuals});
  return {
    schema:R314_CLOUD_RESIDUAL_ADAPTER_SCHEMA,
    state,
    residuals,
    vector,
    runtimeGraph,
    accuracyPolicy:accuracyState?.accuracyPolicy||null,
    accuracyObservedAt:accuracyState?.observedAt||null,
    selectedAccuracyResidual:accuracyState?.selected||null,
    canonicalAdmission:false,
    mutationAuthority:false,
  };
}
