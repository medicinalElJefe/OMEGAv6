import{compileProofBoundTemporalTraversalR355}from'./proofBoundTemporalTraversalR355';

type Request={
 type:'COMPILE_R355_TRAVERSAL';
 evidence?:any;
 steps?:number;
 checkpointEvery?:number;
 nowTick?:number;
 orientations?:number[];
 transportRate?:number;
};

const scope=self as any;
scope.onmessage=async(event:MessageEvent<Request>)=>{
 const request=event.data;
 if(request?.type!=='COMPILE_R355_TRAVERSAL')return;
 try{
  const traversal=await compileProofBoundTemporalTraversalR355({
   evidence:request.evidence||{},
   steps:request.steps,
   checkpointEvery:request.checkpointEvery,
   nowTick:request.nowTick,
   orientations:request.orientations,
   transportRate:request.transportRate
  });
  scope.postMessage({ok:true,traversal});
 }catch(error){
  scope.postMessage({ok:false,error:error instanceof Error?error.message:String(error)});
 }
};
