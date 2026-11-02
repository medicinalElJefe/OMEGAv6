/** R764 — executable exact symbolic continuity replay for the R763 Canon path.
 * A source-recomputed local checkpoint is recoverable, not authenticated evidence.
 * No physical dynamics, device authority, or CanonState mutation is inferred.
 */
import {verifyCanonPathWitnessR763} from './canonNavigationR763.js';

const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){const t=a%b;a=b;b=t;}return a||1n;};
const rational=(n,d)=>{n=BigInt(n);d=BigInt(d);if(d<=0n)throw new RangeError('positive denominator required');const g=gcd(n,d);return [n/g,d/g];};
const add=(a,b)=>rational(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
const sub=(a,b)=>rational(a[0]*b[1]-b[0]*a[1],a[1]*b[1]);
const same=(a,b)=>a[0]*b[1]===b[0]*a[1];
const format=a=>({numerator:String(a[0]),denominator:String(a[1])});
const score=node=>rational(node.scoreNumerator,node.scoreDenominator);
export const R764_LOCAL_KEY='omega.r764.canonTrajectoryCheckpoint';

export function deriveCanonTrajectoryR764(witness){
 if(!witness||typeof witness!=='object'||Array.isArray(witness))throw new TypeError('R763 path witness required');
 const verified=verifyCanonPathWitnessR763(JSON.stringify(witness));
 const path=verified.result;
 if(path.status!=='FOUND_IN_DECLARED_SYMBOLIC_GRAPH'||!Array.isArray(path.path)||!path.path.length)
  throw new RangeError('only a completed modeled path can be replayed');
 let running=[0n,1n],scars=0,phaseTransitions=0,modeTransitions=0;
 const frames=path.path.map((node,i)=>{
  if(i){
   const prev=path.path[i-1],edge=path.steps[i-1];
   if(edge.from!==prev.index||edge.to!==node.index)throw new Error('path continuity broken');
   const delta=sub(score(node),score(prev));
   if(!same(delta,rational(edge.exactDelta.numerator,edge.exactDelta.denominator)))
    throw new Error('exact transported score delta mismatch');
   running=add(running,delta);
   if(edge.boundaryScar)scars++;
   if(prev.phaseGroup!==node.phaseGroup)phaseTransitions++;
   if(prev.mode188!==node.mode188)modeTransitions++;
  }
  const [domain,state,relation,motion,perspective]=node.axes;
  const atlasAddress20736=(((state-1)*12+(relation-1))*12+(motion-1))*12+(perspective-1);
  return {step:i,index:node.index,key:node.key,decision:node.decision,
   outerDomain:domain,atlasAddress20736,atlasCoordinates:[state,relation,motion,perspective],
   mode188:node.mode188,phaseGroup:node.phaseGroup,score:node.score,
   scoreNumerator:node.scoreNumerator,scoreDenominator:node.scoreDenominator,
   cumulativeExactDelta:format(running),cumulativeBoundaryScars:scars,
   coordinates:node.axes};
 });
 const total=sub(score(path.path.at(-1)),score(path.path[0]));
 if(!same(running,total)||scars!==path.scarCrossings)
  throw new Error('R764 woven carry or boundary scar mismatch');
 const values=frames.map(f=>Number(BigInt(f.scoreNumerator))/Number(BigInt(f.scoreDenominator)));
 const lo=Math.min(...values),hi=Math.max(...values),span=hi-lo;
 const plot=values.map((v,i)=>({x:30+640*i/Math.max(1,values.length-1),
  y:span===0?100:160-120*(v-lo)/span}));
 return {schema:'OMEGA_R764_EXACT_CANON_TRAJECTORY_V1',
  source:'R763_RECOMPUTED_SYMBOLIC_PATH',frames,plot,
  totalExactScoreDelta:format(total),scarCrossings:scars,phaseTransitions,modeTransitions,
  inverseScoreReturnExact: same(add(total,rational(-total[0],total[1])),[0n,1n]),
  originalSourceAuthenticated:false,physicalTrajectory:false,
  crossDevicePersistence:false,canonicalMutation:false};
}
export function createCanonReplayCheckpointR764(witness,frame){
 const replay=deriveCanonTrajectoryR764(witness);
 if(!Number.isSafeInteger(frame)||frame<0||frame>=replay.frames.length)
  throw new RangeError('replay frame outside exact path');
 return {schema:'OMEGA_R764_LOCAL_CANON_CHECKPOINT_V1',witness,frame,
  summary:{frameCount:replay.frames.length,scarCrossings:replay.scarCrossings,
   totalExactScoreDelta:replay.totalExactScoreDelta},
  authority:'BROWSER_LOCAL_RECOMPUTABLE_MODEL_ONLY'};
}
export function verifyCanonReplayCheckpointR764(raw){
 if(typeof raw!=='string'||raw.length>180000)throw new TypeError('bounded local checkpoint JSON required');
 const parsed=JSON.parse(raw);
 if(!parsed||parsed.schema!=='OMEGA_R764_LOCAL_CANON_CHECKPOINT_V1')
  throw new TypeError('R764 checkpoint schema required');
 const expected=createCanonReplayCheckpointR764(parsed.witness,parsed.frame);
 if(JSON.stringify(parsed)!==JSON.stringify(expected))
  throw new Error('R764 checkpoint differs from independent exact replay');
 return expected;
}
