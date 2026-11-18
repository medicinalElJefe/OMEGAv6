import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { dirname, basename, resolve as pathResolve } from 'node:path';

// R882: Windows is case-insensitive, but canonical source distinguishes case.
// Resolve local extensionless module imports by their *exact declared casing*
// before Vite's default .ts/.tsx extension probe. This prevents the Windows
// build from selecting the lowercase engine module for the uppercase UI.
function caseExactLocalImportsR882() {
  const extensions=['.ts','.tsx','.js','.jsx','.mjs'];
  return {
    name:'r882-case-exact-local-imports',
    enforce:'pre' as const,
    resolveId(source:string, importer:string|undefined) {
      if(!importer||!source.startsWith('.'))return null;
      const request=source.split('?')[0];
      if(/\.[a-z\d]+$/i.test(request))return null;
      const path=pathResolve(dirname(importer.split('?')[0]),request);
      const directory=dirname(path),name=basename(path);
      let entries:string[];
      try{entries=readdirSync(directory)}catch{return null}
      const exact=extensions.map(x=>name+x).find(x=>entries.includes(x));
      if(exact)return pathResolve(directory,exact);
      const ambiguous=entries.filter(x=>extensions.some(ext=>x.toLowerCase()===(name+ext).toLowerCase()));
      if(ambiguous.length)throw new Error('R882 case-exact import mismatch: '+source+' from '+importer+'; actual files: '+ambiguous.join(', '));
      return null;
    }
  };
}


function governedBuildReceipt(){
  return {
    name:'omega-governed-build-receipt',
    apply:'build' as const,
    async writeBundle(){
      const canonicalUrl=String(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
      const candidateSha=String(process.env.OMEGA_CANDIDATE_SHA||'').trim()||null;
      const promotedMergeSha=String(process.env.OMEGA_PROMOTED_SHA||'').trim()||null;
      const rollbackSha=String(process.env.OMEGA_ROLLBACK_SHA||'').trim()||null;
      const declaredLineageMode=String(process.env.OMEGA_RELEASE_LINEAGE_MODE||'').trim();
      const lineageMode=['EXACT_TWO_PARENT_MERGE','EXACT_SQUASH_PR_AND_TREE'].includes(declaredLineageMode)?declaredLineageMode:null;
      const payload={
        schema:'OMEGA_GOVERNED_BUILD_RECEIPT_V1',
        state:process.env.GITHUB_ACTIONS==='true'?'PACKAGE_BUILT_BY_GITHUB_ACTIONS':'LOCAL_BUILD_UNVERIFIED',
        generatedAt:new Date().toISOString(),
        source:{repository:'medicinalElJefe/OMEGAv6',sha:String(process.env.OMEGA_DESKTOP_SOURCE_SHA||process.env.GITHUB_SHA||'UNAVAILABLE'),branch:String(process.env.GITHUB_REF_NAME||'UNKNOWN'),role:'PACKAGED_SOURCE_SHA'},
        promotion:{candidateSha,promotedMergeSha,rollbackSha,authority:candidateSha&&promotedMergeSha&&rollbackSha?'GITHUB_MERGE_PARENTS':'EXTERNAL_RELEASE_LEDGER_REQUIRED',lineageMode},
        qa:{required:'npm install + npm run check + Vite production build + Wrangler dry-run',upstreamGate:process.env.GITHUB_ACTIONS==='true'?'WORKFLOW_VERIFY_REQUIRED':'LOCAL_BUILD_UNVERIFIED'},
        package:{builder:'Vite',output:'dist',portable:true,appDeploy:false,partition:'R109_ROUTE_DEFERRED_SPECIALISTS'},
        deployment:{authority:'GitHub Actions + Cloudflare Wrangler',canonicalUrl,publicWorkerMutationAuthority:false},
        workflow:{runId:String(process.env.GITHUB_RUN_ID||'LOCAL'),runNumber:String(process.env.GITHUB_RUN_NUMBER||'LOCAL'),name:String(process.env.GITHUB_WORKFLOW||'local build')},
        truthBoundary:'R109 uses dynamic imports to defer heavy specialist UI modules until route demand or bounded prefetch. Prefetch means module bytes are prepared; it is not capability execution, external-backend activity, native/cloud ONLINE proof, CanonState mutation or evidence admission. OMEGA_SURFACES + normalizePanel + go remain the single workstation routing authority.'
      };
      const receipt={...payload,receiptSha256:createHash('sha256').update(JSON.stringify(payload)).digest('hex')};
      await writeFile('dist/omega-build-receipt.json',JSON.stringify(receipt,null,2)+'\n','utf8');
    }
  };
}

const R1991_ENTRY_BUDGET_BYTES=500*1024;
function initialEntryBudgetR1991(){
  return {
    name:'omega-r1991-initial-entry-budget',
    apply:'build' as const,
    generateBundle(_options:any,bundle:Record<string,any>){
      const entries=Object.values(bundle).filter((item:any)=>item?.type==='chunk'&&item?.isEntry);
      if(entries.length!==1)throw new Error(`R199.1 expected one application entry chunk, found ${entries.length}`);
      const entry:any=entries[0];
      const bytes=Buffer.byteLength(String(entry.code||''),'utf8');
      if(bytes>R1991_ENTRY_BUDGET_BYTES)throw new Error(`R199.1 initial entry budget exceeded: ${entry.fileName} ${bytes} > ${R1991_ENTRY_BUDGET_BYTES} bytes. Defer specialist/home dependencies instead of raising the budget.`);
      console.log(`R199.1 INITIAL ENTRY BUDGET PASS · ${entry.fileName} · ${bytes}/${R1991_ENTRY_BUDGET_BYTES} bytes`);
    }
  };
}

function vendorChunkR109(id:string){
  const p=id.replace(/\\/g,'/');
  if(p.includes('/node_modules/react/')||p.includes('/node_modules/react-dom/')||p.includes('/node_modules/scheduler/'))return'vendor-react';
  if(p.includes('/node_modules/lucide-react/'))return'vendor-icons';
  if(p.includes('/node_modules/'))return'vendor-runtime';
  return undefined;
}

export default defineConfig({
  plugins: [caseExactLocalImportsR882(),react(),governedBuildReceipt(),initialEntryBudgetR1991()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
    rollupOptions:{output:{manualChunks:vendorChunkR109}}
  }
});
