import type {R436ResolutionBundle,R436BranchStatus} from '../../src/system/canonicalDomainResolutionR436';

export type Omega7ResolutionSummary={
  headline:string;
  state:'SUPPORTED'|'BOUNDED'|'NEEDS_EVIDENCE'|'REJECTED'|'INCONSISTENT';
  detail:string;
  alternatives:string;
  technical:{
    domain:string;
    branchStatus:R436BranchStatus;
    authority:string;
    proofClass:string;
    ledgerHash:string;
    scars:string[];
    score:number|null;
  };
};

function humanState(status:R436BranchStatus):Omega7ResolutionSummary['state']{
 if(status==='RESOLVED'||status==='ACTIVE')return'SUPPORTED';
 if(status==='BOUNDED')return'BOUNDED';
 if(status==='OBSERVE_ONLY')return'NEEDS_EVIDENCE';
 if(status==='INCONSISTENT')return'INCONSISTENT';
 return'REJECTED';
}

export function humanizeR436Resolution(bundle:R436ResolutionBundle):Omega7ResolutionSummary{
 const state=humanState(bundle.branch.status);
 const copy={
  SUPPORTED:['Current result is supported by the available evidence.','OMEGA retained the evidence, assumptions, and state lineage used for this result.'],
  BOUNDED:['More than one explanation or path remains possible.','OMEGA has kept the surviving alternatives instead of forcing a single answer.'],
  NEEDS_EVIDENCE:['More evidence is needed before this can be resolved.','The current state is preserved without promoting an unsupported conclusion.'],
  REJECTED:['This path was rejected by a governing constraint.','The rejected path and its reason remain in the evidence history.'],
  INCONSISTENT:['The current data and model do not reconcile.','OMEGA found no admissible path under the current constraints; the conflict is retained for review.']
 } as const;
 const [headline,detail]=copy[state];
 return{
  headline,state,detail,
  alternatives:bundle.branch.status==='BOUNDED'?'Multiple admissible branches remain.':bundle.branch.status==='OBSERVE_ONLY'?'A new observation may distinguish the remaining possibilities.':'',
  technical:{
   domain:bundle.domain,
   branchStatus:bundle.branch.status,
   authority:bundle.node.authority,
   proofClass:bundle.node.proofClass,
   ledgerHash:bundle.ledgerHash,
   scars:[...bundle.branch.declineScars],
   score:bundle.branch.score
  }
 };
}
