import {attachEvidencePressureR240,candidateScoreR240,dependencyReadyR240} from './r240-recursive-selfbuild-fabric.mjs';

export const R242_CONTINUITY_OPERATOR='PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION';
export const R242_RESOLUTION=Object.freeze({organs:12,surfacesPerOrgan:12,branches:144,cellsPerBranch:12,cells:1728,lanesPerCell:12,lanes:20736,deepPerLane:12,deepAddress:248832,physicalDimensionsClaimed:false});
export const R242_ROLES=Object.freeze(['PLANNER','BUILDER','TESTER','ADVERSARIAL_REVIEWER','PERFORMANCE','INTEGRATION','EVIDENCE','RESIDUAL_ANALYSIS']);
export const R242_INVARIANT_CARRY=Object.freeze([
  'R125_SOLE_CANONSTATE_ADMISSION',
  'R141_EXACT_RETURN_VERIFICATION',
  'R146_DURABLE_EXECUTION_HISTORY',
  'R147_EXECUTOR_SELECTION_AND_DISPATCH',
  'R239_SELECTED_HOST_RESOURCE_ADMISSION',
  'R240_SINGLE_CANDIDATE_SOURCE_PROMOTION',
  'CONNECTED_HEARTBEAT_NEQ_RCWA_PROOF',
  'JOB_COMPLETE_NEQ_SOURCE_MUTATION',
  'SOURCE_MUTATION_REQUIRES_EXACT_APPLY_PATCH_OR_WRITE_TEXT_RETURN_PROOF',
  'EXECUTION_SUCCESS_NEQ_SCIENTIFIC_TRUTH',
  'PROPOSAL_NEQ_AUTHORIZATION_NEQ_EXECUTION_NEQ_RETURN_NEQ_CANON_ADMISSION',
  'CI_YML_SOLE_CANONICAL_PRODUCTION_WRITER'
]);

const clampInt=(n,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(n)||0)));
const asSet=x=>x instanceof Set?x:new Set(Array.isArray(x)?x:[]);
const deps=c=>Array.isArray(c?.prerequisites)?c.prerequisites:Array.isArray(c?.dependencies)?c.dependencies:[];

export function addressForCellR242(index){
  const ordinal=Number(index);
  if(!Number.isInteger(ordinal)||ordinal<0||ordinal>=R242_RESOLUTION.cells)throw new RangeError(`R242 cell ordinal out of range: ${index}`);
  const organ=Math.floor(ordinal/144);
  const surface=Math.floor((ordinal%144)/12);
  const branch=organ*12+surface;
  const cell=ordinal%12;
  const laneStart=ordinal*12;
  const laneEnd=laneStart+11;
  const deepStart=laneStart*12;
  const deepEnd=(laneEnd+1)*12-1;
  return Object.freeze({organ,surface,branch,cell,ordinal,laneStart,laneEnd,deepStart,deepEnd,address:`O${String(organ).padStart(2,'0')}.B${String(branch).padStart(3,'0')}.C${String(cell).padStart(2,'0')}`});
}

export function validateRoadmapDagR242(roadmap=[]){
  const ids=roadmap.map(c=>String(c?.id||''));
  const duplicates=[...new Set(ids.filter((id,i)=>!id||ids.indexOf(id)!==i))];
  const known=new Set(ids.filter(Boolean));
  const missing=[];
  for(const c of roadmap)for(const d of deps(c))if(!known.has(String(d)))missing.push({id:String(c?.id||''),dependency:String(d)});
  const graph=new Map(roadmap.map(c=>[String(c.id),deps(c).map(String)]));
  const visiting=new Set(),visited=new Set(),cycles=[];
  function visit(id,trail=[]){
    if(visited.has(id))return;
    if(visiting.has(id)){const at=trail.indexOf(id);cycles.push([...trail.slice(Math.max(0,at)),id]);return;}
    visiting.add(id);
    for(const d of graph.get(id)||[])if(graph.has(d))visit(d,[...trail,id]);
    visiting.delete(id);visited.add(id);
  }
  for(const id of graph.keys())visit(id,[]);
  return {valid:duplicates.length===0&&missing.length===0&&cycles.length===0,duplicates,missing,cycles,nodeCount:roadmap.length,edgeCount:roadmap.reduce((n,c)=>n+deps(c).length,0)};
}

export function carryScarsR242(previousScars=[],evidence={}){
  const carried=(Array.isArray(previousScars)?previousScars:[]).map((s,index)=>({...s,carried:true,carryIndex:index}));
  const observed=(Array.isArray(evidence?.residuals)?evidence.residuals:[]).map((r,index)=>({
    scarId:String(r?.id||`R164-${index}`),severity:String(r?.severity||'UNSPECIFIED').toUpperCase(),mode:String(r?.mode||'OBSERVE_ONLY').toUpperCase(),
    summary:String(r?.summary||''),provenance:'R164_RETURNED_RESIDUAL_EVIDENCE',evidenceClass:'RETURNED_RESIDUAL',carried:false
  }));
  const out=[];const seen=new Set();
  for(const scar of [...carried,...observed]){
    const key=[scar.scarId||scar.id||'',scar.provenance||'',scar.severity||'',scar.mode||'',scar.summary||''].join('|');
    if(seen.has(key))continue;seen.add(key);out.push(scar);
  }
  return out;
}

export function rolePacketsForCellR242(cell){
  return R242_ROLES.map(role=>({
    schema:'OMEGA_WOVEN_WORK_PACKET_R242',revision:'R242',role,workCellId:cell.id,address:cell.address.address,objective:cell.objective,
    inputs:{dependencies:[...cell.dependencies],evidenceState:cell.evidenceState,scarIds:cell.scars.map(s=>s.scarId||s.id||'').filter(Boolean)},
    invariants:[...R242_INVARIANT_CARRY],provenance:cell.provenance,evidenceClass:cell.evidenceClass,sigma:0,
    transformationHistory:[...cell.transformationHistory,'R242_WOVEN_PACKETIZE'],executionIdentity:null,proofIdentity:null,
    authorityBoundary:{planning:'R242',singleSourceMutation:'R240',dispatch:'R147',exactReturn:'R141',durableHistory:'R146',canonAdmission:'R125'},
    sourceMutationAuthorized:false,dispatchAuthorized:false,canonicalAdmission:false
  }));
}

export function buildWorkCellR242(capsule,index,{admitted=new Set(),evidence={},scars=[]}={}){
  const admittedSet=asSet(admitted);
  const address=addressForCellR242(index);
  const dependencies=deps(capsule).map(String);
  const ready=dependencyReadyR240(capsule,admittedSet);
  const target=capsule.target||null;
  const scarCopy=scars.map(s=>({...s}));
  return {
    schema:'OMEGA_WOVEN_WORK_CELL_R242',revision:'R242',id:String(capsule.id),parent:'OMEGA_FULL_OVERALL_CANON',
    objective:String(capsule.objective||capsule.title||capsule.id),inputs:{dependencies,evidenceState:evidence?.state||'UNPROVEN'},
    target,files:target?[target]:[],address,dependencies,invariants:[...R242_INVARIANT_CARRY],expectedOutputs:target?[target]:[],tests:[],
    authorityBoundary:{planning:'R242',sourceMutation:'R240_SINGLE_CANDIDATE_ONLY',dispatch:'R147',returnVerification:'R141',durableHistory:'R146',canonAdmission:'R125'},
    residuals:scarCopy,scars:scarCopy,state:ready?'READY':'DEPENDENCY_BLOCKED',provenance:'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DECLARED_ROADMAP_DAG',
    evidenceClass:'PLANNING_DERIVED_FROM_RETURNED_EVIDENCE',sigma:0,transformationHistory:['R240_PRESSURE_RANK','R242_DAG_READY'],
    executionIdentity:null,proofIdentity:null,score:candidateScoreR240(capsule),evidenceState:evidence?.state||'UNPROVEN',
    canonicalAdmission:false,sourceMutationAuthorized:false
  };
}

export function planWovenBuildFabricR242({roadmap=[],admitted=[],maxParallel=12,evidence={},previousScars=[]}={}){
  const dag=validateRoadmapDagR242(roadmap);
  const width=clampInt(maxParallel,1,12);
  const admittedSet=asSet(admitted);
  const scars=carryScarsR242(previousScars,evidence);
  const blocked=state=>({schema:'OMEGA_WOVEN_SELFBUILD_FABRIC_R242',revision:'R242',state,continuityOperator:R242_CONTINUITY_OPERATOR,resolution:R242_RESOLUTION,dag,sparseActivation:true,maxActiveCells:width,activeCells:[],packets:[],scars,invariantCarry:[...R242_INVARIANT_CARRY],sourceMutationCandidateId:null,parallelPlanning:true,parallelEvaluation:true,parallelSourceMutation:false,canonicalAdmission:false,authority:'PLANNING_AND_EVALUATION_ONLY'});
  if(!dag.valid)return blocked('BLOCKED_INVALID_DAG');
  if(roadmap.length>R242_RESOLUTION.cells)return blocked('BLOCKED_ADDRESS_CAPACITY');
  const pressured=attachEvidencePressureR240(roadmap,evidence);
  const cells=pressured.map((c,index)=>buildWorkCellR242(c,index,{admitted:admittedSet,evidence,scars}));
  const activeCells=cells.filter(c=>!admittedSet.has(c.id)&&c.state==='READY').sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,width).map(c=>({...c,rolePackets:rolePacketsForCellR242(c)}));
  const packets=activeCells.flatMap(c=>c.rolePackets);
  return {
    schema:'OMEGA_WOVEN_SELFBUILD_FABRIC_R242',revision:'R242',state:activeCells.length?'PLANNED':'OBSERVE',continuityOperator:R242_CONTINUITY_OPERATOR,
    resolution:R242_RESOLUTION,dag,sparseActivation:true,maxActiveCells:width,
    addressSpace:{organs:12,branches:144,cells:1728,lanes:20736,deepAddress:248832,allocatedCells:cells.length,activeCells:activeCells.length},
    cells,activeCells,packets,scars,invariantCarry:[...R242_INVARIANT_CARRY],sourceMutationCandidateId:activeCells[0]?.id||null,
    parallelPlanning:true,parallelEvaluation:true,parallelSourceMutation:false,provenance:'R164_RETURNED_RESIDUAL_EVIDENCE_PLUS_DECLARED_ROADMAP_DAG',
    evidenceState:evidence?.state||'UNPROVEN',authority:'PLANNING_AND_EVALUATION_ONLY',canonicalAdmission:false
  };
}
