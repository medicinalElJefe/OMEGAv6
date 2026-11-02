/** R775: aligned, source-executed decision transitions across two original Canon domains.
 * One shared 12^4 address is paired between domains. No empirical inference or CanonState write.
 */
import {reconstructCanonFullRowR772,R772_ORIGINAL_SOURCE_PROOF} from './canonFullSourceR772.js';
import {R763_STRIDES} from './canonNavigationR763.js';
import {R774_METRICS} from './canonSliceComparisonR774.js';

export const R775_SCHEMA='OMEGA_R775_CANON_PAIRED_TRANSITIONS_V1';
export const R775_LOCAL_KEY='omega.r775.pairedTransitions.v1';
export const R775_DECISIONS=Object.freeze(['STAY','TURN','ESCALATE']);
const exactFour=(v)=>{
 if(typeof v!=='string'||!/^(?:0|[1-9][0-9]*)\.[0-9]{4}$/.test(v))throw Error('noncanonical four-decimal source metric');
 const [a,b]=v.split('.');const n=Number(a)*10000+Number(b);
 if(!Number.isSafeInteger(n))throw Error('source metric outside safe exact range');
 return n;
};
const signedFour=(n)=> (n<0?'-':'')+Math.floor(Math.abs(n)/10000)+'.'+String(Math.abs(n)%10000).padStart(4,'0');
function roundedDelta(sum,count){
 if(!count)return null;
 const a=BigInt(sum),d=BigInt(count),abs=a<0n?-a:a;
 const rounded=(abs*2n+d)/(2n*d);
 return signedFour(Number(a<0n?-rounded:rounded));
}
export function normalizeCanonPairedTransitionR775(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||
  Object.keys(value).some(k=>!['leftDomain','rightDomain','state','metric'].includes(k)))
  throw new TypeError('unknown paired-transition field');
 const {leftDomain,rightDomain,state=null,metric='S_Coherence'}=value;
 for(const v of [leftDomain,rightDomain])if(!Number.isSafeInteger(v)||v<1||v>12)
  throw new RangeError('domain must be an ordinal 1..12');
 if(state!==null&&(!Number.isSafeInteger(state)||state<1||state>12))
  throw new RangeError('state must be null or an ordinal 1..12');
 if(!R774_METRICS.includes(metric))throw new RangeError('unsupported original source metric');
 return {leftDomain,rightDomain,state,metric};
}
export function computeCanonPairedTransitionR775(input){
 const query=normalizeCanonPairedTransitionR775(input);
 const cells=new Map();
 for(const from of R775_DECISIONS)for(const to of R775_DECISIONS)
  cells.set(from+'>'+to,{from,to,count:0,sumDeltaScaled4:0,firstLeftAddress:null,firstRightAddress:null});
 let paired=0,sumDeltaScaled4=0,changed=0;
 const stride=R763_STRIDES[0];
 for(let local=1;local<=stride;local++){
  const state=Math.floor((local-1)/R763_STRIDES[1])%12+1;
  if(query.state!==null&&state!==query.state)continue;
  const leftAddress=(query.leftDomain-1)*stride+local;
  const rightAddress=(query.rightDomain-1)*stride+local;
  const left=reconstructCanonFullRowR772(leftAddress),right=reconstructCanonFullRowR772(rightAddress);
  if(!R775_DECISIONS.includes(left.Decision)||!R775_DECISIONS.includes(right.Decision))
   throw Error('unknown original-source decision');
  const delta=exactFour(right[query.metric])-exactFour(left[query.metric]);
  const cell=cells.get(left.Decision+'>'+right.Decision);
  cell.count++;cell.sumDeltaScaled4+=delta;
  if(cell.firstLeftAddress===null){cell.firstLeftAddress=leftAddress;cell.firstRightAddress=rightAddress;}
  paired++;sumDeltaScaled4+=delta;
  if(left.Decision!==right.Decision)changed++;
 }
 const matrix=[...cells.values()].map(c=>({...c,meanDelta:roundedDelta(c.sumDeltaScaled4,c.count)}));
 if(matrix.reduce((s,c)=>s+c.count,0)!==paired)throw Error('transition conservation failed');
 return {schema:R775_SCHEMA,query,paired,changed,stable:paired-changed,
  sumDeltaScaled4,meanDelta:roundedDelta(sumDeltaScaled4,paired),matrix,
  sourceWorkbookSha256:R772_ORIGINAL_SOURCE_PROOF.workbookSha256,
  sourceRows:R772_ORIGINAL_SOURCE_PROOF.rows,sourceColumns:R772_ORIGINAL_SOURCE_PROOF.columns,
  sourceModelOnly:true,empiricalAuthority:false,canonicalMutation:false,deviceAction:false};
}
export function parseCanonPairedTransitionR775(raw){
 if(typeof raw!=='string'||raw.length>2048)throw new RangeError('bounded paired-transition query required');
 let value;try{value=JSON.parse(raw);}catch{throw Error('invalid paired-transition JSON');}
 return normalizeCanonPairedTransitionR775(value);
}
export function verifyCanonPairedTransitionR775(raw){
 if(typeof raw!=='string'||raw.length>16000)throw new RangeError('bounded paired-transition witness required');
 let supplied;try{supplied=JSON.parse(raw);}catch{throw Error('invalid paired-transition JSON');}
 if(!supplied||supplied.schema!==R775_SCHEMA)throw Error('unsupported paired-transition witness');
 const expected=computeCanonPairedTransitionR775(supplied.query);
 if(JSON.stringify(supplied)!==JSON.stringify(expected))
  throw Error('paired transitions differ from independent original-source recomputation');
 return expected;
}
