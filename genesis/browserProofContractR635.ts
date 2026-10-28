// R635: canonical inventory of EXISTING browser proof executors.
// This is a planning/coverage contract, not evidence that any test ran.
export type BrowserProofTarget={id:string;script:string;mode:'LOCAL_PREVIEW'|'LIVE_PRODUCTION';requiredEnvironment:string[];claim:'ROUTE_PARITY'|'HISTORICAL_TRAVERSAL'|'LIVE_HYBRID'};
export const BROWSER_PROOF_TARGETS:readonly BrowserProofTarget[]=Object.freeze([
 {id:'omega7-route-parity',script:'docs/OMEGA7_R446_USER_PARITY_BROWSER_PROOF.md',mode:'LOCAL_PREVIEW',requiredEnvironment:[],claim:'ROUTE_PARITY'},
 {id:'historical-rh-traversal',script:'tests/r622-historical-rh-graph-browser-e2e.mjs',mode:'LIVE_PRODUCTION',requiredEnvironment:['OMEGA_E2E_URL','OMEGA_EXPECTED_SHA'],claim:'HISTORICAL_TRAVERSAL'},
 {id:'hybrid-resource-governor',script:'scripts/verify_live_hybrid_resource_governor_r239.mjs',mode:'LIVE_PRODUCTION',requiredEnvironment:['OMEGA_PUBLIC_URL','OMEGA_PROMOTED_SHA'],claim:'LIVE_HYBRID'}
]);
export type BrowserProofExecution={targetId:string;script:string;environment:'preview'|'production';expectedSha:string;observedSha:string;exitCode:number;startedAt:string;finishedAt:string;artifactDigest:string};
export function assessBrowserProofExecution(e:BrowserProofExecution):{admissible:boolean;reasons:string[]}{
 const reasons:string[]=[];
 const target=BROWSER_PROOF_TARGETS.find(t=>t.id===e.targetId);
 if(!target||target.script!==e.script)reasons.push('unknown or mismatched browser proof executor');
 if(target?.mode==='LIVE_PRODUCTION'&&e.environment!=='production')reasons.push('live proof executed outside production');
 if(!/^[a-f0-9]{40}$/.test(e.expectedSha)||e.expectedSha!==e.observedSha)reasons.push('served SHA mismatch');
 if(e.exitCode!==0)reasons.push('browser proof failed');
 if(!/^[a-f0-9]{64}$/.test(e.artifactDigest))reasons.push('missing evidence artifact digest');
 if(!Number.isFinite(Date.parse(e.startedAt))||!Number.isFinite(Date.parse(e.finishedAt))||Date.parse(e.finishedAt)<Date.parse(e.startedAt))reasons.push('invalid execution interval');
 return {admissible:reasons.length===0,reasons};
}
export const BROWSER_PROOF_BOUNDARY='EXECUTION_REPORT_REQUIRES_TRUSTED_RUNNER_PROVENANCE' as const;
