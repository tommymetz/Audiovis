import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// Read package.json once at startup for better performance
const packageJson = JSON.parse(fs.readFileSync(resolve(__dirname, 'package.json'), 'utf8'));

export default defineConfig({
  root: 'public',
  base: '/',
  publicDir: false, // Disable Vite's public directory behavior since we're using public as root
  plugins: [
    // Image optimization plugin
    ViteImageOptimizer({
      // PNG optimization
      png: {
        quality: 85,
      },
      // JPEG optimization
      jpeg: {
        quality: 85,
      },
      // JPG optimization (alias for jpeg)
      jpg: {
        quality: 85,
      },
      // GIF optimization (won't compress animated GIFs aggressively)
      gif: {
        optimizationLevel: 3,
      },
    }),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    // Enable minification with tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        pure_funcs: ['console.debug'], // Remove console.debug calls
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
      },
      output: {
        // Manual chunks for better code splitting
        manualChunks(id) {
          // Split Three.js into its own chunk
          if (id.includes('node_modules/three')) {
            return 'three-core';
          }
          // Split dat.gui and stats.js
          if (id.includes('node_modules/dat.gui') || id.includes('node_modules/stats.js')) {
            return 'vendor-ui';
          }
          // Split sortablejs
          if (id.includes('node_modules/sortablejs')) {
            return 'vendor-utils';
          }
        },
      },
    },
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
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
