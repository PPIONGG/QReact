import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// ========================================
// Production Config สำหรับ IIS Sub-folder
// ========================================
// Server: http://192.168.0.131:1005/dashboard/
// IIS Path: C:\inetpub\Web PO\dashboard

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './version': './src/version.ts',
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'antd']
    })
  ],
  base: '/dashboard/', // sub-folder path สำคัญมาก!
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: true, // เปิด minify สำหรับ production
    cssCodeSplit: false,
    outDir: 'dist',
  }
})
