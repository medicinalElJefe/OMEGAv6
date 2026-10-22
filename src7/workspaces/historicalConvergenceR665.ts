/** R665 historical convergence gate: prevent synthetic display layers from masquerading as recovered executors.
 * Source: verified B053 30-part archive, 1800 SHA-256 matched files, 48 nested ZIPs.
 * This is a capability/provenance control plane, not a replacement renderer.
 */
export type EvidenceClassR665='ARCHIVE_HASH_VERIFIED'|'SOURCE_INSPECTED'|'TEST_PASSED'|'RUNTIME_VERIFIED'|'PRODUCTION_VERIFIED';
export type CapabilityR665={id:string;archivePath:string;sha256:string;family:string;function:string;executor:string;status:EvidenceClassR665;dependencies:string[];gaps:string[]};
export const B053_RECOVERY_R665={release:'OMEGA-B053-NATIVE-FOUNDATION-INTELLIGENCE',parts:30,verifiedFiles:1800,hashErrors:0,nestedArchives:48,source:'Drive B053 recovered archive',physicalMatterAccuracy:'NOT_ESTABLISHED' as const};
export const B053_CAPABILITIES_R665:readonly CapabilityR665[]=[
 {id:'b053.world',archivePath:'engine/world_engine.js',sha256:'082ff4821313aa311f1b8dc85a4ece74ad707a57408b52fc23ab4e05bdc71937',family:'world',function:'packet-driven world visualization and observer camera',executor:'browser Three.js',status:'SOURCE_INSPECTED',dependencies:['three','packet service'],gaps:['current OMEGA7 binding','runtime integration test']},
 {id:'b053.field',archivePath:'engine/atlas_field_binding.js',sha256:'523533db2106ad2cfcd82f00f8672b467535ae38ef360ba26612f22136bdd3b8',family:'field',function:'packet domain/phase/regulation to model-space placement',executor:'browser Three.js',status:'SOURCE_INSPECTED',dependencies:['three','canonical packets'],gaps:['physical calibration','cross-release comparison']},
 {id:'b053.temporal',archivePath:'engine/atlas_temporal_binding.js',sha256:'',family:'temporal',function:'tick/phase/shell temporal offsets and field uniforms',executor:'browser Three.js',status:'SOURCE_INSPECTED',dependencies:['three','packet tick'],gaps:['dynamics verification','cross-release comparison']},
 {id:'b053.observer',archivePath:'omega/traversal/observer.py',sha256:'',family:'observer',function:'first-person navigation and scale reanchoring',executor:'Python',status:'SOURCE_INSPECTED',dependencies:['field state'],gaps:['end-to-end browser test','camera state interchange']},
 {id:'b053.shader',archivePath:'shaders/omega_primary.hlsl',sha256:'',family:'shader',function:'historical shader implementation',executor:'GPU HLSL',status:'ARCHIVE_HASH_VERIFIED',dependencies:['GPU shader host'],gaps:['GPU compatibility test','pixel comparison']}
];
const ranks:Record<EvidenceClassR665,number>={ARCHIVE_HASH_VERIFIED:1,SOURCE_INSPECTED:2,TEST_PASSED:3,RUNTIME_VERIFIED:4,PRODUCTION_VERIFIED:5};
export function validateRecoveryR665(items:readonly CapabilityR665[]=B053_CAPABILITIES_R665){
 const ids=new Set<string>(),errors:string[]=[];
 for(const c of items){if(ids.has(c.id))errors.push('duplicate:'+c.id);ids.add(c.id);if(!c.archivePath||!c.executor)errors.push('incomplete:'+c.id);if(c.sha256&&!/^[0-9a-f]{64}$/.test(c.sha256))errors.push('bad hash:'+c.id);}
 return{ok:errors.length===0,errors,sourceCount:items.length};
}
export function capabilityAdmissionR665(id:string,required:EvidenceClassR665,items:readonly CapabilityR665[]=B053_CAPABILITIES_R665){
 const c=items.find(x=>x.id===id);return{capability:id,admitted:!!c&&ranks[c.status]>=ranks[required],actual:c?.status??'MISSING',required,gaps:c?.gaps??['capability missing']};
}
