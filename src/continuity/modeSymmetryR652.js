// R652 mode-dependent symmetry/asymmetry operator on relational state.
// This is a computational lens, not a physical symmetry claim.
import {normalizeState,normalizeEdge} from './wovenFieldR651.js';
const MODES=Object.freeze({
 STABILIZE:{symmetric:1,asymmetric:0,plasticity:0},
 TRANSPORT:{symmetric:0.5,asymmetric:0.5,plasticity:0.5},
 EXPLORE:{symmetric:0.2,asymmetric:0.8,plasticity:1},
 HEIGHTENED:{symmetric:0.35,asymmetric:0.65,plasticity:1},
 PROOF:{symmetric:0.75,asymmetric:0.25,plasticity:0}
});
export const modeNamesR652=Object.freeze(Object.keys(MODES));
const clamp=x=>Math.max(0,Math.min(1,x));
export function symmetryProjectionR652({nodes,edges,mode='TRANSPORT',alpha=0.5}={}){
 if(!Object.hasOwn(MODES,mode))throw Error('unknown mode');
 if(typeof alpha!=='number'||!Number.isFinite(alpha)||alpha<0||alpha>1)throw Error('alpha must be [0,1]');
 if(!Array.isArray(nodes)||!nodes.length||nodes.length>20736||!Array.isArray(edges))throw Error('bounded graph required');
 const states=nodes.map(normalizeState),ids=new Set(states.map(x=>x.id));if(ids.size!==states.length)throw Error('duplicate state');
 const links=edges.map(e=>normalizeEdge(e,ids));const byId=new Map(states.map(s=>[s.id,s]));
 const pairs=new Map();for(const e of links){if(e.kind==='BLOCKED')continue;const key=[e.from,e.to].sort().join('\\u0000');if(!pairs.has(key))pairs.set(key,[]);pairs.get(key).push(e)}
 let symmetricMass=0,asymmetricMass=0;const edgesProof=[];
 for(const [key,group] of pairs){const [a,b]=key.split('\\u0000');const forward=group.filter(e=>e.from===a&&e.to===b).reduce((v,e)=>v+e.weight,0);const backward=group.filter(e=>e.from===b&&e.to===a).reduce((v,e)=>v+e.weight,0);
 const symmetry=Math.min(forward,backward),asymmetry=Math.abs(forward-backward);
 symmetricMass+=symmetry;asymmetricMass+=asymmetry;edgesProof.push({a,b,forward,backward,symmetry,asymmetry});}
 const policy=MODES[mode];const balance=policy.symmetric*symmetricMass+policy.asymmetric*asymmetricMass;
 const projected=states.map(s=>{const adjacent=edgesProof.filter(e=>e.a===s.id||e.b===s.id);const localSymmetry=adjacent.reduce((v,e)=>v+e.symmetry,0),localAsymmetry=adjacent.reduce((v,e)=>v+e.asymmetry,0);
 const denominator=localSymmetry+localAsymmetry;const symmetryRatio=denominator?localSymmetry/denominator:0;
 const motionRatio=denominator?localAsymmetry/denominator:0;
 return {id:s.id,continuity:s.continuity,burden:s.burden,contradiction:s.contradiction,scar:s.scar,plasticity:s.plasticity,symmetryRatio,motionRatio,projectedStability:clamp((1-alpha)*s.continuity+alpha*(policy.symmetric*symmetryRatio+policy.asymmetric*motionRatio)),futureConductance:clamp(s.plasticity*policy.plasticity*(1-symmetryRatio/2))};});
 return {schema:'OMEGA_MODE_SYMMETRY_PROJECTION_R652',truthClass:'COMPUTATIONAL_PROJECTION_NOT_EMPIRICAL_PHYSICS',mode,alpha,policy,totals:{symmetricMass,asymmetricMass,balance},edges:edgesProof,nodes:projected,boundary:'non-mutating mode lens; symmetry stabilizes and asymmetry supplies directional motion'};
}
