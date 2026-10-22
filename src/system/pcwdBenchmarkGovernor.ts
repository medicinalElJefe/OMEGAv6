import{PCWD_BENCHMARK_SCHEMA,type BenchmarkSuiteV1}from'./pcwdBenchmarkSuite';

export const PCWD_BENCHMARK_GOVERNOR_SCHEMA='OMEGA_PCWD_BENCHMARK_GOVERNOR_v1' as const;
export const PCWD_BENCHMARK_GOVERNOR_BOUNDARY='The benchmark governor is falsification/advisory evidence only. It cannot prove novelty, scientific validity, or superiority over methods not explicitly benchmarked, and it has no CanonState, dispatch, durable-history, deployment, or production authority.' as const;

export type BenchmarkGovernorPolicyV1={
  minimumCases:number;
  minimumWins:number;
  requireCostCase:boolean;
  requireLimitCase:boolean;
  requireAllPcwdExpectedBehavior:boolean;
  minimumAdditionalInformationCategories:number;
};
export type BenchmarkGovernorReceiptV1={
  schema:typeof PCWD_BENCHMARK_GOVERNOR_SCHEMA;
  policy:BenchmarkGovernorPolicyV1;
  measurements:{
    cases:number;
    wins:number;
    ties:number;
    costs:number;
    limits:number;
    expectedHolds:number;
    pcwdPassCount:number;
    additionalInformationCategories:number;
  };
  gates:{
    schemaValid:boolean;
    enoughCases:boolean;
    enoughWins:boolean;
    costExposed:boolean;
    limitExposed:boolean;
    expectedBehaviorPassed:boolean;
    informationDeltaMeasured:boolean;
    noHiddenResultClass:boolean;
  };
  allowAdvance:boolean;
  decision:'ADVANCE'|'HOLD';
  reasons:string[];
  receiptDigest:string;
  canonicalMutation:false;
  noveltyClaimed:false;
  superiorityClaimed:false;
  boundary:typeof PCWD_BENCHMARK_GOVERNOR_BOUNDARY;
};

const stable=(v:any):string=>{
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(Array.isArray(v))return'['+v.map(stable).join(',')+']';
 return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
};
async function sha256(v:any){
 if(!globalThis.crypto?.subtle)throw new Error('R358 benchmark governor requires Web Crypto SHA-256');
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(v)));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

export const DEFAULT_BENCHMARK_POLICY_V1:BenchmarkGovernorPolicyV1={
 minimumCases:10,
 minimumWins:6,
 requireCostCase:true,
 requireLimitCase:true,
 requireAllPcwdExpectedBehavior:true,
 minimumAdditionalInformationCategories:8,
};

export async function governPcwdBenchmarkSuiteV1(suite:BenchmarkSuiteV1,policy:BenchmarkGovernorPolicyV1=DEFAULT_BENCHMARK_POLICY_V1):Promise<BenchmarkGovernorReceiptV1>{
 const s=suite?.summary;
 const classified=(s?.wins??0)+(s?.ties??0)+(s?.costs??0)+(s?.limits??0)+(s?.expectedHolds??0);
 const gates={
  schemaValid:suite?.schema===PCWD_BENCHMARK_SCHEMA,
  enoughCases:Number(s?.total)>=policy.minimumCases,
  enoughWins:Number(s?.wins)>=policy.minimumWins,
  costExposed:!policy.requireCostCase||Number(s?.costs)>=1,
  limitExposed:!policy.requireLimitCase||Number(s?.limits)>=1,
  expectedBehaviorPassed:!policy.requireAllPcwdExpectedBehavior||Number(s?.pcwdPassCount)===Number(s?.total),
  informationDeltaMeasured:(s?.additionalInformationCategories?.length??0)>=policy.minimumAdditionalInformationCategories,
  noHiddenResultClass:classified===Number(s?.total),
 };
 const allowAdvance=Object.values(gates).every(Boolean);
 const reasons=Object.entries(gates).filter(([,v])=>!v).map(([k])=>k);
 const measurements={
  cases:Number(s?.total||0),wins:Number(s?.wins||0),ties:Number(s?.ties||0),costs:Number(s?.costs||0),limits:Number(s?.limits||0),expectedHolds:Number(s?.expectedHolds||0),
  pcwdPassCount:Number(s?.pcwdPassCount||0),additionalInformationCategories:s?.additionalInformationCategories?.length??0,
 };
 const core={
  schema:PCWD_BENCHMARK_GOVERNOR_SCHEMA,policy,measurements,gates,allowAdvance,decision:allowAdvance?'ADVANCE':'HOLD',reasons,
  canonicalMutation:false,noveltyClaimed:false,superiorityClaimed:false,boundary:PCWD_BENCHMARK_GOVERNOR_BOUNDARY,
 } as const;
 return{...core,receiptDigest:await sha256(core)};
}

export async function verifyBenchmarkGovernorReceiptV1(receipt:BenchmarkGovernorReceiptV1){
 const classified=receipt.measurements.wins+receipt.measurements.ties+receipt.measurements.costs+receipt.measurements.limits+receipt.measurements.expectedHolds;
 const semantic=
  receipt.schema===PCWD_BENCHMARK_GOVERNOR_SCHEMA&&
  receipt.gates.noHiddenResultClass===(classified===receipt.measurements.cases)&&
  receipt.allowAdvance===Object.values(receipt.gates).every(Boolean)&&
  receipt.decision===(receipt.allowAdvance?'ADVANCE':'HOLD')&&
  receipt.canonicalMutation===false&&receipt.noveltyClaimed===false&&receipt.superiorityClaimed===false&&
  receipt.boundary===PCWD_BENCHMARK_GOVERNOR_BOUNDARY;
 if(!semantic)return false;
 const core={
  schema:receipt.schema,policy:receipt.policy,measurements:receipt.measurements,gates:receipt.gates,allowAdvance:receipt.allowAdvance,decision:receipt.decision,reasons:receipt.reasons,
  canonicalMutation:receipt.canonicalMutation,noveltyClaimed:receipt.noveltyClaimed,superiorityClaimed:receipt.superiorityClaimed,boundary:receipt.boundary,
 };
 return(await sha256(core))===receipt.receiptDigest;
}
