const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,finite(v)?Number(v):a));
const avg=values=>{const a=(values||[]).filter(finite).map(Number);return a.length?a.reduce((s,v)=>s+v,0)/a.length:0;};
const gm=values=>{const a=(values||[]).filter(finite).map(v=>Math.max(1e-9,clamp(v)));return a.length?Math.pow(a.reduce((p,v)=>p*v,1),1/a.length):0;};
const iso=value=>{const t=new Date(value||0);return Number.isFinite(t.getTime())?t.toISOString():null;};

export const CANON_EVIDENCE_CLASSES=Object.freeze({
  MEASURED:{rank:6,label:'Measured observation',authority:1},
  REGISTERED_MEASURED:{rank:5.7,label:'Measured observation registered into the current Earth frame',authority:.97},
  DERIVED_MEASURED:{rank:5,label:'Deterministic transform of measured observations',authority:.88},
  SOURCE_SUPPORTED:{rank:4,label:'Source-backed support or acquisition metadata',authority:.72},
  CONTEXT:{rank:3,label:'Sourced contextual Earth information',authority:.56},
  RECONSTRUCTED:{rank:2,label:'Bounded reconstruction or interpolation',authority:.34},
  UNKNOWN:{rank:0,label:'Unknown or unresolved',authority:0}
});

export const CANON_DOMAIN_REGISTRY=Object.freeze({
  SAR:{english:'Synthetic aperture radar backscatter and acquisition geometry',observable:'Calibrated radar backscatter / acquisition support',renderRole:'Primary measured image when calibrated pixels exist',liveAdapter:'SENTINEL1_GRD_COG'},
  INSAR:{english:'Interferometric SAR phase/coherence/deformation products',observable:'Phase, coherence or displacement only when a real InSAR product is supplied',renderRole:'Deformation image layer',liveAdapter:'UNBOUND_NO_SYNTHETIC_INSAR'},
  GNSS:{english:'Satellite-geodesy station position and velocity time series',observable:'Station position / velocity',renderRole:'Measured displacement and velocity anchors',liveAdapter:'EARTHSCOPE_GNSS_WEB_SERVICE'},
  STRAIN:{english:'Borehole strain measurements',observable:'Strain time series',renderRole:'Local deformation/stress-context anchors',liveAdapter:'EARTHSCOPE_BOREHOLE_WHEN_BOUND'},
  SEISMIC:{english:'Seismic station and earthquake measurements',observable:'Waveform/event metadata depending source',renderRole:'Event and dynamic Earth context',liveAdapter:'USGS_EVENTS_PLUS_EARTHSCOPE_WHEN_BOUND'},
  TILT:{english:'Borehole or surface tilt measurements',observable:'Tilt time series',renderRole:'Local deformation orientation context',liveAdapter:'EARTHSCOPE_BOREHOLE_WHEN_BOUND'},
  PORE_PRESSURE:{english:'Subsurface pore-pressure observations',observable:'Pressure time series',renderRole:'Hydro-mechanical context',liveAdapter:'EARTHSCOPE_BOREHOLE_WHEN_BOUND'},
  ENVIRONMENTAL:{english:'Meteorological and environmental observations',observable:'Temperature / pressure / rainfall / related context',renderRole:'Environmental forcing/context',liveAdapter:'EARTHSCOPE_MET_WHEN_BOUND'},
  TERRAIN:{english:'Source digital elevation model',observable:'Elevation',renderRole:'Geometric relief and local surface metric context',liveAdapter:'AWS_TERRARIUM_DEM'},
  WATER:{english:'Observed historical surface-water context and DEM-derived flow geometry',observable:'Observed cartographic water context or derived drainage potential',renderRole:'Hydrologic context, never synthetic SAR',liveAdapter:'EC_JRC_PLUS_DEM_DERIVED'},
  EVENTS:{english:'Sourced natural-event metadata',observable:'Event location / time / magnitude or category',renderRole:'Temporal/spatial event context',liveAdapter:'USGS_PLUS_NASA_EONET'},
  PROVENANCE:{english:'Source lineage, acquisition metadata, calibration and proof state',observable:'Evidence identity / lineage / quality',renderRole:'Controls what may be rendered and how strongly',liveAdapter:'OMEGA_PROOF_LEDGER'}
});

export const CANON_ENGLISH_GLOSSARY=Object.freeze({
  continuity:'How coherently the available evidence supports one current state.',
  burden:'How much load, incompleteness, uncertainty or processing cost the state carries.',
  contradiction:'How strongly supported sources disagree or conflict.',
  omega:'Stabilized coherence after burden and contradiction are accounted for.',
  wovenIndex:'A bounded relational fitness indicator used for render/admission control.',
  flow:'How readily state/information may continue through the current constraints.',
  boundary:'How strongly the current host/frame constrains that continuation.',
  pressure:'Stored mismatch between movement and constraint.',
  memory:'How much prior valid state is retained into this update.',
  scar:'Explicit retained record of a failure, unavailable source, contradiction or unresolved region.',
  mode188:'Evidence-admission and state-transition controller. It cannot manufacture physical measurement.',
  stay:'Keep the current source/state authoritative.',
  turn:'Change representation, source mix, scale or processing path.',
  escalate:'Request deeper evidence, higher detail or additional sources.',
  accept:'Admit into the authoritative render/computation path.',
  conditional:'Use with explicit limitation or subordinate authority.',
  prune:'Reject from authoritative promotion while preserving a scar/ledger entry.'
});

export const CANON_CONTROL_CONSTANTS=Object.freeze({
  mode188:{gammaLambdaQ:.35,epsilon:.05,stayThreshold:1.05,turnThreshold:.9,escalateThreshold:.75},
  violet:{stayThreshold:.42,turnThreshold:.22,epsilon:.001},
  evidenceAuthority:Object.fromEntries(Object.entries(CANON_EVIDENCE_CLASSES).map(([k,v])=>[k,v.authority]))
});

export function evidenceAuthority(value){
  const key=String(value||'UNKNOWN').toUpperCase();
  return CANON_EVIDENCE_CLASSES[key]?.authority??0;
}

export function mode188Kernel({continuity=0,burden=0,contradiction=0,plasticity=1,evidence=1,scar=0}={}){
  const C=clamp(continuity),Lambda=clamp(burden),q=clamp(Math.abs(contradiction)),Phi=clamp(plasticity),E=clamp(evidence),Sc=clamp(scar);
  const c=CANON_CONTROL_CONSTANTS.mode188;
  const ratio=C/(Lambda+q+c.gammaLambdaQ*Lambda*q+c.epsilon);
  const ratioNormalized=clamp(ratio/(1+ratio));
  const decision=ratio>=c.stayThreshold?'STAY':ratio>=c.turnThreshold?'TURN':ratio<c.escalateThreshold?'ESCALATE':'REVIEW';
  const admissibility=decision==='STAY'?'ACCEPT':decision==='ESCALATE'?'PRUNE':'CONDITIONAL';
  const violetScore=(C*Phi)/(q+Lambda+CANON_CONTROL_CONSTANTS.violet.epsilon);
  const violetDecision=violetScore>=CANON_CONTROL_CONSTANTS.violet.stayThreshold?'STAY':violetScore>=CANON_CONTROL_CONSTANTS.violet.turnThreshold?'TURN':'ESCALATE';
  const omega=C/(1+Lambda+q);
  const wovenIndex=clamp((C+omega)/(1+Lambda+q));
  const proofWeighted=gm([C,Phi,E,1-q,1-Lambda,1-Sc]);
  return {C,Lambda,q,Phi,evidence:E,scar:Sc,ratio,ratioNormalized,decision,admissibility,violetScore,violetDecision,omega,wovenIndex,proofWeighted,boundary:'Controller metrics govern software admission/render authority only. They are not new geophysical measurements or validated universal physical laws.'};
}

export function canonicalObservation(input={}){
  const domain=String(input.domain||'PROVENANCE').toUpperCase();
  const evidenceClass=String(input.evidenceClass||'UNKNOWN').toUpperCase();
  const authority=evidenceAuthority(evidenceClass);
  const measured=evidenceClass==='MEASURED'||evidenceClass==='REGISTERED_MEASURED';
  const sourceSupport=clamp(input.sourceSupport??(authority>0?1:0));
  const registration=clamp(input.registration??(measured?.9:.65));
  const freshness=clamp(input.freshness??1);
  const agreement=clamp(input.agreement??1);
  const completeness=clamp(input.completeness??sourceSupport);
  const scar=clamp(input.scar??0);
  const contradiction=clamp(input.contradiction??(1-agreement));
  const burden=clamp(input.burden??avg([1-completeness,1-registration,1-freshness,scar]));
  const continuity=clamp(input.continuity??gm([Math.max(.001,authority),sourceSupport,registration,freshness,agreement,Math.max(.001,1-scar)]));
  const plasticity=clamp(input.plasticity??avg([registration,completeness,1-scar]));
  const control=mode188Kernel({continuity,burden,contradiction,plasticity,evidence:authority,scar});
  const timestamp=iso(input.timestamp)||null;
  const sourceRefs=[...(input.sourceRefs||[])].filter(Boolean).map(String);
  return {
    id:String(input.id||`${domain}:${timestamp||'NA'}:${sourceRefs[0]||'UNRESOLVED'}`),
    domain,
    domainEnglish:CANON_DOMAIN_REGISTRY[domain]?.english||domain,
    observable:String(input.observable||CANON_DOMAIN_REGISTRY[domain]?.observable||'Unspecified'),
    evidenceClass,
    evidenceEnglish:CANON_EVIDENCE_CLASSES[evidenceClass]?.label||CANON_EVIDENCE_CLASSES.UNKNOWN.label,
    measured,
    derived:evidenceClass==='DERIVED_MEASURED',
    reconstructed:evidenceClass==='RECONSTRUCTED',
    timestamp,
    sourceRefs,
    location:input.location??null,
    extent:input.extent??null,
    units:input.units??null,
    value:input.value??null,
    payload:input.payload??null,
    metrics:{authority,sourceSupport,registration,freshness,agreement,completeness,continuity,burden,contradiction,plasticity,scar,omega:control.omega,wovenIndex:control.wovenIndex},
    mode188:control,
    boundary:String(input.boundary||'Evidence class controls promotion. Unknown information remains unknown.')
  };
}

export function fuseObservations(observations=[],scars=[]){
  const obs=(observations||[]).filter(Boolean);
  const admitted=obs.filter(o=>o?.mode188?.admissibility!=='PRUNE'&&o?.evidenceClass!=='UNKNOWN');
  const measured=obs.filter(o=>o?.measured);
  const derived=obs.filter(o=>o?.derived);
  const context=obs.filter(o=>o?.evidenceClass==='CONTEXT'||o?.evidenceClass==='SOURCE_SUPPORTED');
  const reconstructed=obs.filter(o=>o?.reconstructed);
  const weights=admitted.map(o=>Math.max(.001,(o.metrics?.authority||0)*(o.metrics?.sourceSupport||0)*(1-(o.metrics?.scar||0))));
  const weighted=(key)=>{let n=0,d=0;for(let i=0;i<admitted.length;i++){const v=Number(admitted[i]?.metrics?.[key]);if(!finite(v))continue;n+=v*weights[i];d+=weights[i];}return d?n/d:0;};
  const continuity=weighted('continuity'),burden=weighted('burden'),contradiction=weighted('contradiction'),evidence=weighted('authority'),scarLoad=clamp(avg([...(scars||[]).map(()=>1),...obs.map(o=>o?.metrics?.scar||0)])/(Math.max(1,obs.length+(scars||[]).length)));
  const control=mode188Kernel({continuity,burden,contradiction,evidence,scar:scarLoad,plasticity:weighted('plasticity')});
  const byDomain={};for(const o of obs){const d=byDomain[o.domain]||(byDomain[o.domain]={count:0,measured:0,derived:0,context:0,pruned:0,bestAuthority:0});d.count++;if(o.measured)d.measured++;if(o.derived)d.derived++;if(['CONTEXT','SOURCE_SUPPORTED'].includes(o.evidenceClass))d.context++;if(o.mode188?.admissibility==='PRUNE')d.pruned++;d.bestAuthority=Math.max(d.bestAuthority,o.metrics?.authority||0);}
  const strongest=[...obs].sort((a,b)=>(b.metrics?.authority||0)*(b.metrics?.continuity||0)-(a.metrics?.authority||0)*(a.metrics?.continuity||0))[0]||null;
  const weakest=admitted.length?[...admitted].sort((a,b)=>(a.metrics?.continuity||0)-(b.metrics?.continuity||0))[0]:null;
  return {observations:obs.length,admitted:admitted.length,measured:measured.length,derived:derived.length,context:context.length,reconstructed:reconstructed.length,scarCount:(scars||[]).length,byDomain,continuity,burden,contradiction,evidence,scarLoad,mode188:control,strongestObservationId:strongest?.id||null,weakestObservationId:weakest?.id||null,sourceSurvival:obs.length?admitted.length/obs.length:0,boundary:'Unified Coherence preserves valid partial evidence when another source fails. Source failure creates a scar; it does not create a zero-valued measurement or erase unrelated valid observations.'};
}

export function buildCanonicalEarthFrame({target=null,bbox=null,atlas=null,observations=[],scars=[],generatedAt=new Date().toISOString(),camera=null}={}){
  const canonical=(observations||[]).map(o=>o?.mode188?o:canonicalObservation(o));
  const fusion=fuseObservations(canonical,scars);
  const domains=Object.fromEntries(Object.entries(CANON_DOMAIN_REGISTRY).map(([id,d])=>[id,{...d,present:!!fusion.byDomain[id]?.count,counts:fusion.byDomain[id]||{count:0,measured:0,derived:0,context:0,pruned:0,bestAuthority:0}}]));
  const measuredAuthority=canonical.filter(o=>o.measured).reduce((m,o)=>Math.max(m,(o.metrics?.continuity||0)*(o.metrics?.authority||0)),0);
  const derivedAuthority=canonical.filter(o=>o.derived).reduce((m,o)=>Math.max(m,(o.metrics?.continuity||0)*(o.metrics?.authority||0)),0);
  const contextAuthority=canonical.filter(o=>['CONTEXT','SOURCE_SUPPORTED'].includes(o.evidenceClass)).reduce((m,o)=>Math.max(m,(o.metrics?.continuity||0)*(o.metrics?.authority||0)),0);
  const renderAuthority=measuredAuthority>0?'MEASURED':derivedAuthority>.35?'DERIVED_MEASURED':contextAuthority>.25?'CONTEXT':'UNKNOWN';
  return {
    schema:'omega.canonical-earth-data-cube.v1',
    generatedAt:iso(generatedAt)||new Date().toISOString(),
    axes:{x:'WGS84 longitude',y:'WGS84 latitude',z:'elevation/depth where sourced',t:'source acquisition or observation time',s:'source/domain family',p:'physical observable',e:'evidence/provenance class',m:'mode/operator state'},
    target,bbox,camera,atlas,
    observations:canonical,
    scars:[...(scars||[])],
    domains,
    fusion,
    render:{authority:renderAuthority,measuredAuthority,derivedAuthority,contextAuthority,primaryObservationId:fusion.strongestObservationId,unknownPreserved:renderAuthority==='UNKNOWN'},
    glossary:CANON_ENGLISH_GLOSSARY,
    boundary:'This frame unifies source observations and deterministic transforms into one Earth-addressed computation object. It does not promote derived/contextual/reconstructed fields into measurements. Atlas addresses are computational resolution/state addresses, not literal physical dimensions.'
  };
}

export function renderDirective(frame){
  const f=frame?.fusion||{},r=frame?.render||{},decision=f.mode188?.decision||'ESCALATE';
  const detail=decision==='STAY'?1:decision==='TURN'?.82:decision==='REVIEW'?.68:.48;
  const support=clamp((r.measuredAuthority||0)+.55*(r.derivedAuthority||0)+.25*(r.contextAuthority||0));
  return {primary:r.authority||'UNKNOWN',detailWeight:clamp(detail*support),contextWeight:clamp((1-(r.measuredAuthority||0))*.32+.08),proofWeight:clamp(.35+.65*(f.evidence||0)),scarOpacity:clamp(.08+.42*(f.scarLoad||0)),mode188Decision:decision,admissibility:f.mode188?.admissibility||'PRUNE',english:decision==='STAY'?'Current evidence is coherent enough to retain the current rendering path.':decision==='TURN'?'Evidence remains usable but the system should change scale, representation, or source weighting.':decision==='REVIEW'?'Evidence is usable only with explicit review/limitation.':'Evidence is too weak or contradictory for authoritative promotion; preserve the source/scar and request deeper evidence.'};
}