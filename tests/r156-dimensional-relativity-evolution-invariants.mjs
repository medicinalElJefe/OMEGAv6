import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(v,m)=>assert.ok(v,'R156 '+m);
const runtime=read('src/dimensionalRelativityEvolutionR156.ts');
const panel=read('src/DimensionalRelativityEvolutionR156.tsx');
const calculus=read('src/unifiedCalculus.ts');

for(const token of [
 "R156_SCHEMA='OMEGA_DIMENSIONAL_RELATIVITY_EVOLUTION_R156'",
 "R156_RESIDENT_COUNT=20736",
 "REFERENCE_BIAS_ONLY",
 "partition -> exchange/transform -> invariant carry -> scar/history carry -> re-contextualize/repartition",
 "['PRUNE_01-1','CONSTRUCT_011','CARRY','RECONTEXTUALIZE','PROVE']",
 '12^1 through 12^10',
 '61,917,364,224',
 "execution:power<R156_RESIDENT_POWER?'RESIDENT_AGGREGATE':power===R156_RESIDENT_POWER?'RESIDENT_CANONICAL':'VIRTUAL_UNBOUND'",
 "bound:false",
 "independent:true",
 "contextualAsymmetry",
 "invariantSymmetry",
 "constructVector:[number,number,number]=[0,1,1]",
 "pruneVector:[number,number,number]=[0,1,-1]",
 "angleRadians:Math.PI/2",
 "orientation===0?null",
 '37/73 is a reference kernel/bias only',
 'R125 admission and returned proof remain separate authorities'
])must(runtime.includes(token),`runtime invariant missing ${token}`);

must(!runtime.includes('contextualAsymmetry=clamp(1-'), 'asymmetry may not be derived as the complement of symmetry');
must(calculus.includes("symmetryAsymmetryLaw:'Symmetry is preserved/invariant structure under a declared transform; asymmetry is independently derived"),'unified calculus must declare independent symmetry/asymmetry law');
must(calculus.includes('asymmetry=contextualAsymmetry('),'unified calculus must compute asymmetry independently');
must(!calculus.includes('asymmetry=cl(1-symmetry)'), 'legacy complement asymmetry must remain removed');
must(calculus.includes('signedCarry=orientation*cl('),'neutral orientation must produce neutral signed carry');
must(!calculus.includes('signedCarry=(orientation||1)'), 'neutral orientation may not be coerced to outverse');

for(const token of ['R156 · ALL-MODE DIMENSIONAL RELATIVITY EVOLUTION','NESTED FRAME MAP','symmetry ≠ 1 − asymmetry','PRUNE_01-1','CONSTRUCT_011','37 / 73 REFERENCE KERNEL','ALL-MODE PRESSURE FIELD','DERIVED_CANDIDATE_R125_ADMISSION_REQUIRED'])must(panel.includes(token),`panel missing ${token}`);

console.log('R156 DIMENSIONAL RELATIVITY EVOLUTION PASS · resident 20,736 canon + 12^1→12^10 address frames · independent symmetry/asymmetry · signed σ -1/0/+1 · 01-1→011 · 37/73 reference only · R125 admission preserved');
