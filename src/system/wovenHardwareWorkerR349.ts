import{compileCanonicalTypedFieldR349,compileHardwareExecutionPlanR349,evolveHardwareFieldR349,renderExactAddressFieldR349,type HardwareHintR349,type LensR349}from'./wovenHardwareFieldR349';

type Request={type:'COMPILE_RENDER';orientation?:number;transportRate?:number;lens?:LensR349;hardwareHint?:HardwareHintR349};
const scope=self as any;
scope.onmessage=(event:MessageEvent<Request>)=>{
 const request=event.data;
 if(request?.type!=='COMPILE_RENDER')return;
 try{
  const plan=compileHardwareExecutionPlanR349(request.hardwareHint||{});
  const source=compileCanonicalTypedFieldR349(0);
  const evolution=evolveHardwareFieldR349(source,{orientation:Number(request.orientation)||0,transportRate:Number.isFinite(Number(request.transportRate))?Number(request.transportRate):.125});
  const render=renderExactAddressFieldR349(evolution.field,request.lens||'COMPOSITE');
  scope.postMessage({ok:true,plan,summary:{schema:evolution.schema,orientation:evolution.orientation,transportRate:evolution.transportRate,invariantBefore:evolution.invariantBefore,invariantAfter:evolution.invariantAfter,invariantResidual:evolution.invariantResidual,scarDelta:evolution.scarDelta,proof:evolution.proof,renderChecksum:render.checksum,pixelCount:render.pixelCount,lens:render.lens,boundary:render.boundary},rgba:render.rgba.buffer},[render.rgba.buffer]);
 }catch(error){scope.postMessage({ok:false,error:error instanceof Error?error.message:String(error)})}
};
