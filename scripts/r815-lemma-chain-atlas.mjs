import {createHash} from 'node:crypto';
import fs from 'node:fs';
const AXIS=12,WORKERS=144,CELLS=20736;
const hash=x=>createHash('sha256').update(x).digest('hex');
export const LEMMAS=Object.freeze(['SOURCE','IDENTITY','CONTINUITY','DEPENDENCY','ADMISSIBILITY','RESIDUAL','WORKER','BROWSER','RELEASE','PROVENANCE','CONSERVATION','RETURN_PROOF']);
export function atlasAddress(index){
 if(!Number.isInteger(index)||index<0||index>=CELLS)throw Error('INVALID_ATLAS_ADDRESS');
 return [Math.floor(index/1728),Math.floor(index/144)%12,Math.floor(index/12)%12,index%12];
}
export function compileLemmaAtlasR815({evidence={},workerCount=WORKERS}={}){
 if(workerCount!==WORKERS)throw Error('R815_REQUIRES_144_LOGICAL_PARTITIONS');
 const stages=LEMMAS.map((lemma,i)=>{
  const row=evidence[lemma];
  const status=row?.status==='PASS'?'PASS':row?.status==='FAIL'?'FAIL':'UNKNOWN';
  const proof=typeof row?.proofSha256==='string'&&/^[a-f0-9]{64}$/.test(row.proofSha256)?row.proofSha256:null;
  return{index:i,lemma,status:status==='PASS'&&!proof?'UNKNOWN':status,proofSha256:proof};
 });
 const partitions=[];
 let previous=hash('OMEGA_R815_LEMMA_CHAIN_GENESIS');
 for(let worker=0;worker<WORKERS;worker++){
  const start=worker*144,end=start+143;
  const stage=stages[worker%12];
  const addressStart=atlasAddress(start),addressEnd=atlasAddress(end);
  const state=stage.status;
  const digest=hash(JSON.stringify({previous,worker,start,end,stage,addressStart,addressEnd}));
  partitions.push({worker,start,end,addressStart,addressEnd,lemma:stage.lemma,state,previousHash:previous,hash:digest});
  previous=digest;
 }
 const counts={PASS:0,FAIL:0,UNKNOWN:0};
 for(const p of partitions)counts[p.state]++;
 const allProven=stages.every(s=>s.status==='PASS');
 return{schema:'OMEGA_R815_20736D_LEMMA_CHAIN',axisCardinality:[12,12,12,12],cellCount:CELLS,logicalWorkerCount:WORKERS,cellsPerWorker:144,
  actualCloudWorkersDispatched:0,stages,counts,chainRoot:previous,partitions,
  decision:allProven?'ELIGIBLE_FOR_SEPARATE_GOVERNED_REVIEW':'HELD',sourceMutationAuthorized:false,productionAdmissionAuthorized:false};
}
if(process.argv[1]&&process.argv[1].endsWith('r815-lemma-chain-atlas.mjs')){
 const [input,output]=process.argv.slice(2);
 if(!input||!output)throw Error('Usage: node scripts/r815-lemma-chain-atlas.mjs evidence.json output.json');
 const evidence=JSON.parse(fs.readFileSync(input,'utf8'));
 const result=compileLemmaAtlasR815({evidence});
 fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({decision:result.decision,chainRoot:result.chainRoot,logicalWorkerCount:result.logicalWorkerCount,actualCloudWorkersDispatched:0}));
}
