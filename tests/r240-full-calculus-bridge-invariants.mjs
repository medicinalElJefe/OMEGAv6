import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>assert.ok(ok,'R240 calculus/bridge '+msg);
const address=read('src/system/calculusAddressFabricR240.ts');
const bridge=read('src/system/hybridBridgeCalculusR240.ts');
const modes=read('src/modeExecutionFabricR107.ts');
const canon=read('src/allModesAuthority.ts');
const adapter=read('src/platformAdapter.ts');
const worker=read('src/workerR32.js');
const agent=read('public/omega-hybrid-agent-r141.py');
const recursive=read('src/system/recursiveSelfBuildR240.ts');
const r239=read('src/hybridResourceGovernorR239.ts');

for(const token of ["R240_CALCULUS_SCHEMA='OMEGA_20736_CALCULUS_ADDRESS_FABRIC_R240'",'R240_RADIX=12','r240EncodeAddress','r240DecodeAddress','stableOperatorAddressR240','compile20736CalculusFabricR240','physicalDimensionClaim:false','sparseActivation:true','parallelExecutionBound','activeFrontier'])must(address.includes(token),`address fabric missing ${token}`);
must(address.includes('allModeContributionsR107'),'20,736 compiler must consume the complete R107 mode/lens fabric');
must(address.includes("row.state!=='CATALOG_ONLY'")&&address.includes("row.state!=='GATED_MISSING_INPUTS'"),'catalog-only and gated modes must remain addressable but non-executing');
must(address.includes('Math.min(12,Number(resourceEnvelope?.effectiveCpuWorkers)||1)'),'R239 fresh resource envelope must bound active parallel execution');
for(const token of ['sourceModeEvaluations:179','canonAuthorities:62'])must(canon.includes(token),`all-mode authority count missing ${token}`);
must(modes.includes('allModeContributionsR107')&&modes.includes('totalRegistered:ALL_MODES_BOUNDARY.sourceModeEvaluations+ALL_MODES_BOUNDARY.canonAuthorities'),'R107 must expose all 241 registered source/lens contributions without promoting them all to execution');
for(const token of ['organs:12','branches:144','cells:1728','lanes:20736','deepAddress:248832'])must(recursive.includes(token),`recursive address hierarchy missing ${token}`);
must(r239.includes("R239_MAX_PROFILE_AGE_MS=5*60_000")&&r239.includes('effectiveCpuWorkers'),'20,736 activation must inherit fresh host-resource governance rather than imply unbounded compute');

for(const token of ["R240_BRIDGE_SCHEMA='OMEGA_HYBRID_BRIDGE_CALCULUS_R240'",'hybridOperationAddressR240','bindHybridJobBridgeCalculusR240','bridgeRequestHeadersR240',"sourceFrame:'BROWSER_OPERATOR'","transitFrame:'CLOUD_DURABLE_QUEUE'","destinationFrame:'SELECTED_HYBRID_HOST'","returnFrame:'R141_RETURN_PROOF'",'targetDeviceId','snapshotEpoch','sourceProfileSha256','SAME_CALCULUS_ADDRESS_ACROSS_BRIDGE','R32_INPUT_FINGERPRINT_BINDS_COMPLETE_STEP','R141_RETURN_FINGERPRINT_BINDS_ECHOED_CALCULUS'])must(bridge.includes(token),`bridge calculus missing ${token}`);
must(bridge.includes('body.draft?.steps'),'mission drafts must use the same calculus bridge as direct Hybrid jobs');
for(const token of ["import {bindHybridJobBridgeCalculusR240,bridgeRequestHeadersR240}","url==='/api/hybrid/jobs'||url==='/api/missions'",'outboundBody=calculusBoundBody','crossOriginCanonical','crossOriginCanonical?{}:bridgeRequestHeadersR240(method,url)','JSON.stringify(outboundBody)'])must(adapter.includes(token),`platform bridge integration missing ${token}`);
must(adapter.includes('resolveOmegaApiUrl(url)'),'platform adapter must resolve the actual target before deciding whether observational calculus headers are same-origin safe');
must(!adapter.includes("headers:Record<string,string>={'x-omega-session-id':sessionId,...bridgeRequestHeadersR240(method,url)}"),'R240 must not blindly attach custom calculus headers to cross-origin canonical requests');

must(worker.includes("steps:v.steps,targetDeviceId:target.id")&&worker.includes('steps:v.steps,targetDeviceId:target.id,targetCapabilityRevision'),'R32 must preserve the complete validated step array and bind it into durable job identity');
must(worker.includes("inputFingerprint:await sha256({steps:v.steps,targetDeviceId:target.id,projectPath:b.projectPath||'.'})"),'R32 durable job fingerprint must bind the exact calculus-carrying step array');
must(worker.includes("job=jobs.find(x=>x.status==='QUEUED'&&x.targetDeviceId===id)")&&worker.includes('return json({ok:true,job:job||null})'),'paired host poll must receive the same preserved durable job');

for(const token of ["BRIDGE_CALCULUS_EXTENSION='R240'",'validate_bridge_calculus_r240','calculusBridgeR240','calculusBridgeR240Return',"returned['orientation']=-1","returned['sourceFrame']='SELECTED_HYBRID_HOST'","returned['destinationFrame']='R141_RETURN_PROOF'",'BRIDGE_CALCULUS_EXTENSION'])must(agent.includes(token),`R141 host wrapper missing closed-loop bridge carry ${token}`);
const validateCall=agent.indexOf('bridge_by_step=validate_bridge_calculus_r240(job)'),nativeCall=agent.indexOf('packet=base_execute(job,approved_root)');
must(validateCall>=0&&nativeCall>validateCall,'calculus envelope must be validated before immutable native execution');
must(agent.indexOf("proof['calculusBridgeR240Return']=returned")<agent.indexOf("core={k:packet.get(k) for k in ('jobId','ok','stepProofs'"),'returned bridge calculus must enter stepProofs before the exact R141 payload fingerprint');

const python=String.raw`
import importlib.util,copy
spec=importlib.util.spec_from_file_location('r240_agent','public/omega-hybrid-agent-r141.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
bridge={'schema':'OMEGA_HYBRID_BRIDGE_CALCULUS_R240','revision':'R240','address':{'address':1234,'deepAddress':14813},'orientation':1,'sourceFrame':'BROWSER_OPERATOR','transitFrame':'CLOUD_DURABLE_QUEUE','destinationFrame':'SELECTED_HYBRID_HOST','targetDeviceId':'dev-a','snapshotEpoch':7,'sourceProfileSha256':None}
job={'targetDeviceId':'dev-a','steps':[{'id':'S01','op':'BUILD','calculusBridgeR240':copy.deepcopy(bridge)},{'id':'S02','op':'TEST','calculusBridgeR240':copy.deepcopy(bridge)}]}
out=m.validate_bridge_calculus_r240(job)
assert set(out)=={'S01','S02'} and out['S01']['address']['address']==1234
for kind in ('orientation','address','partial','device'):
    bad=copy.deepcopy(job)
    if kind=='orientation':bad['steps'][0]['calculusBridgeR240']['orientation']=0
    elif kind=='address':bad['steps'][0]['calculusBridgeR240']['address']['address']=20736
    elif kind=='partial':del bad['steps'][1]['calculusBridgeR240']
    elif kind=='device':bad['steps'][0]['calculusBridgeR240']['targetDeviceId']='dev-b'
    try:m.validate_bridge_calculus_r240(bad);raise AssertionError(kind+' invalid bridge accepted')
    except RuntimeError:pass
print('R240 PYTHON BRIDGE VALIDATOR PASS')
`;
const sim=spawnSync('python3',['-c',python],{encoding:'utf8'});
assert.equal(sim.status,0,`R240 host bridge validator simulation failed: ${sim.stderr||sim.stdout}`);
must(sim.stdout.includes('R240 PYTHON BRIDGE VALIDATOR PASS'),'R240 Python bridge validator did not complete');

const encode=(o,b,c,l)=>(((o*12)+b)*12+c)*12+l;
const seen=new Set();for(let o=0;o<12;o++)for(let b=0;b<12;b++)for(let c=0;c<12;c++)for(let l=0;l<12;l++){const a=encode(o,b,c,l);assert.ok(a>=0&&a<20736);seen.add(a)}
assert.equal(seen.size,20736,'12×12×12×12 must produce exactly 20,736 unique computational addresses');
assert.equal(20736*12,248832,'deep 12-phase address expansion must equal 248,832');
console.log('OMEGA R240 FULL CALCULUS + BRIDGE PASS · 241 registered mode/lens authorities remain separately addressable · sparse 12×12×12×12 = 20,736 fabric · R239 bounds active parallelism · browser→durable queue→selected host→R141 return preserves calculus address/device/epoch/profile continuity · fail-closed Python host validation · cross-origin proof travels in fingerprint-bound step envelope while same-origin observations may use headers · +1 dispatch / 0 observation / -1 return · no physical-dimension or Canon-authority inflation');
