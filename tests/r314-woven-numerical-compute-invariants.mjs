import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 R314_SCHEMA,R314_REVISION,R314_AUTHORITY,R314_NUMERICAL_CAPABILITIES,R314_TRUTH_BOUNDARY,
 structuralHashR314,vectorAddR314,dotR314,matmulR314,linearSolveR314,gradientR314,jacobianR314,hessianR314,
 integrateSimpsonR314,rootBisectionR314,optimizeGradientR314,executeDagR314,compileNumericalReceiptR314
} from '../src/system/wovenNumericalComputeR314.js';
import {compileWovenDimensionalRelativityR265} from '../src/system/wovenDimensionalRelativityR265.js';

const r240=fs.readFileSync('src/system/calculusAddressFabricR240.ts','utf8');
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} !~= ${b}`);
assert.equal(R314_SCHEMA,'OMEGA_WOVEN_NUMERICAL_COMPUTE_R314');
assert.equal(R314_REVISION,'R314');
assert.equal(R314_AUTHORITY.addressing,'R240');
assert.equal(R314_AUTHORITY.continuity,'R265');
assert.equal(R314_AUTHORITY.dispatch,'R147');
assert.equal(R314_AUTHORITY.history,'R146');
assert.equal(R314_AUTHORITY.returnProof,'R141');
assert.equal(R314_AUTHORITY.canonAdmission,'R125');
assert.equal(R314_AUTHORITY.productionWriter,'.github/workflows/ci.yml');
assert.equal(R314_AUTHORITY.addsAuthority,false);
for(const cap of ['VECTOR','MATRIX','DAG','GRADIENT','JACOBIAN','HESSIAN','INTEGRATION','ROOT','LINEAR_SOLVE','OPTIMIZATION'])assert.ok(R314_NUMERICAL_CAPABILITIES.includes(cap));
assert.match(R314_TRUTH_BOUNDARY,/not empirical truth/i);
for(const token of ["from './wovenNumericalComputeR314.js'",'numericalReceiptForOperatorR240','compileNumericalReceiptR314','R314_NUMERICAL_CAPABILITIES','parallelismStillGovernedByR239:true'])assert.ok(r240.includes(token),`R240/R314 binding missing ${token}`);

assert.deepEqual(vectorAddR314([1,2,3],[4,5,6]),[5,7,9]);
assert.equal(dotR314([1,2,3],[4,5,6]),32);
assert.deepEqual(matmulR314([[1,2],[3,4]],[[5,6],[7,8]]),[[19,22],[43,50]]);

const linear=linearSolveR314([[3,2],[1,2]],[5,5]);
near(linear.value[0],0,1e-10);near(linear.value[1],2.5,1e-10);near(linear.residual,0,1e-10);assert.equal(linear.converged,true);
assert.throws(()=>linearSolveR314([[1,2],[2,4]],[1,2]),/singular|ill-conditioned/);

const g=gradientR314(([x,y])=>x*x+3*y*y,[2,-1]);near(g[0],4,1e-4);near(g[1],-6,1e-4);
const J=jacobianR314(([x,y])=>[x*x+y,x*y],[2,3]);near(J[0][0],4,1e-4);near(J[0][1],1,1e-4);near(J[1][0],3,1e-4);near(J[1][1],2,1e-4);
const H=hessianR314(([x,y])=>x*x+3*x*y+2*y*y,[1,2]);near(H[0][0],2,1e-3);near(H[0][1],3,1e-3);near(H[1][0],3,1e-3);near(H[1][1],4,1e-3);

const integral=integrateSimpsonR314(Math.sin,0,Math.PI,{segments:512});near(integral.value,2,1e-9);assert.equal(integral.converged,true);
const root=rootBisectionR314(x=>x*x-2,0,2,{tolerance:1e-12});near(root.value,Math.SQRT2,1e-10);assert.equal(root.converged,true);assert.ok(root.residual<1e-10);
const optimum=optimizeGradientR314(([x,y])=>(x-3)**2+(y+2)**2,[9,9],{learningRate:.2,tolerance:1e-9,maxIterations:300});near(optimum.value[0],3,1e-4);near(optimum.value[1],-2,1e-4);assert.ok(optimum.objective<1e-8);

const nodes=[
 {id:'x',op:'input',key:'x'},
 {id:'w',op:'const',value:[2,3]},
 {id:'score',op:'dot',args:['x','w']},
 {id:'bias',op:'const',value:4},
 {id:'out',op:'add',args:['score','bias']}
];
const memo=new Map();
const dag=executeDagR314(nodes,{inputs:{x:[5,7]},memo,provenance:['UNIT_TEST_DECLARED_INPUT']});
assert.equal(dag.output,35);assert.equal(dag.externalScientificTruthClaimed,false);assert.equal(dag.canonAdmissionClaimed,false);assert.ok(dag.memoEntries>=2);assert.equal(dag.provenance[0],'UNIT_TEST_DECLARED_INPUT');
const dag2=executeDagR314(nodes,{inputs:{x:[5,7]},memo,provenance:['UNIT_TEST_DECLARED_INPUT']});assert.equal(dag2.outputHash,dag.outputHash);assert.equal(structuralHashR314({b:2,a:1}),structuralHashR314({a:1,b:2}));

const address={organ:3,branch:1,cell:2,lane:3,address:((3*12+1)*12+2)*12+3,deepPhase:7,deepAddress:(((3*12+1)*12+2)*12+3)*12+7};
assert.ok(address.address>=0&&address.address<20736);assert.equal(address.deepAddress,address.address*12+7);
const woven=compileWovenDimensionalRelativityR265({metrics:{continuity:.9,plasticity:.8,contradiction:.1,burden:.2,scar:.1,evidence:.9},orientation:1,provenance:['R314_TEST'],roundTripResidual:.001,commutationResidual:.002});
assert.equal(woven.dimensionalRelativity.physicalDimensionsClaimed,false);assert.equal(woven.proof.roundTripStatus,'PASS');assert.equal(woven.proof.commutationStatus,'PASS');
const receipt=compileNumericalReceiptR314({operation:'DAG_EVALUATION',result:dag.output,address,orientation:woven.dimensionalRelativity.orientation,provenance:dag.provenance});
assert.equal(receipt.address.address,address.address);assert.equal(receipt.orientation,1);assert.equal(receipt.physicalDimensionsClaimed,false);assert.equal(receipt.executionProofClaimed,false);assert.equal(receipt.externalScientificTruthClaimed,false);assert.equal(receipt.canonAdmissionClaimed,false);assert.equal(receipt.authority.dispatch,'R147');assert.equal(receipt.authority.canonAdmission,'R125');

console.log('OMEGA R314 WOVEN NUMERICAL COMPUTE PASS · deterministic vector/matrix algebra + linear solve + gradient/Jacobian/Hessian + integration + root solve + bounded optimization + memoized DAG + R240 address binding + R265 continuity/provenance + R147/R146/R141/R125 authority unchanged');
