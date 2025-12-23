import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  base: 'http://localhost:5004/',
  plugins: [
    react(),
    federation({
      name: 'businessDataMonitoring',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'antd']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5004,
    strictPort: true
  },
  preview: {
    port: 5004,
    strictPort: true
  }
})
