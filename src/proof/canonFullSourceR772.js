/** R772: original-byte-fingerprinted 24-column Canon workbook reconstruction.
 * All 248832 original data rows were checked against an independently recovered
 * user-owned 29448070-byte OOXML file. This does not prove historical program
 * authorship, empirical physics, cross-device authority or CanonState admission.
 * Original private workbook bytes are NOT bundled into this public repository.
 */
import {reconstructCanonIndexR761} from './canonIndexReconstructionR761.js';
import {decodeCanonR763} from './canonNavigationR763.js';
export const R772_ORIGINAL_SOURCE_PROOF=Object.freeze({
 workbookSha256:'e1ccb57cdfbc78955dd6e86be110cdb91cb15a0cc78a869b74dca7e4ffa55af3',
 normalizedNumericSha256:'c5560df0a6967013a46d6eb5c286298b01961329427469568407cc8a6c65eb35',
 normalizedSemanticSha256:'9d9e8acc0cb5670d610c168cddb845e1f7e70366f485f85503746180e762d18e',
 rows:248832,columns:24,numericColumns:9,semanticColumns:15,originalWorkbookBytesBundled:false,
 originalWorkbookByteHashMatchedInIndependentAudit:true,allOriginalRowsCompared:true,
 historicalOriginalGeneratorAuthenticated:false,empiricalPhysicalInterpretationProved:false,
 canonicalMutation:false,deviceActionAuthority:false
});
export const R772_FULL_SOURCE_HEADERS=Object.freeze(["Atlas_Index","Atlas_Key","Domain","State","Relation","Motion","Perspective","Principle_Core","Domain_Skin","Relation_Skin","Motion_Skin","Perspective_Skin","Mirror_Statement","Water_Geometry_Teal","Mode188_Gate","Deep_Mother_Field","High_Father_Field","CΩ_Continuity","q_Contradiction","Λ_Burden","Φ_Future_Plasticity","S_Coherence","Decision","Coherence_Band"]);
const L={"Domain":["Matter","Energy","Information","Memory","Biology","Mind","Society","Economy","Technology","Ecology","Time","Possibility"],"State":["Seed","Emergence","Growth","Expansion","Stability","Saturation","Tension","Fracture","Adaptation","Recovery","Transformation","Renewal"],"Relation":["Attraction","Repulsion","Exchange","Resonance","Competition","Cooperation","Inheritance","Reflection","Translation","Compression","Expansion","Synthesis"],"Motion":["Still","Oscillating","Accelerating","Decelerating","Branching","Converging","Rotating","Traversing","Folding","Unfolding","Recursive","Transcending"],"Perspective":["Observer","Participant","Individual","Family","Team","Community","Civilization","Planet","Species","Historical","Forecast","Unknown"],"Principle":["Origin","Boundary","Flow","Pressure","Memory","Growth","Exchange","Pattern","Fracture","Repair","Integration","Horizon"],"RelationSkin":["bond","push","trade","harmony","contest","alliance","inherit","mirror","language","press","bloom","weave"],"MotionSkin":["rest","pulse","surge","brake","fork","gather","spin","cross","fold","open","loop","ascend"],"PerspectiveSkin":["seen","joined","personal","ancestral","operational","communal","institutional","planetary","evolutionary","temporal","probable","unresolved"],"Water":["Droplet","Ripple","Stream","Current","Tide","Wave","Whirlpool","Vortex","Mist","Rain","River","Ocean"],"DomainSkins":[["atom","crystal","grain","stone","metal","mountain","dust","clay","salt","sand","shell","planet"],["spark","flame","pulse","current","heat","lightning","magnetism","radiance","plasma","charge","wave","sun"],["bit","signal","syntax","message","map","index","protocol","translation","code","model","ledger","oracle"],["scar","archive","echo","story","inheritance","record","trace","dream","name","ritual","history","myth"],["cell","root","leaf","blood","nerve","organ","breath","immune field","seedling","body","species","forest"],["attention","emotion","choice","belief","image","logic","fear","desire","insight","voice","vision","self"],["person","family","team","law","market","school","tribe","city","custom","conflict","treaty","civilization"],["need","labor","value","price","supply","demand","debt","asset","trade","incentive","scarcity","abundance"],["tool","circuit","sensor","machine","network","database","robot","interface","engine","platform","AI","runtime"],["soil","water","wind","insect","tree","riverbed","weather","habitat","food web","season","biome","earth"],["instant","rhythm","cycle","delay","sequence","age","era","return","timeline","forecast","history","continuity"],["option","branch","risk","chance","potential","threshold","unknown","opening","escape","innovation","destiny","miracle"]]};
const SEMANTIC_INDICES=Object.freeze([2,3,4,5,6,7,8,9,10,11,12,13,15,16,23]);
export function reconstructCanonFullRowR772(index){
 const [D,S,R,M,P]=decodeCanonR763(index);
 const n=reconstructCanonIndexR761(D,S,R,M,P);
 const [d,s,r,m,p]=[D-1,S-1,R-1,M-1,P-1];
 const domain=L.Domain[d],state=L.State[s],relation=L.Relation[r],motion=L.Motion[m],perspective=L.Perspective[p];
 const core=L.Principle[(s+r+m+p)%12];
 const ds=L.DomainSkins[d][(s+r+p)%12],rs=L.RelationSkin[r],ms=L.MotionSkin[m],ps=L.PerspectiveSkin[p];
 const water=L.Water[(r+m+p)%12];
 const bands={STAY:'High coherence',TURN:'Adaptive tension',ESCALATE:'Critical pressure'};
 return {
  Atlas_Index:n.index,Atlas_Key:n.key,Domain:domain,State:state,Relation:relation,Motion:motion,Perspective:perspective,
  Principle_Core:core,Domain_Skin:ds,Relation_Skin:rs,Motion_Skin:ms,Perspective_Skin:ps,
  Mirror_Statement:core+' as '+ds+' / '+rs+' / '+ms+' / '+ps,Water_Geometry_Teal:water,Mode188_Gate:n.mode188,
  Deep_Mother_Field:'Contain '+core.toLowerCase()+' through '+water.toLowerCase()+' memory',
  High_Father_Field:'Aim '+motion.toLowerCase()+' via '+relation.toLowerCase()+' boundary',
  'CΩ_Continuity':n.C,'q_Contradiction':n.q,'Λ_Burden':n.lambda,
  'Φ_Future_Plasticity':n.Phi,S_Coherence:n.score,Decision:n.decision,Coherence_Band:bands[n.decision]
 };
}
export function canonFullSourceSemanticVectorR772(index){
 const row=reconstructCanonFullRowR772(index);
 return SEMANTIC_INDICES.map(i=>String(row[R772_FULL_SOURCE_HEADERS[i]]));
}
