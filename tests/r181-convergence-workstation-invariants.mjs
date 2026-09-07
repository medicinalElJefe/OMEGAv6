import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const workstation=read('src/R181ConvergenceWorkstation.tsx');
const css=read('src/r181ConvergenceWorkstation.css');
const suite=read('src/OmegaSpecialistSuite.tsx');
const retainedCss=read('src/r181RetainedTools.css');
const gateway=read('src/calibration/calibrationGatewayR181.js');
const worker=read('src/workerR8.js');
const core=read('src/calibration/continuousCalibrationFusionR181.js');
const autonomic=read('src/swarm/swarmAutonomicR125.js');

for(const token of [
 'CORRELATED CONVERGENCE WORKSTATION','CALIBRATION MATRIX','R125 TOPOLOGY FABRIC','LINEAGE INSPECTOR','NEXT MEASUREMENT QUEUE','SAR → CALIBRATION INLET','COMPUTE / EXECUTION RECEIPTS',
 "'/api/calibration/r181/state'","'/api/calibration/r181/packets?limit=512'","'/api/swarm/autonomic/status'","'/api/system/convergence'","'/api/hybrid/status'","'/api/federation/run/status'","'/api/execution/runs'",
 "'/api/calibration/r181/plan'","'/api/calibration/r181/mission'","confirmCalibratedMission:true","'/api/calibration/r181/recompute'","'/api/calibration/r181/ingest'",
 'packetSha256','proofRefs','independentSourceCount','evidenceWeakness','weightedStdDev','rawWeight','effectiveWeight','latestObservedAt','calibration?.planningHints?.weakestMetrics'
])must(workstation.includes(token),`R181 workstation missing ${token}`);

must(workstation.includes('Array.from({length:144}'),'topology must render the actual 12×12 branch fabric');
must(workstation.includes('Array.from({length:12}'),'selected branch must expose the 12 regulation cells without rendering all 1,728 cells');
must(workstation.includes("data-active={count>0?'true':'false'}"),'branch energy must come from returned plan branch counts');
must(workstation.includes("selectedCells.find((x:any)=>Number(x?.address?.regulation)===reg)"),'cell strip must be populated from returned R125 cell addresses');
must(!/recharts|chart\.js|plotly|highcharts/i.test(workstation),'R181 workstation must not regress into a generic chart dashboard');
for(const forbidden of ['DEMO_DATA','MOCK_DATA','FAKE_LIVE','SYNTHETIC_STATUS'])must(!workstation.includes(forbidden),`workstation contains forbidden fabricated display source ${forbidden}`);

for(const token of ['grid-template-columns:minmax(390px,.92fr) minmax(500px,1.2fr) minmax(330px,.76fr)','font-variant-numeric:tabular-nums','contain:layout paint','content-visibility:auto','grid-template-columns:repeat(12','@media(max-width:760px)'])must(css.includes(token),`R181 workstation performance/responsive CSS missing ${token}`);

must(suite.includes("if(panel==='Convergence')return <div className='r181-convergence-surface'><R181ConvergenceWorkstation"),'Convergence must open R181 workstation as the primary instrument');
must(suite.includes("useState<RetainedTool>('NONE')"),'retained heavy convergence tools must default to unmounted');
for(const token of ['CALCULUS','RESTORATION','MAXIMUM','REFLEX','AUTONOMIC','ORGANISM','SWARM','FIELD','CAPABILITY'])must(suite.includes(`id:'${token}'`),`retained convergence access missing ${token}`);
must(suite.includes("{body&&<div className='r181-retained-body'>{body}</div>}"),'only the explicitly selected retained tool may mount');
must(retainedCss.includes('grid-template-columns:repeat(9'),'retained desktop tool dock missing');

for(const token of [
 "url.pathname==='/api/calibration/r181/mission'",'R181_EXPLICIT_CALIBRATED_MISSION_CONFIRMATION_REQUIRED','confirmCalibratedMission','await bridgeAuthorized(request,env)',
 "https://autonomic.internal/missions",'calibrationPlanInput(current.state,input)','R181_EVIDENCE_WEIGHTED_ESTIMATE_NOT_CANON','automaticFullEscalation:false','R147 device dispatch'
])must(gateway.includes(token),`R181 calibrated mission gateway missing ${token}`);
must(worker.includes("import {calibrationGatewayR181} from './calibration/calibrationGatewayR181.js'"),'R181 gateway must stay on the inherited workerR8 spine');
must(worker.includes('const calibration=await calibrationGatewayR181(request,env,url);if(calibration)return calibration;'),'R181 gateway must execute before inherited R8 fallback');
must(core.includes('SAME_SOURCE_WEIGHT_DIVIDED_BY_SQRT_PACKET_COUNT'),'correlation-aware fusion must remain present');
must(autonomic.includes("export const AUTONOMIC_REVISION='R125'"),'R181 may not replace R125 autonomic authority');
must(autonomic.includes("authority:'AUTONOMIC_RESULT_FABRIC_NOT_CANON'"),'R125 mission output must remain non-Canon');

console.log('OMEGA R181 CONVERGENCE WORKSTATION PASS · real fused metric matrix + packet proof lineage + 12×12 R125 topology + bounded selected-cell detail + authenticated calibrated mission + demand-loaded retained tools + no generic hypothesis chart dashboard');
