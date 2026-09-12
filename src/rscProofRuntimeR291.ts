export type RscOperator='Parent'|'Interaction'|'Scar'|'Constraint'|'Continuity'|'Compression'|'Skin'|'Interpretation'|'Behavior'|'Translation'|'Reduction'|'Forecast';
export type RscGate='STAY'|'TURN'|'ESCALATE'|'REJECT';
export type RscEvidenceState='MODEL_DERIVED'|'EXTERNAL_OBSERVED'|'MIXED';
export type RscNode={id:string;role:string;kind?:string};
export type RscEdge={from:string;to:string;relation:string;directed?:boolean};
export type RscSkin={id:string;domain:string;label:string;nodes:RscNode[];edges:RscEdge[];context?:Record<string,unknown>;evidenceState?:RscEvidenceState};
export type RscReducedGraph={skinId:string;domain:string;nodeRoles:string[];edgeSignatures:string[];sourceNodeCount:number;sourceEdgeCount:number};
export type RscComparison={left:string;right:string;nodeSimilarity:number;edgeSimilarity:number;continuity:number;scarCarry:number;constraintCarry:number;interpretationDrift:number;threshold:number;equivalent:boolean;gate:RscGate;counterexamples:string[];truthBoundary:string};
export type RscTranslation={admitted:boolean;from:string;to:string;continuity:number;mapping:Record<string,string>;reason:string};
export type RscInferenceTrace={rule:string;premise:string;conclusion:string;passed:boolean}[];

export const RSC_TRUTH_BOUNDARY='RSC output is symbolic/model-derived structural analysis. It is not external scientific proof, physical-law authority, measurement authority or medical authority. It is not evidence that one law governs unrelated domains.';
export const RSC_EQUIVALENCE_THRESHOLD=.70;

export const RSC_AXIOMS_R291=[
 {id:'A1',name:'Continuity precedes identity',expression:'Ω ≺ Identity',test:'Does graph persist after names/imagery are removed?'},
 {id:'A2',name:'Interaction produces scar',expression:'X(P,E) → Σ',test:'Is interaction irreversible/history-bearing?'},
 {id:'A3',name:'Scar becomes constraint',expression:'Σ → C',test:'Does prior interaction restrict later choices?'},
 {id:'A4',name:'Interpretation changes faster than continuity',expression:'ΔI > ΔΩ',test:'Can meaning drift while graph roles persist?'},
 {id:'A5',name:'Skin is continuity under inherited constraints',expression:'S=f(Ω,Σ,E)',test:'Can the same structure embody differently?'},
 {id:'A6',name:'Behavior is skin-relative',expression:'B=I(S(Ω,Σ))',test:'Is behavior interpreted only with skin/context?'},
 {id:'A7',name:'Mortality forces compression',expression:'M↑ ⇒ κ↑',test:'Does transmission loss favor compressed packages?'},
 {id:'A8',name:'Proof requires reduction',expression:'Valid ⇒ ρ(Sa)≅ρ(Sb)',test:'Was graph comparison performed before equivalence?'}
] as const;

export const RSC_INFERENCE_RULES_R291=[
 ['R1','X(P,E) is irreversible','X(P,E) ⊢ Σ'],['R2','R ⊢ Σ','R ⊢ C'],['R3','R ⊢ C and C is transmissible','R ⊢ Ω'],['R4','R ⊢ Ω and medium exists','R ⊢ S'],['R5','R ⊢ S and context=k','R ⊢ Ik(S)'],['R6','R ⊢ Ik(S)','R ⊢ B'],['R7','R ⊢ B and B creates successor','R ⊢ Pn+1'],['R8','ρ(Sa)=Ga and ρ(Sb)=Gb','Sa≡ΩSb iff Ga≅Gb'],['R9','Sa≡ΩSb','Sa→τSb'],['R10','CΩ<θ','Sa≢ΩSb']
] as const;

const norm=(x:string)=>String(x||'').trim().toLowerCase().replace(/\s+/g,' ');
const uniq=(xs:string[])=>[...new Set(xs.filter(Boolean))].sort();
const jaccard=(a:string[],b:string[])=>{const A=new Set(a),B=new Set(b),u=new Set([...A,...B]);if(!u.size)return 1;let i=0;for(const x of A)if(B.has(x))i++;return i/u.size};
const role=(n:RscNode)=>norm(n.role||n.kind||n.id);
const edgeSignature=(e:RscEdge,nodes:Map<string,RscNode>)=>{const a=role(nodes.get(e.from)||{id:e.from,role:e.from}),b=role(nodes.get(e.to)||{id:e.to,role:e.to}),r=norm(e.relation);return e.directed===false?[a,b].sort().join(`~${r}~`):`${a}>${r}>${b}`};

export function reduceRscSkinR291(skin:RscSkin):RscReducedGraph{
 const nodes=new Map(skin.nodes.map(n=>[n.id,n]));
 return{skinId:skin.id,domain:skin.domain,nodeRoles:uniq(skin.nodes.map(role)),edgeSignatures:uniq(skin.edges.map(e=>edgeSignature(e,nodes))),sourceNodeCount:skin.nodes.length,sourceEdgeCount:skin.edges.length};
}

function carryScore(graph:RscReducedGraph,token:string){const t=norm(token);const all=[...graph.nodeRoles,...graph.edgeSignatures];return all.length?all.filter(x=>x.includes(t)).length/all.length:0}
export function compareRscGraphsR291(a:RscReducedGraph,b:RscReducedGraph,threshold=RSC_EQUIVALENCE_THRESHOLD):RscComparison{
 const nodeSimilarity=jaccard(a.nodeRoles,b.nodeRoles),edgeSimilarity=jaccard(a.edgeSignatures,b.edgeSignatures);
 const continuity=.4*nodeSimilarity+.6*edgeSimilarity;
 const scarCarry=(carryScore(a,'scar')+carryScore(b,'scar'))/2;
 const constraintCarry=(carryScore(a,'constraint')+carryScore(b,'constraint'))/2;
 const interpretationDrift=Math.max(0,1-continuity);
 const counterexamples:string[]=[];
 if(nodeSimilarity<.5)counterexamples.push('node-role overlap below 0.5');
 if(edgeSimilarity<.5)counterexamples.push('relational-edge overlap below 0.5');
 if(a.sourceNodeCount===0||b.sourceNodeCount===0)counterexamples.push('empty source graph');
 const equivalent=continuity>=threshold&&counterexamples.length===0;
 const gate:RscGate=equivalent?(continuity>=.86?'STAY':'TURN'):(continuity>=.5?'ESCALATE':'REJECT');
 return{left:a.skinId,right:b.skinId,nodeSimilarity,edgeSimilarity,continuity,scarCarry,constraintCarry,interpretationDrift,threshold,equivalent,gate,counterexamples,truthBoundary:RSC_TRUTH_BOUNDARY};
}

export function compareRscSkinsR291(a:RscSkin,b:RscSkin,threshold=RSC_EQUIVALENCE_THRESHOLD){return compareRscGraphsR291(reduceRscSkinR291(a),reduceRscSkinR291(b),threshold)}

export function translateRscR291(a:RscSkin,b:RscSkin,comparison=compareRscSkinsR291(a,b)):RscTranslation{
 if(!comparison.equivalent)return{admitted:false,from:a.id,to:b.id,continuity:comparison.continuity,mapping:{},reason:`Translation denied: CΩ=${comparison.continuity.toFixed(3)} is not an admitted structural equivalence.`};
 const left=reduceRscSkinR291(a).nodeRoles,right=new Set(reduceRscSkinR291(b).nodeRoles),mapping:Record<string,string>={};
 for(const x of left)if(right.has(x))mapping[x]=x;
 return{admitted:true,from:a.id,to:b.id,continuity:comparison.continuity,mapping,reason:'Translation admitted only across graph roles preserved by reduction.'};
}

export function inferRscR291(a:RscSkin,b:RscSkin):RscInferenceTrace{
 const c=compareRscSkinsR291(a,b),t=translateRscR291(a,b,c);
 return RSC_INFERENCE_RULES_R291.map(([rule,premise,conclusion])=>({rule,premise,conclusion,passed:rule==='R8'?c.equivalent:rule==='R9'?t.admitted:rule==='R10'?!c.equivalent:true}));
}

export function rscNullBaselineR291(skin:RscSkin){const g=reduceRscSkinR291(skin);const relational=Math.min(1,(g.edgeSignatures.length+1)/(g.nodeRoles.length+g.edgeSignatures.length+1));const unordered=g.nodeRoles.length?1/g.nodeRoles.length:0;return{relationalCompression:relational,unorderedBaseline:unordered,advantage:relational-unordered,truthBoundary:RSC_TRUTH_BOUNDARY}}

export function proveRscPairR291(a:RscSkin,b:RscSkin){const left=reduceRscSkinR291(a),right=reduceRscSkinR291(b),comparison=compareRscGraphsR291(left,right),translation=translateRscR291(a,b,comparison);return{schema:'OMEGA_RSC_PROOF_R291',left,right,comparison,translation,inference:inferRscR291(a,b),baseline:{left:rscNullBaselineR291(a),right:rscNullBaselineR291(b)},axioms:RSC_AXIOMS_R291.map(x=>x.id),truthBoundary:RSC_TRUTH_BOUNDARY}}
