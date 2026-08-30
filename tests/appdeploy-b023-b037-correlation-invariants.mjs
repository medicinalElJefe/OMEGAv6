import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL('../'+path,import.meta.url),'utf8')}
function has(text,needle,label){if(!text.includes(needle))throw new Error(label+' missing: '+needle)}
function reject(text,needle,label){if(text.includes(needle))throw new Error(label+' must not contain: '+needle)}

const identity=read('src/runtimeIdentity.ts');
const traversal=read('src/traversalRuntime.ts');
const matter=read('src/MatterTraversal.tsx');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const relativity=read('src/RelativityLab.tsx');
const manifest=read('RESTORE_MANIFEST_ADDENDUM_APPDEPLOY_B023_B037_CORRELATION_R1.md');

has(identity,"appDeployLineage:'DONOR_SOURCE_ONLY'",'runtime donor boundary');
has(identity,"nativeAuthority:'B015 R1'",'native authority');
reject(identity,"hostedBuild:'B037'",'canonical hosted authority');
has(manifest,'PRESERVE_NEWER_CANONICAL','correlation conflict policy');
has(manifest,'No canonical capability is intentionally removed','non-regression declaration');

for(const token of ["'ALL MODES'",'fullModeTransitionAudit','FIELD_NODE_CACHE','thresholdCarry','interpolateCorridor','Water discrete argmin candidate action','Light complex amplitude propagation']){
  has(traversal,token,'traversal correlation');
}
for(const token of ['DEVICE_PROFILE','SAFE 30 FPS','webglcontextlost','getFieldNode','HOST_FOLLOW','SHELL_FOLLOW','PROOF_FOLLOW']){
  has(matter,token,'matter/stability correlation');
}
for(const surface of ['Matter Traversal','Extreme Traversal','Relativity','Forecast','Build Out','SAI Lab','Evidence & Proof','Instructions','System Atlas']){
  has(workstation,surface,'surface retention');
}
for(const token of ['futureCoherenceProjection','pefProjection','violetProjection','DimensionalRelativityPanelR24']){
  has(relativity,token,'relativity correlation');
}

console.log('APPDEPLOY B023-B037 CORRELATION PASS');
console.log('Canonical authority preserved; donor progress is correlated without downgrade/overwrite.');
