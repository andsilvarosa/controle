import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      // Resolve o plugin local direto do source TS, sem precisar compilar separadamente
      'bank-notification-listener': new URL('plugins/bank-notification-listener/src/index.ts', import.meta.url).pathname,
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'framer-motion', 'zustand'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['xlsx']
        }
      }
    }
  }
});