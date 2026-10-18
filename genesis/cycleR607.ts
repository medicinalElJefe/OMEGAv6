import {appendReceipt,evaluateProposal,validateObservation,verifyChain,type Authority,type Observation,type Proposal,type Receipt} from './kernelR606';
export type GenesisCycle={id:string;observations:Observation[];proposals:Proposal[];receipts:Receipt[];openQuestions:string[];rejected:{proposalId:string;reasons:string[]}[]};
export function initializeCycle(id:string):GenesisCycle{
 if(!id.trim())throw Error('cycle identity required');
 return {id,observations:[],proposals:[],receipts:[],openQuestions:[],rejected:[]};
}
export function ingestObservation(c:GenesisCycle,o:Observation):GenesisCycle{
 const problems=validateObservation(o);
 if(problems.length)throw Error(problems.join('; '));
 if(c.observations.some(x=>x.id===o.id))throw Error('duplicate observation');
 const observations=[...c.observations,o];
 return {...c,observations,receipts:[...c.receipts,appendReceipt(c.receipts,'OBSERVE',o.id,o)]};
}
export function propose(c:GenesisCycle,p:Proposal):GenesisCycle{
 if(c.proposals.some(x=>x.id===p.id))throw Error('duplicate proposal');
 if(!p.observationIds.length||p.observationIds.some(id=>!c.observations.some(o=>o.id===id)))throw Error('proposal must reference observed evidence');
 if(!p.alternatives.length||!p.risks.length)throw Error('proposal must preserve alternatives and risks');
 return {...c,proposals:[...c.proposals,p],receipts:[...c.receipts,appendReceipt(c.receipts,'PROPOSE',p.id,p)]};
}
export function decide(c:GenesisCycle,proposalId:string,decision:'APPROVED'|'DENIED',actor:string):GenesisCycle{
 if(!actor.trim())throw Error('decision actor required');
 const p=c.proposals.find(x=>x.id===proposalId);
 if(!p)throw Error('unknown proposal');
 if(p.humanDecision!=='PENDING')throw Error('decision already finalized');
 const proposals=c.proposals.map(x=>x.id===proposalId?{...x,humanDecision:decision}:x);
 const payload={proposalId,decision,actor};
 return {...c,proposals,receipts:[...c.receipts,appendReceipt(c.receipts,'HUMAN_DECISION',proposalId,payload)]};
}
export function evaluateCycle(c:GenesisCycle,authority:Authority,now:string):GenesisCycle{
 if(!verifyChain(c.receipts))throw Error('receipt chain invalid');
 let receipts=[...c.receipts];
 const rejected=[...c.rejected];
 for(const p of c.proposals){
  const outcome=evaluateProposal(p,c.observations,authority,now);
  if(!outcome.admitted){
   rejected.push({proposalId:p.id,reasons:outcome.reasons});
   receipts=[...receipts,appendReceipt(receipts,'HELD',p.id,outcome.reasons)];
  }else{
   receipts=[...receipts,appendReceipt(receipts,'ADMISSION_CANDIDATE',p.id,{scope:p.scope,evidenceIds:p.evidenceIds})];
  }
 }
 return {...c,rejected,receipts};
}
export function preserveQuestion(c:GenesisCycle,question:string):GenesisCycle{
 if(!question.trim())throw Error('question required');
 const openQuestions=[...new Set([...c.openQuestions,question])];
 return {...c,openQuestions,receipts:[...c.receipts,appendReceipt(c.receipts,'OPEN_QUESTION',c.id,question)]};
}
