/** R664: exact canonical-state extraction for matter-formation research.
 * Distinguishes derived model geometry from empirically calibrated matter.
 * Never infers physical density, composition, metres or radiance from atlas indices.
 */
import {getMandala20736Field} from '../../src/mandala20736Runtime';
export type FormationSampleR664={
 address:number;positionModel:[number,number,number];phase:number;
 continuity:number;plasticity:number;contradiction:number;burden:number;scar:number;
 evidence:number;geometry:number;motion:number;symmetry:number;
 velocityModel:number;accelerationModel:number;routeNext:number;
 truth:'MODEL_DERIVED';physicalReconstruction:false;
};
export type FormationBatchR664={schema:'OMEGA7_FORMATION_SOURCE_R664';count:number;samples:FormationSampleR664[];physicalAdmission:'HOLD_UNCALIBRATED';boundary:string};
export async function sampleCanonicalFormationR664(addresses:readonly number[]):Promise<FormationBatchR664>{
 const f=await getMandala20736Field();
 if(addresses.some(a=>!Number.isInteger(a)||a<0||a>=f.count))throw Error('R664 invalid canonical address');
 const samples=addresses.map(i=>({
  address:i,positionModel:[f.x[i],f.y[i],f.z[i]] as [number,number,number],phase:f.phase[i],
  continuity:f.C[i],plasticity:f.Phi[i],contradiction:f.q[i],burden:f.Lambda[i],
  scar:f.scar[i],evidence:f.evidence[i],geometry:f.geometry[i],motion:f.motion[i],
  symmetry:f.symmetry[i],velocityModel:f.velocity[i],accelerationModel:f.acceleration[i],
  routeNext:f.routeNext[i],truth:'MODEL_DERIVED' as const,physicalReconstruction:false as const
 }));
 return{schema:'OMEGA7_FORMATION_SOURCE_R664',count:f.count,samples,physicalAdmission:'HOLD_UNCALIBRATED',boundary:f.boundary};
}
export async function traceCanonicalFormationR664(start:number,steps:number){
 if(!Number.isInteger(steps)||steps<0||steps>20736)throw Error('R664 invalid steps');
 const f=await getMandala20736Field();
 if(!Number.isInteger(start)||start<0||start>=f.count)throw Error('R664 invalid start');
 const addresses:number[]=[];const firstSeen=new Map<number,number>();let at=start;let cycleStart:number|null=null;
 for(let k=0;k<=steps;k++){if(firstSeen.has(at)){cycleStart=firstSeen.get(at)!;break}firstSeen.set(at,k);addresses.push(at);at=f.routeNext[at]}
 return{...(await sampleCanonicalFormationR664(addresses)),cycleStart,terminalAddress:at,stepsRequested:steps};
}
