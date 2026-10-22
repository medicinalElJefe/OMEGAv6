import {useEffect,useMemo,useState} from 'react';
import {Box,ShieldCheck} from 'lucide-react';
import {readSourceSpatialEvidenceBundleR227,R227_EVENT} from './world/sourceSpatialEvidenceBundleR227.js';
import {persistSourceSpatialReconstructionR228,readSourceSpatialReconstructionR228,reconstructSourceSpatialGeometryR228,R228_EVENT} from './world/sourceSpatialReconstructionR228.js';
import {emitOperationR86} from './omegaOperationBusR86';
import {activeProjectIdR87,recordProjectOperationR87} from './omegaProjectContinuityR87';

function diagnosticProjection(points:any[]){
 if(!Array.isArray(points)||!points.length)return[];
 const stride=Math.max(1,Math.ceil(points.length/512)),sample=points.filter((_:any,i:number)=>i%stride===0);
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(const p of sample){minX=Math.min(minX,Number(p.x));maxX=Math.max(maxX,Number(p.x));minY=Math.min(minY,Number(p.y));maxY=Math.max(maxY,Number(p.y))}
 const spanX=Math.max(1e-9,maxX-minX),spanY=Math.max(1e-9,maxY-minY),w=420,h=260,pad=18;
 return sample.map((p:any,i:number)=>({i,x:pad+((Number(p.x)-minX)/spanX)*(w-pad*2),y:h-pad-((Number(p.y)-minY)/spanY)*(h-pad*2),z:Number(p.z)}));
}

export default function SourceSpatialReconstructionR228({cameraEvidenceText='',depthEvidenceText=''}:{cameraEvidenceText?:string,depthEvidenceText?:string}){
 const[bundle,setBundle]=useState<any>(()=>readSourceSpatialEvidenceBundleR227());
 const[receipt,setReceipt]=useState<any>(()=>readSourceSpatialReconstructionR228());
 const[cameraText,setCameraText]=useState(cameraEvidenceText);
 const[depthText,setDepthText]=useState(depthEvidenceText);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState('');
 useEffect(()=>{if(cameraEvidenceText&&!cameraText)setCameraText(cameraEvidenceText)},[cameraEvidenceText]);
 useEffect(()=>{if(depthEvidenceText&&!depthText)setDepthText(depthEvidenceText)},[depthEvidenceText]);
 useEffect(()=>{const rb=()=>setBundle(readSourceSpatialEvidenceBundleR227());const rr=()=>setReceipt(readSourceSpatialReconstructionR228());window.addEventListener(R227_EVENT,rb as EventListener);window.addEventListener(R228_EVENT,rr as EventListener);window.addEventListener('storage',rb);window.addEventListener('storage',rr);return()=>{window.removeEventListener(R227_EVENT,rb as EventListener);window.removeEventListener(R228_EVENT,rr as EventListener);window.removeEventListener('storage',rb);window.removeEventListener('storage',rr)}},[]);
 const ready=receipt?.state==='SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED'&&receipt?.r227BundleSha256===bundle?.bundleSha256;
 const projection=useMemo(()=>diagnosticProjection(ready?receipt?.points:[]),[ready,receipt?.geometrySha256]);
 const reconstruct=async()=>{if(busy)return;setBusy(true);setError('');try{const current=readSourceSpatialEvidenceBundleR227();if(current?.state!=='SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND')throw new Error('Bind the R227 source camera/depth evidence first');const camera=JSON.parse(cameraText),depth=JSON.parse(depthText);const next=await reconstructSourceSpatialGeometryR228({bundle:current,camera,depth,maxPoints:2048});if(next?.state!=='SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED')throw new Error(`R228 held: ${(next?.missing||[]).join(', ')||'numeric source geometry unavailable'}`);if(!persistSourceSpatialReconstructionR228(next))throw new Error('R228 reconstruction persistence failed');setReceipt(next);const projectId=activeProjectIdR87();const event=await emitOperationR86({type:'SOURCE_SPATIAL_RECONSTRUCTION_COMPUTED',surface:'Living World',status:'PASS',detail:`R228 computed ${next.reconstructedPointCount} source-derived 3-D points ${String(next.geometrySha256).slice(0,12)} from exact R227 evidence ${String(next.r227BundleSha256).slice(0,12)}`,payload:{revision:'R228',receiptSha256:next.receiptSha256,geometrySha256:next.geometrySha256,r227BundleSha256:next.r227BundleSha256,requestSha256:next.requestSha256,cameraEvidenceSha256:next.cameraEvidenceSha256,depthEvidenceSha256:next.depthEvidenceSha256,missionId:next.missionId,projectId,referenceFrame:next.referenceFrame,sourceSampleCount:next.sourceSampleCount,reconstructedPointCount:next.reconstructedPointCount,declaredCalibrationApplied:true,spatialCalibrationProved:false,independentCalibrationValidation:false,sourceDerivedGeometry:true,numerical3DReconstructionExecuted:true,renderedComputedRealityFrame:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,pcOnlineClaimed:false,federationClosureProved:false,canonicalMutation:false}});await recordProjectOperationR87(projectId,event)}catch(err){setError(err instanceof Error?err.message:String(err))}finally{setBusy(false)}};
 if(bundle?.state!=='SOURCE_SPATIAL_EVIDENCE_BUNDLE_BOUND')return null;
 return <div className='r206-world-mission' data-state={ready?'BOUND':'ASSEMBLED'} aria-label='R228 source spatial reconstruction'>
  <div className='r206-world-mission-icon'><Box/></div>
  <div className='r206-world-mission-copy'><small>R227 → R228 · SOURCE-DERIVED 3-D GEOMETRY</small><b>{ready?'SOURCE SPATIAL RECONSTRUCTION COMPUTED':'NUMERIC RECONSTRUCTION READY'}</b><span>{ready?`${receipt.reconstructedPointCount}/${receipt.sourceSampleCount} source samples · ${receipt.referenceFrame} · geometry ${String(receipt.geometrySha256).slice(0,12)}`:'Re-submit the exact R227-bound camera/depth JSON. R228 verifies both evidence hashes before applying the declared intrinsics and pose; only explicit numeric depth samples are accepted.'}</span><em>{error||(ready?'Declared calibration was applied numerically; independent calibration proof, R122 rendered reality and photoreality remain unproven.':'Hash-only depth descriptors hold. Missing depth is never synthesized.')}</em>
   {!ready&&<><textarea aria-label='R228 exact bound camera evidence JSON' value={cameraText} onChange={e=>setCameraText(e.target.value)} placeholder='Paste the exact camera JSON already bound by R227'/><textarea aria-label='R228 exact bound numeric depth evidence JSON' value={depthText} onChange={e=>setDepthText(e.target.value)} placeholder='Paste the exact R227 depth JSON with numeric samples or a bounded depth grid'/></>}
   {ready&&projection.length>0&&<svg viewBox='0 0 420 260' role='img' aria-label='R228 source-derived 3-D geometry diagnostic top projection; not photoreal imagery' style={{width:'100%',maxWidth:520,minHeight:180,marginTop:8,borderRadius:10,background:'rgba(4,8,18,.72)'}}><rect width='420' height='260' fill='rgba(4,8,18,.72)'/>{projection.map((p:any)=><circle key={`r228-${p.i}`} cx={p.x} cy={p.y} r='1.45' fill='currentColor' fillOpacity='.72'/>)}</svg>}
  </div>
  <div className='r206-world-mission-proof'><ShieldCheck/><span>exact R227 hashes rechecked</span><span>numeric depth only</span><span>declared intrinsics + pose applied</span><span>R122 frame not claimed</span><span>R125 Canon only</span><span>Photoreal unproven</span></div>
  {!ready&&<button onClick={reconstruct} disabled={busy||!cameraText.trim()||!depthText.trim()}>{busy?'Reconstructing…':'Compute bounded source 3-D geometry'}</button>}
 </div>;
}
