/**
 * R752: exact, reversible Lind–Singmaster Pell-family time thread.
 * Known 1975 mathematics; not a sharp Singmaster proof or physical rotation.
 * Does not mutate CanonState, source proof authority, or production.
 */
export const R752_TRUTH=Object.freeze({domain:'NUMBER_THEORY/PASCAL/PELL_PAIR_THREAD',priorArt:'SINGMASTER_1975',sharpSingmaster:'OPEN',physicalDynamics:'NOT_INFERRED',sourcePromotion:false,productionAuthority:false});
const I=x=>{if(typeof x==='bigint')return x;if(typeof x==='number'&&Number.isSafeInteger(x))return BigInt(x);if(typeof x==='string'&&/^-?(0|[1-9][0-9]*)$/.test(x))return BigInt(x);throw new TypeError('exact integer required')};
export function pellCurveR752(n,k){n=I(n);k=I(k);return n*n-(3n*k+2n)*n+k*(k+1n)}
export function pellForwardR752(n,k){n=I(n);k=I(k);return{n:8n*n-3n*k-1n,k:3n*n-k-1n}}
export function pellInverseR752(n,k){n=I(n);k=I(k);return{n:-n+3n*k+2n,k:-3n*n+8n*k+5n}}
export function pellNormR752(n,k){n=I(n);k=I(k);const x=5n*k+4n,y=2n*n-3n*k-2n;return{x,y,norm:x*x-5n*y*y}}
const anchors=[[0n,0n],[1n,0n],[-1n,0n],[0n,1n],[0n,-1n],[1n,1n]];
/** An affine substitution in a quadratic polynomial is still quadratic.
 * The six anchors are unisolvent for 1,n,k,n²,nk,k²:
 * zero at all six iff the polynomial's six rational coefficients are zero.
 * Therefore this is an exact polynomial-identity certificate for ALL inputs.
 */
export function certifyPellMapR752(coeff=[8n,-3n,-1n,3n,-1n,-1n]){
 if(!Array.isArray(coeff)||coeff.length!==6)throw new TypeError('six affine coefficients required');
 const [a,b,c,d,e,f]=coeff.map(I);
 const residuals=anchors.map(([n,k])=>pellCurveR752(a*n+b*k+c,d*n+e*k+f)-pellCurveR752(n,k));
 return{schema:'OMEGA_R752_DEGREE2_POLYNOMIAL_CERTIFICATE',isGlobalIdentity:residuals.every(z=>z===0n),anchorResiduals:residuals.map(String),basis:'1,n,k,n²,nk,k²',exactUnisolventProof:true,physicalClaim:false};
}
export function pellThreadR752(steps=128){
 if(!Number.isSafeInteger(steps)||steps<1||steps>4096)throw new RangeError('bounded nonnegative iteration count');
 const certificate=certifyPellMapR752();if(!certificate.isGlobalIdentity)throw Error('source affine map not certified');
 let n=2n,k=0n;const states=[];
 for(let t=0;t<=steps;t++){
  const next=pellForwardR752(n,k),prev=pellInverseR752(next.n,next.k);
  if(pellCurveR752(n,k)!==0n||pellNormR752(n,k).norm!==-4n||prev.n!==n||prev.k!==k)throw Error('exact carry failed');
  if(t>0&&!(k>=2n&&n-1n>=2n*(k+1n)))throw Error('left-half domain violation');
  states.push({t,n:n.toString(),k:k.toString(),Q:'0',norm:'-4',knownPair:t>0,sharpFourfoldStatus:'OPEN'});
  n=next.n;k=next.k;
 }
 return{schema:'OMEGA_R752_KNOWN_PELL_THREAD',states,certificate,truth:R752_TRUTH,autopingActivated:false,canonicalMutation:false};
}
