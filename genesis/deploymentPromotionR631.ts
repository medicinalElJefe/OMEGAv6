// R631: deployment promotion evidence is not browser or capability proof.
// Inputs must be collected by a trusted deployment controller, never a worker.
export type DeploymentPromotion={repository:string;candidateSha:string;promotedSha:string;environment:string;deploymentId:string;deploymentStatus:'SUCCESS'|'FAILURE'|'PENDING';deploymentUrl:string;observedAt:string;controllerReceiptId:string};
export type PromotionVerdict={promotionConfirmed:boolean;browserVerified:false;capabilitiesVerified:false;reasons:string[]};
export function verifyPromotionRecord(p:DeploymentPromotion,expectedRepo:string,expectedSha:string,expectedEnvironment:string):PromotionVerdict{
 const reasons:string[]=[];
 if(p.repository!==expectedRepo)reasons.push('repository mismatch');
 if(!/^[a-f0-9]{40}$/.test(expectedSha)||p.candidateSha!==expectedSha||p.promotedSha!==expectedSha)reasons.push('candidate/promoted SHA mismatch');
 if(p.environment!==expectedEnvironment||!p.environment)reasons.push('environment mismatch');
 if(p.deploymentStatus!=='SUCCESS')reasons.push('deployment not successful');
 if(!p.deploymentId||!p.controllerReceiptId||!Number.isFinite(Date.parse(p.observedAt)))reasons.push('missing controller provenance');
 try{const url=new URL(p.deploymentUrl);if(url.protocol!=='https:')reasons.push('deployment URL must use HTTPS');}catch{reasons.push('invalid deployment URL');}
 return {promotionConfirmed:reasons.length===0,browserVerified:false,capabilitiesVerified:false,reasons};
}
export const PROMOTION_BOUNDARY='CONTROLLER_RECORD_NOT_BROWSER_OR_CAPABILITY_PROOF' as const;
