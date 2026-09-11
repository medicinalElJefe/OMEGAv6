import test from 'node:test';
import assert from 'node:assert/strict';
import { canonPacket, buildCanonicalEarthCube } from '../src/earth-canon-cube.mjs';
import { R260_DOMAIN_REGISTRY } from '../src/earth-canon-domain-registry.mjs';
import { synthesizeCanonicalVisualField, visualFieldInvariant } from '../src/earth-canon-field-synthesis.mjs';
import { buildMeasuredSpatialCalculus } from '../src/sar-measured-calculus-core.mjs';
import { buildMeasuredStructureTensor, buildCanonicalMeasuredVisualSurface } from '../src/earth-canon-visual-core.mjs';

test('R260 domain registry keeps documented geodesy adapters pending',()=>{
  for(const key of ['GNSS','STRAIN','SEISMIC','TILT','PORE_PRESSURE','ENVIRONMENT'])assert.equal(R260_DOMAIN_REGISTRY[key].status,'ADAPTER_PENDING');
  assert.equal(R260_DOMAIN_REGISTRY.SENTINEL1_SAR.status,'LIVE');
});

test('R260 Canon visual field preserves measured authority and bounds derived channels',()=>{
  const measured=canonPacket({id:'m',sourceFamily:'SENTINEL1_SAR',parameter:'calibrated_backscatter',evidenceClass:'MEASURED',regionalMeasured:true,sourceProven:true,continuity:.98,value:-13,units:'dB'});
  const derived=canonPacket({id:'d',sourceFamily:'SENTINEL1_SAR',parameter:'measured_spatial_calculus',evidenceClass:'DERIVED_FROM_MEASURED',continuity:.94});
  const context=canonPacket({id:'t',sourceFamily:'TERRARIUM_DEM',parameter:'elevation',evidenceClass:'CONTEXT',continuity:.9});
  const reconstruction=canonPacket({id:'o',sourceFamily:'OMEGA_FIELD',parameter:'bounded_continuity_reconstruction',evidenceClass:'RECONSTRUCTED',continuity:.4,burden:.2});
  const cube=buildCanonicalEarthCube([measured,derived,context,reconstruction]);
  const field=synthesizeCanonicalVisualField(cube,{terrainCoverage:.9,temporalReady:true,structureReady:true});
  assert.equal(field.state,'READY');assert.equal(field.channels.measuredLuminance,1);assert.ok(field.channels.measuredStructure<=.28);assert.ok(field.channels.terrainRelief<=.18);assert.ok(field.channels.reconstruction<=.02);assert.equal(visualFieldInvariant(field).ok,true);assert.match(field.boundary,/cannot create missing sensor samples/i);
});

test('R260 structure tensor and canonical image are deterministic transforms and do not mutate SAR',()=>{
  const width=17,height=17,db=new Float32Array(width*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++)db[y*width+x]=-24+.55*x+.13*y+2*Math.sin(x*.7)+.7*Math.cos(y*.5);const original=Array.from(db);
  const patch={id:'synthetic-test-array',width,height,db,quantity:'sigmaNought',polarization:'vv',stats:{p02:-25,p98:-10},evidence:{measured:true,inferred:false},sourceWindow:[0,0,width,height],product:{rangePixelSpacing:10,azimuthPixelSpacing:10}};
  const calc=buildMeasuredSpatialCalculus(patch),tensor=buildMeasuredStructureTensor(calc),surface=buildCanonicalMeasuredVisualSurface(patch,calc,{directives:{measuredStructure:.24,localContrast:.18,terrainRelief:0}});
  assert.equal(tensor.state,'MEASURED_STRUCTURE_TENSOR_READY');assert.ok(tensor.stats.validCount>200);assert.ok(tensor.stats.meanAnisotropy>=0&&tensor.stats.meanAnisotropy<=1);assert.equal(surface.evidence.measurementPromotion,false);assert.equal(surface.evidence.sourcePixelsUnchanged,true);assert.equal(surface.rgba.length,width*height*4);assert.deepEqual(Array.from(db),original);assert.match(surface.boundary,/No missing pixel/i);
});
