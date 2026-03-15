import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
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
          // 'ui-icons': ['lucide-react'] // Removido para permitir Tree Shaking automático
        }
      }
    }
  }
});