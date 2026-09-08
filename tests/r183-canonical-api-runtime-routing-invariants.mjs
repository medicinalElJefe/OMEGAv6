import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const transport=read('src/canonicalApiTransportR183.ts');
const adapter=read('src/platformAdapter.ts');
const main=read('src/main.tsx');
const system=read('src/OmegaSystemConsolidationR30.tsx');
const worker=read('src/workerR116.js');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
  "OMEGA_CANONICAL_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev'",
  'omega-living-light-etching-private-woven2.vercel.app',
  'omega-optical-cloud-woven2.vercel.app',
  "url.startsWith('/api/')",
  'resolveOmegaApiUrl',
  "credentials: target.startsWith(OMEGA_CANONICAL_ORIGIN)?'omit':'same-origin'"
])must(adapter.includes(token),`R183 platform adapter missing ${token}`);

for(const token of [
  "R183_SCHEMA='OMEGA_CANONICAL_API_TRANSPORT_R183'",
  "routeClass:'/api/*'",
  'localArtifactsRemainLocal:true',
  'hybridCredentialHeadersPreserved:true',
  "canonicalAdmissionAuthority:'R125'",
  'new Request(target,input)',
  'canonicalApiTargetR183'
])must(transport.includes(token),`R183 transport missing ${token}`);

must(main.includes("installCanonicalApiTransportR183();"),'R183 canonical API transport must install before application render');
must(main.indexOf('installCanonicalApiTransportR183();')<main.indexOf('createRoot('),'R183 transport must bind before React boot');
must(system.includes("getJson('/api/status')")&&system.includes("getJson('/api/release-evidence')")&&system.includes('fetch(path,'),'System diagnostic source must remain observable through the R210 refresh wrapper so R183 global transport still covers the same direct API paths');
must(system.includes('Promise.allSettled'),'R210 refreshed System diagnostics must preserve independent endpoint observation instead of one failed probe blanking the transport surface');
for(const host of ['omega-living-light-etching-private-woven2.vercel.app','omega-optical-cloud-woven2.vercel.app'])must(worker.includes(host),`R116 CORS authority missing approved R183 mirror ${host}`);
must(!transport.includes('foundasound.chatgpt.site'),'R183 must not revive retired preview authority');
must(transport.includes('does not promote capability state')&&transport.includes('alter R125 admission'),'R183 truth/admission boundary missing');
console.log('OMEGA R183/R210.1 CANONICAL API ROUTING PASS · refreshed System probes still route /api truth/execution calls through canonical transport while static artifacts, Hybrid proof gates and R125 admission remain bounded');
