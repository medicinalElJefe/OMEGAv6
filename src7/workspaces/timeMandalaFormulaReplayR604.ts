/** R604 exact, independent TypeScript replay of formulas extracted from original
 * Time_Mandala_of_Matter_20736D_Excel_Engine.xlsx (Drive 1L4yQ8einYFoUsbNniz_JI0tNnt-ngKD6).
 * Controls B4:B8; Engine_20736D J:V. Index semantics are model-space.
 */
import {historicalAddressDigits,HISTORICAL_SEVEN_STAR_OPERATORS,TIME_MANDALA_AXES_R603} from './sevenStarHistoricalAuthorityR602.ts';
export type HistoricalWorkbookFrame={address:number;indices:readonly[number,number,number,number];baseStar:number;liveSector:number;activeStar:number;activeColor:string;operator:string;matterAnalogy:string;alphaOmegaRole:string;thetaCenter:number;localBlendWeight:number;mode188Gate:'TURN'|'PRUNE'|'INTEGRATE'|'STAY';truthRank:'EXACT_INDEX + SYMBOLIC_MAPPING';deweyDispatch:'01-1'|'OMEGA'|'188-TURN'|'011/STAY'};
export function workbookClockR604(seconds:number){
 if(!Number.isFinite(seconds)||seconds<0||seconds>=86400)throw Error('clock must be seconds since midnight in [0,86400)');
 const theta=2*Math.PI*seconds/86400,sectorSize=2*Math.PI/7;
 return{seconds,theta,sectorSize,liveSector:Math.floor(seconds/(86400/7))+1,phaseProgress:(seconds%(86400/7))/(86400/7)};
}
export function replayWorkbookFrameR604(address:number,seconds:number):HistoricalWorkbookFrame{
 const digits=historicalAddressDigits(address),indices=digits.map(d=>d+1) as [number,number,number,number];
 const clock=workbookClockR604(seconds);
 // Original Excel J2 = MOD(B2+D2+F2+H2-4,7)+1.
 const baseStar=((indices.reduce((a,b)=>a+b,0)-4)%7)+1;
 // Original Excel M2 = MOD(J2+L2-2,7)+1.
 const activeStar=((baseStar+clock.liveSector-2)%7)+1;
 const star=HISTORICAL_SEVEN_STAR_OPERATORS[activeStar-1];
 const regulation=TIME_MANDALA_AXES_R603.regulation[digits[2]];
 // Original Excel T2 nested IF priority is TURN > PRUNE > INTEGRATE > STAY.
 const mode188Gate=regulation==='Overloaded'||regulation==='Collapsing'?'TURN':regulation==='Locked'||regulation==='Constrained'?'PRUNE':regulation==='Healing'||regulation==='Rebuilding'||regulation==='Transcending'?'INTEGRATE':'STAY';
 const deweyDispatch=mode188Gate==='PRUNE'?'01-1':mode188Gate==='INTEGRATE'?'OMEGA':mode188Gate==='TURN'?'188-TURN':'011/STAY';
 const thetaCenter=(activeStar-1)*clock.sectorSize;
 return{address,indices,baseStar,liveSector:clock.liveSector,activeStar,activeColor:star.color,operator:star.operator,matterAnalogy:star.matterAnalogy,alphaOmegaRole:star.color==='Purple'?'Alpha asymmetry':star.color==='Red'?'Symmetry breaking':star.color==='Orange'?'Motion shaping':star.color==='Yellow'?'Neutral substrate':star.color==='Green'?'Living balance':star.color==='Blue'?'Discipline / order':'Renewal bridge',thetaCenter,localBlendWeight:Math.max(0,Math.cos(clock.theta-thetaCenter)),mode188Gate,truthRank:'EXACT_INDEX + SYMBOLIC_MAPPING',deweyDispatch};
}
export function workbookDistributionR604(seconds:number){
 const counts=new Array<number>(7).fill(0);
 for(let i=0;i<20736;i++)counts[replayWorkbookFrameR604(i,seconds).activeStar-1]++;
 return counts;
}
