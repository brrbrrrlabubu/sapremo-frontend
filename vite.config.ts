import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Измени на "./" - это заставит Vite искать файлы в той же папке, где лежит index.html
  base: "./", 
  plugins: [react()],
  build: {
    outDir: 'dist',
  }
})