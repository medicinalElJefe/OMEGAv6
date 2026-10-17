/** R602 historical Seven-Star authority registry.
 * Evidence is typed. The registry DOES NOT claim workbook formulas execute in production.
 * This is a recovery gate, not a substitute physics engine or seven-channel toy.
 */
export type RecoveryEvidence='SOURCE_CONTENT_INSPECTED'|'ARCHIVE_INDEX_ONLY'|'REPOSITORY_CONTRACT'|'RUNTIME_EXECUTION_PROVEN';
export type SevenStarOperator={sector:1|2|3|4|5|6|7;color:string;hex:string;operator:string;matterAnalogy:string;truth:'SYMBOLIC_MAPPING'};
export const HISTORICAL_SEVEN_STAR_OPERATORS:readonly SevenStarOperator[]=[
{sector:1,color:'Purple',hex:'#7D2DFF',operator:'Alpha / Potential',matterAnalogy:'Pre-field / Informational Potential',truth:'SYMBOLIC_MAPPING'},
{sector:2,color:'Red',hex:'#FF2A1F',operator:'011 Construct',matterAnalogy:'Plasma / Ionized / Fire',truth:'SYMBOLIC_MAPPING'},
{sector:3,color:'Orange',hex:'#FF8A00',operator:'Adaptive Flow',matterAnalogy:'Liquid / Molten',truth:'SYMBOLIC_MAPPING'},
{sector:4,color:'Yellow',hex:'#FFD400',operator:'Carrier Field',matterAnalogy:'Gas / Atmosphere / Light field',truth:'SYMBOLIC_MAPPING'},
{sector:5,color:'Green',hex:'#39D353',operator:'Omega Integration',matterAnalogy:'Living Solid / Bio-order',truth:'SYMBOLIC_MAPPING'},
{sector:6,color:'Blue',hex:'#00A3FF',operator:'01-1 Prune / Refine',matterAnalogy:'Crystal / Ordered Solid',truth:'SYMBOLIC_MAPPING'},
{sector:7,color:'Cyan',hex:'#00E5FF',operator:'Release / Return',matterAnalogy:'Dissolved / Recycled / Subtle',truth:'SYMBOLIC_MAPPING'}
] as const;
export const SEVEN_STAR_HISTORICAL_SOURCES=[
{id:'TIME_MANDALA_WORKBOOK',name:'Time_Mandala_of_Matter_20736D_Excel_Engine.xlsx',evidence:'SOURCE_CONTENT_INSPECTED',capabilities:['20736 address index','seven named operators','live time rotation','Mode 188 dispatch dashboard'],execution:'UNVERIFIED'},
{id:'TIME_MANDALA_GENERATOR',name:'create_time_mandala_engine.py',evidence:'SOURCE_CONTENT_INSPECTED',capabilities:['workbook formula generation','controls and modular sector calculation'],execution:'UNVERIFIED'},
{id:'TIME_MANDALA_MOTION',name:'time_mandala_20736D_full_sequenced_motion.svg',evidence:'SOURCE_CONTENT_INSPECTED',capabilities:['sequenced animation','symmetry/asymmetry field','atlas representation'],execution:'UNVERIFIED'},
{id:'MODE188_RUNTIME',name:'Mode188_Unified_Runtime_20736D_SYNCED.xlsx',evidence:'REPOSITORY_CONTRACT',capabilities:['20736 state atlas','Mode 188 decisions','graph/coupling source references'],execution:'UNVERIFIED',driveFileId:'1Q9hKgW6R7jxzDFnGoaj0BokJAHixp5OU'},
{id:'COUPLING_EDGES',name:'coupling_edges.csv',evidence:'ARCHIVE_INDEX_ONLY',capabilities:['historical coupling edges'],execution:'UNVERIFIED'},
{id:'SIMPLEX_PROJECTION',name:'simplex_projection.csv',evidence:'ARCHIVE_INDEX_ONLY',capabilities:['historical projection coordinates'],execution:'UNVERIFIED'},
{id:'STATE_COORDINATES',name:'state_coordinates.csv',evidence:'ARCHIVE_INDEX_ONLY',capabilities:['historical state coordinates'],execution:'UNVERIFIED'}
] as const;
export const HISTORICAL_ATLAS_SIZE=12**4;
export const HISTORICAL_SEVEN_SECTOR_ADDRESS_COUNT=7*HISTORICAL_ATLAS_SIZE;
export function historicalAddressDigits(address:number):[number,number,number,number]{
 if(!Number.isInteger(address)||address<0||address>=HISTORICAL_ATLAS_SIZE)throw Error('invalid historical address');
 return [Math.floor(address/1728),Math.floor(address/144)%12,Math.floor(address/12)%12,address%12];
}
export function historicalAddressFromDigits(digits:readonly number[]):number{
 if(digits.length!==4||digits.some(v=>!Number.isInteger(v)||v<0||v>=12))throw Error('invalid historical digits');
 return ((digits[0]*12+digits[1])*12+digits[2])*12+digits[3];
}
export function historicalLiveSector(secondsSinceMidnight:number):number{
 if(!Number.isFinite(secondsSinceMidnight)||secondsSinceMidnight<0||secondsSinceMidnight>=86400)throw Error('invalid clock seconds');
 return Math.floor(secondsSinceMidnight/(86400/7))+1;
}
export function historicalActiveStar(baseStar:number,sectorOffset:number):number{
 if(!Number.isInteger(baseStar)||baseStar<1||baseStar>7||!Number.isInteger(sectorOffset)||sectorOffset<1||sectorOffset>7)throw Error('invalid star sector');
 return ((baseStar+sectorOffset-2)%7)+1;
}
export const SEVEN_STAR_RECOVERY_GATE={
sourceFormulaReplay:'REQUIRED',historicalVisualParity:'REQUIRED',runtimeStateAuthority:'REQUIRED',candidateCI:'REQUIRED',deployedBrowserProof:'REQUIRED',physicalClaims:'MEASUREMENT_REQUIRED',status:'NOT_ADMITTED'
} as const;
