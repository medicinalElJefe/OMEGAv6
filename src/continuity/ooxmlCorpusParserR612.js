// R612: bounded extraction of coordinate rows from actual Office Open XML workbook bytes.
// The parser binds an exact sheet, header names and observed cell values; never infers absent digits.
import {unzipSync} from 'fflate';
import {createHash} from 'node:crypto';
import {ingestHistoricalCoordinatesR611} from './historicalCoordinateIntakeR611.js';
import {CORPUS_AXES_R610} from './corpusAddressR610.js';
const utf8=bytes=>new TextDecoder('utf-8',{fatal:true}).decode(bytes);
const entity=s=>s.replace(/&#(x[0-9a-f]+|[0-9]+);|&(amp|lt|gt|quot|apos);/gi,(_,numeric,named)=>numeric?String.fromCodePoint(numeric[0].toLowerCase()==='x'?parseInt(numeric.slice(1),16):parseInt(numeric,10)):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[named]));
const attr=(xml,name)=>{const m=xml.match(new RegExp('(?:^|\\s)'+name+'="([^"]*)"'));return m?entity(m[1]):null};
const strings=x=>[...x.matchAll(/<(?:[\w.-]+:)?si(?:\s[^>]*)?>([\s\S]*?)<\/(?:[\w.-]+:)?si>/g)].map(m=>[...m[1].matchAll(/<(?:[\w.-]+:)?t(?:\s[^>]*)?>([\s\S]*?)<\/(?:[\w.-]+:)?t>/g)].map(x=>entity(x[1])).join(''));
const column=letters=>{let n=0;for(const c of letters)n=n*26+c.charCodeAt(0)-64;return n-1};
export function parseHistoricalWorkbookR612({sourceBytes,claimedSha256,sheet='619D_Addressing',familyId='atlas-state'}={}){
 if(!(sourceBytes instanceof Uint8Array)||sourceBytes.byteLength<64||sourceBytes.byteLength>20_000_000)throw Error('bounded XLSX bytes required');
 if(typeof claimedSha256!=='string'||createHash('sha256').update(sourceBytes).digest('hex')!==claimedSha256)throw Error('workbook fingerprint mismatch');
 const zip=unzipSync(sourceBytes,{filter:f=>f.originalSize<=4_000_000&&!f.name.includes('..')});
 const file=(name)=>zip[name]?utf8(zip[name]):'';
 const book=file('xl/workbook.xml'),rels=file('xl/_rels/workbook.xml.rels');
 if(!book||!rels)throw Error('not an OOXML workbook');
 const descriptor=[...book.matchAll(/<(?:[\w.-]+:)?sheet\b([^>]*?)\/?\s*>/g)].map(m=>({name:attr(m[1],'name'),rel:attr(m[1],'r:id')})).find(x=>x.name===sheet);
 if(!descriptor||!descriptor.rel)throw Error('named sheet not found');
 const relation=[...rels.matchAll(/<(?:[\w.-]+:)?Relationship\b([^>]*?)\/?\s*>/g)].map(m=>({id:attr(m[1],'Id'),target:attr(m[1],'Target'),type:attr(m[1],'Type')})).find(x=>x.id===descriptor.rel);
 if(!relation||!relation.target||!relation.type?.endsWith('/worksheet')||relation.target.includes('..'))throw Error('unsafe sheet relationship');
 const path=relation.target.startsWith('/')?relation.target.slice(1):'xl/'+relation.target.replace(/^\.\//,'');
 const xml=file(path),shared=strings(file('xl/sharedStrings.xml'));
 if(!xml)throw Error('worksheet unavailable or oversized');
 const rows=[...xml.matchAll(/<(?:[\w.-]+:)?row\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?row>/g)].slice(0,4100).map(match=>{
  const values=[];for(const c of match[1].matchAll(/<(?:[\w.-]+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:[\w.-]+:)?c>)/g)){
   const ref=attr(c[1],'r');if(!ref)continue;
   const col=ref.match(/^([A-Z]+)[0-9]+$/)?.[1];if(!col)continue;
   const t=attr(c[1],'t'),raw=c[2]||'',v=raw.match(/<(?:[\w.-]+:)?v(?:\s[^>]*)?>([\s\S]*?)<\/(?:[\w.-]+:)?v>/)?.[1];
   const inline=raw.match(/<(?:[\w.-]+:)?is(?:\s[^>]*)?>([\s\S]*?)<\/(?:[\w.-]+:)?is>/)?.[1];
   const value=t==='s'?(v===undefined?null:shared[Number(v)]):t==='inlineStr'?([...(inline||'').matchAll(/<(?:[\w.-]+:)?t(?:\s[^>]*)?>([\s\S]*?)<\/(?:[\w.-]+:)?t>/g)].map(x=>entity(x[1])).join('')):v===undefined?null:entity(v);
   values[column(col)]=value;
  }return values;
 });
 const head=rows.findIndex(row=>CORPUS_AXES_R610.every(axis=>row.includes(axis)));
 if(head<0)throw Error('ten axis header not found');
 const indices=CORPUS_AXES_R610.map(axis=>rows[head].indexOf(axis)),parsed=[],engineeringRecords=[];
 const extraHeaders=['Address','Decoded Check','Band Start','Band End','Band Size','Build Interpretation','Module','Gate','Notes'];
 const metaIndices=extraHeaders.map(name=>rows[head].indexOf(name));
 for(const row of rows.slice(head+1)){if(parsed.length>=4096)throw Error('too many coordinate rows');if(indices.every(i=>row[i]==null||row[i]===''))continue;
  const digits=indices.map(i=>{const raw=row[i];if(!/^(?:[0-9]|1[01])$/.test(String(raw??'')))throw Error('noncanonical axis digit');return Number(raw)});
  const address=digits.reduce((n,x)=>n*12+x,0);
  const declared=metaIndices[0]<0?null:row[metaIndices[0]];
  if(declared!=null&&declared!==''&&(!/^\d+$/.test(String(declared))||Number(declared)!==address))throw Error('source address differs from decoded coordinate');
  const decoded=metaIndices[1]<0?null:row[metaIndices[1]];
  if(decoded!=null&&decoded!==''&&String(decoded)!==digits.join('|'))throw Error('source decoded-check mismatch');
  const metadata=Object.fromEntries(extraHeaders.map((name,i)=>[name,metaIndices[i]<0?null:row[metaIndices[i]]??null]));
  engineeringRecords.push({rowIndex:head+parsed.length+2,address,digits:[...digits],metadata,truthClass:'VERIFIED_WORKSHEET_CELL_CONTENT_NOT_EXECUTOR'});
  parsed.push({familyId,digits});
 }
 if(!parsed.length)throw Error('no coordinate records');
 const intake=ingestHistoricalCoordinatesR611({sourceBytes,claimedSha256,sourceName:'SHA256:'+claimedSha256,sheet,rows:parsed});
 return {...intake,engineeringRecords,parsedBy:'R612_OOXML_EXACT_HEADER',rowMappingProof:'SOURCE_WORKSHEET_CELLS',sheetName:sheet};
}
