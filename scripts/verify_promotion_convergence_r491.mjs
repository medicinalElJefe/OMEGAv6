import {spawnSync} from 'node:child_process';

const candidate=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim();
const worker=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
if(!candidate)throw new Error('R491 promotion convergence requires OMEGA_WORKER_VERSION_ID');

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function servingRows(value,rows=[]){
 if(!value||typeof value!=='object')return rows;
 if(Array.isArray(value)){for(const x of value)servingRows(x,rows);return rows}
 const id=typeof value.version_id==='string'?value.version_id:(typeof value.versionId==='string'?value.versionId:null);
 const pct=Number(value.percentage??value.traffic_percentage??value.trafficPercentage);
 if(id&&Number.isFinite(pct)&&pct>0.001)rows.push({id,pct});
 for(const x of Object.values(value))servingRows(x,rows);
 return rows;
}
for(let attempt=1;attempt<=15;attempt++){
 const proc=spawnSync('npx',['wrangler','deployments','status','--name',worker,'--json'],{cwd:process.cwd(),encoding:'utf8'});
 if(proc.status===0){
  try{
   const rows=[...new Map(servingRows(JSON.parse(proc.stdout)).map(x=>[x.id,x])).values()];
   if(rows.length===1&&rows[0].id===candidate&&rows[0].pct>=99.999){
    console.log(`R491 PROMOTION CONVERGENCE PASS · attempt ${attempt} · exact candidate ${candidate} alone at ${rows[0].pct}%`);
    process.exit(0);
   }
   console.log(`R491 promotion convergence attempt ${attempt}: ${JSON.stringify(rows)}`);
  }catch(error){console.log(`R491 promotion status parse attempt ${attempt}: ${error instanceof Error?error.message:String(error)}`)}
 }else{
  console.log(`R491 promotion status command attempt ${attempt} failed: ${String(proc.stderr||proc.stdout||'').slice(0,500)}`);
 }
 if(attempt<15)await sleep(2000);
}
throw new Error(`R491 exact candidate ${candidate} did not become the sole 100% serving Worker within the bounded convergence window`);
