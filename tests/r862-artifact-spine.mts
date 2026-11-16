import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createModelArtifactR862,validateArtifactR862,decodeArtifactsR862,appendArtifactR862,exportArtifactBundleR863,importArtifactBundleR863} from '../src7/workspaces/omegaArtifactSpineR862.ts';
const svg='<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L1 1"/></svg>';
test('R862 creates, persists and recovers source-derived artifacts with identity and provenance',()=>{
 const a=createModelArtifactR862(svg,[0,1],new Date('2026-11-15T00:00:00.000Z'),'atlas-verified-01');
 assert.equal(a.provenance.addressStart,1);
 assert.equal(a.provenance.addressEnd,2);
 assert.equal(a.provenance.authority,'MODEL_DERIVED');
 assert.equal(validateArtifactR862(a),true);
 assert.deepEqual(decodeArtifactsR862(JSON.stringify(appendArtifactR862([],a))),[a]);
 assert.equal(appendArtifactR862([a],a).length,1);
});
test('R862 rejects invalid data and never upgrades model artifacts to host authority',()=>{
 const a=createModelArtifactR862(svg,[0,1],new Date('2026-11-15T00:00:00.000Z'),'atlas-verified-02');
 assert.equal(validateArtifactR862({...a,provenance:{...a.provenance,authority:'HOST_VERIFIED'}}),false);
 assert.equal(validateArtifactR862({...a,payload:svg.replace('</svg>','<script>alert(1)</script></svg>')}),false);
 assert.deepEqual(decodeArtifactsR862(JSON.stringify([{...a,route:'Hybrid Link'},a])),[a]);
 assert.deepEqual(decodeArtifactsR862('{bad'),[]);
 assert.throws(()=>appendArtifactR862([],{...a,mediaType:'text/html'} as never),/Invalid artifact/);
});

test('R863 transfers validated artifacts and rejects tampered authority',()=>{
 const a=createModelArtifactR862(svg,[0,1],new Date('2026-11-15T00:00:00.000Z'),'atlas-transfer-01');
 const bundle=exportArtifactBundleR863([a]);
 assert.deepEqual(importArtifactBundleR863(bundle,[]),[a]);
 assert.deepEqual(importArtifactBundleR863(bundle,[a]),[a]);
 assert.throws(()=>importArtifactBundleR863(bundle.replace('MODEL_DERIVED','HOST_VERIFIED'),[]),/rejected/);
 assert.throws(()=>importArtifactBundleR863('{"schema":"OMEGA_ARTIFACT_BUNDLE_R863","artifacts":[{}]}',[]),/rejected/);
});
