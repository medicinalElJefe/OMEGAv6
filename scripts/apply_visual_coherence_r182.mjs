import fs from 'node:fs';

const matterPath='src/MatterTraversal.tsx';
let text=fs.readFileSync(matterPath,'utf8');
const replacements=[
 ["import {RUNTIME_IDENTITY} from './runtimeIdentity';type Props=", "import {RUNTIME_IDENTITY} from './runtimeIdentity';import {compileVisualMotionClockR182,observerYawR182,VISUAL_COHERENCE_BOUNDARY} from './visualCoherenceR182';import './visualCoherenceR182.css';type Props="],
 ["const DEFAULT_RENDER:RenderSettings={density:.86,shellOpacity:.78,proofLuminance:.9,deformation:.72,persistence:.4,bloom:.42,sharpness:.62,tone:'FILMIC',shellTarget:7};", "const DEFAULT_RENDER:RenderSettings={density:.78,shellOpacity:.74,proofLuminance:.9,deformation:.38,persistence:.26,bloom:.18,sharpness:.72,tone:'FILMIC',shellTarget:7};"],
 ["[playing,setPlaying]=useState(()=>!(typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches))", "[playing,setPlaying]=useState(false)"],
 ["[drawer,setDrawer]=useState(()=>!DEVICE_PROFILE.lowPower)", "[drawer,setDrawer]=useState(false)"],
 ["focus=observer==='FREE'?{x:0,y:0,z:0}:proofTarget||shellTargetNode||curve,yaw=camera.current.yaw+(observer==='HOST_FOLLOW'?host.phase*.12:0)+now*.000015*host.field.relativity,pitch=", "focus=observer==='FREE'?{x:0,y:0,z:0}:proofTarget||shellTargetNode||curve,motionClock=compileVisualMotionClockR182(playing,tick,progress.current),motionTime=motionClock.routePhase,yaw=observerYawR182(camera.current.yaw,observer,host.phase),pitch="],
 ["uni('uTime',now*.001);", "uni('uTime',motionTime);"],
 ["trail.current.push(center);const maxTrail=", "if(playing)trail.current.push(center);else trail.current=[center];const maxTrail="],
 ["ctx.beginPath();ctx.arc(center.x,center.y,6+4*Math.sin(now*.005),0,TAU);", "ctx.beginPath();ctx.arc(center.x,center.y,6+4*cl(host.field.relativity),0,TAU);"],
 ["},[renderer,route,routeSet,view,observer,projection,host,inspect,mode,render,control,scaleIndex]);const currentOp=", "},[renderer,route,routeSet,view,observer,projection,host,inspect,mode,render,control,scaleIndex,playing,tick]);const currentOp="],
 ["scoreAudit=transitionScoreBreakdown(currentOp,mode),motionPacket=deriveMotionPacket(currentOp,uiProgress,scaleIndex),seek=", "scoreAudit=transitionScoreBreakdown(currentOp,mode),motionPacket=deriveMotionPacket(currentOp,uiProgress,scaleIndex),uiMotionClock=compileVisualMotionClockR182(playing,tick,uiProgress),seek="],
 ["return <div className='matter-traversal b037'>", "return <div className='matter-traversal b037' data-r182-motion={uiMotionClock.mode}>"],
 ["<h2>State traversal first. Dashboard second.</h2>", "<h2>Navigate one proven state transition at a time.</h2>"],
 ["</header><nav className='mt-native-menu'>", "</header><div className='r182-motion-truth'><ShieldCheck/><div><b>{uiMotionClock.mode} · route phase {uiMotionClock.routePhase.toFixed(3)}</b><small>{uiMotionClock.truthBoundary}</small></div></div><nav className='mt-native-menu'>"],
 ["<span>time {host.timeAuthority} · tick {tick}</span>", "<span>route phase {uiMotionClock.routePhase.toFixed(3)} · tick {tick}</span>"],
 ["<p>{host.boundary}</p></section></div>", "<p>{host.boundary} {VISUAL_COHERENCE_BOUNDARY}</p></section></div>"]
];
for(const [from,to] of replacements){const count=text.split(from).length-1;if(count<1)throw new Error(`R182 patch anchor missing: ${from.slice(0,120)}`);text=text.split(from).join(to)}
text=text.replaceAll('now*.001','motionTime');
if(/now\*\.000015|Math\.sin\(now\*\.005\)|now\*\.001/.test(text))throw new Error('R182 wall-clock geometry motion remains');
if(!text.includes("uni('uTime',motionTime)"))throw new Error('R182 shader motion clock was not rebound');
if(!text.includes("[playing,setPlaying]=useState(false)"))throw new Error('R182 explicit route-play default missing');
if(!text.includes("[drawer,setDrawer]=useState(false)"))throw new Error('R182 progressive-disclosure default missing');
if(!text.includes("data-r182-motion={uiMotionClock.mode}"))throw new Error('R182 motion-state surface marker missing');
for(const retained of ["'MATTER','CORRIDOR','PROOF','TOPOLOGY','REPLAY'","'HOST_FOLLOW','SHELL_FOLLOW','PROOF_FOLLOW','FREE'","'NODE','SHELL','HEATMAP','HOST','PROOF'",'downloadReplay','downloadSupportBundle','proofPlate','bookmark','sonify','Commit','Live Immersive','Extreme Traversal'])if(!text.includes(retained))throw new Error(`R182 retained Matter function missing: ${retained}`);
fs.writeFileSync(matterPath,text);

const visualPath='src/OmegaVisualInstrument.tsx';
let visual=fs.readFileSync(visualPath,'utf8');
const newer='CONTINUOUS FIELD · PACKET-LOCKED CAMERA · HUMAN TRAJECTORY · PC EXECUTION SPINE · SOURCE-BOUND';
const preserved='CONTINUOUS FIELD · PC-LINEAGE DEPTH CAMERA · PACKET LOCKED · HUMAN TRAJECTORY · PC EXECUTION SPINE · SOURCE-BOUND';
if(!visual.includes(newer)&&!visual.includes(preserved))throw new Error('R182 Visual Instrument identity anchor missing');
visual=visual.replace(newer,preserved);
for(const retained of ['PC-LINEAGE DEPTH CAMERA','depth-ribbon','Zoom out level','Zoom in level','Camera −','Camera +','Yaw','Pitch','compileDepthNodes','OrientationFrameR182View'])if(!visual.includes(retained))throw new Error(`R182 retained Visual Instrument function missing: ${retained}`);
fs.writeFileSync(visualPath,visual);
console.log('R182 MATTER + VISUAL IDENTITY COHERENCE PATCH PASS');
