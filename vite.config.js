import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Read package.json once at startup for better performance
const packageJson = JSON.parse(fs.readFileSync(resolve(import.meta.dirname || __dirname, 'package.json'), 'utf8'));

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
            // Only serve version field to avoid exposing sensitive information
            res.end(JSON.stringify({ version: packageJson.version }));
          } else {
            next();
          }
        });
      },
    },
  ],
});
