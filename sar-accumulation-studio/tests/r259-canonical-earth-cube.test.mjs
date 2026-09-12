import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCanonicalMeasuredSurface, surfaceAdmission } from '../src/sar-r259-canonical-surface-core.mjs';
import { CANON_DOMAIN_REGISTRY, CANON_ENGLISH_GLOSSARY, canonicalObservation, mode188Kernel, fuseObservations, buildCanonicalEarthFrame, renderDirective } from '../src/canonical-earth-cube-core.mjs';

test('R259 domain registry covers SAR plus geodetic/borehole/context families',()=>{
  for(const key of ['SAR','INSAR','GNSS','STRAIN','SEISMIC','TILT','PORE_PRESSURE','ENVIRONMENTAL','TERRAIN','WATER','EVENTS','PROVENANCE'])assert.ok(CANON_DOMAIN_REGISTRY[key],key);
  assert.match(CANON_ENGLISH_GLOSSARY.mode188,/cannot manufacture physical measurement/i);
});

test('Mode188 preserves strong evidence and prunes weak contradictory states',()=>{
  const strong=mode188Kernel({continuity:.92,burden:.05,contradiction:.04,plasticity:.9,evidence:1,scar:.01});
  const weak=mode188Kernel({continuity:.15,burden:.8,contradiction:.75,plasticity:.2,evidence:.2,scar:.6});
  assert.equal(strong.decision,'STAY');
  assert.equal(strong.admissibility,'ACCEPT');
  assert.equal(weak.decision,'ESCALATE');
  assert.equal(weak.admissibility,'PRUNE');
});

test('Evidence hierarchy cannot promote derived SAR into measurement',()=>{
  const measured=canonicalObservation({id:'m',domain:'SAR',evidenceClass:'REGISTERED_MEASURED',continuity:.9,burden:.05,contradiction:.02,sourceRefs:['scene']});
  const derived=canonicalObservation({id:'d',domain:'SAR',evidenceClass:'DERIVED_MEASURED',continuity:.9,burden:.05,contradiction:.02,sourceRefs:['gradient']});
  assert.equal(measured.measured,true);
  assert.equal(derived.measured,false);
  assert.equal(derived.derived,true);
  assert.ok(measured.metrics.authority>derived.metrics.authority);
});

test('Unified Coherence retains valid sources while scars remain explicit',()=>{
  const sar=canonicalObservation({id:'sar',domain:'SAR',evidenceClass:'REGISTERED_MEASURED',continuity:.95,burden:.03,contradiction:.01,sourceRefs:['s1']});
  const terrain=canonicalObservation({id:'dem',domain:'TERRAIN',evidenceClass:'CONTEXT',continuity:.8,burden:.1,contradiction:.02,sourceRefs:['dem']});
  const fusion=fuseObservations([sar,terrain],[{domain:'GNSS',reason:'temporary upstream failure'}]);
  assert.equal(fusion.measured,1);
  assert.equal(fusion.scarCount,1);
  assert.ok(fusion.sourceSurvival>0);
  assert.equal(fusion.byDomain.SAR.count,1);
});

test('Canonical Earth frame exposes explicit data-cube axes and measured render authority',()=>{
  const sar=canonicalObservation({id:'sar',domain:'SAR',evidenceClass:'REGISTERED_MEASURED',continuity:.96,burden:.02,contradiction:.01,sourceRefs:['s1']});
  const gradient=canonicalObservation({id:'g',domain:'SAR',evidenceClass:'DERIVED_MEASURED',continuity:.9,burden:.06,contradiction:.02,sourceRefs:['s1:grad']});
  const frame=buildCanonicalEarthFrame({target:{lon:-110.9,lat:32.2},bbox:[-111,32,-110.8,32.4],atlas:{atlasAddress:20736},observations:[sar,gradient]});
  assert.equal(frame.schema,'omega.canonical-earth-data-cube.v1');
  assert.match(frame.axes.e,/evidence/i);
  assert.equal(frame.render.authority,'MEASURED');
  assert.equal(frame.fusion.measured,1);
  const directive=renderDirective(frame);
  assert.equal(directive.primary,'MEASURED');
  assert.ok(directive.detailWeight>0);
});

test('R259 canonical surface preserves source pixel dimensions and evidence boundary',()=>{
  const patch={id:'scene',width:3,height:3,db:new Float32Array([-12,-11,-10,-13,-9,-8,-14,-12,-7]),sourceWindow:[0,0,3,3],geoMesh:null,evidence:{measured:true}};
  const arrays={raw:new Float32Array([.1,.2,.3,.2,.5,.7,.1,.4,.9]),detail:new Float32Array([.1,.22,.32,.18,.55,.72,.1,.42,.92]),gradient:new Float32Array([0,.1,.2,.1,.4,.3,.1,.2,.5]),curvature:new Float32Array([0,.02,.03,.01,.04,.02,0,.03,.05]),texture:new Float32Array([.1,.1,.2,.1,.3,.2,.1,.2,.4]),orientation:new Float32Array(9)};
  const calculus={arrays,scales:{gradientP98:.5,absCurvatureP98:.05,textureP98:.4},stats:{validFraction:1}};
  const frame=buildCanonicalEarthFrame({observations:[canonicalObservation({id:'m',domain:'SAR',evidenceClass:'REGISTERED_MEASURED',continuity:.95,burden:.02,contradiction:.01,sourceRefs:['scene']})]});
  const surface=buildCanonicalMeasuredSurface(patch,calculus,null,{...frame,directive:renderDirective(frame)},{mode:'canon'});
  assert.equal(surface.width,3);assert.equal(surface.height,3);assert.equal(surface.rgba.length,36);assert.equal(surface.evidence.sourceMeasured,true);assert.equal(surface.evidence.measurementPromotion,false);
  const admission=surfaceAdmission({patch,calculus,frame});assert.equal(admission.accepted,true);
});