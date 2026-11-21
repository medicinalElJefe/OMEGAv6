import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync('tests/r560-weather-workspace-browser-e2e.mjs','utf8');
const first=src.indexOf('async function assertWeatherProviderUnavailable('),last=src.indexOf('const browser=await chromium.launch',first);
assert.ok(first>=0&&last>first,'R560 provider-recovery proof extraction anchors must remain valid');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const test=await new AsyncFunction('base','console',src.slice(first,last)+'\nreturn assertWeatherProviderUnavailable;')('https://test.invalid',{log(){}});
const ready={current:{temperatureC:21},target:{lat:32.2226,lon:-110.9747}};
const outage={state:'PROVIDER_UNAVAILABLE',current:null,hourly:[],daily:[],canonicalMutation:false,evidenceHash:'provably-unavailable'};
async function exercise(status,payload,initialState='READY'){
 let clicked=0,snapshots=0,witnessed=0;
 const widget={
  evaluate:async()=>++snapshots===1?{state:initialState,error:initialState==='ERROR'?'OMEGA request failed (502)':'',target:'32.2226°, -110.9747°'}:status===200?{state:'READY',error:'',current:'21.0°',forecastCards:3}:{state:'ERROR',error:'OMEGA request failed (502)',current:'—',forecastCards:0},
  getByRole:()=>({click:async()=>{clicked++}})
 };
 const page={
  waitForResponse:async()=>({status:()=>status,json:async()=>payload}),
  waitForFunction:async(_fn,args)=>{witnessed++;assert.equal(args.state,status===200?'READY':'ERROR')}
 };
 await test(page,widget,'mobile studio');
 assert.equal(clicked,1,'a recovered state must be witnessed by an explicit refresh');
 assert.equal(witnessed,1);
 assert.equal(snapshots,2);
}
await exercise(200,ready);
await exercise(502,outage);
for(const invalid of [{...outage,canonicalMutation:true},{...outage,current:{temperatureC:21}},{...outage,evidenceHash:''},{...outage,hourly:[{temperatureC:21}]}]){
 await assert.rejects(()=>exercise(502,invalid),/truthful provider-unavailable evidence/);
}
await assert.rejects(()=>exercise(200,{...ready,target:{lat:1,lon:1}}),/coherent weather view/);
await assert.rejects(()=>exercise(200,{...ready,current:{temperatureC:null}}),/coherent weather view/);
await assert.rejects(()=>exercise(404,outage),/unexpected HTTP/);
console.log('R896 PASS: witnessed provider 200 recovery; hashed 502 outage; malformed canonical/forecast/target payloads and unexpected HTTP fail closed.');
