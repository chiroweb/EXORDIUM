import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        plans: resolve(__dirname, 'plans.html'),
        info: resolve(__dirname, 'info.html'),
        location: resolve(__dirname, 'location.html'),
        pr: resolve(__dirname, 'pr.html'),
        overview: resolve(__dirname, 'overview.html'),
        complex: resolve(__dirname, 'complex.html'),
        limited: resolve(__dirname, 'limited.html'),
        subscription: resolve(__dirname, 'subscription.html'),
        register: resolve(__dirname, 'register.html'),
      },
    },
  },
});
