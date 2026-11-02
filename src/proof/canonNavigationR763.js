/** R763 — exact, bounded V27 Canon topology, inverse search and phase continuity diagnostics.
 * Numeric coordinates are ordinal symbols, not physical dimensions or actions.
 * Scores and thresholds are exact fractions reconstructed by R761. No state mutation.
 */
import {reconstructCanonIndexR761} from './canonIndexReconstructionR761.js';
export const R763_AXES=Object.freeze(['Domain','State','Relation','Motion','Perspective']);
export const R763_STRIDES=Object.freeze([20736,1728,144,12,1]);
export const R763_SCOPE=Object.freeze({
 stateSpace:248832,modeCount:188,axisCount:5,
 reconstructedCanonLedgerSha256:'c5560df0a6967013a46d6eb5c286298b01961329427469568407cc8a6c65eb35',
 edgeModel:'ORDINAL_PLUS_MINUS_ONE_ONLY',
 optimization:'MINIMUM_SYMBOLIC_HOPS_UNDER_DECLARED_MODEL_FILTERS',
 phaseModel:'SIX_PHASE_INDEX_FROM_RECONSTRUCTED_CONTINUITY',
 relationalSkin:'EXACT_Q_AND_LAMBDA_FROM_RECONSTRUCTED_FORMULAS',
 inverseOutverse:'REVERSE_PATH_IN_SYMBOLIC_UNDIRECTED_GRAPH_ONLY',
 observerCalibration:'NOT_PROVIDED',scarHistory:'COMPUTED_PATH_BOUNDARY_CROSSINGS_ONLY',
 physicalActionAuthority:false,autoPing:false,
 globalSharpSingmaster:'OPEN',canonicalMutation:false
});
const integer=(v,min,max,name)=>{if(!Number.isSafeInteger(v)||v<min||v>max)throw new RangeError(name+' must be integer '+min+'..'+max);return v;};
const DEC=/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,12})?$/;
function rat(v,name){if(typeof v!=='string'||v.length>32||!DEC.test(v))throw new TypeError(name+' must be bounded nonnegative decimal text');const [a,b='']=v.split('.');return [BigInt(a+b),10n**BigInt(b.length)];}
const cmp=(a,b,c,d)=>a*d>b*c?1:a*d<b*c?-1:0;
export function encodeCanonR763(axes){
 if(!Array.isArray(axes)||axes.length!==5)throw new TypeError('five Canon coordinates required');
 return 1+axes.reduce((sum,x,i)=>sum+(integer(x,1,12,R763_AXES[i])-1)*R763_STRIDES[i],0);
}
export function decodeCanonR763(index){
 let v=integer(index,1,248832,'Canon index')-1;
 return R763_STRIDES.map(st=>{const a=Math.floor(v/st)+1;v%=st;return a;});
}
export function canonNodeR763(index){
 const a=decodeCanonR763(index);
 const row=reconstructCanonIndexR761(...a);
 const phase=(a[1]+a[2]+a[3]+a[4]-4)%6;
 return {...row,axes:a,phase,phaseGroup:phase+1,
  evidence:'V27_SOURCE_MATCHED_MODEL_ONLY',physicalFrame:'NOT_IDENTIFIED',liveActionAdmissible:false};
}
export function canonNeighborEdgesR763(index,allowedAxes=R763_AXES){
 const axes=decodeCanonR763(index);
 if(!Array.isArray(allowedAxes)||!allowedAxes.length||new Set(allowedAxes).size!==allowedAxes.length||allowedAxes.some(x=>!R763_AXES.includes(x)))
  throw new RangeError('nonempty unique subset of declared axes required');
 const edges=[];
 for(let axis=0;axis<5;axis++){
  if(!allowedAxes.includes(R763_AXES[axis]))continue;
  if(axes[axis]>1)edges.push({axis:R763_AXES[axis],direction:-1,to:index-R763_STRIDES[axis]});
  if(axes[axis]<12)edges.push({axis:R763_AXES[axis],direction:1,to:index+R763_STRIDES[axis]});
 }
 return edges;
}
function exactBurdenAndQ(axes,mode){
 const [D,S,R,M,P]=axes;const[d,s,r,m,p]=axes.map(v=>v-1);
 return {qN:BigInt(1+((mode-1)%12)+Math.abs(D-R)+Math.abs(S-M)),qD:34n,
 lambdaN:BigInt(1+((4+d+s+r+m+p+d*s)%12)),lambdaD:12n};
}
function withinStateLimits(node,opts){
 const N=BigInt(node.scoreNumerator),D=BigInt(node.scoreDenominator);
 if(opts.minScore){const [n,d]=opts.minScore;if(cmp(N,D,n,d)<0)return false;}
 if(opts.maxBurden){const {lambdaN,lambdaD}=exactBurdenAndQ(node.axes,node.mode188);const [n,d]=opts.maxBurden;if(cmp(lambdaN,lambdaD,n,d)>0)return false;}
 if(opts.maxContradiction){const {qN,qD}=exactBurdenAndQ(node.axes,node.mode188);const [n,d]=opts.maxContradiction;if(cmp(qN,qD,n,d)>0)return false;}
 return true;
}
function eligible(node,opts){
 return node.decision===opts.targetDecision&&(opts.targetMode===null||node.mode188===opts.targetMode)&&withinStateLimits(node,opts);
}
const step=(from,to)=>{
 const x=canonNodeR763(from),y=canonNodeR763(to);
 const edge=canonNeighborEdgesR763(from).find(e=>e.to===to);
 if(!edge)throw new Error('path edge not adjacent');
 const n=BigInt(y.scoreNumerator)*BigInt(x.scoreDenominator)-BigInt(x.scoreNumerator)*BigInt(y.scoreDenominator);
 const d=BigInt(x.scoreDenominator)*BigInt(y.scoreDenominator);
 return {from,to,axis:edge.axis,direction:edge.direction,modeFrom:x.mode188,modeTo:y.mode188,
  phaseFrom:x.phaseGroup,phaseTo:y.phaseGroup,decisionFrom:x.decision,decisionTo:y.decision,
  boundaryScar:x.decision!==y.decision,scoreDeltaSign:n>0n?'UP':n<0n?'DOWN':'SAME',
  exactDelta:{numerator:n.toString(),denominator:d.toString()},
  reversibleOrdinalEdge:canonNeighborEdgesR763(to).some(e=>e.to===from),externalCausalMeaning:false};
};
export function planCanonPathR763({start,targetDecision='STAY',targetMode=null,
 allowedAxes=R763_AXES,minScore=null,maxBurden=null,maxContradiction=null,
 maxHops=8,maxVisited=12000,scoreTrend='ANY',pathConstraintScope='TARGET_ONLY'}={}){
 integer(start,1,248832,'start');
 if(!['STAY','TURN','ESCALATE'].includes(targetDecision))throw new RangeError('targetDecision invalid');
 if(targetMode!==null)integer(targetMode,1,188,'targetMode');
 if(!['ANY','NONDECREASING'].includes(scoreTrend))throw new RangeError('unsupported exact score-trend constraint');
 if(!['TARGET_ONLY','ALL_NODES'].includes(pathConstraintScope))throw new RangeError('unsupported path constraint scope');
 integer(maxHops,0,20,'maxHops');integer(maxVisited,1,100000,'maxVisited');
 canonNeighborEdgesR763(start,allowedAxes);
 const o={targetDecision,targetMode,
  minScore:minScore===null?null:rat(minScore,'minScore'),
  maxBurden:maxBurden===null?null:rat(maxBurden,'maxBurden'),
  maxContradiction:maxContradiction===null?null:rat(maxContradiction,'maxContradiction')};
 if(pathConstraintScope==='ALL_NODES'&&!withinStateLimits(canonNodeR763(start),o))
  return {schema:'OMEGA_R763_EXACT_SYMBOLIC_PATH_V1',status:'START_OUTSIDE_DECLARED_PATH_CONSTRAINTS',start,targetDecision,
   requestedMode:targetMode,visited:0,queued:0,maxVisited,maxHops,pathConstraintScope,path:[],steps:[],
   calibratedRealWorldTransitions:false,externalSourceAuthority:false,canonicalMutation:false};
 const previous=new Int32Array(248833);previous[start]=start;
 const distance=new Uint8Array(248833);
 const queue=[start];let q=0,visited=0,depthLimited=false;
 while(q<queue.length){
  if(visited>=maxVisited)break;
  const i=queue[q++];visited++;
  const row=canonNodeR763(i);
  if(eligible(row,o)){
   const ids=[i];while(ids[ids.length-1]!==start){ids.push(previous[ids[ids.length-1]]);if(ids.length>21)throw new Error('predecessor cycle');}
   ids.reverse();let scars=0;const edges=ids.slice(1).map((id,j)=>{const e=step(ids[j],id);if(e.boundaryScar)scars++;return e;});
   return {schema:'OMEGA_R763_EXACT_SYMBOLIC_PATH_V1',status:'FOUND_IN_DECLARED_SYMBOLIC_GRAPH',start,destination:i,
    targetDecision,requestedMode:targetMode,pathConstraintScope,distance:ids.length-1,visited,
    path:ids.map(idx=>canonNodeR763(idx)),steps:edges,scarCrossings:scars,
    mode188Trace:ids.map(idx=>canonNodeR763(idx).mode188),
    inversePathIsSymbolicallyReversible:edges.every(e=>e.reversibleOrdinalEdge),
    searchCompleteForShortestPath:true,calibratedRealWorldTransitions:false,
    externalSourceAuthority:false,canonicalMutation:false};
  }
  const canTraverse=(e)=>{
   if(previous[e.to]!==0)return false;
   if(pathConstraintScope==='TARGET_ONLY'&&scoreTrend==='ANY')return true;
   const next=canonNodeR763(e.to);
   if(pathConstraintScope==='ALL_NODES'&&!withinStateLimits(next,o))return false;
   if(scoreTrend==='NONDECREASING'&&cmp(BigInt(next.scoreNumerator),BigInt(next.scoreDenominator),BigInt(row.scoreNumerator),BigInt(row.scoreDenominator))<0)return false;
   return true;
  };
  if(distance[i]===maxHops){if(canonNeighborEdgesR763(i,allowedAxes).some(canTraverse))depthLimited=true;continue;}
  for(const e of canonNeighborEdgesR763(i,allowedAxes))if(canTraverse(e)){
   previous[e.to]=i;distance[e.to]=distance[i]+1;queue.push(e.to);}
 }
 return {schema:'OMEGA_R763_EXACT_SYMBOLIC_PATH_V1',
  status:q<queue.length?'RESOURCE_HOLD_NO_INFERENCE':depthLimited?'DEPTH_HOLD_NO_INFERENCE':'NO_MATCH_IN_EXHAUSTED_DECLARED_GRAPH',
  start,targetDecision,requestedMode:targetMode,pathConstraintScope,visited,queued:queue.length,maxVisited,maxHops,
  path:[],steps:[],calibratedRealWorldTransitions:false,externalSourceAuthority:false,canonicalMutation:false};
}
export function inspectCanonLocalR763(index){
 const node=canonNodeR763(index),neighbors=canonNeighborEdgesR763(index).map(e=>{
  const x=canonNodeR763(e.to);
  return {...e,key:x.key,decision:x.decision,mode188:x.mode188,phaseGroup:x.phaseGroup,
   changeDecision:x.decision!==node.decision,
   exactScoreSign:cmp(BigInt(x.scoreNumerator),BigInt(x.scoreDenominator),BigInt(node.scoreNumerator),BigInt(node.scoreDenominator))};
 });
 return {node,neighbors,boundaryNeighbors:neighbors.filter(x=>x.changeDecision).length,scope:R763_SCOPE};
}
/** Portable certificate independently recomputes the full bounded BFS. */
export function computeCanonPathWitnessR763(query){
 if(!query||typeof query!=='object'||Array.isArray(query))throw new TypeError('path query object required');
 const keys=['start','targetDecision','targetMode','allowedAxes','minScore','maxBurden','maxContradiction','maxHops','maxVisited','scoreTrend','pathConstraintScope'];
 if(Object.keys(query).some(k=>!keys.includes(k)))throw new Error('unknown search capability key');
 const spec={start:query.start,targetDecision:query.targetDecision??'STAY',targetMode:query.targetMode??null,
  allowedAxes:query.allowedAxes??R763_AXES,minScore:query.minScore??null,maxBurden:query.maxBurden??null,
  maxContradiction:query.maxContradiction??null,maxHops:query.maxHops??8,maxVisited:query.maxVisited??12000,
  scoreTrend:query.scoreTrend??'ANY',pathConstraintScope:query.pathConstraintScope??'TARGET_ONLY'};
 return {schema:'OMEGA_R763_PORTABLE_PATH_WITNESS_V1',query:spec,result:planCanonPathR763(spec),scope:R763_SCOPE};
}
export function verifyCanonPathWitnessR763(raw){
 if(typeof raw!=='string'||raw.length>180000)throw new TypeError('bounded portable path witness required');
 const received=JSON.parse(raw);
 if(!received||received.schema!=='OMEGA_R763_PORTABLE_PATH_WITNESS_V1'||!received.query||!received.result)
  throw new TypeError('R763 path witness schema required');
 const expected=computeCanonPathWitnessR763(received.query);
 if(JSON.stringify(expected)!==JSON.stringify(received))throw new Error('R763 certificate differs from exact independent replay');
 return expected;
}
