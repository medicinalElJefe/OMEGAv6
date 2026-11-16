/** R862: shared local artifact envelope; model output is not host or Canon authority. */
export type OmegaArtifactR862={schema:'OMEGA_ARTIFACT_R862';id:string;route:string;kind:'MODEL_SVG';createdAt:string;mediaType:'image/svg+xml';payload:string;provenance:{engine:'MODEL_FIELD';authority:'MODEL_DERIVED';source:'R858_COMPUTED_SUCCESSOR';addressStart:number;addressEnd:number;stateCount:number};};
export const OMEGA_ARTIFACT_STORAGE_R862='omega.r862.artifacts';
const MAX_ARTIFACTS=12,MAX_BYTES=180000;
export function validateArtifactR862(value:unknown):value is OmegaArtifactR862{
 if(!value||typeof value!=='object')return false;
 const a=value as Partial<OmegaArtifactR862>;
 return a.schema==='OMEGA_ARTIFACT_R862'&&typeof a.id==='string'&&/^[a-zA-Z0-9_-]{8,100}$/.test(a.id)&&a.route==='Atlas'&&a.kind==='MODEL_SVG'&&typeof a.createdAt==='string'&&!Number.isNaN(Date.parse(a.createdAt))&&a.mediaType==='image/svg+xml'&&typeof a.payload==='string'&&a.payload.length>0&&a.payload.length<=MAX_BYTES&&a.payload.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')&&!/<script\b|<foreignObject\b|\bon\w+\s*=|<image\b|<use\b|href\s*=/i.test(a.payload)&&a.provenance?.engine==='MODEL_FIELD'&&a.provenance.authority==='MODEL_DERIVED'&&a.provenance.source==='R858_COMPUTED_SUCCESSOR'&&Number.isInteger(a.provenance.addressStart)&&a.provenance.addressStart>=1&&a.provenance.addressStart<=20736&&Number.isInteger(a.provenance.addressEnd)&&a.provenance.addressEnd>=1&&a.provenance.addressEnd<=20736&&Number.isInteger(a.provenance.stateCount)&&a.provenance.stateCount>=2&&a.provenance.stateCount<=64;
}
export function createModelArtifactR862(svg:string,route:readonly number[],now=new Date(),id?:string):OmegaArtifactR862{
 if(!Array.isArray(route)||route.length<2||route.length>64)throw Error('Computed route required');
 const artifact:OmegaArtifactR862={schema:'OMEGA_ARTIFACT_R862',id:id??('atlas-'+now.getTime()+'-'+Math.random().toString(36).slice(2,10)),route:'Atlas',kind:'MODEL_SVG',createdAt:now.toISOString(),mediaType:'image/svg+xml',payload:svg,provenance:{engine:'MODEL_FIELD',authority:'MODEL_DERIVED',source:'R858_COMPUTED_SUCCESSOR',addressStart:route[0]+1,addressEnd:route[route.length-1]+1,stateCount:route.length}};
 if(!validateArtifactR862(artifact))throw Error('Invalid model artifact envelope');
 return artifact;
}
export function decodeArtifactsR862(raw:string|null):OmegaArtifactR862[]{
 if(!raw||raw.length>MAX_BYTES*MAX_ARTIFACTS+10000)return [];
 try{const data:unknown=JSON.parse(raw);return Array.isArray(data)?data.filter(validateArtifactR862).slice(0,MAX_ARTIFACTS):[]}catch{return []}
}
export function appendArtifactR862(existing:readonly OmegaArtifactR862[],artifact:OmegaArtifactR862):OmegaArtifactR862[]{
 if(!validateArtifactR862(artifact))throw Error('Invalid artifact');
 return [artifact,...existing.filter(x=>validateArtifactR862(x)&&x.id!==artifact.id)].slice(0,MAX_ARTIFACTS);
}

/** R863: portable, explicitly untrusted transfer between local browsers/workspaces. */
export type OmegaArtifactBundleR863={schema:'OMEGA_ARTIFACT_BUNDLE_R863';exportedAt:string;artifacts:OmegaArtifactR862[]};
export function exportArtifactBundleR863(artifacts:readonly OmegaArtifactR862[],now=new Date()):string{
 if(artifacts.length>MAX_ARTIFACTS||!artifacts.every(validateArtifactR862))throw Error('Invalid artifact bundle');
 return JSON.stringify({schema:'OMEGA_ARTIFACT_BUNDLE_R863',exportedAt:now.toISOString(),artifacts});
}
export function importArtifactBundleR863(raw:string,existing:readonly OmegaArtifactR862[]):OmegaArtifactR862[]{
 if(typeof raw!=='string'||raw.length>MAX_BYTES*MAX_ARTIFACTS+10000)throw Error('Artifact bundle exceeds bounded import size');
 let bundle:unknown;try{bundle=JSON.parse(raw)}catch{throw Error('Malformed artifact bundle')}
 if(!bundle||typeof bundle!=='object')throw Error('Invalid artifact bundle');
 const b=bundle as Partial<OmegaArtifactBundleR863>;
 if(b.schema!=='OMEGA_ARTIFACT_BUNDLE_R863'||!Array.isArray(b.artifacts)||b.artifacts.length>MAX_ARTIFACTS||!b.artifacts.every(validateArtifactR862))throw Error('Artifact bundle rejected: invalid schema or provenance');
 let next=existing.filter(validateArtifactR862);
 for(const artifact of [...b.artifacts].reverse())next=appendArtifactR862(next,artifact);
 return next;
}

/** R867: same-tab workspace synchronization. Native storage events only reach other tabs. */
export const OMEGA_ARTIFACT_CHANGED_R867='omega:r867:artifact-changed';
export function notifyArtifactChangeR867(){
 if(typeof window!=='undefined')window.dispatchEvent(new Event(OMEGA_ARTIFACT_CHANGED_R867));
}
