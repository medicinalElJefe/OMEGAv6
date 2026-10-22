import crypto from 'node:crypto';

export const CAUSAL_R126_REVISION='R126' as const;
export const CAUSAL_R126_HIERARCHY={seed:1,organs:12,branches:144,cells:1728,lanes:20736} as const;
export const CAUSAL_R126_LAWS=[
 'CORRELATION_NEVER_PROMOTES_TO_CAUSATION_WITHOUT_INTERVENTION_OR_INDEPENDENT_CAUSAL_EVIDENCE',
 'EVERY_NUMERIC_OBSERVATION_REQUIRES_UNITS_FRAME_TIME_AND_PROVENANCE',
 'UNCERTAINTY_IS_CARRIED_NOT_HIDDEN',
 'OBSERVER_OR_REPRESENTATION_CHANGES_PROJECTION_NOT_CANONICAL_EVIDENCE',
 'HISTORY_SCAR_SURVIVES_RECONTEXTUALIZATION',
 'MISSING_EVIDENCE_PRODUCES_UNKNOWN_NOT_SYNTHETIC_COMPLETION',
 'AUTONOMIC_OUTPUT_IS_A_CANDIDATE_PACKET_NOT_CANONICAL_TRUTH',
 'CAUSAL_ADMISSION_REQUIRES_REPRODUCIBLE_EVIDENCE_AND_EXTERNAL_PROOF_GATE'
] as const;

export type EvidenceKind='MEASUREMENT'|'INTERVENTION'|'REPLICATION'|'MODEL'|'SOURCE'|'NEGATIVE_RESULT';
export type RelationSign=-1|0|1;
export type CausalStatus='UNKNOWN'|'CORRELATED'|'SUPPORTED_CAUSAL'|'CONTRADICTED'|'INSUFFICIENT';
export type FrameRef={space:string;time:string;orientation?:string;observer?:string};
export type Quantity={value:number;unit:string;uncertainty?:number};
export type EvidencePacket={
 id:string;
 kind:EvidenceKind;
 source:string;
 sourceFamily:string;
 observedAt:string;
 frame:FrameRef;
 quantity?:Quantity;
 claim:string;
 supports?:string[];
 contradicts?:string[];
 reproducible?:boolean;
 intervention?:boolean;
 verified:boolean;
 hash?:string;
};
export type CausalNode={id:string;label:string;domain?:number;metadata?:Record<string,unknown>};
export type CausalEdge={
 id:string;
 cause:string;
 effect:string;
 sign:RelationSign;
 lagMs?:number;
 mechanism?:string;
 evidenceIds:string[];
 status:CausalStatus;
 confidence:number;
 independentFamilies:number;
 interventionEvidence:number;
 replicationEvidence:number;
 contradictionEvidence:number;
 uncertainty:number;
};
export type CausalCompileInput={
 nodes:CausalNode[];
 edges:Array<Omit<CausalEdge,'status'|'confidence'|'independentFamilies'|'interventionEvidence'|'replicationEvidence'|'contradictionEvidence'|'uncertainty'>>;
 evidence:EvidencePacket[];
 requestedCells?:number;
 missionId?:string;
 canonicalTime?:string;
 priorScar?:Record<string,number>;
};

const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
const sha=(x:unknown)=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n);
const validIso=(s:string)=>Number.isFinite(Date.parse(s));

export function encodeCellR126(domain:number,phase:number,regulation:number){
 if(![domain,phase,regulation].every(x=>Number.isInteger(x)&&x>=0&&x<12))throw new Error('cell coordinates must be integers 0..11');
 return domain*144+phase*12+regulation;
}
export function decodeCellR126(index:number){
 if(!Number.isInteger(index)||index<0||index>=1728)throw new Error('cell index must be 0..1727');
 const domain=Math.floor(index/144),rem=index%144,phase=Math.floor(rem/12),regulation=rem%12;
 return{index,domain,phase,regulation,id:`omega-cell-${String(domain).padStart(2,'0')}-${String(phase).padStart(2,'0')}-${String(regulation).padStart(2,'0')}`};
}
export function encodeLaneR126(domain:number,phase:number,regulation:number,lens:number){
 if(!Number.isInteger(lens)||lens<0||lens>=12)throw new Error('lens must be 0..11');
 return encodeCellR126(domain,phase,regulation)*12+lens;
}

export function validateEvidenceR126(packet:EvidencePacket){
 const errors:string[]=[];
 if(!packet.id)errors.push('id');
 if(!packet.source)errors.push('source');
 if(!packet.sourceFamily)errors.push('sourceFamily');
 if(!packet.claim)errors.push('claim');
 if(!packet.verified)errors.push('verified');
 if(!validIso(packet.observedAt))errors.push('observedAt');
 if(!packet.frame?.space)errors.push('frame.space');
 if(!packet.frame?.time)errors.push('frame.time');
 if(packet.quantity){
  if(!finite(packet.quantity.value))errors.push('quantity.value');
  if(!packet.quantity.unit)errors.push('quantity.unit');
  if(packet.quantity.uncertainty!=null&&(!finite(packet.quantity.uncertainty)||packet.quantity.uncertainty!<0))errors.push('quantity.uncertainty');
 }
 const canonical={...packet,hash:undefined};
 const hash=sha(canonical);
 if(packet.hash&&packet.hash!==hash)errors.push('hash');
 return{ok:errors.length===0,errors,hash};
}

function evidenceMetrics(edgeId:string,evidence:EvidencePacket[]){
 const relevant=evidence.filter(e=>e.supports?.includes(edgeId)||e.contradicts?.includes(edgeId));
 const verified=relevant.filter(e=>validateEvidenceR126(e).ok);
 const supportive=verified.filter(e=>e.supports?.includes(edgeId));
 const contradictory=verified.filter(e=>e.contradicts?.includes(edgeId));
 const families=new Set(supportive.map(e=>e.sourceFamily));
 const interventions=supportive.filter(e=>e.kind==='INTERVENTION'||e.intervention).length;
 const replications=supportive.filter(e=>e.kind==='REPLICATION'||e.reproducible).length;
 const measurements=supportive.filter(e=>e.kind==='MEASUREMENT').length;
 const modelOnly=supportive.length>0&&supportive.every(e=>e.kind==='MODEL');
 const contradictionWeight=clamp(contradictory.length/Math.max(1,verified.length));
 const uncertaintyValues=supportive.map(e=>e.quantity?.uncertainty).filter(finite) as number[];
 const uncertainty=uncertaintyValues.length?clamp(uncertaintyValues.reduce((a,b)=>a+b,0)/uncertaintyValues.length):0.5;
 const diversity=clamp(families.size/3);
 const causalEvidence=clamp((interventions>0?0.45:0)+(replications>0?0.25:0)+(measurements>1?0.15:measurements?0.08:0)+0.15*diversity);
 const confidence=clamp((modelOnly?0.18:causalEvidence)*(1-0.7*contradictionWeight)*(1-0.35*uncertainty));
 let status:CausalStatus='UNKNOWN';
 if(contradictory.length>supportive.length&&contradictory.length>0)status='CONTRADICTED';
 else if(supportive.length===0)status='INSUFFICIENT';
 else if(interventions>0&&replications>0&&families.size>=2&&confidence>=0.72)status='SUPPORTED_CAUSAL';
 else status='CORRELATED';
 return{status,confidence,independentFamilies:families.size,interventionEvidence:interventions,replicationEvidence:replications,contradictionEvidence:contradictory.length,uncertainty,supportive: supportive.map(e=>e.id),contradictory:contradictory.map(e=>e.id)};
}

export function compileCausalGraphR126(input:CausalCompileInput){
 const nodeIds=new Set(input.nodes.map(n=>n.id));
 if(nodeIds.size!==input.nodes.length)throw new Error('duplicate causal node id');
 const evidenceMap=new Map(input.evidence.map(e=>[e.id,e]));
 if(evidenceMap.size!==input.evidence.length)throw new Error('duplicate evidence id');
 const invalidEvidence=input.evidence.map(e=>({id:e.id,...validateEvidenceR126(e)})).filter(x=>!x.ok);
 const compiled:CausalEdge[]=input.edges.map(edge=>{
  if(!nodeIds.has(edge.cause)||!nodeIds.has(edge.effect))throw new Error(`edge ${edge.id} references missing node`);
  const referenced=edge.evidenceIds.filter(id=>evidenceMap.has(id));
  const metrics=evidenceMetrics(edge.id,input.evidence.filter(e=>referenced.includes(e.id)));
  return{...edge,evidenceIds:referenced,status:metrics.status,confidence:metrics.confidence,independentFamilies:metrics.independentFamilies,interventionEvidence:metrics.interventionEvidence,replicationEvidence:metrics.replicationEvidence,contradictionEvidence:metrics.contradictionEvidence,uncertainty:metrics.uncertainty};
 });
 const supported=compiled.filter(e=>e.status==='SUPPORTED_CAUSAL');
 const contradictions=compiled.filter(e=>e.status==='CONTRADICTED');
 const unknown=compiled.filter(e=>e.status==='UNKNOWN'||e.status==='INSUFFICIENT');
 const requested=Math.max(1,Math.min(1728,Math.floor(input.requestedCells??Math.max(12,compiled.length*12))));
 const scar={...(input.priorScar??{})};
 for(const edge of compiled){
  const prior=clamp(Number(scar[edge.id]??0));
  const residual=edge.status==='CONTRADICTED'?1:edge.status==='INSUFFICIENT'?0.7:edge.status==='CORRELATED'?0.35:0.05;
  scar[edge.id]=clamp(0.82*prior+0.18*residual);
 }
 const canonicalTime=input.canonicalTime&&validIso(input.canonicalTime)?input.canonicalTime:new Date().toISOString();
 const graphPayload={revision:CAUSAL_R126_REVISION,nodes:input.nodes,edges:compiled,scar,canonicalTime};
 const graphHash=sha(graphPayload);
 const candidate={
  schema:'OMEGA_CAUSAL_INTERACTION_RELATIVITY_R126',
  revision:CAUSAL_R126_REVISION,
  missionId:String(input.missionId??`causal-${graphHash.slice(0,16)}`),
  canonicalTime,
  hierarchy:CAUSAL_R126_HIERARCHY,
  requestedCells:requested,
  nodes:input.nodes,
  edges:compiled,
  summary:{supportedCausal:supported.length,correlated:compiled.filter(e=>e.status==='CORRELATED').length,contradicted:contradictions.length,insufficient:unknown.length,invalidEvidence:invalidEvidence.length},
  scar,
  dispatch:{scope:requested===1?'CELL':requested<=12?'BRANCH':requested<=144?'ORGAN':requested<1728?'BODY_PARTIAL':'BODY_FULL',cells:requested,canonicalMutation:false},
  proof:{graphSha256:graphHash,evidenceSha256:sha(input.evidence.map(e=>({id:e.id,hash:validateEvidenceR126(e).hash}))),invalidEvidence},
  authority:{state:'CANDIDATE_ONLY',canonicalAuthority:'OMEGAV6_R125_ADMISSION',causalClaimRule:'SUPPORTED_CAUSAL requires intervention + replication + >=2 independent source families + confidence >=0.72'},
  continuityLaw:'partition -> interaction -> invariant evidence carry -> scar/residual carry -> re-contextualize -> independent proof -> external admission',
  truthBoundary:'This engine ranks evidence-backed causal candidates and preserves uncertainty/history. It does not create missing measurements, convert correlation into causation, claim live 1728-cloud execution, or mutate canonical truth. Swarm scale is a logical execution/address hierarchy unless independently deployed and verified.'
 };
 return candidate;
}
