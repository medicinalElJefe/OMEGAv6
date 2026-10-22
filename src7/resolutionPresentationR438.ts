import type {R436BranchStatus,R436ResolutionBundle} from '../src/system/canonicalDomainResolutionR436';

export type Omega7ResolutionState='SUPPORTED'|'BOUNDED'|'NEEDS_EVIDENCE'|'REJECTED'|'INCONSISTENT';

const stateFor=(status:R436BranchStatus):Omega7ResolutionState=>{
 if(status==='ACTIVE'||status==='RESOLVED')return'SUPPORTED';
 if(status==='BOUNDED')return'BOUNDED';
 if(status==='OBSERVE_ONLY')return'NEEDS_EVIDENCE';
 if(status==='INCONSISTENT')return'INCONSISTENT';
 return'REJECTED';
};

export function presentR436ForHumans(bundle:R436ResolutionBundle){
 const state=stateFor(bundle.branch.status);
 const copy={
  SUPPORTED:{headline:'Supported by the available evidence',detail:'OMEGA retained the source, assumptions, and state lineage used for this result.'},
  BOUNDED:{headline:'More than one possibility remains',detail:'OMEGA kept the surviving alternatives instead of forcing a single answer.'},
  NEEDS_EVIDENCE:{headline:'More evidence is needed',detail:'The current state is preserved without promoting an unsupported conclusion.'},
  REJECTED:{headline:'This path was rejected',detail:'A governing constraint failed. The rejected path and reason remain in the evidence history.'},
  INCONSISTENT:{headline:'The current data do not reconcile',detail:'No admissible path satisfies the present data, model, and constraints.'}
 } as const;
 return{
  state,
  ...copy[state],
  technical:{
   domain:bundle.domain,
   branchStatus:bundle.branch.status,
   authority:bundle.node.authority,
   proofClass:bundle.node.proofClass,
   ledgerHash:bundle.ledgerHash,
   score:bundle.branch.score,
   scars:[...bundle.branch.declineScars]
  },
  canonicalMutation:false as const
 };
}
