export const SAR_PROOF_RECEIPT_SCHEMA_R342='OMEGA_SAR_PROOF_RECEIPT_R342';

export type SarProofReceiptStateR342='PASS'|'HOLD'|'REJECT';

export interface SarProofReceiptR342{
 schema:string;
 id:string;
 layer:string;
 state:SarProofReceiptStateR342;
 parents:string[];
 sourceIds:string[];
 authority:string;
 operator:string;
 gate:string;
 inputHashes:string[];
 outputHash:string|null;
 invariantCarry:string[];
 scarCarry:string[];
 resolvedScars:string[];
 resolutionProofs:string[];
 residuals?:Record<string,number|null>;
 note?:string;
}

export interface SarProofChainResultR342{
 admitted:boolean;
 reasons:string[];
 receiptCount:number;
 passed:number;
 held:number;
 rejected:number;
 terminalIds:string[];
}

const nonempty=(v:unknown)=>typeof v==='string'&&v.trim().length>0;
const sha256=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/i.test(v);
const finiteOrNull=(v:unknown)=>v==null||(typeof v==='number'&&Number.isFinite(v));
const uniq=(a:string[])=>[...new Set(a)];

export function validateSarProofReceiptR342(r:SarProofReceiptR342){
 const reasons:string[]=[];
 if(r.schema!==SAR_PROOF_RECEIPT_SCHEMA_R342)reasons.push('RECEIPT_SCHEMA_MISMATCH');
 if(!nonempty(r.id))reasons.push('RECEIPT_ID_REQUIRED');
 if(!nonempty(r.layer))reasons.push('RECEIPT_LAYER_REQUIRED');
 if(!['PASS','HOLD','REJECT'].includes(r.state))reasons.push('RECEIPT_STATE_INVALID');
 if(!Array.isArray(r.parents)||r.parents.some(x=>!nonempty(x)))reasons.push('PARENT_IDS_INVALID');
 if(r.parents.includes(r.id))reasons.push('SELF_PARENT_FORBIDDEN');
 if(uniq(r.parents).length!==r.parents.length)reasons.push('DUPLICATE_PARENT_FORBIDDEN');
 if(!Array.isArray(r.sourceIds)||!r.sourceIds.length||r.sourceIds.some(x=>!nonempty(x)))reasons.push('SOURCE_LINEAGE_REQUIRED');
 if(!nonempty(r.authority))reasons.push('AUTHORITY_REQUIRED');
 if(!nonempty(r.operator))reasons.push('OPERATOR_REQUIRED');
 if(!nonempty(r.gate))reasons.push('PROOF_GATE_REQUIRED');
 if(!Array.isArray(r.inputHashes)||r.inputHashes.some(x=>!sha256(x)))reasons.push('INPUT_HASH_INVALID');
 if(r.outputHash!=null&&!sha256(r.outputHash))reasons.push('OUTPUT_HASH_INVALID');
 if(r.state==='PASS'&&!sha256(r.outputHash))reasons.push('PASS_OUTPUT_HASH_REQUIRED');
 if(!Array.isArray(r.invariantCarry)||!r.invariantCarry.length)reasons.push('INVARIANT_CARRY_REQUIRED');
 if(!Array.isArray(r.scarCarry)||!Array.isArray(r.resolvedScars)||!Array.isArray(r.resolutionProofs))reasons.push('SCAR_LEDGER_INVALID');
 if(r.resolvedScars.length&&!r.resolutionProofs.length)reasons.push('SCAR_RESOLUTION_PROOF_REQUIRED');
 if(r.residuals&&Object.values(r.residuals).some(v=>!finiteOrNull(v)))reasons.push('RESIDUAL_VALUE_INVALID');
 if(r.state!=='PASS'&&!r.scarCarry.length&&!nonempty(r.note))reasons.push('HELD_OR_REJECTED_REASON_REQUIRED');
 return{valid:reasons.length===0,reasons};
}

export function validateSarProofChainR342(receipts:SarProofReceiptR342[]):SarProofChainResultR342{
 const reasons:string[]=[],byId=new Map<string,SarProofReceiptR342>();
 for(const r of receipts){
  const v=validateSarProofReceiptR342(r);
  for(const x of v.reasons)reasons.push(`${r.id||'<missing>'}:${x}`);
  if(byId.has(r.id))reasons.push(`${r.id}:DUPLICATE_RECEIPT_ID`);else byId.set(r.id,r);
 }
 for(const r of receipts)for(const p of r.parents)if(!byId.has(p))reasons.push(`${r.id}:PARENT_RECEIPT_MISSING:${p}`);
 const color=new Map<string,0|1|2>();
 const visit=(id:string)=>{
  const c=color.get(id)||0;if(c===1){reasons.push(`${id}:RECEIPT_CYCLE`);return}if(c===2)return;
  color.set(id,1);const r=byId.get(id);if(r)for(const p of r.parents)if(byId.has(p))visit(p);color.set(id,2);
 };
 for(const r of receipts)visit(r.id);
 for(const r of receipts){
  const parents=r.parents.map(x=>byId.get(x)).filter(Boolean) as SarProofReceiptR342[];
  if(r.state==='PASS'&&parents.some(p=>p.state!=='PASS'))reasons.push(`${r.id}:PASS_CHILD_OF_NONPASS_PARENT`);
  const requiredSources=uniq(parents.flatMap(p=>p.sourceIds));
  for(const src of requiredSources)if(!r.sourceIds.includes(src))reasons.push(`${r.id}:SOURCE_LINEAGE_DROPPED:${src}`);
  const parentScars=uniq(parents.flatMap(p=>p.scarCarry));
  for(const scar of parentScars){
   if(r.scarCarry.includes(scar))continue;
   if(r.resolvedScars.includes(scar)&&r.resolutionProofs.length)continue;
   reasons.push(`${r.id}:SCAR_DROPPED_WITHOUT_PROOF:${scar}`);
  }
 }
 const parentSet=new Set(receipts.flatMap(r=>r.parents)),terminalIds=receipts.filter(r=>!parentSet.has(r.id)).map(r=>r.id);
 return{admitted:reasons.length===0,reasons,receiptCount:receipts.length,passed:receipts.filter(r=>r.state==='PASS').length,held:receipts.filter(r=>r.state==='HOLD').length,rejected:receipts.filter(r=>r.state==='REJECT').length,terminalIds};
}

export function sarProofLedgerBoundaryR342(){
 return'Dewey/RSC proof continuity is executable: every promoted transform must preserve parent/source lineage and unresolved scars. A scar may disappear only through an explicit resolution proof. A PASS node cannot descend from a HELD or REJECTED parent, and cyclic or hash-invalid evidence chains fail closed.';
}
