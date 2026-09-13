/* R313.20 — interaction-safe route-transition scroll settlement.
   Presentation/interaction integrity only. This owns no route, execution, proof,
   persistence, Canon, source, Hybrid, Earth, dispatch, or deployment authority.

   OmegaWorkstationFullV2 historically schedules a smooth reset of both the active
   workstation and the window on the next animation frame after each canonical
   omega-capability-change. Even when that late reset is converted to behavior:auto,
   it can still run after the destination mounts and overwrite an immediate user
   scroll/focus action. Settle the historical top target synchronously at transition
   dispatch, then suppress only the already-scheduled legacy smooth top reset during
   the bounded two-frame compatibility window. Native scrolling is restored after
   that window, so the first destination interaction cannot be pulled back to top. */

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
    const main=document.querySelector<HTMLElement>('.workstation-main');

    // Preserve the historical route-to-top result before destination interaction can
    // begin. These are synchronous transition-settlement calls, never delayed repairs.
    if(main)nativeElementScrollTo.call(main,{top:0,behavior:'auto'});
    nativeWindowScrollTo.call(window,{top:0,behavior:'auto'});

    window.scrollTo=((...args:ScrollArgs)=>{
      if(isLegacyTopReset(args))return;
      return (nativeWindowScrollTo as any).apply(window,args);
    }) as typeof window.scrollTo;

    HTMLElement.prototype.scrollTo=(function(this:HTMLElement,...args:ScrollArgs){
      if(isLegacyTopReset(args)&&this.classList.contains('workstation-main'))return;
      return (nativeElementScrollTo as any).apply(this,args);
    }) as typeof HTMLElement.prototype.scrollTo;

    window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{
      if(token!==transition)return;
      window.scrollTo=nativeWindowScrollTo;
      HTMLElement.prototype.scrollTo=nativeElementScrollTo;
    }));
  });
}
