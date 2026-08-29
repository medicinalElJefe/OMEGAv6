import {corpusState} from './corpusRuntime';

export const SAI_B059_RELEASE='OMEGA SAI B059';
export const SAI_B059_DB_BYTES=747786240;
export const SAI_B059_EDGE_COUNT=82082;
export const SAI_B059_TRAVERSAL_STEPS=188;
export const SAI_B059_MIN_DOCUMENTS=250000;
export const SAI_B059_DECISIONS=['STAY','TURN','ESCALATE'] as const;
export const SAI_B059_WORKFLOW=['Sense','Normalize','Score','Gate','Act','Ledger'] as const;
export const SAI_B059_BOUNDARY='Deterministic source-grounded intelligence donor; not a demonstrated superintelligence, not a foundation model, and no unseen model weights are claimed loaded in the hosted Worker.';

export type SaiAuthority={name:string;role:string;sha256:string;size:number};
export const SAI_B059_AUTHORITIES:SaiAuthority[]=[
{name:'Dewey_20736D_Relativity_Calculus_Tree_EDGES.csv',role:'tree_edges',sha256:'b6f840f70be0df3db0f2e2fb2b262340c53a3a1c52028278517208eaf7cb18e9',size:27167160},
{name:'Dewey_20736D_Relativity_Calculus_Tree_FULL.csv',role:'tree_nodes',sha256:'05d16936054a21951d6ad7b4ef45c95ef6ab2750167d7f8bed5bed1a238482d4',size:40619932},
{name:'LensMatrix_20736D_FULL_ALL_SKINS.csv',role:'lenses',sha256:'43cb90d8b51c88eb7ba3a04256cb7fd94aa51d2582567da4bdde66a3d88aeb48',size:18073489},
{name:'PSC_20736D_FINISHED_FULL_ATLAS_QR_ALL_DATA_ONLY(1).csv',role:'atlas_merge',sha256:'4ed2e058f015eb4deaf13c4ac9005dfa88ddcce835fed535f8fef86776f1e8a9',size:144298060},
{name:'PSC_20736D_FULL_MASTER_OPERATOR_CHART.csv',role:'operators',sha256:'041e3dfdba261ce266a2de4ea04ef30f3239b181ad8f17398fa287efab6f10bd',size:113637357},
{name:'PSC_20736D_QR_build_questions_LONG.csv',role:'qr_questions',sha256:'6235f322ba89c13bcdaaf2ac1d6d5dc7ce68ef63280e909867f691bb9b8dae33',size:24398609},
{name:'PSC_20736D_QUESTION_RESPONSE_BUILD_103680.csv',role:'qr',sha256:'b2f170456840cb46c00231dbf2323c8f348350f1b9ae183692b36cdd90dc8e61',size:63889656},
{name:'PSC_20736D_REVIEW_CONTINUATION_FULL_OPERATOR_TESTS.csv',role:'tests',sha256:'7a6d64015e1e87bb2bd76c96b7c3d8bdd354485f39d81961771f511305068738',size:48479151},
{name:'PSC_20736D_all_domains_parent_accumulation_autoping.csv',role:'atlas_autoping',sha256:'4ed2e058f015eb4deaf13c4ac9005dfa88ddcce835fed535f8fef86776f1e8a9',size:144298060},
{name:'PSC_NEXT_CARRY_REALIZATION_INDEX_FULL.csv',role:'carry',sha256:'940b90ee479a2d9f2a74bb79af0f5777d4e8ce0785c8707b781f92bd41b6a0d1',size:36901231},
{name:'Violet_Transfiguration_20736D_Full_Proof_Ledger.csv',role:'proof',sha256:'c7a6bdb032fd4e4a9cc03285f8c64043638484fa4746b8fdb9fe6910d602c87d',size:15088700},
{name:'dewey_relational_calculus_20736D_CONTINUED_FULL.csv',role:'calculus',sha256:'d42a1c4f58ac7816f9f0f39818cbc86a5dfd8d464194a123e71f3cc097a284fe',size:42218991},
{name:'full_atlas_20736D_exact_filled_data.xlsx',role:'atlas_workbook',sha256:'6d5baf882d38a343ad2677146db47dec71b8bf9ebf89a4e15f49217c2a70cb64',size:11412281},
{name:'full_overall_canon_12pow5_teal_water_atlas_CORRECTED.xlsx',role:'canon_workbook',sha256:'e1ccb57cdfbc78955dd6e86be110cdb91cb15a0cc78a869b74dca7e4ffa55af3',size:29448070},
{name:'water_geometry_dewey_mode188_20736D_state_space.xlsx',role:'water_mode188',sha256:'96af94e4816dc355ecc90a9e8898caa7fc45aa5495c1219d58f6d0ccc3106d1b',size:6487997}
];

export const SAI_B059_DONOR_SELFTEST=[
{name:'database_integrity',donor:'PASS',hosted:'NOT_LOADED',requirement:'SQLite integrity_check = ok'},
{name:'all_sources',donor:'PASS',hosted:'MANIFEST_BOUND',requirement:'all 15 source authorities PASS'},
{name:'documents',donor:'PASS',hosted:'NOT_LOADED',requirement:`documents >= ${SAI_B059_MIN_DOCUMENTS}`},
{name:'edges',donor:'PASS',hosted:'SOURCE_GRAPH_ACTIVE',requirement:`edges = ${SAI_B059_EDGE_COUNT} in B059 compiled donor`},
{name:'grounded_query',donor:'PASS',hosted:'ROUTE_BOUND',requirement:'answer carries source evidence/provenance'},
{name:'ledger_chain',donor:'PASS',hosted:'ACTIVE_BROWSER',requirement:'previous_hash and entry_hash form a verifiable chain'}
] as const;

const clamp=(x:number)=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
export type SaiDecision=typeof SAI_B059_DECISIONS[number];
export function saiKernel(record:any){const C=clamp(record?.metrics?.continuity),Phi=clamp(record?.metrics?.plasticity),q=clamp(record?.metrics?.contradiction),L=clamp(record?.metrics?.burden),S=(C*Phi)/(q+L+1e-9);const decision:SaiDecision=S>=.72?'STAY':S>=.34?'TURN':'ESCALATE';return{continuity:C,plasticity:Phi,contradiction:q,burden:L,stability:S,decision};}

export function saiRoleOrder(query:string){const q=query.toLowerCase();if(/proof|evidence|verify|test|true|correct/.test(q))return ['proof','tests','operators','calculus','qr','lenses','carry','atlas_merge','tree_nodes'];if(/forecast|future|next|predict|trajectory/.test(q))return ['calculus','lenses','operators','qr','tests','proof','carry','atlas_merge','tree_nodes'];return ['qr','operators','tests','calculus','carry','proof','lenses','atlas_merge','tree_nodes'];}

export function compileSaiRetrievalPlan(query:string,address:number){const roles=saiRoleOrder(query);const record=corpusState(Math.max(0,Math.min(20735,address)));return{schema:'OMEGA_SAI_B059_HOSTED_RETRIEVAL_PLAN_V1',query:query.trim(),address:record.address,stateId:record.stateId,roles,workflow:SAI_B059_WORKFLOW,kernel:saiKernel(record),sourceAuthorityCount:SAI_B059_AUTHORITIES.length,boundary:SAI_B059_BOUNDARY,execution:'PLAN_ONLY_UNTIL_CORPUS_DB_OR_PROVIDER_BINDING'};}

export function buildSaiTraversal(address:number,steps=SAI_B059_TRAVERSAL_STEPS){let cursor=Math.max(0,Math.min(20735,Math.floor(address))),out:number[]=[];for(let i=0;i<Math.max(1,Math.min(188,steps));i++){const r=corpusState(cursor);out.push(r.stateId);const next=Number(r?.autoPing?.dataNext);cursor=Number.isFinite(next)?Math.max(0,Math.min(20735,Math.floor(next))):((cursor+1)%20736)}return out;}

function canonical(value:any):string{if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;return`{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`}
const enc=new TextEncoder();
export async function sha256Hex(text:string){const digest=await crypto.subtle.digest('SHA-256',enc.encode(text));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export type SaiLedgerEntry={timestamp_utc:string;event:string;previous_hash:string;payload:any;entry_hash:string};
const LEDGER_KEY='omega.sai.b059.scarLedger.v1';
export function readSaiLedger():SaiLedgerEntry[]{try{const v=JSON.parse(localStorage.getItem(LEDGER_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
export async function appendSaiLedger(event:string,payload:any){const rows=readSaiLedger(),previous=rows.at(-1)?.entry_hash||'0'.repeat(64),body={timestamp_utc:new Date().toISOString(),event,previous_hash:previous,payload},entry_hash=await sha256Hex(previous+canonical(body));const row:SaiLedgerEntry={...body,entry_hash};localStorage.setItem(LEDGER_KEY,JSON.stringify([...rows,row].slice(-500)));return row;}
export async function verifySaiLedger(rows:SaiLedgerEntry[]){let previous='0'.repeat(64),count=0;for(const row of rows){const body={timestamp_utc:row.timestamp_utc,event:row.event,previous_hash:row.previous_hash,payload:row.payload};const expected=await sha256Hex(previous+canonical(body));if(row.previous_hash!==previous||row.entry_hash!==expected)return{passed:false,entries:count,failure_at:count+1,head:previous};previous=row.entry_hash;count++}return{passed:true,entries:count,head:previous}}

export function saiHostedReceipt(record:any,modeCount:number){const kernel=saiKernel(record);return{schema:'OMEGA_SAI_B059_HOSTED_RECEIPT_V1',release:SAI_B059_RELEASE,stateId:record?.stateId,address:record?.address,modeCount,kernel,authorities:SAI_B059_AUTHORITIES.length,donorDbBytes:SAI_B059_DB_BYTES,donorEdgeCount:SAI_B059_EDGE_COUNT,traversalSteps:SAI_B059_TRAVERSAL_STEPS,workflow:SAI_B059_WORKFLOW,boundary:SAI_B059_BOUNDARY,hostedTruth:{compiledDonorDatabaseLoaded:false,foundationModelLoaded:false,sourceManifestRestored:true,current20736GraphAvailable:true,browserHashLedgerAvailable:true}};}
