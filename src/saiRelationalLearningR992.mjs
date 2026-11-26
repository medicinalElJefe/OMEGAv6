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
  const {gradient}=lossGradientR992(weights,ds.train);
  const norm=Math.hypot(...gradient),clip=norm>5?5/norm:1;
  for(let i=0;i<PARAMS;i++)weights[i]-=learningRate*clip*gradient[i];
  validateWeights(weights);
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
