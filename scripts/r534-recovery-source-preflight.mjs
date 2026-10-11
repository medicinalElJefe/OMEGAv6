import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
/** Source recovery preflight. Only real checked-out files can pass.
 * Historical claims require independently supplied expected SHA-256. */
export const R534_PREFLIGHT_SCHEMA='OMEGA_R534_RECOVERY_SOURCE_PREFLIGHT';
export function verifyRecoverySourcesR534({root=process.cwd(),sources=[]}={}){
 const results=sources.map(row=>{
  const relative=String(row?.path||'');
  const expected=String(row?.sha256||'').toLowerCase();
  const resolved=path.resolve(root,relative);
  const confined=relative.length>0&&!path.isAbsolute(relative)&&!relative.split(/[\\/]/).includes('..')&&(resolved===path.resolve(root)||resolved.startsWith(path.resolve(root)+path.sep));
  const reasons=[];
  if(!confined)reasons.push('SOURCE_PATH_NOT_CONFINED');
  if(!/^[a-f0-9]{64}$/.test(expected))reasons.push('EXPECTED_SHA256_MISSING');
  let actual=null;
  if(confined){
   try{
    const stat=fs.lstatSync(resolved);
    if(!stat.isFile()||stat.isSymbolicLink())reasons.push('SOURCE_NOT_REGULAR_FILE');
    else actual=createHash('sha256').update(fs.readFileSync(resolved)).digest('hex');
   }catch{reasons.push('SOURCE_NOT_FOUND')}
  }
  if(actual&&expected!==actual)reasons.push('SOURCE_HASH_MISMATCH');
  return Object.freeze({path:relative,expectedSha256:expected,actualSha256:actual,status:reasons.length?'HELD':'SOURCE_HASH_VERIFIED',reasons:Object.freeze(reasons),historicalParityClaimed:false,canonicalMutation:false});
 });
 return Object.freeze({schema:R534_PREFLIGHT_SCHEMA,status:sources.length&&results.every(x=>x.status==='SOURCE_HASH_VERIFIED')?'SOURCE_VERIFIED':'HELD',results:Object.freeze(results),executionClaimed:false,productionAdmissionClaimed:false,canonicalMutation:false});
}
if(process.argv[1]?.endsWith('r534-recovery-source-preflight.mjs')){
 const manifest=process.argv[2];
 if(!manifest)throw new Error('Usage: node scripts/r534-recovery-source-preflight.mjs <manifest.json>');
 const parsed=JSON.parse(fs.readFileSync(manifest,'utf8'));
 const result=verifyRecoverySourcesR534({sources:parsed.sources});
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='SOURCE_VERIFIED')process.exitCode=1;
}
