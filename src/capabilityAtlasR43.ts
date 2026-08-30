// R43 — capability authority distilled from the user-supplied OMEGA CSV atlases.
// Framework quantities remain model/state-space constructs unless independently established.
// 20,736 is a representation/state-space size, not a claim of physical dimensionality.

export const R43_DATASETS=[
 {id:'WOVEN',rows:478922,columns:57,label:'All Modes Woven Continuity Atlas'},
 {id:'QR',rows:103680,columns:17,label:'PSC 20,736 Question / Response Build'},
 {id:'AUTOPING',rows:20736,columns:35,label:'PSC AutoPing Expanded Build'},
 {id:'CALCULUS',rows:20736,columns:47,label:'Dewey Relational Calculus'},
 {id:'RELATIVITY',rows:20736,columns:119,label:'Dewey Relativity Calculus Tree'},
 {id:'CARRY',rows:20736,columns:30,label:'PSC Next Carry Realization Index'}
] as const;

export const R43_CORE_MODES=[
 {id:1,name:'Full Overall Canon',description:'Master integrative framework; all active mode outputs are interpreted together.'},
 {id:2,name:'Dewey Calculus',description:'Parent-to-next-state process calculus with accumulation, scar, carry, phase, constraint and continuity.'},
 {id:3,name:'Relational Skin Calculus (RSC)',description:'Parent → interaction → scar → continuity → compression → skin → interpretation → behavior.'},
 {id:4,name:'Unified Coherence',description:'Evaluates continuity and coherence across related scales and frames.'},
 {id:5,name:'Deep Mother',description:'Containment, field, capacity, recoverability and nurture weighting.'},
 {id:6,name:'High Father',description:'Structure, law, order, boundary, discipline and direction weighting.'},
 {id:7,name:'No-Nothing Truth',description:'Treat absence as defined or unembodied potential rather than fabricated evidence.'},
 {id:8,name:'Guidance Field',description:'Directional flows, attractors and routing tendencies within the relational field.'},
 {id:9,name:'Full Sphere',description:'Enclosure, totality, containment and boundary treatment.'},
 {id:10,name:'Forecast Mode',description:'Future-plasticity and conditional prediction layer; never certainty.'},
 {id:11,name:'Heavy Prune',description:'Eliminate redundancy, contradiction, unsupported structure and low-value branches.'},
 {id:12,name:'Alpha / Crimson',description:'Initiation, transformation, threshold crossing and state change.'}
] as const;

export const R43_AXES=[
 {id:'AX01',name:'State',symbol:'S',definition:'state space / measurable configuration',formula:'s_t=(x_t,g_t,b_t,c_t,m_t)'},
 {id:'AX02',name:'Relation',symbol:'R',definition:'dependencies and graph edges',formula:'G=(V,E,w), r:S_i→S_j'},
 {id:'AX03',name:'Observer',symbol:'O',definition:'projection from hidden state to measurable output',formula:'y_t=O(s_t), O(S)≠S'},
 {id:'AX04',name:'Memory / Scar',symbol:'M',definition:'retained influence from prior states',formula:'M_t=ΣK(t−τ)s_τ'},
 {id:'AX05',name:'Continuity',symbol:'CΩ',definition:'persistence of coherent structure',formula:'CΩ=1−d(s_t,s_{t+1})'},
 {id:'AX06',name:'Burden',symbol:'Λ',definition:'accumulated maintenance / transition cost',formula:'Λ(s)=Σλ_i c_i(s)'},
 {id:'AX07',name:'Contradiction',symbol:'q',definition:'incompatibility or destructive interference',formula:'q(s)=Σmax(0,−⟨v_i,v_j⟩)'},
 {id:'AX08',name:'Plasticity',symbol:'Φ',definition:'viable future-state openness',formula:'Φ=|{s′:A(s,s′)=1}|/Φ_max'},
 {id:'AX09',name:'Boundary / Skin',symbol:'∂S/σ',definition:'interface rule for what enters, leaves or transforms',formula:'σ:∂S→{accept,reject,transform}'},
 {id:'AX10',name:'Compression',symbol:'κ',definition:'dimension reduction preserving invariants',formula:'κ:S^n→S^k, k<n, ‖I(S)−I(κS)‖<ε'},
 {id:'AX11',name:'Translation',symbol:'T',definition:'representation mapping preserving invariants',formula:'T:A_i→A_j, I(A_i)=I(A_j)'},
 {id:'AX12',name:'Proof / Ledger',symbol:'Π/L',definition:'validation and trace of derivation',formula:'Π(E)=valid iff gates pass; L=(input,ops,metrics,decision,proof)'}
] as const;

export const R43_LAYERS=[
 {id:'L01',name:'Primitive Object Layer',role:'define typed entities',formula:'Objects: S,R,O,M,G,A,∂S,I,L'},
 {id:'L02',name:'Graph Relation Layer',role:'encode relation topology',formula:'G=(V,E,w)'},
 {id:'L03',name:'Metric Field Layer',role:'measure state quality',formula:'CΩ, Λ, q, Φ, proof and stability fields'},
 {id:'L04',name:'Memory Kernel Layer',role:'carry scar / history',formula:'M(t)=∫K(t−τ)S(τ)dτ'},
 {id:'L05',name:'Boundary Skin Layer',role:'admit / reject / transform flow',formula:'σ:∂S→{accept,reject,transform}'},
 {id:'L06',name:'Operator Algebra Layer',role:'compose noncommuting transforms',formula:'C∘T∘P∘C unless mode-specific order overrides'},
 {id:'L07',name:'Atlas Projection Layer',role:'map across 12^k resolutions',formula:'index=1728d+144p+12r+l'},
 {id:'L08',name:'Forecast Dynamics Layer',role:'derive reachable futures',formula:'S(t+1)=F(S,R,M,CΩ,Λ,q,Φ)'},
 {id:'L09',name:'Decision Gate Layer',role:'choose STAY / TURN / ESCALATE',formula:'D=(CΩ·Φ)/(q+Λ+ε)'},
 {id:'L10',name:'Prune Translate Prove Layer',role:'canonical validity workflow',formula:'PRUNE → TRANSLATE → PROVE'},
 {id:'L11',name:'Implementation Layer',role:'make symbolic engine executable',formula:'parser → evaluator → graph store → proof gate → ledger'},
 {id:'L12',name:'Application Layer',role:'bind the model to real domains',formula:'domain input → constrained calculation → evidence-bound output'}
] as const;

export const R43_ROOT_OPERATORS=[
 {name:'Parent',definition:'central organizing root whose change most alters downstream dependencies'},
 {name:'Accumulation',definition:'inverse-parent burden carried into a trunk, hub, basin or core'},
 {name:'Constraint',definition:'boundary or load rule limiting allowable paths, states, rates or forms'},
 {name:'Scar',definition:'persistent deformation, memory, residue or retained graph difference'},
 {name:'Phase',definition:'state transition, bifurcation, switch or structural regime change'},
 {name:'Carry',definition:'inherited continuity transferred from a prior graph/state into the next'},
 {name:'Continuity',definition:'coherence survival across transformation and path persistence through time'},
 {name:'SymmetryAsymmetry',definition:'balanced repetition plus productive deviation'},
 {name:'Flow',definition:'movement of matter, force, information, attention, energy, care or value'},
 {name:'Boundary',definition:'interface where inside/outside or parent/child relations are negotiated'},
 {name:'ScaleRelativity',definition:'operator function changes by local / meso / macro model level'},
 {name:'MotionRelativity',definition:'operator function changes by frame, direction, path and observer position'}
] as const;

export const R43_FUNCTIONS=[
 {name:'LocateRoot',definition:'identify the highest-leverage organizer'},
 {name:'MeasureBurden',definition:'sum downstream supported load / dependency into a carrier'},
 {name:'DetectBoundary',definition:'find the active constraint surface or allowable state envelope'},
 {name:'RecordDeformation',definition:'measure retained structural change from a reference'},
 {name:'DetectTransition',definition:'detect a threshold, regime shift or event boundary'},
 {name:'PreserveInheritance',definition:'measure what survives from state t into state t+1'},
 {name:'TestCoherence',definition:'score whether paths remain connected after disturbance'},
 {name:'CompareSymmetry',definition:'compare repeated order against useful asymmetry'},
 {name:'TrackFlow',definition:'quantify direction, volume, rate or path of transfer'},
 {name:'MapInterface',definition:'map the contact zone where one system changes another'},
 {name:'NormalizeScale',definition:'compare the same operator across model scales'},
 {name:'TransformFrame',definition:'re-read function under reversed direction, observer or motion frame'}
] as const;

export const R43_WORKFLOW=['Input','Parse','Construct','Measure','Prune','Translate','Forecast','Decide','Prove','Ledger','Output'] as const;
export const R43_DECISION_EQUATION='D=(CΩ·Φ)/(q+Λ+ε); D≥τ_high→STAY; τ_low<D<τ_high→TURN; D≤τ_low→ESCALATE';
export const R43_EVOLUTION_EQUATION='S(t+1)=F(S(t),R(t),M(t),CΩ(t),Λ(t),q(t),Φ(t))';
export const R43_TRUTH_BOUNDARY='The uploaded atlases define a user-authored computational framework and derived state-space mappings. Established physics equations retain their ordinary scientific meaning; framework-only quantities are not relabeled as measured physical laws.';

export function r43QuestionSet(domain:string,root:string,fn:string){return[
 `What is the parent/root that organizes ${domain} before ${fn} is applied?`,
 `Where does accumulated burden thicken toward the trunk, hub, basin, core, or carrier in ${domain}?`,
 `What scar or retained deformation changes the future path of ${domain} after stress or transition?`,
 `Which phase gate moves ${domain} from one state-space region to another while preserving carry?`,
 `What prediction would prove ${root}+${fn} explains ${domain} better than a simpler baseline?`
] as const}

export function r43RelativityCoordinates(address:number){
 const a=Math.max(0,Math.min(20735,Math.floor(Number(address)||0))),d=Math.floor(a/1728),p=Math.floor((a%1728)/144),r=Math.floor((a%144)/12),l=a%12;
 const temperatureIndex=d*12+p,wavelengthIndex=r*12+l,ratio=Math.pow(15000/500,1/143),temperatureK=500*Math.pow(ratio,temperatureIndex),wavelengthNm=200+(2500-200)*(wavelengthIndex/143),h=6.62607015e-34,c=299792458,k=1.380649e-23,lambda=wavelengthNm*1e-9,x=h*c/(lambda*k*temperatureK),planckRadiance=(2*h*c*c)/Math.pow(lambda,5)/(Math.exp(Math.min(700,x))-1),wienPeakNm=2.897771955e6/temperatureK,spectralRegion=wavelengthNm<380?'UV':wavelengthNm<=750?'VISIBLE':'IR';
 return{temperatureIndex:temperatureIndex+1,wavelengthIndex:wavelengthIndex+1,temperatureK,wavelengthNm,dimensionlessHcOverLambdaKT:x,planckRadiance,wienPeakNm,spectralRegion}
}
