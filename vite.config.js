import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

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
  // Plugin to serve package.json in dev mode
  plugins: [
    {
      name: 'serve-package-json',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/package.json') {
            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(resolve(__dirname, 'package.json')));
          } else {
            next();
          }
        });
      },
    },
  ],
});
