import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'purchaseOrder',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './version': './src/version.ts',
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
    port: 5002,
    strictPort: true
  },
  preview: {
    port: 5002,
    strictPort: true
  }
})
