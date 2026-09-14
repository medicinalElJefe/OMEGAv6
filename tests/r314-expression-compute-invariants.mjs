import assert from 'node:assert/strict';
import {
 R314_EXPRESSION_SCHEMA,R314_EXPRESSION_REVISION,R314_EXPRESSION_OPS,R314_PLAN_KINDS,
 evaluateExpressionR314,expressionFunctionR314,vectorExpressionFunctionR314,executeNumericalPlanR314
} from '../src/system/wovenExpressionComputeR314.js';

const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} !~= ${b}`);
const C=value=>({op:'const',value});
const V=name=>({op:'var',name});
const A=(...args)=>({op:'add',args});
const M=(...args)=>({op:'mul',args});
const P=(a,b)=>({op:'pow',args:[a,b]});

assert.equal(R314_EXPRESSION_SCHEMA,'OMEGA_WOVEN_EXPRESSION_PLAN_R314');
assert.equal(R314_EXPRESSION_REVISION,'R314.3');
for(const op of ['const','var','add','sub','mul','div','pow','sin','cos','exp','log'])assert.ok(R314_EXPRESSION_OPS.includes(op));
for(const kind of ['EVALUATE','GRADIENT','JACOBIAN','HESSIAN','INTEGRATE','ROOT','OPTIMIZE','BATCH','SCENARIO_SWEEP'])assert.ok(R314_PLAN_KINDS.includes(kind));

const quadratic=A(P(V('x'),C(2)),M(C(3),P(V('y'),C(2))));
assert.equal(evaluateExpressionR314(quadratic,{x:2,y:-1}),7);
assert.throws(()=>evaluateExpressionR314(V('missing'),{}),/missing expression variable/);
assert.throws(()=>evaluateExpressionR314({op:'div',args:[C(1),C(0)]},{}),/invalid division/);

const f=expressionFunctionR314(quadratic,['x','y']);assert.equal(f([2,-1]),7);
const vf=vectorExpressionFunctionR314([A(P(V('x'),C(2)),V('y')),M(V('x'),V('y'))],['x','y']);assert.deepEqual(vf([2,3]),[7,6]);

const evaluated=executeNumericalPlanR314({kind:'EVALUATE',expression:quadratic,variables:{x:2,y:-1},provenance:['DECLARED_PLAN']});
assert.equal(evaluated.result,7);assert.equal(evaluated.arbitraryCodeExecution,false);assert.equal(evaluated.executionProofClaimed,false);assert.equal(evaluated.canonAdmissionClaimed,false);assert.equal(evaluated.numericalReceipt.authority.dispatch,'R147');assert.equal(evaluated.numericalReceipt.authority.canonAdmission,'R125');

const grad=executeNumericalPlanR314({kind:'GRADIENT',expression:quadratic,variableNames:['x','y'],variables:{x:2,y:-1}});near(grad.result[0],4,1e-4);near(grad.result[1],-6,1e-4);
const jac=executeNumericalPlanR314({kind:'JACOBIAN',expressions:[A(P(V('x'),C(2)),V('y')),M(V('x'),V('y'))],variableNames:['x','y'],variables:{x:2,y:3}});near(jac.result[0][0],4,1e-4);near(jac.result[1][1],2,1e-4);
const hes=executeNumericalPlanR314({kind:'HESSIAN',expression:A(P(V('x'),C(2)),M(C(3),V('x'),V('y')),M(C(2),P(V('y'),C(2)))),variableNames:['x','y'],variables:{x:1,y:2}});near(hes.result[0][0],2,1e-3);near(hes.result[0][1],3,1e-3);near(hes.result[1][1],4,1e-3);

const integral=executeNumericalPlanR314({kind:'INTEGRATE',expression:{op:'sin',args:[V('x')]},variable:'x',variables:{},lo:0,hi:Math.PI,options:{segments:512}});near(integral.result.value,2,1e-9);
const root=executeNumericalPlanR314({kind:'ROOT',expression:{op:'sub',args:[P(V('x'),C(2)),C(2)]},variable:'x',variables:{},lo:0,hi:2,options:{tolerance:1e-12}});near(root.result.value,Math.SQRT2,1e-10);
const optimum=executeNumericalPlanR314({kind:'OPTIMIZE',expression:A(P({op:'sub',args:[V('x'),C(3)]},C(2)),P({op:'add',args:[V('y'),C(2)]},C(2))),variableNames:['x','y'],variables:{x:9,y:9},options:{learningRate:.2,tolerance:1e-9,maxIterations:300}});near(optimum.result.value[0],3,1e-4);near(optimum.result.value[1],-2,1e-4);

const batch=executeNumericalPlanR314({kind:'BATCH',expression:A(M(C(2),V('x')),M(C(3),V('y'))),variableNames:['x','y'],variables:{x:0,y:0},samples:[[1,1],[2,1],[2,2]],options:{maxBatch:12}});assert.deepEqual(batch.result.values.map(v=>v.value),[5,7,10]);
const sweep=executeNumericalPlanR314({kind:'SCENARIO_SWEEP',expression:{op:'sub',args:[M(C(2),V('x')),V('cost')]},scoreExpression:V('result'),scenarios:[{id:'A',x:2,cost:5},{id:'B',x:4,cost:10},{id:'C',x:3,cost:3}]});assert.equal(sweep.result.ranked[0].id,'C');

const again=executeNumericalPlanR314({kind:'EVALUATE',expression:quadratic,variables:{y:-1,x:2},provenance:['DECLARED_PLAN']});assert.equal(again.planHash,evaluated.planHash,'structurally equivalent declared plans must hash deterministically');assert.equal(again.resultHash,evaluated.resultHash);

console.log('OMEGA R314.3 EXPRESSION COMPUTE PASS · serializable bounded expression AST + evaluate/gradient/Jacobian/Hessian/integrate/root/optimize/batch/scenario plans · deterministic plan/result hashes · no arbitrary-code, dispatch, execution-proof, empirical-proof or Canon authority inflation');
