export const OMEGA_PACKET_SCHEMA='OMEGA_PACKET_v1' as const;
export const OMEGA_RESULT_SCHEMA='OMEGA_RESULT_v1' as const;
export const OMEGA_QUEUE_SCHEMA='OMEGA_FULLWAVE_QUEUE_v1' as const;

export type OmegaNodeId='omega-v6'|'omega-genesis'|'omega-optical'|'omega-sovereign';
export type OmegaSolver='scalar'|'rcwa'|'fdtd'|'fem';
export type OmegaGate='STAY'|'TURN'|'ESCALATE'|'PRUNE';

export interface AtlasAddress { domain:number; phase:number; regulation:number; seed:number }
export interface Geometry { pitch_nm:number; width_nm:number; length_nm:number; height_nm:number; material?:string }
export interface ProofState { gate:OmegaGate; mode188_score:number; continuity:number; burden:number; contradiction:number; scar:number }

export interface OmegaPacketV1 {
  schema:typeof OMEGA_PACKET_SCHEMA;
  packet_id:string;
  state_id:string;
  atlas_address:AtlasAddress;
  source_node:OmegaNodeId;
  source_sha:string;
  geometry:Geometry;
  wavelength_nm:number;
  sigma:-1|0|1;
  target_phase_deg:number;
  scalar_metrics?:Record<string,number>;
  proof:ProofState;
  requested_solver:OmegaSolver;
  lineage:string[];
  created_at:string;
}

export interface OmegaResultV1 {
  schema:typeof OMEGA_RESULT_SCHEMA;
  packet_id:string;
  source_packet_id:string;
  worker:OmegaNodeId;
  solver:OmegaSolver;
  solver_version:string;
  converged:boolean;
  convergence_metrics:Record<string,number|string|boolean>;
  observables:Record<string,unknown>;
  artifacts?:Record<string,string>;
  runtime_ms:number;
  lineage:string[];
  completed_at:string;
}

const inAxis=(n:number)=>Number.isInteger(n)&&n>=0&&n<12;
export function validateAtlasAddress(a:AtlasAddress){return inAxis(a.domain)&&inAxis(a.phase)&&inAxis(a.regulation)&&inAxis(a.seed)}
export function atlasIndex(a:AtlasAddress){if(!validateAtlasAddress(a))throw new Error('Invalid OMEGA 12^4 atlas address');return (((a.domain*12+a.phase)*12+a.regulation)*12+a.seed)}
export function mayPromote(p:OmegaPacketV1){return p.proof.gate==='STAY'&&p.proof.mode188_score>=1.05&&p.proof.contradiction<0.75}
export function routeTier2(p:OmegaPacketV1):OmegaSolver|null{
  if(!mayPromote(p)) return null;
  const coupling=Number(p.scalar_metrics?.crosstalk??0);
  const phaseError=Number(p.scalar_metrics?.phase_error_deg??0);
  if(coupling>0.16||phaseError>12||p.proof.scar>0.22) return 'fdtd';
  return 'rcwa';
}
export function appendLineage<T extends {lineage:string[]}>(packet:T,event:string):T{return {...packet,lineage:[...packet.lineage,event]}}
