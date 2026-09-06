import {EXPRESSION_PLANES,FAMILIES,expressionPlanesForFamily,type ExpressionPlaneId,type SystemFamily,type SystemFamilyStatus} from './systemAtlasRuntime';

export type BuildPotentialLaneR133='OPERATING'|'PROVE_NEXT'|'RESTORE_NEXT'|'PRODUCTIZE_NEXT';
export type BuildPotentialPriorityR133='P0'|'P1'|'P2'|'P3';

export const BUILD_POTENTIAL_LAWS_R133=Object.freeze({
 revision:'R133',
 source:'systemAtlasRuntime.FAMILIES + FAMILY_EXPRESSION',
 statusTruth:'Family registration is not execution. This runtime only reorganizes existing family execution statuses.',
 operating:'WEB_ACTIVE / SOURCE_ACTIVE / LOCAL_ACTIVE are presently represented as operating within their declared boundaries.',
 prove:'DEVICE_GATED / EVIDENCE_GATED require the missing device/evidence proof; they are not treated as broken or live.',
 restore:'RESTORATION_DEBT means lineage/purpose is known but complete executable restoration is not proved.',
 productize:'DONOR_ONLY / NATIVE_TARGET preserve donor or native-target value without claiming hosted execution.',
 authority:'Build priority cannot promote CanonState, evidence, execution, native capability, or archive donors. Existing proof/admission authority remains unchanged.'
});

export function laneForFamilyStatusR133(status:SystemFamilyStatus):BuildPotentialLaneR133{
 if(status==='WEB_ACTIVE'||status==='SOURCE_ACTIVE'||status==='LOCAL_ACTIVE')return'OPERATING';
 if(status==='DEVICE_GATED'||status==='EVIDENCE_GATED')return'PROVE_NEXT';
 if(status==='RESTORATION_DEBT')return'RESTORE_NEXT';
 return'PRODUCTIZE_NEXT';
}

const PRIORITY:Record<BuildPotentialLaneR133,BuildPotentialPriorityR133>={PROVE_NEXT:'P0',RESTORE_NEXT:'P1',PRODUCTIZE_NEXT:'P2',OPERATING:'P3'};
const ACTION:Record<BuildPotentialLaneR133,string>={
 OPERATING:'Harden, integrate and expose coherently without overstating its declared execution boundary.',
 PROVE_NEXT:'Close the existing evidence/device gate with the smallest reproducible proof receipt.',
 RESTORE_NEXT:'Recover the smallest executable slice from known lineage, then test it against current runtime contracts.',
 PRODUCTIZE_NEXT:'Promote only a bounded donor/native slice after artifact, host and rollback proof exist.'
};

export type BuildPotentialRowR133={family:SystemFamily;lane:BuildPotentialLaneR133;priority:BuildPotentialPriorityR133;action:string;planes:ExpressionPlaneId[];planeLabels:string[];breadth:number};
export const BUILD_POTENTIAL_ROWS_R133:BuildPotentialRowR133[]=FAMILIES.map(family=>{const planes=expressionPlanesForFamily(family.id);const lane=laneForFamilyStatusR133(family.status);return{family,lane,priority:PRIORITY[lane],action:ACTION[lane],planes:planes.map(x=>x.id),planeLabels:planes.map(x=>x.label),breadth:planes.length}});

export const BUILD_POTENTIAL_LANES_R133=(['OPERATING','PROVE_NEXT','RESTORE_NEXT','PRODUCTIZE_NEXT'] as const).map(lane=>{
 const rows=BUILD_POTENTIAL_ROWS_R133.filter(x=>x.lane===lane);
 return Object.freeze({lane,count:rows.length,priority:PRIORITY[lane],action:ACTION[lane],familyIds:rows.map(x=>x.family.id),planeCoverage:EXPRESSION_PLANES.map(plane=>({id:plane.id,count:rows.filter(x=>x.planes.includes(plane.id)).length})).filter(x=>x.count>0)});
});

export function buildPotentialSummaryR133(){
 const statusCounts=Object.fromEntries([...new Set(FAMILIES.map(x=>x.status))].map(status=>[status,FAMILIES.filter(x=>x.status===status).length]));
 const laneCounts=Object.fromEntries(BUILD_POTENTIAL_LANES_R133.map(x=>[x.lane,x.count]));
 const uncovered=FAMILIES.filter(f=>!BUILD_POTENTIAL_ROWS_R133.some(x=>x.family.id===f.id)).map(x=>x.id);
 return{revision:'R133',familyCount:FAMILIES.length,statusCounts,laneCounts,expressionPlaneCount:EXPRESSION_PLANES.length,uncovered,pass:FAMILIES.length===24&&uncovered.length===0&&Object.values(laneCounts).reduce((a,b)=>a+Number(b),0)===24,laws:BUILD_POTENTIAL_LAWS_R133};
}
