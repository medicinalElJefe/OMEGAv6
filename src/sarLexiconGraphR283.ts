export type LexiconEdgeKindR283='SOURCE_LINK'|'EXTRACTED_FACT'|'OMEGA_DERIVATION';
export interface LexiconNodeR283{id:string;term:string;sourceUrl:string;factPlane:'DIRECT_ARTICLE'|'INDEX_ONLY';entityClass?:string;topicTags:string[];sourceScope:string}
export interface LexiconEdgeR283{from:string;to:string;kind:LexiconEdgeKindR283;predicate:string;evidence?:string}
export interface LexiconGraphR283{nodes:LexiconNodeR283[];edges:LexiconEdgeR283[];manifest:{indexRows:number;uniqueUrls:number;directArticleReviewed:number;source:string}}
export const FE_LEXIKON_MANIFEST_R283={indexRows:2031,uniqueUrls:1949,directArticleReviewed:58,source:'https://www.fe-lexikon.info/index.htm#index'} as const;
export interface FELexiconCsvRowR283{index_seq?:string;source_term:string;source_url:string;source_fact_plane?:string;entity_class?:string;topic_tags?:string;actual_cross_relations?:string;article_review_status?:string;candidate_new_capability?:string;software_module_family?:string}
const id=(term:string,url:string)=>`${term.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}@${url}`;
export function ingestFELexikonRowsR283(rows:FELexiconCsvRowR283[]):LexiconGraphR283{
 const nodes=rows.map(r=>({id:id(r.source_term,r.source_url),term:r.source_term,sourceUrl:r.source_url,factPlane:r.source_fact_plane==='DIRECT_ARTICLE'?'DIRECT_ARTICLE' as const:'INDEX_ONLY' as const,entityClass:r.entity_class,topicTags:String(r.topic_tags||'').split('|').filter(Boolean),sourceScope:r.article_review_status==='DIRECT_PAGE_REVIEW'?'article-reviewed':'index-identity'}));
 const byTerm=new Map(nodes.map(n=>[n.term.trim().toLowerCase(),n.id]));const edges:LexiconEdgeR283[]=[];
 for(const r of rows){const from=id(r.source_term,r.source_url);for(const rel of String(r.actual_cross_relations||'').split('|').map(x=>x.trim()).filter(Boolean)){const to=byTerm.get(rel.toLowerCase());if(to)edges.push({from,to,kind:'EXTRACTED_FACT',predicate:'article-related-term',evidence:r.source_url})}if(r.candidate_new_capability)edges.push({from,to:`omega:${r.candidate_new_capability}`,kind:'OMEGA_DERIVATION',predicate:'candidate-capability'})}
 return{nodes,edges,manifest:{...FE_LEXIKON_MANIFEST_R283}};
}
export function lexiconTruthBoundaryR283(){return'FE-Lexikon source identity/article facts and OMEGA-derived capability edges remain separately typed. INDEX_ONLY nodes cannot be used as article-fact evidence.'}
