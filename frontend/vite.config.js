import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/', // <-- Add this line
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    fs: {
      // allow Vite to access files outside the frontend folder (like node_modules)
      allow: [
        path.resolve(__dirname), // your frontend folder
        path.resolve(__dirname, '../node_modules') // node_modules outside
      ],
    },
  },
})
