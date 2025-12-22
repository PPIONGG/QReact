import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// ========================================
// Production/Cloud Config สำหรับ IIS Sub-folder
// ========================================
// Production: http://192.168.0.131:1005 (--mode production)
// Cloud: http://203.150.53.240:2004 (--mode cloud)

const VERSION = '1.0.0' // เปลี่ยน version นี้ทุกครั้งที่ deploy เพื่อ bust cache

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const IIS_URL = env.VITE_IIS_URL || 'http://192.168.0.131:1005'

  return {
    plugins: [
      react(),
      federation({
        name: 'portal',
        remotes: {
          // URLs from env (sub-folder)
          salesVisitor: `${IIS_URL}/sv/assets/remoteEntry.js?v=${VERSION}`,
          purchaseOrder: `${IIS_URL}/po/assets/remoteEntry.js?v=${VERSION}`,
          dashboard: `${IIS_URL}/dashboard/assets/remoteEntry.js?v=${VERSION}`,
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
  }
})
