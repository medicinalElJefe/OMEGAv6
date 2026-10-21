/** OMEGA7 R663: source-backed first-person temporal frame contract.
 * No procedural scenery: missing depth, geometry or source pixels is an explicit HOLD.
 * Frames are generated from real RGBA source imagery and registered per-pixel depth.
 */
export type SourceFrameR663={
 id:string; timestampSeconds:number; width:number;height:number;
 rgba:Uint8ClampedArray; depthMeters:Float32Array;
 provenance:{sourceId:string;imageSha256:string;depthSha256:string;calibrationId:string};
};
export type CameraR663={x:number;y:number;z:number;yaw:number;pitch:number;focalPx:number};
export type RenderReceiptR663={status:'RENDERED'|'SOURCE_HOLD';reason?:string;sourceFrameIds:string[];pixelsWritten:number;pixelsOccluded:number;pixelsMissing:number;timeSeconds:number};
export type RenderResultR663={rgba:Uint8ClampedArray;width:number;height:number;receipt:RenderReceiptR663};
const finite=(x:number)=>Number.isFinite(x);
export function validateFrameR663(f:SourceFrameR663):string|null{
 if(!Number.isInteger(f.width)||!Number.isInteger(f.height)||f.width<1||f.height<1)return 'INVALID_DIMENSIONS';
 if(f.rgba.length!==f.width*f.height*4||f.depthMeters.length!==f.width*f.height)return 'BUFFER_SHAPE_MISMATCH';
 if(!finite(f.timestampSeconds))return 'INVALID_TIMESTAMP';
 if(!f.provenance.sourceId||!f.provenance.imageSha256||!f.provenance.depthSha256||!f.provenance.calibrationId)return 'MISSING_PROVENANCE';
 return null;
}
/** Pinhole inverse reprojection with z-buffer. Camera/world axes: +z forward,
 * +x right, +y down. Source image is calibrated at camera origin.
 * No hole filling or fabricated samples. Unobserved pixels remain transparent.
 */
export function renderSourceFrameR663(frame:SourceFrameR663,camera:CameraR663,outWidth=1920,outHeight=1080):RenderResultR663{
 const out=new Uint8ClampedArray(outWidth*outHeight*4);
 const hold=(reason:string):RenderResultR663=>({rgba:out,width:outWidth,height:outHeight,receipt:{status:'SOURCE_HOLD',reason,sourceFrameIds:[frame.id],pixelsWritten:0,pixelsOccluded:0,pixelsMissing:outWidth*outHeight,timeSeconds:frame.timestampSeconds}});
 const err=validateFrameR663(frame);if(err)return hold(err);
 if(!Number.isInteger(outWidth)||!Number.isInteger(outHeight)||outWidth<1||outHeight<1||outWidth*outHeight>16777216)throw Error('invalid output resolution');
 if(Object.values(camera).some(v=>!finite(v))||camera.focalPx<=0)return hold('INVALID_CAMERA');
 const zbuf=new Float32Array(outWidth*outHeight);zbuf.fill(Infinity);
 const sy=Math.sin(camera.yaw),cy=Math.cos(camera.yaw),sp=Math.sin(camera.pitch),cp=Math.cos(camera.pitch);
 const scaleX=outWidth/frame.width,scaleY=outHeight/frame.height;
 let written=0,occluded=0;
 for(let y=0;y<frame.height;y++)for(let x=0;x<frame.width;x++){
  const i=y*frame.width+x,depth=frame.depthMeters[i],a=frame.rgba[i*4+3];
  if(!finite(depth)||depth<=0||a===0)continue;
  const wx=(x-(frame.width-1)/2)*depth/camera.focalPx-camera.x;
  const wy=(y-(frame.height-1)/2)*depth/camera.focalPx-camera.y;
  const wz=depth-camera.z;
  const rx=cy*wx-sy*wz,rz=sy*wx+cy*wz;
  const ry=cp*wy-sp*rz,forward=sp*wy+cp*rz;
  if(forward<=0)continue;
  const px=Math.round((rx*camera.focalPx/forward+(frame.width-1)/2)*scaleX);
  const py=Math.round((ry*camera.focalPx/forward+(frame.height-1)/2)*scaleY);
  if(px<0||py<0||px>=outWidth||py>=outHeight)continue;
  const p=py*outWidth+px;
  if(forward>=zbuf[p]){occluded++;continue}
  if(zbuf[p]===Infinity)written++;
  zbuf[p]=forward;out.set(frame.rgba.subarray(i*4,i*4+4),p*4);
 }
 return{rgba:out,width:outWidth,height:outHeight,receipt:{status:'RENDERED',sourceFrameIds:[frame.id],pixelsWritten:written,pixelsOccluded:occluded,pixelsMissing:outWidth*outHeight-written,timeSeconds:frame.timestampSeconds}};
}
export function selectTemporalSourceR663(frames:readonly SourceFrameR663[],seconds:number):SourceFrameR663|null{
 if(!finite(seconds))return null;
 const valid=frames.filter(f=>validateFrameR663(f)===null).sort((a,b)=>a.timestampSeconds-b.timestampSeconds);
 let found:null|SourceFrameR663=null;
 for(const f of valid){if(f.timestampSeconds<=seconds)found=f;else break}
 return found;
}
