// Existing R8 draft, R209 lineage, R146 run, R147 dispatch and R141 return remain owners.
export const SAI_INSPECTION_KIND='SAI_B059_PROJECT_INSPECTION';
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
export const stableInspectionJSON=v=>JSON.stringify(stable(v));
export async function inspectionSHA(v){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stableInspectionJSON(v)));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function safeRoot(root){return typeof root==='string'&&root.length<=240&&(root==='.'||root.length>0&&!root.startsWith('/')&&!/[\\:\0<>|?*]/.test(root)&&root.split('/').every(x=>x&&x!=='.'&&x!=='..'&&x.trim()===x&&!/[. ]$/.test(x)))}
export async function buildSaiInspectionDraft(prompt,root='.'){
 if(typeof prompt!=='string'||!prompt.trim()||prompt.length>12000||!safeRoot(root))throw Error('SAI_INSPECTION_INPUT_HELD');
 const body={schema:'OMEGA_HYBRID_DRAFT_V3',intentKind:SAI_INSPECTION_KIND,fingerprintAlgorithm:'CANONICAL_JSON_SHA256',state:'DRAFT_ONLY_NOT_QUEUED',prompt:prompt.trim(),root,operations:[{step:1,op:'INDEX',path:root},{step:2,op:'HASH_TREE',path:root}],confirmed:false,deviceId:null,limits:{steps:24,sourceFiles:25000,sourceBytes:2147483648,generatedBytes:536870912,changedFiles:80,missionCycles:[2,8]},truthBoundary:'Typed SAI source inspection only. Explicit operator authorization and current authenticated host required. No patch, shell, training, deployment or Canon admission.'};
 return {...body,fingerprint:await inspectionSHA(body)};
}
export async function verifySaiInspectionDraft(draft){
 try{if(!draft||draft.intentKind!==SAI_INSPECTION_KIND)return false;const expected=await buildSaiInspectionDraft(draft.prompt,draft.root);return stableInspectionJSON(expected)===stableInspectionJSON(draft)}catch{return false}
}
export async function saiInspectionSteps(draft,maxResults){
 if(!await verifySaiInspectionDraft(draft)||!Number.isInteger(maxResults)||maxResults<1||maxResults>750)throw Error('SAI_INSPECTION_DRAFT_OR_RESOURCE_HELD');
 return [{id:'S01',op:'INDEX',label:'Inspect approved source project',path:draft.root,maxResults},{id:'S02',op:'HASH_TREE',label:'Fingerprint approved source project',path:draft.root,maxResults}];
}
export async function checkSaiInspectionDispatch(metadata,input){
 try{
  if(!metadata||typeof metadata.lineageId!=='string'||!/^r209_[0-9a-f]{32}$/.test(metadata.lineageId)||typeof metadata.ancestrySha256!=='string'||!/^[0-9a-f]{64}$/.test(metadata.ancestrySha256)||metadata.lineageId!=='r209_'+metadata.ancestrySha256.slice(0,32)||typeof metadata.targetDeviceId!=='string'||!metadata.targetDeviceId||input.confirmed!==true||input.executorId!=='HYBRID_HOST'||input.targetDeviceId!==metadata.targetDeviceId||input.projectPath!==metadata.draft?.root)return false;
  const steps=await saiInspectionSteps(metadata.draft,metadata.maxResults);
  return stableInspectionJSON(steps)===stableInspectionJSON(metadata.steps)&&stableInspectionJSON(steps)===stableInspectionJSON(input.steps);
 }catch{return false}
}
