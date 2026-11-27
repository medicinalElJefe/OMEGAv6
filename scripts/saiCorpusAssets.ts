import {createHash} from 'node:crypto';
import {initCorpusPack,corpusState,validateCorpusPack} from '../src/corpusRuntime';
import {evaluateSourceBackedModes,sourceBackedModeSummary} from '../src/sourceBackedModeRuntimeR21';

const hash=(value:string)=>createHash('sha256').update(value,'utf8').digest('hex');
export function saiCorpusAssets(){
 return {name:'omega-sai-corpus-assets',apply:'build' as const,async generateBundle(this:any){
  await initCorpusPack();
  const proof=validateCorpusPack();
  if(!proof.passed||proof.stateCount!==20736||proof.modeCount!==179)throw Error('SAI source pack failed its original validation');
  const catalog=evaluateSourceBackedModes(corpusState(0)).map(({id,name,formula,source,inputs})=>({id,name,formula,source,inputs}));
  const regions=[];
  for(let region=0;region<144;region++){
   const rows=[];
   for(let lane=0;lane<144;lane++){
    const address=region*144+lane,r=corpusState(address),summary=sourceBackedModeSummary(r);
    if(r.address!==address||r.stateId!==address+1)throw Error('Source address mismatch');
    const {d,p,r:regulation,l}=r.coordinates;
    const row={address,stateId:r.stateId,coordinates:[d,p,regulation,l],metrics:r.metrics,autoPing:r.autoPing,
     motion:r.math.normalizedMotionRelativity,
     modes:summary.rows.map(x=>[x.id,x.state,x.value,x.missing]),
     mode188:{sratio:summary.mode188Drive?.sratio??null,decision:summary.mode188Drive?.decision??null,packetGate:summary.mode188Drive?.packetGate??null}};
    if(Object.values(row.metrics).some(x=>typeof x==='number'&&!Number.isFinite(x))||!Number.isFinite(row.motion))throw Error('Nonfinite projected source data at '+address);
    rows.push(row);
   }
   const content=JSON.stringify({schema:'OMEGA_SAI_PROJECTED_REGION_V1',region,rows}),file='region-'+String(region).padStart(3,'0')+'.json',bytes=Buffer.byteLength(content,'utf8');
   if(bytes>524288)throw Error('SAI source region exceeded budget');
   this.emitFile({type:'asset',fileName:'omega-sai-source/'+file,source:content});regions.push({region,file,bytes,sha256:hash(content)});
  }
  const manifest={schema:'OMEGA_SAI_PROJECTED_SOURCE_V1',stateCount:20736,regionCount:144,lanesPerRegion:144,catalogCount:179,modeContracts:catalog,sources:proof.sources,coreR2Min:proof.coreR2Min,medianR2:proof.medianR2,boundary:proof.boundary,regions};
  this.emitFile({type:'asset',fileName:'omega-sai-source/manifest.json',source:JSON.stringify(manifest)});
  console.log('SAI projected source assets: 20,736 addresses / 144 SHA-bound regions / '+catalog.length+' existing source-backed mode contracts; not original raw workbook rows.');
 }};
}
