export type OmegaLens='UNIFIED'|'WATER'|'LIGHT'|'SCAR'|'RELATIVITY'|'FORECAST'|'PROOF'|'TOPOLOGY';
export type LensInput={C:number;Phi:number;q:number;Lambda:number;scar:number;evidence:number;rsc:number;geometry:number;motion:number;symmetry:number;forecast:number;route:number;gate:number;drive:number;velocity:number;acceleration:number};
export type LensDescriptor={name:OmegaLens;family:string;equation:string;meaning:string;render:string;boundary:string};
const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const gm=(...xs:number[])=>Math.pow(xs.reduce((a,b)=>a*Math.max(1e-8,clamp(b)),1),1/Math.max(1,xs.length));
const mean=(...xs:number[])=>xs.reduce((a,b)=>a+clamp(b),0)/Math.max(1,xs.length);
export const LENS_CALCULUS:Record<OmegaLens,LensDescriptor>={
UNIFIED:{name:'UNIFIED',family:'Dewey + RSC common kernel',equation:'GM(CΩ, Φ, 1−q, 1−Λ, E, RSC, G, gate)',meaning:'Balances continuity, future capacity, contradiction/burden, evidence, relational skin and geometry.',render:'overall saliency + density',boundary:'Internal model coherence; not empirical certainty.'},
WATER:{name:'WATER',family:'Water geometry / conductance',equation:'CΩ·Φ·RSC·routeAffinity / (1+Λ+q+Σ)',meaning:'Continuity redistributes through lower-resistance paths while scar and unresolved burden impede conductance.',render:'flow channels + basin brightness',boundary:'Computational conductance metaphor unless externally measured.'},
LIGHT:{name:'LIGHT',family:'Evidence-light projection',equation:'E·√(G·Sym)·(0.55+0.45CΩ)/(1+q)',meaning:'Highlights evidence-supported coherent geometry rather than simply brightening every high-continuity node.',render:'emissive evidence + geometric clarity',boundary:'Light is a render/evidence lens, not a photometric observation.'},
SCAR:{name:'SCAR',family:'Scar / irreversible carry',equation:'Σ·(0.35+0.35q+0.30Λ)·(1+|a|)',meaning:'Persistent strain is amplified by contradiction, burden and changes in motion curvature.',render:'memory ridges + persistent texture',boundary:'Scar is model memory unless tied to verified observation.'},
RELATIVITY:{name:'RELATIVITY',family:'Motion relativity',equation:'mean(M, |Δx|, |v|, |a|, CΩ, Φ)',meaning:'Uses source-route motion, velocity and acceleration rather than static state color alone.',render:'directional motion + curvature emphasis',boundary:'Route derivatives are computational dynamics, not measured physical time.'},
FORECAST:{name:'FORECAST',family:'Future plasticity / counterfactual',equation:'Φ·F·E·gate/(1+q+Λ) + positive route velocity',meaning:'Weights lawful future capacity, model forecast score, evidence and route direction while penalizing contradiction and burden.',render:'future corridor intensity + branching',boundary:'Model-derived hypothesis; no future observation is implied.'},
PROOF:{name:'PROOF',family:'Triangulation / proof gate',equation:'GM(E,1−q,1−Λ,RSC,G,gate)',meaning:'Requires evidence, low contradiction/burden, relational consistency and geometry to survive together.',render:'proof-admissible structure',boundary:'Build/model proof remains distinct from external scientific validation.'},
TOPOLOGY:{name:'TOPOLOGY',family:'Shell / relational topology',equation:'GM(RSC,G,Sym,CΩ,1−q)·(0.65+0.35 adjacency)',meaning:'Emphasizes structural relation, shell geometry, symmetry and coherent adjacency.',render:'connections + shell structure',boundary:'Topology is the runtime relation graph, not an assertion of physical dimensionality.'}
};
export function computeLensScore(lens:OmegaLens,x:LensInput){const C=clamp(x.C),P=clamp(x.Phi),q=clamp(x.q),L=clamp(x.Lambda),s=clamp(x.scar),e=clamp(x.evidence),r=clamp(x.rsc),g=clamp(x.geometry),m=clamp(x.motion),sym=clamp(x.symmetry),F=clamp(x.forecast),route=clamp(x.route),gate=clamp(x.gate),drive=clamp(x.drive),v=clamp(Math.abs(x.velocity)*4),a=clamp(Math.abs(x.acceleration)*8),adj=1-route;
if(lens==='WATER')return clamp((C*P*(.55+.45*r)*(.55+.45*adj))/(1+L+q+s));
if(lens==='LIGHT')return clamp((e*Math.sqrt(Math.max(1e-8,g*sym))*(.55+.45*C))/(1+q));
if(lens==='SCAR')return clamp(s*(.35+.35*q+.30*L)*(1+.35*a));
if(lens==='RELATIVITY')return mean(m,drive,v,a,C,P);
if(lens==='FORECAST')return clamp((P*F*(.5+.5*e)*(.5+.5*gate))/(1+q+L)+.18*Math.max(0,x.velocity));
if(lens==='PROOF')return gm(e,1-q,1-L,r,g,gate);
if(lens==='TOPOLOGY')return clamp(gm(r,g,sym,C,1-q)*(.65+.35*adj));
return gm(C,P,1-q,1-L,e,r,g,gate);
}
