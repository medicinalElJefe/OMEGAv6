import fs from 'node:fs';
const sai=fs.readFileSync('src/saiB059Runtime.ts','utf8');
const contract=fs.readFileSync('AUTO_UPDATE_CONTRACT.md','utf8');
if(!sai.includes("execution:'PLAN_ONLY_UNTIL_CORPUS_DB_OR_PROVIDER_BINDING'"))throw new Error('SAI hosted execution boundary changed without evidence');
if(!sai.includes('not a demonstrated superintelligence'))throw new Error('SAI truth boundary missing');
if(!contract.includes('Every automated development cycle must:'))throw new Error('auto-update contract missing');
if(!contract.includes('Do not use AppDeploy'))throw new Error('portability law missing');
console.log('R58 governed self-builder contract PASS');
