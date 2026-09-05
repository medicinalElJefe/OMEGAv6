import type {Mandala20736Field} from './mandala20736Runtime';

export type CarryOrientation=-1|0|1;
export type CarryPrimitiveR113={
 ingress:number;
 egress:number;
 blocked:number;
 residue:number;
 transmitted:number;
 balanceError:number;
};
export type VectorCarrySegmentR113={
 from:number;
 to:number;
 direction:{x:number;y:number;z:number};
 carry:{x:number;y:number;z:number};
 turn:{x:number;y:number;z:number};
 primitives:CarryPrimitiveR113;
 continuity:number;
 plasticity:number;
 contradiction:number;
 burden:number;
 contradictionGradient:number;
 turnPressure:number;
 recoverability:number;
 orientation:CarryOrientation;
 evidence:number;
};
export type ConvergenceBasinR113={
 node:number;
 indegree:number;
 score:number;
 continuity:number;
 contradiction:number;
 burden:number;
 residue:number;
 recoverability:number;
 recirculationDepth:number;
 admissible:boolean;
};
export type VectorCarryFieldR113={
 schema:'OMEGA_VECTOR_CARRY_R113';
 sourceStates:number;
 segments:VectorCarrySegmentR113[];
 basins:ConvergenceBasinR113[];
 maxBalanceError:number;
 boundary:string;
};

const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const orientation=(v:number):CarryOrientation=>Math.abs(v)<1e-7?0:v>0?1:-1;
const safeNorm=(x:number,y:number,z:number)=>{const n=Math.hypot(x,y,z)||1;return{x:x/n,y:y/n,z:z/n}};

export const VECTOR_CARRY_R113_BOUNDARY='R113 Ingress, Egress, Blocked and Residue are bounded computational carry channels derived from the existing canonical 20,736-address packet and route graph. They are not new physical primitives or measured physical dimensions. TURN and basin structures are derived projections; they do not mutate CanonState, routing authority, proof admission or empirical truth.';

function edgeCarry(field:Mandala20736Field,from:number,to:number):VectorCarrySegmentR113{
 const dx=field.x[to]-field.x[from],dy=field.y[to]-field.y[from],dz=field.z[to]-field.z[from],dir=safeNorm(dx,dy,dz);
 const continuity=clamp((field.C[from]+field.C[to])*.5),plasticity=clamp((field.Phi[from]+field.Phi[to])*.5),contradiction=clamp((field.q[from]+field.q[to])*.5),burden=clamp((field.Lambda[from]+field.Lambda[to])*.5),evidence=clamp((field.evidence[from]+field.evidence[to])*.5);
 const gate=clamp((field.continuityGate[from]+field.continuityGate[to])*.5),scar=clamp((field.scar[from]+field.scar[to])*.5);
 const egress=clamp(continuity*(.55+.45*plasticity));
 const constraint=clamp(.45*contradiction+.30*burden+.25*(1-gate));
 const ingress=clamp(egress*(1-constraint));
 const blocked=clamp(egress-ingress);
 const residue=clamp(.55*blocked+.45*scar);
 const transmitted=ingress;
 const balanceError=Math.abs(egress-ingress-blocked);
 const contradictionGradient=(field.q[to]-field.q[from])+.5*(field.Lambda[to]-field.Lambda[from]);
 const turnPressure=clamp(Math.max(0,contradictionGradient)*.55+blocked*.30+Math.min(1,Math.abs(field.acceleration[from])*2)*.15);
 const recoverability=clamp(plasticity*continuity*(1-contradiction)*(1-residue));
 const sigma=orientation(field.velocity[from]);
 const turnDir=safeNorm(-dir.y*sigma,dir.x*sigma,(field.phase[to]-field.phase[from])*.12);
 return{from,to,direction:dir,carry:{x:dir.x*transmitted,y:dir.y*transmitted,z:dir.z*transmitted},turn:{x:turnDir.x*turnPressure,y:turnDir.y*turnPressure,z:turnDir.z*turnPressure},primitives:{ingress,egress,blocked,residue,transmitted,balanceError},continuity,plasticity,contradiction,burden,contradictionGradient,turnPressure,recoverability,orientation:sigma,evidence};
}

function recirculationDepth(field:Mandala20736Field,start:number,maxDepth=12){const seen=new Map<number,number>();let n=start;for(let depth=0;depth<=maxDepth;depth++){if(seen.has(n))return depth-(seen.get(n)??depth);seen.set(n,depth);const next=field.routeNext[n];if(next>=field.count)return 0;n=next}return 0}

export function compileVectorCarryR113(field:Mandala20736Field,maxSegments=320,maxBasins=24):VectorCarryFieldR113{
 const indegree=new Uint16Array(field.count);for(let i=0;i<field.count;i++){const to=field.routeNext[i];if(to<field.count&&to!==i)indegree[to]++}
 const step=Math.max(1,Math.floor(field.count/Math.max(1,maxSegments))),segments:VectorCarrySegmentR113[]=[];let maxBalanceError=0;
 for(let from=0;from<field.count&&segments.length<maxSegments;from+=step){const to=field.routeNext[from];if(to===from||to>=field.count)continue;const segment=edgeCarry(field,from,to);maxBalanceError=Math.max(maxBalanceError,segment.primitives.balanceError);segments.push(segment)}
 const basins:ConvergenceBasinR113[]=[];for(let node=0;node<field.count;node++){const incoming=indegree[node];if(incoming<2)continue;const continuity=clamp(field.C[node]),contradiction=clamp(field.q[node]),burden=clamp(field.Lambda[node]),plasticity=clamp(field.Phi[node]),residue=clamp(.55*field.scar[node]+.25*contradiction+.20*burden),recoverability=clamp(plasticity*continuity*(1-contradiction)*(1-residue)),convergence=1-Math.exp(-incoming/3),score=clamp(convergence*continuity*(1-contradiction)*(1-residue)*(.5+.5*plasticity)),loop=recirculationDepth(field,node),admissible=score>=.24&&contradiction<.40&&residue<.46&&(loop>0||incoming>=3);if(score>.10)basins.push({node,indegree:incoming,score,continuity,contradiction,burden,residue,recoverability,recirculationDepth:loop,admissible})}
 basins.sort((a,b)=>Number(b.admissible)-Number(a.admissible)||b.score-a.score||b.indegree-a.indegree||a.node-b.node);
 return{schema:'OMEGA_VECTOR_CARRY_R113',sourceStates:field.count,segments,basins:basins.slice(0,maxBasins),maxBalanceError,boundary:VECTOR_CARRY_R113_BOUNDARY};
}

export function vectorCarryReceiptR113(field:Mandala20736Field){const projection=compileVectorCarryR113(field);return{schema:projection.schema,sourceStates:projection.sourceStates,segmentCount:projection.segments.length,basinCount:projection.basins.length,admissibleBasins:projection.basins.filter(x=>x.admissible).length,maxCarryBalanceError:projection.maxBalanceError,primitives:['INGRESS','EGRESS','BLOCKED','RESIDUE'] as const,orientation:'sigma ∈ {-1,0,+1}',turnLaw:'contradiction-gradient reorientation; projection only',basinLaw:'compatible convergence/recirculation with bounded residue and contradiction',boundary:projection.boundary}}
