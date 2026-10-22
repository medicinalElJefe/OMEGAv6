import {
 R314_SCHEMA,R314_REVISION,R314_AUTHORITY,structuralHashR314,gradientR314,jacobianR314,hessianR314,
 integrateSimpsonR314,rootBisectionR314,optimizeGradientR314,batchEvaluateR314,scenarioSweepR314,
 compileNumericalReceiptR314
} from './wovenNumericalComputeR314.js';

export const R314_EXPRESSION_SCHEMA='OMEGA_WOVEN_EXPRESSION_PLAN_R314';
export const R314_EXPRESSION_REVISION='R314.3';
export const R314_EXPRESSION_OPS=Object.freeze(['const','var','add','sub','mul','div','pow','neg','abs','sqrt','sin','cos','tan','exp','log','min','max']);
export const R314_PLAN_KINDS=Object.freeze(['EVALUATE','GRADIENT','JACOBIAN','HESSIAN','INTEGRATE','ROOT','OPTIMIZE','BATCH','SCENARIO_SWEEP']);

const finite=n=>{const x=Number(n);if(!Number.isFinite(x))throw new Error('R314 expression requires finite numeric values');return x};
const assertExpr=e=>{if(!e||typeof e!=='object'||!R314_EXPRESSION_OPS.includes(String(e.op)))throw new Error('R314 invalid expression node');return e};
const argsOf=e=>Array.isArray(e.args)?e.args:[];

export function evaluateExpressionR314(expression,variables={}){
 const evalNode=node=>{
  const e=assertExpr(node),op=e.op,args=argsOf(e);
  if(op==='const')return finite(e.value);
  if(op==='var'){const key=String(e.name||'');if(!(key in variables))throw new Error(`R314 missing expression variable ${key}`);return finite(variables[key])}
  const a=args.map(evalNode);
  if(op==='add')return a.reduce((x,y)=>x+y,0);
  if(op==='sub'){if(a.length!==2)throw new Error('R314 sub requires 2 args');return a[0]-a[1]}
  if(op==='mul')return a.reduce((x,y)=>x*y,1);
  if(op==='div'){if(a.length!==2||a[1]===0)throw new Error('R314 invalid division');return a[0]/a[1]}
  if(op==='pow'){if(a.length!==2)return(()=>{throw new Error('R314 pow requires 2 args')})();return finite(Math.pow(a[0],a[1]))}
  if(op==='neg'){if(a.length!==1)throw new Error('R314 neg requires 1 arg');return-a[0]}
  if(op==='abs'){if(a.length!==1)throw new Error('R314 abs requires 1 arg');return Math.abs(a[0])}
  if(op==='sqrt'){if(a.length!==1||a[0]<0)throw new Error('R314 invalid sqrt');return Math.sqrt(a[0])}
  if(op==='sin')return Math.sin(a[0]);
  if(op==='cos')return Math.cos(a[0]);
  if(op==='tan')return finite(Math.tan(a[0]));
  if(op==='exp')return finite(Math.exp(a[0]));
  if(op==='log'){if(a.length!==1||a[0]<=0)throw new Error('R314 invalid log');return Math.log(a[0])}
  if(op==='min')return Math.min(...a);
  if(op==='max')return Math.max(...a);
  throw new Error(`R314 unsupported expression op ${op}`);
 };
 return finite(evalNode(expression));
}

export function expressionFunctionR314(expression,variableNames){
 const names=Array.from(variableNames||[],String);if(!names.length)throw new Error('R314 expression function requires variable names');
 return vector=>{if(!Array.isArray(vector)||vector.length!==names.length)throw new Error('R314 expression input shape mismatch');return evaluateExpressionR314(expression,Object.fromEntries(names.map((name,i)=>[name,vector[i]])))};
}

export function vectorExpressionFunctionR314(expressions,variableNames){
 if(!Array.isArray(expressions)||!expressions.length)throw new Error('R314 vector expression requires expressions');const fns=expressions.map(e=>expressionFunctionR314(e,variableNames));return vector=>fns.map(fn=>fn(vector));
}

const normalizeVariables=vars=>Object.fromEntries(Object.entries(vars||{}).map(([k,v])=>[k,finite(v)]));
const receipt=(plan,result)=>compileNumericalReceiptR314({operation:`PLAN_${plan.kind}`,result,address:plan.address||null,orientation:plan.orientation||0,provenance:Array.isArray(plan.provenance)?plan.provenance:[]});

export function executeNumericalPlanR314(plan={}){
 if(!plan||typeof plan!=='object')throw new Error('R314 numerical plan must be an object');const kind=String(plan.kind||'').toUpperCase();if(!R314_PLAN_KINDS.includes(kind))throw new Error(`R314 unsupported plan kind ${kind}`);
 const variableNames=Array.isArray(plan.variableNames)?plan.variableNames.map(String):Object.keys(plan.variables||{}),vars=normalizeVariables(plan.variables||{}),vector=variableNames.map(n=>{if(!(n in vars))throw new Error(`R314 missing plan variable ${n}`);return vars[n]});
 let result;
 if(kind==='EVALUATE')result=evaluateExpressionR314(plan.expression,vars);
 else if(kind==='GRADIENT')result=gradientR314(expressionFunctionR314(plan.expression,variableNames),vector,plan.options||{});
 else if(kind==='JACOBIAN')result=jacobianR314(vectorExpressionFunctionR314(plan.expressions,variableNames),vector,plan.options||{});
 else if(kind==='HESSIAN')result=hessianR314(expressionFunctionR314(plan.expression,variableNames),vector,plan.options||{});
 else if(kind==='INTEGRATE'){
  const variable=String(plan.variable||variableNames[0]||'x'),base={...vars},fn=x=>evaluateExpressionR314(plan.expression,{...base,[variable]:x});result=integrateSimpsonR314(fn,finite(plan.lo),finite(plan.hi),plan.options||{});
 } else if(kind==='ROOT'){
  const variable=String(plan.variable||variableNames[0]||'x'),base={...vars},fn=x=>evaluateExpressionR314(plan.expression,{...base,[variable]:x});result=rootBisectionR314(fn,finite(plan.lo),finite(plan.hi),plan.options||{});
 } else if(kind==='OPTIMIZE'){
  const fn=expressionFunctionR314(plan.expression,variableNames);result=optimizeGradientR314(fn,vector,{...(plan.options||{}),bounds:plan.bounds||plan.options?.bounds||null});
 } else if(kind==='BATCH'){
  const names=variableNames,expression=plan.expression;result=batchEvaluateR314(sample=>evaluateExpressionR314(expression,Object.fromEntries(names.map((n,i)=>[n,sample[i]]))),plan.samples,plan.options||{});
 } else if(kind==='SCENARIO_SWEEP'){
  const expression=plan.expression,scoreExpression=plan.scoreExpression;result=scenarioSweepR314(s=>({value:evaluateExpressionR314(expression,s.variables||s)}),plan.scenarios,{...(plan.options||{}),score:scoreExpression?((r,s)=>evaluateExpressionR314(scoreExpression,{...(s.variables||s),result:r.value})):null});
 }
 const planHash=structuralHashR314(plan),resultHash=structuralHashR314(result),numericalReceipt=receipt(plan,result);
 return{schema:R314_EXPRESSION_SCHEMA,revision:R314_EXPRESSION_REVISION,numericalSchema:R314_SCHEMA,numericalRevision:R314_REVISION,kind,planHash,resultHash,result,numericalReceipt,authority:R314_AUTHORITY,arbitraryCodeExecution:false,externalScientificTruthClaimed:false,executionProofClaimed:false,canonAdmissionClaimed:false};
}
