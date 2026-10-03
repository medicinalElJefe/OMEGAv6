import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';
import {emitAtomicChemistryResolutionR436,emitSpectralResolutionR436} from '../src/system/canonicalDomainResolutionR436.ts';
import {r43RelativityCoordinates} from '../src/capabilityAtlasR43.ts';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const science=fs.readFileSync('src7/workspaces/ScienceWorkspaceR441.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

const expected=['Command Center','Earth Now','Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal','Relativity','Reality Lab','Atlas','Atlas Calculator','Scale Compiler','Infinity'];
for(const route of expected)assert.equal(isOmega7NativeRoute(route),true,'R441 native route must remain preserved in successors: '+route);
for(const route of ['Relativity','Reality Lab','Atlas','Atlas Calculator','Scale Compiler','Infinity'])assert.equal(isOmega7NativeRoute(route),true,route+' must remain inside OMEGA7');
assert.ok(expected.every(route=>OMEGA7_NATIVE_ROUTES.includes(route)),'R441 science family must remain preserved when later families become native');
assert.equal(isOmega7NativeRoute('Visual Instrument'),false,'creation/render family must not be silently pulled into science migration');

assert.ok(native.includes("lazy(()=>import('./workspaces/ScienceWorkspaceR441'))"),'science family must lazy-load through one bounded workspace');
for(const token of ['RelativityLab','AppliedRealityLab','AtlasViewport','AtlasCalculatorPanel','RecursiveScalePanel','OmegaInfinityPanel','initCorpusPack','corpusState','r43RelativityCoordinates','emitSpectralResolutionR436','atomicChemistrySourceGateR436','presentR436ForHumans'])assert.ok(science.includes(token),'native science workspace missing '+token);
assert.ok(science.includes("localStorage.getItem('omega.v6.address'")&&science.includes("localStorage.setItem('omega.v6.address'"),'science family must use accepted canonical address lineage');
assert.ok(science.includes("(spectral as any).canonicalResolution||emitSpectralResolutionR436"),'science presentation must reuse the R43 canonical spectral packet before any fallback re-emission');
assert.ok(science.includes("atomicChemistrySourceGateR436({})"),'atomic/chemistry status must fail closed until a typed source is supplied');
assert.ok(science.includes("MORE EVIDENCE NEEDED"),'held atomic source must be expressed in human language');
assert.ok(science.includes("depth==='STANDARD'?'CALCULATED FROM STANDARD PHYSICS'")&&science.includes("depth!=='STANDARD'&&spectralResolution"),'Standard science view must translate authority jargon while Advanced/Canon retain technical resolution');
assert.ok(science.includes("useState(depth!=='STANDARD')")&&science.includes("setInstrumentOpen(depth!=='STANDARD')")&&science.includes('Open full {route} instrument'),'Standard science must lead with plain-language summary while Advanced/Canon expose the inherited instrument directly');
assert.ok(native.includes('depth={depth}'),'native science registry must receive the same interface-depth authority as the shell');
assert.ok(science.includes('standard derived physics · address placement remains representational'),'spectral physics and atlas representation must remain separated');

const rel=r43RelativityCoordinates(0);
const spectral=emitSpectralResolutionR436(0,rel);
assert.equal(spectral.domain,'SPECTRAL_COLOR');
assert.equal(spectral.node.authority,'DERIVED_STANDARD');
assert.equal(spectral.canonicalMutation,false);
assert.ok(Number.isFinite(rel.planckRadiance)&&Number.isFinite(rel.wienPeakNm));

const atomic=emitAtomicChemistryResolutionR436({});
assert.equal(atomic.domain,'ATOMIC_CHEMISTRY');
assert.equal(atomic.branch.status,'OBSERVE_ONLY','missing typed atomic source must remain observe-only');
assert.equal(atomic.canonicalMutation,false);

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
for(const route of expected)assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute===route)?.migration,'ADAPTED',route+' must be adapted rather than retired');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false);

assert.equal(lock.sourceMainSha,'eac46888c259c0456b02b3782f5fc6b7c803113c');
assert.equal(lock.sourceMilestone,'R440');
assert.deepEqual(lock.nativeFamilies,['COMMAND_RUNTIME','EARTH_WEATHER','MOTION_TRAVERSAL','SCIENCE_RELATIVITY_ATLAS']);
assert.equal(lock.atomicScienceRule,'TYPED_SOURCE_REQUIRED_BEFORE_ATOMIC_CHEMISTRY_PROMOTION');
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

console.log('OMEGA7 R441 PASS · native science family · spectral/relativity/atlas/reality/scale preserved · atomic source fail-closed · 44/44 inheritance · zero retirement');
