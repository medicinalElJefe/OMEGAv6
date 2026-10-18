// R630: normalize observed GitHub Actions run metadata without conflating CI and deploy.
import {createHash} from 'node:crypto';
export type GitHubRunEvidence={repository:string;headSha:string;runId:number;workflow:string;event:string;status:string;conclusion:string|null;htmlUrl:string;observedAt:string};
export type ClassifiedRun={kind:'CI_PASSED'|'CI_FAILED'|'CI_PENDING'|'UNTRUSTED';repository:string;headSha:string;runId:number;workflow:string;sourceDigest:string;productionDeploymentProven:false;browserBehaviorProven:false;reasons:string[]};
export function classifyGitHubRun(e:GitHubRunEvidence,expectedRepository:string,expectedSha:string):ClassifiedRun{
 const reasons:string[]=[];
 if(e.repository!==expectedRepository)reasons.push('repository mismatch');
 if(e.headSha!==expectedSha||!/^[a-f0-9]{40}$/.test(e.headSha))reasons.push('exact head mismatch');
 if(!Number.isSafeInteger(e.runId)||e.runId<=0||!e.workflow||!Number.isFinite(Date.parse(e.observedAt)))reasons.push('invalid run identity or timestamp');
 if(!/^https:\/\/github\.com\//.test(e.htmlUrl))reasons.push('untrusted run URL');
 if(e.event!=='pull_request'&&e.event!=='push'&&e.event!=='workflow_dispatch')reasons.push('unsupported event');
 const kind:ClassifiedRun['kind']=reasons.length?'UNTRUSTED':e.status!=='completed'?'CI_PENDING':e.conclusion==='success'?'CI_PASSED':'CI_FAILED';
 return {kind,repository:e.repository,headSha:e.headSha,runId:e.runId,workflow:e.workflow,sourceDigest:createHash('sha256').update(JSON.stringify(e)).digest('hex'),productionDeploymentProven:false,browserBehaviorProven:false,reasons};
}
export function ciRunCannotAuthorizeDeployment(e:ClassifiedRun):boolean{return !e.productionDeploymentProven&&!e.browserBehaviorProven;}
export const GITHUB_CI_PROOF_BOUNDARY='RUN_METADATA_ONLY_NO_DEPLOYMENT_OR_BROWSER_PROOF' as const;
