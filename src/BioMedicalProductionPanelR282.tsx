import {useEffect,useMemo,useState} from 'react';
import {Activity,FileCheck2,LockKeyhole,ShieldAlert,ShieldCheck,Upload} from 'lucide-react';
import {appendBioAuditEventR282,assessMedicalReleaseR282,DEFAULT_BIO_HAZARDS_R282,verifyBioAuditChainR282,type BioAuditEventR282,type BioClinicalModeEvidenceR282,type BioClinicalReleaseManifestR282,type BioClinicalEmpiricalCaseR282,type BioHazardControlR282,type BioMeasurementDefinitionR282} from './bioMedicalProductionR282';
import type {BioInstrumentSampleR281} from './bioInstrumentRuntimeR281';
import './bioMedicalProductionR282.css';

type Props={record:any;samples:BioInstrumentSampleR281[]};
type Profile={manifest:BioClinicalReleaseManifestR282;definitions:BioMeasurementDefinitionR282[];hazards?:BioHazardControlR282[];modeEvidence?:BioClinicalModeEvidenceR282[];empiricalCases?:BioClinicalEmpiricalCaseR282[]};

const DEFAULT_PROFILE:Profile={
 manifest:{
  releaseId:'R282-VALIDATION-PROFILE-UNSET',softwareVersion:'R282',regulatoryStage:'RESEARCH_ONLY',jurisdiction:'US',softwareDocumentationLevel:'ENHANCED',
  intendedUse:{id:'UNSET',purpose:'Validation profile not yet configured',intendedUser:'UNSET',intendedPopulation:'UNSET',useEnvironment:'UNSET',inputs:[],outputs:[],decisionRole:'INFORMATIONAL',locked:false},
  riskManagementApproved:false,analyticalValidationApproved:false,clinicalValidationApproved:false,humanFactorsApproved:false,cybersecurityApproved:false,interoperabilityApproved:false,postmarketPlanApproved:false,configurationLocked:false,sbomRecorded:false,unresolvedAnomaliesReviewed:false
 },
 definitions:[]
};
const gateClass=(x:string)=>x==='PASS'?'pass':x==='FAIL'?'fail':'hold';
const pretty=(x:string)=>x.replaceAll('_',' ');

export default function BioMedicalProductionPanelR282({record,samples}:Props){
 const[profile,setProfile]=useState<Profile>(DEFAULT_PROFILE),[error,setError]=useState(''),[audit,setAudit]=useState<{ok:boolean;head:string;count:number;errors:string[]}|null>(null);
 const result=useMemo(()=>assessMedicalReleaseR282({record,samples,definitions:profile.definitions,manifest:profile.manifest,hazards:profile.hazards||DEFAULT_BIO_HAZARDS_R282,clinicalModeEvidence:profile.modeEvidence||[],empiricalCases:profile.empiricalCases||[]}),[record,samples,profile]);
 useEffect(()=>{let alive=true;(async()=>{let chain:BioAuditEventR282[]=[];chain=await appendBioAuditEventR282(chain,'RELEASE_PROFILE',{releaseId:profile.manifest.releaseId,softwareVersion:profile.manifest.softwareVersion,intendedUse:profile.manifest.intendedUse,regulatoryStage:profile.manifest.regulatoryStage},'R282');for(const s of samples)chain=await appendBioAuditEventR282(chain,'MEASUREMENT_INGEST',{id:s.id,domain:s.domain,layer:s.layer,variable:s.variable,rawValue:s.rawValue,unit:s.unit,observedAt:s.observedAt,source:s.source,device:s.device},'R282');const verified=await verifyBioAuditChainR282(chain);if(alive)setAudit(verified)})().catch(e=>{if(alive)setAudit({ok:false,head:'ERROR',count:0,errors:[String(e)]})});return()=>{alive=false}},[profile.manifest,samples]);
 const handleProfile=async(file?:File)=>{if(!file)return;try{const parsed=JSON.parse(await file.text());if(!parsed?.manifest||!Array.isArray(parsed?.definitions))throw new Error('Profile requires manifest and definitions[]');setProfile({manifest:parsed.manifest,definitions:parsed.definitions,hazards:Array.isArray(parsed.hazards)?parsed.hazards:undefined,modeEvidence:Array.isArray(parsed.modeEvidence)?parsed.modeEvidence:undefined,empiricalCases:Array.isArray(parsed.empiricalCases)?parsed.empiricalCases:undefined});setError('')}catch(e:any){setError(String(e?.message||e))}};
 const gates=Object.entries(result.gates),auditState=audit?.ok?'PASS':audit?'FAIL':'BUILDING';
 const releaseVisualState=result.releaseState==='AUTHORIZED_CLINICAL_RELEASE_READY'?'release-pass':result.releaseState==='ENGINEERING_INCOMPLETE'?'release-fail':'release-hold';
 return <section className='bio282' aria-label='Heavy Bio medical production validation control plane'>
  <header className='bio282-head'><div><span>R282 · MEDICAL PRODUCTION BASELINE</span><h3>Clinical Validation & Release Control Plane</h3><p>Instrument evidence, intended-use locking, risk controls, all-mode validation, audit integrity and controlled updates are evaluated independently. Software cannot manufacture clinical authority.</p></div><div className={`bio282-release ${releaseVisualState}`} data-release-state={result.releaseState} data-profile-id={profile.manifest.releaseId} data-audit-state={auditState} aria-live='polite'><b>{pretty(result.releaseState)}</b><small>{profile.manifest.regulatoryStage.replaceAll('_',' ')} · {profile.manifest.jurisdiction}</small></div></header>
  <div className='bio282-kpis'>
   <article><span>MEASUREMENT GATE</span><b>{result.gates.measurement}</b><small>{result.medicalFrame.counts.eligible}/{result.medicalFrame.counts.supplied} intended-use eligible</small></article>
   <article><span>RISK GATE</span><b>{result.risk.gate}</b><small>{result.risk.critical} critical/open · {result.risk.total} hazards</small></article>
   <article><span>CLINICAL MODES</span><b>{result.modes.clinicalActive}</b><small>{result.modes.total} visible · unvalidated clinical weight 0</small></article>
   <article><span>AUDIT CHAIN</span><b>{auditState}</b><small>{audit?.count??0} events · {audit?.head.slice(0,12)??'—'}</small></article>
   <article><span>AUTHORIZATION</span><b>{result.gates.regulatoryAuthorization}</b><small>{profile.manifest.authorizationId||'no authorization evidence loaded'}</small></article>
  </div>
  <section className='bio282-profile'><header><Upload/><div><b>MEDICAL RELEASE PROFILE</b><small>JSON profile · intended use + measurand definitions + risk + validation evidence</small></div><label>Load profile<input type='file' accept='.json,application/json' onChange={e=>handleProfile(e.target.files?.[0])}/></label></header>{error&&<p className='bio282-error'>{error}</p>}<div className='bio282-profile-grid'><article><span>INTENDED USE</span><b>{profile.manifest.intendedUse.id}</b><p>{profile.manifest.intendedUse.purpose}</p><small>{profile.manifest.intendedUse.intendedPopulation} · {profile.manifest.intendedUse.intendedUser}</small></article><article><span>DECISION ROLE</span><b>{pretty(profile.manifest.intendedUse.decisionRole)}</b><p>{profile.manifest.intendedUse.useEnvironment}</p><small>{profile.manifest.intendedUse.locked?'LOCKED':'NOT LOCKED'}</small></article><article><span>MEASURANDS</span><b>{profile.definitions.length}</b><p>Explicit unit contracts and analytical ranges</p><small>No implicit unit conversion</small></article><article><span>SOFTWARE DOC LEVEL</span><b>{profile.manifest.softwareDocumentationLevel}</b><p>Risk-based submission documentation target</p><small>Configuration {profile.manifest.configurationLocked?'locked':'open'}</small></article></div></section>
  <section className='bio282-gates'><header><FileCheck2/><div><b>RELEASE GATES</b><small>Every clinical-use gate remains independently visible</small></div></header><div>{gates.map(([name,value])=><article key={name} className={gateClass(String(value))}><span>{pretty(name)}</span><b>{String(value)}</b></article>)}</div></section>
  <div className='bio282-two'>
   <section><header><ShieldAlert/><div><b>RISK CONTROL LEDGER</b><small>High residual risk blocks clinical release</small></div></header><div className='bio282-risk'>{result.risk.risks.map(r=><article key={r.id} data-state={r.status}><code>{r.id}</code><span><b>{r.hazard}</b><small>{r.harm}</small></span><strong>{r.status}<small>{r.initialRisk} → {r.residualRisk}</small></strong></article>)}</div></section>
   <section><header><LockKeyhole/><div><b>AUTHORITY SEPARATION</b><small>All modes remain visible without becoming measurements</small></div></header><dl><div><dt>Instrument processing</dt><dd>{result.claims.instrumentProcessing?'ENABLED':'BLOCKED'}</dd></div><div><dt>Research analysis</dt><dd>ENABLED</dd></div><div><dt>Clinical decision support</dt><dd>{result.claims.clinicalDecisionSupport?'AUTHORIZED':'BLOCKED'}</dd></div><div><dt>Autonomous clinical action</dt><dd>{result.claims.autonomousClinicalAction?'AUTHORIZED':'BLOCKED'}</dd></div><div><dt>241-mode clinical active</dt><dd>{result.modes.clinicalActive}</dd></div><div><dt>Mode measurement authority</dt><dd>0</dd></div></dl></section>
  </div>
  <section className='bio282-standards'><header><ShieldCheck/><div><b>REGULATED-PRODUCTION TARGETS</b><small>Engineering targets; conformance/authorization still requires objective evidence</small></div></header><div>{Object.entries(result.standardsTargets).map(([k,v])=><article key={k}><span>{pretty(k)}</span><b>{v}</b></article>)}</div></section>
  <footer><Activity/><span>{result.truthBoundary}</span></footer>
 </section>;
}
