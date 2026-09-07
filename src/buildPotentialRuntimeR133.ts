import {EXPRESSION_PLANES,FAMILIES,expressionPlanesForFamily,type ExpressionPlaneId,type SystemFamily,type SystemFamilyStatus} from './systemAtlasRuntime';
import {R48_COMPLETION_FAMILIES} from './completionRuntimeR48';

export type BuildPotentialLaneR133='OPERATING'|'PROVE_NEXT'|'RESTORE_NEXT'|'PRODUCTIZE_NEXT';
export type BuildPotentialPriorityR133='P0'|'P1'|'P2'|'P3';

export const BUILD_POTENTIAL_LAWS_R133=Object.freeze({
 revision:'R133/R168',
 source:'systemAtlasRuntime.FAMILIES + FAMILY_EXPRESSION + R48/R153 current successor ledger',
 statusTruth:'Family registration is not execution. Historical V24 family status and current successor execution are separate axes. R168 prioritizes from the already-proved R48/R153 successor ledger without rewriting predecessor lineage.',
 operating:'WEB_ACTIVE / SOURCE_ACTIVE / LOCAL_ACTIVE current successor states operate within their declared boundaries.',
 prove:'DEVICE_GATED / EVIDENCE_GATED require current device/evidence proof; they are not treated as broken or live.',
 restore:'RESTORATION_DEBT means no bounded current successor is proved for that family.',
 productize:'DONOR_ONLY / NATIVE_TARGET remain donor/native targets unless a bounded successor is already present in the current completion ledger.',
 routing:'Composite successor surface labels are normalized to a registered primary workstation route before navigation.',
 authority:'Build priority cannot promote CanonState, evidence, execution, native capability, archive donors, or physical truth. R125 and the existing proof/admission authorities remain unchanged.'
});

export function laneForFamilyStatusR133(status:SystemFamilyStatus):BuildPotentialLaneR133{
 if(status==='WEB_ACTIVE'||status==='SOURCE_ACTIVE'||status==='LOCAL_ACTIVE')return'OPERATING';
 if(status==='DEVICE_GATED'||status==='EVIDENCE_GATED')return'PROVE_NEXT';
 if(status==='RESTORATION_DEBT')return'RESTORE_NEXT';
 return'PRODUCTIZE_NEXT';
}

const PRIORITY:Record<BuildPotentialLaneR133,BuildPotentialPriorityR133>={PROVE_NEXT:'P0',RESTORE_NEXT:'P1',PRODUCTIZE_NEXT:'P2',OPERATING:'P3'};
const ACTION:Record<BuildPotentialLaneR133,string>={
 OPERATING:'Harden, integrate and expose coherently without overstating the current successor execution boundary.',
 PROVE_NEXT:'Close the existing evidence/device gate with the smallest reproducible proof receipt.',
 RESTORE_NEXT:'Recover the smallest executable slice from known lineage, then test it against current runtime contracts.',
 PRODUCTIZE_NEXT:'Promote only a bounded donor/native slice after artifact, host and rollback proof exist.'
};
const CURRENT_BY_FAMILY=new Map(R48_COMPLETION_FAMILIES.map(x=>[x.id,x]));
const primaryRoute=(surface:string,fallback:string)=>String(surface||fallback||'System Atlas').split('/')[0].trim()||fallback||'System Atlas';

export type BuildPotentialRowR133={family:SystemFamily;effectiveStatus:SystemFamilyStatus;effectiveSurface:string;effectiveRoute:string;effectiveProof:string;effectiveRemaining:string;statusSource:string;lane:BuildPotentialLaneR133;priority:BuildPotentialPriorityR133;action:string;planes:ExpressionPlaneId[];planeLabels:string[];breadth:number};
export const BUILD_POTENTIAL_ROWS_R133:BuildPotentialRowR133[]=FAMILIES.map(family=>{
 const planes=expressionPlanesForFamily(family.id),current=CURRENT_BY_FAMILY.get(family.id),effectiveStatus=(current?.successor||family.status) as SystemFamilyStatus,lane=laneForFamilyStatusR133(effectiveStatus),effectiveSurface=current?.surface||family.target;
 return{family,effectiveStatus,effectiveSurface,effectiveRoute:primaryRoute(effectiveSurface,family.target),effectiveProof:current?.proof||family.statusNote,effectiveRemaining:current?.remaining||family.statusNote,statusSource:current?`R48/R153 successor · ${current.successor}`:'V24 family registry',lane,priority:PRIORITY[lane],action:ACTION[lane],planes:planes.map(x=>x.id),planeLabels:planes.map(x=>x.label),breadth:planes.length};
});

export const BUILD_POTENTIAL_LANES_R133=(['OPERATING','PROVE_NEXT','RESTORE_NEXT','PRODUCTIZE_NEXT'] as const).map(lane=>{
 const rows=BUILD_POTENTIAL_ROWS_R133.filter(x=>x.lane===lane);
 return Object.freeze({lane,count:rows.length,priority:PRIORITY[lane],action:ACTION[lane],familyIds:rows.map(x=>x.family.id),planeCoverage:EXPRESSION_PLANES.map(plane=>({id:plane.id,count:rows.filter(x=>x.planes.includes(plane.id)).length})).filter(x=>x.count>0)});
});

export function buildPotentialSummaryR133(){
 const historicalStatusCounts=Object.fromEntries([...new Set(FAMILIES.map(x=>x.status))].map(status=>[status,FAMILIES.filter(x=>x.status===status).length]));
 const effectiveStatusCounts=Object.fromEntries([...new Set(BUILD_POTENTIAL_ROWS_R133.map(x=>x.effectiveStatus))].map(status=>[status,BUILD_POTENTIAL_ROWS_R133.filter(x=>x.effectiveStatus===status).length]));
 const laneCounts=Object.fromEntries(BUILD_POTENTIAL_LANES_R133.map(x=>[x.lane,x.count]));
 const uncovered=FAMILIES.filter(f=>!BUILD_POTENTIAL_ROWS_R133.some(x=>x.family.id===f.id)).map(x=>x.id);
 return{revision:'R133/R168',familyCount:FAMILIES.length,statusCounts:effectiveStatusCounts,historicalStatusCounts,effectiveStatusCounts,laneCounts,successorMapped:BUILD_POTENTIAL_ROWS_R133.filter(x=>x.statusSource.startsWith('R48/R153')).map(x=>x.family.id),expressionPlaneCount:EXPRESSION_PLANES.length,uncovered,pass:FAMILIES.length===24&&uncovered.length===0&&Object.values(laneCounts).reduce((a,b)=>a+Number(b),0)===24,laws:BUILD_POTENTIAL_LAWS_R133};
}
