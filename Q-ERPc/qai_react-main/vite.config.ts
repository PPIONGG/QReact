import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.VITE_BACKEND_BASE_URL': JSON.stringify(env.VITE_BACKEND_BASE_URL),
        'process.env.VITE_BACKEND_JWT_KEY': JSON.stringify(env.VITE_BACKEND_JWT_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
