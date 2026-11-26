// R992: bounded experimental relational neural model, not B059 donor weights.
// Actual forward, backpropagation and optimization on an explicitly synthetic
// canonical-lattice benchmark. Separate weights, evidence and authority.
export const R992_MODEL='OMEGA_SAI_RELATIONAL_CPU_R992';
const WIDTH=8,HIDDEN=12,PARAMS=HIDDEN*(WIDTH+2)+1,BASE=20736;
const validAddress=a=>Number.isSafeInteger(a)&&a>=0&&a<BASE;
function digits(a){if(!validAddress(a))throw new RangeError('Invalid canonical address');return [Math.floor(a/1728),Math.floor(a%1728/144),Math.floor(a%144/12),a%12]}
const encode=d=>d.reduce((a,x)=>a*12+x,0);
function localSignal(a){const [d,p,r,l]=digits(a);return .5+.2*Math.sin(d*Math.PI/6)+.15*Math.cos(p*Math.PI/6)+.1*Math.sin((r-l)*Math.PI/6)}
function neighborhood(a){const d=digits(a),neighbors=[];for(let k=0;k<4;k++)for(const delta of [-1,1]){const next=d.slice();next[k]=(next[k]+delta+12)%12;neighbors.push(encode(next))}return neighbors}
export function exampleR992(address){
 const d=digits(address),own=localSignal(address),adj=neighborhood(address),mean=adj.reduce((sum,a)=>sum+localSignal(a),0)/8;
 const features=[own,mean,...d.map(x=>Math.sin(x*Math.PI/6)),Math.cos(d[0]*Math.PI/6),Math.cos(d[1]*Math.PI/6)];
 // A held-out test of a known nonlinear relational target, not empirical data.
 const target=.15+.5*own+.2*mean+.1*own*mean;
 return Object.freeze({address,features:Object.freeze(features),target,neighbors:Object.freeze(adj),source:'SYNTHETIC_PERIODIC_LATTICE_R992'});
}
function random(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}}
function validSeed(seed){if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295)throw new RangeError('Seed must be uint32');return seed}
export function initializeR992(seed=37){const rand=random(validSeed(seed));return Array.from({length:PARAMS},()=>.2*(rand()-.5))}
function validateWeights(w){if(!Array.isArray(w)||w.length!==PARAMS||!Array.from(w).every(x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=100))throw new Error('Invalid R992 weights')}
function forward(w,x){
 const h=new Float64Array(HIDDEN);let output=w[PARAMS-1];
 for(let j=0;j<HIDDEN;j++){let z=w[j*(WIDTH+1)+WIDTH];for(let i=0;i<WIDTH;i++)z+=w[j*(WIDTH+1)+i]*x[i];h[j]=Math.tanh(z);output+=w[HIDDEN*(WIDTH+1)+j]*h[j]}
 return {output,h}
}
export function predictR992(weights,address){validateWeights(weights);return forward(weights,exampleR992(address).features).output}
export function datasetR992(seed=37){
 const rand=random(validSeed(seed)),ids=Array.from({length:BASE},(_,i)=>i);
 // Deterministic without replacement: 512 train, 128 validation, 128 test.
 for(let i=0;i<768;i++){const j=i+Math.floor(rand()*(BASE-i));[ids[i],ids[j]]=[ids[j],ids[i]]}
 return {train:ids.slice(0,512).map(exampleR992),validation:ids.slice(512,640).map(exampleR992),test:ids.slice(640,768).map(exampleR992)}
}
function mse(weights,rows){let sum=0;for(const row of rows){const e=forward(weights,row.features).output-row.target;sum+=e*e}return sum/rows.length}
export function lossGradientR992(weights,rows){
 validateWeights(weights);
 if(!Array.isArray(rows)||rows.length<1||rows.length>512)throw new Error('Invalid training batch');
 const grad=new Float64Array(PARAMS);let loss=0;
 for(const row of rows){
  if(!row||!Array.isArray(row.features)||row.features.length!==WIDTH||!Array.from(row.features).every(Number.isFinite)||!Number.isFinite(row.target))throw new Error('Invalid training example');
  const {output,h}=forward(weights,row.features),e=output-row.target,d=2*e/rows.length;loss+=e*e/rows.length;grad[PARAMS-1]+=d;
  for(let j=0;j<HIDDEN;j++){const oi=HIDDEN*(WIDTH+1)+j;grad[oi]+=d*h[j];const dz=d*weights[oi]*(1-h[j]*h[j]);for(let i=0;i<WIDTH;i++)grad[j*(WIDTH+1)+i]+=dz*row.features[i];grad[j*(WIDTH+1)+WIDTH]+=dz}
 }
 if(!Number.isFinite(loss)||!Array.from(grad).every(Number.isFinite))throw new Error('Nonfinite training gradient');
 return {loss,gradient:Array.from(grad)}
}
export function trainR992({seed=37,epochs=80,learningRate=.08,initialWeights=null}={}){
 validSeed(seed);if(!Number.isSafeInteger(epochs)||epochs<1||epochs>200||!Number.isFinite(learningRate)||learningRate<=0||learningRate>.2)throw new RangeError('Training budget exceeded');
 const ds=datasetR992(seed),weights=initialWeights===null?initializeR992(seed):Array.from(initialWeights);validateWeights(weights);
 const initial={train:mse(weights,ds.train),validation:mse(weights,ds.validation),test:mse(weights,ds.test)};
 let best=weights.slice(),bestValidation=initial.validation,bestEpoch=0;
 const metrics=[];
 for(let epoch=1;epoch<=epochs;epoch++){
  updateEpochR993(weights,ds.train,learningRate);
  const validation=mse(weights,ds.validation);if(validation<bestValidation){bestValidation=validation;best=weights.slice();bestEpoch=epoch}
  metrics.push({epoch,train:mse(weights,ds.train),validation});
 }
 return {schema:R992_MODEL,seed,epochs,learningRate,parameterCount:PARAMS,source:'SYNTHETIC_PERIODIC_LATTICE_R992',backend:'CPU_FLOAT64_JAVASCRIPT',optimizer:'FULL_BATCH_GRADIENT_DESCENT_CLIPPED',initial,bestEpoch,weights:best,metrics,final:{train:mse(best,ds.train),validation:mse(best,ds.validation),test:mse(best,ds.test)},split:{train:512,validation:128,test:128},canonicalMutation:false,foundationModelLoaded:false,empirical:false};
}
export function verifyTrainingR992(run){
 if(!run||run.schema!==R992_MODEL||run.source!=='SYNTHETIC_PERIODIC_LATTICE_R992'||run.parameterCount!==PARAMS)throw new Error('Invalid model checkpoint');
 validateWeights(run.weights);const ds=datasetR992(run.seed),final={train:mse(run.weights,ds.train),validation:mse(run.weights,ds.validation),test:mse(run.weights,ds.test)};
 if(!run.final||Object.keys(final).some(k=>final[k]!==run.final[k]))throw new Error('Checkpoint evaluation mismatch');
 return final;
}

// R993 shares the exact R992 optimizer; immutable session snapshots preserve
// current weights separately from the best validation checkpoint.
export const R993_SESSION='OMEGA_SAI_TRAINING_SESSION_R993';
export const R993_MAX_EPOCHS=200;
function updateEpochR993(weights,rows,learningRate){
 const {gradient}=lossGradientR992(weights,rows);
 const norm=Math.hypot(...gradient),clip=norm>5?5/norm:1;
 for(let i=0;i<PARAMS;i++)weights[i]-=learningRate*clip*gradient[i];
 validateWeights(weights);
}
const R993_SESSION_KEYS=['schema','seed','targetEpochs','learningRate','epoch','currentWeights','bestWeights','bestEpoch','initial','metrics','status'];
function freezeSessionR993(session){
 return Object.freeze({...session,currentWeights:Object.freeze(session.currentWeights.slice()),bestWeights:Object.freeze(session.bestWeights.slice()),initial:Object.freeze({...session.initial}),metrics:Object.freeze(session.metrics.map(row=>Object.freeze({...row})))});
}
export function startTrainingR993({seed=37,targetEpochs=80,learningRate=.08}={}){
 validSeed(seed);
 if(!Number.isSafeInteger(targetEpochs)||targetEpochs<1||targetEpochs>R993_MAX_EPOCHS||typeof learningRate!=='number'||!Number.isFinite(learningRate)||learningRate<=0||learningRate>.2)throw new RangeError('Training budget exceeded');
 const ds=datasetR992(seed),weights=initializeR992(seed);
 return freezeSessionR993({schema:R993_SESSION,seed,targetEpochs,learningRate,epoch:0,currentWeights:weights,bestWeights:weights,bestEpoch:0,initial:{train:mse(weights,ds.train),validation:mse(weights,ds.validation)},metrics:[],status:'READY'});
}
function checkSessionShapeR993(s){
 if(!s||s.schema!==R993_SESSION||Object.keys(s).length!==R993_SESSION_KEYS.length||R993_SESSION_KEYS.some(k=>!Object.hasOwn(s,k)))throw new Error('Training session schema mismatch');
 validSeed(s.seed);
 if(!Number.isSafeInteger(s.targetEpochs)||s.targetEpochs<1||s.targetEpochs>R993_MAX_EPOCHS||!Number.isFinite(s.learningRate)||s.learningRate<=0||s.learningRate>.2||!Number.isSafeInteger(s.epoch)||s.epoch<0||s.epoch>s.targetEpochs||!Number.isSafeInteger(s.bestEpoch)||s.bestEpoch<0||s.bestEpoch>s.epoch||s.status!==(s.epoch===0?'READY':s.epoch===s.targetEpochs?'COMPLETE':'PAUSED')||!Array.isArray(s.metrics)||s.metrics.length!==s.epoch)throw new Error('Invalid training session progress');
 validateWeights(s.currentWeights);validateWeights(s.bestWeights);
 if(!s.initial||Object.keys(s.initial).length!==2||!['train','validation'].every(k=>Number.isFinite(s.initial[k])&&s.initial[k]>=0))throw new Error('Invalid training initial metrics');
 for(let i=0;i<s.metrics.length;i++){const row=s.metrics[i];if(!row||Object.keys(row).length!==3||row.epoch!==i+1||!['train','validation'].every(k=>Number.isFinite(row[k])&&row[k]>=0))throw new Error('Invalid epoch metrics')}
}
function advanceSessionR993(s,epochs){
 checkSessionShapeR993(s);
 if(!Number.isSafeInteger(epochs)||epochs<1||epochs>R993_MAX_EPOCHS||s.epoch===s.targetEpochs)throw new RangeError('Invalid training continuation budget');
 const ds=datasetR992(s.seed),weights=s.currentWeights.slice(),metrics=s.metrics.slice();let best=s.bestWeights.slice(),bestEpoch=s.bestEpoch,bestValidation=bestEpoch?metrics[bestEpoch-1].validation:s.initial.validation;
 const stop=Math.min(s.epoch+epochs,s.targetEpochs);
 for(let epoch=s.epoch+1;epoch<=stop;epoch++){
  updateEpochR993(weights,ds.train,s.learningRate);
  const validation=mse(weights,ds.validation);
  if(validation<bestValidation){bestValidation=validation;best=weights.slice();bestEpoch=epoch}
  metrics.push({epoch,train:mse(weights,ds.train),validation});
 }
 return freezeSessionR993({...s,epoch:stop,currentWeights:weights,bestWeights:best,bestEpoch,metrics,status:stop===s.targetEpochs?'COMPLETE':'PAUSED'});
}
// Restored packets are checked by actual optimizer replay, not merely by a
// supplied loss or checksum. Only internally generated immutable sessions
// may bypass that replay on repeated steps.
const trustedSessionsR993=new WeakSet();
export function verifySessionR993(s){
 checkSessionShapeR993(s);
 const start=startTrainingR993({seed:s.seed,targetEpochs:s.targetEpochs,learningRate:s.learningRate});
 const expected=s.epoch?advanceSessionR993(start,s.epoch):start;
 for(const key of R993_SESSION_KEYS)if(JSON.stringify(expected[key])!==JSON.stringify(s[key]))throw new Error('Training replay mismatch: '+key);
 trustedSessionsR993.add(expected);
 return expected;
}
export function advanceTrainingR993(s,epochs=4){
 const verified=trustedSessionsR993.has(s)?s:verifySessionR993(s);
 const next=advanceSessionR993(verified,epochs);
 trustedSessionsR993.add(next);return next;
}
export function completeTrainingR993(s){
 const verified=trustedSessionsR993.has(s)?s:verifySessionR993(s);
 if(verified.status!=='COMPLETE')throw new Error('Held-out test evaluation requires completed training');
 const ds=datasetR992(verified.seed),initialWeights=initializeR992(verified.seed),weights=verified.bestWeights.slice();
 return {schema:R992_MODEL,seed:verified.seed,epochs:verified.targetEpochs,learningRate:verified.learningRate,parameterCount:PARAMS,source:'SYNTHETIC_PERIODIC_LATTICE_R992',backend:'CPU_FLOAT64_JAVASCRIPT',optimizer:'FULL_BATCH_GRADIENT_DESCENT_CLIPPED',initial:{...verified.initial,test:mse(initialWeights,ds.test)},bestEpoch:verified.bestEpoch,weights,metrics:verified.metrics.map(row=>({...row})),final:{train:mse(weights,ds.train),validation:mse(weights,ds.validation),test:mse(weights,ds.test)},split:{train:512,validation:128,test:128},canonicalMutation:false,foundationModelLoaded:false,empirical:false};
}
export function chartPredictionsR993(weights,start,count){
 validateWeights(weights);
 if(!validAddress(start)||!Number.isSafeInteger(count)||count<1||count>144||start+count>BASE)throw new RangeError('Invalid prediction field region');
 return Array.from({length:count},(_,i)=>{
  const row=exampleR992(start+i),prediction=forward(weights,row.features).output;
  return {address:row.address,prediction,target:row.target,residual:prediction-row.target,source:row.source};
 });
}

// R994: exhaustive, replay-bound inference evaluation. Training/validation/test
// membership remains separate from all other addresses. The independent
// reference evaluates the same MLP without calling its forward implementation.
export const R994_AUDIT='OMEGA_SAI_RELATIONAL_FIELD_AUDIT_R994';
const auditKindsR994=['TRAIN','VALIDATION','TEST','UNUSED'];
function referencePredictionR994(weights,features){
 const hidden=Array.from({length:HIDDEN},(_,j)=>{
  const row=weights.slice(j*(WIDTH+1),(j+1)*(WIDTH+1));
  return Math.tanh(features.reduce((sum,value,i)=>sum+value*row[i],row[WIDTH]));
 });
 return hidden.reduce((sum,value,j)=>sum+value*weights[HIDDEN*(WIDTH+1)+j],weights[PARAMS-1]);
}
function auditAccumulatorR994(){return {count:0,sumSquared:0,sumAbsolute:0,sumResidual:0,maxAbsolute:0,worstAddress:null}}
function auditAddR994(a,address,residual){
 const absolute=Math.abs(residual);
 a.count++;a.sumSquared+=residual*residual;a.sumAbsolute+=absolute;a.sumResidual+=residual;
 if(a.worstAddress===null||absolute>a.maxAbsolute){a.maxAbsolute=absolute;a.worstAddress=address}
}
function auditFinishR994(a){
 if(!a.count)return {count:0,mse:null,mae:null,bias:null,maxAbsolute:null,worstAddress:null};
 return {count:a.count,mse:a.sumSquared/a.count,mae:a.sumAbsolute/a.count,bias:a.sumResidual/a.count,maxAbsolute:a.maxAbsolute,worstAddress:a.worstAddress};
}
export function evaluateFieldR994(session){
 // No legacy best-weight-only checkpoint can assert exact training lineage.
 const verified=trustedSessionsR993.has(session)?session:verifySessionR993(session);
 const model=completeTrainingR993(verified),ds=datasetR992(verified.seed);
 const memberships=new Map();
 for(const [key,rows] of [['TRAIN',ds.train],['VALIDATION',ds.validation],['TEST',ds.test]])
  for(const row of rows){if(memberships.has(row.address))throw new Error('Dataset split overlap');memberships.set(row.address,key)}
 const split=Object.fromEntries(auditKindsR994.map(k=>[k,auditAccumulatorR994()]));
 const domains=Array.from({length:12},()=>auditAccumulatorR994());
 const nodeRegions=Array.from({length:144},()=>auditAccumulatorR994());
 const full=auditAccumulatorR994();
 let maximumReferenceDifference=0;
 for(let start=0;start<BASE;start+=144){
  const rows=chartPredictionsR993(model.weights,start,144);
  for(const row of rows){
   const features=exampleR992(row.address).features,reference=referencePredictionR994(model.weights,features);
   const difference=Math.abs(reference-row.prediction);
   if(!Number.isFinite(row.prediction)||!Number.isFinite(row.residual)||!Number.isFinite(difference)||difference>1e-12)throw new Error('Independent inference mismatch at '+row.address);
   maximumReferenceDifference=Math.max(maximumReferenceDifference,difference);
   const kind=memberships.get(row.address)??'UNUSED';
   auditAddR994(split[kind],row.address,row.residual);
   auditAddR994(domains[Math.floor(row.address/1728)],row.address,row.residual);
   auditAddR994(nodeRegions[Math.floor(row.address/144)],row.address,row.residual);
   auditAddR994(full,row.address,row.residual);
  }
 }
 const splitMetrics=Object.fromEntries(auditKindsR994.map(k=>[k,auditFinishR994(split[k])]));
 if(full.count!==BASE||splitMetrics.TRAIN.count!==512||splitMetrics.VALIDATION.count!==128||splitMetrics.TEST.count!==128||splitMetrics.UNUSED.count!==19968)throw new Error('Evaluation coverage mismatch');
 // MSE sums may differ in last bits because dataset order is shuffled.
 for(const [kind,name] of [['TRAIN','train'],['VALIDATION','validation'],['TEST','test']])
  if(Math.abs(splitMetrics[kind].mse-model.final[name])>1e-12)throw new Error('Split evaluation return mismatch: '+kind);
 return {schema:R994_AUDIT,model:R992_MODEL,source:model.source,backend:model.backend,seed:verified.seed,epochs:verified.epoch,bestEpoch:verified.bestEpoch,parameterCount:PARAMS,coverage:BASE,maximumReferenceDifference,tolerance:1e-12,full:auditFinishR994(full),split:splitMetrics,domains:domains.map((a,domain)=>({domain,...auditFinishR994(a)})),nodeRegions:nodeRegions.map((a,node)=>({node,firstAddress:node*144,lastAddress:node*144+143,...auditFinishR994(a)})),evidenceClass:'SYNTHETIC_EXACT_EXECUTION',canonicalMutation:false,empirical:false};
}
export function verifyFieldAuditR994(session,audit){
 const expected=evaluateFieldR994(session);
 if(JSON.stringify(expected)!==JSON.stringify(audit))throw new Error('Field audit return mismatch');
 return expected;
}

// R995: explicit local supervised data; original R992 MLP and R993 optimizer.
export const R995_HEADER='address,f0,f1,f2,f3,f4,f5,f6,f7,target';
export const R995_MAX_BYTES=524288;
const R995_DATA='OMEGA_SAI_USER_DATASET_R995',R995_RUN='OMEGA_SAI_USER_TRAINING_R995';
const numericR995=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
export function validateDatasetR995(data){
 if(!data||data.schema!==R995_DATA||typeof data.source!=='string'||!data.source.trim()||data.source.length>256||/[\x00-\x1f]/.test(data.source)||!Array.isArray(data.rows)||data.rows.length<30||data.rows.length>768)throw Error('Invalid dataset or missing source');
 const seen=new Set(),rows=[];
 for(const row of data.rows){
  if(!row||!validAddress(row.address)||seen.has(row.address)||!Array.isArray(row.features)||row.features.length!==WIDTH||!Array.from(row.features).every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=-1&&x<=1)||typeof row.target!=='number'||!Number.isFinite(row.target)||row.target<0||row.target>1)throw Error('Invalid or duplicate dataset address/features/target');
  seen.add(row.address);rows.push(Object.freeze({address:row.address,features:Object.freeze(Array.from(row.features,x=>x===0?0:x)),target:row.target===0?0:row.target}));
 }
 return Object.freeze({schema:R995_DATA,source:data.source.trim(),rows:Object.freeze(rows.sort((a,b)=>a.address-b.address))});
}
export function parseDatasetR995(text,source){
 if(typeof text!=='string'||text.length>R995_MAX_BYTES||new TextEncoder().encode(text).length>R995_MAX_BYTES)throw Error('Dataset exceeds byte budget');
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/);if(lines.at(-1)==='')lines.pop();
 if(lines.shift()!==R995_HEADER||lines.length<30||lines.length>768)throw Error('Expected exact CSV header and 30–768 rows');
 return validateDatasetR995({schema:R995_DATA,source,rows:lines.map((line,i)=>{
 const c=line.split(',');if(c.length!==10||!/^(0|[1-9]\d*)$/.test(c[0])||c.slice(1).some(x=>!numericR995.test(x)))throw Error('Invalid CSV row '+(i+2));
 return {address:Number(c[0]),features:c.slice(1,9).map(Number),target:Number(c[9])};
 })});
}
export function splitDatasetR995(data,seed=37){
 const rows=validateDatasetR995(data).rows.slice(),rand=random(validSeed(seed));
 for(let i=rows.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]]}
 const n=Math.floor(rows.length*.6),v=Math.floor(rows.length*.2);
 return {train:rows.slice(0,n),validation:rows.slice(n,n+v),test:rows.slice(n+v)};
}
const trusted995=new WeakMap();
function snapshot995(s,ds){
 const next=Object.freeze({...s,currentWeights:Object.freeze(s.currentWeights.slice()),bestWeights:Object.freeze(s.bestWeights.slice()),initial:Object.freeze({...s.initial}),metrics:Object.freeze(s.metrics.map(x=>Object.freeze({...x})))});
 trusted995.set(next,ds);return next;
}
export function startUserTrainingR995(data,{seed=37,targetEpochs=80,learningRate=.08,authorized=false}={}){
 if(authorized!==true)throw Error('Explicit local training authorization required');
 validSeed(seed);if(!Number.isSafeInteger(targetEpochs)||targetEpochs<1||targetEpochs>200||typeof learningRate!=='number'||!Number.isFinite(learningRate)||learningRate<=0||learningRate>.2)throw RangeError('Training budget exceeded');
 const dataset=validateDatasetR995(data),ds=splitDatasetR995(dataset,seed),w=initializeR992(seed);
 return snapshot995({schema:R995_RUN,dataset,seed,targetEpochs,learningRate,epoch:0,currentWeights:w,bestWeights:w,bestEpoch:0,initial:{train:mse(w,ds.train),validation:mse(w,ds.validation)},metrics:[],status:'READY'},ds);
}
function advance995(s,epochs){
 const ds=trusted995.get(s);if(!ds||!Number.isSafeInteger(epochs)||epochs<1||epochs>200||s.epoch>=s.targetEpochs)throw Error('Invalid supervised continuation');
 const weights=s.currentWeights.slice(),metrics=s.metrics.slice();let best=s.bestWeights.slice(),bestEpoch=s.bestEpoch,bestValidation=bestEpoch?metrics[bestEpoch-1].validation:s.initial.validation;
 const stop=Math.min(s.targetEpochs,s.epoch+epochs);
 for(let epoch=s.epoch+1;epoch<=stop;epoch++){
  updateEpochR993(weights,ds.train,s.learningRate);const validation=mse(weights,ds.validation);
  if(validation<bestValidation){bestValidation=validation;best=weights.slice();bestEpoch=epoch}
  metrics.push({epoch,train:mse(weights,ds.train),validation});
 }
 return snapshot995({...s,epoch:stop,currentWeights:weights,bestWeights:best,bestEpoch,metrics,status:stop===s.targetEpochs?'COMPLETE':'PAUSED'},ds);
}
export function verifyUserTrainingR995(s){
 if(!s||s.schema!==R995_RUN||!Number.isSafeInteger(s.epoch)||s.epoch<0||s.epoch>200||!Array.isArray(s.metrics)||s.metrics.length!==s.epoch)throw Error('Invalid supervised checkpoint');
 const initial=startUserTrainingR995(s.dataset,{seed:s.seed,targetEpochs:s.targetEpochs,learningRate:s.learningRate,authorized:true});
 if(s.epoch>initial.targetEpochs)throw Error('Invalid supervised epoch');
 const expected=s.epoch?advance995(initial,s.epoch):initial;
 if(orderedCheckpointJSONR997(expected)!==orderedCheckpointJSONR997(s))throw Error('Supervised checkpoint replay mismatch');return expected;
}
export function advanceUserTrainingR995(s,epochs=4){return advance995(trusted995.has(s)?s:verifyUserTrainingR995(s),epochs)}
export function evaluateUserTrainingR995(s){
 const v=trusted995.has(s)?s:verifyUserTrainingR995(s);if(v.status!=='COMPLETE')throw Error('Complete supervised training before test evaluation');
 const ds=trusted995.get(v),initial=initializeR992(v.seed),partitions={},predictions=[];
 for(const kind of ['train','validation','test']){
  const a=auditAccumulatorR994(),baseline=auditAccumulatorR994();
  for(const row of ds[kind]){
   const prediction=forward(v.bestWeights,row.features).output,reference=referencePredictionR994(v.bestWeights,row.features),residual=prediction-row.target;
   if(!Number.isFinite(prediction)||Math.abs(reference-prediction)>1e-12)throw Error('Supervised reference mismatch');
   auditAddR994(a,row.address,residual);auditAddR994(baseline,row.address,forward(initial,row.features).output-row.target);
   predictions.push({address:row.address,partition:kind,prediction,target:row.target,residual});
  }
  partitions[kind]={...auditFinishR994(a),initialMse:auditFinishR994(baseline).mse};
 }
 return {schema:'OMEGA_SAI_USER_EVALUATION_R995',source:v.dataset.source,parameterCount:PARAMS,epoch:v.epoch,bestEpoch:v.bestEpoch,partitions,predictions:predictions.sort((a,b)=>a.address-b.address),evidenceClass:'USER_SUPPLIED_LABELS_INTERNAL_EXECUTION',empiricalVerified:false,canonicalMutation:false};
}

 // R997: object property ordering is a representation detail, not model
 // identity. Keep array order, field values, and the entire replay contract.
function orderedCheckpointJSONR997(value){
 const normalize=v=>Array.isArray(v)?v.map(normalize):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])])):v;
 return JSON.stringify(normalize(value));
}
