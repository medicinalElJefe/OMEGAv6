export const R123_RUNTIME='OMEGA_R123_LIVING_TOTAL_EXPERIENCE' as const;

export type OmegaCapabilityState='LIVE'|'READY'|'DEGRADED'|'PROPOSED'|'UNAVAILABLE'|'UNPROVEN';
export type OmegaDecision='STAY'|'TURN'|'ESCALATE';
export type OmegaDeviceTier='PHONE'|'DESKTOP'|'SOVEREIGN'|'CLOUD';
export type OmegaProjection='FIELD'|'MATTER'|'TRAVERSAL'|'FORECAST'|'RELATIVITY'|'INFINITY'|'SCALE'|'CONVERGENCE'|'EARTH'|'OPTICAL'|'PROOF'|'BUILD';

export type LivingMetricPacket={continuity:number;plasticity:number;contradiction:number;burden:number;evidence:number;uncertainty:number;scar:number};
export type LivingWorldState={version:string;address:number;observerId:string;projection:OmegaProjection;metrics:LivingMetricPacket;sourceIds:string[];proofIds:string[];time:{event:number;receive:number;compute:number;logical:number};};
export type MissionIntent={id:string;text:string;objective:string;requestedProjection?:OmegaProjection;requiredCapabilities:string[];constraints:string[];};
export type MissionPlan={id:string;intent:MissionIntent;projection:OmegaProjection;deviceTier:OmegaDeviceTier;stages:MissionStage[];decision:OmegaDecision;};
export type MissionStage={id:string;role:'PROPOSE'|'SCREEN'|'EXECUTE'|'VERIFY'|'ADMIT'|'RENDER';owner:'OMEGAV6'|'GENESIS'|'OPTICAL'|'SOVEREIGN'|'FEDERATION';capability:string;requiresProof:boolean;};
export type RenderBudget={targetFps:number;geometry:number;motion:number;proof:number;history:number;field:number;};
export type BuildCandidate={id:string;source:string;target:string;reason:string;risk:'LOW'|'MEDIUM'|'HIGH';tests:string[];preserve:string[];status:'PROPOSED'|'GATED'|'ADMITTED'|'REJECTED';};

const clamp01=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
export function normalizeMetrics(m:Partial<LivingMetricPacket>):LivingMetricPacket{return{continuity:clamp01(m.continuity??0),plasticity:clamp01(m.plasticity??0),contradiction:clamp01(m.contradiction??0),burden:clamp01(m.burden??0),evidence:clamp01(m.evidence??0),uncertainty:clamp01(m.uncertainty??1),scar:clamp01(m.scar??0)}}

export function omegaDecision(m:LivingMetricPacket):OmegaDecision{
 const denom=Math.max(1e-9,m.burden+m.contradiction+m.burden*m.contradiction);
 const score=m.continuity/denom;
 return score>=1.15?'STAY':score>=0.72?'TURN':'ESCALATE';
}

export function deviceTier(width:number,nativePc=false):OmegaDeviceTier{
 if(nativePc)return'SOVEREIGN';
 if(width<760)return'PHONE';
 if(width>=760)return'DESKTOP';
 return'CLOUD';
}

export function renderBudget(tier:OmegaDeviceTier,m:LivingMetricPacket,visible=true):RenderBudget{
 const relevance=visible?1:0.18;
 const uncertaintyBoost=.65+.35*m.uncertainty;
 const motion=.45+.55*(m.plasticity+m.scar)/2;
 const proof=.45+.55*(m.evidence+m.contradiction)/2;
 if(tier==='PHONE')return{targetFps:60,geometry:.48*relevance,motion:.55*motion,proof:.62*proof,history:.42,field:.46*uncertaintyBoost};
 if(tier==='SOVEREIGN')return{targetFps:60,geometry:1*relevance,motion:1*motion,proof:1*proof,history:1,field:1*uncertaintyBoost};
 if(tier==='CLOUD')return{targetFps:30,geometry:.38*relevance,motion:.42*motion,proof:.9*proof,history:.58,field:.4*uncertaintyBoost};
 return{targetFps:60,geometry:.82*relevance,motion:.82*motion,proof:.88*proof,history:.82,field:.84*uncertaintyBoost};
}

const INTENT_RULES:[RegExp,OmegaProjection,string[]][]=[
 [/earth|satellite|terrain|mountain|weather|map/i,'EARTH',['earth-evidence','trajectory','computed-reality-renderer']],
 [/atom|matter|material|molecule|field/i,'MATTER',['matter-atlas','field-renderer','proof']],
 [/optical|light|rcwa|fdtd|etch|metasurface/i,'OPTICAL',['optical-screen','rcwa','fabrication-proof']],
 [/forecast|future|predict|trajectory/i,'FORECAST',['trajectory','forecast','uncertainty']],
 [/build|code|repair|software|deploy/i,'BUILD',['archive-memory','github','tests','release-proof']],
 [/proof|evidence|verify|audit/i,'PROOF',['ledger','lineage','replay']],
 [/relative|inverse|outverse|observer/i,'RELATIVITY',['observer-projection','continuity','scar']],
];
export function inferIntent(text:string):Pick<MissionIntent,'requestedProjection'|'requiredCapabilities'>{
 for(const[re,projection,requiredCapabilities]of INTENT_RULES)if(re.test(text))return{requestedProjection:projection,requiredCapabilities};
 return{requestedProjection:'FIELD',requiredCapabilities:['canonical-state','continuity','proof']};
}

export function missionPlan(intent:MissionIntent,tier:OmegaDeviceTier,metrics:LivingMetricPacket):MissionPlan{
 const projection=intent.requestedProjection??inferIntent(intent.text).requestedProjection??'FIELD';
 const caps=[...new Set([...inferIntent(intent.text).requiredCapabilities,...intent.requiredCapabilities])];
 const stages:MissionStage[]=[
  {id:'01',role:'PROPOSE',owner:'GENESIS',capability:'candidate-space',requiresProof:false},
  ...caps.map((capability,i)=>({id:String(i+2).padStart(2,'0'),role:'SCREEN' as const,owner:(capability.includes('optical')||capability.includes('rcwa'))?'OPTICAL' as const:'FEDERATION' as const,capability,requiresProof:true})),
  {id:'90',role:'EXECUTE',owner:'SOVEREIGN',capability:'heavy-compute-when-required',requiresProof:true},
  {id:'95',role:'VERIFY',owner:'OMEGAV6',capability:'proof-ledger',requiresProof:true},
  {id:'98',role:'RENDER',owner:'OMEGAV6',capability:'observer-relative-expression',requiresProof:true},
  {id:'99',role:'ADMIT',owner:'OMEGAV6',capability:'canonical-commit',requiresProof:true}
 ];
 return{id:intent.id,intent,projection,deviceTier:tier,stages,decision:omegaDecision(metrics)};
}

export function progressiveDisclosure(address:number){
 const a=Math.max(0,Math.min(20735,Math.floor(address)));
 return{root12:Math.floor(a/1728),band144:Math.floor(a/144),cell1728:Math.floor(a/12),state20736:a};
}

export function buildCandidate(input:Omit<BuildCandidate,'status'>):BuildCandidate{
 return{...input,status:'PROPOSED'};
}
export function admitBuildCandidate(candidate:BuildCandidate,results:Record<string,boolean>):BuildCandidate{
 const allTests=candidate.tests.every(t=>results[t]===true);
 const preserves=candidate.preserve.every(p=>results[p]===true);
 return{...candidate,status:allTests&&preserves?'ADMITTED':'REJECTED'};
}

export const R123_LAWS=[
 'ONE_CANONICAL_WORLD_MANY_LAWFUL_PROJECTIONS',
 'VISUAL_IS_STATE_CONTROL_EXPLANATION_NOT_DECORATION',
 'INFORMATION_DENSITY_FOLLOWS_FOCUS',
 'RENDER_APPROXIMATION_NEVER_MUTATES_CANONICAL_STATE',
 'PHONE_DESKTOP_SOVEREIGN_CLOUD_ARE_ADAPTIVE_TIERS_NOT_SEPARATE_PRODUCTS',
 'LONG_COMPUTE_STREAMS_PARTIAL_STATE_AND_PROOF',
 'INTENT_ASSEMBLES_TEMPORARY_MISSION_WORKSPACES',
 'FEDERATION_IS_ROUTING_NOT_USER_NAVIGATION',
 'ARCHIVE_IS_ACTIVE_DONOR_MEMORY_NOT_WHOLESALE_REPLACEMENT',
 'EVERY_VISIBLE_PRIMITIVE_MUST_TRACE_TO_COMPUTED_STATE',
 'NO_GENERATED_SCENE_FALLBACK_FOR_COMPUTED_REALITY',
 'SELF_BUILD_IS_GOVERNED_PROPOSE_TEST_COMPARE_ADMIT_WITH_ROLLBACK'
] as const;
