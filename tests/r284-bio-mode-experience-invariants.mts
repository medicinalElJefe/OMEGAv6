import assert from 'node:assert/strict';
import {initCorpusPack,corpusState} from '../src/corpusRuntime.ts';
import {compareBioModesR284,compileBioModeExperienceR284,evidenceClassR284} from '../src/bioModeExperienceR284.ts';

await initCorpusPack();
const record=corpusState(0);
const experience=compileBioModeExperienceR284(record);

assert.equal(experience.total,241);
assert.equal(experience.sourceCatalogCount,179);
assert.equal(experience.canonAuthorityCount,62);
assert.equal(experience.measurementAuthority,0);
assert.equal(experience.clinicalDisplayAuthority,0);
assert.ok(experience.groups.length>0);
assert.ok(experience.laws.includes('MODE_UI_MUST_RENDER_SOURCE_METADATA_NOT_INVENT_CLINICAL_MEANING'));
assert.ok(experience.channels.every((x:any)=>x.measurementAuthority===0));
assert.ok(experience.channels.every((x:any)=>x.clinicalDisplayAuthority===0));
assert.ok(experience.channels.every((x:any)=>x.education&&x.validationNeed&&x.boundary));
assert.ok(experience.channels.every((x:any)=>!('domain' in x)&&!('layer' in x)),'R284 must not invent biological domain/layer mappings for analytical modes');

const source=experience.channels.filter((x:any)=>x.family==='SOURCE_CATALOG');
const canon=experience.channels.filter((x:any)=>x.family==='CANON_AUTHORITY');
assert.equal(source.length,179);
assert.equal(canon.length,62);
assert.ok(source.every((x:any)=>x.evidenceClass==='CATALOG_AFFINITY'));
assert.ok(source.every((x:any)=>x.education.includes('does not prove that a historical donor formula executed exactly')));
assert.ok(canon.every((x:any)=>x.evidenceClass!=='CATALOG_AFFINITY'));
assert.ok(canon.every((x:any)=>x.education.includes('not independent biological replication')));
assert.equal(evidenceClassR284(source[0]),'CATALOG_AFFINITY');

const comparison=compareBioModesR284(source[0],canon[0]);
assert.ok(comparison);
assert.equal(comparison?.sameFamily,false);
assert.equal(comparison?.measurementAuthorityDelta,0);
assert.ok(comparison?.truthBoundary.includes('not a physiological difference'));
assert.ok(experience.truthBoundary.includes('R282 remains the only clinical-weight/release gate'));

console.log('R284 PASS · 241 real channels · 179 source + 62 canon · metadata-bound education · no invented biological mappings · zero measurement/clinical display authority · read-only mode comparison');
