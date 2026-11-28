// R1028 numerical translation of the recovered original V61.3 P15 BIN
// unified_runtime/duplex24.py (source SHA below). Explicit profile adapter;
// no original global CanonDataAuthority, historical installer or admission claim.
export const V613_DUPLEX_SOURCE_SHA_R1028='5ac7270d097495ff07a2f6443f4e34b590bc88f942c0a87f5d211dc44c6c3315';
export const DUPLEX_LAWS_R1028=Object.freeze(['OBJECTIVE','INFORMATION','IDENTITY','BOUNDARY','RELATIONSHIP','TRANSFORMATION','RESOURCE','CONTINUITY','EVIDENCE','EVALUATION','EXPRESSION','RECURSION']);
export const DUPLEX_VIEWS_R1028=Object.freeze(['FIELD','SURFACE','SKIN','GRAPH','ASSEMBLY','MATERIAL','EVIDENCE','CANON','TRAVERSAL']);
export const DUPLEX_QUALITIES_R1028=Object.freeze(['INTERACTIVE','BALANCED','INSPECTION','PRODUCTION','CINEMATIC','MASTER','MEASURED_TRUTH']);
const clamp=x=>Math.max(0,Math.min(1,x));
const id=(side,k)=>side+String(k).padStart(2,'0');
export function propagationMatrixR1028(){
 const m=Array.from({length:24},()=>new Float32Array(24));
 const put=(i,j,w)=>{m[i][j]=Math.max(m[i][j],w)};
 for(let k=0;k<12;k++){const o=12+k;put(k,k,1);put(o,o,1);put(k,o,.72);put(o,k,.18);for(const [d,w] of [[1,.18],[-1,.12]]){const j=(k+d+12)%12;put(k,j,w);put(o,12+j,w)}}
 for(let o=12;o<24;o++){put(8,o,.22);put(9,o,.26);put(7,o,.20)}
 for(const j of [2,4,7,8,9,11])put(4,j,.24);
 return m;
}
export function compileDuplexR1028(scene,profile,previous=null){
 const axes=['scale_index','domain_index','lens_index','phase_index','calculus_mode_index'];
 if(!scene||!axes.every(k=>Number.isSafeInteger(scene[k])&&scene[k]>=1&&scene[k]<=12)||!DUPLEX_VIEWS_R1028.includes(scene.view_mode)||!DUPLEX_QUALITIES_R1028.includes(scene.quality))throw Error('Invalid explicit V61.3 scene axes');
 const keys=['proof_score','continuity','contradiction','burden','plasticity','symmetry','asymmetry'];
 if(!profile||!keys.every(k=>Number.isFinite(profile[k])&&profile[k]>=0&&profile[k]<=1)||!Number.isFinite(profile.compression_ratio)||profile.compression_ratio<1||profile.compression_ratio>1e6)throw Error('Invalid explicit V61.3 profile');
 if(previous&&(!Array.isArray(previous.inverse)||!Array.isArray(previous.outverse)||previous.inverse.length!==12||previous.outverse.length!==12||[...previous.inverse,...previous.outverse].some(b=>!Number.isFinite(b.value)||b.value<0||b.value>1)))throw Error('Invalid prior duplex values');
 const inverse=[],outverse=[],presence=[],proof=profile.proof_score,gates={STAY:0,TURN:0,ESCALATE:0};
 const [scale,domain,lens,phase,calc]=axes.map(k=>scene[k]);
 for(let k=1;k<=12;k++){
  const law=DUPLEX_LAWS_R1028[k-1],angle=scale*.37+domain*.23+lens*.11+phase*.19+calc*.29+k*.53;
  const sym=(Math.sin(angle)+1)/2,out=(Math.cos(angle*.83+k*.17)+1)/2;
  const c=clamp(profile.continuity+.08*(sym-.5)),phi=clamp(profile.plasticity+.09*(out-.5)),q=clamp(profile.contradiction+.12*Math.abs(sym-out)),burden=clamp(profile.burden+.10*(1-sym));
  const inv=clamp(.18+.56*sym+.11*c-.08*q),target=clamp(.16+.55*out+.14*phi-.07*burden);
  const projected=clamp(inv*(.52+.28*c)+phi*.16+(proof-.5)*.08),residual=Math.abs(target-projected),score=c*phi/(q+burden+1e-9),validity=clamp(1-residual*(1+q+burden)+.08*proof);
  const gate=score>=.42&&validity>=.70?'STAY':score>=.22&&validity>=.42?'TURN':'ESCALATE';
  const delta=previous?Math.max(Math.abs(inv-previous.inverse[k-1].value),Math.abs(target-previous.outverse[k-1].value)):residual;
  const common={authority_index:k,authority_key:law,confidence:proof,contradiction:q,burden,continuity:c,plasticity:phi,symmetry:profile.symmetry,asymmetry:profile.asymmetry};
  inverse.push({...common,bin_id:id('I',k),space:'INVERSE',value:inv});
  outverse.push({...common,bin_id:id('O',k),space:'OUTVERSE',value:target});
  presence.push({authority_index:k,authority_key:law,channel_id:id('P',k),projected_outverse:projected,residual,coherence_score:score,validity,gate,correction:target-projected,active:residual>.14||delta>.10||gate==='ESCALATE',evidence:proof,phase:(phase-6.5)/5.5});gates[gate]++;
 }
 const matrix=propagationMatrixR1028(),delta=[...presence,...presence].map(p=>Math.fround(p.residual));
 const propagated=matrix.map(row=>Math.fround(row.reduce((sum,w,j)=>sum+w*delta[j],0)));
 const active=[],disturbed=[],preserved=[],correction=[];
 [...inverse,...outverse].forEach((b,i)=>{const p=presence[b.authority_index-1],mag=propagated[i];correction.push(b.space==='OUTVERSE'?p.correction:-p.correction*.25);if(p.active||mag>.25)active.push(b.bin_id);(mag>.35?disturbed:preserved).push(b.bin_id)});
 const maxResidual=Math.max(...presence.map(p=>p.residual)),avgValid=presence.reduce((sum,p)=>sum+p.validity,0)/12,ratio=active.length/24;
 let method=maxResidual<.035&&ratio<.15?'PRESERVE':maxResidual<.09?'DELTA_REPAIR':avgValid>.68?'RELATIONAL_REBALANCE':proof>.85&&profile.compression_ratio>2?'CACHED_RECONSTRUCTION':'LOCAL_SIMULATION';
 if(scene.view_mode==='TRAVERSAL'&&!['PRESERVE','DELTA_REPAIR'].includes(method))method='GRAPH_TRAVERSAL';
 if(['MATERIAL','SURFACE'].includes(scene.view_mode)&&['PRODUCTION','CINEMATIC','MASTER','MEASURED_TRUTH'].includes(scene.quality)&&avgValid<.55)method='LOCAL_SIMULATION';
 return {schema:'OMEGA_V613_DUPLEX_NUMERICAL_TRANSLATION_R1028',sourceSha256:V613_DUPLEX_SOURCE_SHA_R1028,authority:'MODEL_DERIVED_EXPLICIT_PROFILE_NOT_ORIGINAL_DATA_AUTHORITY',canonicalMutation:false,scene:{...scene},profile:{...profile},inverse,outverse,presence,propagationMatrix:matrix.map(r=>Array.from(r)),propagated,plan:{method,active,disturbed,preserved,correction,gates,predicted_cost:clamp(.08+.72*ratio+.12*(1-avgValid)),predicted_reuse:clamp(1-ratio*.72),expected_accuracy:clamp(avgValid*proof)},originalStateHash:null};
}
