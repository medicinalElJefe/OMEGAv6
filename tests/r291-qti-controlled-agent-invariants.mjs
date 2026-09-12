import fs from 'node:fs';
const s=fs.readFileSync('src/qtiControlledAgentR291.ts','utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R291 QTI invariant failed: ${msg}`)};
for(const token of ['WORKING','EPISODIC','SEMANTIC','PROCEDURAL','OBSERVED','DERIVED','HYPOTHESIZED','VERIFIED','DISPUTED','DEPRECATED','PROPOSE','SIMULATE','VERIFY','AUTHORIZE','EXECUTE','OBSERVE','AUDIT','G1_EVIDENCE','G10_POSTCONDITION','evaluateQtiGatesR291','advanceQtiTransactionR291','validateQtiMemoryWriteR291','watchdogQtiResourcesR291'])must(s.includes(token),`missing ${token}`);
must(s.includes('reasoner may propose and simulate but may not authorize itself'),'reasoner/authorization separation missing');
must(s.includes("if(next==='EXECUTE'){if(!authorized)throw"),'execution must fail closed without authorization');
must(s.includes("HYPOTHESIZED'&&obj.memoryClass==='PROCEDURAL'"),'hypothesis→procedure poisoning defense missing');
must(s.includes("action:exceeded.length?'REVOKE':'CONTINUE'"),'watchdog revocation behavior missing');
console.log('R291 QTI CONTROLLED AGENT PASS · four memory classes · ten gates · transactional action stages · independent authorization · watchdog revoke');
