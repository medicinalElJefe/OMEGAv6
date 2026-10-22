export const R314_IMPLEMENTATION_CANON_COMPILER_SCHEMA='OMEGA_IMPLEMENTATION_CANON_COMPILER_R314' as const;
export const R314_IMPLEMENTATION_CANON_EXPECTED_ROWS=675 as const;

export type R314CanonSourceRow={
 rowId:string;
 type:'HARD_INVARIANT'|'MODULE'|'SYMBOL'|'SHADER_BINDING'|'EVENT'|'API_ROUTE'|'DATABASE_TABLE'|'CONFIG_KEY'|'TEST'|'BUILD_GATE'|string;
 phase:string;
 component:string;
 artifact:string;
 symbol:string;
 purpose:string;
 sourceStatus:'LOCKED'|'PLANNED'|string;
 priority:string;
 sequence:number;
};

export type R314CanonCompiledState='CURRENT_EXACT'|'CURRENT_SUCCESSOR'|'LOCKED_INVARIANT'|'SUPERSEDED'|'DONOR'|'GATED'|'PLANNED'|'ABSENT'|'REVIEW_REQUIRED';
export type R314CanonEvidence={
 repositoryPaths:ReadonlySet<string>;
 symbolsByPath?:ReadonlyMap<string,ReadonlySet<string>>;
 successorByRowId?:ReadonlyMap<string,{artifact:string;symbol?:string;proofIds:readonly string[];boundary:string}>;
 supersededRowIds?:ReadonlySet<string>;
 donorRowIds?:ReadonlySet<string>;
 gatedRowIds?:ReadonlySet<string>;
};
export type R314CanonCompiledRow=R314CanonSourceRow&{
 compiledState:R314CanonCompiledState;
 evidenceKind:'EXACT_ARTIFACT_AND_SYMBOL'|'EXACT_ARTIFACT'|'EXPLICIT_SUCCESSOR'|'SOURCE_LOCK'|'EXPLICIT_SUPERSEDED'|'EXPLICIT_DONOR'|'EXPLICIT_GATE'|'SOURCE_PLAN'|'MISSING'|'AMBIGUOUS';
 currentArtifact:string|null;
 currentSymbol:string|null;
 proofIds:string[];
 boundary:string;
 canonicalAdmission:false;
};

const clean=(value:unknown)=>String(value??'').trim();
const normalizedPath=(value:string)=>clean(value).replaceAll('\\','/').replace(/^\.\//,'');
const exactSymbol=(symbols:ReadonlySet<string>|undefined,symbol:string)=>Boolean(symbols&&clean(symbol)&&symbols.has(clean(symbol)));

export function normalizeCanonSourceRowR314(input:Record<string,unknown>):R314CanonSourceRow{
 const row:R314CanonSourceRow={
  rowId:clean(input.rowId??input['Row ID']),type:clean(input.type??input.Type),phase:clean(input.phase??input.Phase),component:clean(input.component??input.Component),artifact:normalizedPath(clean(input.artifact??input.Artifact)),symbol:clean(input.symbol??input.Symbol),purpose:clean(input.purpose??input.Purpose),sourceStatus:clean(input.sourceStatus??input.Status),priority:clean(input.priority??input.Priority),sequence:Number(input.sequence??input.Sequence),
 };
 if(!/^CANON-\d{6}$/.test(row.rowId))throw new Error(`R314 invalid Canon row id ${row.rowId||'<empty>'}`);
 if(!Number.isSafeInteger(row.sequence)||row.sequence<0)throw new Error(`R314 invalid sequence ${row.rowId}`);
 if(!row.type||!row.phase||!row.component||!row.artifact||!row.symbol||!row.purpose||!row.sourceStatus||!row.priority)throw new Error(`R314 incomplete Canon row ${row.rowId}`);
 return row;
}

export function compileCanonRowR314(row:R314CanonSourceRow,evidence:R314CanonEvidence):R314CanonCompiledRow{
 const path=normalizedPath(row.artifact);
 const pathPresent=evidence.repositoryPaths.has(path);
 const symbolPresent=exactSymbol(evidence.symbolsByPath?.get(path),row.symbol);
 const successor=evidence.successorByRowId?.get(row.rowId);
 const base={...row,currentArtifact:null as string|null,currentSymbol:null as string|null,proofIds:[] as string[],boundary:'Source workbook intent is not implementation proof.',canonicalAdmission:false as const};
 if(row.type==='HARD_INVARIANT'&&row.sourceStatus==='LOCKED')return{...base,compiledState:'LOCKED_INVARIANT',evidenceKind:'SOURCE_LOCK',boundary:'Locked invariant is a required contract, not proof that every implementation satisfies it.'};
 if(evidence.supersededRowIds?.has(row.rowId))return{...base,compiledState:'SUPERSEDED',evidenceKind:'EXPLICIT_SUPERSEDED',boundary:'Explicitly superseded; retained for lineage and replay only.'};
 if(evidence.donorRowIds?.has(row.rowId))return{...base,compiledState:'DONOR',evidenceKind:'EXPLICIT_DONOR',boundary:'Donor evidence only; not current execution authority.'};
 if(evidence.gatedRowIds?.has(row.rowId))return{...base,compiledState:'GATED',evidenceKind:'EXPLICIT_GATE',boundary:'Required evidence, provider, device, scientific or implementation gate remains open.'};
 if(pathPresent&&symbolPresent)return{...base,compiledState:'CURRENT_EXACT',evidenceKind:'EXACT_ARTIFACT_AND_SYMBOL',currentArtifact:path,currentSymbol:row.symbol,boundary:'Exact artifact and exact declared symbol are present in the checked repository snapshot; runtime/deployment/Canon admission still require separate proof.'};
 if(pathPresent)return{...base,compiledState:'REVIEW_REQUIRED',evidenceKind:'EXACT_ARTIFACT',currentArtifact:path,boundary:'Declared artifact exists but exact symbol binding was not proved; manual/compiler review required.'};
 if(successor)return{...base,compiledState:'CURRENT_SUCCESSOR',evidenceKind:'EXPLICIT_SUCCESSOR',currentArtifact:normalizedPath(successor.artifact),currentSymbol:successor.symbol||null,proofIds:[...successor.proofIds],boundary:successor.boundary};
 if(row.sourceStatus==='PLANNED')return{...base,compiledState:'PLANNED',evidenceKind:'SOURCE_PLAN',boundary:'Planned in the authoritative workbook but no exact current implementation evidence was supplied.'};
 return{...base,compiledState:'ABSENT',evidenceKind:'MISSING',boundary:'No exact artifact, explicit successor, donor, supersession or gate evidence was supplied.'};
}

export function compileImplementationCanonR314(rows:readonly R314CanonSourceRow[],evidence:R314CanonEvidence){
 if(rows.length!==R314_IMPLEMENTATION_CANON_EXPECTED_ROWS)throw new Error(`R314 Canon row-count mismatch ${rows.length} != ${R314_IMPLEMENTATION_CANON_EXPECTED_ROWS}`);
 const ids=new Set<string>(),sequences=new Set<number>();
 for(const row of rows){if(ids.has(row.rowId))throw new Error(`R314 duplicate Canon row ${row.rowId}`);if(sequences.has(row.sequence))throw new Error(`R314 duplicate Canon sequence ${row.sequence}`);ids.add(row.rowId);sequences.add(row.sequence)}
 const compiled=rows.map(row=>compileCanonRowR314(row,evidence));
 const byState=compiled.reduce<Record<string,number>>((acc,row)=>(acc[row.compiledState]=(acc[row.compiledState]||0)+1,acc),{});
 const byType=compiled.reduce<Record<string,number>>((acc,row)=>(acc[row.type]=(acc[row.type]||0)+1,acc),{});
 const unresolved=compiled.filter(row=>!['CURRENT_EXACT','CURRENT_SUCCESSOR','LOCKED_INVARIANT','SUPERSEDED','DONOR'].includes(row.compiledState));
 return{schema:R314_IMPLEMENTATION_CANON_COMPILER_SCHEMA,rowCount:compiled.length,compiled,summary:{byState,byType,current:compiled.filter(row=>row.compiledState==='CURRENT_EXACT'||row.compiledState==='CURRENT_SUCCESSOR').length,locked:compiled.filter(row=>row.compiledState==='LOCKED_INVARIANT').length,unresolved:unresolved.length,gated:compiled.filter(row=>row.compiledState==='GATED').length,reviewRequired:compiled.filter(row=>row.compiledState==='REVIEW_REQUIRED').length},canonicalAdmission:false as const,truthBoundary:'Classification is source reconciliation. CURRENT_EXACT means exact repository artifact/symbol evidence, CURRENT_SUCCESSOR requires explicit mapped successor evidence. Neither implies runtime, production, scientific or CanonState proof.'};
}

// R314 explicit successor mappings are intentionally narrow. They bridge only rows whose
// declared semantics are already implemented and separately tested on this branch.
export const R314_CANON_SUCCESSOR_MAP:ReadonlyMap<string,{artifact:string;symbol?:string;proofIds:readonly string[];boundary:string}>=new Map([
 ['CANON-000013',{artifact:'src/system/synchronousPacketR314.ts',symbol:'R314SynchronousPacket',proofIds:['tests/r314-synchronous-packet-invariants.mts'],boundary:'R314 typed immutable packet successor; exact Python artifact from the workbook is not claimed.'}],
 ['CANON-000014',{artifact:'src/system/synchronousPacketR314.ts',symbol:'R314_UNIT_REGISTRY',proofIds:['tests/r314-synchronous-packet-invariants.mts'],boundary:'R314 explicit unit registry/conversion successor; physical meaning remains source/evidence bound.'}],
 ['CANON-000015',{artifact:'src/system/synchronousPacketR314.ts',symbol:'R314FrameRef',proofIds:['tests/r314-synchronous-packet-invariants.mts'],boundary:'R314 explicit frame identifier contract successor.'}],
 ['CANON-000016',{artifact:'src/system/synchronousPacketR314.ts',symbol:'R314ClockVector',proofIds:['tests/r314-synchronous-packet-invariants.mts'],boundary:'R314 multi-clock packet successor with event/receive/monotonic/logical/compute/validity time.'}],
 ['CANON-000024',{artifact:'src/system/motionRelativityR314.ts',symbol:'R314MotionEstimate',proofIds:['tests/r314-motion-relativity-invariants.mts'],boundary:'R314 finite-difference motion successor over declared packet coordinates/time; no telemetry claim.'}],
 ['CANON-000028',{artifact:'src/system/synchronousPacketR314.ts',symbol:'R314ProofBinding',proofIds:['tests/r314-synchronous-packet-invariants.mts'],boundary:'R314 proof binding successor; append-only persistence remains a separate later stage.'}],
 ['CANON-000049',{artifact:'src/system/motionRelativityR314.ts',symbol:'R314FrameGraph',proofIds:['tests/r314-motion-relativity-invariants.mts'],boundary:'R314 frame-transform graph successor with inverse/round-trip proof; navigation/orbit validity remains separately gated.'}],
]);
