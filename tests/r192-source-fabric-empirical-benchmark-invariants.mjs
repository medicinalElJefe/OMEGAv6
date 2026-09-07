import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sourceFabricManifestR192,R192_PUBLIC_SOURCES,R192_CONNECTED_CORPUS,R192_CLOUD_SURFACES} from '../src/sourceFabricR192.js';
import {binaryMetricsR192,evaluateFrozenBenchmarkR192,benchmarkManifestR192} from '../src/empiricalBenchmarkR192.js';

const sourceCode=fs.readFileSync('src/sourceFabricR192.js','utf8');
const benchmarkCode=fs.readFileSync('src/empiricalBenchmarkR192.js','utf8');
const worker=fs.readFileSync('src/workerR8.js','utf8');
const cockpit=fs.readFileSync('src/WholeOrganismConvergenceR191.tsx','utf8');

const manifest=sourceFabricManifestR192();
assert.equal(manifest.schema,'OMEGA_SOURCE_FABRIC_R192');
assert.equal(manifest.canonicalAdmissionAuthority,'R125');
assert.equal(manifest.canonicalMutation,false);
assert.ok(R192_PUBLIC_SOURCES.length>=10,'R192 must register a broad current public observation fabric');
assert.ok(R192_CONNECTED_CORPUS.some(x=>x.id==='DRIVE_MASTER_CORPUS_AUDIT'),'Drive master corpus authority anchor missing');
assert.ok(R192_CONNECTED_CORPUS.some(x=>x.id==='LIBRARY_PSC_20736'),'ChatGPT Library 20,736 corpus anchor missing');
assert.ok(R192_CLOUD_SURFACES.some(x=>x.id==='OMEGAV6'&&x.authority==='CANONICAL_RUNTIME'),'Canonical runtime source missing');
assert.ok(R192_CLOUD_SURFACES.some(x=>x.id==='SOVEREIGN_RETIRED_PREVIEW'&&x.authority==='NO_RUNTIME_AUTHORITY'),'Retired Sovereign preview must not regain runtime authority');
for(const token of ['SOURCE_REGISTRATION_IS_NOT_OBSERVATION','CONNECTED_DRIVE_AND_CHATGPT_LIBRARY_ARE_BUILD_CONTROL_CORPORA_NOT_IMPLICIT_WORKER_FILESYSTEMS','STABLE_OBSERVATION_HASH_IS_DISTINCT_FROM_TIME_SPECIFIC_QUERY_RECEIPT','NOAA_SWPC_ALERTS','NOAA_SWPC_AURORA','CDSE_SENTINEL1_GRD','ASF_SENTINEL1_NISAR'])assert.ok(sourceCode.includes(token),`R192 source fabric missing ${token}`);
assert.ok(worker.includes('sourceFabricApiR192'),'R192 source fabric API must be bound into inherited Worker spine');
assert.ok(worker.indexOf('sourceFabricApiR192')<worker.indexOf("return baseWorker.fetch"),'R192 source fabric must be reachable before base fallback');

const modelRows=[];for(let i=0;i<24;i++){const truth=i%2,score=truth?0.85:0.15;modelRows.push({id:`row-${i}`,truth,score,split:'TEST'})}
const metrics=binaryMetricsR192(modelRows,.5);assert.equal(metrics.confusion.tp,12);assert.equal(metrics.confusion.tn,12);assert.equal(metrics.f1,1);assert.equal(metrics.balancedAccuracy,1);
const result=await evaluateFrozenBenchmarkR192({benchmarkId:'synthetic-heldout',datasetFingerprint:'a'.repeat(64),modelFingerprint:'b'.repeat(64),evaluationMode:'RETROSPECTIVE_FROZEN',baselineClass:0,threshold:.5,featureSet:['continuity','burden','contradiction','scar','shell'],rows:modelRows,ablations:[{id:'without-fold',removedFeatures:['fold'],rows:modelRows.map((x,i)=>({...x,score:i%3===0?.7:x.score}))}]});
assert.equal(result.ok,true);assert.equal(result.model.f1,1);assert.ok(result.improvement.balancedAccuracy>0);assert.equal(result.canonicalMutation,false);assert.equal(result.canonicalAdmissionAuthority,'R125');assert.match(result.truthBoundary,/cannot be described as prospective prediction/i);assert.match(result.receiptSha256,/^[a-f0-9]{64}$/);
const badProspective=await evaluateFrozenBenchmarkR192({benchmarkId:'bad-prospective',datasetFingerprint:'a'.repeat(64),modelFingerprint:'b'.repeat(64),evaluationMode:'PROSPECTIVE_PRECOMMITTED',baselineClass:0,rows:[{truth:1,score:.9,split:'PROSPECTIVE',predictionCommittedAt:200,outcomeObservedAt:100}]});assert.equal(badProspective.ok,false);assert.ok(badProspective.errors.includes('PROSPECTIVE_PREDICTION_MUST_PRECEDE_OUTCOME'));
const benchmarkManifest=benchmarkManifestR192();assert.equal(benchmarkManifest.canonicalAdmissionAuthority,'R125');for(const token of ['DATASET_AND_MODEL_FINGERPRINTS_ARE_REQUIRED','RETROSPECTIVE_FROZEN_EVALUATION_IS_NOT_PROSPECTIVE_PREDICTION','ABLATION_MUST_COMPARE_THE_SAME_EVALUATION_ROWS','IMPROVEMENT_OVER_BASELINE_IS_A_VALUE_SIGNAL_NOT_UNIVERSAL_PROOF'])assert.ok(benchmarkCode.includes(token),`R192 benchmark law missing ${token}`);
for(const token of ['Source fabric','External proof gate','benchmarkManifestR192','sourceFabricManifestR192'])assert.ok(cockpit.includes(token),`R192 organism cockpit missing ${token}`);

console.log('R192 SOURCE FABRIC + EMPIRICAL BENCHMARK PASS · typed cloud/corpus/public sources, bounded public adapters, frozen held-out/prospective metrics, ablation, receipts and R125 authority boundary preserved');
