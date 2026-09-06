import fs from 'node:fs';
import {capacityManifestR131,planCapacityR131} from '../src/system/capacityGovernorR131.js';
const args=process.argv.slice(2),get=(k,d=null)=>{const i=args.indexOf(k);return i>=0&&i+1<args.length?args[i+1]:d},has=k=>args.includes(k);
if(has('--manifest')){console.log(JSON.stringify(capacityManifestR131(),null,2));process.exit(0)}
const file=get('--input');let input={};
if(file){if(!fs.existsSync(file)){console.error(`INPUT_NOT_FOUND ${file}`);process.exit(2)}input=JSON.parse(fs.readFileSync(file,'utf8'));}
else input={requestedCells:Number(get('--cells',24)),providerBudget:Number(get('--provider-budget',4)),health:Number(get('--health',1)),failureRate:Number(get('--failure-rate',0)),burden:Number(get('--burden',0)),latencyClass:get('--latency','NORMAL'),allowFullBody:has('--allow-full-body')};
console.log(JSON.stringify(planCapacityR131(input),null,2));
