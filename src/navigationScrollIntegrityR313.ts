/* R313.12 — route-transition scroll settlement.
   Presentation/interaction integrity only. This owns no route, execution, proof,
   persistence, Canon, source, Hybrid, Earth, dispatch, or deployment authority.

   OmegaWorkstationFullV2 historically schedules a smooth reset of both the active
   workstation and the window after each omega-capability-change. That animation can
   remain in flight after the destination surface has mounted and race the user's first
   scroll/focus/pointer action. The exhaustive R286 traversal exposed the race on the
   Command Center prompt: focused inspection could reach the controls, while immediate
   post-navigation traversal could be pulled back toward the top by the older smooth
   reset. Settle the same two scroll owners synchronously on the second animation frame,
   after the legacy reset has been scheduled, so no transition animation can continue to
   override destination-surface interaction. Capability routing itself remains unchanged. */

let installed=false;
let transition=0;

export function installNavigationScrollIntegrityR313(){
  if(installed||typeof window==='undefined')return;
  installed=true;
  window.addEventListener('omega-capability-change',()=>{
    const token=++transition;
    window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>{
      if(token!==transition)return;
      const main=document.querySelector<HTMLElement>('.workstation-main');
      main?.scrollTo({top:0,left:0,behavior:'auto'});
      window.scrollTo({top:0,left:0,behavior:'auto'});
    }));
  });
}
