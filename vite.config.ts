import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/web/session/authenticate': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/web/dataset/call_kw': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})