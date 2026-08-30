import {DRIVE_DOMAINS,DRIVE_PHASES,DRIVE_REGULATIONS,DRIVE_SEEDS} from './driveCanonSource';

export const SEMANTIC_PACKET_LANGUAGE_ID='OMEGA_SEMANTIC_PACKET_LANGUAGE_R46';
export const SEMANTIC_LANGUAGE_LAW='raw truth -> state -> pattern -> one action -> language';
export const SEMANTIC_LANGUAGE_BOUNDARY='Language is downstream of diagnosed state and pattern; narrative must not override state or pattern truth.';
export type SemanticExpression='HUMAN'|'SYMBOL'|'PROOF'|'COMMAND'|'MACHINE';
export const SEMANTIC_EXPRESSIONS:SemanticExpression[]=['HUMAN','SYMBOL','PROOF','COMMAND','MACHINE'];
const n=(v:any,d=3)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'UNKNOWN';
const finite=(v:any)=>Number.isFinite(Number(v))?Number(v):null;
function addressOf(record:any){const v=finite(record?.address);if(v!==null)return Math.max(0,Math.min(20735,Math.floor(v)));const id=finite(record?.stateId);return id!==null?Math.max(0,Math.min(20735,Math.floor(id)-1)):0}
function coords(address:number){return{d:Math.floor(address/1728),p:Math.floor(address%1728/144),r:Math.floor(address%144/12),l:address%12}}
function decision(record:any){const x=String(record?.metrics?.decision||'').toUpperCase();return x==='STAY'||x==='TURN'||x==='ESCALATE'?x:'UNRESOLVED'}
function actionFor(d:string){if(d==='STAY')return'PRESERVE / INTEGRATE';if(d==='TURN')return'REORIENT / TRANSLATE';if(d==='ESCALATE')return'ESCALATE / SEEK PROOF';return'HOLD / RESOLVE INPUTS'}
export function compileSemanticPacket(record:any){
 const address=addressOf(record),c=coords(address),m=record?.metrics||{},predict=record?.predict||{},auto=record?.autoPing||{},d=decision(record),domain=DRIVE_DOMAINS[c.d],phase=DRIVE_PHASES[c.p],regulation=DRIVE_REGULATIONS[c.r],seed=DRIVE_SEEDS[c.l],C=finite(m.continuity),Phi=finite(m.plasticity),q=finite(m.contradiction),L=finite(m.burden),scar=finite(m.scar),evidence=finite(m.evidence),geometry=finite(m.geometry),rsc=finite(m.rsc),next=finite(auto.dataNext),previous=finite(auto.previous),reconstruct=finite(predict.reconstructability),forecast=finite(predict.forecastScore);
 const known=[C,Phi,q,L].every(x=>x!==null),proofState=evidence===null?'UNKNOWN':evidence>=.72?'STRONG':evidence>=.45?'PARTIAL':'WEAK',pattern=`${domain} / ${phase} / ${regulation} / ${seed}`,action=actionFor(d),facts={stateId:address+1,address,coordinates:c,domain,phase,regulation,seed,decision:d,continuity:C,plasticity:Phi,contradiction:q,burden:L,scar,evidence,geometry,rsc,reconstructability:reconstruct,forecastScore:forecast,sourceNext:next===null?null:next+1,previous:previous===null?null:previous+1};
 const human=`State ${address+1} resolves as ${pattern}. Decision ${d}; operator action ${action}. CΩ ${n(C)}, Φ ${n(Phi)}, q ${n(q)}, Λ ${n(L)}. Evidence ${proofState}${evidence===null?'':` (${n(evidence)})`}. ${known?'The four core calculus inputs are present.':'One or more core calculus inputs are missing; interpretation remains gated.'}`;
 const symbol=`S(${c.d+1},${c.p+1},${c.r+1},${c.l+1}) :: ${domain.toUpperCase()} > ${phase.toUpperCase()} > ${regulation.toUpperCase()} > ${seed.toUpperCase()} :: [CΩ=${n(C)}|Φ=${n(Phi)}|q=${n(q)}|Λ=${n(L)}|Σ=${n(scar)}|E=${n(evidence)}] => ${d}`;
 const proof=`FACT: canonical address ${address}/20735; D/P/R/L=${c.d+1}/${c.p+1}/${c.r+1}/${c.l+1}; decision=${d}. DERIVED: pattern=${pattern}; action=${action}; proof=${proofState}. UNKNOWN: ${[C===null?'CΩ':null,Phi===null?'Φ':null,q===null?'q':null,L===null?'Λ':null,evidence===null?'evidence':null].filter(Boolean).join(', ')||'none among declared packet fields'}. BOUNDARY: ${SEMANTIC_LANGUAGE_BOUNDARY}`;
 const command=`${d}: ${action}. Operate on STATE ${address+1}; source-next ${next===null?'UNAVAILABLE':next+1}. PRUNE unsupported narrative; TRANSLATE the packet without changing it; PROVE before external or native action. Explicit operator commit remains required.`;
 return{schema:SEMANTIC_PACKET_LANGUAGE_ID,law:SEMANTIC_LANGUAGE_LAW,boundary:SEMANTIC_LANGUAGE_BOUNDARY,source:'Drive Mode188 20,736 runtime labels + software inventory S18 + downstream-language canon',facts,pattern,action,proofState,expressions:{HUMAN:human,SYMBOL:symbol,PROOF:proof,COMMAND:command,MACHINE:JSON.stringify({schema:SEMANTIC_PACKET_LANGUAGE_ID,facts,pattern,action,proofState,boundary:SEMANTIC_LANGUAGE_BOUNDARY},null,2)}};
}
export function semanticExpression(record:any,view:SemanticExpression){return compileSemanticPacket(record).expressions[view]}
