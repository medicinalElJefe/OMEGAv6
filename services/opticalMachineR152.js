import {OPTICAL_UI_R152} from './opticalUiR152.js';

export const R152_SERVICE='omega-optical-machine-r152';
export const R152_VERSION='R152.0';
export const R152_AUTHORITY='SCREEN_ONLY';
export const R152_ATLAS_SIZE=20736;
export const R152_TRUTH_BOUNDARY='Tier-1 optical screening is a deterministic reduced-order design heuristic with explicit nominal material assumptions. It is not RCWA/FDTD/FEM, fabrication validation, measured dispersion, physical measurement, or CanonState admission.';
export const R152_R44={pitch_nm:330,width_nm:105,length_nm:290,height_nm:575,orientation_states:12,orientation_step_deg:15,status:'RECOMMENDED_NUMERICAL_CANDIDATE',source:'OMEGA_R44'};

const BASE_HEADERS={
 'cache-control':'no-store',
 'access-control-allow-origin':'*',
 'access-control-allow-methods':'GET,POST,OPTIONS',
 'access-control-allow-headers':'content-type,cache-control,x-omega-project-id,x-omega-packet-id',
 'access-control-expose-headers':'x-omega-machine-adapter,x-omega-truth-boundary',
 'x-content-type-options':'nosniff',
 'referrer-policy':'no-referrer',
 'x-omega-machine-adapter':'OPTICAL_R152',
 'x-omega-truth-boundary':'SCREEN_ONLY'
};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const round=(v,n=6)=>Number(Number(v).toFixed(n));
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data,null,2),{status,headers:{...BASE_HEADERS,'content-type':'application/json; charset=utf-8',...extra}});
const html=body=>new Response(body,{status:200,headers:{...BASE_HEADERS,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'self'; connect-src 'self' https://*.jeffdeweyeljefe.workers.dev https://omega-living-light-etching-private-woven2.vercel.app; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});
const circularDelta=(a,b)=>Math.abs((((Number(a)-Number(b))+180)%360+360)%360-180);
const decodeAddress=address=>{const a=Math.max(0,Math.min(R152_ATLAS_SIZE-1,Math.floor(Number(address)||0)));return{address:a,d:Math.floor(a/1728),p:Math.floor(a%1728/144),r:Math.floor(a%144/12),l:a%12}};
const nominalMaterial=wavelength=>{
 const w=Math.max(380,Math.min(780,Number(wavelength)||532));
 const t=(w-380)/400;
 return{model:'R152_EXPLICIT_NOMINAL_DESIGN_INDEX',n_incident:1,n_feature:round(2.52-.34*t,4),n_background:1,n_substrate:round(1.475-.035*t,4),measured:false};
};
export function scalarMetricsR152({geometry,wavelength_nm=532,target_phase_deg=0}){
 const g=geometry||{},wavelength=Math.max(1,Number(wavelength_nm)||532),pitch=Math.max(1,Number(g.pitch_nm)||330),width=Math.max(1,Number(g.width_nm)||105),length=Math.max(1,Number(g.length_nm)||290),height=Math.max(1,Number(g.height_nm)||575),material=nominalMaterial(wavelength);
 const fill=clamp((width*length)/(pitch*pitch));
 const opticalPath=(material.n_feature-material.n_background)*height;
 const predictedPhase=((360*opticalPath/wavelength)%360+360)%360;
 const target=((Number(target_phase_deg)||0)%360+360)%360;
 const phaseError=circularDelta(predictedPhase,target);
 const pitchRatio=pitch/wavelength;
 const aspect=Math.abs(width-length)/pitch;
 const fabricationBurden=clamp(.10+.20*Math.abs(width-105)/105+.12*Math.abs(length-290)/290+.12*Math.abs(height-575)/575+.10*aspect);
 const crosstalk=clamp(.025+.10*aspect+.07*Math.abs(pitchRatio-.62)+.08*Math.max(0,fill-.55));
 const phaseQuality=Math.exp(-phaseError/105);
 const apertureQuality=clamp(4*fill*(1-fill));
 const estimatedEfficiency=clamp(apertureQuality*phaseQuality*(1-.22*fabricationBurden));
 const scalarFocus=clamp(estimatedEfficiency*(1-crosstalk));
 const contradiction=clamp(.54*(phaseError/180)+.28*crosstalk+.18*fabricationBurden);
 const scar=clamp(.48*crosstalk+.32*fabricationBurden+.20*(phaseError/180));
 const burden=clamp(.52*fabricationBurden+.26*Math.abs(pitchRatio-.62)+.22*aspect);
 const continuity=clamp(.58*estimatedEfficiency+.24*(1-contradiction)+.18*(1-burden));
 const mode188=Math.max(0,1+.62*scalarFocus-.19*(phaseError/180)-.13*crosstalk-.08*burden);
 const gate=mode188>=1.06&&contradiction<.62&&burden<.78?'STAY':mode188>=.98?'TURN':'HOLD';
 return{gate,material,metrics:{scalar_focus:round(scalarFocus),estimated_efficiency:round(estimatedEfficiency),phase_error_deg:round(phaseError),predicted_phase_deg:round(predictedPhase),fill_fraction:round(fill),crosstalk:round(crosstalk),fabrication_burden:round(fabricationBurden),mode188_score:round(mode188)},proof:{gate,mode188_score:round(mode188),continuity:round(continuity),burden:round(burden),contradiction:round(contradiction),scar:round(scar)}};
}
export function addressCandidateR152(address,wavelength_nm=532){
 const c=decodeAddress(address),center=x=>x-5.5;
 const pitch=Math.round(R152_R44.pitch_nm+center(c.d)*4);
 const width=Math.max(60,Math.round(R152_R44.width_nm+center(c.p)*3));
 const length=Math.max(width+25,Math.round(R152_R44.length_nm+center(c.r)*5));
 const height=Math.max(350,Math.round(R152_R44.height_nm+center(c.l)*7));
 const orientation_deg=c.l*R152_R44.orientation_step_deg;
 const target_phase_deg=((2*orientation_deg)%360+360)%360;
 const geometry={pitch_nm:pitch,width_nm:Math.min(width,pitch),length_nm:Math.min(length,pitch),height_nm:height,orientation_deg,material:'TIO2_DESIGN_NOMINAL_ON_SIO2_FUSED'};
 const screened=scalarMetricsR152({geometry,wavelength_nm,target_phase_deg});
 return{...c,geometry,wavelength_nm:Number(wavelength_nm),target_phase_deg,...screened.metrics,gate:screened.gate,continuity:screened.proof.continuity,burden:screened.proof.burden,contradiction:screened.proof.contradiction,scar:screened.proof.scar,evidence_class:'REDUCED_ORDER_SCREEN'};
}
async function sha256(value){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value)));return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function validProposal(p){const g=p?.geometry||{};return p?.schema==='OMEGA_PACKET_v1'&&['omega-genesis','omega-optical-ui'].includes(String(p?.source_node||''))&&finite(p?.wavelength_nm)&&Number(p.wavelength_nm)>0&&['pitch_nm','width_nm','length_nm','height_nm'].every(k=>finite(g[k])&&Number(g[k])>0)&&Number(g.width_nm)<=Number(g.pitch_nm)&&Number(g.length_nm)<=Number(g.pitch_nm)}
export async function screenCandidateR152(proposal){
 if(!validProposal(proposal))return{ok:false,status:400,body:{ok:false,code:'VALID_BOUNDED_OPTICAL_PROPOSAL_REQUIRED',requirements:['OMEGA_PACKET_v1','omega-genesis or omega-optical-ui source','positive wavelength/geometry','feature width/length <= pitch']}};
 const screened=scalarMetricsR152(proposal),sourceSha=await sha256({source:proposal.source_sha||proposal.packet_id||null,geometry:proposal.geometry,wavelength_nm:proposal.wavelength_nm,target_phase_deg:proposal.target_phase_deg,engine:R152_SERVICE}),packetId='opt_r152_'+sourceSha.slice(0,24),lineage=[...(proposal.lineage||[]),`omega-optical-machine:r152-screen:${sourceSha.slice(0,12)}`];
 const packet={...proposal,packet_id:packetId,source_node:'omega-optical',source_sha:sourceSha,geometry:{...proposal.geometry,material:proposal.geometry?.material||'TIO2_DESIGN_NOMINAL_ON_SIO2_FUSED'},scalar_metrics:screened.metrics,material_model:screened.material,proof:screened.proof,requested_solver:screened.gate==='STAY'?'rcwa':'scalar',polarization:proposal.polarization||'circular',numerics:{nx:64,ny:64,harmonics_low:25,harmonics_high:49,convergence_tolerance:.035,energy_tolerance:.035,incidence_theta_deg:0,incidence_phi_deg:0,...(proposal.numerics||{})},lineage,created_at:new Date().toISOString(),screening_engine:'R152_BOUNDED_OPTICAL_ATLAS_SCREEN',evidence_class:'REDUCED_ORDER_SCREEN',truth_boundary:R152_TRUTH_BOUNDARY};
 const tier2_job=screened.gate==='STAY'?{schema:'OMEGA_FULLWAVE_QUEUE_v1',job_id:'r152_'+packetId,source_packet_id:packetId,solver:'rcwa',geometry:packet.geometry,wavelength_nm:Number(proposal.wavelength_nm),polarization:packet.polarization,material_model:screened.material,numerics:packet.numerics,proof:screened.proof,lineage:[...lineage,'omega-optical:r152-tier2-request'],priority:round(clamp(.35+.50*screened.metrics.scalar_focus+.15*screened.proof.continuity)),state:'PREPARED_NOT_SOLVED',truth:'This is a Tier-2 request packet. RCWA is not claimed until the authenticated Sovereign solver returns a current result receipt.'}:null;
 return{ok:true,status:200,body:{ok:true,schema:'OMEGA_OPTICAL_SCREEN_RESPONSE_R152',service:R152_SERVICE,version:R152_VERSION,authority:R152_AUTHORITY,packet,screened_packet:packet,tier2_job,canonical_mutation:false,screening_truth:R152_TRUTH_BOUNDARY}};
}
function manifest(){return{schema:'OMEGA_OPTICAL_OPERATIONAL_CONVERGENCE_R152',version:R152_VERSION,service:R152_SERVICE,authority:R152_AUTHORITY,canonicalAuthority:'https://omegav6.jeffdeweyeljefe.workers.dev',humanSurfaceTarget:'https://omega-living-light-etching-private-woven2.vercel.app/',atlas:{size:R152_ATLAS_SIZE,radix:12,levels:[12,144,1728,20736],meaning:'address/composition resolution, not literal physical dimensions'},inherited:{r44:R152_R44,r115:'omega-optical-machine-r115',r151:'CURRENT HEARTBEAT -> INDEX -> HASH_TREE -> PROOF-CONDITIONED REPAIR -> BUILD -> TEST -> PACKAGE -> R141 CLOSURE'},capabilities:['volumetric-field-ui','20736-address-atlas','bounded-batch-screen','candidate-screen','tier2-rcwa-request-preparation','proof-truth-ledger','mobile-desktop-responsive'],plannedValidation:['independent full-wave cross-check','process-specific measured dispersion','fabrication tolerance','physical measurement'],truth_boundary:R152_TRUTH_BOUNDARY};}
async function route(request){
 const u=new URL(request.url);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:BASE_HEADERS});
 if(request.method==='GET'&&(u.pathname==='/'||u.pathname==='/ui'||u.pathname==='/index.html'))return html(OPTICAL_UI_R152);
 if(request.method==='GET'&&u.pathname==='/api/health')return json({ok:true,status:'OK',service:R152_SERVICE,version:R152_VERSION,authority:R152_AUTHORITY,engine:'R152_BOUNDED_OPTICAL_ATLAS_SCREEN',atlasSize:R152_ATLAS_SIZE,ui:true,canonicalMutation:false,truth_boundary:R152_TRUTH_BOUNDARY});
 if(request.method==='GET'&&u.pathname==='/api/optical/manifest')return json(manifest());
 if(request.method==='GET'&&u.pathname==='/api/optical/atlas'){
  const offset=Math.max(0,Math.min(R152_ATLAS_SIZE-1,Math.floor(Number(u.searchParams.get('offset'))||0))),limit=Math.max(1,Math.min(288,Math.floor(Number(u.searchParams.get('limit'))||144))),wavelength=Math.max(380,Math.min(780,Number(u.searchParams.get('wavelength_nm'))||532)),end=Math.min(R152_ATLAS_SIZE,offset+limit),items=[];
  for(let a=offset;a<end;a++)items.push(addressCandidateR152(a,wavelength));
  items.sort((a,b)=>b.scalar_focus-a.scalar_focus||b.continuity-a.continuity||a.address-b.address);
  return json({ok:true,schema:'OMEGA_OPTICAL_ATLAS_PAGE_R152',offset,limit:items.length,nextOffset:end<R152_ATLAS_SIZE?end:null,total:R152_ATLAS_SIZE,wavelength_nm:wavelength,items,truth_boundary:R152_TRUTH_BOUNDARY});
 }
 if(request.method==='POST'&&u.pathname==='/api/federation/screen'){
  const result=await screenCandidateR152((await request.json().catch(()=>({})))?.proposal||(await Promise.resolve(null)));
  return json(result.body,result.status);
 }
 if(request.method==='POST'&&u.pathname==='/api/optical/batch-screen'){
  const body=await request.json().catch(()=>({})),wavelength=Math.max(380,Math.min(780,Number(body.wavelength_nm)||532)),addresses=Array.isArray(body.addresses)?body.addresses.slice(0,288):[];
  if(!addresses.length)return json({ok:false,code:'ADDRESSES_REQUIRED',max:288},400);
  const items=[...new Set(addresses.map(x=>Math.max(0,Math.min(R152_ATLAS_SIZE-1,Math.floor(Number(x)||0)))))].map(a=>addressCandidateR152(a,wavelength)).sort((a,b)=>b.scalar_focus-a.scalar_focus||b.continuity-a.continuity||a.address-b.address);
  return json({ok:true,schema:'OMEGA_OPTICAL_BATCH_SCREEN_R152',count:items.length,wavelength_nm:wavelength,items,truth_boundary:R152_TRUTH_BOUNDARY});
 }
 return json({ok:false,code:'NOT_FOUND',available:['/','/api/health','/api/optical/manifest','/api/optical/atlas','/api/federation/screen','/api/optical/batch-screen']},404);
}
export default{fetch:route};
