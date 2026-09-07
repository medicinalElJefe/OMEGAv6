import fs from 'node:fs';

const atlasPath='src/VisualAtlasR183.tsx';
let atlas=fs.readFileSync(atlasPath,'utf8');
atlas=atlas.replaceAll('Math.log12(s.count)/Math.log12(35831808)','Math.log(s.count)/Math.log(35831808)');
if(atlas.includes('Math.log12'))throw new Error('R183 invalid Math.log12 remains');
fs.writeFileSync(atlasPath,atlas);

const path='src/OmegaVisualInstrument.tsx';
let text=fs.readFileSync(path,'utf8');
const replacements=[
 ["import OrientationFrameR182View from './OrientationFrameR182';", "import OrientationFrameR182View from './OrientationFrameR182';\nimport {compileVisualAtlasR183} from './visualAtlasR183';\nimport VisualAtlasR183 from './VisualAtlasR183';"],
 ["trajectory=useMemo(()=>field?compileSourceTrajectory(field,address,48):null,[field,address]),orientation=useMemo(()=>field?compileOrientationFrameR182(field,address,yaw,pitch,cameraZoom):null,[field,address,yaw,pitch,cameraZoom]);", "trajectory=useMemo(()=>field?compileSourceTrajectory(field,address,48):null,[field,address]),orientation=useMemo(()=>field?compileOrientationFrameR182(field,address,yaw,pitch,cameraZoom):null,[field,address,yaw,pitch,cameraZoom]),visualAtlas=useMemo(()=>field&&orientation?compileVisualAtlasR183(field,address,orientation,24):null,[field,address,orientation]);"],
 ["<OmegaMotionSkinMapR35 address={address} onSelectAddress={onCommit} compact/>{trajectory&&", "<OmegaMotionSkinMapR35 address={address} onSelectAddress={onCommit} compact/>{visualAtlas&&<VisualAtlasR183 packet={visualAtlas} onSelectAddress={onCommit}/>} {trajectory&&"]
];
for(const [from,to] of replacements){if(!text.includes(from)&&!text.includes(to))throw new Error(`R183 Visual Instrument anchor missing: ${from.slice(0,120)}`);text=text.replace(from,to)}
for(const retained of ['PC-LINEAGE DEPTH CAMERA','ContinuousFieldOverlayR13','TrajectoryFieldOverlay','OmegaMotionSkinMapR35','OrientationFrameR182View','COMPILER_LINEAGES','SPINE_VIEWS','LENSES','Admitted next','Previous','Zoom in level','Zoom out level','Yaw','Pitch'])if(!text.includes(retained))throw new Error(`R183 retained Visual Instrument function missing: ${retained}`);
for(const required of ['compileVisualAtlasR183','VisualAtlasR183','visualAtlas&&<VisualAtlasR183 packet={visualAtlas} onSelectAddress={onCommit}/>'])if(!text.includes(required))throw new Error(`R183 live visual atlas integration missing: ${required}`);
fs.writeFileSync(path,text);
console.log('R183 LIVE VISUAL ATLAS INTEGRATION PATCH PASS');
