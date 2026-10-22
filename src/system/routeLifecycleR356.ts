export type RouteLifecycleR356={epoch:string;from:string;to:string;state:'REQUESTED'|'COMMITTED'};

export function requestRouteLifecycleR356(from:string,to:string):RouteLifecycleR356{
 if(typeof document==='undefined')return{epoch:'0',from,to,state:'REQUESTED'};
 const root=document.documentElement,epoch=String((Number(root.dataset.omegaRouteEpoch)||0)+1);
 root.dataset.omegaRouteEpoch=epoch;
 root.dataset.omegaRouteFrom=from;
 root.dataset.omegaRouteTarget=to;
 root.dataset.omegaRouteState='REQUESTED';
 window.dispatchEvent(new CustomEvent('omega-r356-route-requested',{detail:{from,to,epoch}}));
 return{epoch,from,to,state:'REQUESTED'};
}

export function commitRouteLifecycleR356(panel:string):RouteLifecycleR356{
 if(typeof document==='undefined')return{epoch:'0',from:panel,to:panel,state:'COMMITTED'};
 const root=document.documentElement,from=root.dataset.omegaRouteFrom||panel,target=root.dataset.omegaRouteTarget||panel,epoch=root.dataset.omegaRouteEpoch||'0';
 root.dataset.omegaRouteCurrent=panel;
 if(target===panel){
  root.dataset.omegaRouteTarget=panel;
  root.dataset.omegaRouteState='COMMITTED';
  window.dispatchEvent(new CustomEvent('omega-r356-route-committed',{detail:{from,to:panel,epoch}}));
  return{epoch,from,to:panel,state:'COMMITTED'};
 }
 return{epoch,from,to:target,state:'REQUESTED'};
}
