#!/usr/bin/env node
// R885 fail-closed version-view identity verifier.
// A successful provider command alone is not enough: the JSON must include
// the exact uploaded UUID as an ID field, never merely in a message or log.
import {readFileSync} from 'node:fs';
const [candidate,path]=process.argv.slice(2);
if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(candidate||''))
 throw Error('R885_CANDIDATE_VERSION_UUID_REQUIRED');
if(!path)throw Error('R885_PROVIDER_RESPONSE_PATH_REQUIRED');
const data=JSON.parse(readFileSync(path,'utf8'));
const ids=[];
function walk(value,depth=0){
 if(depth>12)return;
 if(!value||typeof value!=='object')return;
 if(Array.isArray(value)){for(const item of value)walk(item,depth+1);return}
 for(const [key,val] of Object.entries(value)){
  if(['id','version_id','versionId','uuid'].includes(key)&&typeof val==='string'
    &&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(val))ids.push(val.toLowerCase());
  if(val&&typeof val==='object')walk(val,depth+1);
 }
}
walk(data);
if(!ids.includes(candidate.toLowerCase())){
 console.error('R885_VERSION_IDENTITY_NOT_PROVEN',JSON.stringify({expected:candidate,returnedIdFields:ids.length}));
 process.exit(3);
}
console.log('R885_EXACT_PROVIDER_VERSION_VISIBLE',candidate);
