import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/upload': 'http://localhost:8080',
      '/ask': 'http://localhost:8080',
      '/files': 'http://localhost:8080',
      '/health': 'http://localhost:8080'
    }
  }
})
