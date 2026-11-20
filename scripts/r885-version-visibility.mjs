#!/usr/bin/env node
/**
 * R885: fail-closed exact identity check for the candidate returned by Wrangler.
 * Input must be successful --json output from "wrangler versions list --name NAME".
 * This is visibility evidence only, NOT deployment/traffic acceptance.
 */
import fs from 'node:fs';

export function visibleCandidateR885(document,expected) {
 if(typeof expected!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(expected))
  return {ok:false,state:'INVALID_UPLOADED_VERSION_ID_HELD'};
 if(!document||typeof document!=='object')
  return {ok:false,state:'CLOUDFLARE_VERSION_LIST_SCHEMA_HELD'};
 const candidates=[];
 const seen=new Set(),stack=[{value:document,depth:0}];
 while(stack.length){
  const {value,depth}=stack.pop();
  if(!value||typeof value!=='object'||seen.has(value))continue;
  seen.add(value);
  if(depth>9||seen.size>1500)return {ok:false,state:'VERSION_LIST_BOUNDS_HELD'};
  if(Array.isArray(value)){
   for(const item of value)stack.push({value:item,depth:depth+1});
   continue;
  }
  for(const key of ['id','version_id','versionId']){
   const v=value[key];
   if(typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))
    candidates.push(v.toLowerCase());
  }
  for(const x of Object.values(value))if(x&&typeof x==='object')stack.push({value:x,depth:depth+1});
 }
 return candidates.some(id=>id===expected.toLowerCase())
  ? {ok:true,state:'EXACT_UPLOADED_VERSION_VISIBLE',candidateVersionId:expected,visibleIdCount:new Set(candidates).size,authority:'LIST_ONLY_NOT_TRAFFIC'}
  : {ok:false,state:'EXACT_UPLOADED_VERSION_NOT_YET_VISIBLE',candidateVersionId:expected,visibleIdCount:new Set(candidates).size};
}
if(process.argv[1]&&process.argv[1].endsWith('/r885-version-visibility.mjs')){
 try{
  const file=process.argv[2],expected=process.argv[3];
  if(!file||!expected)throw Error('VERSION_LIST_FILE_AND_CANDIDATE_REQUIRED');
  const b=fs.readFileSync(file);
  if(b.length>1024*1024)throw Error('VERSION_LIST_SIZE_HELD');
  const answer=visibleCandidateR885(JSON.parse(b),expected);
  process.stdout.write(JSON.stringify(answer)+'\n');
  process.exitCode=answer.ok?0:2;
 }catch(e){
  process.stderr.write('R885_VERSION_LIST_HELD '+(e instanceof Error?e.message:String(e))+'\n');
  process.exitCode=2;
 }
}
