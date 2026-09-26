import fs from 'node:fs';
const app=fs.readFileSync('src/App.tsx','utf8');
const canonical=['./index.css','./workstation.css','./surfaceIntegrityR81.css','./productCoherenceR356.css'];
const retired=['./coherenceRepairR35.css','./specialistDepthR38_3.css','./mobileMatterR42.css','./sovereignDesignR59.css','./instrumentOSR62.css','./productResetR67.css','./capabilityFirstR138.css','./interfacePolishR203.css'];
for(const x of canonical)if(!app.includes(`import '${x}'`))throw new Error(`R356 missing canonical live style authority ${x}`);
for(const x of retired)if(app.includes(`import '${x}'`))throw new Error(`R356 legacy presentation still mounted globally ${x}`);
for(const file of retired.map(x=>'src/'+x.slice(2)))if(!fs.existsSync(file))throw new Error(`R356 lost retained presentation provenance ${file}`);
if(!app.includes("data-r356-product='CANONICAL_PRODUCT_GRAMMAR'"))throw new Error('R356 canonical product marker missing');
console.log('R70/R356 style authority invariant PASS · legacy presentation retained as provenance, one R356 live root authority');
