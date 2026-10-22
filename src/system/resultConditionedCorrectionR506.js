export const R506_RESULT_CONDITIONED_SOURCE_RECONCILIATION='OMEGA_RESULT_CONDITIONED_SOURCE_RECONCILIATION_R506';

const pathText=value=>String(value??'').trim().replace(/\\/g,'/').replace(/^\.\//,'');
const STOP=new Set([
 'const','let','var','return','function','true','false','null','undefined','class','export','import','from','async','await','new',
 'if','else','for','while','switch','case','break','default','throw','try','catch','finally','this','typeof','instanceof',
 'schema','state','stage','source','repair','residual','expected','proofs','current','exact','files','file','path','target',
 'objective','section','item','canonical','admission','production','mutation','decision','selectedAlternative'
]);

const tokens=value=>[...new Set((String(value??'').match(/[A-Za-z_$][A-Za-z0-9_$]{3,}/g)||[])
 .filter(token=>!STOP.has(token)))];

const rejectionReasons=rejection=>Array.isArray(rejection?.reasons)?rejection.reasons.map(String):[];

export function requiresResultConditionedReanchorR506(rejection){
 return rejectionReasons(rejection).some(reason=>/_PREIMAGE_OCCURRENCES_0$/.test(reason));
}

function exactOccurrences(source,exact){
 if(!exact)return 0;
 return source.split(exact).length-1;
}

function anchorWindow(source,at,token){
 let start=source.lastIndexOf('\n',Math.max(0,at-1));start=start<0?0:start+1;
 let end=source.indexOf('\n',at+token.length);end=end<0?source.length:end;
 let exact=source.slice(start,end);
 // Preserve the smallest exact current-source unit. Widen only when the
 // single line is not unique; never consume an adjacent line merely
 // because the target line is short.
 if(exact&&exactOccurrences(source,exact)!==1){
  const next=source.indexOf('\n',Math.min(source.length,end+1));
  if(next>0){end=next;exact=source.slice(start,end)}
 }
 if(exact.length>1500){
  const half=700;
  start=Math.max(0,at-half);
  end=Math.min(source.length,at+token.length+half);
  exact=source.slice(start,end);
 }
 return{start,end,exact};
}

export function buildResultConditionedAnchorSurfaceR506({residual,stage,contextFiles=[],rejection,proposal=null}={}){
 const rejectedText=(Array.isArray(rejection?.proposal?.files)?rejection.proposal.files:[])
  .flatMap(file=>(Array.isArray(file?.replacements)?file.replacements:[]).flatMap(row=>[row?.before,row?.after]))
  .join('\n');
 const correctionText=(Array.isArray(proposal?.files)?proposal.files:[])
  .flatMap(file=>(Array.isArray(file?.replacements)?file.replacements:[]).flatMap(row=>[row?.before,row?.after]))
  .join('\n');
 const semanticText=JSON.stringify({residual,stage});
 const orderedTokens=[...new Set([...tokens(rejectedText),...tokens(correctionText),...tokens(semanticText)])].slice(0,64);
 const files=[];
 for(const [fileIndex,context] of (contextFiles||[]).entries()){
  const source=String(context?.text??'');if(!source)continue;
  const anchors=[];
  for(const token of orderedTokens){
   let from=0;
   while(anchors.length<12){
    const at=source.indexOf(token,from);if(at<0)break;
    const window=anchorWindow(source,at,token);
    if(window.exact&&window.exact.length<=1600&&exactOccurrences(source,window.exact)===1&&!anchors.some(a=>a.exact===window.exact)){
      anchors.push({
       id:`F${fileIndex+1}A${anchors.length+1}`,
       token,
       path:pathText(context.path),
       currentSha:String(context.sha||''),
       start:window.start,
       end:window.end,
       exact:window.exact,
      });
    }
    from=at+token.length;
   }
   if(anchors.length>=12)break;
  }
  if(anchors.length)files.push({path:pathText(context.path),currentSha:String(context.sha||''),anchors});
 }
 return{schema:R506_RESULT_CONDITIONED_SOURCE_RECONCILIATION,files};
}

const normalizedText=value=>String(value??'').replace(/\s+/g,' ').trim();
function trigrams(value){
 const s=normalizedText(value);if(s.length<3)return new Set(s?[s]:[]);
 const out=new Set();for(let i=0;i<=s.length-3;i++)out.add(s.slice(i,i+3));return out;
}
function textSimilarity(a,b){
 const A=trigrams(a),B=trigrams(b);if(!A.size||!B.size)return 0;
 let intersection=0;for(const gram of A)if(B.has(gram))intersection++;
 return intersection/(A.size+B.size-intersection);
}
function scoreAnchor(anchor,semanticTokens,semanticTexts){
 let tokenScore=0;
 const exactTokens=new Set(tokens(anchor.exact));
 for(const token of semanticTokens)if(exactTokens.has(token))tokenScore+=token===anchor.token?4:1;
 const similarity=Math.max(0,...semanticTexts.map(text=>textSimilarity(anchor.exact,text)));
 return tokenScore*1000+Math.round(similarity*999);
}

function chooseAnchor({row,rejectedRow,fileSurface}){
 const explicit=String(row?.anchorId||'').trim();
 if(explicit){
  const anchor=fileSurface?.anchors?.find(a=>a.id===explicit)||null;
  return anchor?{anchor,selection:'EXPLICIT_ANCHOR_ID'}:{anchor:null,selection:'INVALID_EXPLICIT_ANCHOR_ID'};
 }
 const semanticTexts=[rejectedRow?.before,rejectedRow?.after,row?.before,row?.after].map(String).filter(Boolean);
 const semanticTokens=[...new Set(semanticTexts.flatMap(tokens))];
 const ranked=(fileSurface?.anchors||[]).map(anchor=>({anchor,score:scoreAnchor(anchor,semanticTokens,semanticTexts)}))
  .filter(row=>row.score>0)
  .sort((a,b)=>b.score-a.score||a.anchor.id.localeCompare(b.anchor.id));
 if(!ranked.length)return{anchor:null,selection:'NO_TOKEN_MATCH'};
 if(ranked.length>1&&ranked[0].score===ranked[1].score)return{anchor:null,selection:'AMBIGUOUS_TOKEN_MATCH'};
 return{anchor:ranked[0].anchor,selection:'UNIQUE_TOKEN_SCORE'};
}

export function bindResultConditionedCorrectionR506(proposal,{residual,stage,contextFiles=[],rejection}={}){
 if(!requiresResultConditionedReanchorR506(rejection)){
  return{schema:R506_RESULT_CONDITIONED_SOURCE_RECONCILIATION,activated:false,valid:true,reasons:[],proposal,surface:null,bindings:[]};
 }
 const surface=buildResultConditionedAnchorSurfaceR506({residual,stage,contextFiles,rejection,proposal});
 const contexts=new Map((contextFiles||[]).map(file=>[pathText(file.path),file]));
 const rejectedFiles=new Map((Array.isArray(rejection?.proposal?.files)?rejection.proposal.files:[]).map(file=>[pathText(file.path),file]));
 const reasons=[],bindings=[];
 const files=(Array.isArray(proposal?.files)?proposal.files:[]).map((file,fileIndex)=>{
  const path=pathText(file?.path),context=contexts.get(path),fileSurface=surface.files.find(row=>row.path===path);
  if(!context){reasons.push(`R506_FILE_${fileIndex+1}_NOT_IN_CURRENT_CONTEXT`);return file}
  if(!fileSurface?.anchors?.length){reasons.push(`R506_FILE_${fileIndex+1}_NO_EXACT_CURRENT_ANCHORS`);return file}
  const rejectedFile=rejectedFiles.get(path);
  const replacements=(Array.isArray(file?.replacements)?file.replacements:[]).map((row,rowIndex)=>{
   const rejectedRow=Array.isArray(rejectedFile?.replacements)?rejectedFile.replacements[rowIndex]:null;
   const after=String(row?.after??'');
   const suppliedBefore=String(row?.before??'');
   // Existing R461 behavior remains valid: if the correction already
   // copied one exact unique current-source fragment, preserve it and
   // machine-bind only the current SHA. R506 is a consequence channel,
   // not a requirement to replace a correction that is already exact.
   if(suppliedBefore&&exactOccurrences(String(context.text??''),suppliedBefore)===1){
    if(!after||after===suppliedBefore){
     reasons.push(`R506_FILE_${fileIndex+1}_REPLACEMENT_${rowIndex+1}_AFTER_INVALID`);
     return row;
    }
    bindings.push({path,replacement:rowIndex+1,anchorId:null,selection:'EXACT_CURRENT_BEFORE',token:null,currentSha:String(context.sha||'')});
    const {anchorId,...rest}=row||{};
    return{...rest,before:suppliedBefore,after};
   }
   const chosen=chooseAnchor({row,rejectedRow,fileSurface});
   if(!chosen.anchor){
    reasons.push(`R506_FILE_${fileIndex+1}_REPLACEMENT_${rowIndex+1}_${chosen.selection}`);
    return row;
   }
   if(!after||after===chosen.anchor.exact){
    reasons.push(`R506_FILE_${fileIndex+1}_REPLACEMENT_${rowIndex+1}_AFTER_INVALID`);
    return row;
   }
   bindings.push({path,replacement:rowIndex+1,anchorId:chosen.anchor.id,selection:chosen.selection,token:chosen.anchor.token,currentSha:String(context.sha||'')});
   const {anchorId,...rest}=row||{};
   return{...rest,before:chosen.anchor.exact,after};
  });
  return{...file,path,preimageSha:String(context.sha||''),replacements};
 });
 return{
  schema:R506_RESULT_CONDITIONED_SOURCE_RECONCILIATION,
  activated:true,
  valid:reasons.length===0,
  reasons,
  surface,
  bindings,
  proposal:reasons.length?proposal:{...proposal,files},
 };
}

export const R506_RESULT_CHANNEL_LAWS=Object.freeze([
 'REJECTION_RESULT_CHANGES_NEXT_CORRECTION_INPUT',
 'CORRECTION_RESULT_TOKENS_MAY_REANCHOR_TO_EXACT_CURRENT_SOURCE_WHEN_REJECTED_TOKEN_IS_STALE',
 'ZERO_OCCURRENCE_PREIMAGE_REQUIRES_CURRENT_SOURCE_REANCHOR',
 'CURRENT_SOURCE_SHA_IS_MACHINE_BOUND_NOT_MODEL_RECALLED',
 'EXPLICIT_ANCHOR_ID_OR_UNIQUE_TOKEN_MATCH_ONLY',
 'AMBIGUOUS_REANCHOR_FAILS_CLOSED',
 'R314_VALIDATOR_REMAINS_FINAL_PATCH_MEMBRANE',
 'R503_R504_R505_DECISION_CONTINUITY_IS_PRESERVED',
 'NO_CANON_OR_PRODUCTION_AUTHORITY_ADDED',
]);
