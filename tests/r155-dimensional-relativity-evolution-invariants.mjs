import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8'),must=(ok,msg)=>assert.ok(ok,`R155 ${msg}`);
const runtime=read('src/dimensionalRelativityEvolutionR155.ts'),panel=read('src/DimensionalRelativityEvolutionR155.tsx'),css=read('src/dimensionalRelativityEvolutionR155.css'),lab=read('src/RelativityLab.tsx'),r24=read('src/dimensionalRelativityR24.ts'),r132=read('src/physicsRelativityRuntimeR132.ts'),r134=read('src/wovenRelativityRuntimeR134.ts'),r100=read('src/weaveStateR100.ts'),unified=read('src/unifiedCalculus.ts'),completion=read('src/fullSystemCompletionR154.js'),control=read('src/system/operationalControlPlaneR130.js');

must(runtime.includes("R155_SCHEMA='OMEGA_DIMENSIONAL_RELATIVITY_EVOLUTION_R155'"),'schema missing');
must(runtime.includes("import {compilePhysicsRelativityR132} from './physicsRelativityRuntimeR132'"),'must inherit R132 all-mode/physics packet');
must(runtime.includes("import {compileDimensionalRelativity} from './dimensionalRelativityR24'"),'must inherit exact R24 workbook computation');
must(runtime.includes("import {deriveWeaveStateR100} from './weaveStateR100'"),'must inherit Woven Continuity carry state');
must(runtime.includes("R155_CONTINUITY_OPERATOR='partition -> exchange/transform -> invariant carry -> scar/history carry -> re-contextualize/repartition'"),'woven continuity evolution law missing');

must(runtime.includes('Array.from({length:10}')&&runtime.includes('12**power'),'12^1 through 12^10 resolution ladder missing');
for(const token of ['R155_RESIDENT_POWER=4','R155_RESIDENT_COUNT=20736','OUTER_COARSE_FRAME','RESIDENT_CANONICAL_FRAME','INNER_VIRTUAL_REFINEMENT','VIRTUAL_UNBOUND','unboundDigits'])must(runtime.includes(token),'nested frame truth contract missing '+token);
must(runtime.includes('descendantStart=a*descendantSpan')&&runtime.includes('bound:false'),'higher resolution must remain an unbound virtual refinement rather than fabricated child state');
must(runtime.includes('61,917,364,224')&&runtime.includes('not asserted as literal physical dimensions'),'12^10 boundary must remain computational/representational');

must(runtime.includes('independentRelativityFieldsR155'),'independent symmetry/asymmetry compiler missing');
must(runtime.includes('sourceSymmetry')&&runtime.includes('invariantSymmetry')&&runtime.includes('contextualAsymmetry'),'independent field outputs missing');
for(const token of ['phaseDifferentiation','phaseGradient','carryDirection','motion','anisotropy','localOffset','history','emergence'])must(runtime.includes(token),'contextual asymmetry component missing '+token);
must(runtime.includes('R155 never defines asymmetry as 1-symmetry or symmetry as 1-asymmetry'),'independent-field law missing');
must(!runtime.includes('contextualAsymmetry=clamp(1-')&&!runtime.includes('invariantSymmetry=clamp(1-'),'R155 may not collapse symmetry/asymmetry into complements');
must(unified.includes("symmetryAsymmetryLaw:'Symmetry is preserved/invariant structure under a declared transform; asymmetry is independently derived"),'unified calculus must inherit the independent field law');
must(unified.includes('asymmetry=contextualAsymmetry(')&&!unified.includes('asymmetry=cl(1-symmetry)'),'unified calculus must stop forcing asymmetry to the complement of symmetry');
must(unified.includes('signedCarry=orientation*cl(')&&!unified.includes('(orientation||1)*cl('),'neutral σ=0 must not be silently promoted to outverse carry');

must(runtime.includes("R155_DUAL_OPERATOR_ORDER=['PRUNE_01-1','CONSTRUCT_011','CARRY','RECONTEXTUALIZE','PROVE']"),'01-1 before 011 operator order missing');
must(runtime.includes("pruneVector:[number,number,number]=[0,1,-1]"),'01-1 vector missing');
must(runtime.includes("constructVector:[number,number,number]=[0,1,1]"),'011 vector missing');
must(runtime.includes('orthogonality:{dot:0,angleRadians:Math.PI/2}'),'dual operator orthogonality proof missing');
must(runtime.includes("dispatch=decision==='STAY'")&&runtime.includes("?'ESCALATE':'TURN'"),'STAY/TURN/ESCALATE dispatch must remain explicit');

for(const token of ["a:37,b:73,sum:110,ratio:37/73","authority:'REFERENCE_BIAS_ONLY'",'signedA:orientation*R155_REFERENCE_KERNEL.a','signedB:orientation*R155_REFERENCE_KERNEL.b','(+37,+73) and (-37,-73) preserve the ratio while reversing orientation'])must(runtime.includes(token),'37/73 reference/orientation boundary missing '+token);
must(!runtime.includes("authority:'SYMMETRY'")&&!runtime.includes("authority:'ASYMMETRY'"),'37/73 may not be hard-coded as symmetry/asymmetry');

for(const token of ['physics.sourceModeField.registryCount','physics.canonAuthorityField.count','modeEnergy','modeEntropy','exactExecuted','activeAuthorities'])must(runtime.includes(token),'all-mode integration missing '+token);
must(runtime.includes("state:'DERIVED_CANDIDATE_R125_ADMISSION_REQUIRED'")&&runtime.includes('proofRequired:true'),'evolution output must remain a proof/admission-gated candidate');
must(runtime.includes('R125 admission and returned proof remain separate authorities'),'R125 admission boundary missing');

must(panel.includes('12¹ → 12¹⁰'),'R155 panel must expose nested 12^1→12^10 resolution');
must(panel.includes('symmetry ≠ 1 − asymmetry'),'panel must explicitly show independent symmetry/asymmetry');
must(panel.includes('PRUNE_01-1')&&panel.includes('CONSTRUCT_011'),'dual operators missing from panel');
must(panel.includes("<option value='0'>0 · NEUTRAL</option>")&&panel.includes("<option value='-1'>−1 · INVERSE</option>")&&panel.includes("<option value='1'>+1 · OUTVERSE</option>"),'signed orientation selector must include -1/0/+1');
must(panel.includes('37 / 73 REFERENCE KERNEL')&&panel.includes('bias reference, never hard-coded symmetry/asymmetry'),'37/73 UI truth label missing');
must(panel.includes('179 source modes + {evolution.allModes.canonAuthorities} canon authorities'),'all-mode pressure UI missing');
must(css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:560px)'),'R155 desktop/mobile containment missing');

must(lab.includes("import DimensionalRelativityEvolutionR155 from './DimensionalRelativityEvolutionR155'"),'Relativity route must import R155 successor');
must(lab.includes('<DimensionalRelativityPanelR24 record={record}/><DimensionalRelativityEvolutionR155 record={record}/>'),'R155 must augment—not replace—the exact R24 donor authority');
must(lab.includes("useState<Tab>('DIMENSIONAL')"),'R24/R155 dimensional instrument must remain the default relativity view');
must(r24.includes("construct_011")&&r24.includes("prune_01-1"),'R24 donor operator lineage must remain preserved');
must(r132.includes('sourceModeField:{registryCount:sourceModes.count')&&r132.includes('canonAuthorityField:{count:authorities.length'),'R132 all-mode/authority source must remain intact');
must(r134.includes('Whole/part, inner/outer and representation are observer-frame roles'),'R134 observer-frame relativity law must remain intact');
must(r100.includes('invariant carry → scar/residual carry → re-contextualize/repartition'),'R100 Woven Continuity law must remain intact');
must(completion.includes("relativityEvolutionRevision:'R155'")&&completion.includes("symmetryAsymmetry:'INDEPENDENT_CONTEXTUAL_FIELDS'"),'one-system completion must bind R155 relativity evolution');
must(control.includes("revision:'R155',id:'DIMENSIONAL_RELATIVITY_EVOLUTION'")&&control.includes('R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'),'operational control must register R155 while preserving R125 admission');

console.log('OMEGA R155 DIMENSIONAL RELATIVITY EVOLUTION PASS · R24 exact donor + R132 179 modes/62 authorities + R100 Woven carry · independent symmetry/asymmetry through unified calculus · 01-1→011 dual operator · σ -1/0/+1 · 37/73 reference only · nested 12^1→12^10 observer frames · no dimensional inflation · R125 admission preserved');
