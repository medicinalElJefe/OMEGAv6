import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@appdeploy/client': fileURLToPath(new URL('./src/cloudClientShim.ts', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022'
  }
});
