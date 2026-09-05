const NODE={genesis:'omega-genesis',optical:'omega-optical',sovereign:'omega-sovereign',omegaV6:'omega-v6'};
const VERB={genesis:'PROPOSE',optical:'SCREEN',sovereign:'SOLVE',omegaV6:'ADMIT'};
const uniq=xs=>[...new Set(xs)];
const words=s=>String(s||'').toLowerCase();
const has=(s,re)=>re.test(s);

export function classifyIntentR103(intent){
 const s=words(intent);
 const optical=has(s,/\b(optic|optical|light|etch|etched|metasurface|meta.?surface|wavelength|phase plate|diffraction|diffractive|spectral|lens|photonic|photonics|grating)\b/);
 const exploration=has(s,/\b(explore|generate|invent|alternative|alternatives|candidate|candidates|search space|design space|discover|propose|variation|variants|optimi[sz]e|better design)\b/);
 const fullWave=has(s,/\b(rcwa|fdtd|fem|full.?wave|electromagnetic|validate|validation|convergence|solve|solver|simulation|simulate)\b/);
 const machine=has(s,/\b(pc|computer|machine|native|build|test|package|repair|patch|compile|execute|execution|run locally|local compute)\b/);
 const proof=has(s,/\b(proof|evidence|receipt|lineage|history|admit|admission|canonstate|canonical|verify|verification|audit)\b/);
 const forecast=has(s,/\b(forecast|predict|prediction|future|scenario)\b/);
 const inspect=has(s,/\b(status|inspect|show|view|explain|current state|health|what happened)\b/);
 return{optical,exploration,fullWave,machine,proof,forecast,inspect};
}

export function planIntentR103(intent,status={}){
 const text=String(intent||'').trim(),c=classifyIntentR103(text),required=[],optional=[],reason=[];
 if(!text)return{schema:'OMEGA_FEDERATION_INTENT_PLAN_R103',ok:false,intent:text,requiredNodes:[],optionalNodes:[],steps:[],gate:'INTENT_REQUIRED',summary:'Describe the outcome you want. OMEGA will choose the smallest useful capability path.',truthBoundary:'No infrastructure work is inferred without an operator intent.'};

 if(c.optical){
  if(c.exploration){required.push('genesis');reason.push('candidate/search-space generation')}
  required.push('optical');reason.push('optical compilation or screening');
  if(c.fullWave){required.push('sovereign');reason.push('full-wave validation')}
  required.push('omegaV6');
 }else if(c.fullWave||c.machine){
  required.push('sovereign','omegaV6');reason.push(c.fullWave?'bounded numerical validation':'bounded native execution');
 }else if(c.exploration){
  required.push('genesis','omegaV6');reason.push('proposal/exploration then governed admission');
 }else{
  required.push('omegaV6');reason.push(c.forecast?'canonical forecast/evaluation':c.proof?'evidence/proof inspection':'canonical OMEGA operation');
 }

 if(c.optical&&!c.exploration)optional.push('genesis');
 if(c.optical&&!c.fullWave)optional.push('sovereign');
 const keys=uniq(required),optionalKeys=uniq(optional.filter(x=>!keys.includes(x)));
 const n=status?.nodes||{};
 const stateFor=key=>key==='genesis'?n.genesis?.state:key==='optical'?n.optical?.state:key==='sovereign'?n.sovereign?.state:n.omegaV6?.state;
 const readyFor=key=>{
  const s=String(stateFor(key)||'').toUpperCase();
  if(key==='sovereign')return s==='PC_ONLINE';
  return s==='LIVE';
 };
 const steps=keys.map((key,index)=>({order:index+1,key,node:NODE[key],verb:VERB[key],state:String(stateFor(key)||'UNKNOWN'),ready:readyFor(key)}));
 const blocked=steps.find(x=>!x.ready);
 const gate=blocked?blocked.node:'READY';
 const path=steps.map(x=>x.verb).join(' → ');
 return{
  schema:'OMEGA_FEDERATION_INTENT_PLAN_R103',ok:true,intent:text,classifier:c,requiredNodes:keys.map(k=>NODE[k]),optionalNodes:optionalKeys.map(k=>NODE[k]),steps,gate,
  path,reason:reason.join(' + '),
  summary:blocked?`The minimal path is ${path}. ${blocked.verb} is the first currently unavailable required stage.`:`The minimal path is ${path}. Every required runtime is currently available.`,
  nextAction:blocked?blocked.key==='optical'?'Recover authorized machine access to Optical; do not expose its credential in the browser.':blocked.key==='sovereign'?'Reconnect the persisted Hybrid bridge and prove a fresh authenticated PC heartbeat.':blocked.key==='genesis'?'Recover Genesis health before proposal generation.':'Recover OMEGAv6 canonical runtime health.':'Execute only the required stages and retain one packet/proof lineage.',
  truthBoundary:'This is deterministic capability routing from operator intent plus current federation health. Optional nodes are not invoked merely because they exist; global CanonState admission remains OMEGAv6 authority.'
 };
}
