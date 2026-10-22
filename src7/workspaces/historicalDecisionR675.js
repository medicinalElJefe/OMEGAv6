// R675: quarantine-safe audit of the original CanonForge Workstation v2.2 DecisionEngine.
// Provenance: B053 > SOURCE_VAULT > Dewey_Full_PC_Runtime_188.zip >
// canonforge_workstation_v2_2_source/src/engine/DecisionEngine.js and
// src/core/InvariantGuards.js. This does NOT replace current R311/R457 authority.
const finite=(x,name)=>{if(typeof x!=='number'||!Number.isFinite(x))throw Error('R675 invalid '+name);return x};
const KINDS=['STAY','TURN','ESCALATE','INIT'];
export function inspectHistoricalDecisionR675({C,L,Q,dt=0,hysteresisMs=200,lastDecision='INIT',heldMs=0}={}){
 finite(C,'C');finite(L,'L');finite(Q,'Q');finite(dt,'dt');finite(hysteresisMs,'hysteresisMs');finite(heldMs,'heldMs');
 if(C<0||L<0||Q<0||dt<0||hysteresisMs<0||heldMs<0||!KINDS.includes(lastDecision))throw Error('R675 invalid donor decision state');
 const score=C/(L+Q+0.2*L*Q+1e-6);
 const rawDecision=score>1.05?'STAY':score>0.88?'TURN':'ESCALATE';
 const changing=rawDecision!==lastDecision;
 const holding=changing&&heldMs<hysteresisMs;
 const effectiveDecision=holding?lastDecision:rawDecision;
 const nextHeldMs=holding||!changing?heldMs+dt:0;
 const mismatch=effectiveDecision!==rawDecision;
 // The original donor guard checks instantaneous coherence of effectiveDecision.
 // It rejects mismatch even though the old hysteresis algorithm deliberately creates it.
 // Never turn a held STAY into safe RELEASE authority when raw result is ESCALATE.
 const rawEscalation=rawDecision==='ESCALATE';
 const guardedDecision=rawEscalation?'ESCALATE':(mismatch?'HELD':effectiveDecision);
 return Object.freeze({
  schema:'OMEGA_HISTORICAL_188_DECISION_AUDIT_R675',
  score,rawDecision,effectiveDecision,nextMemory:{last:holding?lastDecision:rawDecision,heldMs:nextHeldMs},
  hysteresisActive:holding,invariantConflict:mismatch,
  guardExpected:rawDecision,guardActual:effectiveDecision,
  guardedDecision,
  scar:mismatch?['HISTORICAL_DONOR_DECISION_HYSTERESIS_GUARD_CONTRADICTION']:[],
  sourceClass:'RECOVERED_B053_EXECUTABLE_DONOR',
  admittedAsCanonical:false,productionVerified:false,
  truthBoundary:'Source-level donor hysteresis and instantaneous guard disagree during transition. Raw result and held result must remain separately traceable; this audit does not replace the current SourceBacked Mode 188 or release governor.'
 });
}
