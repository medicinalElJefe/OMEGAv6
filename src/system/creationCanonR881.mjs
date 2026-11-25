// R881 · Source-bounded Creation Canon. No new physical primitives.
export const R881_SCHEMA = 'OMEGA_CREATION_CANON_R881';
export const EVIDENCE = Object.freeze(['OBS','DER','INF','GAP','BND','SEAM','EQUIV','LOCKED']);
export const PROOF = Object.freeze(['OBS','DER','INF','HYP','FALSIFIABLE']);
export const SCORES = Object.freeze(['S_dec','S_water','S_ref_v3','S_orion','S_woven','W_omega','W_carry']);
export const PHASES = Object.freeze(['Declare','Drive','Explore','Sustain','Measure','Boundary','Release','Shift','Refine','Hold','Reframe','Seal']);
export const PHASE_NAMES = Object.freeze(['Initiation','Acceleration','Expansion','Momentum','Saturation','Constraint Engagement','Deceleration','Redistribution','Compression','Tie-Zone (Pre-Turn Tension)','Turn / Reorientation','Integration']);
export const DOMAIN_NAMES = Object.freeze(['Sense','Symbolic','Strategy','Systems','Energy','Biology','Society','Economy','Language','Art','Spirit','Technology']);
export const REGULATION_NAMES = Object.freeze(['Collapse','Fracture','Volatile','Reactive','Unsteady','Noisy-Stable','Stable','Elastic','Coherent','Locked (Healthy)','Integrated','Regenerative']);
export const LENS_NAMES = Object.freeze(['Quantity','Phase','Structure','Time','Interaction','Constraint','Information','Scale','Variability','Stability','Adaptability','Observability']);
export const MOTIFS = Object.freeze(['Observe','Define','Couple','Prune','Close']);
export const REPORTED = Object.freeze({total:7655,verified:6872,scoped:699,frontier:84,ledgers:10,canonicalRecords:96,coveredAddresses:7399,frontierItems:75,hypothesisGates:24,sourceStatus:'REPORTED_NOT_INDEPENDENTLY_REPLAYED'});
const numberIn=(n,low,high,k)=>{if(!Number.isInteger(n)||n<low||n>high)throw new RangeError(k+'_OUT_OF_RANGE');return n};
export function rowIdR881({d,p,r,l}){
 [d,p,r,l].forEach((n,i)=>numberIn(n,1,12,['D','P','R','L'][i]));
 return (((d-1)*12+(p-1))*12+(r-1))*12+(l-1);
}
export function coordinatesR881(rowId){
 numberIn(rowId,0,20735,'ROW_ID');
 let n=rowId,l=n%12+1;n=Math.floor(n/12);
 const r=n%12+1;n=Math.floor(n/12);const p=n%12+1;const d=Math.floor(n/12)+1;
 return Object.freeze({rowId,d,p,r,l});
}
export function antipodeR881(rowId){
 const {d,p,r,l}=coordinatesR881(rowId);
 return rowIdR881({d:(d+5)%12+1,p:13-p,r:13-r,l:(l+5)%12+1});
}
export function turnR881(rowId,k=0){
 numberIn(k,0,Number.MAX_SAFE_INTEGER,'TURN');
 const {d,p,r,l}=coordinatesR881(rowId);
 return rowIdR881({d,p:(p-1+k)%12+1,r,l});
}
/** Explicit Domain shift is separate from the phase turn group T12. */
export function domainShiftR884(rowId,k=0){
 numberIn(k,0,Number.MAX_SAFE_INTEGER,'DOMAIN_SHIFT');
 const {d,p,r,l}=coordinatesR881(rowId);
 return rowIdR881({d:(d-1+k)%12+1,p,r,l});
}
/** Handbook action/constraint lookup, never an automatic physical or clinical control. */
export function canonicalStateR884(rowId){
 const state=coordinatesR881(rowId),index=state.p-1;
 return Object.freeze({...state,sourceExcelRowID:rowId+1,
  domain:DOMAIN_NAMES[state.d-1],phaseName:PHASE_NAMES[index],nextAction:PHASES[index],
  regulation:REGULATION_NAMES[state.r-1],lens:LENS_NAMES[state.l-1],
  dialConstraint:state.r<=5?'REDISTRIBUTE_FIRST':state.r>=8?'SCOPED_EXPAND_OR_STACK':'MEASURE_AND_SUSTAIN',
  proofTier:'DER',source:'Expansion_Mandala_Operators_Handbook_20736D.pdf',physicalProof:false});
}

export function cycleR881(step,active_steps){
 numberIn(step,0,Number.MAX_SAFE_INTEGER,'STEP');numberIn(active_steps,0,step,'ACTIVE_STEPS');
 return Object.freeze({step,active_steps,skipped:step-active_steps,phase:PHASES[active_steps%12],phaseIndex:active_steps%12,microLoop188:active_steps%188});
}
export function statePacketR881(p){
 if(!p||typeof p!=='object')return{ok:false,code:'STATE_PACKET_REQUIRED'};
 for(const key of ['time','units','frame_id','O_observer','sigma_orientation','theta_bearing','version','provenance','step','active_steps'])
  if(!(key in p))return{ok:false,code:'MISSING_'+key.toUpperCase()};
 if(typeof p.time!=='string'||!Number.isFinite(Date.parse(p.time)))return{ok:false,code:'INVALID_TIME'};
 for(const k of ['units','frame_id','O_observer','version'])if(typeof p[k]!=='string'||!p[k].trim())return{ok:false,code:'INVALID_'+k};
 if(![-1,1].includes(p.sigma_orientation))return{ok:false,code:'INVALID_ORIENTATION'};
 if(!Number.isFinite(p.theta_bearing))return{ok:false,code:'INVALID_BEARING'};
 if(!EVIDENCE.includes(p.provenance))return{ok:false,code:'INVALID_PROVENANCE'};
 try{cycleR881(p.step,p.active_steps);if(p.address!==undefined)coordinatesR881(p.address)}catch{return{ok:false,code:'INVALID_CLOCK_OR_ADDRESS'}}
 return{ok:true,code:'SCOPED_STATE_PACKET',schema:R881_SCHEMA,physicalProof:false};
}
export function scopedScoreR881({variant,version,value,proofTier='DER'}){
 if(!SCORES.includes(variant))return{ok:false,code:'SCORE_SCOPE_UNKNOWN'};
 if(typeof version!=='string'||!version.trim())return{ok:false,code:'SCORE_VERSION_REQUIRED'};
 if(!Number.isFinite(value)||!PROOF.includes(proofTier))return{ok:false,code:'SCORE_VALUE_OR_PROOF_INVALID'};
 return Object.freeze({ok:true,variant,version,value,proofTier,scopeLocked:true,noCrossScopeAveraging:true,physicalProof:false});
}
export function gateR881({id='',ruleSource=null,verified=false,proofReceipt=null,branchPolicyProven=false,scope='FORMAL'}={}){
 if(id==='REC-011'||id==='ORION_GATE')return Object.freeze({id:'REC-011',admitted:false,state:'HOLD_RULE_SOURCE_NEEDED',reason:'No source-verified Orion rule; scalar score cannot authorize this gate.'});
 if(id==='R170'&&!branchPolicyProven)return Object.freeze({id,admitted:false,state:'POLICY_BLOCKED_BRANCH_HELD'});
 if(id==='CF-N0001')return Object.freeze({id,admitted:false,state:'OPEN_CANDIDATE',reason:'TIT requires independent translation and null falsification tests.'});
 if(!id||!verified||!ruleSource||!proofReceipt)return Object.freeze({id,admitted:false,state:'HOLD_EVIDENCE_REQUIRED'});
 return Object.freeze({id,admitted:true,state:'SCOPED_PROOF_ONLY',scope,ruleSource,proofReceipt,physicalProof:false});
}
export function verifyLedgerSplitR881(rows){
 if(!Array.isArray(rows))return{ok:false,state:'SOURCE_LEDGER_BYTES_REQUIRED',expected:REPORTED};
 const counts={VERIFIED_OR_INTERNALLY_TESTED:0,DERIVED_OR_SCOPED:0,EXTERNAL_OR_OPEN_FRONTIER:0},ids=new Set();
 for(const row of rows){
  if(!row||typeof row.id!=='string'||!row.id||ids.has(row.id)||!Object.hasOwn(counts,row.tier))
   return{ok:false,state:'INVALID_OR_DUPLICATE_RECORD'};
  ids.add(row.id);counts[row.tier]++;
 }
 const ok=rows.length===REPORTED.total&&counts.VERIFIED_OR_INTERNALLY_TESTED===REPORTED.verified&&counts.DERIVED_OR_SCOPED===REPORTED.scoped&&counts.EXTERNAL_OR_OPEN_FRONTIER===REPORTED.frontier;
 return Object.freeze({ok,state:ok?'LEDGER_COUNT_REPLAYED_SCOPED':'LEDGER_SPLIT_MISMATCH_HELD',total:rows.length,counts,physicalProof:false});
}

/** REC-002: exact source symbols are not invented; a 41-symbol/11-namespace
 * registry is admitted only after caller supplies canonical source evidence. */
export function validateSymbolRegistryR884(rows,sourceReceipt){
 if(!Array.isArray(rows)||!sourceReceipt||typeof sourceReceipt.sha256!=='string'||!/^[a-f0-9]{64}$/i.test(sourceReceipt.sha256))
  return Object.freeze({ok:false,state:'SOURCE_SYMBOL_REGISTRY_REQUIRED'});
 const seen=new Set(),namespaces=new Set(),aliases=new Map();
 for(const row of rows){
  if(!row||typeof row.namespace!=='string'||typeof row.symbol!=='string'||!row.namespace||!row.symbol||
     !/^[A-Za-z][A-Za-z0-9_.-]*$/.test(row.namespace)||!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(row.symbol))
   return Object.freeze({ok:false,state:'INVALID_MACHINE_SYMBOL'});
  const key=row.namespace+':'+row.symbol;
  if(seen.has(key))return Object.freeze({ok:false,state:'SYMBOL_COLLISION_HELD',key});
  seen.add(key);namespaces.add(row.namespace);
  if(row.alias!==undefined&&typeof row.alias!=='string')return Object.freeze({ok:false,state:'DISPLAY_ALIAS_INVALID'});
  if(row.alias)aliases.set(key,row.alias);
 }
 if(rows.length!==41||namespaces.size!==11)return Object.freeze({ok:false,state:'REGISTRY_CARDINALITY_MISMATCH_HELD',symbols:rows.length,namespaces:namespaces.size});
 return Object.freeze({ok:true,state:'SOURCE_STRUCTURALLY_VALIDATED',symbols:41,namespaces:11,
  displayAliasCount:aliases.size,sourceReceipt:sourceReceipt.sha256,physicalProof:false,
  note:'Source SHA attached; structural uniqueness does not prove source authenticity or historical semantic agreement.'});
}

/** R0054: versioned interval, not equality-only TURN. Score remains scope-locked. */
export function decisionBandR884(score,band){
 if(!score?.ok||score.scopeLocked!==true||!band||band.variant!==score.variant||band.version!==score.version)
  return Object.freeze({ok:false,state:'SCORE_OR_RULE_SCOPE_MISMATCH_HELD'});
 if(score.variant==='S_orion')return Object.freeze({ok:false,state:'HOLD_RULE_SOURCE_NEEDED',authority:'REC-011',reason:'Orion gating must not derive from score-only threshold bands.'});
 if(!Number.isFinite(band.low)||!Number.isFinite(band.high)||band.low>=band.high)
  return Object.freeze({ok:false,state:'INVALID_TURN_BAND'});
 const decision=score.value<=band.low?'ESCALATE':score.value>=band.high?'STAY':'TURN';
 return Object.freeze({ok:true,decision,variant:score.variant,version:score.version,thresholds:{low:band.low,high:band.high},proofTier:score.proofTier,source:'R0054_VERSIONED_BAND',physicalProof:false});
}
/** R0061: history and penalty must never alias or silently substitute for each other. */
export function typedScarR884({harm_scar,learn_scar,units,version,source}={}){
 if(!Number.isFinite(harm_scar)||harm_scar<0||!Number.isFinite(learn_scar)||learn_scar<0)
  return Object.freeze({ok:false,state:'SCAR_POLARITY_VALUES_REQUIRED'});
 if(typeof units!=='string'||!units.trim()||typeof version!=='string'||!version.trim()||typeof source!=='string'||!source.trim())
  return Object.freeze({ok:false,state:'SCAR_SOURCE_UNITS_VERSION_REQUIRED'});
 return Object.freeze({ok:true,harm_scar,learn_scar,units,version,source,
  channelRoles:{harm_scar:'NONNEGATIVE_HARM_PENALTY',learn_scar:'NONNEGATIVE_RETAINED_LEARNING'},
  netScore:'NOT_DEFINED_WITHOUT_VERSIONED_RULE',historicalEquivalence:'NOT_REPLAYED',physicalProof:false});
}
/** R0066: strict per-cell tolerance with explicit lineage, not a proof from reported counts. */
export function compareFormulasR884(left,right,{versionLeft,versionRight,tolerance=1e-6}={}){
 if(!Array.isArray(left)||!Array.isArray(right)||left.length!==right.length||!left.length)
  return Object.freeze({ok:false,state:'INPUT_PAIRS_REQUIRED'});
 if(typeof versionLeft!=='string'||!versionLeft||typeof versionRight!=='string'||!versionRight)
  return Object.freeze({ok:false,state:'FORMULA_VERSIONS_REQUIRED'});
 if(!Number.isFinite(tolerance)||tolerance<0)return Object.freeze({ok:false,state:'TOLERANCE_INVALID'});
 let passCount=0,maxResidual=0;
 for(let i=0;i<left.length;i++){
  const x=left[i],y=right[i];if(!Number.isFinite(x)||!Number.isFinite(y))return Object.freeze({ok:false,state:'NONFINITE_FORMULA_VALUE',row:i});
  const residual=Math.abs(x-y);maxResidual=Math.max(maxResidual,residual);
  if(residual<=tolerance)passCount++;
 }
 return Object.freeze({ok:true,versionLeft,versionRight,tolerance,passCount,total:left.length,maxResidual,
  allEquivalent:passCount===left.length,proofTier:'DER',source:'R0066_NUMERICAL_WITHIN_TOLERANCE',physicalProof:false});
}


/** One-edge coordinate neighbors in the bounded product graph, no periodic wrap. */
export function adjacencyR884(rowId){
 const c=coordinatesR881(rowId),out=[];
 for(const k of ['d','p','r','l']){
  for(const step of [-1,1]){
   const next=c[k]+step;
   if(next>=1&&next<=12){
    const n=rowIdR881({...c,[k]:next});
    out.push(Object.freeze({rowId:n,axis:k,direction:step,proofTier:'DER',source:'CF-D0001_PRODUCT_LATTICE'}));
   }
  }
 }
 return Object.freeze(out);
}
/** Deterministic arborescence: lexicographic coordinate descent to D1,P1,R1,L1. */
export function spanningParentR884(rowId){
 const c=coordinatesR881(rowId);
 if(rowId===0)return null;
 for(const axis of ['l','r','p','d']){
  if(c[axis]>1)return rowIdR881({...c,[axis]:c[axis]-1});
 }
 throw new Error('UNREACHABLE_ROOT_PARENT');
}
export function coordinateRouteR884(start,end){
 const a=coordinatesR881(start),b=coordinatesR881(end),current={...a},route=[start];
 for(const axis of ['d','p','r','l']){
  while(current[axis]!==b[axis]){
   current[axis]+=current[axis]<b[axis]?1:-1;
   route.push(rowIdR881(current));
  }
 }
 return Object.freeze({from:start,to:end,rowIds:Object.freeze(route),edgeCount:route.length-1,
  proofTier:'DER',source:'CF-D0001_PRODUCT_GRAPH_DEFINITION',historicalRouteAssignment:'NOT_VERIFIED',
  physicalTopologyClaim:false});
}

export function atlasR881(rowId){
 const coords=canonicalStateR884(rowId);
 return Object.freeze({...coords,schema:R881_SCHEMA,antipodeRowId:antipodeR881(rowId),turn1RowId:turnR881(rowId,1),provenance:'DER',proofTier:'DER',state:'DEFINITIONAL_INDEX',dimension_20736_is_physical_claim:false,junction_is_new_physical_primitive:false,authority:'CF-D0001/2/3'});
}
export function disclosureR881(){
 return Object.freeze({schema:R881_SCHEMA,governance:'R237 NO_STAGE_PROMOTED_BEYOND_EVIDENCE',sourceReported:REPORTED,scores:SCORES,phases:PHASES,phaseNames:PHASE_NAMES,domains:DOMAIN_NAMES,regulationNames:REGULATION_NAMES,lenses:LENS_NAMES,motifs:MOTIFS,regulation:Array.from({length:12},(_,i)=>'R'+(i+1)),orion:gateR881({id:'ORION_GATE'}),policy:gateR881({id:'R170'}),TIT:gateR881({id:'CF-N0001'}),execution:{edge:'READ_ONLY_DEFINITIONAL',local:'NOT_NATIVE_HOST_ACCEPTED',external:'NOT_VALIDATED'},nativePcAccepted:false,federationClosure:false,empiricalPhysicsValidated:false,canonicalMutation:false,truthBoundary:'Reported totals are source expectations, not independent replays of all 7,655 ledger records.'});
}
export async function byteReceiptR881(text,meta={}){
 const bytes=text instanceof Uint8Array?text:text instanceof ArrayBuffer?new Uint8Array(text):new TextEncoder().encode(typeof text==='string'?text:JSON.stringify(text));
 const hash=await crypto.subtle.digest('SHA-256',bytes);
 return Object.freeze({schema:'OMEGA_BYTE_RECEIPT_R881',sha256:Array.from(new Uint8Array(hash)).map(n=>n.toString(16).padStart(2,'0')).join(''),byteSize:bytes.byteLength,proofTier:meta.proofTier||'DER',source:meta.source||'R881',physicalProof:false});
}

// R976: scene-invariant spiral chroma, in linear light. Input coordinates
// belong to the source geometry, not the camera or the screen. No state writes.
export function spiralChromaR976(color,x,y,phase=0){
 if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color)||![x,y,phase].every(Number.isFinite)||phase<0||phase>360)throw new RangeError('Invalid spiral material input');
 const decode=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
 const encode=v=>v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055;
 const rgb=[1,3,5].map(i=>decode(parseInt(color.slice(i,i+2),16)/255));
 const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
 const angle=Math.atan2(y,x),radius=Math.hypot(x,y);
 const chroma=.5+.5*Math.cos(angle-4*Math.PI*radius+phase*Math.PI/180);
 return '#'+rgb.map(v=>Math.round(255*Math.max(0,Math.min(1,encode(luminance+(v-luminance)*chroma)))).toString(16).padStart(2,'0')).join('');
}
