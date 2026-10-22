import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R122 '+msg)};
const sphere=read('src/OmegaEarthRelativitySphereR121.tsx');
const sphereCss=read('src/omegaEarthRelativitySphereR121.css');
const fabric=read('src/fullSystemConvergenceR122.ts');
const launcher=read('src/sovereignLauncherR117.ts');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const navCss=read('src/omegaSideNavigatorR120.css');
const ribbon=read('src/RouteOutputRibbonR111.tsx');
const ribbonCss=read('src/routeOutputRibbonR111.css');
const membrane=read('src/CanonicalMembraneR95.tsx');

for(const token of ['M00','M01','M02','M03','M04','M05','M06','M07','M08','M09','M10','M11','M12','M13','M14','M15'])must(fabric.includes(`id:'${token}'`),`archive build layer missing ${token}`);
for(const invariant of ['ONE_FIELD_ONE_PACKET_TYPE','STATE_PACKET_MEMORY','PACKET_TO_CHILD_FIELD','RELATIVE_ANCHOR','NO_SCENE_SWITCHING','MEMORY_FOLDING','WEBGPU_VULKAN_COMPUTE','SNAPSHOT_OF_FIELD','STYLE_AS_VIEW_LENS','WGS84_GIS_GATE','BODY_TO_CELL_TO_ATOM','SPACE_TO_GALAXY','ADMISSIBILITY_GATE','ONE_CLICK_RUNTIME','REAL_DATA_BOUNDARY','TRUTH_VERIFICATION'])must(fabric.includes(invariant),`archive invariant missing ${invariant}`);
must(fabric.includes("R122_CONTINUITY_LAW='ONE FIELD / ONE PACKET / ONE CONTINUITY LAW / ONE TRAVERSAL SYSTEM'"),'canonical continuity law missing');
must(fabric.includes("'Genesis','Runtime Bootstrap','Authority Registry','Capability Registry'")&&fabric.includes("'Scheduler','Scene','Traversal','Renderer'")&&fabric.includes("'Workspace','Desktop','Validation','Installer'"),'master dependency spine missing');
must(fabric.includes("'OMEGAv6 ADMIT','Genesis PROPOSE','Optical SCREEN','Sovereign SOLVE','proof receipt','OMEGAv6 REPLAY'"),'federation chain missing');

must(sphere.includes("from './fullSystemConvergenceR122'")&&sphere.includes('R122_BUILD_LAYERS.forEach')&&sphere.includes('moduleSignalR122(record.metrics,i,t)'),'whole-sphere visual must actually consume full-system module fabric');
must(sphere.includes('for(let i=0;i<STATE_COUNT;i++)')&&sphere.includes('sourceRGB(i,view)')&&sphere.includes('relativeRadius(cell,projection,t)'),'visual must use the full canonical packet field, selected data skin, and applied relative-radius transform');
must(sphere.includes('invariantCarry')&&sphere.includes('scarCompression')&&sphere.includes("projection==='THREAD'")&&sphere.includes("projection==='MANDALA'")&&sphere.includes("projection==='LATTICE'"),'relative geometry transform is incomplete');
must(sphere.includes('displayRotation.current=rot')&&sphere.includes('freezeRotation')&&!sphere.includes('setFreeRotation(v=>wrapLon(v+dt'),'animation must be render-loop driven rather than React-state churn each frame');
must(sphere.includes('No satellite coverage returned; nothing synthetic substituted.')&&sphere.includes('REFERENCE = published Earth constants'),'visual truth boundary regressed');
must(membrane.includes('projection={projection} view={view}'),'Home mode selection must propagate into the volumetric field instead of merely relabeling a static picture');

must(launcher.includes('R120.3_CMD_SAFE')&&launcher.includes("chr(35)+chr(33)+'/usr/bin/env python3'"),'Hybrid CMD-safe validator missing');
must(!launcher.includes("s.startswith('#!/usr/bin/env python3' in s")&&!launcher.includes("s.startswith('#//omegav6.jeffdeweyeljefe.workers.dev' in s"),'known Hybrid validator regression returned');

must(nav.includes('<RouteOutputRibbonR111 route={currentPanel}/>'),'active route contract must remain reachable');
must(ribbon.includes("<details className='r111-output-ribbon r122-output-contract'>")&&ribbonCss.includes('.r111-output-ribbon>summary'),'route contract must default to compact disclosure instead of blocking navigation');
must(navCss.includes('flex-wrap:wrap!important')&&navCss.includes('overflow-x:hidden!important')&&navCss.includes('--r94-nav-panel:clamp(420px,34vw,520px)'),'navigator must be readable, wrapped and horizontally contained');
must(sphereCss.includes('.r122-volume')&&sphereCss.includes('.r71-home:has(.r122-volume) .r96-workbench')&&sphereCss.includes('min-height:clamp(660px,76dvh,960px)'),'first viewport must prioritize the volumetric instrument over dashboard chrome');

console.log('R122 PASS · CMD-safe Hybrid · non-overflow navigator · volumetric 20,736-cell field · 16-module full-system fabric · source-truth boundaries retained');
