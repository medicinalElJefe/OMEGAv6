export type DailyBrief={
  id:string;
  kicker:string;
  title:string;
  lesson:string;
  quote:string;
  source:string;
  motif:'continuity'|'orbit'|'water'|'evidence'|'scale'|'relativity'|'scar'|'forecast';
  destination:string;
};

const BRIEFS:DailyBrief[]=[
  {id:'continuity',kicker:'DAILY FIELD NOTE',title:'Continuity is not sameness.',lesson:'A system stays coherent by carrying identity through change, not by preventing change. Compare what persists, what bends, and what must be re-proven.',quote:'Keep the thread. Let the shape move.',source:'OMEGA curated operating lesson',motif:'continuity',destination:'Field'},
  {id:'evidence',kicker:'DAILY FIELD NOTE',title:'Evidence and inference are different layers.',lesson:'Observation may constrain a model without fully determining it. Keep imported evidence, computed state, and forecast claims visibly separated.',quote:'A clean boundary makes a stronger answer.',source:'OMEGA curated operating lesson',motif:'evidence',destination:'Evidence & Proof'},
  {id:'relativity',kicker:'DAILY FIELD NOTE',title:'Motion belongs to a reference frame.',lesson:'A change can look dramatic in one frame and modest in another. Before ranking motion, declare the frame, scale, and invariant being preserved.',quote:'Measure the motion after you name the frame.',source:'OMEGA curated operating lesson',motif:'relativity',destination:'Relativity'},
  {id:'water',kicker:'DAILY FIELD NOTE',title:'Flow follows available conductance.',lesson:'Where resistance rises, flow redistributes. Treat conductance as a relational property of a path, not a magical property of the payload moving through it.',quote:'The path participates in the outcome.',source:'OMEGA curated operating lesson',motif:'water',destination:'Matter Traversal'},
  {id:'scar',kicker:'DAILY FIELD NOTE',title:'History changes the next state.',lesson:'A scar is useful when it records what a system had to absorb, reject, or repair. Good state transitions carry that history without letting it become destiny.',quote:'Remember enough to choose better.',source:'OMEGA curated operating lesson',motif:'scar',destination:'Memory'},
  {id:'scale',kicker:'DAILY FIELD NOTE',title:'Scale changes what can be resolved.',lesson:'Zooming does not create new truth. It changes which relationships become legible. Keep the same packet identity while changing the embodied view.',quote:'Change the lens, not the evidence.',source:'OMEGA curated operating lesson',motif:'scale',destination:'Scale Compiler'},
  {id:'forecast',kicker:'DAILY FIELD NOTE',title:'A forecast is a constrained future, not a memory.',lesson:'Project forward from present evidence and declared assumptions. Never let later observations leak backward into the forecast that supposedly preceded them.',quote:'Predict from now; verify later.',source:'OMEGA curated operating lesson',motif:'forecast',destination:'Forecast'},
  {id:'orbit',kicker:'DAILY FIELD NOTE',title:'Stable systems can still be dynamic.',lesson:'An orbit is organized motion. Stability is often a bounded pattern of change rather than a frozen point.',quote:'Stillness is not the only form of order.',source:'OMEGA curated operating lesson',motif:'orbit',destination:'Extreme Traversal'}
];

export function dailyBrief(date=new Date()):DailyBrief{
  const key=Number(`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`);
  return BRIEFS[key%BRIEFS.length];
}
