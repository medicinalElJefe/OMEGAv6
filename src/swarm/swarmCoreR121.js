export const SWARM_SCHEMA='OMEGA_SWARM_R121';
export const SWARM_AXIS=12;
export const SWARM_CELL_COUNT=SWARM_AXIS**3;
export const SWARM_LANE_COUNT=SWARM_AXIS**4;
export const SWARM_MODES=Object.freeze(['SOLO','FLOCK','TREE','PIPELINE','CONSENSUS','MIRROR','FULL']);
export const SWARM_DOMAIN_ROLES=Object.freeze([
 'ORCHESTRATION','SOFTWARE','RESEARCH','MATHEMATICS','PHYSICS','VISUAL','DATA','FORECAST','TOOLS','SOVEREIGN','PROOF','COORDINATION'
]);
export const SWARM_PHASE_ROLES=Object.freeze([
 'FRAME','PARTITION','TRANSFORM','EXCHANGE','INVARIANT_CARRY','SCAR_CARRY','RECONTEXTUALIZE','FORECAST','SYNTHESIZE','EXECUTE','OBSERVE','PROVE'
]);
export const SWARM_REGULATION_ROLES=Object.freeze([
 'EXPAND','PRUNE','STAY','TURN','ESCALATE','CONSENSUS','DIVERGE','MERGE','CACHE','REPLAY','AUDIT','RECOVER'
]);

const int=(v,f=0)=>Number.isFinite(Number(v))?Math.trunc(Number(v)):f;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,int(v,a)));
export function validAxis(v){return Number.isInteger(v)&&v>=0&&v<SWARM_AXIS}
export function cellIndex(domain,phase,regulation){if(![domain,phase,regulation].every(validAxis))throw new Error('Invalid 12x12x12 cell address');return domain*144+phase*12+regulation}
export function decodeCell(index){const i=clamp(index,0,SWARM_CELL_COUNT-1),domain=Math.floor(i/144),rem=i%144,phase=Math.floor(rem/12),regulation=rem%12;return{domain,phase,regulation,index:i}}
export function cellId(input){const a=typeof input==='number'?decodeCell(input):input;if(!a||![a.domain,a.phase,a.regulation].every(validAxis))throw new Error('Invalid swarm cell');return`omega-cell-${String(a.domain+1).padStart(2,'0')}-${String(a.phase+1).padStart(2,'0')}-${String(a.regulation+1).padStart(2,'0')}`}
export function parseCellId(value){const m=String(value||'').match(/^omega-cell-(\d{2})-(\d{2})-(\d{2})$/i);if(!m)return null;const domain=Number(m[1])-1,phase=Number(m[2])-1,regulation=Number(m[3])-1;if(![domain,phase,regulation].every(validAxis))return null;return{domain,phase,regulation,index:cellIndex(domain,phase,regulation),id:cellId({domain,phase,regulation})}}
export function laneIndex(address,seed){const a=typeof address==='number'?decodeCell(address):address;if(!a||![a.domain,a.phase,a.regulation].every(validAxis)||!validAxis(seed))throw new Error('Invalid 12^4 lane');return(((a.domain*12+a.phase)*12+a.regulation)*12+seed)}
export function capabilityProfile(address){const a=typeof address==='number'?decodeCell(address):address;return{domainRole:SWARM_DOMAIN_ROLES[a.domain],phaseRole:SWARM_PHASE_ROLES[a.phase],regulationRole:SWARM_REGULATION_ROLES[a.regulation],address:{domain:a.domain,phase:a.phase,regulation:a.regulation},cellId:cellId(a),lanes:12}}
export function stableSeed(value){let h=2166136261>>>0;for(const ch of String(value||'')){h^=ch.codePointAt(0)||0;h=Math.imul(h,16777619)>>>0}return h>>>0}
function uniquePush(out,seen,i){const n=((i%SWARM_CELL_COUNT)+SWARM_CELL_COUNT)%SWARM_CELL_COUNT;if(!seen.has(n)){seen.add(n);out.push(n)}return out.length}
function fillDeterministic(out,seen,count,seed){let x=seed%SWARM_CELL_COUNT,step=137;while(out.length<count){uniquePush(out,seen,x);x=(x+step)%SWARM_CELL_COUNT;if(out.length<2&&x===seed%SWARM_CELL_COUNT)step=139}return out}
export function selectCellIndices(mode,count,seed=0){const m=String(mode||'TREE').toUpperCase(),target=clamp(count,1,SWARM_CELL_COUNT),out=[],seen=new Set();if(m==='FULL')return Array.from({length:SWARM_CELL_COUNT},(_,i)=>i);
 if(m==='SOLO'){uniquePush(out,seen,seed);return out}
 if(m==='MIRROR'){uniquePush(out,seen,seed);uniquePush(out,seen,seed+864);return fillDeterministic(out,seen,target,seed+1)}
 if(m==='PIPELINE'){for(let d=0;d<12&&out.length<target;d++){const phase=(seed+d)%12,regulation=(seed+2*d)%12;uniquePush(out,seen,cellIndex(d,phase,regulation))}return fillDeterministic(out,seen,target,seed+17)}
 if(m==='CONSENSUS'){const d=seed%12,p=Math.floor(seed/12)%12;for(let r=0;r<12&&out.length<target;r++)uniquePush(out,seen,cellIndex(d,p,r));return fillDeterministic(out,seen,target,seed+29)}
 if(m==='TREE'){for(let d=0;d<12&&out.length<target;d++)for(let p=0;p<12&&out.length<target;p++)uniquePush(out,seen,cellIndex(d,p,(seed+d+p)%12));return fillDeterministic(out,seen,target,seed+43)}
 const stride=Math.max(1,Math.floor(SWARM_CELL_COUNT/target));for(let i=0;i<target;i++)uniquePush(out,seen,seed+i*stride);return fillDeterministic(out,seen,target,seed+59)}
export function defaultCellCount(mode){switch(String(mode||'TREE').toUpperCase()){case'SOLO':return 1;case'MIRROR':return 2;case'PIPELINE':return 12;case'CONSENSUS':return 12;case'FLOCK':return 24;case'FULL':return 1728;default:return 144}}
export function planMissionR121(input={}){const intent=String(input.intent||input.text||'').trim().slice(0,12000);if(!intent)throw new Error('INTENT_REQUIRED');const mode=SWARM_MODES.includes(String(input.mode||'').toUpperCase())?String(input.mode).toUpperCase():'TREE';const requested=clamp(input.requestedCells??input.cells??defaultCellCount(mode),1,SWARM_CELL_COUNT),count=mode==='FULL'?SWARM_CELL_COUNT:requested,seed=stableSeed(`${intent}|${input.seed??''}`),indices=selectCellIndices(mode,count,seed),providerBudget=clamp(input.providerBudget??input.aiCells??Math.min(4,indices.length),0,12),selected=indices.map((index,order)=>{const address=decodeCell(index),profile=capabilityProfile(address);return{order,index,id:profile.cellId,address,profile,providerEligible:order<providerBudget,lane:laneIndex(address,(seed+order)%12)}});const organCounts=Array.from({length:12},(_,domain)=>selected.filter(x=>x.address.domain===domain).length);return{schema:'OMEGA_SWARM_PLAN_R121',intent,mode,requestedCells:count,providerBudget,seed,selected,organCounts,hierarchy:{seed:1,organs:12,branches:144,cells:1728,lanes:20736},continuityLaw:'partition -> exchange/transform -> invariant carry -> scar/residual carry -> re-contextualize/repartition',truthBoundary:'12/144/1728/20736 are OMEGA address and execution-resolution levels. Cell computation and model synthesis do not become canonical truth without existing OMEGA proof/admission.'}}
export function compactPlanR121(plan){return{schema:plan.schema,intent:plan.intent,mode:plan.mode,requestedCells:plan.requestedCells,providerBudget:plan.providerBudget,seed:plan.seed,organCounts:plan.organCounts,hierarchy:plan.hierarchy,truthBoundary:plan.truthBoundary,sampleCells:plan.selected.slice(0,24).map(x=>({id:x.id,index:x.index,address:x.address,profile:x.profile,lane:x.lane,providerEligible:x.providerEligible}))}}
