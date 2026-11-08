/** R796: export actual R794 successor traversal, never inferred Canon or physical evidence. */
export function sourceTraversalCsvR796(trace){
 if(!trace||!Number.isSafeInteger(trace.start)||trace.start<0||trace.start>=20736||
  !Number.isSafeInteger(trace.maxSteps)||trace.maxSteps<1||trace.maxSteps>144||
  !Array.isArray(trace.steps)||trace.steps.length<1||trace.steps.length>trace.maxSteps||
  !['CYCLE','STEP_LIMIT'].includes(trace.termination)||trace.sourceBound!==true||
  trace.canonicalMutation!==false||trace.physicalMeasurement!==false)
  throw Error('R796 invalid source-bound traversal');
 const names=['address','successor','domain','continuity','continuityDelta','motion','symmetry','scar','evidence','contradiction','forecastModelScore'];
 const rows=[names.join(',')];
 const seen=new Set();
 for(const step of trace.steps){
  if(!step||![step.address,step.successor].every(n=>Number.isSafeInteger(n)&&n>=0&&n<20736)||
   !Number.isSafeInteger(step.domain)||step.domain<0||step.domain>=12||
   seen.has(step.address)||names.slice(3).some(k=>typeof step[k]!=='number'||!Number.isFinite(step[k])))
   throw Error('R796 invalid or repeated source traversal step');
  seen.add(step.address);
  rows.push(names.map(k=>String(step[k])).join(','));
 }
 if(trace.steps[0].address!==trace.start||
    trace.steps.some((s,i)=>i>0&&trace.steps[i-1].successor!==s.address)||
    trace.steps.at(-1).successor!==trace.nextAddress||
    (trace.termination==='CYCLE'&&!seen.has(trace.nextAddress)))
  throw Error('R796 broken successor lineage');
 return rows.join('\n')+'\n';
}
