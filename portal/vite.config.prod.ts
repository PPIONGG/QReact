import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// ========================================
// Production Config สำหรับ IIS Sub-folder
// ========================================
// Server: http://192.168.0.131:1005
// IIS Path: C:\inetpub\Web PO

const PRODUCTION_URL = 'http://192.168.0.131:1005'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'portal',
      remotes: {
        // Production URLs (sub-folder)
        salesVisitor: `${PRODUCTION_URL}/sv/assets/remoteEntry.js`,
        purchaseOrder: `${PRODUCTION_URL}/po/assets/remoteEntry.js`,
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'antd']
    })
  ],
  base: '/', // root path
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: true, // เปิด minify สำหรับ production
    cssCodeSplit: false,
    outDir: 'dist',
  }
})
