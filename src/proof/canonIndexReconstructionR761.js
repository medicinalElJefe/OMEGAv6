/** R761 / V27 complete index-only Canon reconstruction. 
 * A compact derived model exactly replays the six recorded numeric fields
 * and stored three-way decision in all 248,832 source records. This does
 * NOT authenticate original historical generator code, metric measurements
 * or a physical 5D manifold, and never writes CanonState.
 */
export const R761_TRUTH=Object.freeze({
 scope:'COMPLETE_NUMERIC_SOURCE_REPLAY_OF_248832_STORED_CANON_ROWS',
 sourceWorkbookSha256:'e1ccb57cdfbc78955dd6e86be110cdb91cb15a0cc78a869b74dca7e4ffa55af3',
 normalizedNumericDigestSha256:'c5560df0a6967013a46d6eb5c286298b01961329427469568407cc8a6c65eb35',
 sourceRowsMatched:248832,
 scoreAndDecisionMismatches:0,
 historicalOriginalGeneratorRecovered:false,
 unroundedHistoricalSourceProved:false,
 physicalDimensionalityProved:false,
 canonicalDecisionMutation:false,
 liveActionAuthority:false,
 globalSharpSingmaster:'OPEN'
});
const checked=(x,name)=>{if(!Number.isSafeInteger(x)||x<1||x>12)throw new RangeError(name+' must be a 1..12 integer');return x;};
const mod=(a,n)=>(a%n+n)%n;
function exact4(x,denom) {
 const n=BigInt(x),d=BigInt(denom);
 if(n<0n||d<=0n)throw new Error('positive denominator and nonnegative numerator required');
 const q=(10000n*n+d/2n)/d;
 return String(q/10000n)+'.'+String(q%10000n).padStart(4,'0');
}
export function reconstructCanonIndexR761(D,S,R,M,P){
 [D,S,R,M,P].forEach((x,i)=>checked(x,['D','S','R','M','P'][i]));
 const [d,s,r,m,p]=[D,S,R,M,P].map(x=>x-1);
 const mode=1+mod(3*D+5*S+7*R+11*M+13*P,188);
 const qN=1+mod(mode-1,12)+Math.abs(D-R)+Math.abs(S-M);
 const lambdaN=1+mod(4+d+s+r+m+p+d*s,12);
 const phiN=70-d-4*s+2*r+4*m+4*p;
 const cN=Math.min(63000,50*(105+20*d+27*s+17*r+19*m+22*p)+441*mod(s+r+m+p,6));
 // The entire coherence formula stays exact, with no premature rounding.
 const scoreN=17n*BigInt(cN)*BigInt(phiN);
 const scoreD=3780n*BigInt(1500*qN+4250*lambdaN+51);
 const decision=100n*scoreN>=42n*scoreD?'STAY':100n*scoreN>=22n*scoreD?'TURN':'ESCALATE';
 const index=((((D-1)*12+(S-1))*12+(R-1))*12+(M-1))*12+(P-1)+1;
 const key=[['D',D],['S',S],['R',R],['M',M],['P',P]].map(([k,v])=>k+String(v).padStart(2,'0')).join('-');
 return {index,key,mode188:mode,
  C:exact4(cN,63000),q:exact4(qN,34),
  lambda:exact4(lambdaN,12),Phi:exact4(phiN,180),
  score:exact4(scoreN,scoreD),decision,
  scoreNumerator:String(scoreN),scoreDenominator:String(scoreD),
  evidence:'DETERMINISTIC_RECONSTRUCTION_OF_STORED_CANON',historicalGeneratorAuthenticated:false,
  liveDecisionAuthority:false,canonicalMutation:false,physicalDimensionalityProved:false};
}