import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  base: '/',
  publicDir: false, // Disable Vite's public directory behavior since we're using public as root
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
      },
    },
    // Copy static assets that need to be served from the root
    copyPublicDir: false,
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
  },
  css: {
    devSourcemap: true,
  },
});
