import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  R436_SCHEMA,
  buildCanonicalResolutionR436,
  emitAtomicChemistryResolutionR436,
  emitEarthWeatherResolutionR436,
  emitSpectralResolutionR436
} from '../src/system/canonicalDomainResolutionR436.ts';
import {r43RelativityCoordinates} from '../src/capabilityAtlasR43.ts';
import {atomicChemistrySourceGateR436} from '../src/system/scienceDomainResolutionR436.ts';
import {compileSystemGenomeR268,genomeByIdR268} from '../src/systemFoundryR268.ts';
import {cloudCandidateResolutionR436} from '../cloudflare/lib/canonical-resolution-r436.mjs';

const spectral=r43RelativityCoordinates(0) as any;
assert.equal(spectral.canonicalResolution.schema,R436_SCHEMA);
assert.equal(spectral.canonicalResolution.domain,'SPECTRAL_COLOR');
assert.equal(spectral.canonicalResolution.branch.status,'RESOLVED');
assert.equal(spectral.canonicalResolution.canonicalMutation,false);
assert.ok(Number.isFinite(spectral.planckRadiance));
assert.equal(spectral.canonicalResolution.node.authority,'DERIVED_STANDARD');

const rejected=buildCanonicalResolutionR436({
  domain:'MOTION_TRAVERSAL',
  stateId:'bad-motion',
  frame:'test',
  boundary:'test',
  sourceIdentity:'test',
  state:{x:1},
  proofClass:'STRUCTURAL_ANALOGY',
  authority:'DERIVED_LENS',
  checks:[{id:'PHYS',kind:'PHYSICAL',passed:false,authority:'DERIVED_STANDARD',reason:'violates known constraint'}],
  truthBoundary:'test'
});
assert.equal(rejected.branch.status,'REJECTED_PHYSICAL');
assert.equal(rejected.branch.score,null);
assert.equal(rejected.branch.physicalVeto,true);
assert.ok(rejected.ledger.some(x=>x.kind==='SCAR'));

const atomicHeld=emitAtomicChemistryResolutionR436({});
assert.equal(atomicHeld.branch.status,'REJECTED_PHYSICAL');
assert.equal(atomicHeld.node.authority,'HYPOTHESIS');
assert.equal(atomicChemistrySourceGateR436({}).sourceReady,false);

const atomic=emitAtomicChemistryResolutionR436({
  Z:26,Symbol:'Fe',Element:'Iron',AtomicMass:55.845,source:'typed-reference'
});
assert.equal(atomic.node.authority,'MEASURED');
assert.equal(atomic.branch.physicalVeto,false);
assert.equal(atomic.node.stateId,'Z-26');

const weather=emitEarthWeatherResolutionR436({
  target:{lat:32.1,lon:-110.9},
  current:{temperatureC:25},
  sources:{openMeteo:{source:'Open-Meteo'},nws:{ok:true,office:'TWC'}},
  satellite:{ok:true,source:'GOES'},
  quality:{sourceAgreement:.9,dataCompleteness:.95},
  derived:{continuityMean24h:.8},
  scarLedger:[],
  canonicalMutation:false
},32.1,-110.9);
assert.equal(weather.branch.status,'ACTIVE');
assert.equal(weather.node.authority,'MEASURED');
assert.equal(weather.canonicalMutation,false);
assert.ok(weather.ledgerHash.length>0);

const cloud=cloudCandidateResolutionR436({
  schema:'OMEGA_CLOUDFLARE_EVOLUTION_CANDIDATE_R388',
  revision:'R388.1',
  machineId:'CLOUD-01',
  status:'GENERATED_PENDING_PROOF',
  repair:{paths:['src/example.ts'],expectedProofs:['EXACT_HEAD'],rejectionScars:[]},
  receipt:{id:'receipt'},
  canonicalAdmission:false,
  directProductionMutation:false
});
assert.equal(cloud.domain,'CLOUD_CANDIDATE');
assert.equal(cloud.branch.status,'BOUNDED');
assert.equal(cloud.canonicalMutation,false);
assert.equal(cloud.checks.every((x:any)=>x.passed),true);

const science=compileSystemGenomeR268(genomeByIdR268('science.lab'),{authenticatedDeviceHeartbeat:false,externalBindings:true});
assert.ok(science.activeFrontier.some(x=>x.id==='science.resolve'),'science.lab must execute canonical scientific resolution');

const motion=fs.readFileSync('src/lemmaMotionNowContinuityR153.ts','utf8');
const capacity=fs.readFileSync('src/relativeCapacityFabricR154.ts','utf8');
const weatherSurface=fs.readFileSync('src/EarthWeatherR375.tsx','utf8');
const cloudMachine=fs.readFileSync('cloudflare/lib/github-machine.mjs','utf8');
const atlas=fs.readFileSync('src/capabilityAtlasR43.ts','utf8');

for(const token of ['compileCanonicalLemmaMotionNowR436','emitMotionResolutionR436(packet)','canonicalResolution'])assert.ok(motion.includes(token),'R436 motion wiring missing '+token);
assert.ok(capacity.includes('compileCanonicalLemmaMotionNowR436(input)'),'R154 live capacity path must consume canonical motion packet');
assert.ok(atlas.includes('emitSpectralResolutionR436(a,rel)'),'R43 spectral engine must emit canonical resolution');
assert.ok(weatherSurface.includes('emitEarthWeatherResolutionR436(data,lat,lon)')&&weatherSurface.includes('data-r436-resolution'),'Earth weather must emit/display canonical resolution state');
assert.ok(cloudMachine.includes("import {cloudCandidateResolutionR436} from './canonical-resolution-r436.mjs'"),'CLOUD-01 machine must import R436 candidate adapter');
assert.ok((cloudMachine.match(/candidate\.canonicalResolution=cloudCandidateResolutionR436\(candidate\)/g)||[]).length>=4,'all CLOUD-01 candidate families must emit canonical resolution');

console.log('R436 PASS · motion/traversal + spectral/color + typed atomic/chemistry gate + Earth/weather + CLOUD-01 candidate reasoning emit canonical NodeState → TransitionRecord → Branch → Ledger state without weakening R125/R240/production authority');
