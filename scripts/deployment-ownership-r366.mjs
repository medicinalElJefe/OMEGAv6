import fs from'node:fs';

export function classifyDeploymentOwnership(data,candidate,previous){
  const rows=[];
  function walk(v){
    if(!v||typeof v!=='object')return;
    if(Array.isArray(v)){for(const x of v)walk(x);return}
    const id=typeof v.version_id==='string'?v.version_id:(typeof v.versionId==='string'?v.versionId:null);
    const raw=v.percentage??v.traffic_percentage??v.trafficPercentage;
    const pct=Number(raw);
    if(id&&Number.isFinite(pct))rows.push({id,pct});
    for(const x of Object.values(v))walk(x);
  }
  walk(data);
  const serving=[...new Map(rows.filter(x=>x.pct>0.001).map(x=>[`${x.id}:${x.pct}`,x])).values()];
  const stable=serving.filter(x=>x.pct>=99.999);
  if(stable.length===1&&serving.length===1){
    const id=stable[0].id;
    if(id===previous)return'ALREADY_PREVIOUS';
    if(id===candidate)return'ROLLBACK_CANDIDATE';
    return'NEWER_OR_FOREIGN';
  }
  return'AMBIGUOUS_DEPLOYMENT';
}

if(import.meta.url===`file://${process.argv[1]}`){
  const[file,candidate,previous]=process.argv.slice(2);
  if(!file||!candidate||!previous)throw new Error('usage: node scripts/deployment-ownership-r366.mjs <status.json> <candidate> <previous>');
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  process.stdout.write(classifyDeploymentOwnership(data,candidate,previous));
}
