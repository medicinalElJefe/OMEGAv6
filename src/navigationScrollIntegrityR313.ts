/* R313.18 — deterministic route-transition scroll settlement.
   Presentation/interaction integrity only. This owns no route, execution, proof,
   persistence, Canon, source, Hybrid, Earth, dispatch, or deployment authority.

   OmegaWorkstationFullV2 historically schedules a smooth reset of both the active
   workstation and the window on the next animation frame after each canonical
   omega-capability-change. The prior R313.12 compatibility layer then issued a second-
   frame corrective scroll. The exhaustive R286 traversal proved that this correction
   could itself arrive after the destination surface had mounted and after the user's
   first scroll/focus action, pulling Command Center controls back out of the viewport.

   Preserve the historical reset target while removing the asynchronous race: for only
   the next route-reset frame, coerce top=0 smooth scrollTo calls on the two historical
   owners to behavior:auto. Restore the native methods on the following frame. No late
   corrective scroll remains, so destination interaction cannot be overwritten after
   it begins. All unrelated scroll calls retain their native behavior. */

let installed=false;
let transition=0;

type ScrollArgs=[options?:ScrollToOptions]|[x:number,y:number];

function isLegacyTopReset(args:ScrollArgs){
  const first=args[0];
  return typeof first==='object'&&first!==null&&Number(first.top??0)===0&&first.behavior==='smooth';
}

export function installNavigationScrollIntegrityR313(){
  if(installed||typeof window==='undefined')return;
  installed=true;
  window.addEventListener('omega-capability-change',()=>{
    const token=++transition;
    const nativeWindowScrollTo=window.scrollTo;
    const nativeElementScrollTo=HTMLElement.prototype.scrollTo;

    window.scrollTo=((...args:ScrollArgs)=>{
      if(isLegacyTopReset(args)){
        const options=args[0] as ScrollToOptions;
        return nativeWindowScrollTo.call(window,{...options,behavior:'auto'});
      }
      return (nativeWindowScrollTo as any).apply(window,args);
    }) as typeof window.scrollTo;

    HTMLElement.prototype.scrollTo=(function(this:HTMLElement,...args:ScrollArgs){
      if(isLegacyTopReset(args)){
        const options=args[0] as ScrollToOptions;
        return nativeElementScrollTo.call(this,{...options,behavior:'auto'});
      }
      return (nativeElementScrollTo as any).apply(this,args);
    }) as typeof HTMLElement.prototype.scrollTo;

    window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{
      if(token!==transition)return;
      window.scrollTo=nativeWindowScrollTo;
      HTMLElement.prototype.scrollTo=nativeElementScrollTo;
    }));
  });
}
