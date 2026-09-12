// R306 Blade Geometry formalization.
// Source-bound software operator recovered from the user's Blade Geometry artifact:
// SYSTEM = (GENERATOR, CONSTRAINTS, INVARIANTS, SYMMETRY, OBJECTIVE).
// This is a finite state-space reduction / quotient operator. It is NOT a new physical law,
// does not assert a universal complexity bound, and owns no CanonState, routing, execution,
// proof-admission, persistence, deployment, empirical, or clinical authority.

export const BLADE_GEOMETRY_R306_REVISION='R306';
export const BLADE_GEOMETRY_R306_OPERATOR=Object.freeze([
 'GENERATOR / STATE SPACE',
 'LEGAL TRANSITIONS / CONSTRAINTS',
 'INVARIANT PARTITION',
 'SYMMETRY / EQUIVALENCE QUOTIENT',
 'REDUCED OBJECTIVE',
 'LIFT TO ORIGINAL STATE SPACE'
]);
export const BLADE_GEOMETRY_R306_TRUTH=Object.freeze({
 schema:'OMEGA_BLADE_GEOMETRY_R306',
 authority:'DETERMINISTIC_FINITE_SEARCH_REDUCTION_ONLY',
 sourceLaw:'SYSTEM = (GENERATOR, CONSTRAINTS, INVARIANTS, SYMMETRY, OBJECTIVE)',
 transitionLaw:'For every declared legal edge s→s′, the declared invariant key must be unchanged.',
 quotientLaw:'An orbit/equivalence class may be reduced to one representative only when it remains inside one invariant class and the declared objective is constant on that orbit.',
 liftLaw:'A representative result may be lifted back only after the invariant, orbit, objective and transition gates all pass.',
 continuity:'PARTITION → LEGAL TRANSFORM → INVARIANT CARRY → RESIDUAL/SCAR CARRY → QUOTIENT/RE-CONTEXTUALIZE → LIFT',
 boundary:'Exact only for the supplied finite state set, transition relation, invariant map, orbit/equivalence map and objective. No generic polynomial/constant-time claim, physical-geometry claim, empirical claim, or Canon/execution authority is implied.'
});

const stable=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true});
const valueKey=v=>typeof v==='string'?v:JSON.stringify(v);

export function compileBladeGeometryR306(input={}){
 const states=Array.isArray(input.states)?input.states:[];
 const idOf=typeof input.idOf==='function'?input.idOf:(s=>s?.id);
 const transitions=typeof input.transitions==='function'?input.transitions:(()=>[]);
 const invariantKey=typeof input.invariantKey==='function'?input.invariantKey:(s=>s?.invariant);
 const orbitKey=typeof input.orbitKey==='function'?input.orbitKey:(s=>s?.orbit);
 const objective=typeof input.objective==='function'?input.objective:(s=>Boolean(s?.objective));
 const residuals=[];
 const byId=new Map();
 for(const state of states){
  const id=String(idOf(state));
  if(!id||id==='undefined'||id==='null'){residuals.push({kind:'MISSING_STATE_ID'});continue}
  if(byId.has(id)){residuals.push({kind:'DUPLICATE_STATE_ID',stateId:id});continue}
  byId.set(id,state);
 }
 const ids=[...byId.keys()].sort(stable);
 const invariantById=new Map(ids.map(id=>[id,valueKey(invariantKey(byId.get(id)))]));
 const orbitById=new Map(ids.map(id=>[id,valueKey(orbitKey(byId.get(id)))]));
 const objectiveById=new Map(ids.map(id=>[id,Boolean(objective(byId.get(id)))]));

 for(const id of ids){
  const raw=transitions(byId.get(id));
  const nextIds=Array.isArray(raw)?raw.map(x=>String(typeof x==='object'?idOf(x):x)):[];
  for(const targetId of nextIds){
   if(!byId.has(targetId)){residuals.push({kind:'ILLEGAL_TRANSITION_TARGET',stateId:id,targetId});continue}
   if(invariantById.get(id)!==invariantById.get(targetId))residuals.push({kind:'INVARIANT_VIOLATION',stateId:id,targetId,from:invariantById.get(id),to:invariantById.get(targetId)});
  }
 }

 const partitions=new Map();
 for(const id of ids){const key=invariantById.get(id);if(!partitions.has(key))partitions.set(key,[]);partitions.get(key).push(id)}
 const orbits=new Map();
 for(const id of ids){const key=orbitById.get(id);if(!orbits.has(key))orbits.set(key,[]);orbits.get(key).push(id)}
 for(const [orbit,members] of orbits){
  const invariants=new Set(members.map(id=>invariantById.get(id)));
  if(invariants.size!==1)residuals.push({kind:'ORBIT_CROSSES_INVARIANT_CLASS',orbit,members:[...members]});
  const objectives=new Set(members.map(id=>objectiveById.get(id)));
  if(objectives.size!==1)residuals.push({kind:'OBJECTIVE_NOT_ORBIT_INVARIANT',orbit,members:[...members]});
 }

 const exact=residuals.length===0&&ids.length===states.length;
 const representatives=[...orbits.entries()].sort(([a],[b])=>stable(a,b)).map(([orbit,members])=>({orbit,representative:[...members].sort(stable)[0],members:[...members].sort(stable),objective:objectiveById.get([...members].sort(stable)[0])}));
 const reducedSolutions=exact?representatives.filter(x=>x.objective).map(x=>x.representative):[];
 const liftedSolutions=exact?representatives.filter(x=>x.objective).flatMap(x=>x.members).sort(stable):[];
 return Object.freeze({
  schema:BLADE_GEOMETRY_R306_TRUTH.schema,revision:BLADE_GEOMETRY_R306_REVISION,exact,
  counts:{states:ids.length,invariantClasses:partitions.size,orbits:orbits.size,reducedStates:representatives.length,reduction:ids.length?1-representatives.length/ids.length:0},
  representatives,reducedSolutions,liftedSolutions,residuals,
  operator:BLADE_GEOMETRY_R306_OPERATOR,truth:BLADE_GEOMETRY_R306_TRUTH
 });
}

export function bladeGeometryDemoR306(){
 const states=Array.from({length:12},(_,id)=>({id}));
 return compileBladeGeometryR306({
  states,
  idOf:s=>s.id,
  transitions:s=>[(s.id+4)%12],
  invariantKey:s=>s.id%2,
  orbitKey:s=>s.id%4,
  objective:s=>s.id%4===0
 });
}
