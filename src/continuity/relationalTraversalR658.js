// R658: typed relational traversal over admitted directed edges, independent of address-grid layout.
import {normalizeState,normalizeEdge} from './wovenFieldR651.js';
import {sha256R654} from './provenFrameR654.js';
export function traverseRelationalFieldR658({nodes,edges,startId,steps=[]}={}){
 if(!Array.isArray(nodes)||!nodes.length||nodes.length>20736||!Array.isArray(edges)||!Array.isArray(steps)||steps.length>4096)throw Error('bounded relational graph required');
 const states=nodes.map(normalizeState),ids=new Set(states.map(x=>x.id));if(ids.size!==states.length)throw Error('duplicate id');
 const links=edges.map(e=>normalizeEdge(e,ids));if(!ids.has(startId))throw Error('unknown startId');
 const byId=new Map(states.map(s=>[s.id,s]));let current=startId;
 const path=[{id:current,kind:'ORIGIN',state:byId.get(current)}],evidence=[];
 for(const [i,step] of steps.entries()){
  if(!step||typeof step!=='object'||!ids.has(step.to))throw Error('invalid destination');
  if(step.kind===undefined)throw Error('explicit relation kind required');
  const candidates=links.filter(e=>e.from===current&&e.to===step.to&&e.kind!=='BLOCKED'&&e.weight>0&&(step.kind===undefined||e.kind===step.kind));
  if(candidates.length!==1)throw Error(candidates.length?'ambiguous relational transition':'unadmitted relational transition');
  const edge=candidates[0];evidence.push({step:i,from:current,to:step.to,kind:edge.kind,weight:edge.weight});current=step.to;
  path.push({id:current,kind:edge.kind,state:byId.get(current)});
 }
 const record={schema:'OMEGA_TYPED_RELATIONAL_TRAVERSAL_R658',truthClass:'LOCAL_GRAPH_EXECUTION_NOT_EMPIRICAL_PHYSICS',startId,finalId:current,sourceGraphSha256:sha256R654({states,links}),path,evidence,rule:'only explicit directed admitted typed edges; blocked edges never traversable'};
 return {...record,traversalSha256:sha256R654(record)};
}
