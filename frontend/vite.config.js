import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxyTarget = process.env.VITE_DEV_PROXY_TARGET;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    ...(proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
              configure(proxy) {
                proxy.on('proxyReq', (proxyReq) => {
                  proxyReq.removeHeader('origin');
                });
              },
            },
          },
        }
      : {}),
  },
});
