/** R901 read-only edge adapter; independent local candidate is not part of production. */
const HEADERS={ 'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff' };
function reply(obj,status=200){return new Response(JSON.stringify(obj)+'\n',{status,headers:HEADERS});}
export default {
 async fetch(request){
  const u=new URL(request.url);
  if(!u.pathname.startsWith('/api/canon-studio/'))return reply({error:'NOT_HANDLED',legacy_routes_untouched:true},404);
  if(request.method!=='GET')return reply({error:'READ_ONLY_ADAPTER',canonical_mutation:false},405);
  if(u.pathname==='/api/canon-studio/health')return reply({
   schema:'OMEGA_CANON_STUDIO_EDGE_V1',ok:true,plane:'EDGE_BRIDGE',
   source_scope:'THIS_WORKER_RESPONSE_ONLY',native_pc_verified:false,
   physical_measurement:false,production_proof:false,canonical_mutation:false,proof_tier:'OBS'
  });
  if(u.pathname==='/api/canon-studio/status')return reply({
   schema:'OMEGA_CANON_STUDIO_EDGE_V1',state:'SOURCE_BOUND_ADAPTER_ONLY',
   policy:'R237_NO_STAGE_PROMOTED_BEYOND_ITS_EVIDENCE',
   r170:'POLICY_BLOCKED_BRANCH_HELD',rec011:'HOLD_RULE_SOURCE_NEEDED',
   cf_n0001:'OPEN_CANDIDATE',host:'DEVICE_PROOF_REQUIRED',
   local_daemon:'NOT_CONNECTED',ten_ledger_7655_attested:false,
   native_pc_verified:false,canonical_mutation:false,proof_tier:'DER'
  });
  return reply({error:'UNKNOWN_STUDIO_ROUTE',canonical_authority:'EXTERNAL_DRIVE_POINTER'},404);
 }
};