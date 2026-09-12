export const RSC_PROOF_SCHEMA_R290='OMEGA_RSC_PROOF_VM_R290';
export const RSC_MODEL_BOUNDARY_R290='SYMBOLIC_MODEL_ONLY_NOT_EXTERNAL_SCIENTIFIC_PROOF';
export const RSC_THRESHOLDS_R290=Object.freeze({PASS:0.70,PING:0.86,WATCH:0.70,REJECT:0.50});

export const RSC_AXIOMS_R290=Object.freeze([
 {id:'A1',name:'Continuity precedes identity',expression:'Ω ≺ Identity',test:'Does graph persist after names/imagery are removed?',failure:'Mistaking surface identity for structure'},
 {id:'A2',name:'Interaction produces scar',expression:'X(P,E) → Σ',test:'Is interaction irreversible/history-bearing?',failure:'Calling reversible contact scar'},
 {id:'A3',name:'Scar becomes constraint',expression:'Σ → C',test:'Does prior interaction restrict later choices?',failure:'Treating memory as constraint without evidence'},
 {id:'A4',name:'Interpretation changes faster than continuity',expression:'ΔI > ΔΩ',test:'Can meaning drift while graph roles persist?',failure:'Claiming one fixed meaning everywhere'},
 {id:'A5',name:'Skin is continuity under inherited constraints',expression:'S=f(Ω,Σ,E)',test:'Can same structure embody differently?',failure:'Treating skin as appearance only'},
 {id:'A6',name:'Behavior is skin-relative',expression:'B=I(S(Ω,Σ))',test:'Can behavior be read only with skin/context?',failure:'Reading behavior as absolute'},
 {id:'A7',name:'Mortality forces compression',expression:'M↑ ⇒ κ↑',test:'Does transmission loss favor symbol/story/ritual?',failure:'Assuming compression preserves full explanation'},
 {id:'A8',name:'Proof requires reduction',expression:'Valid ⇒ ρ(Sa)≅ρ(Sb)',test:'Was graph comparison performed?',failure:'Surface resemblance only'}
]);

export const RSC_OPERATORS_R290=Object.freeze([
 ['𝒫','Parent','Prior state','Next source','Generates local continuity source'],['𝒳','Interaction','Parent + environment','Interaction','Produces irreversible relational contact'],['Σ','Scar','Interaction','Scar','Stores irreversible relational history'],['C','Constraint','Scar','Constraint set','Limits future behavior'],['Ω','Continuity','Scar + constraint + parent','Continuity graph','Extracts transmissible dependency'],['κ','Compression','Continuity + interpretation','Symbolic package','Reduces explanation into durable form'],['𝒮','Skin','Compressed continuity + medium','Skin','Embodies continuity'],['𝓘','Interpretation','Skin + context','Meaning','Maps skin to local meaning'],['𝓑','Behavior','Interpretation + skin','Behavior','Produces observable state output'],['τ','Translation','Skin A + Skin B','Mapping','Preserves graph only after valid equivalence'],['ρ','Reduction','Skin','Reduced graph','Strips surface representation'],['𝓕','Forecast','Roots + gates','Hypothesis ranking','Ranks active continuity roots']
].map(([symbol,name,input,output,rule])=>Object.freeze({symbol,name,input,output,rule})));

export const RSC_INFERENCE_RULES_R290=Object.freeze([
 {id:'R1',premise:'X(P,E) is irreversible',conclusion:'X(P,E) ⊢ Σ',criterion:'Interaction has persistent effect'},
 {id:'R2',premise:'R ⊢ Σ',conclusion:'R ⊢ C',criterion:'Scar constrains later state'},
 {id:'R3',premise:'R ⊢ C and C is transmissible',conclusion:'R ⊢ Ω',criterion:'Constraint survives across boundary'},
 {id:'R4',premise:'R ⊢ Ω and medium exists',conclusion:'R ⊢ S',criterion:'Continuity can be embodied'},
 {id:'R5',premise:'R ⊢ S and context=k',conclusion:'R ⊢ Ik(S)',criterion:'Local interpretation assigned'},
 {id:'R6',premise:'R ⊢ Ik(S)',conclusion:'R ⊢ B',criterion:'Meaning produces behavior'},
 {id:'R7',premise:'R ⊢ B and B creates successor',conclusion:'R ⊢ Pn+1',criterion:'Behavior creates next parent/source'},
 {id:'R8',premise:'ρ(Sa)=Ga and ρ(Sb)=Gb',conclusion:'Sa≡ΩSb iff Ga≅Gb',criterion:'CΩ ≥ θ and counterexamples controlled'},
 {id:'R9',premise:'Sa≡ΩSb',conclusion:'Sa→τSb',criterion:'Continuity preserved'},
 {id:'R10',premise:'CΩ<θ',conclusion:'Sa≢ΩSb',criterion:'Reject below threshold'}
]);

const text=v=>String(v??'').trim();
const uniq=a=>[...new Set(a)].sort();
const stable=value=>{if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));return value};
async function sha256(value){const bytes=new TextEncoder().encode(JSON.stringify(stable(value)));const digest=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function jaccard(a,b){const A=new Set(a),B=new Set(b),u=new Set([...A,...B]);if(!u.size)return 1;let i=0;for(const x of A)if(B.has(x))i++;return i/u.size}
function clamp01(v){return Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0))}

export function reduceRscGraphR290(input={}){
 const nodes=Array.isArray(input.nodes)?input.nodes:[],edges=Array.isArray(input.edges)?input.edges:[];
 const roleById=new Map(nodes.map((n,i)=>[text(n.id)||`n${i}`,text(n.role)||'UNSPECIFIED']));
 const nodeTokens=uniq([...roleById.values()].map(x=>`ROLE:${x}`));
 const edgeTokens=uniq(edges.map(e=>{const from=roleById.get(text(e.from))||text(e.from)||'UNSPECIFIED',to=roleById.get(text(e.to))||text(e.to)||'UNSPECIFIED',relation=text(e.relation)||'RELATES';return`EDGE:${from}→${relation}→${to}`}));
 return{schema:'OMEGA_RSC_REDUCED_GRAPH_R290',sourceId:text(input.id)||'anonymous',nodeTokens,edgeTokens,nodeCount:nodes.length,edgeCount:edges.length,empty:nodeTokens.length===0&&edgeTokens.length===0};
}

export function compareRscGraphsR290(left,right){
 const L=left?.schema==='OMEGA_RSC_REDUCED_GRAPH_R290'?left:reduceRscGraphR290(left),R=right?.schema==='OMEGA_RSC_REDUCED_GRAPH_R290'?right:reduceRscGraphR290(right);
 const nodeScore=jaccard(L.nodeTokens,R.nodeTokens),edgeScore=jaccard(L.edgeTokens,R.edgeTokens),exact=JSON.stringify(L.nodeTokens)===JSON.stringify(R.nodeTokens)&&JSON.stringify(L.edgeTokens)===JSON.stringify(R.edgeTokens);
 // Workbook gives the CΩ gate but not a unique executable graph-similarity formula. This conservative V1 comparator is an OMEGA engineering metric and is explicitly labeled as such.
 const continuityScore=exact?1:clamp01((nodeScore+edgeScore)/2);
 return{metric:'OMEGA_RSC_TOKEN_JACCARD_V1_ENGINEERED_NOT_ARCHIVE_FORMULA',nodeScore,edgeScore,continuityScore,exactStructure:exact,left:L,right:R};
}

export async function proveRscEquivalenceR290(request={}){
 const threshold=clamp01(request.threshold??RSC_THRESHOLDS_R290.PASS),comparison=compareRscGraphsR290(request.left,request.right),counterexamples=Array.isArray(request.counterexamples)?request.counterexamples:[],uncontrolled=counterexamples.filter(x=>x&&x.controlled!==true),trace=['A8','ρ(left)','ρ(right)','R8'];
 let state='UNPROVED',reason='REDUCED_GRAPH_REQUIRED';
 if(!comparison.left.empty&&!comparison.right.empty){
  if(uncontrolled.length){state='UNPROVED';reason='COUNTEREXAMPLE_UNCONTROLLED';trace.push('COUNTEREXAMPLE_HOLD')}
  else if(comparison.continuityScore>=threshold){state='PASS';reason='STRUCTURAL_EQUIVALENCE_GATE_MET';trace.push('R9','τ_ALLOWED')}
  else{state='FAIL';reason='CONTINUITY_BELOW_THRESHOLD';trace.push('R10','τ_DENIED')}
 }
 const result={schema:RSC_PROOF_SCHEMA_R290,boundary:RSC_MODEL_BOUNDARY_R290,evidenceClass:'MODEL_DERIVED_SYMBOLIC',state,reason,threshold,comparison,counterexamples:{total:counterexamples.length,uncontrolled:uncontrolled.length},translationPermitted:state==='PASS',trace,claims:{externalScientificProof:false,physicalLaw:false,canonicalStateMutation:false,translationAuthority:state==='PASS'}};
 return{...result,receiptSha256:await sha256(result)};
}

export function forecastRscGateR290(score){const s=clamp01(score);return s>=RSC_THRESHOLDS_R290.PING?'PING':s>=RSC_THRESHOLDS_R290.WATCH?'WATCH':s<RSC_THRESHOLDS_R290.REJECT?'REJECT':'PRUNE'}
