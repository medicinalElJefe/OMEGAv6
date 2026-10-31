// R728: classify first-hand host returns without upgrading a health probe to a build.
const OPS=['DESKTOP_HEALTH','INDEX','HASH_TREE','FORENSIC_HASH_LEDGER','BUILD','TEST','PACKAGE','TRAIN_LOCAL','APPLY_PATCH','WRITE_TEXT'];
export function classifyHostReturnR728(job){
 const proofs=Array.isArray(job?.returnPacket?.stepProofs)?job.returnPacket.stepProofs:[];
 const completed=String(job?.status||'').toUpperCase()==='COMPLETE';
 const observed=Object.fromEntries(OPS.map(op=>[op,proofs.some(p=>String(p?.op||'').toUpperCase()===op&&p?.ok===true)]));
 const failed=proofs.filter(p=>p?.ok!==true).map(p=>String(p?.op||'UNKNOWN'));
 const fullBuild=completed&&observed.BUILD&&observed.TEST&&observed.PACKAGE&&failed.length===0;
 const projectVerified=completed&&observed.BUILD&&observed.TEST&&failed.length===0;
 const hostHealthOnly=completed&&observed.DESKTOP_HEALTH&&!observed.BUILD&&!observed.TEST;
 return {completed,observed,failed,fullBuild,projectVerified,hostHealthOnly,
  scope:fullBuild?'BUILD_TEST_PACKAGE_RETURNED':projectVerified?'BUILD_TEST_RETURNED':hostHealthOnly?'HOST_HEALTH_RETURNED':'PARTIAL_OR_OTHER_RETURN',
  sourceMutationProved:observed.APPLY_PATCH||observed.WRITE_TEXT};
}
