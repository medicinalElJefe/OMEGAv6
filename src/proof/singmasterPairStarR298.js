import {compileSingmasterShardedExactR297,SINGMASTER_SHARDED_EXACT_SCHEMA_R297} from './singmasterShardedExactR297.js';

export const SINGMASTER_PAIR_STAR_SCHEMA_R298='OMEGA_SINGMASTER_LABELED_PAIR_STAR_R298';
export const SINGMASTER_PAIR_STAR_BOUNDARY_R298='R298 treats pair compatibility as an exact value-labeled graph, never as an unlabeled collision graph. A four-column candidate exists only when one identical exact coefficient label survives on all six pair edges. By fixed-column uniqueness, that common label is equivalent to one coherent four-column integer fiber inside the declared bounded certificate. This is a reduction/certificate layer, not a global proof of the Sharp Singmaster Bound.';

const stable=value=>{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`};
const hash32=value=>{const text=String(value);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const fingerprint=value=>`r298-${hash32(stable(value)).toString(16).padStart(8,'0')}`;
const pairKey=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`;
const sortLabels=(a,b)=>String(a).length-String(b).length||String(a).localeCompare(String(b));

function choose4(values){const out=[];for(let i=0;i<values.length-3;i++)for(let j=i+1;j<values.length-2;j++)for(let k=j+1;k<values.length-1;k++)for(let l=k+1;l<values.length;l++)out.push([values[i],values[j],values[k],values[l]]);return out}
function pairs4(tuple){const[a,b,c,d]=tuple;return[[a,b],[a,c],[a,d],[b,c],[b,d],[c,d]]}
function intersection(sets){if(!sets.length)return[];const first=[...sets[0]];return first.filter(x=>sets.slice(1).every(s=>s.has(x))).sort(sortLabels)}

export function compilePairStarFromFibersR298(fibers,{scope=null,sourceFingerprint='SYNTHETIC'}={}){
 const edgeMap=new Map(),columnSet=new Set(),fiberRows=[];
 for(const fiber of Array.isArray(fibers)?fibers:[]){
  const value=String(fiber?.value??''),reps=Array.isArray(fiber?.representations)?fiber.representations:[],columns=[...new Set(reps.map(x=>Number(x.k)).filter(Number.isSafeInteger))].sort((a,b)=>a-b);
  if(!value||columns.length<2)continue;
  columns.forEach(k=>columnSet.add(k));fiberRows.push({value,columns,multiplicity:columns.length});
  for(let i=0;i<columns.length-1;i++)for(let j=i+1;j<columns.length;j++){const key=pairKey(columns[i],columns[j]),row=edgeMap.get(key)||{a:columns[i],b:columns[j],labels:new Set()};row.labels.add(value);edgeMap.set(key,row)}
 }
 const columns=[...columnSet].sort((a,b)=>a-b),edges=[...edgeMap.values()].map(x=>({a:x.a,b:x.b,labels:[...x.labels].sort(sortLabels),labelCount:x.labels.size})).sort((x,y)=>x.a-y.a||x.b-y.b),edgeLookup=new Map(edges.map(x=>[pairKey(x.a,x.b),new Set(x.labels)]));
 const tuples=choose4(columns).map(tuple=>{const pairRows=pairs4(tuple),sets=pairRows.map(([a,b])=>edgeLookup.get(pairKey(a,b))||new Set()),unlabeledComplete=sets.every(x=>x.size>0),commonLabels=unlabeledComplete?intersection(sets):[];return{columns:tuple,pairs:pairRows.map(([a,b],i)=>({a,b,labels:[...sets[i]].sort(sortLabels)})),unlabeledComplete,commonLabels,coherent:commonLabels.length>0}});
 const coherentFourTuples=tuples.filter(x=>x.coherent),unlabeledComplete=tuples.filter(x=>x.unlabeledComplete),falsePairwisePositives=unlabeledComplete.filter(x=>!x.coherent),stars=[];
 for(const center of columns){const neighbors=edges.flatMap(e=>e.a===center?[e.b]:e.b===center?[e.a]:[]).filter((x,i,a)=>a.indexOf(x)===i).sort((a,b)=>a-b);for(let i=0;i<neighbors.length-2;i++)for(let j=i+1;j<neighbors.length-1;j++)for(let k=j+1;k<neighbors.length;k++){const arms=[neighbors[i],neighbors[j],neighbors[k]],sets=arms.map(n=>edgeLookup.get(pairKey(center,n))||new Set()),commonArmLabels=intersection(sets);stars.push({center,arms,commonArmLabels,armCompatible:commonArmLabels.length>0})}}
 const core={schema:SINGMASTER_PAIR_STAR_SCHEMA_R298,revision:'R298',domainId:'NUMBER_THEORY/PASCAL/SINGMASTER',claimId:'SHARP_SINGMASTER_N_LE_8',globalClaimStatus:'OPEN',proofScope:'EXACT_LABELED_PAIR_STAR_REDUCTION',sourceFingerprint:String(sourceFingerprint),scope,columns,edgeCount:edges.length,edges,fiberRows,tupleCount:tuples.length,unlabeledCompleteCount:unlabeledComplete.length,coherentFourTupleCount:coherentFourTuples.length,falsePairwisePositiveCount:falsePairwisePositives.length,coherentFourTuples,falsePairwisePositives,stars,criterion:'one identical exact value label must lie in the intersection of all six pair-edge label sets',fixedColumnUniquenessRequired:true,truthMutationAuthority:false,sourceMutationAuthority:false,productionAuthority:false,boundary:SINGMASTER_PAIR_STAR_BOUNDARY_R298};
 return{...core,fingerprint:fingerprint({source:core.sourceFingerprint,scope,edges,coherent:coherentFourTuples.map(x=>[x.columns,x.commonLabels]),falsePositives:falsePairwisePositives.map(x=>x.columns)})};
}

export function compileSingmasterPairStarR298(certificate=compileSingmasterShardedExactR297()){
 if(certificate?.schema!==SINGMASTER_SHARDED_EXACT_SCHEMA_R297)throw new Error('R298 requires an R297 sharded exact certificate');
 const atlas=compilePairStarFromFibersR298(certificate.collisionFibers,{scope:certificate.scope,sourceFingerprint:certificate.fingerprint});
 const exactFourfoldValues=[...new Set(certificate.fourfoldCandidates.flatMap(x=>[String(x.value)]))].sort(sortLabels),pairStarValues=[...new Set(atlas.coherentFourTuples.flatMap(x=>x.commonLabels))].sort(sortLabels);
 const equivalencePass=stable(exactFourfoldValues)===stable(pairStarValues);
 return{...atlas,sourceSchema:certificate.schema,sourceFourfoldCandidateCount:certificate.fourfoldCandidateCount,sourceBoundedStatementPass:certificate.boundedStatementPass,equivalencePass,exhaustiveWithinSourceBox:true,terminalForGlobalClaim:false,exteriorOpen:true,exteriorStatement:'R298 exactly compiles pair-star compatibility only for the bounded R297 collision atlas. Absence of a coherent four-tuple here does not exclude values outside that source box or close G09/G10/G13.'};
}
