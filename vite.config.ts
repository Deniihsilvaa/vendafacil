import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/types': resolve(__dirname, './src/types'),
      '@/contexts': resolve(__dirname, './src/contexts'),
      '@/services': resolve(__dirname, './src/services'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/styles': resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000, // ✅ Mude para 3000 (frontend)
    host: true,
    fs: {
      strict: false,
    },
    hmr: {
      // ✅ CORREÇÃO: O HMR deve usar a MESMA porta do servidor Vite
      clientPort: 3000, // mesma porta do servidor Vite
    },
    watch: {
      usePolling: true
    },
    // ✅ Proxy para API calls - evita problemas de CORS
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // seu backend Next.js
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})