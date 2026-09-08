function finite(values){return values.filter(Number.isFinite)}
export function median(values){const v=finite(values).slice().sort((a,b)=>a-b);if(!v.length)return null;const m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2}

export function chronologyMetrics(records){
  const sorted=records.slice().sort((a,b)=>new Date(a.startTime)-new Date(b.startTime));
  const gapsHours=[];
  for(let i=1;i<sorted.length;i++) gapsHours.push((new Date(sorted[i].startTime)-new Date(sorted[i-1].startTime))/3600000);
  const good=finite(gapsHours);
  const mean=good.length?good.reduce((a,b)=>a+b,0)/good.length:null;
  const med=median(good);
  const mad=med==null?null:median(good.map(v=>Math.abs(v-med)));
  const threshold=med==null?null:med+Math.max(6*(mad||0),med*2);
  const anomalous=[];
  if(threshold!=null){
    gapsHours.forEach((gap,i)=>{if(gap>threshold) anomalous.push({from:sorted[i].startTime,to:sorted[i+1].startTime,hours:gap,fromId:sorted[i].id,toId:sorted[i+1].id})});
  }
  const grades={A:0,B:0,C:0,other:0};
  sorted.forEach(r=>{const g=r.evidence?.grade;if(g in grades)grades[g]++;else grades.other++});
  return {
    count:sorted.length,
    first:sorted[0]?.startTime||null,
    last:sorted.at(-1)?.startTime||null,
    spanHours:sorted.length>1?(new Date(sorted.at(-1).startTime)-new Date(sorted[0].startTime))/3600000:0,
    gapsHours,
    cadence:{min:good.length?Math.min(...good):null,median:med,mean,max:good.length?Math.max(...good):null,mad},
    anomalousGaps:anomalous,
    platforms:[...new Set(sorted.map(r=>r.platform).filter(Boolean))],
    relativeOrbits:[...new Set(sorted.map(r=>r.relativeOrbit).filter(v=>v!==null&&v!==undefined))],
    grades,
    pixelReady:sorted.filter(r=>Object.keys(r.dataAssets||{}).length).length
  };
}

export function ageSeconds(timestamp, now=Date.now()){const t=new Date(timestamp).getTime();return Number.isFinite(t)?Math.max(0,(now-t)/1000):null}

export function freshnessLabel(timestamp, now=Date.now()){
  const s=ageSeconds(timestamp,now);if(s==null)return 'unknown';
  if(s<120)return `${Math.round(s)} s ago`;
  if(s<7200)return `${(s/60).toFixed(1)} min ago`;
  if(s<172800)return `${(s/3600).toFixed(1)} h ago`;
  return `${(s/86400).toFixed(1)} d ago`;
}

export function formatHours(hours){if(hours==null||!Number.isFinite(hours))return '—';if(hours<1)return `${(hours*60).toFixed(1)} min`;if(hours<48)return `${hours.toFixed(2)} h`;return `${(hours/24).toFixed(2)} d`}

export function temporalPosition(records, virtualTime){
  if(!records.length)return -1;
  const t=Number(virtualTime);
  let lo=0,hi=records.length-1,answer=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;const mt=new Date(records[mid].startTime).getTime();if(mt<=t){answer=mid;lo=mid+1}else hi=mid-1}
  return answer;
}
