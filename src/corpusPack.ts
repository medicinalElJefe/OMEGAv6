import {loadModel} from './corpusEmbedded';
export type CorpusMeta=any;
export let META:CorpusMeta|null=null;
let MODELS:Record<string,{s:number;p:number[];q:Int16Array;r2:number;res:number;min:number;max:number}>={},CATS:Record<string,Uint8Array>={},ready:Promise<void>|null=null;
const N=20736;
function decodeB64(text:string){const bin=atob(text),out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
function expandRuns(runs:number[]){const out=new Uint8Array(N);let p=0;for(let i=0;i<runs.length;i+=2){const code=runs[i],count=runs[i+1];out.fill(code,p,p+count);p+=count}if(p!==N)throw new Error(`Embedded category run length mismatch (${p}/${N})`);return out}
function load(){const model=loadModel();MODELS={};for(const m of model.models){const b=decodeB64(m.q),copy=b.slice(),q=new Int16Array(copy.buffer,copy.byteOffset,copy.byteLength/2);const expected=49+(m.p?.length||0)*144;if(q.length!==expected)throw new Error(`Embedded numeric model length mismatch for ${m.f} (${q.length}/${expected})`);MODELS[m.f]={s:m.s,p:m.p||[],q,r2:m.r2,res:m.res,min:m.min,max:m.max}}CATS={};for(const [k,v] of Object.entries(model.categories) as [string,any][])CATS[k]=expandRuns(v.r);META=model}
export function initCorpusPack(){if(ready)return ready;ready=Promise.resolve().then(()=>{if(!META)load()}).catch(e=>{ready=null;META=null;MODELS={};CATS={};throw e});return ready}
export function isCorpusReady(){return !!META&&Object.keys(MODELS).length>0}
export function decodeCoords(address:number){const a=Math.max(0,Math.min(N-1,Math.floor(address))),d=Math.floor(a/1728),r0=a%1728,p=Math.floor(r0/144),r1=r0%144,r=Math.floor(r1/12);return{d,p,r,l:r1%12}}
export function value(address:number,field:string){const m=MODELS[field];if(!m)return NaN;const c=decodeCoords(address),v=[c.d,c.p,c.r,c.l],q=m.q,s=m.s;let y=q[0]*s,off=1;for(let ax=0;ax<4;ax++)y+=q[off+ax*12+v[ax]]*s;off+=48;for(const pi of m.p){const [a,b]=META.pairIds[pi];y+=q[off+v[a]*12+v[b]]*s;off+=144}return Math.max(m.min,Math.min(m.max,y))}
export function fieldR2(field:string){return MODELS[field]?.r2??0}
export function fieldResidual(field:string){return MODELS[field]?.res??Infinity}
export function category(address:number,field:string):string{if(!META)return'';if(field==='identity.AutoPing_State')return category(address,'predict.decision');if(field==='identity.Evidence_Class')return category(address,'psc.Gate');if(field==='identity.Claim_Level')return'framework_math_validated';if(field==='identity.Discovery_Status')return'PENDING_EXTERNAL_DATA';const spec=META.categories[field],arr=CATS[field];if(!spec||!arr)return'';const a=Math.max(0,Math.min(N-1,Math.floor(address)));return spec.d[arr[a]]??''}
export function meta(){if(!META)throw new Error('Embedded corpus not initialized');return META}
