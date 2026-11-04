/** R784 — bounded, source-adapter-specific Temple → SOMA transport.
 * A saved browser preset is untrusted input, not audio authority or clinical data.
 * No audio starts during parsing. Only explicit user gesture may start Web Audio.
 */
export const TEMPLE_ROOMS_R784=Object.freeze(['Shadow','Energy','Ocean','Trees','Cycles','Water Power','Metal Power','Reassurance']);
export const TEMPLE_SCHEMA_R784='OMEGA_TEMPLE_SOMA_PRESET_R473';
function exactNumber(v,name,min,max,step=1){
 if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max||!Number.isInteger(Math.round(v/step)*step/step) || Math.abs(v/step-Math.round(v/step))>1e-9)
  throw new RangeError(name+' outside bounded Temple source contract');
 return v;
}
export function validateTempleSomaPresetR784(preset){
 if(!preset||typeof preset!=='object'||Array.isArray(preset))throw new TypeError('Temple preset object required');
 if(preset.schema!==TEMPLE_SCHEMA_R784)throw new Error('Temple schema mismatch');
 if(preset.canonicalMutation!==false)throw new Error('Temple preset cannot mutate CanonState');
 if(!TEMPLE_ROOMS_R784.includes(preset.room))throw new RangeError('Unknown Temple room');
 const journeyStep=exactNumber(preset.journeyStep,'journeyStep',1,12);
 const activePhase=exactNumber(preset.activePhase,'activePhase',0,11);
 if(activePhase!==journeyStep-1)throw new Error('Temple journey and phase disagree');
 const baseFrequency=exactNumber(preset.baseFrequency,'baseFrequency',36,188);
 const clockSeconds=exactNumber(preset.clockSeconds,'clockSeconds',2,12,.5);
 const autoStopMinutes=exactNumber(preset.autoStopMinutes,'autoStopMinutes',1,30);
 return Object.freeze({schema:TEMPLE_SCHEMA_R784,room:preset.room,journeyStep,activePhase,baseFrequency,clockSeconds,autoStopMinutes,canonicalMutation:false,
  source:'R372 recovered Temple contract + current SOMA successor mapping',
  truthBoundary:'Current local sonification adapter only; no medical treatment, measured frequency, device authority or original donor parity.'});
}
export function compileTempleSomaPresetR784({room,step,breath,minutes}){
 return validateTempleSomaPresetR784({schema:TEMPLE_SCHEMA_R784,room,journeyStep:step,activePhase:step-1,baseFrequency:188,clockSeconds:breath,autoStopMinutes:minutes,canonicalMutation:false});
}
export function parseTempleSomaPresetR784(raw){
 if(typeof raw!=='string'||raw.length>4096)throw new RangeError('Bounded Temple JSON required');
 let preset;try{preset=JSON.parse(raw);}catch{throw new Error('Invalid Temple JSON');}
 return validateTempleSomaPresetR784(preset);
}
