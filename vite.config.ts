import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

function governedBuildReceipt(){
  return {
    name:'omega-governed-build-receipt',
    apply:'build' as const,
    async writeBundle(){
      const canonicalUrl=String(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
      const payload={
        schema:'OMEGA_GOVERNED_BUILD_RECEIPT_V1',
        state:process.env.GITHUB_ACTIONS==='true'?'PACKAGE_BUILT_BY_GITHUB_ACTIONS':'LOCAL_BUILD_UNVERIFIED',
        generatedAt:new Date().toISOString(),
        source:{repository:'medicinalElJefe/OMEGAv6',sha:String(process.env.GITHUB_SHA||'UNAVAILABLE'),branch:String(process.env.GITHUB_REF_NAME||'UNKNOWN')},
        qa:{required:'npm install + npm run check + Vite production build + Wrangler dry-run',upstreamGate:process.env.GITHUB_ACTIONS==='true'?'WORKFLOW_VERIFY_REQUIRED':'LOCAL_BUILD_UNVERIFIED'},
        package:{builder:'Vite',output:'dist',portable:true,appDeploy:false},
        deployment:{authority:'GitHub Actions + Cloudflare Wrangler',canonicalUrl,publicWorkerMutationAuthority:false},
        workflow:{runId:String(process.env.GITHUB_RUN_ID||'LOCAL'),runNumber:String(process.env.GITHUB_RUN_NUMBER||'LOCAL'),name:String(process.env.GITHUB_WORKFLOW||'local build')},
        truthBoundary:'This package receipt records the exact source and package environment. It does not by itself prove later deployment or live verification and does not grant the public Worker repository mutation authority.'
      };
      const receipt={...payload,receiptSha256:createHash('sha256').update(JSON.stringify(payload)).digest('hex')};
      await writeFile('dist/omega-build-receipt.json',JSON.stringify(receipt,null,2)+'\n','utf8');
    }
  };
}

export default defineConfig({
  plugins: [react(),governedBuildReceipt()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022'
  }
});
