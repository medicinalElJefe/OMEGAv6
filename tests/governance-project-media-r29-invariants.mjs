import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const suite=read('src/OmegaSpecialistSuite.tsx');
const app=read('src/OmegaGovernanceProjectMediaR29.tsx');
const authority=read('src/capabilityAuthority.ts');
for(const route of ['Canon Evolution','Governance','Projects','Assets','Render Queue']){
 assert.match(suite,new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`R29 specialist router missing ${route}`);
 assert.match(authority,new RegExp(`name:'${route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}'.*implementation:'SPECIALIST'`),`R29 capability authority still counts ${route} as shared debt`);
}
for(const token of ['OMEGA_CANON_PROPOSAL_R29','PROPOSAL_ONLY_NOT_CANON','crypto.subtle.digest','OMEGA_GOVERNANCE_DECISION_R29','Admit and commit candidate','omega.v6.projects.r29','memoryRefs','f.arrayBuffer()','BROWSER_LOCAL_HASHED_ASSET','renderSvg','svgToPng','image/svg+xml','image/png'])assert.match(app,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`R29 functional contract missing ${token}`);
assert.match(app,/Governance may commit only the existing canonical AutoPing candidate/);
assert.match(app,/Asset SHA-256 values are computed from actual user-selected file bytes/);
assert.match(app,/SVG and PNG are genuinely generated in-browser from the canonical packet/);
assert.doesNotMatch(app,/@appdeploy\/client|appdeploy\.ai/i);
console.log('R29 GOVERNANCE PROJECT MEDIA PASS · structured canon proposals · governed transition commit · state projects · byte-hashed assets · real local SVG/PNG');
