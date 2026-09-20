import fs from'node:fs';
import path from'node:path';
import {createHash} from'node:crypto';

const EXPECTED=Object.freeze({
 masterOriginalSha256:'0f966c0f8b40d26ba177324c6f0a6246ebda959e0030d5ad8ab2196f480a9891',
 masterOriginalBytes:7938333,
 masterNormalizedSha256:'e8c6aaf1217919d1f714a2399638e49d48922780bf9635f700eabbf164bd3ff2',
 masterNormalizedBytes:7934043,
 masterRecords:4285,masterColumns:68,
 r334PrefixSha256:'a3677e2b5a22b37235948999ed0896defbf706d13531676e84448096231913f4',
 r334PrefixBytes:7884622,r334PrefixRecords:4260,
 advancementOriginalSha256:'e4aaaae441a326d663ba1de049e91c2ee9b392096b982f7608f6d10d6096d6b9',
 advancementOriginalBytes:10312,
 advancementNormalizedSha256:'d4eeab6ec5f4310cb0554973538d60ce333a981ad0b8a3c301f8d359b692a410',
 advancementNormalizedBytes:10282,advancementRecords:25,advancementColumns:14,
 payloadAggregateSha256:'3e2cbe6b52f5d253079acd9a4ed9bf9449cccdcdf588e16c3acbbceeb12a6d16',
 payloadAggregateBytes:15934
});

const sha=b=>createHash('sha256').update(b).digest('hex');
const normalizeBytes=b=>{
 let s=b.toString('utf8');
 if(s.charCodeAt(0)===0xfeff)s=s.slice(1);
 s=s.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
 if(s.endsWith('\n'))s=s.slice(0,-1);
 return Buffer.from(s,'utf8');
};
function parseCsv(source){
 const matrix=[],row=[],field=[];let quoted=false;
 const fd=()=>{row.push(field.join(''));field.length=0},rd=()=>{fd();matrix.push([...row]);row.length=0};
 for(let i=0;i<source.length;i++){
  const ch=source[i];
  if(quoted){if(ch==='"'){if(source[i+1]==='"'){field.push('"');i++}else quoted=false}else field.push(ch);continue}
  if(ch==='"'){quoted=true;continue}
  if(ch===','){fd();continue}
  if(ch==='\n'){rd();continue}
  if(ch==='\r'){if(source[i+1]==='\n')continue;rd();continue}
  field.push(ch);
 }
 if(field.length||row.length)rd();
 if(quoted)throw new Error('unterminated CSV');
 const header=matrix.shift()||[];
 return{header,rows:matrix.filter(x=>x.length>1||x[0]).map(values=>Object.fromEntries(header.map((key,i)=>[key,values[i]??''])))};
}
const canonicalJson=row=>{
 const out={};for(const key of Object.keys(row).sort())out[key]=String(row[key]??'');
 return JSON.stringify(out);
};
const requireEq=(actual,expected,label)=>{if(actual!==expected)throw new Error(`${label}: expected ${expected}, received ${actual}`)};

function arg(name,fallback=''){
 const i=process.argv.indexOf(name);return i>=0?String(process.argv[i+1]||''):fallback;
}
const masterPath=arg('--master',process.env.OMEGA_R339_MASTER_V4_PATH||'');
const advPath=arg('--adv',process.env.OMEGA_R339_ADV_PATH||'public/canon/Dewey_OMEGA_CERN_ADV05_ADV06_Ablation_RoundTrip_Forecast_v4_2026-09-19.csv');
if(!masterPath)throw new Error('R339 external verifier requires --master <Advanced_Master_v4.csv> or OMEGA_R339_MASTER_V4_PATH');
if(!fs.existsSync(masterPath))throw new Error('R339 master path not found: '+masterPath);
if(!fs.existsSync(advPath))throw new Error('R339 advancement path not found: '+advPath);

const masterRaw=fs.readFileSync(masterPath),advRaw=fs.readFileSync(advPath),masterNorm=normalizeBytes(masterRaw),advNorm=normalizeBytes(advRaw);
requireEq(masterRaw.length,EXPECTED.masterOriginalBytes,'master original bytes');
requireEq(sha(masterRaw),EXPECTED.masterOriginalSha256,'master original SHA256');
requireEq(masterNorm.length,EXPECTED.masterNormalizedBytes,'master normalized bytes');
requireEq(sha(masterNorm),EXPECTED.masterNormalizedSha256,'master normalized SHA256');
requireEq(advNorm.length,EXPECTED.advancementNormalizedBytes,'advancement normalized bytes');
requireEq(sha(advNorm),EXPECTED.advancementNormalizedSha256,'advancement normalized SHA256');

const master=parseCsv(masterNorm.toString('utf8')),adv=parseCsv(advNorm.toString('utf8'));
requireEq(master.rows.length,EXPECTED.masterRecords,'master record census');
requireEq(master.header.length,EXPECTED.masterColumns,'master column census');
requireEq(adv.rows.length,EXPECTED.advancementRecords,'advancement record census');
requireEq(adv.header.length,EXPECTED.advancementColumns,'advancement column census');

const masterLines=masterNorm.toString('utf8').split('\n');
const prefix=Buffer.from(masterLines.slice(0,EXPECTED.r334PrefixRecords+1).join('\n'),'utf8');
requireEq(prefix.length,EXPECTED.r334PrefixBytes,'R334 normalized prefix bytes');
requireEq(sha(prefix),EXPECTED.r334PrefixSha256,'R334 normalized prefix SHA256');

const suffix=master.rows.slice(EXPECTED.r334PrefixRecords);
requireEq(suffix.length,EXPECTED.advancementRecords,'master v4 suffix census');
const payloads=[];
for(let i=0;i<adv.rows.length;i++){
 const a=adv.rows[i],m=suffix[i],payload=canonicalJson(a);
 requireEq(m.origin_record_id,a.row_id,`suffix row ${i+1} origin_record_id`);
 requireEq(m.source_row_key,a.row_id,`suffix row ${i+1} source_row_key`);
 requireEq(m.source_file,path.basename(advPath),`suffix row ${i+1} source_file`);
 requireEq(m.source_exact_preserved,'DERIVED_NO_OVERWRITE',`suffix row ${i+1} source_exact_preserved`);
 requireEq(m.provenance_tier,'DERIVED_FROM_FROZEN_V3',`suffix row ${i+1} provenance_tier`);
 requireEq(m.source_exact_payload_json,payload,`suffix row ${i+1} exact payload JSON`);
 requireEq(m.source_row_sha256,sha(Buffer.from(payload,'utf8')),`suffix row ${i+1} row SHA256`);
 payloads.push(payload);
}
const payloadAggregate=Buffer.from(payloads.join('\n'),'utf8');
requireEq(payloadAggregate.length,EXPECTED.payloadAggregateBytes,'suffix canonical payload aggregate bytes');
requireEq(sha(payloadAggregate),EXPECTED.payloadAggregateSha256,'suffix canonical payload aggregate SHA256');

const stageCensus=Object.fromEntries([...new Set(adv.rows.map(x=>x.stage))].sort().map(stage=>[stage,adv.rows.filter(x=>x.stage===stage).length]));
requireEq(stageCensus['ADV-05'],18,'ADV-05 census');requireEq(stageCensus['ADV-06'],5,'ADV-06 census');requireEq(stageCensus['ADV-07'],2,'ADV-07 census');

const exactCensus=master.rows.reduce((a,row)=>(a[row.source_exact_preserved]=(a[row.source_exact_preserved]||0)+1,a),{});
requireEq(exactCensus.TRUE,4105,'source-exact master rows');
requireEq(exactCensus.DERIVED_NO_OVERWRITE,180,'derived-no-overwrite master rows');

const receipt={
 schema:'OMEGA_R339_EXTERNAL_MASTER_VERIFICATION',
 verified:true,
 master:{path:masterPath,originalBytes:masterRaw.length,originalSha256:sha(masterRaw),normalizedBytes:masterNorm.length,normalizedSha256:sha(masterNorm),records:master.rows.length,columns:master.header.length},
 advancement:{path:advPath,normalizedBytes:advNorm.length,normalizedSha256:sha(advNorm),records:adv.rows.length,columns:adv.header.length,stageCensus},
 prefix:{records:EXPECTED.r334PrefixRecords,bytes:prefix.length,sha256:sha(prefix),state:'EXACT_R334_MASTER_V3_PREFIX'},
 suffix:{records:suffix.length,payloadAggregateBytes:payloadAggregate.length,payloadAggregateSha256:sha(payloadAggregate),state:'EXACT_ADVANCEMENT_ROW_PAYLOAD_AND_ROW_HASH_MATCH'},
 sourceExactCensus:exactCensus,
 canonicalMutation:false,canonicalAdmission:false,
 truthBoundary:'Byte/census/provenance verification only. This verifier proves source-file continuity and exact row embedding; it does not establish the scientific truth of derived quantities or admit CanonState.'
};
process.stdout.write(JSON.stringify(receipt,null,2)+'\n');
