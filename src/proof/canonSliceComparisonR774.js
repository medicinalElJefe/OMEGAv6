/** R774: bounded, deterministic source-slice comparison over R772 original-row reconstruction.
 * All metrics are stored four-decimal source values; aggregates use integer 1e-4 units.
 * Source-model statistics, not physical measurements, predictions or CanonState writes.
 */
import {parseCanonSourceQueryR773} from './canonSourceQueryR773.js';
import {reconstructCanonFullRowR772,R772_ORIGINAL_SOURCE_PROOF} from './canonFullSourceR772.js';
import {R763_AXES,R763_STRIDES} from './canonNavigationR763.js';

export const R774_SCHEMA='OMEGA_R774_CANON_SOURCE_SLICE_COMPARISON_V1';
export const R774_LOCAL_KEY='omega.r774.canonSliceComparison.v1';
export const R774_METRICS=Object.freeze(['CΩ_Continuity','q_Contradiction','Λ_Burden','Φ_Future_Plasticity','S_Coherence']);
export const R774_GROUPS=Object.freeze(['Decision',...R763_AXES]);
const exactFour=(v)=>{
 if(typeof v!=='string'||!/^(?:0|[1-9][0-9]*)\.[0-9]{4}$/.test(v))throw new Error('noncanonical source metric');
 const [a,b]=v.split('.');
 const n=Number(a)*10000+Number(b);
 if(!Number.isSafeInteger(n)||n<0)throw new Error('source metric outside exact range');
 return n;
};
const four=(n)=>String(Math.floor(n/10000))+'.'+String(n%10000).padStart(4,'0');
const roundedMean=(sum,count)=>count?four(Number((BigInt(sum)*2n+BigInt(count))/(2n*BigInt(count)))):null;
function deltaMean(right,left){
 if(!right.count||!left.count)return null;
 const n=BigInt(right.sum)*BigInt(left.count)-BigInt(left.sum)*BigInt(right.count);
 const d=BigInt(right.count)*BigInt(left.count);
 const abs=n<0n?-n:n;
 const scaled=(abs*2n+d)/(2n*d);
 return (n<0n?'-':n>0n?'+':'')+four(Number(scaled));
}
function normalizedSlice(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['coordinates','decision'].includes(k)))
  throw new TypeError('slice accepts only five coordinates and decision');
 const q=parseCanonSourceQueryR773(JSON.stringify({...value,offset:0,limit:12}));
 return {coordinates:q.coordinates,decision:q.decision};
}
export function normalizeCanonComparisonR774(spec){
 if(!spec||typeof spec!=='object'||Array.isArray(spec)||Object.keys(spec).some(k=>!['left','right','metric','groupBy'].includes(k)))
  throw new TypeError('unknown comparison field');
 const {metric='S_Coherence',groupBy='Decision'}=spec;
 if(!R774_METRICS.includes(metric)||!R774_GROUPS.includes(groupBy))throw new RangeError('unsupported source metric or grouping');
 return {left:normalizedSlice(spec.left),right:normalizedSlice(spec.right),metric,groupBy};
}
function summarize(slice,metric,groupBy){
 const choices=slice.coordinates.map(v=>v===null?Array.from({length:12},(_,i)=>i+1):[v]);
 let examined=0;
 const tally=()=>({count:0,sum:0,min:null,max:null,firstAddress:null});
 const total=tally(),groups=new Map(),decisions={STAY:0,TURN:0,ESCALATE:0};
 function add(target,amount,index){
  target.count++;target.sum+=amount;
  target.min=target.min===null?amount:Math.min(target.min,amount);
  target.max=target.max===null?amount:Math.max(target.max,amount);
  if(target.firstAddress===null)target.firstAddress=index;
 }
 function visit(axis,index){
  if(axis<5){for(const v of choices[axis])visit(axis+1,index+(v-1)*R763_STRIDES[axis]);return;}
  examined++;
  const row=reconstructCanonFullRowR772(index);
  if(slice.decision!=='ANY'&&row.Decision!==slice.decision)return;
  const amount=exactFour(row[metric]),label=String(row[groupBy]);
  add(total,amount,index);decisions[row.Decision]++;
  if(!groups.has(label))groups.set(label,tally());
  add(groups.get(label),amount,index);
 }
 visit(0,1);
 const finish=(x)=>({count:x.count,sumScaled4:x.sum,mean:roundedMean(x.sum,x.count),
  min:x.min===null?null:four(x.min),max:x.max===null?null:four(x.max),
  firstAddress:x.firstAddress});
 return {examined,matched:total.count,summary:finish(total),decisionCounts:decisions,
  groups:[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0]))
   .map(([label,x])=>({label,...finish(x)}))};
}
export function compareCanonSlicesR774(input){
 const query=normalizeCanonComparisonR774(input);
 const left=summarize(query.left,query.metric,query.groupBy);
 const right=summarize(query.right,query.metric,query.groupBy);
 const l=new Map(left.groups.map(g=>[g.label,g])),r=new Map(right.groups.map(g=>[g.label,g]));
 const groups=[...new Set([...l.keys(),...r.keys()])].sort((a,b)=>a.localeCompare(b))
  .map(label=>({label,leftCount:l.get(label)?.count??0,rightCount:r.get(label)?.count??0,
   leftMean:l.get(label)?.mean??null,rightMean:r.get(label)?.mean??null,
   meanDelta:deltaMean(r.has(label)?{count:r.get(label).count,sum:r.get(label).sumScaled4}:{count:0},l.has(label)?{count:l.get(label).count,sum:l.get(label).sumScaled4}:{count:0}),
   leftAddress:l.get(label)?.firstAddress??null,rightAddress:r.get(label)?.firstAddress??null}));
 return {schema:R774_SCHEMA,query,left,right,
  matchDelta:right.matched-left.matched,meanDelta:deltaMean(
   {count:right.summary.count,sum:right.summary.sumScaled4},
   {count:left.summary.count,sum:left.summary.sumScaled4}),
  groups,sourceWorkbookSha256:R772_ORIGINAL_SOURCE_PROOF.workbookSha256,
  sourceRows:R772_ORIGINAL_SOURCE_PROOF.rows,sourceColumns:R772_ORIGINAL_SOURCE_PROOF.columns,
  sourceModelOnly:true,canonicalMutation:false,empiricalAuthority:false,deviceAction:false};
}
export function parseCanonComparisonR774(raw){
 if(typeof raw!=='string'||raw.length>4096)throw new RangeError('bounded comparison query required');
 let value;try{value=JSON.parse(raw);}catch{throw new Error('invalid comparison JSON');}
 return normalizeCanonComparisonR774(value);
}
export function verifyCanonComparisonR774(raw){
 if(typeof raw!=='string'||raw.length>32000)throw new RangeError('bounded comparison witness required');
 let supplied;try{supplied=JSON.parse(raw);}catch{throw new Error('invalid comparison JSON');}
 if(!supplied||supplied.schema!==R774_SCHEMA)throw new Error('unsupported comparison witness');
 const expected=compareCanonSlicesR774(supplied.query);
 if(JSON.stringify(supplied)!==JSON.stringify(expected))
  throw new Error('comparison differs from independent original-source recomputation');
 return expected;
}
