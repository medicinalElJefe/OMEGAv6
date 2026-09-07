import {omegaNavItem} from './navigationRegistry';
import {capabilityExecutionContract} from './operationalCapabilityRuntimeR45';

export const ADAPTIVE_NAVIGATION_SCHEMA='OMEGA_ADAPTIVE_NAVIGATION_R156' as const;

export type MissionStack={id:string;label:string;intent:string;routes:readonly string[]};
export type AdaptiveRouteSuggestion={name:string;reason:string;priority:number};
export type NavigationLiveContext={pcOnline:boolean;missionStatus:string;jobStatus:string;rcwaState:string;rcwaOnline:boolean;proofState:string};

export const R156_MISSION_STACKS:readonly MissionStack[]=[
 {id:'BUILD_SHIP',label:'Build → prove → ship',intent:'Turn active work into a tested, validated and evidence-backed result.',routes:['Development','Build Out','Quality Compiler','Validation','Evidence & Proof']},
 {id:'MODEL_VALIDATE',label:'Model → inspect → validate',intent:'Move from computation into visible inspection, reality checks and proof.',routes:['Reality Lab','Matter Traversal','Visual Instrument','Validation','Evidence & Proof']},
 {id:'CONNECT_EXECUTE',label:'Connect → execute → prove',intent:'Pair a governed host, inspect execution state and verify returned proof.',routes:['Hybrid Link','Cockpit','Evidence & Proof','System']},
 {id:'EARTH_EVIDENCE',label:'Observe → model → forecast',intent:'Carry returned Earth evidence through modeling, bounded forecast and proof.',routes:['Earth Now','Reality Lab','Forecast','Evidence & Proof']},
 {id:'LEARN_EVOLVE',label:'Think → compare → evolve',intent:'Use modes and intelligence controls, then review canonical evolution under governance.',routes:['Modes','Kernel Intelligence','SAI Lab','Canon Evolution','Governance']},
 {id:'RESTORE_CONVERGE',label:'Census → restore → converge',intent:'Inspect historical donors, classify them, restore useful capability and consolidate authority.',routes:['Archive Census','Archive Operators','Build Out','Consolidation','Validation']},
 {id:'ATLAS_TRAVERSE',label:'Address → traverse → render',intent:'Resolve atlas structure, traverse admitted state and inspect the resulting field.',routes:['Atlas','Atlas Calculator','Traversal','Data Motion','Visual Instrument']}
] as const;

const INTENT_TERMS:Record<string,readonly string[]>={
 'Command Center':['ask','act','prompt','reason','route','intent','assistant','command'],
 'Hybrid Link':['pc','computer','host','device','pair','agent','execute','native','machine'],
 'Workspace':['continue','workspace','working','current project','resume'],
 'Cockpit':['status','overview','runtime','readiness','working','active','mission'],
 'Immersive Traversal':['immersive','continuous','embodied','traverse'],
 'Matter Traversal':['matter','material','microstructure','water','scar','geometry'],
 'Extreme Traversal':['extreme','deep','microstructure','topology'],
 'Visual Instrument':['visual','render','display','see','field view','visualize'],
 'Relativity':['relativity','observer','frame','orientation','motion relativity'],
 'Earth Now':['earth','satellite','weather','location','world','map','ground'],
 'Forecast':['forecast','future','predict','corridor','uncertainty'],
 'Atlas':['atlas','20736','address','state space','lattice'],
 'Traversal':['traverse','path','state movement','transition'],
 'Create':['create','make','generate','compose','seed'],
 'Field':['field','packet','continuity','burden','contradiction','scar'],
 'Data Motion':['motion','transport','transition','sequence'],
 'Reality Lab':['reality','model','experiment','back test','observe'],
 'Atlas Calculator':['calculate','calculator','address math','scale math'],
 'Infinity':['recursive','infinity','bounded recursion','expand'],
 'Convergence':['converge','basin','stability','contradiction'],
 'Quality Compiler':['quality','repair','regression','check','gate','failed build'],
 'Build Out':['build','restore','surpass','inherit','merge','compile'],
 'Projects':['project','projects','organize'],
 'Render Queue':['render','queue','output','media job','ship'],
 'Assets':['asset','donor','resource','file'],
 'Modes':['mode','modes','mode188','operators','all modes'],
 'Kernel Intelligence':['kernel','intelligence','reasoning','orchestration','sai'],
 'Evidence & Proof':['proof','evidence','receipt','ledger','truth','admissibility','returned'],
 'Memory':['memory','context','continuity','remember'],
 'Archive Census':['archive','census','history','donor scan'],
 'Archive Operators':['archive','classify','quarantine','donor','merge'],
 'Development':['develop','code','software','repair','implementation'],
 'Canon Evolution':['canon','evolution','revision','inheritance'],
 'SAI Lab':['sai','ai lab','intelligence lab','contributors'],
 'Governance':['governance','policy','authority','admission','release'],
 'Consolidation':['consolidate','one system','duplicate','shadow authority'],
 'Instructions':['instructions','help','guide','how to','operating map'],
 'Plugins':['plugin','integration','adapter','connector'],
 'Settings':['settings','configuration','layout','preference'],
 'System':['system','diagnostic','provider','health','runtime','rcwa'],
 'Validation':['validate','validation','release ready','semantic gate'],
 'System Atlas':['system map','architecture','subsystem','family','topology'],
 'Scale Compiler':['scale','compiler','hierarchy','recursive scale'],
 'Control Matrix':['control','matrix','routing','relationships']
};

const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9Ωφλ&]+/g,' ').trim();
const tokens=(value:string)=>normalize(value).split(/\s+/).filter(Boolean);
const unique=<T,>(items:T[])=>Array.from(new Set(items));

export function adaptiveMissionFor(panel:string){return R156_MISSION_STACKS.find(stack=>stack.routes.includes(panel))||null}
export function missionProgress(stack:MissionStack,panel:string){const index=stack.routes.indexOf(panel);return{index,step:index<0?0:index+1,total:stack.routes.length,complete:index===stack.routes.length-1,next:index>=0&&index<stack.routes.length-1?stack.routes[index+1]:stack.routes[0]}}
function searchCorpus(name:string){const item=omegaNavItem(name),contract=capabilityExecutionContract(name),terms=INTENT_TERMS[name]||[];return normalize([name,item?.hint,item?.group,item?.effect,item?.authority,contract.performance,contract.persistence,...terms].filter(Boolean).join(' '))}
export function semanticRouteScore(query:string,name:string){const q=normalize(query);if(!q)return 0;const corpus=searchCorpus(name),qTokens=tokens(q);let score=0;if(normalize(name)===q)score+=120;if(normalize(name).startsWith(q))score+=70;if(corpus.includes(q))score+=45;for(const token of qTokens){if(normalize(name).includes(token))score+=16;if(corpus.includes(token))score+=8}const item=omegaNavItem(name);if(qTokens.some(x=>['build','make','create','repair','develop','ship'].includes(x))&&item?.effect==='BUILD')score+=18;if(qTokens.some(x=>['proof','verify','validate','evidence','truth'].includes(x))&&['GOVERN','READ'].includes(item?.effect||''))score+=13;if(qTokens.some(x=>['pc','host','computer','device','machine'].includes(x))&&item?.authority==='HOST_GATED')score+=24;if(qTokens.some(x=>['earth','satellite','weather','ground'].includes(x))&&name==='Earth Now')score+=32;return score}
export function rankRoutesForIntent(query:string,candidates:readonly string[]){return candidates.map(name=>({name,score:semanticRouteScore(query,name)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)).map(x=>x.name)}
export function rankMissionStacksForIntent(query:string){const q=normalize(query),qTokens=tokens(q);if(!q)return[];return R156_MISSION_STACKS.map(stack=>{const corpus=normalize(`${stack.label} ${stack.intent} ${stack.routes.join(' ')}`);let score=corpus.includes(q)?45:0;for(const token of qTokens)if(corpus.includes(token))score+=9;return{...stack,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.label.localeCompare(b.label))}

const REASONS:Record<string,string>={
 'Command Center':'Route the next intent from the current state.',
 'Workspace':'Return to the active work context without losing continuity.',
 'Cockpit':'Inspect runtime readiness and the operation currently in flight.',
 'Hybrid Link':'Resolve host/device execution and pairing state.',
 'Visual Instrument':'Inspect the computed state as a visible instrument.',
 'Reality Lab':'Challenge the current model against observation and guarded validation.',
 'Quality Compiler':'Run semantic quality and regression gates before promotion.',
 'Validation':'Check release readiness and universal validation evidence.',
 'Evidence & Proof':'Inspect receipts, admissibility and the truth boundary.',
 'System':'Inspect runtime health, provider state and diagnostics.',
 'System Atlas':'See the subsystem relationship map before changing system structure.',
 'Render Queue':'Carry a build into declared output work.',
 'Development':'Repair or extend implementation from returned evidence.',
 'Governance':'Review admission and authority before canonical evolution.',
 'Consolidation':'Collapse overlapping authorities into the one-system invariant.'
};
function fallbackReason(name:string){const item=omegaNavItem(name);return item?.hint||`Continue through ${name}.`}

export function adaptiveNextRoutes(panel:string,busy:string,live?:Partial<NavigationLiveContext>){
 const activeItem=omegaNavItem(panel),contract=capabilityExecutionContract(panel),mission=adaptiveMissionFor(panel),ordered:string[]=[];
 const missionState=String(live?.missionStatus||'').toUpperCase(),jobState=String(live?.jobStatus||'').toUpperCase();
 if(!live?.pcOnline&&(activeItem?.authority==='HOST_GATED'||['Development','Build Out','Quality Compiler'].includes(panel)))ordered.push('Hybrid Link');
 if(['ACTIVE','PAUSED','RUNNING','QUEUED'].includes(missionState)||['RUNNING','QUEUED','CLAIMED'].includes(jobState))ordered.push('Cockpit','Evidence & Proof');
 if(['FAILED','REJECTED','STALE'].includes(missionState)||['FAILED','REJECTED','STALE'].includes(jobState))ordered.push('Quality Compiler','Development','Evidence & Proof');
 if(String(live?.proofState||'').toUpperCase().includes('RETURN'))ordered.push('Evidence & Proof','Validation');
 if(busy)ordered.push('Cockpit','Evidence & Proof');
 if(mission){const progress=missionProgress(mission,panel);if(progress.next)ordered.push(progress.next);for(const route of mission.routes)if(route!==panel)ordered.push(route)}
 if(activeItem?.authority==='HOST_GATED'||activeItem?.effect==='EXTERNAL_GATE')ordered.push('Hybrid Link','Evidence & Proof','System');
 if(activeItem?.effect==='BUILD')ordered.push('Quality Compiler','Validation','Evidence & Proof','Render Queue');
 if(activeItem?.effect==='COMPUTE')ordered.push('Visual Instrument','Reality Lab','Evidence & Proof');
 if(activeItem?.effect==='GOVERN')ordered.push('Evidence & Proof','Validation','System Atlas');
 if(activeItem?.effect==='READ')ordered.push('Command Center','Workspace','Evidence & Proof');
 if(contract.performance==='EXTREME')ordered.push('Cockpit','Evidence & Proof');
 return unique(ordered).filter(name=>name!==panel&&capabilityExecutionContract(name).routable).slice(0,4).map((name,index):AdaptiveRouteSuggestion=>({name,reason:REASONS[name]||fallbackReason(name),priority:index+1}));
}

export function adaptiveNavigationAudit(allRoutes:readonly string[]){const missingMissionRoutes=unique(R156_MISSION_STACKS.flatMap(x=>x.routes)).filter(x=>!allRoutes.includes(x));const missingIntentRoutes=Object.keys(INTENT_TERMS).filter(x=>!allRoutes.includes(x));return{schema:ADAPTIVE_NAVIGATION_SCHEMA,missions:R156_MISSION_STACKS.length,missingMissionRoutes,missingIntentRoutes,pass:missingMissionRoutes.length===0&&missingIntentRoutes.length===0,boundary:'R156 ranks and composes existing routable capabilities. It does not claim execution, evidence, source access or canonical mutation merely because a route is suggested.'}}
