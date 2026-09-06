import {R21_MODE_AUTHORITY,evaluateSourceBackedModes,type SourceBackedModeResult} from './sourceBackedModeRuntimeR21';

export const R140_REVISION='R140';
export const R140_SCHEMA='OMEGA_MODE_COMPLETION_FABRIC_R140';
export const R140_LAWS=Object.freeze([
 'EVERY_CATALOG_SLOT_HAS_ONE_EXPLICIT_EXECUTION_STATE',
 'CATALOG_MEMBERSHIP_NEVER_COUNTS_AS_EXECUTION',
 'MISSING_INPUTS_REMAIN_MISSING_UNTIL_SOURCE_BOUND',
 'ADAPTER_CODE_IS_A_CANDIDATE_UNTIL_TESTED_AND_ADMITTED',
 'AI_OR_SAI_MAY_PROPOSE_AN_ADAPTER_BUT_CANNOT_SELF_DECLARE_VALIDITY',
 'MODE_COMPLETION_MUST_PRESERVE_SOURCE_FORMULA_AND_LINEAGE',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

export type ModeCompletionStateR140='EXECUTED_EXACT'|'SOURCE_PACKET'|'DERIVED_RUNTIME'|'GATED_MISSING_INPUTS'|'CATALOG_ONLY';
export type ModeCompletionRowR140={
 id:string;name:string;state:ModeCompletionStateR140;source:string;formula:string;value:number|string|null;inputs:string[];missing:string[];
 evaluator:string|null;adapterTarget:string|null;testTarget:string|null;priority:number;readiness:number;reason:string;
};

const pad=(n:number)=>`M${String(n).padStart(3,'0')}`;
const executable=(s:ModeCompletionStateR140)=>s==='EXECUTED_EXACT'||s==='SOURCE_PACKET'||s==='DERIVED_RUNTIME';
function completionRow(row:SourceBackedModeResult):ModeCompletionRowR140{
 const isExec=executable(row.state),missing=row.missing||[],readiness=isExec?1:Math.max(.05,1-Math.min(.9,missing.length*.22));
 const priority=isExec?0:Number((.45*readiness+.35*(1-Math.min(1,missing.length/5))+.20*(row.formula?1:.35)).toFixed(4));
 return{id:row.id,name:row.name,state:row.state,source:row.source,formula:row.formula,value:row.value,inputs:row.inputs||[],missing,evaluator:isExec?'evaluateSourceBackedModes':null,adapterTarget:isExec?null:`src/modes/adapters/${row.id.toLowerCase()}Adapter.ts`,testTarget:isExec?null:`tests/modes/${row.id.toLowerCase()}-adapter.mjs`,priority,readiness,reason:isExec?'current packet supplies an admitted evaluator/source channel':`requires ${missing.length?missing.join(', '):'an admitted evaluator and source binding'}`};
}

export function compileModeCompletionFabricR140(record:any){
 const hosted=evaluateSourceBackedModes(record).map(completionRow),known=new Set(hosted.map(x=>x.id)),rows=[...hosted];
 for(let i=1;i<=R21_MODE_AUTHORITY.catalogCount;i++){
  const id=pad(i);if(known.has(id))continue;
  rows.push({id,name:`Catalog mode ${id}`,state:'CATALOG_ONLY',source:'R21 source catalog / detailed evaluator not hosted in current runtime',formula:'',value:null,inputs:[],missing:['source formula/evaluator contract','authoritative required-input mapping'],evaluator:null,adapterTarget:`src/modes/adapters/${id.toLowerCase()}Adapter.ts`,testTarget:`tests/modes/${id.toLowerCase()}-adapter.mjs`,priority:.18,readiness:.05,reason:'catalog membership is known, but this runtime does not contain enough source-backed detail to invent its formula or inputs'});
 }
 rows.sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)));
 const counts={exact:rows.filter(x=>x.state==='EXECUTED_EXACT').length,packet:rows.filter(x=>x.state==='SOURCE_PACKET').length,derived:rows.filter(x=>x.state==='DERIVED_RUNTIME').length,gated:rows.filter(x=>x.state==='GATED_MISSING_INPUTS').length,catalogOnly:rows.filter(x=>x.state==='CATALOG_ONLY').length};
 const executableCount=counts.exact+counts.packet+counts.derived;
 const backlog=rows.filter(x=>!executable(x.state)).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
 return{schema:R140_SCHEMA,revision:R140_REVISION,catalogCount:R21_MODE_AUTHORITY.catalogCount,rows,counts,executableCount,nonExecutableCount:rows.length-executableCount,completionRatio:executableCount/Math.max(1,rows.length),backlog,adapterContract:{inputs:['mode id','source formula','required authoritative inputs','source lineage'],output:['value or categorical result','state','missing inputs','source proof'],candidateAuthority:'NOT_ADMITTED_UNTIL_FOCUSED_AND_INHERITED_GATES_PASS'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R140 provides a complete 179-slot execution census. Unknown catalog slots are deliberately CATALOG_ONLY; it never fabricates their formulas, required inputs, outputs or scientific validity. AI/SAI can propose adapter candidates only after source detail is recovered.'};
}

export function nextModeBuildCandidatesR140(record:any,limit=12){
 const fabric=compileModeCompletionFabricR140(record);return fabric.backlog.slice(0,Math.max(1,Math.min(24,limit))).map((x,index)=>({...x,rank:index+1,admissionPath:'source recover → bind inputs → implement adapter → focused test → inherited regression → R125 admission'}));
}
