export const R314_SCHEMA='OMEGA_WOVEN_NUMERICAL_COMPUTE_R314';
export const R314_REVISION='R314';
export const R314_AUTHORITY=Object.freeze({addressing:'R240',continuity:'R265',dispatch:'R147',returnProof:'R141',history:'R146',canonAdmission:'R125',productionWriter:'.github/workflows/ci.yml',addsAuthority:false});
export const R314_NUMERICAL_CAPABILITIES=Object.freeze(['SCALAR','VECTOR','MATRIX','DAG','GRADIENT','JACOBIAN','HESSIAN','INTEGRATION','ROOT','LINEAR_SOLVE','OPTIMIZATION','FRAME_TRANSFORM','COVARIANCE_PROPAGATION','ROUND_TRIP_RESIDUAL','COMMUTATION_RESIDUAL']);
export const R314_TRUTH_BOUNDARY='R314 is a deterministic bounded numerical substrate. Numerical convergence is computation proof only; it is not empirical truth, execution proof, CanonState admission, or a literal physical-dimension claim.';

const finite=n=>{const x=Number(n);if(!Number.isFinite(x))throw new Error('R314 requires finite numeric values');return x};
const vec=v=>{if(!Array.isArray(v)||!v.length)throw new Error('R314 vector must be a non-empty array');return v.map(finite)};
const matrix=m=>{if(!Array.isArray(m)||!m.length||!Array.isArray(m[0])||!m[0].length)throw new Error('R314 matrix must be non-empty');const w=m[0].length;return m.map(r=>{if(!Array.isArray(r)||r.length!==w)throw new Error('R314 matrix rows must have equal width');return r.map(finite)})};
const same=(a,b)=>{if(a.length!==b.length)throw new Error('R314 shape mismatch')};
const norm=v=>Math.hypot(...vec(v));
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const stableStringify=value=>{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return `[${value.map(stableStringify).join(',')}]`;return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`};
export function structuralHashR314(value){let h=2166136261;for(const ch of stableStringify(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return `r314-${(h>>>0).toString(16).padStart(8,'0')}`}

export function vectorAddR314(a,b){a=vec(a);b=vec(b);same(a,b);return a.map((x,i)=>x+b[i])}
export function vectorSubR314(a,b){a=vec(a);b=vec(b);same(a,b);return a.map((x,i)=>x-b[i])}
export function scaleR314(v,s){s=finite(s);return vec(v).map(x=>x*s)}
export function dotR314(a,b){a=vec(a);b=vec(b);same(a,b);return a.reduce((s,x,i)=>s+x*b[i],0)}
export function normR314(v){return norm(v)}
export function transposeR314(m){m=matrix(m);return Array.from({length:m[0].length},(_,j)=>m.map(r=>r[j]))}
export function matmulR314(a,b){a=matrix(a);b=matrix(b);if(a[0].length!==b.length)throw new Error('R314 matmul shape mismatch');const bt=transposeR314(b);return a.map(r=>bt.map(c=>dotR314(r,c)))}
export function matvecR314(a,v){a=matrix(a);v=vec(v);if(a[0].length!==v.length)throw new Error('R314 matvec shape mismatch');return a.map(r=>dotR314(r,v))}

function evaluatedLinearResidual(A,b,x){return normR314(vectorSubR314(matvecR314(A,x),b))}
export function linearSolveR314(A,b,{pivotEpsilon=1e-12}={}){
 const originalA=matrix(A),originalB=vec(b);const M=originalA.map(r=>r.slice()),y=originalB.slice(),n=M.length;if(n!==M[0].length||y.length!==n)throw new Error('R314 linear solve requires square A and matching b');
 for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;if(Math.abs(M[p][c])<=pivotEpsilon)throw new Error('R314 singular or ill-conditioned system');[M[c],M[p]]=[M[p],M[c]];[y[c],y[p]]=[y[p],y[c]];const d=M[c][c];for(let j=c;j<n;j++)M[c][j]/=d;y[c]/=d;for(let r=0;r<n;r++){if(r===c)continue;const f=M[r][c];if(!f)continue;for(let j=c;j<n;j++)M[r][j]-=f*M[c][j];y[r]-=f*y[c]}}
 return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'LINEAR_SOLVE',value:y,residual:evaluatedLinearResidual(originalA,originalB,y),converged:true,authority:R314_AUTHORITY};
}
export const solveLinearR314=linearSolveR314;

const stepFor=(x,h)=>Math.max(Math.abs(x)*h,h);
export function gradientR314(fn,x,{relativeStep=1e-5}={}){x=vec(x);return x.map((xi,i)=>{const h=stepFor(xi,relativeStep),a=x.slice(),b=x.slice();a[i]+=h;b[i]-=h;return(finite(fn(a))-finite(fn(b)))/(2*h)})}
export function jacobianR314(fn,x,{relativeStep=1e-5}={}){x=vec(x);const y=vec(fn(x));return y.map((_,row)=>gradientR314(v=>vec(fn(v))[row],x,{relativeStep}))}
export function hessianR314(fn,x,{relativeStep=1e-4}={}){x=vec(x);const n=x.length,H=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=i;j<n;j++){const hi=stepFor(x[i],relativeStep),hj=stepFor(x[j],relativeStep),pp=x.slice(),pm=x.slice(),mp=x.slice(),mm=x.slice();pp[i]+=hi;pp[j]+=hj;pm[i]+=hi;pm[j]-=hj;mp[i]-=hi;mp[j]+=hj;mm[i]-=hi;mm[j]-=hj;const v=(finite(fn(pp))-finite(fn(pm))-finite(fn(mp))+finite(fn(mm)))/(4*hi*hj);H[i][j]=H[j][i]=v}return H}

export function integrateSimpsonR314(fn,a,b,{segments=256}={}){a=finite(a);b=finite(b);let n=Math.max(2,Math.floor(segments));if(n%2)n++;const h=(b-a)/n;let s=finite(fn(a))+finite(fn(b));for(let i=1;i<n;i++)s+=(i%2?4:2)*finite(fn(a+i*h));return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'INTEGRATION',value:s*h/3,segments:n,bounds:[a,b],converged:true,authority:R314_AUTHORITY}}

export function rootBisectionR314(fn,lo,hi,{tolerance=1e-10,maxIterations=128}={}){lo=finite(lo);hi=finite(hi);let flo=finite(fn(lo)),fhi=finite(fn(hi));if(flo===0)return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'ROOT',value:lo,residual:0,iterations:0,converged:true,authority:R314_AUTHORITY};if(flo*fhi>0)throw new Error('R314 root interval must bracket a sign change');let mid=lo,fmid=flo,i=0;for(;i<maxIterations;i++){mid=(lo+hi)/2;fmid=finite(fn(mid));if(Math.abs(fmid)<=tolerance||Math.abs(hi-lo)<=tolerance)break;if(flo*fmid<=0){hi=mid;fhi=fmid}else{lo=mid;flo=fmid}}return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'ROOT',value:mid,residual:Math.abs(fmid),iterations:i+1,converged:Math.abs(fmid)<=tolerance||Math.abs(hi-lo)<=tolerance,authority:R314_AUTHORITY}}

export function optimizeGradientR314(fn,start,{learningRate=.08,tolerance=1e-8,maxIterations=500,bounds=null}={}){let x=vec(start),fx=finite(fn(x)),i=0,converged=false;for(;i<maxIterations;i++){const g=gradientR314(fn,x);if(normR314(g)<=tolerance){converged=true;break}let rate=learningRate,accepted=false,next=x,nextFx=fx;for(let k=0;k<20;k++){next=vectorSubR314(x,scaleR314(g,rate));if(bounds)next=next.map((v,j)=>clamp(v,finite(bounds[j][0]),finite(bounds[j][1])));nextFx=finite(fn(next));if(nextFx<=fx){accepted=true;break}rate*=.5}if(!accepted)break;if(Math.abs(fx-nextFx)<=tolerance){x=next;fx=nextFx;converged=true;break}x=next;fx=nextFx}return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'OPTIMIZATION',value:x,objective:fx,gradientNorm:normR314(gradientR314(fn,x)),iterations:i+1,converged,authority:R314_AUTHORITY}}

export function affineFrameTransformR314(x,basis,{offset=null}={}){x=vec(x);basis=matrix(basis);if(basis[0].length!==x.length)throw new Error('R314 frame transform shape mismatch');const y=matvecR314(basis,x);return offset?vectorAddR314(y,vec(offset)):y}
export function propagateCovarianceR314(J,covariance){J=matrix(J);covariance=matrix(covariance);if(covariance.length!==covariance[0].length||J[0].length!==covariance.length)throw new Error('R314 covariance propagation shape mismatch');return matmulR314(matmulR314(J,covariance),transposeR314(J))}
export function roundTripResidualR314(forward,inverse,x){x=vec(x);const y=vec(forward(x)),back=vec(inverse(y));same(x,back);return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'ROUND_TRIP_RESIDUAL',residual:normR314(vectorSubR314(back,x)),forwardHash:structuralHashR314(y),returnHash:structuralHashR314(back),authority:R314_AUTHORITY}}
export function commutationResidualR314(A,B,x){x=vec(x);const ab=vec(A(vec(B(x)))),ba=vec(B(vec(A(x))));same(ab,ba);return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'COMMUTATION_RESIDUAL',residual:normR314(vectorSubR314(ab,ba)),abHash:structuralHashR314(ab),baHash:structuralHashR314(ba),authority:R314_AUTHORITY}}

const OPS={add:(a,b)=>typeof a==='number'&&typeof b==='number'?a+b:vectorAddR314(a,b),sub:(a,b)=>typeof a==='number'&&typeof b==='number'?a-b:vectorSubR314(a,b),mul:(a,b)=>finite(a)*finite(b),dot:dotR314,norm:normR314,matmul:matmulR314,matvec:matvecR314};
export function executeDagR314(nodes,{inputs={},memo=new Map(),provenance=[]}={}){
 if(!Array.isArray(nodes)||!nodes.length)throw new Error('R314 DAG requires nodes');const byId=new Map(nodes.map(n=>[String(n.id),n])),visiting=new Set(),values=new Map(),trace=[];
 const evalNode=id=>{id=String(id);if(values.has(id))return values.get(id);const node=byId.get(id);if(!node)throw new Error(`R314 missing DAG node ${id}`);if(visiting.has(id))throw new Error('R314 DAG cycle detected');visiting.add(id);let value;if(node.op==='const')value=node.value;else if(node.op==='input'){if(!(node.key in inputs))throw new Error(`R314 missing input ${node.key}`);value=inputs[node.key]}else{const fn=OPS[node.op];if(!fn)throw new Error(`R314 unsupported DAG op ${node.op}`);const args=(node.args||[]).map(evalNode);const key=structuralHashR314({op:node.op,args});if(memo.has(key))value=memo.get(key);else{value=fn(...args);memo.set(key,value)}}visiting.delete(id);values.set(id,value);trace.push({id,op:node.op,hash:structuralHashR314(value)});return value};
 const output=evalNode(nodes[nodes.length-1].id);return{schema:R314_SCHEMA,revision:R314_REVISION,kind:'DAG',output,outputHash:structuralHashR314(output),trace,provenance:[...provenance],memoEntries:memo.size,authority:R314_AUTHORITY,externalScientificTruthClaimed:false,canonAdmissionClaimed:false};
}

export function compileNumericalReceiptR314({operation,result,address=null,orientation=0,provenance=[]}={}){return{schema:R314_SCHEMA,revision:R314_REVISION,operation:String(operation||'UNSPECIFIED'),resultHash:structuralHashR314(result),address,orientation:orientation<0?-1:orientation>0?1:0,provenance:[...provenance],capabilities:[...R314_NUMERICAL_CAPABILITIES],authority:R314_AUTHORITY,truthBoundary:R314_TRUTH_BOUNDARY,physicalDimensionsClaimed:false,executionProofClaimed:false,externalScientificTruthClaimed:false,canonAdmissionClaimed:false}}
