// R823: reconstruct the original v21 typed RH graph from exact user-selected
// workbook bytes. No source bytes are bundled, fetched by Cloudflare, persisted,
// or sent to a server. This is a browser-local executor, not original SQLite.
export const R823_ORIGINAL_WORKBOOK_SHA256='1daa73b90ab07453141056e74db1a5488232ef871eef83033f1aa0f5d45631a5';
export const R823_ORIGINAL_WORKBOOK_BYTES=2150619;
export const R823_ORIGINAL_ARCHIVE_SHA256='e2493bfee552322adf29a79a80a86d3a46aba84a4ccde01aa56b7e4e9c518c8c';

type Cell=string|number|boolean;
export type R823Concept={
 id:string;name:string;tag:string;cluster:string;
 d:number;p:number;r:number;l:number;row:number;anti:number
};
export type R823Edge={
 id:string;from:string;to:string;kind:'antipode_state'|'prereq';
 weight:number;fromRow:number;toRow:number
};
export type R823Graph={
 revision:'R823';truthClass:'ORIGINAL_WORKBOOK_SHA_MATCHED_BROWSER_PARSED';
 sourceWorkbookSha256:string;historicalArchiveSha256:string;
 concepts:readonly R823Concept[];edges:readonly R823Edge[];
 uniqueSourceAddresses:number;maxConceptsAtAddress:number
};

function integer(value:Cell|undefined,label:string):number{
 if(typeof value==='boolean'||value===undefined||value===null)throw Error('R823 '+label+' invalid');
 const text=String(value);
 if(!/^\d+$/.test(text))throw Error('R823 '+label+' must be an integer');
 const n=Number(text);
 if(!Number.isSafeInteger(n))throw Error('R823 '+label+' outside safe integer range');
 return n;
}
function text(value:Cell|undefined):string{return typeof value==='string'?value:''}
function header(row:Cell[],names:readonly string[],label:string){
 if(!Array.isArray(row)||names.some((n,i)=>row[i]!==n))throw Error('R823 '+label+' source header mismatch');
}
export function auditRHGraphRowsR823(rhRows:Cell[][],edgeRows:Cell[][]){
 if(!Array.isArray(rhRows)||rhRows.length!==321||!Array.isArray(edgeRows)||edgeRows.length!==417)
  throw Error('R823 source graph row count mismatch');
 header(rhRows[0],['NodeID','NodeName','ObjectType','Tag','Cluster','D','P','R','L','RowID_20736','Anti_RowID'],'RH');
 header(edgeRows[0],['EdgeID','FromNodeID','ToNodeID','EdgeType','Weight','Note','FromRowID','ToRowID'],'edges');
 const concepts:R823Concept[]=[],byId=new Map<string,R823Concept>(),addressMultiplicity=new Map<number,number>();
 for(const row of rhRows.slice(1)){
  const id=text(row[0]);if(!/^RH\d{4}$/.test(id)||byId.has(id))throw Error('R823 missing/duplicate conceptual RH identity');
  const d=integer(row[5],id+' D'),p=integer(row[6],id+' P'),r=integer(row[7],id+' R'),l=integer(row[8],id+' L');
  if([d,p,r,l].some(v=>v<1||v>12))throw Error('R823 out-of-domain radix-12 coordinate');
  const address=integer(row[9],id+' source row'),anti=integer(row[10],id+' antipode row');
  if(((((d-1)*12+(p-1))*12+(r-1))*12+l)!==address||anti<1||anti>20736)
   throw Error('R823 historical RH source/antipode address mismatch');
  // RH concepts are NOT unique per state address; source has 320 concepts
  // on 25 address rows. Reject duplicate conceptual IDs, not reused addresses.
  const concept={id,name:text(row[1]),tag:text(row[3]),cluster:text(row[4]),d,p,r,l,row:address,anti};
  concepts.push(concept);byId.set(id,concept);
  addressMultiplicity.set(address,(addressMultiplicity.get(address)||0)+1);
 }
 const edges:R823Edge[]=[],ids=new Set<string>(),triples=new Set<string>();
 const types={antipode_state:0,prereq:0};
 for(const row of edgeRows.slice(1)){
  const id=text(row[0]),from=text(row[1]),to=text(row[2]),kind=text(row[3]);
  if(!/^E\d{5}$/.test(id)||ids.has(id))throw Error('R823 missing/duplicate historical edge identity');
  ids.add(id);
  const src=byId.get(from),dst=byId.get(to);
  if(!src||!dst||(kind!=='antipode_state'&&kind!=='prereq'))throw Error('R823 unknown typed endpoint or edge');
  const key=from+'|'+to+'|'+kind;
  if(triples.has(key))throw Error('R823 duplicate typed conceptual relationship');
  triples.add(key);
  const weight=Number(row[4]),fromRow=integer(row[6],id+' fromRow'),toRow=integer(row[7],id+' toRow');
  if(fromRow!==src.row)throw Error('R823 graph source row mismatch');
  if(kind==='antipode_state'){
   if(from!==to||toRow!==src.anti||weight!==0.2)throw Error('R823 antipode relationship mismatch');
   types.antipode_state++;
  }else{
   if(toRow!==dst.row||weight!==1)throw Error('R823 prerequisite relationship mismatch');
   types.prereq++;
  }
  edges.push({id,from,to,kind,weight,fromRow,toRow});
 }
 if(types.antipode_state!==320||types.prereq!==96)throw Error('R823 historical typed edge counts mismatch');
 if(addressMultiplicity.size!==25||Math.max(...addressMultiplicity.values())!==45)
  throw Error('R823 source conceptual multiplicity mismatch');
 return{concepts,edges,uniqueSourceAddresses:addressMultiplicity.size,maxConceptsAtAddress:45};
}
export async function loadOriginalRHWorkbookR823(bytes:ArrayBuffer):Promise<R823Graph>{
 if(!(bytes instanceof ArrayBuffer)||bytes.byteLength!==R823_ORIGINAL_WORKBOOK_BYTES)
  throw Error('R823 exact original workbook byte count required');
 if(typeof crypto==='undefined'||!crypto.subtle)throw Error('R823 secure SHA-256 origin required');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
 if(hash!==R823_ORIGINAL_WORKBOOK_SHA256)throw Error('R823 original donor workbook fingerprint mismatch');
 // Reuse R153's existing OOXML parser and named-sheet selector; no parallel
 // parsing engine or eager Home/OMEGA7 shell dependency is introduced.
 const {readXlsxLite}=await import('../../src/xlsxLiteR153');
 const rh=readXlsxLite(bytes,321,16,'RH_Index');
 const edge=readXlsxLite(bytes,417,8,'Graph_Edges');
 if(rh.truncated||edge.truncated||rh.sheetName!=='RH_Index'||edge.sheetName!=='Graph_Edges')
  throw Error('R823 original workbook named-sheet extraction incomplete');
 const graph=auditRHGraphRowsR823(rh.rows,edge.rows);
 return{revision:'R823',truthClass:'ORIGINAL_WORKBOOK_SHA_MATCHED_BROWSER_PARSED',
  sourceWorkbookSha256:hash,historicalArchiveSha256:R823_ORIGINAL_ARCHIVE_SHA256,
  concepts:graph.concepts,edges:graph.edges,
  uniqueSourceAddresses:graph.uniqueSourceAddresses,maxConceptsAtAddress:graph.maxConceptsAtAddress};
}
