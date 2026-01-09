import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Read package.json once at startup for better performance
const packageJson = JSON.parse(fs.readFileSync(resolve(__dirname, 'package.json'), 'utf8'));

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
  // Inject version from package.json as environment variable
  define: {
    'import.meta.env.VITE_VERSION': JSON.stringify(packageJson.version),
  },
});
