import{compileFullSphereTemporalR353,proveFullSphereTemporalR353}from'./earthFullSphereTemporalR353';

const scope=self as any;
scope.onmessage=(event:MessageEvent<any>)=>{
 const req=event.data||{};
 if(req.type!=='COMPILE_R353')return;
 try{
  const model=compileFullSphereTemporalR353({address:req.address,lat:req.lat,lon:req.lon,evidence:req.evidence,steps:12,nowTick:6,tick:req.tick});
  const proof=proveFullSphereTemporalR353(model);
  const view={
   schema:model.schema,revision:model.revision,address:model.address,target:model.target,antipode:model.antipode,tick:model.tick,nowTick:model.nowTick,relation:model.relation,
   selected:model.selected,comparison:model.comparison,observerProof:model.observerProof,solar:model.solar,grammar:model.grammar,render:model.render,source:model.source,boundary:model.boundary,proof,
   checkpointFrames:model.frames.map(x=>({tick:x.tick,fieldHash:x.fieldHash,relation:x.relation,epistemicState:x.epistemicState,observationState:x.observationState}))
  };
  scope.postMessage({ok:true,view});
 }catch(error){scope.postMessage({ok:false,error:error instanceof Error?error.message:String(error)})}
};
