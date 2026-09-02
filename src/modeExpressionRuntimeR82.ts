export type ModeExpressionFamilyR82='COHERENCE'|'FORECAST'|'PRUNE'|'RELATIVITY'|'FLOW'|'MEMORY'|'PROOF'|'TOPOLOGY'|'COMPRESSION'|'TRAVERSAL'|'RECURSION'|'GOVERNANCE'|'SCALE'|'LIGHT'|'GENERIC';
export type ModeExpressionR82={id:string;name:string;family:ModeExpressionFamilyR82;signature:string;motion:string;accent:string;secondary:string;intensity:number;executed:boolean;gated:boolean;metadataOnly:boolean;detail:string;boundary:string};

const family=(text:string):ModeExpressionFamilyR82=>{
 const t=text.toLowerCase();
 if(/forecast|future|plasticity|predict/.test(t))return'FORECAST';
 if(/prune|contradiction|reject|burden reduction/.test(t))return'PRUNE';
 if(/relativ|observer|frame|doppler|phase/.test(t))return'RELATIVITY';
 if(/water|flow|conduct|current|fluid/.test(t))return'FLOW';
 if(/scar|memory|carry|history|continuity ledger/.test(t))return'MEMORY';
 if(/proof|evidence|verify|admiss|truth/.test(t))return'PROOF';
 if(/topolog|graph|relation|network|junction/.test(t))return'TOPOLOGY';
 if(/compress|burden|density|compact/.test(t))return'COMPRESSION';
 if(/travers|route|guidance|path|motion/.test(t))return'TRAVERSAL';
 if(/recurr|recursive|mode188|188|loop|infinity/.test(t))return'RECURSION';
 if(/govern|canon|gate|authority|law/.test(t))return'GOVERNANCE';
 if(/scale|host|shell|hierarch|domain/.test(t))return'SCALE';
 if(/light|wave|amplitude|interference/.test(t))return'LIGHT';
 if(/coher|unified|omega|integration|closure/.test(t))return'COHERENCE';
 return'GENERIC';
};
const PALETTE:Record<ModeExpressionFamilyR82,[string,string,string,string]>={
 COHERENCE:['#68d5bf','#d9b768','concentric closure','phase-synchronized breathing'],
 FORECAST:['#8fb4d8','#d9b768','forward branching fan','branch expansion / contraction'],
 PRUNE:['#d06b73','#8da7b0','cutting planes','inward clipping pulses'],
 RELATIVITY:['#78a8ce','#d9b768','warped dual frames','counter-rotating reference shift'],
 FLOW:['#5fcbbd','#b8ddd5','streamlines','continuous advective drift'],
 MEMORY:['#c58a78','#6ebfae','persistent scar ribbons','long-tail trail retention'],
 PROOF:['#d9b768','#dfe9e5','verification lattice','evidence-gated illumination'],
 TOPOLOGY:['#8eb5aa','#d9b768','relational graph','neighbor tension oscillation'],
 COMPRESSION:['#b08c69','#d27a71','nested compression shells','radial squeeze / release'],
 TRAVERSAL:['#71c7b5','#d9b768','route spine','directed forward transport'],
 RECURSION:['#a892c4','#70c8b6','recursive orbit','nested return cycle'],
 GOVERNANCE:['#d9b768','#8fa7a2','gated radial sectors','threshold opening / closing'],
 SCALE:['#7ca8a0','#d9b768','nested scale frames','depth stepping'],
 LIGHT:['#e2e6d9','#84b9b0','interference field','wave phase propagation'],
 GENERIC:['#83afa8','#d9b768','metadata fingerprint field','deterministic semantic pulse']
};
const sat=(v:number)=>{const a=Math.abs(Number(v)||0);return a/(1+a)};
export function compileModeExpressionR82(catalogRow:any,executionRow:any,record:any):ModeExpressionR82{
 const row=catalogRow||executionRow||{},id=String(row.id||executionRow?.id||'MODE'),name=String(row.name||executionRow?.name||'Mode');
 const text=[name,row.category,row.operator,row.algebra,row.calculus,row.purpose,row.dimensionFrame,row.notes,executionRow?.detail,executionRow?.formula].filter(Boolean).join(' ');
 const f=family(text),p=PALETTE[f],numeric=typeof executionRow?.value==='number'&&Number.isFinite(executionRow.value);
 const executed=Boolean(executionRow&&executionRow.state!=='GATED_MISSING_INPUTS'),gated=Boolean(executionRow?.state==='GATED_MISSING_INPUTS'),metadataOnly=!executionRow;
 const base=numeric ? .3+.7*sat(executionRow.value) : executed ? .7 : gated ? .36 : .5;
 const statePulse=.08*(Number(record?.metrics?.plasticity)||0)+.06*(Number(record?.metrics?.continuity)||0);
 return{id,name,family:f,signature:p[2],motion:p[3],accent:p[0],secondary:p[1],intensity:Math.max(.24,Math.min(1,base+statePulse)),executed,gated,metadataOnly,detail:`${f} expression · ${p[2]} · ${p[3]}`,boundary:metadataOnly?'Visual expression is derived only from catalog metadata. No missing formula is treated as executed.':gated?'Formula is visually identified but remains execution-gated because authoritative inputs are missing.':'Visual intensity may use this source-backed mode output; geometry remains representational and does not create evidence.'};
}
