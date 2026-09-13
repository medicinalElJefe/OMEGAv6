/* R313.21 — interaction-safe route-transition scroll settlement.
   Presentation/interaction integrity only. This owns no route, execution, proof,
   persistence, Canon, source, Hybrid, Earth, dispatch, or deployment authority.

   OmegaWorkstationFullV2 historically schedules a smooth top reset one animation
   frame after the canonical omega-capability-change signal. The former compatibility
   layer replaced scroll methods per transition and restored them two frames later.
   Rapid/same-route transitions could therefore capture an already wrapped method and
   restore wrappers out of order. Install one stable forwarding membrane instead: the
   route top is settled synchronously, only the historical smooth top reset is ignored
   during the bounded two-frame transition window, and every other scroll call forwards
   directly to the original native implementation. */

let installed=false;
let suppressLegacyReset=false;

type ScrollArgs=[options?:ScrollToOptions]|[x:number,y:number];

function isLegacyTopReset(args:ScrollArgs){
  const first=args[0];
  return typeof first==='object'&&first!==null&&Number(first.top??0)===0&&first.behavior==='smooth';
}

export function installNavigationScrollIntegrityR313(){
  if(installed||typeof window==='undefined')return;
  installed=true;

  const nativeWindowScrollTo=window.scrollTo;
  const nativeElementScrollTo=HTMLElement.prototype.scrollTo;

  window.scrollTo=((...args:ScrollArgs)=>{
    if(suppressLegacyReset&&isLegacyTopReset(args))return;
    return (nativeWindowScrollTo as any).apply(window,args);
  }) as typeof window.scrollTo;

  HTMLElement.prototype.scrollTo=(function(this:HTMLElement,...args:ScrollArgs){
    if(suppressLegacyReset&&isLegacyTopReset(args)&&this.classList.contains('workstation-main'))return;
    return (nativeElementScrollTo as any).apply(this,args);
  }) as typeof HTMLElement.prototype.scrollTo;

  window.addEventListener('omega-capability-change',()=>{
    suppressLegacyReset=true;
    const main=document.querySelector<HTMLElement>('.workstation-main');

    // Route-to-top is a synchronous transition result. No delayed corrective scroll is
    // allowed to compete with destination focus, audit, or user interaction.
    if(main)nativeElementScrollTo.call(main,{top:0,behavior:'auto'});
    nativeWindowScrollTo.call(window,{top:0,behavior:'auto'});

    window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{
      suppressLegacyReset=false;
    }));
  });
}
