import {binomialBigIntR296,completePrimeSignatureR296,verifyCompleteKummerR296} from './singmasterExactClosureR296.js';

export const SINGMASTER_SHARDED_EXACT_SCHEMA_R297='OMEGA_SINGMASTER_SHARDED_EXACT_R297';
export const SINGMASTER_SHARDED_EXACT_REVISION_R297='R297';
export const SINGMASTER_SHARDED_EXACT_BOUNDARY_R297='R297 composes exact finite Pascal searches across deterministic column shards and exact-value buckets. Equal integers are routed to the same bucket by a function of the exact value alone, so cross-shard collisions cannot be discarded by composition. The resulting certificate remains bounded by its declared n/k box and does not prove the global Sharp Singmaster Bound or close G09/G10/G13.';
export const SINGMASTER_SHARDED_BASELINE_R297=Object.freeze({maxN:1000,maxK:100,shardWidth:3,bucketCount:64,maxCells:150000,expectedScannedCells:89001,expectedDistinctValues:88992,expectedCollisionFiberCount:8,expectedCrossShardCollisionCount:3,expectedMaxNontrivialMultiplicity:3,expectedCollisionValues:Object.freeze(['120','210','1540','3003','7140','11628','24310','61218182743304701891431482520'])});

const DOMAIN_ID='NUMBER_THEORY/PASCAL/SINGMASTER';
const CLAIM_ID='SHARP_SINGMASTER_N_LE_8';
const stable=value=>{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`};
const hash32=value=>{const text=String(value);let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const fingerprint=value=>`r297-${hash32(stable(value)).toString(16).padStart(8,'0')}`;
const compareIntegerStrings=(a,b)=>String(a).length-String(b).length||String(a).localeCompare(String(b));
export function exactValueBucketR297(value,bucketCount){if(!Number.isSafeInteger(bucketCount)||bucketCount<1)throw new Error('bucketCount must be a positive safe integer');return hash32(String(value))%bucketCount}

function boundsR297(options={}){
 const maxN=Number(options.maxN??SINGMASTER_SHARDED_BASELINE_R297.maxN),maxK=Number(options.maxK??SINGMASTER_SHARDED_BASELINE_R297.maxK),shardWidth=Number(options.shardWidth??SINGMASTER_SHARDED_BASELINE_R297.shardWidth),bucketCount=Number(options.bucketCount??SINGMASTER_SHARDED_BASELINE_R297.bucketCount),maxCells=Number(options.maxCells??SINGMASTER_SHARDED_BASELINE_R297.maxCells);
 if(!Number.isSafeInteger(maxN)||maxN<4)throw new Error('maxN must be a safe integer >= 4');
 if(!Number.isSafeInteger(maxK)||maxK<2||maxK>Math.floor(maxN/2))throw new Error('maxK must satisfy 2 <= maxK <= floor(maxN/2)');
 if(!Number.isSafeInteger(shardWidth)||shardWidth<1)throw new Error('shardWidth must be a positive safe integer');
 if(!Number.isSafeInteger(bucketCount)||bucketCount<1)throw new Error('bucketCount must be a positive safe integer');
 if(!Number.isSafeInteger(maxCells)||maxCells<1)throw new Error('maxCells must be a positive safe integer');
 let plannedCells=0;for(let k=2;k<=maxK;k+=1)plannedCells+=Math.max(0,maxN-2*k+1);
 if(plannedCells>maxCells)throw new Error(`requested exact box contains ${plannedCells} cells, above maxCells=${maxCells}`);
 return{maxN,maxK,shardWidth,bucketCount,maxCells,plannedCells};
}

export function planColumnShardsR297(options={}){
 const b=boundsR297(options),shards=[];let ordinal=0;
 for(let kStart=2;kStart<=b.maxK;kStart+=b.shardWidth){const kEnd=Math.min(b.maxK,kStart+b.shardWidth-1);let plannedCells=0;for(let k=kStart;k<=kEnd;k+=1)plannedCells+=Math.max(0,b.maxN-2*k+1);shards.push({id:`K${kStart}-${kEnd}`,ordinal:ordinal++,kStart,kEnd,maxN:b.maxN,plannedCells})}
 return{...b,shards,shardCount:shards.length};
}

function scanShardR297(shard,bucketCount){
 const buckets=Array.from({length:bucketCount},()=>new Map()),columnCounts={},valueCountByColumn={};let scannedCells=0;
 for(let k=shard.kStart;k<=shard.kEnd;k+=1){let count=0;for(let n=2*k;n<=shard.maxN;n+=1){const value=binomialBigIntR296(n,k).toString(),bucket=exactValueBucketR297(value,bucketCount),map=buckets[bucket],rows=map.get(value)||[];rows.push({n,k,shardId:shard.id});map.set(value,rows);scannedCells+=1;count+=1}columnCounts[k]=count;valueCountByColumn[k]=count}
 if(scannedCells!==shard.plannedCells)throw new Error(`shard ${shard.id} cell conservation failed`);
 const nonEmptyBuckets=buckets.reduce((n,x)=>n+(x.size?1:0),0),distinctLocal=[...buckets].reduce((n,x)=>n+x.size,0);
 return{shard:{...shard},scannedCells,columnCounts,valueCountByColumn,nonEmptyBuckets,distinctLocal,buckets,fingerprint:fingerprint({shard,scannedCells,columnCounts,distinctLocal,buckets:buckets.map((m,i)=>[i,[...m.entries()].map(([v,reps])=>[v,reps.map(r=>[r.n,r.k])])])})};
}

function mergeShardIntoBucketsR297(globalBuckets,scan){
 for(let bucket=0;bucket<scan.buckets.length;bucket+=1){const target=globalBuckets[bucket];for(const[value,reps]of scan.buckets[bucket]){if(exactValueBucketR297(value,globalBuckets.length)!==bucket)throw new Error('exact-value bucket routing drift');const rows=target.get(value)||[];target.set(value,[...rows,...reps])}}
}

function certifyFiberR297(value,reps,maxN){
 const exactValues=reps.map(x=>binomialBigIntR296(x.n,x.k));if(!exactValues.every(x=>x===exactValues[0]))throw new Error(`R297 exact fiber mismatch ${value}`);
 const signatures=reps.map(x=>({n:x.n,k:x.k,shardId:x.shardId,signature:completePrimeSignatureR296(x.n,x.k,maxN),kummer:verifyCompleteKummerR296(x.n,x.k,maxN)})),key=stable(signatures[0]?.signature||[]),signaturePass=signatures.every(x=>stable(x.signature)===key),kummerPass=signatures.every(x=>x.kummer.pass),shards=[...new Set(reps.map(x=>x.shardId))].sort();
 return{value:String(value),digits:String(value).length,multiplicity:reps.length,representations:reps.map(x=>({n:x.n,k:x.k,shardId:x.shardId})).sort((a,b)=>a.k-b.k||a.n-b.n),shards,crossShard:shards.length>1,completePrimeBound:maxN,signature:signatures[0]?.signature||[],signaturePass,kummerPass,primeChecks:signatures.reduce((n,x)=>n+x.kummer.checkCount,0),pass:signaturePass&&kummerPass};
}

export function compileSingmasterShardedExactR297(options={}){
 const plan=planColumnShardsR297(options),globalBuckets=Array.from({length:plan.bucketCount},()=>new Map()),shardReceipts=[];let scannedCells=0;
 for(const shard of plan.shards){const scan=scanShardR297(shard,plan.bucketCount);mergeShardIntoBucketsR297(globalBuckets,scan);scannedCells+=scan.scannedCells;shardReceipts.push({id:shard.id,ordinal:shard.ordinal,kStart:shard.kStart,kEnd:shard.kEnd,plannedCells:shard.plannedCells,scannedCells:scan.scannedCells,distinctLocal:scan.distinctLocal,nonEmptyBuckets:scan.nonEmptyBuckets,fingerprint:scan.fingerprint})}
 if(scannedCells!==plan.plannedCells)throw new Error('R297 global cell conservation failed');
 let distinctValues=0,mergedRepresentationCount=0;const collisionFibers=[];
 for(let bucket=0;bucket<globalBuckets.length;bucket+=1){for(const[value,reps]of globalBuckets[bucket]){distinctValues+=1;mergedRepresentationCount+=reps.length;if(exactValueBucketR297(value,plan.bucketCount)!==bucket)throw new Error('R297 coordinator bucket invariant failed');if(reps.length>=2)collisionFibers.push({...certifyFiberR297(value,reps,plan.maxN),bucket})}}
 if(mergedRepresentationCount!==scannedCells)throw new Error('R297 representation conservation failed');
 collisionFibers.sort((a,b)=>b.multiplicity-a.multiplicity||compareIntegerStrings(a.value,b.value));
 const maxNontrivialMultiplicity=collisionFibers.reduce((m,x)=>Math.max(m,x.multiplicity),1),fourfoldCandidates=collisionFibers.filter(x=>x.multiplicity>=4),crossShardCollisionCount=collisionFibers.filter(x=>x.crossShard).length,boundedStatementPass=fourfoldCandidates.length===0,bucketReceipts=globalBuckets.map((map,bucket)=>({bucket,distinctValues:map.size,representations:[...map.values()].reduce((n,reps)=>n+reps.length,0),fingerprint:fingerprint({bucket,rows:[...map.entries()].map(([value,reps])=>[value,reps.map(x=>[x.n,x.k,x.shardId])])})}));
 const core={schema:SINGMASTER_SHARDED_EXACT_SCHEMA_R297,revision:SINGMASTER_SHARDED_EXACT_REVISION_R297,domainId:DOMAIN_ID,claimId:CLAIM_ID,globalClaimStatus:'OPEN',proofScope:'EXACT_BOUNDED_SHARDED_COMPOSITION',scope:{minK:2,maxK:plan.maxK,rowConstraint:'2k <= n <= maxN',maxN:plan.maxN,plannedCells:plan.plannedCells,scannedCells},composition:{shardWidth:plan.shardWidth,shardCount:plan.shardCount,bucketCount:plan.bucketCount,routingInvariant:'bucket = H(exact integer value) mod bucketCount',sameValueSameBucketByConstruction:true,mergedRepresentationCount,cellConservation:mergedRepresentationCount===scannedCells},distinctValues,collisionFiberCount:collisionFibers.length,crossShardCollisionCount,maxNontrivialMultiplicity,fourfoldCandidateCount:fourfoldCandidates.length,boundedStatementPass,boundedStatement:`No exact coefficient in the composed box 2 <= k <= ${plan.maxK}, 2k <= n <= ${plan.maxN} has four distinct nontrivial left-half representations.`,openExterior:true,exteriorStatement:`The composed certificate is exact only inside n <= ${plan.maxN}, k <= ${plan.maxK}; the global MIXED-BOUNDARY exterior and G09/G10/G13 remain open.`,shardReceipts,bucketReceipts,collisionFibers,fourfoldCandidates,sourceMutationAuthority:false,truthMutationAuthority:false,productionAuthority:false,canonAdmissionAuthority:'R125',boundary:SINGMASTER_SHARDED_EXACT_BOUNDARY_R297};
 return{...core,fingerprint:fingerprint({scope:core.scope,composition:core.composition,shards:shardReceipts.map(x=>x.fingerprint),buckets:bucketReceipts.map(x=>x.fingerprint),collisions:collisionFibers.map(x=>[x.value,x.representations,x.signature,x.pass]),fourfold:fourfoldCandidates.map(x=>x.value)})};
}

export function compileShardedNoGoAtlasR297(certificate=compileSingmasterShardedExactR297()){
 if(certificate?.schema!==SINGMASTER_SHARDED_EXACT_SCHEMA_R297)throw new Error('R297 sharded exact certificate required');
 return{schema:'OMEGA_SINGMASTER_SHARDED_NO_GO_ATLAS_R297',revision:'R297',domainId:certificate.domainId,claimId:certificate.claimId,globalClaimStatus:'OPEN',boundedNoGo:{id:`R297-BOX-N${certificate.scope.maxN}-K${certificate.scope.maxK}`,parentFamily:'MIXED-BOUNDARY',status:certificate.boundedStatementPass?'PRUNE_EXACT_COMPOSED':'COUNTEREXAMPLE_CANDIDATE',scope:certificate.boundedStatement,exhaustiveWithinDeclaredBox:true,terminalForGlobalClaim:false,shardCount:certificate.composition.shardCount,bucketCount:certificate.composition.bucketCount,crossShardCollisionCount:certificate.crossShardCollisionCount,evidenceFingerprint:certificate.fingerprint},boundary:SINGMASTER_SHARDED_EXACT_BOUNDARY_R297};
}

export function verifyR297Baseline(){
 const certificate=compileSingmasterShardedExactR297(SINGMASTER_SHARDED_BASELINE_R297),values=certificate.collisionFibers.map(x=>x.value).sort(compareIntegerStrings),expected=[...SINGMASTER_SHARDED_BASELINE_R297.expectedCollisionValues].sort(compareIntegerStrings);
 const pass=certificate.scope.scannedCells===SINGMASTER_SHARDED_BASELINE_R297.expectedScannedCells&&certificate.distinctValues===SINGMASTER_SHARDED_BASELINE_R297.expectedDistinctValues&&certificate.collisionFiberCount===SINGMASTER_SHARDED_BASELINE_R297.expectedCollisionFiberCount&&certificate.crossShardCollisionCount===SINGMASTER_SHARDED_BASELINE_R297.expectedCrossShardCollisionCount&&certificate.maxNontrivialMultiplicity===SINGMASTER_SHARDED_BASELINE_R297.expectedMaxNontrivialMultiplicity&&certificate.fourfoldCandidateCount===0&&certificate.composition.cellConservation===true&&certificate.collisionFibers.every(x=>x.pass)&&stable(values)===stable(expected);
 return{pass,certificate,values,expected};
}
