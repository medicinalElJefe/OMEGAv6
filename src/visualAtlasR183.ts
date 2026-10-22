import {corpusState,decodeAddress,encodeAddress,evaluateCorpusModes} from './corpusRuntime';
import type {Mandala20736Field} from './mandala20736Runtime';
import type {OrientationFrameR182} from './orientationFrameR182';

export const VISUAL_ATLAS_REVISION='R183' as const;
export type VisualAtlasLensR183='FIELD'|'WEAVE'|'MOTION'|'MODES'|'SCALE'|'PROOF'|'DUALVERSE';
const cl=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const signed=(x:number)=>Math.max(-1,Math.min(1,Number.isFinite(x)?x:0));
const wrap=(x:number)=>{const t=Math.PI*2;return((x+Math.PI)%t+t)%t-Math.PI};

export const R183_SCALE_HORIZONS=[
 {id:'12',count:12,label:'12 · observer/gate axes',role:'primary frame axes'},
 {id:'144',count:144,label:'144 · mode×axis matrix',role:'matrix neighborhood'},
 {id:'1728',count:1728,label:'1,728 · triadic volume',role:'route/manifold volume'},
 {id:'20736',count:20736,label:'20,736 · full lattice',role:'canonical address field'},
 {id:'248832',count:248832,label:'248,832 · render expansion',role:'20,736 source states × 12 declared visual facets'},
 {id:'35831808',count:35831808,label:'35,831,808 · extended context',role:'named atlas context only; not materialized as empirical states'}
] as const;

export const R183_COLOR_LAW={
 substrate:'YELLOW / carrier continuity',construct:'RED / constructive expansion',inverse:'BLUE / inverse return / prune',integration:'GREEN / omega integration',memory:'PURPLE / alpha seed memory',conductance:'TEAL / coherent transmissible carry'
} as const;

export type VisualAtlasPacketR183={
 schema:'OMEGA_VISUAL_ATLAS_PACKET_R183';
 address:number;stateId:number;target:number;targetStateId:number;
 coordinates:{d:number;p:number;r:number;l:number};decision:string;
 channels:{continuity:number;contradiction:number;burden:number;plasticity:number;proof:number;scar:number;stability:number;motion:number;symmetry:number;asymmetry:number;carry:number;gate:number;velocity:number;acceleration:number;phase:number;phaseDelta:number};
 encoding:{radius:number;lineDensity:number;haloCount:number;proofEdge:number;jaggedness:number;compression:number;openSpace:number;scarKnot:number;carrierGlow:number;routeWidth:number;routeOpacity:number};
 deltas:{continuity:number;plasticity:number;contradiction:number;burden:number;scar:number;motion:number;velocity:number;phase:number};
 neighbors:Array<{axis:'D'|'P'|'R'|'L';sign:-1|1;address:number;stateId:number;continuity:number;burden:number;contradiction:number;plasticity:number;decision:string}>;
 route:Array<{step:number;address:number;stateId:number;continuity:number;burden:number;contradiction:number;plasticity:number;proof:number;scar:number;motion:number;velocity:number;acceleration:number;decision:string}>;
 renderExpansion:{facetsPerState:12;fullFieldFacetCount:number;facets:Array<{id:string;label:string;value:number;polarity:'SUPPORT'|'PRESSURE'|'SIGNED';source:string}>;truth:string};
 modeSummary:{count:number;stay:number;turn:number;escalate:number;strongest:{id:string;name:string;score:number;gate:string};weakest:{id:string;name:string;score:number;gate:string}};
 modes:Array<{id:string;name:string;category:string;score:number;gate:string;dimensionFrame:string;purpose:string;operator:string}>;
 orientation:OrientationFrameR182;
 formulas:{decision:string;radius:string;density:string;halo:string;color:string;motion:string};
 boundary:string;
};

function neighborAddresses(a:number){const c=decodeAddress(a);return [
 ['D',1,encodeAddress((c.d+1)%12,c.p,c.r,c.l)],['D',-1,encodeAddress((c.d+11)%12,c.p,c.r,c.l)],
 ['P',1,encodeAddress(c.d,(c.p+1)%12,c.r,c.l)],['P',-1,encodeAddress(c.d,(c.p+11)%12,c.r,c.l)],
 ['R',1,encodeAddress(c.d,c.p,(c.r+1)%12,c.l)],['R',-1,encodeAddress(c.d,c.p,(c.r+11)%12,c.l)],
 ['L',1,encodeAddress(c.d,c.p,c.r,(c.l+1)%12)],['L',-1,encodeAddress(c.d,c.p,c.r,(c.l+11)%12)]
 ] as const}

export function compileVisualAtlasR183(field:Mandala20736Field,address:number,orientation:OrientationFrameR182,routeDepth=24):VisualAtlasPacketR183{
 const a=Math.max(0,Math.min(field.count-1,Math.floor(address))),r=corpusState(a),n=field.routeNext[a]??a,t=corpusState(n),c=r.metrics;
 const continuity=cl(Number(c.continuity)),contradiction=cl(Number(c.contradiction)),burden=cl(Number(c.burden)),plasticity=cl(Number(c.plasticity)),proof=cl(Number(c.evidence)),scar=cl(Number(c.scar)),stability=cl(Number(c.stability)/(1+Math.abs(Number(c.stability)))),motion=cl(Number(r.math.normalizedMotionRelativity)),symmetry=cl(Number(r.geometry.symmetry)),asymmetry=1-symmetry,carry=cl(Number(r.predict.carry)),gate=cl(Number(field.continuityGate[a])),velocity=signed(Number(field.velocity[a])),acceleration=signed(Number(field.acceleration[a])),phase=Number(field.phase[a])||0,phaseDelta=wrap(Number(field.phase[n])-phase);
 const encoding={radius:cl(.18+.58*continuity+.16*carry+.08*stability),lineDensity:cl((40+burden*90+contradiction*120)/250),haloCount:cl((12+plasticity*36+proof*24)/72),proofEdge:proof,jaggedness:cl(.72*contradiction+.28*Math.abs(acceleration)),compression:cl(.68*burden+.22*scar+.10*contradiction),openSpace:cl(.68*plasticity+.20*(1-burden)+.12*proof),scarKnot:cl(.70*scar+.18*burden+.12*contradiction),carrierGlow:cl(.55*continuity+.25*proof+.20*carry),routeWidth:cl(.30+.42*Math.abs(velocity)+.28*motion),routeOpacity:cl(.24+.46*proof+.30*continuity)};
 const d=(k:keyof typeof c)=>Number(t.metrics[k])-Number(c[k]);
 const deltas={continuity:d('continuity'),plasticity:d('plasticity'),contradiction:d('contradiction'),burden:d('burden'),scar:d('scar'),motion:Number(t.math.normalizedMotionRelativity)-motion,velocity:Number(field.velocity[n])-velocity,phase:phaseDelta};
 const neighbors=neighborAddresses(a).map(([axis,sign,address])=>{const q=corpusState(address);return{axis,sign,address,stateId:address+1,continuity:Number(q.metrics.continuity),burden:Number(q.metrics.burden),contradiction:Number(q.metrics.contradiction),plasticity:Number(q.metrics.plasticity),decision:String(q.metrics.decision)}});
 const route=[] as VisualAtlasPacketR183['route'];let cur=a,seen=new Set<number>();for(let step=0;step<Math.max(4,Math.min(64,routeDepth));step++){if(seen.has(cur))break;seen.add(cur);const q=corpusState(cur);route.push({step,address:cur,stateId:cur+1,continuity:Number(q.metrics.continuity),burden:Number(q.metrics.burden),contradiction:Number(q.metrics.contradiction),plasticity:Number(q.metrics.plasticity),proof:Number(q.metrics.evidence),scar:Number(q.metrics.scar),motion:Number(q.math.normalizedMotionRelativity),velocity:Number(field.velocity[cur]),acceleration:Number(field.acceleration[cur]),decision:String(q.metrics.decision)});cur=field.routeNext[cur]??cur}
 const renderFacets=[
  ['CΩ','continuity',continuity,'SUPPORT'],['Φ','plasticity',plasticity,'SUPPORT'],['q','contradiction',contradiction,'PRESSURE'],['Λ','burden',burden,'PRESSURE'],['P','proof',proof,'SUPPORT'],['Scar','scar',scar,'PRESSURE'],['M','motion',motion,'SIGNED'],['Sym','symmetry',symmetry,'SUPPORT'],['Carry','carry',carry,'SUPPORT'],['Gate','continuity gate',gate,'SUPPORT'],['v','velocity',Math.abs(velocity),'SIGNED'],['a','acceleration',Math.abs(acceleration),'SIGNED']
 ] as const;
 const renderExpansion={facetsPerState:12 as const,fullFieldFacetCount:field.count*12,facets:renderFacets.map(([id,label,value,polarity])=>({id,label,value:Number(value),polarity,source:`S${a+1} live packet`})),truth:'248,832 is the full-field render-facet resolution 20,736×12. Facets are declared visual encodings of source-state variables; they are not additional CanonState rows or physical dimensions.'};
 const modeEval=evaluateCorpusModes(r),mapMode=(x:any)=>({id:String(x.id),name:String(x.name),category:String(x.category),score:Number(x.score),gate:String(x.gate),dimensionFrame:String(x.dimensionFrame||''),purpose:String(x.purpose||''),operator:String(x.operator||'')});
 const modes=modeEval.results.map(mapMode),strongest=mapMode(modeEval.strongest),weakest=mapMode(modeEval.weakest),modeSummary={count:modeEval.count,stay:modeEval.stay,turn:modeEval.turn,escalate:modeEval.escalate,strongest:{id:strongest.id,name:strongest.name,score:strongest.score,gate:strongest.gate},weakest:{id:weakest.id,name:weakest.name,score:weakest.score,gate:weakest.gate}};
 return{schema:'OMEGA_VISUAL_ATLAS_PACKET_R183',address:a,stateId:a+1,target:n,targetStateId:n+1,coordinates:decodeAddress(a),decision:String(c.decision),channels:{continuity,contradiction,burden,plasticity,proof,scar,stability,motion,symmetry,asymmetry,carry,gate,velocity,acceleration,phase,phaseDelta},encoding,deltas,neighbors,route,renderExpansion,modeSummary,modes,orientation,formulas:{decision:'S=(CΩ·Φ)/(q+Λ+ε)',radius:'radius = base + CΩ·12 → normalized live field radius',density:'density = 40 + Λ·90 + q·120',halo:'circles = 12 + Φ·36 + Proof·24',color:'CΩ warm/carrier · q jagged · Λ dense · Φ open · Proof bright edge',motion:'route motion = canonical route progress + velocity/acceleration derivatives; never wall-clock drift'},boundary:'R183 recompiles the recovered charting canon into live visual channels. 12→144→1728→20736→248832→35831808 are atlas/render resolution roles, not literal physical dimensions. 248,832 is implemented as 12 declared render facets per 20,736 source state; 35,831,808 remains extended named context and is not fabricated as empirical state data. Geometry, density, halo, scars, modes, dualverse orientation and motion are derived from the bound OMEGA packet and route. External physical claims remain evidence-gated; decorative motion is forbidden.'}
}
