/** R773: bounded, exact query over the R772 reconstructed 24-column Canon source.
 * Computational source search only. No empirical claim, remote query, or CanonState write.
 */
import {reconstructCanonFullRowR772,R772_ORIGINAL_SOURCE_PROOF,R772_FULL_SOURCE_HEADERS} from './canonFullSourceR772.js';
import {R763_AXES,R763_STRIDES} from './canonNavigationR763.js';

export const R773_QUERY_LOCAL_KEY='omega.r773.canonSourceQuery.v1';
export const R773_QUERY_SCHEMA='OMEGA_R773_CANON_SOURCE_QUERY_V1';
const DECISIONS=['ANY','STAY','TURN','ESCALATE'];
const integer=(v,min,max,name)=>{
 if(!Number.isSafeInteger(v)||v<min||v>max)throw new RangeError(name+' requires exact integer '+min+'..'+max);
 return v;
};
function normalizedQuery(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('query object required');
 if(Object.keys(input).some(k=>!['coordinates','decision','offset','limit'].includes(k)))throw new RangeError('unknown query field');
 const {coordinates,decision='ANY',offset=0,limit=12}=input;
 if(!Array.isArray(coordinates)||coordinates.length!==5)throw new RangeError('five ordinal axes required');
 const axes=coordinates.map((v,i)=>v===null?null:integer(v,1,12,R763_AXES[i]));
 if(axes.every(v=>v===null))throw new RangeError('fix at least one Canon axis to bound source scanning');
 if(!DECISIONS.includes(decision))throw new RangeError('unsupported decision');
 integer(offset,0,248832,'offset');integer(limit,1,24,'limit');
 return {coordinates:axes,decision,offset,limit};
}
export function queryCanonSourceR773(input){
 const query=normalizedQuery(input);
 const choices=query.coordinates.map(v=>v===null?Array.from({length:12},(_,i)=>i+1):[v]);
 let examined=0,total=0;const rows=[];
 function visit(axis,index){
  if(axis<5){
   for(const v of choices[axis])visit(axis+1,index+(v-1)*R763_STRIDES[axis]);
   return;
  }
  examined++;
  const row=reconstructCanonFullRowR772(index);
  if(query.decision!=='ANY'&&row.Decision!==query.decision)return;
  if(total>=query.offset&&rows.length<query.limit)rows.push(row);
  total++;
 }
 visit(0,1);
 return {schema:R773_QUERY_SCHEMA,query,examined,total,rows,
  hasMore:query.offset+rows.length<total,
  sourceWorkbookSha256:R772_ORIGINAL_SOURCE_PROOF.workbookSha256,
  sourceRows:R772_ORIGINAL_SOURCE_PROOF.rows,
  sourceColumns:R772_ORIGINAL_SOURCE_PROOF.columns,
  canonicalMutation:false,empiricalAuthority:false,deviceAction:false};
}
export function verifyCanonSourceQueryR773(raw){
 if(typeof raw!=='string'||raw.length>128000)throw new RangeError('bounded JSON text required');
 let supplied;
 try{supplied=JSON.parse(raw);}catch{throw new Error('invalid query JSON');}
 if(!supplied||supplied.schema!==R773_QUERY_SCHEMA)throw new Error('unsupported query snapshot');
 const expected=queryCanonSourceR773(supplied.query);
 if(JSON.stringify(supplied)!==JSON.stringify(expected))throw new Error('query snapshot differs from independent source recomputation');
 return expected;
}

/** R783: export every matched original-source row, not merely the current UI page.
 * One axis must be fixed: at most 20,736 reconstructed rows. Entirely local,
 * source-derived and deterministic; this does not mutate CanonState.
 */
export function exportCanonSourceCsvR783(input){
 const query=normalizedQuery(input);
 const choices=query.coordinates.map(v=>v===null?Array.from({length:12},(_,i)=>i+1):[v]);
 const expectedCount=queryCanonSourceR773({...query,offset:0,limit:1}).total;
 const csvCell=value=>{
  const valueText=String(value??'');
  // The source is reconstructed, not user-imported. Refuse spreadsheet formulas
  // if upstream source fields ever change rather than exporting executable cells.
  if(typeof value==='string'&&/^[=+@\\-\\t\\r]/.test(valueText))throw new Error('unsafe source field for CSV');
  return '"'+valueText.replaceAll('"','""')+'"';
 };
 const lines=[R772_FULL_SOURCE_HEADERS.map(csvCell).join(',')];
 let matched=0,examined=0;
 function visit(axis,index){
  if(axis<5){for(const v of choices[axis])visit(axis+1,index+(v-1)*R763_STRIDES[axis]);return;}
  examined++;
  const row=reconstructCanonFullRowR772(index);
  if(query.decision!=='ANY'&&row.Decision!==query.decision)return;
  lines.push(R772_FULL_SOURCE_HEADERS.map(h=>csvCell(row[h])).join(','));
  matched++;
 }
 visit(0,1);
 if(matched!==expectedCount||examined>20736||matched>20736)throw new Error('Canon source CSV total or bound mismatch');
 return {schema:'OMEGA_R783_CANON_SOURCE_CSV_V1',
  query:{coordinates:query.coordinates,decision:query.decision},
  rows:matched,examined,columns:R772_FULL_SOURCE_HEADERS.length,
  sourceWorkbookSha256:R772_ORIGINAL_SOURCE_PROOF.workbookSha256,
  csv:'\\ufeff'+lines.join('\\r\\n')+'\\r\\n',
  canonicalMutation:false,empiricalAuthority:false,deviceAction:false};
}

export function parseCanonSourceQueryR773(raw){
 if(typeof raw!=='string'||raw.length>2048)throw new RangeError('bounded query text required');
 let value;
 try{value=JSON.parse(raw);}catch{throw new Error('invalid query JSON');}
 return normalizedQuery(value);
}
