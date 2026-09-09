import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEarthContextModel, earthStructuralScore, anchorsFromCalibratedPatch, buildOmegaContinuousField } from '../src/omega-field-core.mjs';
import { buildFullOmegaField, FULL_OMEGA_MODE_STACK } from '../src/omega-mode-stack.mjs';
import { EARTH_GRID_SOURCE_SHA256 } from '../src/earth-grid.mjs';

const numericFields=['real_elev_proxy_m','relief_alignment_score','motion_rel_score','water_triangle_ratio','scar_carry_index','thread_score','depth_motion_tension','water_bathy_tension','orogenic_scar_tension'];
function syntheticGrid(){
  const rows=[];
  for(let iy=0;iy<37;iy++)for(let ix=0;ix<72;ix++){
    const lat=-90+iy*5,lon=-180+ix*5;
    const elev=1400*Math.sin(lat*Math.PI/180)*Math.cos(lon*Math.PI/180)-1200;
    const align=.5+.45*Math.cos(lat*Math.PI/180);
    const motion=.55+.25*Math.sin(lon*Math.PI/90);
    const water=.55-.25*Math.tanh(elev/1800);
    const scar=.55+.2*Math.abs(Math.sin(lat*Math.PI/50));
    const thread=.6+.25*align;
    const depth=Math.max(0,-elev/7000),bathy=Math.max(0,-elev/8500),orogenic=Math.max(0,elev/5000);
    rows.push([0,0,0,0,0,0,0,elev,align,motion,water,scar,thread,depth,bathy,orogenic]);
  }
  return {schema:'omega.earth.proxy-grid.compact.v1',sourceSha256:EARTH_GRID_SOURCE_SHA256,boundary:'synthetic unit-test grid',grid:[-90,90,5,-180,175,5,37,72,2664],categoryFields:['topology_zone','real_surface_class','relativity_thread','new_lens_type','thread_tier','lat_band','land_ocean_alignment'],categories:{topology_zone:['test'],real_surface_class:['test'],relativity_thread:['test'],new_lens_type:['quiet'],thread_tier:['strong'],lat_band:['test'],land_ocean_alignment:['test']},numericFields,rows};
}

const grid=syntheticGrid();

test('Earth structural skin uses the charted proxy field without becoming a SAR observation',()=>{
  const model=buildEarthContextModel(grid);
  const score=earthStructuralScore({thread_tier:'strong',relief_alignment_score:.9,motion_rel_score:.7,water_triangle_ratio:.4,scar_carry_index:.8,thread_score:.9,depth_motion_tension:.2,water_bathy_tension:.2,orogenic_scar_tension:.3},model);
  assert.ok(Number.isFinite(score.score));
  assert.ok(score.confidence>0);
});

test('calibrated patch anchors retain measured identity and source geolocation',()=>{
  const patch={state:'CALIBRATED_SENTINEL1_TARGET_PATCH',id:'S1-test',startTime:'2026-09-08T12:00:00Z',target:{lon:-110,lat:32},sourceWindow:[100,200,103,203],width:3,height:3,centerPixel:[101,201],db:new Float32Array([-12,-11,-10,-13,-9,-8,-14,-12,-10]),evidence:{measured:true,grade:'A-'},geoMesh:{validNodeCount:4,nodes:[[{lon:-110.01,lat:32.01,pixel:100,line:200},{lon:-109.99,lat:32.01,pixel:102,line:200}],[{lon:-110.01,lat:31.99,pixel:100,line:202},{lon:-109.99,lat:31.99,pixel:102,line:202}]]}};
  const anchors=anchorsFromCalibratedPatch(patch);
  assert.ok(anchors.length>=5);
  assert.ok(anchors.every(a=>a.measured===true&&a.inferred===false&&Number.isFinite(a.value)));
});

test('continuous world exists as a context prior before any SAR anchor is loaded',()=>{
  const field=buildOmegaContinuousField({bbox:[-180,-90,180,90],cols:12,rows:6,time:'2026-09-08T12:00:00Z',anchors:[],grid});
  assert.equal(field.cells.length,72);
  assert.ok(field.cells.some(c=>c.state==='CONTEXT_PRIOR'));
  assert.ok(field.cells.filter(c=>c.state==='CONTEXT_PRIOR').every(c=>c.value===null&&Number.isFinite(c.displayValue)&&c.measured===false));
});

test('measured SAR anchors calibrate the correlated field into numeric reconstructed SAR state',()=>{
  const anchors=[];
  for(let i=0;i<18;i++)anchors.push({id:`a${i}`,lon:-112+(i%6)*.7,lat:31+Math.floor(i/6)*.8,time:`2026-09-${String(1+i%8).padStart(2,'0')}T12:00:00Z`,value:-18+0.7*i,measured:true,inferred:false,grade:'A'});
  const field=buildOmegaContinuousField({bbox:[-116,28,-106,36],cols:10,rows:8,time:'2026-09-09T12:00:00Z',anchors,grid});
  assert.equal(field.contextFit.state,'CONTEXT_SAR_FIT_READY');
  assert.ok(field.cells.some(c=>Number.isFinite(c.value)&&c.inferred===true));
  assert.ok(field.cells.every(c=>!(c.measured&&c.inferred)));
});

test('full OMEGA mode stack performs recovery, admission, guidance and truth traversal without zero-filling unknowns',()=>{
  const anchors=[];
  for(let i=0;i<24;i++)anchors.push({id:`m${i}`,lon:-111.5+(i%6)*.45,lat:31.2+Math.floor(i/6)*.5,time:`2026-09-${String(1+i%9).padStart(2,'0')}T12:00:00Z`,value:-20+Math.sin(i/3)*4+i*.08,measured:true,inferred:false,grade:'A'});
  const field=buildFullOmegaField({bbox:[-114,29,-108,34],cols:12,rows:10,time:'2026-09-09T12:00:00Z',anchors,grid});
  for(const required of ['OVERALL_CANON','MODE188','DEEP_MOTHER','HIGH_FATHER','NO_NOTHING_TRUTH','FULL_SPHERE','ALPHA','CRIMSON','FORECAST','RAFT188','CTDE','GAMMA_ADMISSION','HEAVY_PRUNE','TRUTH_TRAVERSAL'])assert.ok(FULL_OMEGA_MODE_STACK.includes(required));
  assert.ok(field.cells.every(c=>c.gammaAdmission));
  assert.ok(field.cells.every(c=>c.modeLedger?.TRUTH_TRAVERSAL));
  assert.ok(field.cells.every(c=>Number.isFinite(c.value)||c.value===null));
  assert.ok(field.cells.filter(c=>c.value===null).every(c=>c.displayValue!==0||c.state!=='UNRESOLVED'));
  assert.ok(field.summary.guidanceMean>=0&&field.summary.guidanceMean<=1);
});
