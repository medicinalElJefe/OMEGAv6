export type CanonAuthorityGroup='FOUNDATION'|'EXECUTION'|'LANGUAGE_RUNTIME'|'LAWS';
export type CanonAuthoritySpec={id:number;name:string;group:CanonAuthorityGroup;classification:'DONOR_EXACT_NAME_ADAPTED_RUNTIME_LENS'};
export type CanonAuthorityResult=CanonAuthoritySpec&{activation:number;state:'ACTIVE'|'WATCH'|'QUIET';basis:string};

const NAMES=[
'OVERALL CANON MODE','Unified Coherence Mode','Mode 188','Deep Mother Mode','High Father Mode','Prune / Heavy Prune Mode','Guidance Field Mode','FULL SPHERE Mode','1728D×12D Knowledge Grid','20736D Atlas Mode','Dimensional Relativity Mode','RAFT-188','Higher-Shell Rendering','Phase Elasticity Field','CTDE','Continuance Shell',
'Turn–Atlas Formalism','Ledgered Phase Metrology','Executable Atlas Generator','Quantum Packet Computation','Non-Flat Prediction Engine','HEAVY SCIENCE REVIEW','No-Nothing Truth Mode','Boundary Expansion','Γ Reality Admission Science','Dewey Calculus Mode','Relativity Geometry Calculus','HEAVY BIO MODE REVIEW','Palm Diagnostic Submode','Ingredients Analysis Mode','Seven-Star DaVinci Body Circuit','Electric Medicine / Sound Atlas',
'20736D Sound Atlas','Music Mode','Universal Language Layer','CanonForge Language Interpreter','Clip Creator Mode','Alpha Mode','Finishing the Machine Mode','Omega Runtime Sovereignty','Host-General Closure Mode','Omega Total Control Suite','Patch System Mode','One Click Deployment Mode','Recovery Board Mode','Packaging/Stabilization/Integration','Seven-Star Governance Layer','Mandala Mode',
'Color Algebra Mode','Inverse⇄Outverse Relativity Mode','Future Plasticity Law','Curvature Control Layer','Canonical Dispatch Law','False Normality Law','Plasticity Balance Law','Future Conductance Law','Healing vs Fate-Lock Geometry','Stay/Turn/Escalate Decision System','Construct 011 / Prune 01-1 System','Ledger / Scar Persistence Law','Horizon Limits vs Execution Limits','Basin / Drain / Loop / Fracture Action Families'
] as const;

function groupFor(id:number):CanonAuthorityGroup{return id<=16?'FOUNDATION':id<=32?'EXECUTION':id<=48?'LANGUAGE_RUNTIME':'LAWS'}
export const CANON_AUTHORITY_STACK:CanonAuthoritySpec[]=NAMES.map((name,i)=>({id:i+1,name,group:groupFor(i+1),classification:'DONOR_EXACT_NAME_ADAPTED_RUNTIME_LENS'}));
export const CANON_AUTHORITY_COUNT=CANON_AUTHORITY_STACK.length;

const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const mean=(...xs:number[])=>xs.reduce((a,b)=>a+cl(b),0)/Math.max(1,xs.length);
function boundedStability(x:number){return cl(x/(1+Math.abs(x))+.5)}

/**
 * R12 governance adapter.
 *
 * The 62 named authorities are preserved from the repaired ALL MODES donor map.
 * They are NOT represented as 62 additional corpus rows. The canonical corpus
 * remains 179 source-mode evaluations. This adapter exposes higher-order lenses
 * over the same read-only canonical packet so the UI can show the complete stack
 * without inventing a second HostState or double-counting executors.
 */
export function evaluateCanonAuthorityStack(record:any):CanonAuthorityResult[]{
 const m=record?.metrics||{},g=record?.geometry||{},math=record?.math||{},psc=record?.psc||{};
 const C=cl(Number(m.continuity)),Phi=cl(Number(m.plasticity)),q=cl(Number(m.contradiction)),burden=cl(Number(m.burden)),evidence=cl(Number(m.evidence)),scar=cl(Number(m.scar)),rsc=cl(Number(m.rsc)),geometry=cl(Number(m.geometry)),motion=cl(Number(math.normalizedMotionRelativity)),symmetry=cl(Number(g.symmetry)),inverse=cl(Number(g.inverseReadiness)),forecast=cl(Number(record?.predict?.forecastScore)*5),stability=boundedStability(Number(m.stability));
 const coherence=mean(C,Phi,evidence,1-q,1-burden),truth=mean(evidence,C,1-q,1-burden),future=mean(Phi,C,evidence,forecast),pressure=mean(q,burden,scar),shape=mean(geometry,motion,symmetry,inverse),relational=mean(rsc,C,1-q,evidence),operations=mean(stability,evidence,C,1-burden),expression=mean(C,Phi,shape,evidence),decision=mean(C,Phi,1-q,1-burden,stability),water=mean(C,Phi,1-burden,Number(psc.continuityScore)/5);
 return CANON_AUTHORITY_STACK.map(spec=>{
   const n=spec.name.toLowerCase();let activation=coherence,basis='CΩ · Φ · evidence · contradiction/burden bounds';
   if(/mother/.test(n)){activation=mean(C,Phi,evidence);basis='continuity · recoverability · evidence'}
   else if(/father|science|truth|reality admission|boundary|horizon/.test(n)){activation=truth;basis='evidence · law boundary · contradiction/burden control'}
   else if(/prune|false normality|ledger|scar|fate-lock|basin|drain|fracture/.test(n)){activation=pressure;basis='contradiction · burden · scar pressure'}
   else if(/guidance|future|plasticity|prediction|phase elasticity|conductance/.test(n)){activation=future;basis='future plasticity · continuity · evidence · forecast'}
   else if(/sphere|1728|20736|atlas|geometry|mandala|curvature|higher-shell|color|inverse|relativity/.test(n)){activation=shape;basis='geometry · motion relativity · symmetry · inverse readiness'}
   else if(/dewey|188|construct|stay\/turn|turn–atlas|dispatch|ctde|continuance|raft/.test(n)){activation=decision;basis='decision admissibility · continuity · plasticity · bounded pressure'}
   else if(/water/.test(n)){activation=water;basis='continuity · phase · burden · PSC continuity'}
   else if(/skin|seven-star|governance/.test(n)){activation=relational;basis='RSC · continuity · evidence · contradiction bound'}
   else if(/runtime|control|patch|deployment|recovery|packaging|finishing|closure/.test(n)){activation=operations;basis='runtime stability · evidence · continuity · burden bound'}
   else if(/sound|music|language|clip|interpreter|alpha|palm|ingredients|bio|electric/.test(n)){activation=expression;basis='expression lens over continuity · plasticity · geometry · evidence'}
   activation=cl(activation);return{...spec,activation,state:activation>=.67?'ACTIVE':activation>=.38?'WATCH':'QUIET',basis};
 });
}

export const ALL_MODES_BOUNDARY={
 sourceModeEvaluations:179,
 canonAuthorities:62,
 countingRule:'179 source-mode evaluations; 62 higher-order canon/calculus authorities are governance lenses over the same packet, not additional corpus rows.',
 truthBoundary:'Representation dimensions and canon authorities are computational/model-space structures unless separately bound to empirical evidence. They do not create missing observations or establish new physical law.'
} as const;
