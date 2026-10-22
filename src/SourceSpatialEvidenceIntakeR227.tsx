import {useEffect,useState} from 'react';
import {ScanSearch,ShieldCheck} from 'lucide-react';
import {readSpatialReconstructionEvidenceRequestR226,R226_EVENT} from './world/spatialReconstructionEvidenceR226.js';
import {bindSourceSpatialEvidenceBundleR227,persistSourceSpatialEvidenceBundleR227,readSourceSpatialEvidenceBundleR227,R227_EVENT} from './world/sourceSpatialEvidenceBundleR227.js';
import SourceSpatialReconstructionR228 from './SourceSpatialReconstructionR228';
import SourceSpatialComputedFrameR230 from './SourceSpatialComputedFrameR230';
import {emitOperationR86} from './omegaOperationBusR86';
import {activeProjectIdR87,recordProjectOperationR87} from './omegaProjectContinuityR87';

const CAMERA_EXAMPLE={sourceIdentity:'camera-calibration-id',capturedOrAuthoritativeTime:'2026-09-08T16:00:00Z',imageWidthPx:1920,imageHeightPx:1080,intrinsics:{fx:1200,fy:1200,cx:960,cy:540},pose:{referenceFrame:'WGS84-ENU:R218',position:{x:0,y:0,z:2},orientation:{x:0,y:0,z:0,w:1}},provenance:'source description',uncertainty:{positionM:0.25,angleDeg:0.5},acquisitionMethod:'SENSOR_CAPTURE'};
const DEPTH_EXAMPLE={sourceIdentity:'depth-source-id',capturedOrAuthoritativeTime:'2026-09-08T16:00:02Z',referenceFrame:'WGS84-ENU:R218',samplesOrDepthMap:{sha256:'replace-with-source-hash',sampleCount:2048},units:'m',provenance:'source description',uncertainty:{depthM:0.08},acquisitionMethod:'MEASURED',syntheticFill:false};

export default function SourceSpatialEvidenceIntakeR227(){
 const[request,setRequest]=useState<any>(()=>readSpatialReconstructionEvidenceRequestR226());
 const[bundle,setBundle]=useState<any>(()=>readSourceSpatialEvidenceBundleR227());
 const[cameraText,setCameraText]=useState('');
 const[depthText,setDepthText]=useState('');
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState('');
 useEffect(()=>{const rr=()=>setRequest(readSpatialReconstructionEvidenceRequestR226());const rb=()=>setBundle(readSourceSpatialEvidenceBundleR227());window.addEventListener(R226_EVENT,rr as EventListener);window.addEventListener(R227_EVENT,rb as EventListener);window.addEventListener('storage',rr);window.addEventListener('storage',rb);return()=>{window.removeEventListener(R226_EVENT,rr as EventListener);window.removeEventListener(R227_EVENT,rb as EventListener);window.removeEventListener('storage',rr);window.removeEventListener('storage',rb)}},[]);
 const bind=async()=>{if(busy)return;setBusy(true);setError('');try{const current=readSpatialReconstructionEvidenceRequestR226();if(current?.state!=='SPATIAL_RECONSTRUCTION_EVIDENCE_REQUEST_READY')throw new Error('Stage the R226 3-D evidence request first');const camera=JSON.parse(cameraText);const depth=JSON.parse(depthText);const receipt=await bindSourceSpatialEvidenceBundleR227({request:current,camera,depth});if(receipt?.state!=='SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND')throw new Error(`R227 held: ${(receipt?.missing||[]).join(', ')||'source evidence incomplete'}`);if(!persistSourceSpatialEvidenceBundleR227(receipt))throw new Error('R227 evidence bundle persistence failed');setBundle(receipt);const projectId=activeProjectIdR87();const event=await emitOperationR86({type:'SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND',surface:'Living World',status:'PASS',detail:`Bound R227 camera/depth evidence ${String(receipt.bundleSha256).slice(0,12)} to R226 request ${String(receipt.requestSha256).slice(0,12)}`,payload:{revision:'R227',bundleSha256:receipt.bundleSha256,requestSha256:receipt.requestSha256,cameraEvidenceSha256:receipt.cameraEvidenceSha256,depthEvidenceSha256:receipt.depthEvidenceSha256,r224ReceiptSha256:receipt.r224ReceiptSha256,r218FieldSha256:receipt.r218FieldSha256,missionId:receipt.missionId,projectId,cameraEvidencePresent:true,depthEvidencePresent:true,referenceFrameMatch:true,temporalRelationBound:true,spatialCalibrationProved:false,numerical3DReconstructionExecuted:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false}});await recordProjectOperationR87(projectId,event)}catch(err){setError(err instanceof Error?err.message:String(err))}finally{setBusy(false)}};
 if(request?.state!=='SPATIAL_RECONSTRUCTION_EVIDENCE_REQUEST_READY')return null;
 const ready=bundle?.state==='SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND'&&bundle?.requestSha256===request?.requestSha256;
 return <><div className='r206-world-mission' data-state={ready?'BOUND':'ASSEMBLED'} aria-label='R227 source camera and depth evidence intake'>
  <div className='r206-world-mission-icon'><ScanSearch/></div>
  <div className='r206-world-mission-copy'><small>R226 → R227 · SOURCE CAMERA + DEPTH EVIDENCE</small><b>{ready?'SOURCE SPATIAL EVIDENCE BOUND':'EVIDENCE INTAKE READY'}</b><span>{ready?`camera ${String(bundle.cameraEvidenceSha256).slice(0,12)} · depth ${String(bundle.depthEvidenceSha256).slice(0,12)} · Δt ${bundle.registration?.temporalDeltaMs}ms`:'Paste source-backed camera calibration/pose and measured or source-derived depth JSON. Matching declared reference frames and bounded capture times are required.'}</span><em>{error||(ready?'Evidence presence and binding proven; R228 can now compute bounded source-derived geometry when exact numeric depth is present. Spatial calibration proof and R122 rendered reality remain unproven.':'No synthetic depth. No terrain-inferred camera calibration. No reconstruction claim.')}</em>
   {!ready&&<><textarea aria-label='R227 camera evidence JSON' value={cameraText} onChange={e=>setCameraText(e.target.value)} placeholder={JSON.stringify(CAMERA_EXAMPLE)}/><textarea aria-label='R227 depth evidence JSON' value={depthText} onChange={e=>setDepthText(e.target.value)} placeholder={JSON.stringify(DEPTH_EXAMPLE)}/></>}
  </div>
  <div className='r206-world-mission-proof'><ShieldCheck/><span>R226 request bound</span><span>source evidence hashes</span><span>declared frame + time checked</span><span>R122 reconstruction not executed</span><span>Photoreal unproven</span></div>
  {!ready&&<button onClick={bind} disabled={busy||!cameraText.trim()||!depthText.trim()}>{busy?'Binding…':'Bind source 3-D evidence'}</button>}
 </div>{ready&&<><SourceSpatialReconstructionR228 cameraEvidenceText={cameraText} depthEvidenceText={depthText}/><SourceSpatialComputedFrameR230/></>}</>;
}
