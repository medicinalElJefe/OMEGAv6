/* R313.22 — interaction-safe route-transition and control-reachability scroll settlement.
   Presentation/interaction integrity only. This owns no route, execution, proof,
   persistence, Canon, source, Hybrid, Earth, dispatch, or deployment authority.

   OmegaWorkstationFullV2 historically schedules a smooth top reset one animation
   frame after the canonical omega-capability-change signal. The former compatibility
   layer replaced scroll methods per transition and restored them two frames later.
   Rapid/same-route transitions could therefore capture an already wrapped method and
   restore wrappers out of order. Install one stable forwarding membrane instead: the
   route top is settled synchronously, only the historical smooth top reset is ignored
   during the bounded two-frame transition window, and every other scroll call forwards
   directly to the original native implementation.

   Chromium can also leave a deeply nested control outside the viewport after native
   Element.scrollIntoView when an accumulated presentation ancestor participates in
   clipping/scroll containment. R313.22 preserves native scrolling first, then performs
   one bounded canonical-document fallback only when the target is still wholly outside
   the viewport. This keeps one document scroll membrane and makes programmatic/focus
   reachability agree with pointer reachability without inventing a nested Cockpit scroller. */

let installed=false;
let suppressLegacyReset=false;

type ScrollArgs=[options?:ScrollToOptions]|[x:number,y:number];

type IntoViewArg=boolean|ScrollIntoViewOptions|undefined;

function isLegacyTopReset(args:ScrollArgs){
  const first=args[0];
  return typeof first==='object'&&first!==null&&Number(first.top??0)===0&&first.behavior==='smooth';
}

function requiresDocumentReachabilityFallback(el:Element){
  const r=el.getBoundingClientRect();
  return Number.isFinite(r.top)&&Number.isFinite(r.bottom)&&r.height>0&&(r.bottom<=1||r.top>=window.innerHeight-1);
}

function settleElementIntoDocumentViewport(el:Element){
  if(!requiresDocumentReachabilityFallback(el))return;
  const root=document.scrollingElement;
  if(!root)return;
  const r=el.getBoundingClientRect();
  const desired=root.scrollTop+r.top-(window.innerHeight-r.height)/2;
  const max=Math.max(0,root.scrollHeight-root.clientHeight);
  const top=Math.max(0,Math.min(max,desired));
  root.scrollTo({top,behavior:'auto'});
}

export function installNavigationScrollIntegrityR313(){
  if(installed||typeof window==='undefined')return;
  installed=true;

  const nativeWindowScrollTo=window.scrollTo;
  const nativeElementScrollTo=HTMLElement.prototype.scrollTo;
  const nativeScrollIntoView=Element.prototype.scrollIntoView;

  window.scrollTo=((...args:ScrollArgs)=>{
    if(suppressLegacyReset&&isLegacyTopReset(args))return;
    return (nativeWindowScrollTo as any).apply(window,args);
  }) as typeof window.scrollTo;

  HTMLElement.prototype.scrollTo=(function(this:HTMLElement,...args:ScrollArgs){
    if(suppressLegacyReset&&isLegacyTopReset(args)&&this.classList.contains('workstation-main'))return;
    return (nativeElementScrollTo as any).apply(this,args);
  }) as typeof HTMLElement.prototype.scrollTo;

  Element.prototype.scrollIntoView=(function(this:Element,arg?:IntoViewArg){
    (nativeScrollIntoView as any).call(this,arg);
    // Native instant/auto settlement is synchronous. If accumulated containment still
    // leaves the target wholly outside the viewport, settle the declared root scroller.
    // Smooth calls retain native animation semantics and are never force-completed here.
    const smooth=typeof arg==='object'&&arg!==null&&arg.behavior==='smooth';
    if(!smooth)settleElementIntoDocumentViewport(this);
  }) as typeof Element.prototype.scrollIntoView;

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
