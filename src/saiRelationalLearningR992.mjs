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
