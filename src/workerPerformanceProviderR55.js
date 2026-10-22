import {compilePacketProofR52} from './workerPacketProofR52.js';
import {verifyProofChainR54} from './workerProofChainR54.js';
function now(){return typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now()}
function finiteMs(v){return Number.isFinite(v)&&v>=0?Math.round(v*1000)/1000:null}
function providerClass(provider){const p=String(provider||'');if(p.startsWith('WORKERS_AI_BOUND:'))return'WORKERS_AI_BOUND';if(p==='CONFIGURED_EXTERNAL'||p.startsWith('EXTERNAL_'))return'EXTERNAL_CONFIGURED';if(p==='GROUNDED_RUNTIME_ONLY'||p==='OMEGA_GROUNDED_RUNTIME')return'GROUNDED_RUNTIME_ONLY';return'UNKNOWN_PROVIDER_STATE'}
export async function superviseProofPerformanceR55(input,provider){
 const body=input&&typeof input==='object'?input:{},packet=body.packet,projection=body.projection,segment=Array.isArray(body.segment)?body.segment:[];
 const totalStart=now(),packetStart=now(),packetProof=await compilePacketProofR52({packet,projection}),packetComputeMs=finiteMs(now()-packetStart);
 let chainProof=null,chainComputeMs=null;
 if(segment.length){const chainStart=now();chainProof=await verifyProofChainR54({segment});chainComputeMs=finiteMs(now()-chainStart)}
 const totalComputeMs=finiteMs(now()-totalStart),proofHealthy=packetProof?.ok===true&&packetProof?.validation?.valid===true&&(!segment.length||chainProof?.ok===true&&chainProof?.health==='COHERENT');
 return{ok:packetProof?.ok===true,status:packetProof?.ok===true?200:(packetProof?.status||422),schema:'OMEGA_PROOF_PERFORMANCE_PROVIDER_R55',proofHealth:proofHealthy?'COHERENT':'BOUNDED_OR_REGRESSION',timing:{clock:'WORKER_MONOTONIC_ELAPSED',packetComputeMs,chainComputeMs,totalComputeMs,nativePcPerformanceMeasured:false,browserRoundTripMeasured:false},provider:{reported:String(provider||'UNKNOWN'),class:providerClass(provider),recoveryAuthority:'OBSERVATION_ONLY_NO_PROVIDER_MUTATION'},packet:{valid:packetProof?.validation?.valid===true,packetHash:packetProof?.packetHash||null},chain:segment.length?{health:chainProof?.health||'UNKNOWN',segmentHash:chainProof?.segmentHash||null,receiptCount:chainProof?.receiptCount||segment.length,errors:chainProof?.errors||[]}:null,boundary:'R55 measures only Worker compute elapsed time for submitted proof operations and classifies the provider state already reported by the runtime. It does not measure native-PC performance, network-only latency, provider quality, model accuracy, or silently recover/mutate a provider.'};
}
export{providerClass};
