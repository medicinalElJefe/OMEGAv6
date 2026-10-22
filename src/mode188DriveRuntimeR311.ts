import {DRIVE_CANON_SOURCE} from './driveCanonSource';

const finite=(x:any)=>Number.isFinite(Number(x));
const num=(x:any)=>finite(x)?Number(x):0;
const fmt=(x:number)=>Number.isFinite(x)?Number(x.toFixed(9)):0;

export type Mode188DecisionR311='STAY'|'TURN'|'ESCALATE';

export const MODE188_DRIVE_AUTHORITY_R311=Object.freeze({
  schema:'OMEGA_MODE188_DRIVE_RUNTIME_R311',
  workbook:DRIVE_CANON_SOURCE.runtimeWorkbook,
  driveFileId:DRIVE_CANON_SOURCE.runtimeWorkbookDriveFileId,
  controlSheet:DRIVE_CANON_SOURCE.runtimeControlSheet,
  runtimeSheet:DRIVE_CANON_SOURCE.runtimeFormulaSheet,
  formula:'Sratio=CΩ/(Λ+q+γ(Λ·q)+ε)',
  decision:'IF(AND(Sratio>=Stay_Threshold,NOT(D∈{10,11})),STAY,IF(OR(Sratio<Escalate_Threshold,AND(D=11,q>0.5)),ESCALATE,TURN))',
  inputMapping:{continuity:'record.metrics.continuity ← predict.continuity',ledger:'record.metrics.burden ← predict.ledger_burden',contradiction:'record.metrics.contradiction ← predict.contradiction_q',domain:'record.coordinates.d + 1'},
  authority:'FORMULA_EXACT_PACKET_INPUTS',
  empirical:false,
  canonicalMutation:false,
  boundary:'The Sratio and decision law are exact transcriptions of the declared Drive workbook. Runtime values are recomputed from the hosted source-derived packet channels; this does not claim that browser channels are fresh external measurements or literal physical telemetry.'
} as const);

export function evaluateMode188DriveRuntimeR311(record:any){
  const C=num(record?.metrics?.continuity),ledger=Math.max(0,num(record?.metrics?.burden)),q=Math.max(0,num(record?.metrics?.contradiction));
  const domain=Math.max(1,Math.min(12,Math.floor(num(record?.coordinates?.d))+1));
  const controls=DRIVE_CANON_SOURCE.controls,gamma=controls.Gamma_LambdaQ,epsilon=controls.Epsilon;
  const denominator=ledger+q+gamma*(ledger*q)+epsilon;
  const sratio=denominator>0?C/denominator:0;
  const turnCorridor=domain===10||domain===11;
  const escalationCorridor=domain===11&&q>.5;
  const decision:Mode188DecisionR311=sratio>=controls.Stay_Threshold&&!turnCorridor?'STAY':sratio<controls.Escalate_Threshold||escalationCorridor?'ESCALATE':'TURN';
  const thresholdBand=sratio>=controls.Stay_Threshold?'STAY_THRESHOLD':sratio>=controls.Turn_Threshold?'TURN_HIGH':sratio>=controls.Escalate_Threshold?'TURN_LOW':'ESCALATE_THRESHOLD';
  const packetGate=String(record?.metrics?.mode188||'UNKNOWN');
  const comparablePacketGate=(['STAY','TURN','ESCALATE'] as const).includes(packetGate as Mode188DecisionR311)?packetGate as Mode188DecisionR311:null;
  return{
    schema:MODE188_DRIVE_AUTHORITY_R311.schema,
    authority:MODE188_DRIVE_AUTHORITY_R311.authority,
    source:{workbook:MODE188_DRIVE_AUTHORITY_R311.workbook,driveFileId:MODE188_DRIVE_AUTHORITY_R311.driveFileId,controlSheet:MODE188_DRIVE_AUTHORITY_R311.controlSheet,runtimeSheet:MODE188_DRIVE_AUTHORITY_R311.runtimeSheet},
    inputs:{continuity:fmt(C),ledger:fmt(ledger),contradiction:fmt(q),domain},
    controls,
    denominator:fmt(denominator),
    sratio:fmt(sratio),
    thresholdBand,
    turnCorridor,
    escalationCorridor,
    decision,
    packetGate,
    packetGateComparable:comparablePacketGate!==null,
    agreesWithComparablePacketGate:comparablePacketGate===null?null:comparablePacketGate===decision,
    formula:MODE188_DRIVE_AUTHORITY_R311.formula,
    decisionFormula:MODE188_DRIVE_AUTHORITY_R311.decision,
    canonicalMutation:false,
    empirical:false,
    boundary:MODE188_DRIVE_AUTHORITY_R311.boundary
  };
}

export function auditMode188DriveRuntimeR311(){
  const c=DRIVE_CANON_SOURCE.controls;
  const controlsExact=c.Gamma_LambdaQ===.35&&c.Epsilon===.05&&c.Stay_Threshold===1.05&&c.Turn_Threshold===.9&&c.Escalate_Threshold===.75&&c.Adjacency_Weight===.12&&c.Congruence_Weight===.18&&c.Host_Coverage_Weight===.22&&c.Seed_Weight===.26&&c.Regulation_Weight===.22&&c.Mode===188;
  return{passed:controlsExact&&DRIVE_CANON_SOURCE.states===20736&&DRIVE_CANON_SOURCE.baseStates===1728,controlsExact,stateCount:DRIVE_CANON_SOURCE.states,baseStateCount:DRIVE_CANON_SOURCE.baseStates,sourceWorkbook:DRIVE_CANON_SOURCE.runtimeWorkbook,boundary:MODE188_DRIVE_AUTHORITY_R311.boundary};
}
