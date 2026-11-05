import fs from 'node:fs';
import assert from 'node:assert/strict';
import {compileTempleSomaPresetR784,validateTempleSomaPresetR784,parseTempleSomaPresetR784,TEMPLE_ROOMS_R784} from '../src/templeSomaPresetR784.js';
const audio=fs.readFileSync('src/SomaAudioEngine.tsx','utf8'),atlas=fs.readFileSync('src/systemAtlasRuntime.ts','utf8'),ui=fs.readFileSync('src/SystemAtlasControl.tsx','utf8'),css=fs.readFileSync('src/somaAudio.css','utf8');
const must=(x,m)=>{if(!x)throw new Error(m)};
for(const token of ['Echo-Chamber / SOMA Audio Engine','PHASE_COHERENT_AUDIO','LOCAL_ACTIVE','12 discrete phase lanes','sonification only'])must(atlas.includes(token),`S17 runtime truth missing: ${token}`);
for(const token of ['window.AudioContext','webkitAudioContext','createDynamicsCompressor','threshold.value=-28','ratio.value=12','createOscillator','createGain','createStereoPanner','1+(lane.k-5.5)*.0025','Math.sin(lane.phi)*.72','phaseGainShape','12 lanes → compressor → master','explicit user gesture','not measured frequencies'])must(audio.includes(token),`SOMA donor behavior missing: ${token}`);
for(const token of ["['α','Alpha seed']","['Base','Yellow carrier']","['011','+π/2 construct']","['01-1','−π/2 prune']","['Ω','Integrate']"])must(audio.includes(token),`SOMA phase lane missing: ${token}`);
must(audio.includes('Math.floor((a%1728)/144)%12'),'packet phase must derive from canonical D/P/R/L address');
must(audio.includes('setSyncPacket(false)'),'manual audio controls must explicitly leave packet-follow mode');
must(audio.includes('packet drives audible parameters; audio never changes canon state'),'audio authority boundary missing');
must(ui.includes("cell.family.id==='S17'&&current?.successor==='LOCAL_ACTIVE'"),'System Atlas must mount executable S17 only when the current successor ledger says LOCAL_ACTIVE');
must(ui.includes("const currentExecutable=new Set(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'])"),'System Atlas must preserve the shared current-successor execution whitelist');
must(ui.includes('<SomaAudioEngine record={record}/>'),'S17 engine not mounted in System Atlas');
must(ui.includes('V24 INVENTORY-ALIGNED SOFTWARE UNIVERSE'),'System Atlas must retain V24 lineage markers as predecessor evidence');
must(ui.includes('OMEGA_SYSTEM_ATLAS_V24_TRUTH.json'),'V24 predecessor receipt marker missing');
must(css.includes('@media(max-width:700px)'),'S17 mobile containment missing');
must(!audio.includes('@appdeploy/client')&&!ui.includes('@appdeploy/client'),'AppDeploy runtime dependency regression');

const templeUi=fs.readFileSync('src/CorpusAdapterWorkbenchR473.tsx','utf8');
const valid=compileTempleSomaPresetR784({room:'Ocean',step:7,breath:6.5,minutes:10});
assert.equal(valid.schema,'OMEGA_TEMPLE_SOMA_PRESET_R473');
assert.equal(valid.journeyStep,7);
assert.equal(valid.activePhase,6);
assert.equal(valid.baseFrequency,188);
assert.equal(valid.clockSeconds,6.5);
assert.equal(valid.autoStopMinutes,10);
assert.equal(valid.canonicalMutation,false);
assert.equal(TEMPLE_ROOMS_R784.length,8);
assert.deepEqual(parseTempleSomaPresetR784(JSON.stringify(valid)),valid);
assert.deepEqual(validateTempleSomaPresetR784(valid),valid);
assert.throws(()=>validateTempleSomaPresetR784({...valid,canonicalMutation:true}),/cannot mutate/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,room:'Unknown'}),/Unknown Temple room/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,journeyStep:8}),/disagree/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,activePhase:6.5}),/contract/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,baseFrequency:Infinity}),/contract/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,baseFrequency:187}),/contract/);
assert.throws(()=>parseTempleSomaPresetR784(JSON.stringify({...valid,baseFrequency:36})),/contract/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,clockSeconds:NaN}),/contract/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,clockSeconds:12.2}),/contract/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,autoStopMinutes:0}),/contract/);
assert.throws(()=>validateTempleSomaPresetR784({...valid,autoStopMinutes:31}),/contract/);
assert.throws(()=>compileTempleSomaPresetR784({room:'Ocean',step:13,breath:6,minutes:10}),/contract/);
assert.throws(()=>parseTempleSomaPresetR784('{'),/Invalid Temple JSON/);
assert.throws(()=>parseTempleSomaPresetR784(' '.repeat(4097)),/Bounded/);
must(templeUi.includes('compileTempleSomaPresetR784({room,step,breath,minutes})'),'Temple UI must validate before storage/event dispatch');
must(audio.includes('validateTempleSomaPresetR784(raw)'),'SOMA must validate all persisted/event preset values');
must(audio.includes('parseTempleSomaPresetR784(raw)'),'SOMA must validate persisted JSON before use');
must(audio.includes('if(!await start())return;stopTimer();setSequencing(true)'),'failed Web Audio start must not present fake-running sequence');
must(audio.includes('explicit Start still required'),'a preset must never auto-play');
for(const token of ['catch(e){stopTimer();setSequencing(false);setRunning(false);clearSafetySession()','lane.osc.stop()','audio.current=null;master.current=null;compressor.current=null','failedContext.close().catch(()=>{})'])must(audio.includes(token),`failed Web Audio start must release graph and reset false-running state: ${token}`);

for(const token of ['let pendingOsc:OscillatorNode|null=null','pendingOsc=osc','pendingOsc=null','if(pendingOsc){try{pendingOsc.stop()}catch{}}','for(const lane of built){try{lane.osc.stop()}catch{}}','void ctx.close().catch(()=>{});throw error'])must(audio.includes(token),`partial Web Audio initialization must release all started lanes and close context: ${token}`);

// R785: Stop and safety deadline must release actual oscillator resources, not merely mute them.
const stopBody=audio.split('const stop=()=>{')[1]?.split('const toggleSequence=')[0];
assert.ok(stopBody,'SOMA Stop handler must exist');
for(const token of ['lane.osc.stop()','lane.osc.disconnect()','lane.gain.disconnect()','lane.pan.disconnect()','lanes.current=[]','audio.current=null','ctx.close().catch(()=>{})','setRunning(false)'])
 must(stopBody.includes(token),'Stop must release Web Audio graph: '+token);
assert.ok(audio.includes('if(remaining<=0){stop();'),'safety timeout must use complete Stop cleanup');

// A delayed AudioContext.resume() must never revive audio after an explicit Stop.
for(const token of ['startEpoch=useRef(0)','const epoch=startEpoch.current','if(epoch!==startEpoch.current||audio.current!==ctx)return false','const stop=()=>{startEpoch.current++'])
 must(audio.includes(token),'late Web Audio resume cancellation missing: '+token);

console.log('R45/R168 SOMA AUDIO PASS · 12 packet-bound lanes · current LOCAL_ACTIVE successor gate · local WebAudio · compressor/master safety · predecessor evidence retained · no authority mutation');
