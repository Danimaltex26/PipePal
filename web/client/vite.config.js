import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    proxy: {
      '/analysis': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/troubleshoot': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/reference': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/history': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/profile': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
});
